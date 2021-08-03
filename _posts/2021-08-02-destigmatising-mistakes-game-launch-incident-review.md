---
layout: post
title: "Destigmatising Mistakes: A Game Launch Incident Review"
date: 2021-08-02 09:00:00
summary: Making a mistake can be a horrible feeling. Guilt, shame, fear and anxiety all rolled into one. So in order to try reduce this pressure, I'm sharing a recent mistake our team made.
author: martin_blackburn
category: Incident Response
tags: failure, incident-response, learning
---

We don't often talk about the mistakes we make, whether that's because we feel guilty, ashamed, scared, or something else. So I thought it would be nice to share the one we (GES) made and what we learned from it. Hopefully, this will help reduce the pressure/stigma of making a mistake.

So grab a brew and let me tell you a story...

## What do GES do?

GES are responsible for launching games, primarily on Vegas and Bingo Arcade. We also look after mini-games such as Prize Machine/Unwrap the Cash as well as ensuring [Reality Check](https://support.skybet.com/s/article/Gaming-Reality-Check-Set-a-reminder-for-how-long-you-have-been-playing) works, which is one of our safer gambling tools.

## What happened?

**TL;DR: games worked fine until a user got a error --- then we threw a more critical error making the game unplayable.**

In one of our updates, we made an improvement to some of our error modals, the session expired ones. If there was an error during our pre-launch checks, we would reset the launch config and ask a user to go back to the home page - because we couldn't accurately fix the problem, as we don't fetch the auth tokens ourselves. So by sending someone back to the home page, portals (e.g Vegas/Bingo) could re-auth a user, since we are currently unable to do so.

This passed our reviews and testing - as these were pre-launch errors it was fine to wipe the launch config, since a user cant launch a game anyway.

The problem was noticed once we deploy to live, we were accidentally wiping the launch config on every error, not just the pre-launch ones. As the service is written in react, whenever the gameName prop is changed (which is part of the launch config), we try to reload the game - as you might be loading a new game.

Removing the gameName counted as changing it, so we tried to reload the game. As we have removed the gameName, we now don't know what to load, so an error was thrown.

Lots of things count as an "error" to the game, including insufficient funds - so as soon as any "error" happen the game had to be hard reloaded in order to work.

## How did you first spot the error?

Our monitoring automatically calls us out, but we also watching our graphs when doing a release, so we saw a few seconds before we got the call.

## How did we respond?

At first, we couldn't quickly work out what was causing the error - so we decided to roll back to the last version. This gave us more time to debug the issue and create a proper fix, rather than pushing up a hacky fix, that might not have worked.

The downside to this was that we were going to have to do a bit of cleaning up of git tags and versions.

## How long did the incident last?

We rolled back to the last version within about an hour. This would have been quick, but our rollback job failed. As its only ever been run once before it hadn't been updated for a while.

## Why was it so hard to find the issue?

We don't do small, per ticket, releases like other squads, as we are a service, if we did that then each portal would end up being asked to version bump for each ticket we do. So we bundle up our releases and do them every few weeks to ease the strain on them.

This means our releases can get rather beefy and so was hard to see what small bit caused the issue.

## If you have a large release, how did you narrow down what the error was?

We looked at the overall release and worked out what changed around what we thought was causing the error, and thankfully we were right.

What we _should_ have done was roll back each commit and test to see if the error was there; this would have been much more accurate and would have shown the commit that caused the error.

## What did we learn?

-   Our monitoring and call-outs works :)
-   Our rollback job needs fixing.
-   Sometimes our releases can get a little big, making errors hard to find.
-   We need a nicer way to tidy up a failed release.
-   We are going to leave our release on test/staging environment longer before declaring it good and releasing to live.
-   Having a larger time before merging our release candidate into master, making rolling back easier.
