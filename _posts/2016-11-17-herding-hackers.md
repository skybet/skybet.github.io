---
layout:     post
title:      Hacker Herding - Ten Lessons Learned From Launching a Bug Bounty Programme
author:     dan_adams
date:       2016-11-17 11:00:00
summary:    Lessons learned from operating a bug bounty programme, and some tips for launching your own
category:   Security
tags:       security, hacking, bugs, vulnerabilities, exploits, bounty
---


At Sky Betting & Gaming, we launched a bug bounty programme 7 weeks ago. Bug bounty programs (offering cash to individuals in return for reporting security vulnerabilities) are nothing new, having been around since 1995. But they have seen an explosion in popularity lately and I think the lessons that we have learned operating our own bug bounty programme can help others who are looking to take their first steps towards operating their own programme.

## Tip 1 - Clarity of Vision
People want to get involved in bug bounty programmes, but they need very clear guidance on the programme's scope, reward structure, eligibility requirements, and agreed disclosure process. It is essential to clearly define these in order to prevent any *expectation gaps* from forming. 

## Tip 2 - Timebox Triage
It is unlikely that managing a bug bounty programme is going to be your sole responsibility in an organisation. Its essential therefore in order to keep to pre-agreed SLAs (and deliver on those hacker expectations) to clearly delineate and set aside time dedicated to triaging and progressing vulnerability reports.

## Tip 3 - Taxonomy for Fun and Profit
Very soon you are going to be wanting to provide reports to management on how the bounty programme is progressing. Scrabbling to piece this information together manually is going to rob you of time and become a real ongoing burden. Its much better to spend the time up-front, carefully logging and recording each and every vulnerability and its attributes - what's its CVSS score? What's its CVE/CWE category? What system does it impact? Who is the system owner? When was it reported and when was it triaged and closed? Record absolutely everything, and then providing any custom report you want is a breeze. You'll thank me later.

## Tip 4 - Know your bottleneck(s)
Running a bug bounty programme isn't just about getting people to report bugs. In fact that's not even a very significant part of a bug bounty programme. The vast majority of your time is going to be spent verifying, triaging and onward-reporting bugs for remediation, and answering queries from current and prospective hackers. The vast majority of a bug report's lifecycle is going to be spent with it (from the hacker's perspective) not progressing, and a hacker sat drumming his fingers waiting for a response and resolution. Hours can feel like days to the reporting hacker if he's waiting on confirmation that his bug has been received or fixed. You're going to need a slick bug triaging system agreed and in place, and a good downstream workflow and commitment from tech teams to fix vulnerabilities fast. Find out where your organisation's bottlenecks are and try and get focus on these areas. (Fixing bugs fast also prevents dupe reports and hacker frustration).

## Tip 5 - Start small, start slick
Its easy to get tempted into starting a large public bounty programme, but I would strongly advise you to smart small and scale slow - try testing the waters with an internal/private bug bounty programme, or a fixed PoC/pilot with a set bounty pot and a small number of hand-picked hackers. Its also vital to have a dedicated budget agreed and put aside, with the ability to quickly clear funds. Since no pot of money is infinite, its important also to limit your exposure somehow and maintain control over likely expenditure. It may be a good idea, at least initially, to run for a defined trial period, or structure your programme around bursts, sprints or "seasons" so that you have an on-season and an off-season for bug hunting, giving you time in between to clear down vulnerability backlogs and ready for the next onslaught.

## Tip 6 - Keep your hackers happy
Your hackers are an amazing resource. And they're all people, each of whom have slightly different motivations, methods of engagement, bug reporting style and expectations. If you run a bug bounty programme, you're going to swiftly recognise that its not about bug management, its about people management. The launch of a bug bounty is an amazing way of engaging with other teams throughout your organisation on a positive basis and building a security-focused community. No longer are you a cost centre or the team that likes to say "no", suddenly you're the source of bountiful rewards! This can be a real boon that you can build upon.

## Tip 7 - One touch
Templates. Just templates. You're going to need to manage large volumes of tickets and find yourself making the same statements over and over. Save your sanity and as soon as the trends become clear write a few, high quality boilerplate responses for different scenarios. Run them past your teammates, hone them, and use them.

## Tip 8 - Management lives matter too
Its easy to get swept up in the enthusiasm of operating a bug bounty programme but there may be a long list of people that you need to get support from for buy-in both at launch and on an ongoing basis. Are senior management happy at the increased risk profile of operating a bug bounty programme? What about your external comms team? Legal teams? How about your product owners? Do your network team know why they're seeing a sudden uplift in XSS probes on the web application firewall? Have you made your compliance teams aware? You're going to want to engage various teams early as possible, and feed back with the wonderful metrics you're gathering (see Tip 3) regularly.

## Tip 9 - Partner Up
Stick to what you're good at and don't try and do everything yourself. Dedicated bug bounty management platforms such as HackerOne (www.hackerone.com) can prove invaluable. They're not free but they offer solid tooling as well as guidance on programme operation and services such as mediation of any challenges or disagreements with hackers.

## Tip 10 - Root cause analysis
Once you've been running your bug programme for a while and gathered lots of lovely data (see Tip 3) you'll get definite bonus points for going to the next step and instead of just fixing vulnerabilities starting to ask *why do we have these vulnerabilities?*. Analysis of a single ticket in isolation isn't particularly meaningful but analysis across your entire data set may well show up common causes or vulnerability types, which you can examine for root causes - behaviours of processes in your organisation that are leading to the creation of vulnerabilities. Sort these and you can prevent vulnerabilities being introduced in the first place, which is surely the ultimate goal. Even if it means your top hackers may not get the last few hundred dollars they need for that new boat they've had their eye on.
