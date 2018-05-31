---
layout:     post
title:      Load-Bearing Cookies
date:       2018-05-31 13:00:00
summary:    Removing legacy code that seems completely unused can sometimes have very unpredictable consequences.
category:   Software Engineering
tags:       cookies, security
author:     chris_buckley
---

A recent Tweet made me laugh, and made me think of a number of past scenarios that fit the description:

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">You can’t fix that bug, it’s a load-bearing bug. 🤪</p>&mdash; Rich Seviora (@RichSeviora) <a href="https://twitter.com/RichSeviora/status/1001371504603422720?ref_src=twsrc%5Etfw">May 29, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

I expect a number of us can think of cases where we've implemented a fix for a bug, only to have to revert the changes because of unintended consequences, including breaking other people's workarounds!

Historically, this is baked in to everything we develop in Web applications: browsers have [Quirks Mode, Standards Mode and "Almost Standards Mode"](https://developer.mozilla.org/en-US/docs/Web/HTML/Quirks_Mode_and_Standards_Mode), with varying degrees of fallbacks supported for older websites. Browsers are effectively committed to supporting these modes for evermore because it's more important to preserve older content than to stop supporting them.

However, this tweet brought back memories of a relatively recent incident in Sky Betting & Gaming that was caused by a change we believed to have no consequences.

In this industry, we are often good at speaking out about our adoption of new technology, or our improvement of processes, generally painting the picture that everything moves forward based on shiny product releases and successful experimentation. What we sometimes fail to discuss is the improvements we make by simply turning things off. There can be many reasons for this: perhaps because new technology can be more exciting than older software, we get to flex our creative muscles, or sharing experience with something new has genuine benefit; by contrast, the key advantage to turning something off is the ability to forget about it.

In truly iterative delivery, in some sense we are always turning off older features in favour of new ones, but on the macro level this misses the relief that can be found by removing an application from active service. I've been to team outings where we've celebrated the end of life of so many headache-inducing applications, and the feeling is usually one of satisfaction, of reducing the cognitive overhead. In commercial situations, we can be reluctant to talk about failures, especially where they could be avoided.

Hyperboles aside, I believe this incident serves as an interesting story of deprecation in its own right, and shows that retiring code is never as simple as code path analysis.

## Scenario

This story starts with a general security audit of the Sky Betting & Gaming estate. In particular, the class of problems was the cookies served by various applications and systems in the organisation. The requirement was to reduce the scope of the cookies by making them both `Secure` and `HttpOnly`. Whilst we could move to `Secure` with relative ease (using shared redirection logic, HSTS and CSP), it was always going to be difficult to conclusively prove a cookie wasn't needed by JavaScript.

We classified our cookies by whether they contained sensitive information, whether they were accessed by client-side code and whether they were accessed by server-side code. This helped us to analyse whether a cookie needed to remain as-is, have the `HttpOnly` attribute added or be removed entirely. As a joint effort, this reduced the exposure and need for a number of cookies, including a legacy feature-toggling cookie, which caused our incident.

## Problem

To describe the problem, it is important to know how customers log in to our products. For the most part a customer will log in to a product on one domain, which loads the shared login service on another domain within an iframe. Because these are separate domains, Safari will see any cookies set on the login domain as third-party cookies, which cannot be set if the first visit to that domain is in an iframe. (This issue first because apparent for us in iOS 7, but iOS 11's intelligent tracking prevention exacerbated it.)

When our login service is loaded by a product, the client-side code checks if a cookie can be seen, and if not, it performs a full-page redirect to force a cookie to be made available, so that subsequent cookies can be set from within an iframe. This process has worked for a number of years, but it turns out the journey to do this never actually set a cookie of its own; it always relied on other parts of the application to set cookies that were visible to JavaScript.

As part of the cookie audit, we found a cookie that was historically used to place customers into feature groups so that we could make granular decisions on feature toggling across our products, but was no longer being used. We released a change to remove the code that set this cookie, and this is where all hell broke loose. The impact was catastrophic, causing a sharp decline in logins across all products for customers that received the change. Many customers were thrown into a redirect loop between the product domain and the login domain.

The problem was that this cookie was the last remaining cookie served to the login domain that wasn't `HttpOnly`. Our cookie audit had been *too* successful, removing the need for any cookies to be accessible by JavaScript. Unfortunately, this cookie became the sole reason that the login journey continued to work, and caused some very confused looks when metrics started to go awry after it was removed. Of course, not all customers were affected, as those that already had cookies set were able to interact without issue; only fresh visitors experienced the redirect loop.

## Resolution

After quickly reverting the change, the root cause was discovered and a patch was made to explicitly set a cookie (non-`HttpOnly`) as part of the redirect logic. We made sure to cover first visit and subsequent visit as separate cases in our smoke testing suite. It's clear to see that code path analysis and usage statistics will never be enough in this case --- it's vital to observe and react to the real user metrics across all environments in the lead-up to a production release.

As difficult as it was to investigate the root cause of this issue, the short-lived impact to customers can be balanced with the long-term gain of removing unused code paths. However, whilst it can be extremely rewarding to delete code, remove systems from service and reduce the overhead for operations teams, we should always remember that we are standing on the shoulders of giants: the software we are deprecating was there for a reason and was built to solve a problem with the best available knowledge and people at the time. Avoid criticising historic decisions, re-evaluate based on current understanding and be happy if you get to reduce the lines of code running in production!

