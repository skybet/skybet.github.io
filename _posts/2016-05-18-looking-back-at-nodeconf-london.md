---
layout:     post
title:      Looking back at NodeConf London
author:     ian_thomas
date:       2016-05-16 09:00:00
summary:    It’s a little known fact that skybet.com has been working with node.js since version 0.4 (though our first app running in a live environment was on version 0.6) so we’ve got a long history of running JavaScript on the server. In addition, our customer experience is wholly reliant on JavaScript in the browser so you could say we’re less of a PHP shop and more of a JavaScript shop… So it was with interest that three of the skybet.com team headed to that London for the first ever NodeConf London.
category:   Node.js
tags:       node.js, conferences, community
---

NodeConf London was billed as a single track conference “aimed at software experts at all levels of their node.js journey, from coding right up to C-level decision making”. The day was focused around four themes:

1. Start it
2. Build it
3. Ship it
4. Use it

Each section had three talks (except Use it, which had two talks and one panel discussion) and there was a good mix of practical advice, community observation, inspirational depth of knowledge and enterprise insight. Overall it felt like a good balance; you can’t please everyone all the time but there was definitely enough breadth of interest here to ensure everyone went home happy.

“Getting the balance right” is probably the best phrase to capture the essence of the conference, not just from a content perspective, but also that of the level of inclusion, community focus and code of conduct. It was refreshing to see such diversity in a technology event, let’s hope it is representative of the industry as a whole going forward.

## What have we taken away from the day?

With all the talks available on [YouTube](https://www.youtube.com/playlist?list=PL0CdgOSSGlBYnHAl_DZoy9BWvdVQjNKE2) there’s little point reviewing each presentation in depth — just watch them for yourself (they’re all worth your time)! There are, however, a few things we’ve taken away that are worth writing about.

### It’s easy to forget the world outside your bubble

As a large technology company in the north of England we can easily forget just how good we are at the things we do day to day. To qualify that statement, we have high standards and sometimes it seems we’re constantly finding code or technologies that need improvement or processes that feel outdated. We need to keep some perspective!

Many of the more practical talks covered topics and ideas that have long been considered best-practise by our teams. Areas such as automation, continuous delivery, high performance code, service resilience, testability, SOA and cloud infrastructure all featured strongly on the day and are staples of our working practice.

Personally, the most impressive thing of all is our ability to execute at this level while under the scrutiny of the most stringent industry regulators. It would be easy to drown in red tape and process to avoid compliance issues but we work in an agile and reactive way with daily releases and it all feels very straightforward. Anyway, a digression away from node!

### Idiomatic code is important

Some of the talks showcased incredible performance hacks using lesser known features of JavaScript - many of which are actively  denounced as being bad practise and insecure if used incorrectly. It feels like there is a net loss to implementing features using these tricks despite the performance gains and there are better ways for teams to scale their node.js applications.

The runtime is improving quickly and can perform incredible optimisation when a developer sticks to the idiomatic coding conventions. The side-effect being code which is readable and easy to understand - factors that are essential when looking to scale a development team without reducing velocity or quality.

### It’s good enough now

With the capabilities of transpilers (such as Babel) it’s easy to dive into using the latest language features before they arrive in the core runtime. Given the rate of change of the underlying V8 engine (and the current work to introduce Chakra Core as an alternative) it pays to focus on the supported features in the version of node you are running.

Not only does this help with performance, but it also reduces the barriers to entry for working with node. The less distractions there are, the easier it is to focus on developing the core features of an application. Tooling is useful, but ultimately it distracts away from the core target of realising the value of ideas.

### Automate platforms and infrastructure

Nikhila Ravi and Luca Maraschi were particular highlights of the day speaking about serverless architecture using AWS Lambda and automated micro services infrastructure (and failover) respectively.

Skybet is currently using AWS Lambda as part of the platform powering Bet Tracker and it’s a great service. Nikhila’s talk went beyond showing the strengths of Lambda’s pure function based service approach as she also showed how easily the provision and deployment of these services can be automated.

The ability to automate the provision of services, build in resilience from the start and manage infrastructure as code are core features of a modern approach to deploying a web application so Luca’s overview of SWIM ([Scalable, Weakly consistent Infection-style process group Membership protocol](https://www.cs.cornell.edu/~asdas/research/dsn02-swim.pdf)) was really interesting. The white paper, published by Cornell University, offers more in depth information of this approach and is well worth a read.

### Balance

Not all the talks were about areas that were interesting personally, but the day was better for it. The diversity of content, attendees and speakers at the conference highlighted just how important balance is and reminds us that we must work hard to ensure our teams are also diverse. Being inclusive makes us stronger, it breaks us out of our narrow focus and enables us to draw inspiration from a wide variety of sources.

Looking at the history of software engineering it’s obvious that as an industry we’ve been poor at inclusivity. Modern technology teams are often mono-cultural, male dominated environments and we must work to change this. Thankfully at Sky Betting & Gaming we are actively working to avoid this sort of culture through better links with Universities and regularly contributing to our local communities.

## A commitment to the wider community

As a company we rely on JavaScript and node.js to provide core functionality across all our products so it’s only right that we should be attending and supporting events such as NodeConf.

JavaScript is unique in the world of Software Engineering as it is the single most ubiquitous programming language in use today thanks to modern browsers and the Internet. It’s also one of the least prescriptive in terms of how to work with it. This, added to the varying levels of feature support across myriad runtimes and the many foibles of a language primarily devised over the course of a few days makes it both a very difficult and very easy language to work with.

High quality events, such as NodeConf, are vital to the ongoing success of businesses and developers, not just the runtimes and language itself. As a community we have been excellent in sharing our work through modules on github and NPM and now we must continue to showcase best-practise work through speaking and writing to ensure the positive momentum is continued.


