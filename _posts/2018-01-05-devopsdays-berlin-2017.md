---
layout:     post
title:      devopsdays Berlin 2017
date:       2018-01-05 08:00:00
summary:    A look at the highlights of devopsdays Berlin 2017
author:     ols
image:		kalkscheune.jpg
category:   Conferences
tags:       devops, conference, berlin, tech ninja
---

An Englishman, a Swede, a Dane, and a Guatemalan all walk into a Bavarian bar and start chatting to a Canadian and a Pole. Sounds like the start of an inappropriate joke, but this shows just how diverse the attendees of the devopsdays Berlin conference actually are. For those unfamiliar with the format of a devopsdays conference, the morning is filled with structured, traditional talks and presentations, and the afternoon is spent in **Open Spaces**. The agenda for these sessions are suggested and voted on by conference attendees, and the time is meant to be spent discussing the subjects as a group. 

There were several recurring themes over the two days, in the structured talks, the open spaces, and the social event.

## Autonomy

Autonomy, specifically allowing tech staff to choose their own tooling, was a topic that dominated the formal talks during the mornings and the break out sessions in the afternoons. Jason Diller from PagerDuty talked about the "Pit of Success", and how you should encourage people fall into this pit. Designing your solutions so that the best action is the most obvious action is a great way to give the impression of autonomy, whilst keeping checks on the number of different tools. This helps protect you against the dreaded "[bus factor](https://en.wikipedia.org/wiki/Bus_factor)"

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">&quot;Freedom until it hurts, standards until it works&quot; <a href="https://twitter.com/jdiller?ref_src=twsrc%5Etfw">@jdiller</a> <a href="https://twitter.com/blndevops?ref_src=twsrc%5Etfw">@blndevops</a> <a href="https://twitter.com/hashtag/blndevops?src=hash&amp;ref_src=twsrc%5Etfw">#blndevops</a> <a href="https://twitter.com/hashtag/devopsdays?src=hash&amp;ref_src=twsrc%5Etfw">#devopsdays</a></p>&mdash; Udo Juettner (@UdoJuettner) <a href="https://twitter.com/UdoJuettner/status/920554435939418112?ref_src=twsrc%5Etfw">October 18, 2017</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Security

Jenny Duckett from Government Digital Service (the brains behind GOV.UK) championed an Open Space to talk about how we can better involve Security in the agile way we all want to work. The view from many in the session was that security was wrongly seen as just hoops to jump through to live, rather than an integral part of software development that should be present from the outset.

The consensus was that developers should have access to tools that will automatically scan their code, with further security testing during the release pipelines to the testing, staging, and production environments. Though this would undoubtedly increase the chances of catching vulnerabilities, the group decided that it was important that people understood _why_ these scans were happening and what different results meant, rather than just getting a failed build and having to seek out someone from the security team to explain.

## Culture

One of the Open Space sessions on the first day was all around how to successfully run a Devops guild and get all areas of the business involved with the Devops mentality. Lots of solutions were offered, including a take on the [Lean Coffee](http://leancoffee.org) idea, pair programming as a spectator sport, and presentations in the office to talk about who is working on what.

Jenny Duckett from GDS also did a talk that focussed on cultivating a culture of learning, through teaching people how to run workshops to share knowledge. The message being that you as an individual can begin to encourage a culture of learning. If you're interested, the slide deck from Jenny's presentation can be found [here](https://speakerdeck.com/jennyd/encouraging-a-culture-of-learning-across-your-organisation).

Other Open Space discussions focussed on diversity and inclusive culture, and psychological safety. This is something that there is a big focus on at Sky Betting and Gaming and so it was great to learn how other companies address diversity and inclusivity in their cultures, and share details of our own work to make Sky Betting and Gaming a more inclusive place to work.

## Notable highlights

* Ken Mugrage's talk on continuous delivery made a compelling case for pushing your branch to master every day through the use of features switches. We make extensive use of feature switches at Sky Betting and Gaming, but nowhere near the degree to which Ken was advocating. Other development and release anecdotes included [Facebook's dark launch of usernames](https://www.facebook.com/notes/facebook-engineering/hammering-usernames/96390263919/) and the revelation that Snapchat put 1% of their live traffic through their staging environment

* My Open Space suggestion to talk #chatops was selected. It was great to talk to other teams that used Slack, and learn about their integrations and operational procedures. For example, at Sky Betting and Gaming we create a new channel should an incident require it, so we have a full timeline of events automatically generated.

* Schlomo Schapiro covered "hands-off" in both an Open Space and a talk. The Open Space looked at exactly how automation can be safely used for all operations in [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete). The argument being whether you are truly automating CRUD if you can't delete your entire estate. It was a very interesting discussion, with many conflicting opinions and a lot of blurred lines. The conversation about "hands-off" as a follow-on to Devops continued in his talk the next day. The summary of this talk was "root for all, or root for none". He put forward that in a Devops environment, developers and ops staff should have the same access. Either all have root, or you embrace "hands-off" operations.

I was able to attend the conference because of the Tech Ninja fund that Sky Betting and Gaming offer to staff. I learned a great deal, and found myself asking many questions during the conference such as "how can Core Tribe integrate this into our ways of working?", "which amazing Slack integration shall I talk about next?", and after a few Paulaners, "it's 2am and I'm in Berlin. Where am I staying and how do I get there?"

If you're interested in a career with Sky Betting and Gaming, head over to our [careers site](https://www.skybetcareers.com) for more information about the company, and to see our current vacancies.
