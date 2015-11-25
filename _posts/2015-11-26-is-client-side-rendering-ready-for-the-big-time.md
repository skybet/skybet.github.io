---
layout:     post
title:      Is Client-Side Rendering Ready For The Big Time?
date:       2015-11-22 20:00
summary:    As we look to define best-practice for our next generation Sportsbook, one area of focus is the rise of support for SPAs in Search Engines. Is the support there to remove server rendering forever?
category:   UI Engineering
tags:       javascript, react, redux, seo
author:     ian_thomas
---

Depending on how long you have been using the web, you may remember a time when all functionality was handled by servers. You loaded a page, decided what you were going to do next, clicked (this was several years before smart phones so no tapping... yet) and waited while the server processed your choice. After the server had built the next representation of the state of your session and sent it back down the wire to be rendered by Internet Explorer (your flavour may vary, but I first used [IE 3][web timeline]) you then repeated the whole process until you got bored (or your housemate tried to use the dial-up too and dropped your connection).

Circa the year 1999 Microsoft introduced an Active X component in IE 5 which lay the foundations for what we typically refer to as [AJAX][ajax]. After a few years incubatian, greater adoption by browser vendors and some high-profile launches from Google (gmail and maps were among the first to deliver cross-browser experiences using XMLHttpRequest support) rich interactive experiences were appearing everywhere and Web 2.0 was born. However, there was a problem - search engines didn't execute JavaScript so any content that appeared on a page as a result of `XMLHttpRequest` usage was invisible to their bots.

In 2009 Google recognised the rising trend for web applications being built almost entirely without server-side HTML rendering by annoucing their [AJAX Crawling Scheme][ajax crawling scheme]. In a nutshell, this scheme provided a way for developers to tell Google where to find a HTML snapshot which mirrored the state seen by a user at a certain url.

## The end of Google's AJAX Crawling Scheme

About a month ago (October 2015) Google announced the [end of support for the AJAX Crawling Scheme][deprecation]. Their crawling bot has become sophisticated enough to render a page and execute any linked/inline JavaScript so there is no longer a need to provide a html snapshot at some pre-arranged meeting place.

That's the theory at least, but we had an inkling that while JavaScript would be executed, the bots would still only see content contained either in the HTML itself or the parsed JavaScript. Or, to be more clear, if your site was AJAX powered and called in content from APIs, you're still invisible.

To try and understand if this is the case I asked if API driven sites would be penalised and received a response from John Mueller - Webmaster trends analyst at Google

> Ian Thomas - How well does the crawler handle SPAs that compose their content from further XHR calls on load? I've seen good results with apps that bundle their content into their JS payload but nothing to suggest that those backed by an API with data loaded after DOM Ready will be as well crawled.
>
> John Mueller - I'd use the Fetch and Render tool to double-check. Loading data via AJAX/JSON shouldn't be a problem, as long as everything's crawlable.

This announcement is interesting because, if true, this opens up the world of SPAs to websites which rely on search engines for traffic aquisition. Coupled with the fast paced JavaScript ecosystem there are some interesting opportunities which arise from losing the requirement to render HTML on a server to send to a client.

### Why should we favour client-side rendering?

Web applications which implement client-side rendering often feel faster than more traditional websites. Looking specifically at our mobile site, there are significant performance enhancements achieved by not requiring a full page load on every customer action. Additionally, the introduction of loading feedback and keeping portions of the UI present during content load makes browsing content feel slicker.

There are product features that only become possible with client-side rendering - an example being our recently released video player which can be docked to the top of the screen allowing uninterrupted stream viewing across page views.

Our service relies on real-time data to ensure that customers receive accurate odds and in-play information so we already have a large dependency on JavaScript and DOM manipulation. Moving to a thick client, thin server approach would keep all our view logic in one place (rather than duplicated across php and JavaScript) and opens up innovative approaches to building interfaces using components (whether that be using Polymer, React, Ember or AngularJS).[^1]

A client only stack can take advantage of advanced tooling designed to optimise developer productivity and UI performance such as Webpack or Browserify. It's also possible to separate out data dependencies without need to undestand a component tree ahead of sending a response back from a server - allowing us to deliver a library of components which can be plugged in and re-used across applications.[^2]

An additional benefit arising from client-side rendering is the requirement to power the front-end through well defined APIs. This helps decouple our platform and allows us to develop new products from our data or even open up our service to third-parties to build new applications as part of a wider Sky Betting and Gaming ecosystem.

### Why shouldn't we favour client-side rendering?

