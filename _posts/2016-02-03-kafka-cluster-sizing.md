---
layout:     post
title:      Kafka Cluster Sizing
date:       2016-02-03 12:00
summary:    We're starting to use kafka for a number of projects.  We can start off on virtual machines on our shared VMWare cluster, but we expect the disk IO to soon reach levels that will make it unsuitable for running on our shared storage.  This post looks at some techniques for sizing up a physical kafka cluster. 
category:   Big Data
tags:       kafka
author:     alice_kaerast
---

We're starting to use kafka for a number of projects.  We can start off on virtual machines on our shared VMWare cluster, but we expect the disk IO to soon reach levels that will make it unsuitable for running on our shared storage.  This post looks at some techniques for sizing up a physical kafka cluster.

Let's start by taking a look at some of our busiest but realistic streaming data, our LAMP application logs.  It's generally understood that the busiest day of the year, particularly for peak traffic, is the Grand National.  We still have logs from this day on an NFS share, so we can load it into Hadoop to look at peak throughput.

Once the data has been loaded into HDFS we can use the spark shell to look at the data.

~~~scala
val timeRegexp = """[0-9]{2}:[0-9]{2}:[0-9]{2}""".r
val gnLogs = sc.textFile("/user/kaerasta/gnlogs") 
val logTimes = gnLogs.map(line => timeRegexp.findFirstIn(line))
val timeFrequency = logTimes.countByValue
val maxTime = timeFrequency.maxBy(_._2)
// maxTime: (Option[String], Long) = (Some(15:16:50),4931425)
val peakLogs = gnLogs.filter(line => line.contains("15:16:50"))
peakLogs.saveAsTextFile("/user/kaerasta/peaklogs")
sc.parallelize(timeFrequency.toList).saveAsTextFile("/user/kaerasta/logs_per_sec")
~~~

This gives us two files on HDFS, the logs for the busiest single second and a count of the log lines per second.

~~~bash
hadoop fs -du -h -s peaklogs
# 1.3 G (uncompressed)
hadoop fs -text /user/kaerasta/logs_per_sec/* | sed 's/(Some(//g;s/)//g' | sort > sorted_logs_per_sec.csv
~~~

So we've written 1.3 Gb of data in a single second at the peak time, but is this a spike or are we seeing this level of traffic for an extended period?  For this we turn to R, having done a little tidying of the data with sed.

~~~R
sorted_logs_per_sec <- read.csv("~/sorted_logs_per_sec.csv", header=FALSE)
sorted_logs_per_sec <- sorted_logs_per_sec[2:length(sorted_logs_per_sec[,1]), ]
time_x <- seq(1:length(sorted_logs_per_sec[,1]))
plot(time_x,sorted_logs_per_sec[,2], type='l', col=3)
~~~

![Log spike](/images/Rplot-log-spike.png)

We can see this is one single huge spike, so can probably cope with designing the cluster for lower levels of traffic.

We now need some numbers for our cluster sizing model, built using the [Cloudera Kafka reference architecture](https://www.cloudera.com/content/www/en-us/resources/datasheet/kafka-reference-architecture.html).  We're going to use a replication factor of 3 because this is data we care about, we've seen a write rate of 1300 MB/sec at peak, and we're guessing 15 consumers.

Putting those numbers into [our model](http://www.getguesstimate.com/models/3389) gives us an expected cluster-wide disk throughput of 16000 MB/sec and a cluster-wide memory requirement of 40 Gb.

To enable patching and give us high availability we've been assuming an initial cluster of five servers.  Assuming the load is spread fairly evenly we need to cope with 3200 MB/sec per-server and 8GB memory per server.  Our infra team aren't too worried about these numbers, and offer to put some numbers together for us.
