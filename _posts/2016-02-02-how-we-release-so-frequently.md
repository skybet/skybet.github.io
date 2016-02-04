---
layout:     post
title:      How We Release So Frequently
date:       2016-02-02 14:41:00
summary:    We release our code several times per day with no planned outages. Here's how.
author:     tom_hudson
category:   Deployment
tags:       deployment, database migrations
---

At Sky Betting & Gaming we release new versions of our code several times per day with no planned outages.  Our production environment is large and varied, but I want to focus on how we release software to our LAMP-like stack.  I say 'LAMP-like' because although several years ago we were using a traditional LAMP stack, we've added other technologies as needs arise: like redis, Node.js, and MongoDB. At its heart though, there are still servers running Apache and `mod_php`, talking to a variety of datastores and APIs.

Our release process looks a bit like this:

* A release package is built and tests are run against it
* The package is copied to an NFS share
* Database migrations are run
* The Apache docroot is atomically switched to the new package

All of this happens with the click of a single button in a Jenkins UI and takes about 10 minutes: the majority of that time spent running tests. We have a *lot* of tests: unit tests, integration tests and full stack tests all provide value in their own way, so we have plenty of each. If run sequentially they would take well over an hour to run, so we break them down into smaller chunks and run them all in parallel on a dozen or so Jenkins slaves.

If that doesn't sound very impressive, that's because it's not. There's plenty of room for improvement speed-wise (can you ever really have enough Jenkins slaves?), and certainly having a reasonably quick build process can go a long way toward having more frequent releases, but it's not the whole story.

The main reasons we can release so often are mostly convention.

## Forward-only Migrations

We don't roll back database migrations. Ever. Technically we *could* - but we haven't had a need to for at least four years now.  That's because every database migration we do results in a schema that's compatible with the new version of our code *and* the previous one. If we have to roll back a code release (that *does* happen sometimes) then the previous version is perfectly happy using the new version of the schema.

How we acheive this isn't with some magical technical solution, but purely by convention. Take dropping a column as an example; how do you release that change? Easy:

* Release a version of the code that doesn't use that column; ensure it is stable / won't be rolled back.
* Do a second release that has a migration to remove the column.

It's really that simple. Dropping a table works the same way: stop using it in one release and drop it in the next.

Not all changes are that simple though. If we wanted to rename a column, we'd most likely need:

* A release that adds a new column with the new name, changing the code to write to both columns but still read from the old one
* A batch job to copy data from the old column to the new column, one row at a time to avoid too much locking
* A release that reads from and writes to just the new column
* A release that drops the old column

Three separate releases and a batch job to rename a column sounds like a lot of work, but it's not something we have to do often, and it gives us much more confidence around being able to roll each release back.

## New Code != New Features

Customers should never notice a code release, unless perhaps there's a dramatic improvement in performance. It's a really bad experience for customers to see a new feature appear, start using it, and then have it disappear a few minutes later as a release is rolled back - possibly for unrelated reasons.

Every new feature is first released in a hidden state, ready to be turned on with a 'feature toggle'. The feature toggle can be turned on per-session, allowing the new feature to be fully tested in the live environment long before a customer ever sees it. There are some really strong plus points to this approach:

* We don't have to roll back a whole release (which may contain several changes) just because a single new feature isn't working
* We can fully test new features in an environment that has the exact hardware, software and data we need
* We can release new features to customers gradually

That last point is pretty important. If we're not sure a new feature can take the strain of all of our customers hitting it at once, we can release to a small fraction of our customers first and monitor its performance.

We assign each new session a random number between 1 and 100 and store it in a long-lived cookie; using that number to seperate the sessions into groups. If we had, for example:

* `1-10: risky-new-feature`
* `11-100: control`

Then about 10% of sessions would get `risky-new-feature`, and the rest would see no change. If everything's looking OK we might change the banding so that 50% of sessions get `risky-new-feature` instead; and later - when we're *really* confident everything is fine - shift it to 100%.

It can still be quite jarring to have a new feature just appear part way through an existing session though, so we use another trick to smooth things out. As well as the long-lived cookie that stores the random number, we use a session cookie to 'stick' people to the groups that were defined when their session started.

If a session is completely new then we:

* Assign it a random number and store it in a long-lived cookie
* See what groups match that number
* Store those groups in a session cookie

For all subsequent requests in that session we will continue to respect those same groups, even if we change the banding so that the random number is no longer in that group. Once the user's session has expired the session cookie goes away; so only the random number cookie will be present
in any future requests. Those requests with just the random number cookie follow the same process as before, except we don't assign a new random number.

The upshot of all of this is that customers don't see jarring feature changes part way through a session, and they will most likely see the same features when they come back for their next session.

## Small Releases

With fast builds, lots of tests, less risky database migrations, and feature changes decoupled from code releases: there's not much standing in the way of us releasing our code often, but there is a feeback loop here that helps us even further: the more often we release, the smaller the releases can be. Smaller releases carry less risk, letting us release even more often. Frequent releases don't necessarily imply small releases though - it still requires a bit of convention.

Our development happens in git feature branches, and there's *technically* nothing stopping us from having very long-lived feature branches that result in very large - and therefore risky - releases. What's needed is the discipline to release code not when it's *finished*, but when it *won't break anything*. It can feel unnatural at first, but it can go a long way toward reducing the 'release anxiety' that many people feel.

Another thing that happens when you start to release more often is that you begin to feel any little pain points in your release process a lot more. A manual process you only perform once per month is something most people
will just grin and bear; but when it's several times a day: not so much. All of those niggly little problems that you just put up with at the moment will start to become big problems - and that's a good thing: big problems get
prioritised and fixed.

It sounds obvious, but doing something more often is a great way to get better at it.
