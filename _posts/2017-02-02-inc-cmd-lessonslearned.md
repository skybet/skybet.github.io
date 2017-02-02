---
layout:     post
title:      Lessons Learned for Incident Commanders
date:       2017-02-02 12:00
summary:    Incident command is a reasonably new area of focus for SBG. In a nutshell we have a nominated technical person known as the Incident Commander (IC) who gives direction in order to resolve an incident and restore service as quickly as possible.<br><br>This blog post contains some of the insights and 'lessons learned' by our teams from their experiences in live incidents and exercises (known internally as fire drills) as they work to improve their skills and reduce our <abbr title="Mean time to resolution">MTRR</abbr>.
category:   Incident Response
tags:       Incident management, Incident command
author:     patrick_holmes
image:      peace_war_inccmd.jpg
---

![Incident Room - External](/images/isocon_inccmd.jpg)

Incident command is a reasonably new area of focus for SBG. In a nutshell we have a nominated technical person known as the Incident Commander (IC) who gives direction in order to resolve an incident and restore service as quickly as possible.

This blog post contains some of the insights and 'lessons learned' by our teams from their experiences in live incidents and exercises (known internally as fire drills) as they work to improve their skills and reduce our <abbr title="Mean time to resolution">MTRR</abbr>. The methodology for this is largely forked from O'Reilly's highly recommended [Incident Management for Operations](http://shop.oreilly.com/product/0636920036159.do) book, influences from <abbr title="Search and Rescue">SAR</abbr>/British Army doctrine, with some additions based on some of our experiences across the company.

***

![Incident Room - The Bunker](/images/bunker_inccmd.jpg)

#### DON'T PANIC!
It’s just a computer system and a technical problem that needs solving, the only difference between this and a JIRA story is the manner of approach and doing it with urgency. Take a 'Condor moment' then crack on with systematically triaging your way through the issues and bringing the impacted services back online.

#### The first responder is the first incident commander
The first person on the scene is by default in control of the incident, until more help arrives or they can safely hand it off to someone else. In some cases this may mean they are best raising the alarm rather than immediately fighting the fire, but in all cases they need to focus effort to gain control of the situation.

#### Seize the initiative
Make the mental switch from ‘peace’ to ‘war’ and do not allow the situation and events that are occurring to dictate the pace and direction of the incident. A calm and confident incident commander takes control of the situation and issues clear and explicit directives to their available technical resource in order to triage the incident and drive it towards resolution as quickly and safely as possible with the minimum amount of collateral damage. This is often the difference between a ten-minute incident and a two-hour incident.

#### IC’s do not fix problems
As coordinators of resource the IC should not be at the terminal issuing commands. It is the role of the IC to set the strategic tone for the incident and leave the individual tactics to the subject matter experts at their disposal. In many cases, the IC has the team debate the pros and cons of a particular solution – but the IC makes the final call based on the best available information to them from the <abbr title="Subject Matter Expert">SME</abbr>'s at the time.

#### Have a single point of contact for each tribe/function
In the best case scenario, the single point of contact in a team will be that team's <abbr title="Subject Matter Expert">SME</abbr> who has also trained as an IC, they will understand the same processes the IC is going through and have information on hand before the IC needs it. Often this is the difference between the IC being able to maintain control of an incident or it descending into floods of Slack messages from 10 people in each team which will rapidly overwhelm them, and inevitably slows down the resolution of the incident. Often the fastest way to get the relevant single point of contact for each team is request that they dial into a conference call, people tend to be more reluctant to shout over the IC or others on a call

#### Keep a log
Whether on paper or on a computer. Developing and rehearsing your distributed ways of working and communicating using a tool like Slack will help with this if you keep the channel updated on what is going on. If you have moved your incident response to a conference call you should look to summarise it for the people who are not on the call, in the relevant Slack channel, at regular intervals.

#### Clear, concise communication
While in an emergency incident, courtesy can often take a back seat to resolving the issue and restoring service, this is a matter of priorities and will differ from normal <abbr title="Business as Usual">BAU</abbr> situations. Instructions, objectives and feedback should be delivered in a clear and specific manner, small talk and niceties are kept to a minimum.

- Assigning tasks to a specific person (by name) or function,
- Stating the objective clearly,
- Expecting the receiver to acknowledge and repeat back a summary of the assignment, and
- Giving a specific time to complete the task.

> IC: “Network ops, International tribe are seeing packet loss on their office VPN to the DC. Can you drop off the call, take a look and get back to me at 0915?”

> Netops: “Will do, Network ops on-call dropping off the call to link up International and investigate their VPN, will report back to you in 15 minutes.”

#### Understand battle rhythm
An IC is on a constant running battle between triaging the problem, tasking resources, communicating with customers and stakeholders and considering contingency plans. Regularly recap the situation for the people on the conference call or Slack channel to focus them, this can be done with a CAN report to keep things in a 'standard' format so everyone understands what is going on.

-	Conditions – Current status
-	Actions – What is being done or needs to be done?
-	Needs – What resources are needed or other action items required?

**Note:** Identify who you are talking to at the start of your sentence to get their attention, and use pauses wisely to allow people to digest what you are communicating

For example:

> **C:** “IC: Okay everyone listen in. Let’s take a look at where we are with this incident. Incident has been open for 30 minutes situation as I understand it is that we have narrowed down the problem to the DC firewall blocking access to the International office.”

> **A:** “IC: Network ops have looked at it and are 90% certain that it is a problem with a runaway process on the firewall. They are currently working to fail over the cluster to resolve this within the next 10 minutes.”

> **N:** “IC: I want to keep everyone on the conf call for now until we are certain of the fix. While we are waiting, lets discuss our next most likely root cause candidate and what our plan B will be.”

#### On that subject, have a plan B!
When your team have come up with plan A and are focusing on that you need to be thinking about plan B and C, getting resource lined up to support them and switching assets to support a secondary or tertiary plan when appropriate in a timely manner. Do not be afraid to adapt or change your plans where it is justified to do so. Your main focus should always be on restoring service as quickly as possible and it can sometimes be a tough call whether to ask a team to 'switch fire' to another plan. Where possible have multiple teams working on different plans rather than having a single team context switching to come up with multiple plans.

#### Don’t forget the customer!
Our Service Lifecycle Managers are our IC's interface into our service operations and the customer facing teams, if you don't have this luxury then you can nominate someone to regularly check in with the business and customer stakeholders and make sure you know whether your customers are contacting you.

Don't forget you can proactively use both technical and non-technical resources such as maintenance pages or outage messaging systems and issue either internal or external communications which may help a potential problem from getting worse. Good external communications help your customers understand what is going on without them contacting your customer service teams <i lang="fr">en masse</i> to find out why their account isn't working!

#### If you need more resources or support, ask!
An IC is responsible for driving the resolution of an incident, as such they can ask for whatever resources they require in order to achieve this objective of restoring service. This is not governed by normal ‘peacetime’ structure rules and the rest of the company should support this by whatever means are available. However it worth noting: while it is possible for IC’s to instruct senior directors in an incident they should bear in mind that this should be done respectfully and that they may be asked to explain their reasoning and thought process in a post-mortem at a later date. Bear in mind tomorrow is back to BAU!

#### Practice, Practice, Practice
Practice is the key to getting this right, it's always a fine balance and there is rarely such a thing as a straightforward problem. Your first attempt at incident command will (to borrow a metaphor from <abbr title="Radio 4">R4</abbr>) most likely have all the co-ordination, control and precision of a pigeon trapped in a bottle bank. Your second one will be better, and every time subsequently will be incrementally better as you apply the lessons you have learned. People who have been doing this for 10-15 years will always walk away from an incident with things they may do differently next time. Always factor lessons-learned into a post-incident review (see [Etsy's debriefing facilitation guide](https://codeascraft.com/2016/11/17/debriefing-facilitation-guide/)), share them with the rest of your teams, and let everyone learn from your experience.

Practice with regular fire drills, we aim to run cross-tribe ones weekly for an hour. Involve different teams in rehearsing realistic scenarios and allow your operations teams to build up their working relationships across the company. Following them have a wash-up session, as you would with a live incident, and include as many people as possible to get a diverse set of opinions on how your response could be improved and bring in fresh perspectives.
