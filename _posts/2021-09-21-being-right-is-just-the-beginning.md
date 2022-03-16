---
title: "Being Right Is Just the Beginning"
date: 2021-09-21
image: "being-right.jpeg"
category: Security
tags: infosec, conference
author: leigh_hall
summary: "As an industry we’re obsessed with being smart. And that’s ok - good even, in the right context. But to get what we want we need to stop being the smartest person in the room and start being the most helpful in the room"
---

On the 8th September I was very grateful to have the opportunity to speak at my local security/hacker conference [DC151](https://twitter.com/_dc151) in Leeds.

In the talk I lamented my lack of drive in pursuing purely technical content any more (there's plenty of that in my [old blog](https://medium.com/@leighhall)) instead reflecting my current career arc and giving a talk on "boring management stuff", as I prefaced.

Of course, I don't think it's boring or particularly constrained to management stuff, but that was the first layer of my subterfuge and was reflected back in the organiser's comment that DC151 hadn't seen a talk like this before.

Nice.

So anyway, this is a brief outline of my talk. Well, of my point, really, which is actually pretty simple, all told.

The most succint summary of what I was saying has since come from the co-organiser of DC151, Glenn:

<blockquote class="twitter-tweet" data-conversation="none"><p lang="en" dir="ltr">We need to stop being the smartest in the room and start being the most helpful in the room.</p>&mdash; Glenn Pegden - ☎️📟💾 Ⓗằ⒞𝓴𝗘ṝ (@GlennPegden) <a href="https://twitter.com/GlennPegden/status/1437063162432524290?ref_src=twsrc%5Etfw">September 12, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

And that really is the main point that I wanted to get across.

As an industry we're obsessed with being smart. And that's ok - good even, in the right context. We love our rockstars as much as the next group. But there's a whole subsection of our industry that has adopted a slightly worse interpretation of that wherein it's not enough to be _smart_, we have to be the Smartest Person In The Room.

But if you think back to all of the Smartest People In The Room that you've ever had to work with, unless they've made this realisation, I expect you'll also, as I do, remember them as smart _and angry_.

Because they've done the research. They've put the work in. They're smart and they're right. But they're not getting their own way.

What's left to do?

Frustratingly, from that point of view, that's only the beginning.

Everything that you want to achieve hinges on your ability to convince other human beings of your point of view. To trade positions with them so that you each compromise what's happening in the right context so that you can get what you need and they can get what they need.

It's really obvious when written down or said out loud. But remains elusive to some InfoSec professionals to this day, in my experience.

What is all too easy to forget is that we're the tail, not the dog. Most businesses don't exist to do Perfect Security, if there were such a thing. Given infinite resources and infinite time I'm sure we could endlessly iterate on what we're designing and saying such that it improves, but in the meantime back in the real world we've got a requirement to make money. And InfoSec doesn't make money.

And herein lies the rub. How to get your own way in InfoSec relies on a simple economic truth: is it cheaper to do what I say, or is it more expensive?

And if you fall on the wrong side of that then you're almost never going to get your own way.

So how exactly do you make a non-revenue generating business area like InfoSec not cost money get its own way?

This is where I revealed my final subterfuge for the DC151 crowd - not only was this a boring management talk, this was _also_ a boring Security Architecture talk!

At Sky Betting & Gaming we've weaponised compliance and used it in what I like to refer to as "selective relieving of friction" - we introduced a very stripped down version of a very old idea - patterns - and made them work for our audience.

The top part of the document tells an engineer what tech and processes can be used to solve a known problem with a given context. Let's say "Authentication", as an example. It explains (pictorally and in text) what the solution needs to basically look like, what technology and processes are acceptable in its implementation, and what trade-offs need to be considered.

All good. Pretty standard.

But the coup de grâce is the second page. That's where we pre-assess (and therefore effectively pre-approve) our pattern against the relevant compliance standards that are in place across our business.

And since compliance is a local issue, it boils down to this:

"Do it our way, and it's free. Do it your own way and demonstrating compliance is your problem"

We've tipped the balance of the scales in terms of cost. It's a _known_ cost to implement this pattern since it's just tech and processes. But if you build it yourself then not only do you have to come up with a solution you also need to go to the trouble of checking it's compliant.

All of a sudden, solving problems in the way we've selected becomes _economically viable_ compared to the other options.

So we achieve the double whammy - we're smart, and right, but we're also helpful and cheaper.

Win/win.

