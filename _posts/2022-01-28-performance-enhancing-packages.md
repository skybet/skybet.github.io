---
layout: post
title: "Performance Enhancing Packages"
date: 2022-01-28 14:00:00
summary: Performance is everything in this industry, even the little wins make a big difference. 
author: joe_mills
category: Software Engineering
tags: performance, development, deployment
---

To put it lightly, performance is everything in a modern business. If you're not doing it quick and efficient enough - someone else will. But lets not hang too much on that, this post is about changes we made and how we need to shout about those. 


Here at Sky Betting & Gaming, we create some spectacular websites and apps (but you already knew that). What's great about that is we generally use the same tools and techniques for developing these so a breakthrough for one person can prove to be substantial for many. Granted, every squad is different so it's never going to be _identical_ but there's only so many ways you can develop, bundle and release packages. 

So, when we decided we wanted to look at improving our performance it was a no-brainer we'd immediately look to make a big fuss about it if we were successful - oh boy were we successful! 

## GES Setup
In the Games Experience Squad (GES), we previously used Babel and Webpack for building Next then using Typescript and Rollup for compiling and bundling our packages. After some searching we found **SPEEDY WEB COMPILER** a rust-based compiler with all the bells and whistles needed to integrate with webpack and rollup but also with a simple cli. Little did we know, this compiler would be perfect for our use case and be far easier to integrate than we ever expected. 

### Speedy Web Compiler
What's great about SWC, and what drew our attention to it, is that Next.Js 12 is built on top of SWC. But without making explicit changes, it still defaults to Babel which meant we weren't making full use it. Being a direct replacement to Babel it boasts impressive benchmarking with claims of 20x faster single thread speeds and an eye-watering 70x faster multi-core speed. 

But how could we possibly make this work using a multitude of different packages within a monorepo? Well, we got lucky. SWC has integration with Webpack which let us directly swap out Babel. What was left then was the pesky rollup package that used Typescript. Thankfully, we used [rollup-plugin-swc](https://github.com/mentaljam/rollup-plugin-swc) to finalise our migration to a SWC based application.

## The Results
Let's not beat around the bush, you're all here for the data to see just how much of a difference it made. 



|Build Location | Old System | New System | Speedup (%)|
| ---|---|---|---|
| Local | 182.39s | 49.86s | 365.80% |
| Jenkins | 94.00s | 31.00s | 303.22% |


When initially comparing the time statistics, it does not appear to be significant but once you realise this is **over 300%** on multiple environments the potential for impact on Sky Betting & Gaming is extraordinary. 

**Our Response:** 
After verifying and testing our builds we went straight to inform the Gaming tribe before the entire sbg-tech channel via Slack to voice our achievement with encouragement and support to make these changes where possible. 

## What comes next?
Performance and technology are always changing and shaping the industry - as soon as you do one thing the next best thing goes along. Fortunately, there are a number of new features under construction from SWC including a bundler and minifier which we are excited to see and can potentially migrate from Webpack and Rollup for a full Rust-based build process.
