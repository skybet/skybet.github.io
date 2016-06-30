---
layout:     post
title:      Why is device detection hard?
date:       2016-06-16 10:42:00
summary:    A look at why device detection is the thorn in our side thats not going anywhere.
author:     jon_bulbrook
image:      iphones.jpg
category:   Software Engineering
tags:       engineering, device detection, mobile, responsiveness
---

![Mobile Devices](/images/iphones.jpg)

## Introduction

Long gone are the days of sitting down at a desktop computer, pressing connect on the dial-up prompt and listening to those dings and hisses as the computer negotiates its Internet connection. As a society, we are now very rarely disconnected from the Internet; from phones in our pockets, to smart TVs and various other Internet of Things devices. But all of these devices are very different, and we demand consistency and usability no matter which device we use. We don't want to see a website causing our phone to grind to a halt because of all of its animations. Likewise, we don't want to see a horribly scaled up mobile layout when browsing on a laptop, with buttons bigger than your hand. All this demand for a great experience regardless of what device we happen to be using poses some big challenges - the biggest of which is device detection.

## Why do we need device detection?

The millions of different devices out there, all with different processors, operating systems, browsers, screen sizes, etc, make it a nightmare for displaying appropriate content to users. When it comes to displaying content on these devices, there is no one size fits all. The content you display needs to be fluid, adapting to the type of device it is on. Making wide horizontal menus into "burger" menus, or selecting crystal clear high resolution retina images as opposed to standard resolution ones, are a couple of examples of fluid content you'll recognise from browsing the web. Adding, changing and hiding content is only possible thanks to device detection. But its role can be much more than simple visual changes; it can be used to choose differing technologies depending on the device you are using.

### Sky Vegas

The games on Sky Vegas are a great example of this. Some of our games are based on the ageing Adobe Flash platform, while others use the more modern standard, HTML5. Most portable devices (such as Apple iOS devices) have never supported Flash, or in the case of Google's Android that has [dropped its support](http://www.gsmarena.com/adobe_flash_player_to_drop_out_of_the_google_play_store_today-news-4648.php). It is also slowly being phased out from desktop browsers, with [Mozilla Firefox disabling](https://addons.mozilla.org/en-GB/firefox/blocked/p946) it by default in July 2015 due to security concerns, and most recently (May 2016) [Google have announced](http://fortune.com/2016/05/16/google-chrome-adobe-flash/) they are beginning to phase out Flash, opting to launch HTML5 video by default in Google Chrome.

![Flash disabled](/images/device-detection/flash.png)

Attempting to launch a Flash game on a mobile device will generally result in a blank window, which is not a great experience. Device detection allows us to provide a better experience, by hiding incompatible games to ensure all games you are presented with can be played.

Sometimes a more detailed view of a device is needed. For example, some of our newer games on Sky Vegas are too processor intensive to run on older devices - spins stutter, the game is completely unplayable, or in extreme cases cause the device to freeze. New software versions can also play havoc with our games, where changes in the way they are rendered in the browser mean it could be unplayable until fixed.

Our internal games testing team spends a great deal of time identifying which games are unable to be played on which devices. This report forms the basis for our blacklist rules, which describe the operating system, device name, and browser a certain game isn't compatible with. Utilising detailed device detection we can ensure users get the best experience possible on whatever device they use.

## Device detection techniques

### User agent analysis

The most traditional form of device detection is to look at the user agent of the device. Typically every request made from a browser sends a `User-Agent` header identifying the device, browser version, operating system version, and much more. For example, the User-Agent for the European edition of Samsung's Galaxy S5 looks like:

```
Mozilla/5.0 (Linux; Android 5.0; SAMSUNG SM-G900F Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/4.0 Chrome/44.0.2403.133 Mobile Safari/537.36
```

User-agent detection simply searches the string for a match against the detection rules - for example looking for "Android 5.0" because a specific game isn't compatible with Android 5.0 Lollipop. This search is extremely quick, and as this is sent with the request to the server, can be performed before any content has been provided to the user.

