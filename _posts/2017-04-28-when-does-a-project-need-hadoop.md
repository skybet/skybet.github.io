---
layout:     post
title:      When does a project need Hadoop?
date:       2017-04-28 12:00
summary:    When should you use Hadoop in your big data project?  Alice takes a slightly tongue in cheek look at when you should and shouldn't use Hadoop.
category:   Big Data
tags:       Data
author:     alice_kaerast
---

When an IT project deals with any form of state it's pretty obvious that it needs a datastore.  There was a time that this was a traditional RDBMS, usually from whichever vendor the company most favored at the time - be it a commercial system like Oracle or an open source one like postgresql.  Then came along the nosql stores like Redis and Mongo, and because they were trendy they started being used to store all this data that traditionally went into databases.  But now Big Data is the buzzword of the day, so putting your data into Hadoop is the done thing.

But there's a reason that big data conferences are removing the word Hadoop from their name, and it's not always the right solution for your project.  So lets take a look at when Hadoop does make sense.

## ✔ Because you want to operate on large datasets

I know you think you have a lot of data, but do you really?  Is it actually big enough to justify spending the time and energy on maintaining a complicated distributed system?

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">When not to use Hadop <a href="https://t.co/7uvJFWE3mG">https://t.co/7uvJFWE3mG</a> <a href="https://t.co/4NU8iKugjH">pic.twitter.com/4NU8iKugjH</a></p>&mdash; Alice in wanderland (@AliceFromOnline) <a href="https://twitter.com/AliceFromOnline/status/836157143485153282">February 27, 2017</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

If you need to work on datasets much larger than 100GB then yes, you probably do want to look at Hadoop.  Or at least a standalone Spark cluster.

## ✔ Because you want to archive lots of data

Again, you need to define "big" here.  You also need to question whether you actually need to keep this data, whether you need online access to it, and whether you legally should be keeping this data.

That said, BT found that their <abbr title="Total Cost of Ownership">TCO</abbr> of data in Hadoop's HDFS was much lower than their traditional storage.  And this is only going to improve as Hadoop 3.0 introduces data erasure encoding.

## ✖ Because you have lots of fast moving data to process

No.  Just no.  Hadoop is simply not designed to cope with streaming data, not at scale.  Spark's "streaming" is really only microbatch, and other frameworks such as Flink don't need Hadoop to operate.  By all means store the outputs in Hadoop (bearing in mind the writes will happen in batches), and feel free to run some small-scale streaming on your existing Hadoop infrastructure, but don't introduce Hadoop just to run streaming.

## ✖ Because you want to use HBase

This might be ok, but it's a pretty complicated setup just to run a fast datastore.  Have you considered Redis if your data is small, or Cassandra if it's bigger?  For real-time temporary data storage we have found that local Kafka KTables or RocksDB far outperform HBase.

## ✖ Because all the cool kids are using it

This is a terrible reason to pick a technology and besides, it isn't true.  A few years it may have been the cool new thing, but all the cool kids are now working on streaming-first architectures and only writing data down to Hadoop later on (if at all).

## ✖ I got sent on an expensive course to learn it

That's great, you're learning new things.  And the more you learn the more informed decisions you can make.  But it isn't in itself a reason to use Hadoop.

## ✖ That's where the jobs are

Whilst it is currently very difficult to hire people with Hadoop experience, there are moves to use those people to migrate away from Hadoop and onto lighter microservice architectures - using Hadoop only for long-term storage and processing.