---
layout:     post
title:      Board Assistant
author:     dan_rooke
date:       2015-10-01 13:13:37
summary:    Scrum/Kanban Board Assistant - solve those physical and virtual board synchronisation issues!
image:      boardAssistantDemoPreview.png
category:   Agile
tags:       android, kanban, scrum, synchronisation, jira
---

# The Problem

At Sky Betting & Gaming each of our squads use both a physical and a virtual [Scrum](https://en.wikipedia.org/wiki/Scrum_(software_development)) or [Kanban](https://en.wikipedia.org/wiki/Kanban_(development)) board. The physical boards are used for daily standups and act as an information radiator for the team and any interested stakeholders. The virtual boards are used for creating a unique reference for a story, adding detailed description information, for integrating with version control systems and code review tools and recently the historical workflow data contributes into our accounting systems. With two different boards it is easy to run into synchronisation issues.

# Introducing... Board Assistant

Board Assistant is an app which aims to help solve this problem and somewhat bridge the gap between the physical and virtual worlds. Using [NFC](https://en.wikipedia.org/wiki/Near_field_communication) tags on the physical board with the Board Assistant app provides an easy way to update a story's virtual status and assignee.

A demo of how easy it is to update two tickets on both boards:

[![Board Assistant Demo](/images/boardAssistantDemoPreview.png)](https://youtu.be/_SGyKn6HLwE "Board Assistant Demo")

Quite nifty, I hope you agree!

# How does it work?

Virtual boards are powered by [JIRA](https://www.atlassian.com/software/jira) here at Sky Betting & Gaming and fortunately JIRA provide an API which allows us to programatically update and assign JIRA tickets.

The Board Assistant app is an Android app and requires an NFC enabled device to run, the idea is to have such a device located next to the Squad board at all times for the team to use. NFC tags are added on the column headings, avatars and the story cards on the physical board ready for the app to scan/tap. Each NFC tag stores some data identifying the column, avatar and ticket for the app to read with a scan/tap.

The app then needs to collect the relevant pieces of information needed to update a JIRA ticket, just three scans/taps, and makes the relevant JIRA API request, after which the app resets ready for the next update.

# Are all squads using it?

We have just trialled Board Assistant on one of our squad boards and after receiving a good reception we have just rolled it out for another two squad boards.

We have given a demo to all squads now and we hope to be rolling it out to the remaining squad boards over the coming weeks.

# And what does the future hold?

As a gambling company we'd love to know the answer to that one! For the Board Assistant, we will likely see some improvements:

* Quick access to further detail for a ticket
* Chromecast the ticket detail to TV for use in stand ups
* Easy way to specify weekly targets, which tickets should be in which columns by the end of the week?