However, the biggest issue with User-Agent headers is the lack of standardisation and ease of manipulation, which makes them extremely unreliable. This issue is extensively documented across the Internet, with most web developers having come across some problem at least once. For example, since iOS 8, iPhones are no longer reported as iPhone 4S, iPhone 5, etc - they are simply reported as iPhone. A User-Agent for an iPhone looks like:

```
Mozilla/6.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/8.0 Mobile/10A5376e Safari/8536.25
```

Most Android devices are the exact opposite, with the Galaxy S5 being reported as "SM-G900F" for European models, "SM-G900I" for Asian models, and "SM-G900A" for the AT&T model in America. Being a simple header that is sent with a request, it also becomes easy to provide a fake value; most "Request Desktop Site" toggles in mobile browsers take advantage of this by changing the User-Agent to report as a laptop, making any User-Agent analysis redundant.

### Feature detection

Feature detection is a more reliable approach, which doesn't attempt to identify a specific device. This works by using JavaScript to query the browser directly to find out its capabilities. This can include information such as screen size, audio support, Flash support or support of new HTML5 features (such as canvas). The result, desktop devices being identified as Flash compatible, older browsers identified as unable to execute certain aspects of HTML5, and mobile devices identified as not Flash compatible.

In the case of games on Sky Vegas, being able to ensure that a game can be played solely from what the browser is reporting is extremely beneficial. Currently we take the collection of detected features, and make an assumption of the device being used. Developing this further would enable us to automate the process, such that we would be able to say if the device doesn't support a specific feature, or meet a specific criteria (e.g. screen size), then the game is incompatible.

It's not perfect. As the detection is performed on the device itself, the JavaScript needs to be sent to it. On simpler websites this isn't a massive problem, but when you are choosing which content to display based on the detection, this produces bigger issues. There are two logical choices of how to achieve this: a 2 part process where the detection is performed, and then a second request to retrieve the site; or return the site in a default state with extra hidden content, which would be shown if required by the outcome of the detection.

![Feature Detection Client Side Options](/images/device-detection/feature_detection.png)

The former makes sure that the content returned to the device is fully optimised for the device you are using, but creates a delay per request to work out the device, then retrieve the content. If this fails the user will be left with a completely blank page, which is not a good user experience. The biggest downside of the latter option is that a potentially large portion of content will be returned to the user's device that is never needed. This wasted effort is amplified in the land of mobile devices, where data usage limits and varying network speeds impact the transfer of data.

## The hybrid approach

Because both User-Agent analysis and feature detection are unreliable on their own, most solutions look at using a hybrid approach, tailored towards their individual needs - this tends to use a combination of User-Agent analysis, feature detection, and modern browser technologies. We can use these technologies to decide whether to provide a retina (e.g. iPhone 4 or better) resolution image, or to save bandwidth by returning a standard resolution image by using the new HTML5 [srcset](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Example_3_Using_the_srcset_attribute) attribute.

```
<img class="tile__inner-mouseout" src="king-kong-cash.jpg" srcset="king-kong-cash.jpg 1x, king-kong-cash-retina.jpg 2x" alt="King Kong Cash">
```

This is a new attribute for the standard HTML `<img>` tag, allowing the browser to decide which image to load depending on the pixel density of the device. When it comes to iOS devices (with their limited User-Agents) a hybrid approach is the only solution that has a chance of successfully detecting these devices, but is not 100% perfect.

To illustrate how a hybrid approach works, let's take the following scenario. User Agent analysis can reveal a device is an iPhone running iOS from the `iPhone OS 8_0 like Mac OS X` part. Feature detection on the device is then able to determine the screen resolution by looking at the browser reported `window.screen`. In the case of an iPhone 5 this would be 568 pixels for the largest dimension. Even with this level of detection, we still cannot identify if it is an iPhone 5C, iPhone 5 or iPhone 5S.

![iPads](/images/device-detection/ipads.jpg)

Another case that is extremely well documented and troublesome is the case of the iPad Mini and iPad 2. Both these devices have the same resolution and processor. The main difference is the form factor, with the iPad Mini being a 7" tablet, and the iPad 2 being 10". Despite being so similar, we have seen cases where a game works fine on one device, but causes the other to completely freeze.

