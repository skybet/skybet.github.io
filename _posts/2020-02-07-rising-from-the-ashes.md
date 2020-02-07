---
layout:     post
title:      Rising from the Ashes
date:       2020-02-07
summary:    We've always enjoyed running incident response drills, but they were becoming stale. This post covers how we addressed the problems with our fire drills and iterated upon them
author:     ols
image:      firedrills/fire.jpg
category:   Operations
tags:       chaos engineering, fire drill
---

Just under two years ago, I wrote about [how we run fire drills (incident management role play scenarios) in the Core tribe](https://sbg.technology/2018/05/04/firedrills-in-core/). The post covered the mechanics of planning and running the drills, but also talked a bit about the tools that we were using. Since then, lots has changed in how our fire drills work, and this post will cover the what and why of those changes. It is not necessary to read that to understand the points in this article, but I would still recommend it so that you have additional context around what has changed.

Practising your incident response is nothing new or special, and it's certainly not confined to the technology sector. I'm sure many of us remember fire drills at school. I was never really sure what good it was doing, but made the most of the time out of lessons, taking "walk calmly don't run" to a new level of slowness. It's this attitude that has attracted a lot of criticism of fire drills, the thought being that they breed complacency.

## Complacency

We found ourselves in this situation too, people were becoming complacent. Our fire drills that once had us revered within the company were delivering fewer and fewer positive outcomes, and they were seen as a chore rather than an exciting and useful pastime.

The scenarios that were run each week were primarily designed and run by myself; when other people ran them, they were facilitated by other platform-focused colleagues. This resulted in a lack of diversity in failure scenarios, specifically neglecting the wonderful ways in which applications can fail. This also had the unintended consequence that those running the fire drills very rarely ever took part as a responder, and so missed out on that vital experience.

The fact that the scenarios were being run by primarily one group of people also meant that product delivery teams were not aware of how their systems and services behave under certain conditions. We do not do continuous verification of systems as part of their development or deployment, relying on the scripted fire drills to identify and eke out ways in which the systems fail.

Finally, and definitely the biggest contributing factor to the complacency we were seeing, was what we initially thought made our fire drills as immersive as a real incident. We had members of all on-call rotations (Platform, two Software Engineer rotas with different domain expertise made up of a few different squads, IC, and SLM). We saw that as soon as the cause of the incident was found to be something in one team's domain, that team was called in to investigate (e.g. `/var/` has become unmounted somehow; don't figure out how or why, just escalate to Platform). During an incident this is exactly what you want but while training engineers on their incident response and troubleshooting skills, we don't necessarily want to rely on SMEs and entire rotas for their domain knowledge. This causes documentation to become stale, and _worse_ be written for those who know how to restore service without the docs, rather than for someone who knows just enough to follow them safely.

## Discontent

Another theme we saw emerging was recurring actions off the back of a fire drill. There would be some particular observations, for example "_SystemX is not available for people in GroupY **and** GroupZ_", that was never really addressed because the likelihood of needing access to SystemX was so low.

We also saw a very long cycle for time for improvements that were raised with predominantly feature delivery squads. Even though they were raised in the context of what was essentially an incident, they were treated almost as tech debt, passed to a BAU stream that wouldn't necessarily have all the context. Often these were relatively trivial things like changing a WARN event to an ERROR, or amending what events are thrown on certain HTTP response codes.

Our fire drill plans needed changing before the whole purpose of them was forgotten and everyone lost interest.

## Changes

Things did change. We shifted the rota around so that a different squad was responsible for facilitating a drill each week. This was an immediate success. The level of engagement we saw was unbelievable, far higher than any previous attempts to drum up support from other people to run the drills.

The facilitating squad's place on the rota was effectively removed, and played as an additional role by the person facilitating the drill. This meant that they could drip feed information to the other participants if required. This has led to some fun and engaging ways in which their inability to help has been explained.

![](/images/firedrills/jeff-life-drawing.png)

The drill can be held in whatever environment the team is comfortable running it in. We have traditionally used our Staging and Disaster Recovery environments for drills but with the advent of cloud technologies being used in the tribe, there is nothing to stop other environments being used (or indeed entire mock environments being spun up temporarily)

A big part of letting the squads plan and execute their own drills, is that they can then own the mop up from the drill, including the picking low-hanging fruit of service improvements (mainly documentation, changes to monitoring, logging, and observability, and minor code fixes such as those alluded to earlier)

This was initially put forward as a trial for a few months, and given the response we have had to it from leadership and those involved in running the drills, I'm sure it will become the new normal. As before though, we need to be mindful not to let the new normal become boring, and so we will be looking to iterate further on the process over time to ensure that people stay engaged, and our incident response drills stay relevant.
