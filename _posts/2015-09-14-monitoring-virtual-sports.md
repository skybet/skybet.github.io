---
layout:     post
title:      Monitoring Virtual Sports
permalink:  monitoring-virtual-sports
date:       2015-09-14 11:50:37
summary:    Virtual Sports is one of our most popular products, here's one of the ways we improved our monitoring of it.
---

Virtual Sports is one of our most popular products. Our tireless, HRNG-powered, CGI horses can be seen
careering around a racetrack 24 hours a day, 7 days a week via RTMP or HLS.

A lot can go wrong with a live-stream that never ends: it can get out of sync, it can die completely,
and it can even display the wrong thing entirely if a failover, erm, fails (don't ask). Suffice to say, it's
something that needs to be monitored so we know when it needs fixing.

How does one monitor a video stream? There are some quick wins: you can check that your endpoints exist;
for HLS you can check that your M3U8 files are changing using simple HTTP checks; but none of that
can tell you that the stream is blank, or displaying an event from half an hour ago.

![Virtual Horses](/images/virtual-horses.png)

All of our Virtual Sports streams have something in common: they display the time of the current event,
last event, or next event at various positions on the screen. If we could read those times programmatically
then we could raise alarms when they look wrong, or don't show up at all. Doing OCR on a video stream
seems like a difficult problem, but by breaking it down and leveraging some well-established tools
it's perfectly doable.

### A Plan

Various OCR tools can read text out of *images* without too much difficulty - [Tesseract](https://en.wikipedia.org/wiki/Tesseract_(software)) is one such tool - 
but we don't have images, we have video. Enter [FFmpeg](https://www.ffmpeg.org/).
FFmpeg is a veritable Swiss Army Knife for dealing with video; it can consume, record and convert just about anything - including turning a video into discrete images.

So here's a plan of attack:

1. Consume the video stream with FFmpeg and convert it to a series of images.
2. Crop the images to regions where we know there will be a time.
3. Run those images into Tesseract OCR to get the time from them as text.
4. Expose the text we found in some way; maybe an HTTP API.

Checking the FFmpeg docs reveals that step 1 is pretty easy!

    ▶ ffmpeg -i rtmp://streamurl -r 1 frames/%04d-frame.png  

That will consume the stream at `rtmp://streamurl` and output it as one PNG per second.

Step 3 is pretty easy too. On a manually cropped, cleaned and resized frame from the stream, Tesseract does just fine:

![Cropped and cleaned time](/images/virtual-horses-1506.png)

    ▶ tesseract horses-1506-region2.png stdout
    15:06

That still leaves steps 2 and 4; but we've got a proof of concept for the difficult bits already.
Most general purpose programming languages should be able to handle the remaining steps
without too much difficulty.

### Go-Go-Gadget Go!

Go is a general purpose programming language; and it's great for this sort of work.

First we need to make a temporary directory to store our images:

```go
dir, err := ioutil.TempDir("", "vsframes")
if err != nil {
    log.Fatal("Failed to create temp directory")
}
```

We need to fill that directory with images, so we'll run FFmpeg in a Goroutine to do just that:

```go
go func() {
    exec.Command("ffmpeg", "-i", "rtmp://streamurl", "-r", "1", dir+"/frame-%04d.png").Run()
}() 
```

We need somewhere to store our current state. It's not going to get passed around, so an anonymous struct will do just fine:

```go
state := struct {
    Time string
    sync.Mutex
}{Time: ""}
```

Note that the state struct [embeds](https://golang.org/doc/effective_go.html#embedding) `sync.Mutex`.
That makes the `Lock` and `Unlock` methods available on our struct so that we can safely update
it in one place and read it in another.

We'll expose it over HTTP as a blob of JSON:

```go
http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    state.Lock()
    j, _ := json.Marshal(state)
    state.Unlock()
    w.Write(j)
})
go http.ListenAndServe("0.0.0.0:1234", nil)
```

Now to our main loop. We know we want to get all of the frames from the temp dir, do
*something* with them, remove them, and then wait for a bit before repeating the process:

```go
for {
    frames, _ := filepath.Glob(dir + "/*.png")
    for _, frame := range frames {
        // 'Something'

        // ...

        os.Remove(frame)
    }
    time.Sleep(time.Millisecond * 100)
}
```

That *something* we want to do is pull out the regions of interest and do OCR on them.
Then for each bit of OCR output that is a valid time, we want to update the state:

```go
// 'Something'
regions := getRegions(frame)
for _, region := range regions {
    candidate := ocr(region)

    if validTime(candidate) {
        state.Lock()
        state.Time = candidate
        state.Unlock()
    }
    os.Remove(region)
}
```

We've used a few user-defined functions there. `getRegions` uses the `github.com/disintegration/imaging`
package to crop and clean some predefined regions of interest and write them to disk as PNGs.
It returns a slice containing the filenames of the PNGs it created:

```go
func getRegions(path string) []string {
    // The coordinates for our regions of interest
    regions := []image.Rectangle{
        image.Rect(83, 66, 132, 78),
        image.Rect(96, 162, 148, 174),
        image.Rect(160, 21, 213, 33),
        image.Rect(100, 93, 147, 108),
    }

    out := make([]string, 0)

    // Open and decode the image
    r, _ := os.Open(path)
    defer r.Close()
    img, _, err := image.Decode(r)
    if err != nil {
        return out
    }

    for i, region := range regions {
        // Crop and clean the image
        cropped := imaging.Crop(img, region)
        cleaned := cleanImage(cropped)

        // Write the cropped and cleaned image to disk
        regionPath := fmt.Sprintf("%s-region-%d.png", path, i)
        w, _ := os.Create(regionPath)
        png.Encode(w, cleaned)
        w.Close()

        out = append(out, regionPath)
    }

    return out
}
```

The `cleanImage` function that `getRegions` calls makes the image easier for Tesseract
to read by increasing its size, converting it to grayscale, and a few other things:

```go
func cleanImage(img image.Image) image.Image {
    w := img.Bounds().Size().X
    h := img.Bounds().Size().Y

    p := imaging.Grayscale(img)
    p = imaging.Resize(p, w*3, h*3, imaging.BSpline)
    p = imaging.Invert(p)
    p = imaging.AdjustContrast(p, 40)
    p = imaging.Sharpen(p, 5)

    return p
}
```

The `ocr` function just runs Tesseract against a given image, and returns any text it
finds with non-number characters stripped off from either side:

```go
func ocr(path string) string {
    raw, _ := exec.Command("tesseract", path, "stdout").Output()
    return strings.TrimFunc(string(raw), func(r rune) bool {
        return !unicode.IsNumber(r)
    })
}
```

Lastly, the `validTime` function just does a quick and dirty regex check against a string
to see if it looks like a valid 24-hour time:

```go
func validTime(c string) bool {
    v := regexp.MustCompile(`^[0-2][0-9]:[0-5][0-9]$`)
    return v.MatchString(c)
}
```

That should be everything! Building a Go package is as simple as:

    ▶ go build

Running the resulting binary and issuing a quick check with curl confirms that everything
is working as intended!

    ▶ curl http://localhost:1234/
    {"Time":"13:06"}

From here we could easily write a simple Nagios check (or similar) to set off an alarm when that time
doesn't look right.

### Wrapping Up

In the name of getting things working quickly we've ignored a bunch of failure
scenarios and generally haven't paid much attention to error handling, but that's
nothing out of the ordinary for code destined for a blog post. It could do with
some logging and proper signal handling too, but those things are - as is tradition -
left as an exercise for the reader.

The original problem of "do OCR on a video stream" seemed like a difficult one, but
we've not had to do anything particularly difficult to solve it.
