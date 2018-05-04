---
layout:     post
title:      Crash! Bang! Wallop! Practice makes perfect
date:       2018-05-04
summary:    Engineered Chaos, breaking production, and getting away with it. How the Core Tribe in Sky Betting and Gaming break stuff to make things better
author:     oliver_leaver-smith
image:
category:   Operations
tags:       chaos engineering, firedrill
---

Our story begins on what can have been no more than my third day at Sky Betting and Gaming. The Head of Platform for Core Tribe mentioned that my mentor would be hard to get hold of that morning, as he was "setting up and running a firedrill". I made my confusion known. How would one set up a firedrill, and why? My confusion, and images of people standing on chairs with lighters held under sprinklers, turned to intrigue when I was given a little context, and told about how firedrills are the training exercises done to work on incident response, disaster recovery testing, and chaos engineering. Welcome to Sky Betting and Gaming, where a firedrill isn't always what you think it is...

## Pardon?

Yes, quite right. Throughout this post, I will refer to a few different principles that are used in our training exercises/firedrills. For clarity, I'll give a couple of quick definitions so you're not left behind.

**Chaos Engineering** is the experimentation on systems to prove that the system itself can survive in production if things start misbehaving. It is something that can be automated, as has been done with a lot of the [chaos tools Netflix use](https://medium.com/netflix-techblog/tagged/chaos-monkey).

**Disaster Recovery Testing** is around the processes and policies in place when a DR scenario is actually invoked. Google have their *DiRT Week* during which office and datacentre failure are simulated and reacted to by Google engineers.

## Doesn't that require quite a bit of resource?

Good question; yes it does. In Core we have a firedrill at least once a week. This takes *at least* four people away from project work for up to half a day. Exercises that need cross-tribe involvement cause even more disruption. The important thing to do is weigh up the cost of running the exercises against the value that they are giving the business. In the case of Core, making sure that everyone on the on-call rota is confident in dealing with things being thrown at them (not just technical problems, but the business processes that have to be adhered along the way) is paramount.

## How are they run in Core?
In Core we tend to gravitate towards the Google approach, focussing our firedrills on the people and processes rather than experimenting on how the systems behave under weird conditions. Don't get me wrong, we do look at that, it's just normally outside the scope of these training exercises.

We want our firedrills to be as real and incident-like as possible, and achieve this through the following:

### The people involved
The people in the firedrill should match the people that would be responding to an incident out of hours. Our current on-call rota has two developers and one platform engineer, one of whom will be primary. We also have an on-call Incident Commander (IC), a Service Level Manager (SLM), and other roles that often get played by the person running the firedrill.

* **Orchestrator:** Breaks the things, runs the firedrill and plays any roles missing
* **Platform Engineer and Developers:** Do the fixing
* **Incident Commander:** Organises the fixers
* **Service Level Manager:** Manages stakeholders and business priorities
* **Third Parties:** Other tribes, service providers, etc.

### Context and setting
Context is key in a real incident, and the same is true in a firedrill. We are likely to take different approaches depending on the time of day, or day of the week. Our approach is also going to be affected by sporting events that are ongoing or starting soon. To address this, we have a meeting beforehand with the individuals involved to cover off any contextual information.

We also use this meeting to confirm  which of our environments the drill will take place in. Usually the staging environment is used, but we will occasionally run drills in our DR environment. The environment we use depends on the scope and impact of the scenarios taking place.

### Tooling
Our firedrills are expected to be as incident-like as possible, and so we use the same tooling in a drill as we would in a real incident. Whether this be for deploying code, running batch jobs across the environment, or communicating with the incident response team.

We use Slack heavily in Sky Betting and Gaming, so much so that when an incident is created we have a correspondingly named Slack channel which serves two purposes:
1. We have a chronological breakdown of what happened, and who did what. This is great for reviewing the incidents once the dust has settled and revisiting an incident if we spot similar behaviour in the future
1. We keep other more general channels clear. This helps immensely when there are multiple incidents open at the same time, and helps to avoid cross-talk in other channels

I mentioned earlier that the firedrill orchestrator will often be playing the role of multiple people. In the past this has proved quite tricky to keep track of, and ruins the immersion somewhat. 

![Orchestrator roles before fdctl](/images/firedrills/before_fdctl.png)

In order to rectify this, we have developed [a tool](https://github.com/skybet/fdctl) that will post to Slack using different identities in order to make conversations more realistic

![Orchestrator roles after fdctl 1](/images/firedrills/after_fdctl_1.png)

![Orchestrator roles after fdctl 2](/images/firedrills/after_fdctl_2.png)

### Scenarios
As I wrote earlier, the firedrills we do in Core tend to be more bahavioural and process-focussed, rather than asking "_what happens to service `x` when `y` happens to service `z`_". Below I will outline a few different scenarios we have run in the past that have been successful, and what they taught us. To clarify, these are fake scenarios that were run in environments **not** serving live customer traffic.

#### A total outage on login due to a failure in a downstream API
Our login process calls a couple of different internal APIs in an asynchronous manner. We fudged one of them to misbehave and watched everything burn. The main learning from this was to use the monitoring available rather than heading straight into debugging individual applications.

#### Integration with Apple Pay broken
Some servers integral to our Apple Pay integration suddenly went away and could not be brought back into service, resulting in unfriendly errors when Apple Pay deposits were attempted. Part of the strategy to put more helpful banners in place alerted us to out of date documentation.

#### Accidentally putting banners on the site causing a drop in login numbers
Broken banners were "inadvertently" applied to the login portion of the website, meaning that there was no login box for people to use. Mobile applications were unaffected as they do not use this method of login, and so this was reported through customer contacts rather than being alerted to increased errors rates. It showed us that we didn't have adequate monitoring in place on synthetic user journey completion, which would have alerted us straight away.

#### Zombies are attacking your datacentre
Zombies are approaching the datacentre and we only have 15 minutes before it goes dark. Better invoke our disaster recovery plan, and quickly! This is a scenario that is wider than Core Tribe, and so needs a lot of buy in from the business as a whole. We have run several of these drills, and have iterated through versions of runbooks multiple times to get us to a state where we are happy.

## What have we learnt?

Having done these drills for a couple of years within Core, we have learnt a couple of really solid lessons:

* It is not easy when you are regulated. Other businesses may be able to take their secondary services offline in production (for example, Netflix stopping serving 4K and HD content). This results in a bad customer experience but it isn't going to get them in trouble with a regulatory body. If we intentionally break the method for customers withdrawing money from their account, or remove one of our many safer gambling tools, we are at risk of falling foul of the regulators
* It is not always about fixing the root cause. In the scenario above, where Apple Pay integration was broken, the aim of the exercise was to go through the bannering strategy, not to fix the servers straight away. Sometimes your Engineers are just too good at fixing things quickly, and you have to get a bit creative...

  ![Getting creative to slow down Engineers](/images/firedrills/creative.png)

And onwards to the future, there are several things we want to change longterm and shortterm to make our firedrills better:

* Automate scenarios. We currently rely on a few orchestrators to plan and execute the drills. They they play the roles of people helping to fix the problem. If they too were surprised about what the actual drill entailed, the process would be a lot more immersive and believable
* Push some load through the environments during a drill. At the moment we rely on existing transient traffic going through the staging environment in order to pretend to be checking graphs. If we were to put a little bit of simulated login and account browsing load through the stack then our graphs would be a little more realistic looking (as an aside, if you want to see how we do performance testing, check out [this blog post](https://engineering.skybettingandgaming.com/2017/10/23/performance-left-right-and-center/) by my colleague Paul Whitehead)
* Get other tribes involved more. We can break more things if we work as a team, that's just maths
* Have multiple incidents happening at the same time. This occasionally happens in the real world, why shouldn't we have this as a scenario too?
* Actually break our live environments. To do this we need to be running everything in multiple regions of AWS. Once this is done, we can start killing off entire AWS regions like Netflix do with [Chaos Kong](https://medium.com/netflix-techblog/chaos-engineering-upgraded-878d341f15fa)

## Further reading/viewing/hacking

* [Weathering the Unexpected](https://queue.acm.org/detail.cfm?id=2371516) 
* [Principles of Chaos](http://principlesofchaos.org/)
* [Chaos Community Google Group](https://groups.google.com/forum/#!forum/chaos-community)
* [Awesome Chaos Engineering](https://github.com/dastergon/awesome-chaos-engineering)
* [Netflix Chaos Blog](https://medium.com/netflix-techblog/tagged/chaos-monkey)
* [Chaos Engineering + DiRT panel](http://pages.catchpoint.com/AMA-Chaos-DiRT.html)
* [10 Years of Crashing Google](https://www.usenix.org/conference/lisa15/conference-program/presentation/krishnan)
* [fdctl](https://github.com/skybet/fdctl)

If you like breaking things, and would be interested in a career with Sky Betting and Gaming, head over to our [careers site](https://www.skybetcareers.com) for more information about the company, and to see our current vacancies.
