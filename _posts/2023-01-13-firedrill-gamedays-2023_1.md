---
layout:     post
title:      FireDrill GameDays at Sky Betting & Gaming
date:       2023-01-13
summary:    Running GameDays at SB&G and the lessons learned
category:   Operations
tags:       devops, chaos engineering, fire drill, testing
author:     paul_whitehead
---

## The FireDrill GameDay

Here at Sky Betting & Gaming we’ve have great success running [fire drills](https://sbg.technology/2018/05/04/firedrills-in-core/) against our production system. By running these failure scenarios we have been able to increase confidence in our ability to support live service, enhance knowledge amongst support staff and highlight weakness - be that with services themselves or our support processes. 

Looking to build on this success, I put I put forward the idea of running similar events pre-go-live in the form of a GameDay. The aim was gain similar learnings but by doing it prior to the system going live we sort capture issues in their infancy, before they have chance to impact customers, and help make a judgement call on the services readiness to go-live - thus the “FireDrill GameDay” was born. In this post I summarise some of key elements that made these events a success and highlight some of the lessons learned from running these over the last two years. 

A FireDrill GameDay brings together two activities in Chaos Engineering :

* GameDay: purposefully creating major failures with goal of increasing reliability. Typically, they last between 2-4 hours and involve a team of engineers who either develop an application or support it. Ideally, though they involve members from both sides of an application - dev and support.
  
* Fire-drill: routine and random testing of the failure modes of what you build and the processes you use to support and secure what you have built. Deliberately disrupt part of a functioning system to see whether, and how, it recovers.

A Firedrill GameDay is essentially just a GameDay run using the format of a fire drill so I’ll simply refer to them as a GameDay for the remainder of this post. What makes the format difference from standard fire drills is that they are less formal, have multiple scenarios, and can be performed on live systems or in our case pre-go-live. 

By running these events pre-go-live we aim to:

* Grain greater confidence in the service before they go live
* Inform decision making on service readiness
* Give support personnel exposure to the new service
* Uncover problems with the service and our ability to support it
* Highlight issues with monitoring, alerting, documentation, etc

To ensure success, we found it useful to include the following in regards to planning, execution and conclusion of GameDays : 

### Scope
By defining and being clear on the scope of the GameDay we can ensure that we focus on the correct areas of the service with the appropriate participants. The scope would generally cover all components of a given service but may choose to focus on area's of a service where the risk of failure is high or the state of readiness (to go live) is questionable.


### Participants
Those involved in the GameDay should be notified at the earliest opportunity to ensure they are available. Generally, involvement would be limited to those who are to be responsible for supporting the service and those involved in its development. The support team would primarily be involved in the investigation and resolving of incidents and the development team involved in planning and reviewing outcomes.

Additional participants may be required to organise the GameDay and act as Excon (exercise coordinator) that will run the incidents, though multiple Excon's may be necessary.
Currently, fire drills have a designated SLM (Service Lifecycle Manager) and IC (Incident Commander) and it may be beneficial to ensure these roles are covered off.

### Timetable
In advance of the GameDay publish a timeline of how the day will be broken down so that everyone involved knows where they need to be and when. Ensure that sufficient time is provided to investigate each scenario and attempt to resolve the problem. It is also advisable to have a break in between each scenario to reset the environment and give those running the GameDay a break as well as time to prep for the next scenario.

![Time Table](/images/gameday_image1.png)

### Intro / Overview
Kick-off the GameDay by providing an overview of the days' plan and an overview of the system architecture. This is particularly useful if the target system is yet to go live and the support personnel are unfamiliar with it. Having the architect or lead developer provide the overview may be particularly beneficial as is the provision of links to useful resources such as documentation and monitoring. 

### Scenarios
The failure scenario to be used during the GameDay should devise and tested well in advance. Multiple scenarios should be devised and kept hidden from those involved in resolving the problem on the day. Devising the scenarios should be a team effort involving analysis of the system architecture, with information on issues experienced during development/testing to pinpoint potential problem areas. With a list of scenarios available they should be broken down as shown in the example below:

![Scenarios](/images/gameday_image2.png)

With a list of potential scenarios available, the team should select the best candidates to be taken forward to the GameDay. The selected scenarios should be thoroughly tested in advance to have a clear understanding of how the simulated incident will play out.

Certain scenarios may benefit from simulated transactions being run against the service - possibly under load. This helps make things more realistic, with logs being populated with associated errors/warns and providing a means clear indication of the issue and its consequences.

### Execution
During execution be clear on any rules that might apply e.g :

* This GameDay will take place in the DR environment and be treated as if a live incident though all participants will be aware it is just a test exercise. 
* Responders will be called out using Slack, assuming nothing automatically calls them out
* The Excon may drop hints where necessary and produce updates on the time remaining.

During the exercise, it is good to keep reminding the participants of the questions we are seeking answers to :

* Is system behaviour as expected?
* Do you have the required access to services to investigate?
* Is the monitoring sufficient to detect the problem?
* Do the monitoring dashboards aid insight and investigation?
* Do alerts trigger as required and resolve following the incident?
* Do you have visibility of the logs and did they highlight the issue?
* How good is the supporting documentation e.g architectural, support, etc?
* Are there any issues with the incident management process?
* Are there any area's we can change to improve the supportability of the service(s)?
* Is there a clear understanding of the impact of the incident?
* Does the service recover gracefully with acceptable impact?


### Retrospective
Once all the scenarios have been executed those involved should be given time to take a break and consider any issues encountered especially in response to the questions asked in the previous section. 

A retro board similar to the following may be used to decide which issues are to be fixed now and those which can be left until later:

![Retrospective](/images/gameday_image3.png)

We also made use of a Readiness-O-Meter to get a quick view on where people thought we were in regards to our ability to support the service. 

![Readiness](/images/gameday_image4.png)


## Lessons Learned

Having run several of these events - here are the lessons learned:

* Early involvement is key - start early in the project and get people involved from outset … the GameDay should be treated as a project deliverable in its own right.

* Choose scenarios wisely for maximum learnings on incidents that are may well occur to ensure you provide valuable insights into the service and how service is supported.

* Devise multiple scenarios - not only will you need backups but the more scenarios, the more you'll learn about the service and the greater the potential for uncovering issues

* The GameDay is a complement not a substitute for more traditional forms of Operations Acceptance Testing like failure testing, backup recover, DR testing.

* During the exercise keep don't loose site of the end goal - keep reminding the participants of the questions we are seeking answers to e.g. Is system behaviour as expected? Are there any area's we can change to improve the supportability of the service(s)?

* Make time for a closure type event and associated activities ensuring that nothing should get left unresolved and without an owner.

* Finally, the day of the GameDay is just a part of it - as important are the conversation, analysis and testing that happen in the lead up.
