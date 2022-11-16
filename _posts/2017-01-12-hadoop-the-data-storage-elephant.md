---
layout:     post
title:      "Hadoop: The Data Storage Elephant"
date:       2017-01-12 12:00
summary:    Outline of how Hadoop works and how it is used at SBG
author:     former_employee
category:   Data
tags:       big data, hadoop, RDBMS
---


![Hadoop Logo](https://qph.ec.quoracdn.net/main-qimg-72801635cd370644216413122d826044-c?convert_to_webp=true)
Photo credit: Google


## What is Hadoop?

Apache Hadoop is an open source framework designed for the processing of large amounts of data. It is written in Java and comprises two parts, the storage part, the Hadoop Distributed File System (HDFS) and the traditional processing part, called MapReduce. There are also other processing engines available such as Spark. Many medium to large businesses (including Sky Betting and Gaming) use Hadoop in order to manage their data, as the Apache Hadoop software library offers an easy way to process large data sets across clusters of computers using relatively simple programming models.


## Can Hadoop replace traditional databases?
In short (at the moment at least) no. Hadoop can complement existing relational databases ( or RDBMS) as it has a limited ability to ensure valid input records that conform to the database design or schema.
At Sky Betting and Gaming, we use both a Hadoop cluster and Oracle as a presentation layer. Hadoop is used as a sort of big calculator that crunches the numbers. Oracle is the SQL based front facing system that exposes data to the business.
What does Hadoop offer that RDBMS can’t?
Hadoop is easily scalable and can thus handle increases in memory usage. It can handle applications on thousands of nodes involving thousands of terabytes of data. Furthermore, it offers flexibility. Businesses can easily access new data sources and tap into different types of data (both structured and unstructured) in order to generate value from that data. At Sky Bet we use this in a variety of ways, most notably in an algorithm which helps us to identify problem gamblers and prevent them from using our products excessively.


## Resistance to failure
One notable advantage of using Hadoop is its tolerance to failure. A Hadoop cluster consists of nodes. When data is sent to an individual node, it is also replicated to other nodes in the cluster. This means that in the event of a node failing, for example, a system can still function as normal as there is another copy of that data set available for use. This is crucial in a world where customers expect both integrity of their personal data and reliability of the systems that they use.

## Simple Model Of Programming
Hadoop MapReduce is based on a simple programming model, as alluded to earlier. This allows programmers to develop programs with ease, as the function of MapReduce is essentially data input and output. In fact, if you know some basic batch processing then MapReduce should seem familiar — you collect data, perform a function on it and then put it somewhere else. The difference with MapReduce is that the steps are slightly different and you are performing the steps on terabytes of data at one time.



## Cost Effective Data Storage
The last but perhaps most important advantage for businesses is the cost effectiveness of Hadoop. Traditional relational databases are prohibitively expensive to scale. Before the advent of Hadoop this may have forced companies to down scale their data and make assumptions based on what data was the most valuable. This approach may have worked short term, but when business priorities changed this meant that the raw data set was not available.
Hadoop provides a unique way to make sense of the terabytes of unstructured data that us humans create everyday. If that wasn’t enough to convince you of its merits, then look at this cute little yellow elephant!

![Hadoop Logo](https://qph.ec.quoracdn.net/main-qimg-72801635cd370644216413122d826044-c?convert_to_webp=true)




