---
layout:     post
title:      DevopsDays Paris 2015
author:     andy_burgin
date:       2015-04-20 11:39:30
summary:    We sent senior DevOps engineer Andy Burgin to DevopsDays Paris to find out about the latest ideas and innovation in the DevOps community.
image:      devopsdays-paris-3.jpg
category:   Devops
tags:       systems, linux, unix, microservices, ansible, puppet, chef
---

We sent senior DevOps engineer [@andyburgin](https://twitter.com/andyburgin) to DevopsDays Paris to find out about the latest ideas and innovation in the DevOps community.

### What is a DevopsDays Event?

If you haven't been to a devopsdays event, given the amount of hype around DevOps you might be quite surprised to find that it's still a very community focused event. Naturally there are big name sponsors that exhibit but the event still involves a high level of DIY.

The event is spread over two days, the mornings are formal presentations and the afternoons consist of a short blast of ignite talks and then the organised chaos of Open Spaces – which for the record are the reason to go.

This will sound very familiar to you if you've been to any "agile"" event and that's intentional, the whole DevOps movement began at an agile conference and the format encourages the "everyone is to get involved".

### Day One

The day opens with a welcome speech and a we're straight into a talk by one of my favourite speakers John Willis, as well as being one of Edward Deming's biggest fans and perhaps the most knowledgeable man in the DevOps community, his voice is one that has graced my commute for several years by way of the [DevOps Cafe podcast](https://itunes.apple.com/gb/podcast/devops-cafe-podcast/id371931111?mt=2) – I must admit I'm a little star struck when I speak to him.

#### Keynote: Containers, Germs, and Microservices – John Willis

The title is a play on Jared Diamonds book "Guns, Germs, and Steel: The Fates of Human Societies". John compares the evolution of societies and their growth with how technology companies must leverage the latest tools and practices to stay ahead.

![Speaker shot](/images/devopsdays-paris-1.jpg)

John then spoke about how companies must take advantage of micro services and containers to move compute power to data (aka data gravity) to reduce latency, improve feedback loops and flow – which ultimately leads to competitive advantage.

#### What Happens Without Traction – Steve Pereira

A week before the event I was listening to the DevOps Cafe podcast and the hosts (Daemon Edwards and John Willis) were discussing how hard it is to get DevOps practice adopted at enterprise. There needs here is very different approach to achieve the same objectives in large organisations.

Steve's talk addressed this point giving some great advice about it how justify, measure, encourage and champion DevOps adoption in the enterprise. One controversial piece of advice was not to use the term "DevOps" due to peoples incorrect preconceived opinions. He also gave a link to a very handy 50 question checklist.

#### The importance of Why in DevOps – Boris Feld

In this talk Boris discussed a different perspective on the definition of CAMS (Culture, Automation, Measurement and Sharing). Rather than defining them he asked why they were important.

#### Bizdevops – from Development to the Customer – Sabine Bernecker-Bendixen

Sabine explains some of the difficulties in getting people from different parts of an organisation to work together, she also stresses the importance of getting technical teams to engage with business function and how ultimately that benefits everyone – DevBizOps

#### DevOps Culture at BlaBlaCar – Keep CAMS and grow – Regis Allegre & Nicolas Blanc

This talk explained how BlaBlaCar grew form a startup with a DevOps ethos at its roots. They discussed their development processes and culture, with details of how they value the working environment and staff collaboration.

### Day One Ignites and Open Spaces

The ignite talks usually cover a mix of subjects and this DevopsDays is no exception, from open-source monitoring tools, chatops, cloud infrastructure, salsa dancing and the one I'm presenting how to run a DevOps meetup group. An ignite gives the speaker 20 slides auto advancing after 15 seconds (5 mins total) so there's little room to recover from errors – thankfully mine goes without a hitch and I receive some nice feed back from the attendees.

![Ignite](/images/devopsdays-paris-2.jpg)

Next we move onto what I described earlier as "organised chaos"" and I still think that's fair description of the selection process. The attendees are invited to suggest topics for conversations, these are posted on a board and then everyone votes for their which of those topics they would like to talk/hear about.

![Open Spaces](/images/devopsdays-paris-3.jpg)

The winning topics are then distributed over 30min slots in different areas of the building. I feel quite pleased that two of mine were selected. The three I attended were...

#### Monitoring as code

This discussion focused around the different ways to monitor applications and infrastructure. I'm very pleased to find that SB&G are very much in the "advanced" bracket when it comes to monitoring from alerting, metrics, sharing and business dashboards. But it's interesting to see how some organisations are using log monitoring (ELK stacks etc) to monitor more than just logs.

#### Why Ansible or Puppet or Chef

This turned into quite a heated debate about the selection of an Infrastructure as Code technology. Not surprisingly there were some strong opinions exchanged. The take home was there's no one winner and it just depends on which tool is "right" for the job.

#### Microservices a support nightmare?

I suggested this open space to gauge opinion of micro services. I explained a situation in Bet Tribe where a legacy application was in part being replaced by micro services. There were a number of extremely smart people in the room (including Patrick DeBois) they explained so long as the necessary testing and monitoring was in place it should really help (which we do, the group concluded in my case that there was nothing to worry about (and that we have a great dev team)). The rest of the discussion focused on the practicalities of implementing micro services and how they could simplify development , in some cases they encourage organisational change (anti Conways Law), but they weren't a silver bullet and under some circumstances aren't appropriate (e,g, transactional rollback).

### Day Two

There's no let up in the pace of the devopsdays as we begin the second and final day. We start with the CIO of Puppet Labs giving a non technical talk on psychology.

#### Cognitive Biases and Our Poor Intuitions Around Probability – Nigel Kersten

Nigel explains how our minds make quick decisions really badly, apparently we have two decision making processes. One that quickly analyses problems to reach conclusions, and a second system that makes more considered analytical decisions but is slow.

![DODP Nigel Kersten](/images/devopsdays-paris-4.jpg)

The problem is the first system looks for easy wins and will exaggerate the significance of recent events and tries to connect unrelated events into patterns. This is significant to technical teams in debugging, problem analysis and incident post mortems – all can lead to bad decision making.

#### Designing the Enterprise for Manufacturing – Scott Russell

Scott from Chef describes his experiences of working in IT hardware manufacturing and the relevance to DevOps. It's very much a talk that affirms the work of Demming and Lean manufacturing techniques and their application to CAMS principles.

He covered the importance of understanding your product mix, the flow of work through work centres and the associated issues of WIP backlog. Scott explained how physical production lines had been optimised and explained how different approached to QC vs QA had removed bottlenecks, increasing throughput, all of which Scott argues is relevant to improving flow in the Software Development Life Cycle.

#### Change management at scale: responsible agile delivery – Pierre-Yves Ritschard

ITIL is widely misunderstood in the DevOps community and Pierre gave a great introductory talk on its core components of Service Design, Service Operation and Service Transition.

The talk the focused on how Change Management (part of Service Transition) could also be done on a small scale by leveraging exiting SDLC tools. He argued that RFCs and CAB could be enforced by the use of pull requests and at the most basic level you could use your chat room logs for Change Request records.

#### Making the Elephant dance – Daily deliveries at SAP – Dirk Lehmann

Dirk explained the obstacles he faced when trying to implement continuous delivery of a cloud based project at SAP. He explained how he headed up a team that worked as an internal "startup" in the organisation and how they overcame the obstacles caused by the existing processes and procedures. He then went on to describe how the new processes developed were being used for other cloud based products within SAP to accelerate deliver times.

#### Screwing up for fun and profit – Oliver Hankeln

Oliver described the objectives and format of a post mortem and a number of patterns and anti-patterns. He highlighted the cultural implication of each and the affect on both individuals and the wider organisation.

### Day Two Ignites and Open Spaces

Again a diverse mix of subjects for the ignite talks, today we have a mix of open-source tools such as git-deliver, Jenkins automation, ITIL and a discussion of DevOps as job title. Fortunately I can relax a little and enjoy them as I don't have to take to the stage :-)

The openspaces are organised much swifter today (looks like the delegates have grasped the concept today) and there are a larger more diverse number of topics today. I head off an attend...

#### Spock

This discussion was proposed by one of the ignite speakers who was contemplating if in 2015 there was a role for "DevOps". This has been a long standing point of debate in the DevOps community, that DevOps isn't a job title but more of a mindset/approach, it's the equivalent of having the word "Agile" in your job title, it really doesn't make sense. The conversation tried to define a role that had many facets of DevOps (e.g. release engineering, automation, metrics) and if this hybrid/polygot was really a job title – the conclusion was "it depends".

Unfortunately I then had to leave as my train awaits, so I start the long journey home.

### Conclusion

All in all I had a great time, I met some of the thought leaders in the DevOps field and spoke with a great number of really clever people. Got some great insights into Microservices and food for thought on many other topics. If you wanted me to summarise the event in a sentence "it's all about people".

Videos of the talks are [available on vimeo](https://vimeo.com/album/3410921).
