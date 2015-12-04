---
layout:     post
title:      When Hadoop tools disagree with each other
date:       2015-12-04 20:00
summary:    We recently saw an 8-year spike on one of our graphs recently.  It caused much amusement when it was tweeted out, but there's actually a good story behind this apparent 8-year lag in data processing.
category:   Big Data
tags:       support, hadoop
author:     alice_kaerast
---

![Graph of 8-year spike](/images/8yearspike.png)

The above graph from our datawarehouse system was recently tweeted out, and got some amused responses about 2007 wanting its data back.  But there's actually a good story here, and a chance to look at Hadoop's dirty secrets.

![Sawtooth graph](/images/sawtooth.png)

Picture if you will a graph showing the time between now and the last record to be inserted into a table (similar to the one above).  For a regular batch operation, you'd expect a nice saw tooth graph - slowly ramping up for 20 minutes, followed by a sharp drop to around 5 minutes.  The minimum value is the time it takes for the job to run, the height of the graph is how long between runs.  The graph above shows different batch operations, with different timings.

![Jagged sawtooth graph](/images/jaggedsawtooth.png)

But if we zoom in on that flat portion of the first graph, we don't see a nice clean sawtooth graph, it's actually rather jagged.  To explain that lets look at the process it's graphing.

Data is [sqooped](http://sqoop.apache.org/) into HDFS from a standard RDBMS.  It's then processed in [Hive](http://hive.apache.org/), and finally we perform an insert overwrite into the production Hive table.  But this graph is generated using [Impala](http://impala.io/), the interface that our BI tool uses.  In order for Impala to know about changed data in a Hive table, you need to perform a refresh to update the catalog server's records.  Since the Impala refresh command is out of sync with the imports, we get a jagged sawtooth graph.

But a few times a day you get something worse than that jagged sawtooth graph.  A few times a day the refresh command will run during the Hive import.  This causes bad things to happen.

Whilst the insert overwrite command in Hive is atomic as far as Hive clients are concerned, the file movement into the production area on HDFS can take a few minutes.  So if the Impala refresh command runs during the Hive insert, it will only pick up files that have actually been written - which might be just the very first file, with data from the first few years of the company's history.

And this is the dirty secret.  Whilst you can read HDFS data using Hive, [Spark](http://spark.apache.org/), Impala, [Pig](http://pig.apache.org/), etc. Unless you're using the same tool as the writer, you're bound to hit this sort of problem pretty frequently.

So how do we resolve it?

Well, the first and obvious option is to use a single tool.  Migrate all your pipelines to the same tool that your users read data through - Spark or Impala would be a good choice.  Except Spark is hard for end-users and BI tools to use, and Impala means lots of SQL which is hard to unit test.  Plus people in finance like SQL, whereas data scientists like [R](https://www.r-project.org/) and Spark.

The other option is to copy all of your data into a second storage location, using whatever tool the users use.  We're doing this in limited cases, and it comes with other benefits too.  For instance, queries over the past 12 months work well on [Parquet](http://parquet.apache.org/) files with large partitions whereas the regular moving in and out of small amounts of data works well with smaller partitions and [RCfiles](https://en.wikipedia.org/wiki/RCFile).

In truth, neither of these options are perfect.  But a combination of the two is where we are planning on heading over the coming months.

Of course there is a final option - only give your users access to data which isn't changing. Ie. yesterday's data.  But isn't the whole point of Hadoop that you can give more real-time access to all this wonderful data?