While it is great that Google is trumpeting the ability to render pages as a standard browser would, unfortunately they aren't the only crawler in town. Other third parties (such as Facebook, Pintrest, Twitter, etc.) often crawl links shared to their platform to bring back relevant content to insert into their own pages. If we remove the server-side markup entirely it's highly likely that these services will not have the ability to execute JavaScript to the same standard as the Google bot. This could mean poor brand exposure on those platforms which may result in a significant drop in referral traffic.

It also remains to be seen just how well search engines can understand API driven websites. While there is strong evidence showing that SPAs that include JSON payloads or content as part of their JavaScript bundles are rendered and indexed correctly, there still is little to prove that API driven sites which rely on further XHR requests after a DOM ready event have their full content crawled.

There are some performance concerns here too - while client-side rendering should significantly reduce the response time for initial page load, depending on how the application is built there may be an issue with slow APIs resulting in a noticeable wait for real content on a page. Server side rendering potentially removes the perception of slow performance by sending back real content immediately so, even if JavaScript hasn't finished parsing and executing, the application appears to be responsive and the user can engage with the content.

## Are there any non-functional concerns about removing server rendering?

Choosing to go with a third party framework could be risky as we don't have ownership of their development roadmap and there are no guarantees of long term support. We can make educated decisions to mitigate this risk and given the main contributor to React and Redux is Facebook, it seems to be a risk that we can afford to take. That said, if ever we wanted to experiment with a new technology for a single part of the site, that would be very difficult indeed.

We know the performance profile of our servers and can scale appropriately, moving more processing to the client removes any control we have over the execution environment. Initial performance tests show an increased usage of device CPU (which is to be expected) so for those customers on older/weaker devices there may be greater performance penalities than a server rendered approach and we may cause excessive battery drain if we aren't careful.

There's also an increased reliance on monitoring real-user data to ensure products are working as expected. We have very detailed logging from our servers which gives detailed visibility of their health and makes debugging issues less painful. When a significant amount of processing is done on a customer's device we do not have the same level of control or visiblity so triage and debugging could be much harder. Equally, the sheer number of different devices and software makes it difficult to pinpoint problems

## How can we put this approach to the test?

SEO and rich links from third parties are critical to our marketing and ongoing aquisition strategy, we need to be certain that this approach won't incur SEO penalties. We decided that the simplest way to test this theory was to build a lightweight website which is entirely client-side rendered and see what gets indexed. This blog post is our organic way of linking to the [proof of concept][poc] so search engines can find it!

In addition to organic indexing, we can hook up the site to Google's Webmaster tools to Test what Google sees through the [fetch and render][fetch and render] - this is the most immediate way to get a feel for how crawlers might see the site.

## How did we build it?

It's always exciting to have the opportunity to work on completely greenfield projects so we took the opportunity with this spike to review several exciting front-end technologies that we've had our eye on for a while:

- React
- Redux
- React Router
- ES2015 transpiled via Babel
- CSS modules
- CSSNext
- PostCSS
- Webpack
- Hot Module Reloading

We currently use several of these in production as part of our Bet Tracker and Cash Out product but JavaScript packages don't stand still for long so it was good for us to experiment with the latest approaches coming from the wider community. It was particularly exciting to be able to investigate CSS modules as, like many long-lived websites, the scaling and maintenance of our CSS is a particulary thorny topic.

If you're interested to see what we built, it's available to view at [www.skybet-nextgen.com][poc]

## The results...

Well, it's a bit early to say on this one but early signs are not so good for getting our content into Google. Using the fetch and render feature shows a beautifully accurate represenation of the loading state of the demo website, with none of the API requests having completed at the time an image was captured. Whether this means that the actual indexing behaviour also misses the XHR data fetch is yet to be seen, we'll have to wait to see how any organic crawling performs.

Keep checking for a follow on post containing the full results of this test.

[deprecation]: http://googlewebmastercentral.blogspot.co.uk/2015/10/deprecating-our-ajax-crawling-scheme.html
[bet]: https://www.skybet.com
[mbet]: https://m.skybet.com
[web timeline]: https://en.wikipedia.org/wiki/Timeline_of_web_browsers
[ajax]: https://en.wikipedia.org/wiki/Ajax_(programming)
[ajax crawling scheme]: https://support.google.com/webmasters/answer/174992?hl=en
[fetch and render]: https://www.google.co.uk/webmasters
[poc]: http://www.skybet-nextgen.com

[^1]:
    We are specifically looking at the way a component based UI could work using a technology like React, but the other frameworks mentioned are equally capable at working in this way.

[^2]:
    As we are specifically looking at React the component lifecycle could be used to empower smart components which know how to fetch and update their own state from dedicated enpoints - an approach that is ineffecient and difficult to implement cleanly when using React's server side rendering capability.
