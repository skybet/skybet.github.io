---
layout:     post
title:      "How we broke Hadoop by optimising services"
date:       2017-04-26 16:00
summary:    We've been optimising the allocation of services in our Hadoop cluster recently.  It turns out a quiet Hadoop gateway server is a bad one.
author:     alice_kaerast
category:   Data
tags:       big data, hadoop, RDBMS
---

As we grow our Hadoop cluster and the number of teams working on it, our deployment of services has needed tweaking and rearranging.  For a while we'd had scheduled Yarn applications being kicked off on servers which also ran other critical Hadoop services.  On a small Hadoop cluster with a small number of engineers this wasn't a problem, but with a growing number of people working on the cluster it became more obvious that we should have separate edge nodes for the running of jobs.

We had seen a few Sqoop import jobs fail, and had assumed that this was caused by contention on these servers.  So we spent some time considering how services were spread across servers, and then moved them to better spread the load.

What we hadn't realised is that those services were also providing a secondary function - they were providing enough load on the server to generate enough entropy for /dev/random.

Not long after moving these services we started seeing Sqoop exports to Oracle failing almost constantly.

After bringing in DBAs and network engineers to rule out any of their recent changes we finally accepted that reducing load had somehow introduced a problem.

We soon realised this has been seen previously.  The Oracle JDBC drivers use `/dev/random`, and us moving services away from these servers had actually decreased the amount of entropy being generated.  The sqoop jobs were now timing out waiting for enough entropy to be generated for them to make the initial secure connection.

The fix for this should be simple, and involve passing in some Java configuration to use the pseudo random number generator /dev/urandom instead of the true random number generator /dev/random.  However, there's a couple of gotchas here.

Overriding this when running Sqoop doesn't work, it needs HADOOP_OPTS to be set which is overridden by sqoop-env.sh.

Setting the path to /dev/urandom doesn't work.  Historically /dev/urandom didn't work very well, so [a workaround](https://bugs.openjdk.java.net/browse/JDK-6202721) was added to Java that ignored the exact path '/dev/urandom'.  Therefore to actually use urandom, you need to obscure the setting by using /dev/./urandom.

So the final fix was to ensure that HADOOP_OPTS in the sqoop-env.sh file contained `-Djava.security.egd=file:///dev/./urandom`

And that's the story of how we broke Hadoop by optimising service allocation.
