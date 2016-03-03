---
layout:     post
title:      Velocity Amsterdam 2015
author:     colin_ameigh
date:       2015-11-18 12:00:00
summary:    Velocity - Building performance
image:      velocity-2015-hall.jpg
category:   Velocity
tags:       conference
---

At the end of October, Sky Betting & Gaming sent a large contingent of staff to attend Velocity
in Amsterdam; one of the largest DevOps conferences gathering industry leaders in building
scaleable systems to share their collective wisdom.

![Velocity](/images/velocity-2015-hall.jpg)

So what did we learn in our two packed days in the RAI convention centre?

Organisational Operations
-------------------------

A general theme emerged from many different sessions that operations is at the heart of our
business, and we should all have an operational focus. Not just DevOps, but MarketingOps,
FinanceOps, and InfrastructureOps too. Or more pithy for the tech audience:

```
^(?<dept>.+)Ops$
```

Building this into the culture of our organisation reduces the likelihood of surprises.
For instance, a marketing push on a big acquisition channel is probably going to apply a
sudden large spike of usage to our web hosts - with marketing aligned with an operations
mindset, this usage spike would be expected and prepared for by engineers.

There are many ways that operations culture can be built - from embedding the non-technical departments
into the technical teams (something we have tried before with little success, giving those embedded
staff a sense of belonging to the technical team is not an easy task), to providing those
departments with a "designated-ops" engineer who attends their meetings (we're going to
trial this approach presented by Etsy, thanks [Katherine](https://twitter.com/beerops) and [John](https://twitter.com/allspaw))

Shared dashboards of business metrics offers a clear view of the impact of changes in
any department on the business, whether a code release, marketing campaign or infrastructure change.
This is something that we do relatively well, with dashboards specifically focused on the key
business metrics (bets placed per second), but there's always more to do to make them more useful
across all teams within the business.


Team size matters
-----------------

Despite the fact that Melvin Conway wrote about this way back in 1967, and Brooks Mythical Man-Month
was published in 1975, and other substantiating research over the intervening year bears out their
conclusions - our organisation still suffers from many of the problems that Conway describes.

Small teams that release small amounts of code often suffer from the fewest problems relating to
the size and complexity of the project that they are working on.

One of the key observations here is that when two teams are not autonomous, or have hard dependencies
between them (our key dependency currently is a shared deployment pipeline), they are separate teams
in name only and suffer from the problems that plague large teams.

Our delivery engineering team is currently focusing on removing the dependencies between teams so
that we can become truly autonomous.

Examining success
-----------------

We pay attention when something fails, but in order to get a full picture of how we manage
the massive complexity inherent in IT systems, we have to examine all the things that went right
so that there wasn't a failure - some of those things may be warning signs that a failure
was only just averted.

Many of the tasks that are undertaken by the technical staff are in response to unintended and
surprising consequences of automation, provide a reason for the counter-intuitive observation that
despite automating "all the things" we need to hire more engineers, not fewer.

We're going to be looking into more detail at our successful operations of our products at our
regular squad retrospectives.

Alerts vs Dashboards
--------------------

Something that we are all guilty of when monitoring "all the things" is that we start to feel the
need to create some kind of alert on the metric that we are measuring. But when do we decide
to wake someone up at 2am? Is it really necessary if a CPU is running hot?

Separating monitoring into dashboards of performance metrics, and alerting systems that alarm on
critical business metrics is an important distinction. For instance, if our HTTP response time
has jumped 20%, but login and bet placement continue without a drop, then the system is
probably healthy;  though this may be a symptom of a heavyweight resource being added to our
homepage by the content team.

Our monitoring is already separated into dashboards of metrics and alerts generating alarms. We
are currently building further anomaly detection to improve the relevance of our alarms.

In conclusion
-------------

Velocity Amsterdam this year was both fun and informative, despite some time spent queueing for the
canal tour. There was a lot to be learnt, and plenty to stimulate further discussion back at the
office along with other snippets of a more practical nature that can be applied immediately.

