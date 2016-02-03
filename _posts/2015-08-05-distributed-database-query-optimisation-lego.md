---
layout:     post
title:      Distributed Database Query Optimisation with Lego
author:     alice_kaerast
date:       2015-08-05 15:45:00
summary:    Lego based notes from a workshop on Hive, going from basic unpartitioned tables through to partitioned Impala tables with stats computed and backed by parquet.
image:      lego-partitioned.jpg
category:   Data
tags:       workshops, hive, hadoop, parquet, visualisation
---

Our Head of Data Technology Rob Tuley recently gave a presentation on how data is like Lego – blocks of data which people want to use and join together. Since then this analogy has taken on a life of its own and workshops have taken on a Lego theme. The most recent was workshop on Hive, going from basic unpartitioned tables through to partitioned Impala tables with stats computed and backed by parquet.

Take a bucket of bricks and pour them onto tables, one table for each Hadoop cluster depending on number of people and bricks. Assign an individual to be the end-user querying the cluster. The rest of the team are worker daemons and assigned the task of running the following SQL query:

~~~sql
SELECT round_dot FROM lego_bricks WHERE color='orange' LIMIT 30;
~~~

This will take a while, and already we notice interesting things around data locality and idle workers; piles of coloured bricks start appearing which not everybody can reach easily, so they start moving around instead of passing bricks to their neighbouring workers. The room layout means the end-user is closer to one table of developers than the other, we suggest this is a problem with the network configuration and get people to move.

![Shuffled Lego](/images/lego-shuffled.jpg)

Then we create a partitioned table by having all the workers sort the bricks into separate color piles. Workers who appear to be having too much fun get taken away and restarted, leaving others to take on the rest of their work. We've yet to come up with a way of demonstrating multiple copies of data in HDFS, but we can clearly see that we don't need every server to be up in order to run.

If we use the original query against this partitioned table it's a lot more efficient, and we need to use a lot fewer workers. In one cluster we noticed a single worker was counting out 30 bricks, which took a lot longer than the other cluster where everybody counted out 10 bricks and the first three to complete handed over their bricks.

![Partitioned Lego](/images/lego-partitioned.jpg)

We then insert the Lego into a parquet table. Parquet is columnar storage, so we stack our round bricks together and attach them to a base plate. Solid rounds are integers – customer value, transparent rounds are strings – customer gender. Each base plate has multiple columns of bricks – one for each field in the table. We then create a parquet file index, a small post-it note on each base plate so that we know what's in the file. Selecting the data from this is a little slower than expected, mostly because we're working with such a small number of bricks.

Now we compute the stats for each table. Identifying partitions by color, we count the number of files per partition and the number of rows per partition as well as the distinct values per column. Each partition has details on a large post-it note, which is passed to a single person who operates the metastore.

After computing stats, we have somebody insert a couple of records on each cluster so that we're forced to actually hit the data instead of just returning stats. Querying the table now involves going to the metastore to ask where the data we need is, and then only reading from the partitions and files we need.

![Lego Metastore](/images/lego-metastore.jpg)

We can demonstrate that `SELECT *` is less efficient as selecting specific columns. Instead of picking individual columns from baseplates, we have to take all of the columns from the baseplates and put them back together in a more row-orientated format. We suggested everybody go away and play with the parquet-tools commandline tool to better understand this and the parquet format in general.

So we've learnt that partitions, parquet file format and stats make a huge difference to how queries run and we've had fun in doing it. Hopefully we've inspired the team to think a little more about how data is arranged in Hadoop, and given them some Lego to play with during break times.

For future sessions we can cover spilling to disk, the limits of the gzip codec, table locks, Yarn container spin-up time. Anything which affects the performance of a distributed database system can be demonstrated using Lego...
