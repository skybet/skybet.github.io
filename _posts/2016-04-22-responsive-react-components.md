---
layout:     post
title:      Responsive React Components
date:       2016-04-22 13:54:00
summary:    Your summary here.
author:     matt_kirwan
image:      post_image.png
category:   UI Engineering
tags:       javascript, react, responsive
---
Over the past 12 months the Vegas Squad have been building a single, fully-responsive platform that allows skyvegas.com players instant access to their favourite slots and table games regardless of the device with which they visit.

Powered by React, the project as a whole has provided an amazing learning curve for all squad members - whether wrapping your head around the flux architecture (especially when coming from an MVC background!) or truly understanding the specifics of React itself, to have been a small part of such a great squad and watching the dynamic change across the team as knowledge is shared and confidence has grown, is truly an honour.

Anyway, I digress.

One of the last and arguably most important pieces of the single platform jigsaw was the "road to mobile" or in more verbose terms; ensure we create absolute feature parity between the existing (and soon to be retired) dedicated mobile site and the new responsive website.

Part of this "road to mobile" entailed designing and creating or updating  React components which were initially conceived with a single (larger viewport) device in mind.
This process was happening over a couple of months with many components being created or updated independent of one another by different developers, it quickly became apparent that between us we had come up with various different solutions at solving the same problem and in the process created some pretty daft technical debt in our shiny new codebase.

So, what was the actual problem we were trying to solve?

The Sky Vegas website needs to render different React components depending on the users current viewport size. A perfect example of this would be the new Navigation.

With lot's of screen real-estate we have the room to render the Navigation component as a full-width horizontal menu:
![Site Navigation - Large Screen](/images/responsive-react-components_large-screen-nav.png)

However, should the user be navigating on a device with a smaller viewport (such as a mobile phone or tablet), our design team don't have as much screen real-estate to play with and have decided to render the main navigation within a 'burger menu' icon:
![Site Navigation - Smaller Screen](/images/responsive-react-components_smaller-screen-nav.png)








What were our original ways to solve the problem and what was bad about those solutions?