Another consideration for device detection (especially in the case of a hybrid approach which may be quite an intensive process) is whether performing detection every time a page is loaded is actually necessary. At the end of the day, the device isn't going to change between requests. The solution that has been quite widely adopted is to use a cookie to store the device detection information.

However, this is where things can get a bit sticky, especially regarding big software updates like operating system upgrades. Generally you backup all the information from your device before the update, which can include cookies. Next time you visit the site (after the upgrade), your device reports that it is running the old iOS version instead of what you are actually running, which could result in a negative experience.

## The 3rd party approach

The process of taking a device and producing a successful detection solution is a time consuming process. You have to use each device individually to establish a set of unique criteria that match it, and no others. New devices are frequently being introduced which, when combined with new software releases, means this process needs to be undertaken often - this means additional overhead for maintaining a device detection library. To this end, a number of third-party solutions are available to assist in the device detection process, especially to minimise the overhead of maintaining your own library. As a dedicated service, updates are prioritised to ensure that all customers are provided with the best solution as quickly as possible. However, in the unpredictable world of technology, these solutions are still not perfect for this quest.

### WURFL

One solution that we trialled was [WURFL](http://www.scientiamobile.com/page/wbe) by ScientiaMobile. WURFL offers two solutions: the fully integrated on-site solution to be hosted by the customer in their data centre, or the online solution where detection requests are sent to WURFL and analysed. The first big advantage we spotted when trialling WURFL was the ability to successfully detect the smaller market share android devices, such as the OnePlus and Ulefone devices. From a user experience perspective this would mean that we could hide incompatible games on a very specific set of devices. After running WURFL on the legacy mobile Sky Vegas site for 7 days, we found these results:

![WURFL detection](/images/device-detection/wurfl.png)

One of the biggest issues (as seen above) we experienced using WURFL was the lack of iPad detection. As previously explained, Apple has made this considerably difficult in recent years, and as such we noticed that for nearly all iPads, they were classified as Apple iPad. A similar story was seen with iPhones where many were being simply classed as Apple iPhone, not specific models like the iPhone 5, iPhone 6, etc. As a very large proportion of our users have iOS devices when using sites like Sky Vegas, this meant we were unable to have the fine grained control needed from the WURFL library.

## The Sky Vegas approach

On Sky Vegas we utilise a hybrid approach to device detection, to allow us to detect the largest number of devices. When you visit the site from a mobile device, we filter the list of games using the User-Agent to remove any Flash games, or select the HTML5 equivalents. Next we attempt to detect the device looking at the User-Agent, screen pixel density and screen dimensions to produce a friendly device name, e.g. Apple iPhone 6 Plus. The friendly name is then matched against the blacklist rules for a game, and hidden if incompatible. As new incompatibilities are spotted, they can be added to the blacklist rules for existing devices.

The approach works well for a large percentage of the time. But when we have a brand new device, the process becomes more long-winded. We have to develop a process to uniquely identify the device, which may be as simple as a specific screen dimension, or in the case of the iPad 2 and iPad Mini situation, can lead us down a massive rabbit hole. Before we have our unique detection method, we use a generic label using any information in the User Agent. This results in a generic label such as 'Generic Android Phone'.

## Conclusion

Device detection is hard, and it's not about to get any easier. Apple stands firm in reducing the amount of information presented to servers about the device you are using, and with good reason. They state that you should provide a single consistent user experience for all users, regardless of the phone they are using. When simply providing website content to users, this is a realistically achievable goal - but when creating new processor-intensive content for users that may rely on the latest features of modern browsers, this is incredibly challenging.

If the method of declaring what device you are using was standardised (something the industry is screaming for), this would allow for a much better experience when browsing the web. Arguments against simplifying device detection include security and privacy concerns over this extra data being broadcast to the world, where attackers can use known exploits in the software version you are using.

If there is one thing to remember, it's that device detection is hard, it isn't going to get any easier, and it's going to be a thorn in our side for the foreseeable future.
