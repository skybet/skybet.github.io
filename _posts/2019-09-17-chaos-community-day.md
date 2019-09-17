---
layout:     post
title:      Chaos + Resilience Community Day 2019
date:       2019-09-17
summary:    Our resident chaos monkey ols went to London for the first Chaos and Resilience Community Day held in Europe
author:     ols
image:      chaos-community/image.jpg
category:   Conferences
tags:       chaos engineering, conference
---

[Chaos Community Days](https://chaos.community/) are a meeting of minds for those involved in chaos engineering and related disciplines. They usually feature short presentations on a single track, as well as guided conversations on a variety of topics. Chaos Community Day 2019 was the first to be held in Europe, and I was excited to be invited to attend.

## What is Chaos Engineering?
>Chaos Engineering is the discipline of experimenting on a system in order to build confidence in the system’s capability to withstand turbulent conditions in production.

That’s according to [Principles of Chaos Engineering](https://principlesofchaos.org), though the term is often conflated with similar and related concepts including resilience engineering, SRE, and disaster recovery and incident management testing. It boils down to understanding how and why your systems fail, before they do in the real world.

---

This year's event promised some big names, and some great talk abstracts. Among those scheduled to speak were:

* [**Casey Rosenthal**](https://twitter.com/caseyrosenthal), CEO of [Verica](https://www.verica.io/), formerly an Engineering Manager at Netflix, who quite literally [wrote the book on Chaos Engineering](https://www.oreilly.com/library/view/chaos-engineering/9781491988459/);
* [**Charity Majors**](https://twitter.com/mipsytipsy), founder and CEO of observability company [Honeycomb](https://www.honeycomb.io/) and former Facebook Engineering Manager; and
* [**Olga Hall**](https://twitter.com/ovhall), pioneer of Resilience Engineering at Amazon Prime Video.

---

After our welcome from the emcee [Russ Miles](https://twitter.com/russmiles), the talks began. Casey Rosenthal spoke about the maturity of chaos engineering disciplines, and looked to the future. One prediction that struck a chord with me was prevalence of the next stage in the [CI/CD](https://en.wikipedia.org/wiki/CI/CD) pipeline, which is Continuous Verification. He has [blogged](https://www.verica.io/continuous-verification/) about this previously, but the summary of CV is that it is a way of running chaos experiments as part of the pipeline, for example injecting failures and latency into the application during the build of the new version, or verifying assumptions made about the software release after it has been rolled out to production. If you think that sounds an awful lot like what [ChAP](https://medium.com/netflix-techblog/chap-chaos-automation-platform-53e6d528371f) does, then you're right! ChAP is a tool that was written by Casey's team at Netflix which would spin up control and failure-injected services, run experiments against them, and produce reports based off the results of those experiments.

He also spoke about the myths of robust systems, many of which are counter-intuitive but make sense when you think carefully about them. The myth that caught me most by surprise was that adding redundancy doesn't necessarily make a system more robust, in fact it can sometimes even be a contributing factor to a catastrophic failure. From his blog post on the subject, he says:

>One of the most famous examples of engineering failure is the [Space Shuttle Challenger](https://www.press.uchicago.edu/ucp/books/book/chicago/C/bo22781921.html) explosion in 1986. NASA was aware of issues with the o-rings sealing the solid rocket boosters since at least the second shuttle mission in 1981, but procedurally decided that it was an acceptable risk. Why? For three reasons, the first of which was: The functionality has redundancy. There was a primary o-ring, and a secondary o-ring. If there had only been one, the engineers never would have signed off on allowing the third mission to proceed, let alone the 51st mission that ended so catastrophically.

He clarified this further in conversations following his talk. If you have a component that has a 0.5% chance of catastrophic failure, then your system has a 0.5% chance of catastrophic failure because of that component. If you add another of these components for redundancy then you now have a 1% chance of catastrophic failure. It's just maths, and I don't argue with maths.

The next speaker was Harpreet Singh from DBS Bank. He spoke about how they created their own tool to inject failures into applications and integrated this into their CI/CD pipeline. A lot of his focus was how to increase adoption of this new tool, and chaos engineering in general within the bank, which involved lots of conversations and collaborative working with other parts of the business to come up with guidelines around architecture, development, logging, and deployment.

Next Olga Hall spoke about the journey the team at Amazon Prime Video made from chaos to resilience. They started with GameDays in the early 2000s, building up expertise in the area and causing a community to be formed around it. Now they have an opt-in scaling point of contact in each team, who all check in with the resilience team. It was really interesting to see how far they have come, and how they strive to beat the golden 99.999% uptime, with their live stream products aiming for 100%. Olga also spoke about [Little's Law](https://en.wikipedia.org/wiki/Little%27s_law) and how it enabled them to discover a new way to measure their customers' experiences. Instead of looking at just concurrent sessions and length of the session, they started to get metrics on what is happening at session start, before any sort of playback activity is initiated.

>Readiness to handle failure (or the unknown) is feature zero  
>--<em>Olga Hall</em>

Olga also said that the team wanted to be at the point where high profile title launches would be business as usual. This is a goal we also have at Sky Betting and Gaming; we want our biggest sporting events of the year to not need any additional support or thought around them, because everything just behaves as we expect. We should build a vision and culture of the high bar of reliable systems, that everyone in the company is invested in.

The final speaker of the morning session was [Sylvain Hellegouarch](https://twitter.com/lawouach), one of the creators of the [Chaos Toolkit](https://chaostoolkit.org/) who told the story of an engineer on the Swiss Alps, on their first holiday in a long time, called out because of a change they made the day before they left. The engineer was him, and the change was a simple Kubernetes ClusterRole change, which stripped their proxy configuration to the default, resulting in a broken website. 

>You will always find a root cause, if you look long enough. Don't do it  
>--<em>Sylvain Hellegouarch</em>

His story highlighted the need to focus on the reality behind the effects on a misbehaving system, rather than the effects themselves. A system will usually give you clues as to what is wrong with it, and chaos engineering creates a dialogue with that system. He went on to talk about how chaos engineering is more exploratory in nature, about understanding the system is not inert or static, but almost like a being.

---

In the afternoon, we had a presentation by [Gunnar Grosch](https://twitter.com/gunnargrosch), who runs the [ServerlessChaos](https://twitter.com/serverlesschaos) twitter account. He was talking about how chaos engineering practices can be applied to [serverless](https://en.wikipedia.org/wiki/Serverless_computing) workloads. Like with most systems, it is not a case of _if_ it fails, but _when_. He discussed and demonstrated tools by [Yan Cui](https://twitter.com/theburningmonk) and [Adrian Hornsby](https://twitter.com/adhorn) which make it [easier](https://github.com/adhorn/aws-lambda-chaos-injection) to run experiments in a serverless world.

After this talk there was a section for lightning talks from the attendees. Of course I put myself forward for one, and spoke about getting paid to sleep, and how to make on call better by understanding what your alerts are actually telling you, and making sure the right people are being woken up. I'll turn it into a proper talk at a later date, so do watch this space! For my troubles I won an signed copy of [Learning Chaos Engineering](http://shop.oreilly.com/product/0636920251897.do) by Russ Miles, and an Amazon Prime Video Binge Box containing sweets, popcorn, and... socks.

[Crystal Hirschorn](https://twitter.com/cfhirschorn) then took to the stage to talk about building organisational resilience at Condé Nast. She spoke about the dangers of Root Cause Analysis (RCA) in its traditional form, with the onus and responsibility firmly on the shoulders of the operator. The linear path of RCA, including the [Five Whys](https://en.wikipedia.org/wiki/Five_Whys), also came under fire. She spoke about running a Post-Incident Review (PIR) as a better way of learning from incidents. 

>What are we asking now that we weren't before?  
>--<em>Crystal Hirschorn</em>

Also covered was how to widen the scope of a PIR to make it an organisational learning. We try to make our PIRs like this at Sky Betting and Gaming, whereby the meeting is open to all who wish to attend, and the findings are sent out to everyone. The foundation is a culture that fosters learning at an organisational scale, and allows for the autonomy to fix things.

The final speaker was [Charity Majors](https://twitter.com/mipsytipsy) who I was really looking forward to hear speak about testing in production. The talk was full of the most perfect quotes that I have already added to my arsenal back in the office:

* _"Chaos engineering is just a marketing term for testing later in the development process"_ - true, but that's not a bad thing if it's drawing attention to the need for it (I don't think it was said as a bad thing either)

* _"Deploying is not binary. It's a process of increasing cofidence in your code"_ - 100% this, your confidence in your code increase from when it's written, through deployment, on a scale until it has been out in the wild for a year or so

* _"Operational literacy is no longer a nice to have"_ - this plays in to the whole devops movement, and is such an important part of having a well-rounded team

* _"Any [callout] you receive should be **"Huh, never seen that before"**"_ - if you have recurring alerts that page you out, then there is a big problem with understanding why your systems are failing in that way, or else prioritising work to fix broken systems

Charity also spoke on the shift from monitoring to observability. Monitoring is great for answering questions that we ask of it. But we often don't know the question we want to ask. We have an intuition or a rough idea, but are limited by not being able to articulate our thoughts. Observability is great, because each deploy of new code is a unique experiment in itself. That new code, on specific infrastructure, at that specific point in time is unique, so being tuned in to your systems is a massive win.

Of course, testing in production is no excuse to skimp on the testing that should be done as part of a healthy SDLC; testing in production includes things like behavioural tests, load testing, dark launches, and multi-region deploys, of which very few can be reliably tested ahead of a release.

Resilience engineering is not about making a system that doesn't break. It is making a system that breaks a lot, but users don't notice. We need to be less afraid of making mistakes, and just accept that a lot of bugs only surface in production when real traffic is going through it, and edge cases are being hit.

The last point from Charity's talk that I want to touch on is the requirement that everyone knows what normal is in prod, how to deploy and roll back, and how to debug. Many operations teams have built a glass castle that people are scared of. We should have been building a playground, that can be explored and enjoyed, even if developers do go off and eat mud every once in a while.

---

If you like breaking things, and would be interested in a career with Sky Betting and Gaming, head over to our [careers site](https://www.skybetcareers.com) for more information about the company, and to see our current vacancies.
