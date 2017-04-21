---
layout:     post
title:      Ops Testing for Kafka
date:       2017-04-28 09:00
summary:    Some tools we use to test Kafka connectivity and ensure messages can be delivered.
category:   Data
tags:       kafka
author:     alice_kaerast
---

Building Kafka is becoming ridiculously easy for anyone to get running these days, but it can be hard for ops people to check it's actually working when they're not also engaged on the development side of actually using the cluster.  There's a few helpful tools that we've come across recently that help here.

Using these tools to publish random messages to topics that are being used in production is probably not a good idea, stick to test instances or your own topics for testing them.

## Kafkacat

The GitHub project describes [kafkacat](https://github.com/edenhill/kafkacat) as "a generic non-JVM producer and consumer for Apache Kafka >=0.8, think of it as a netcat for Kafka."  This is a great description, and undersells the main reason for using it.  Because it doesn't require Java on the server it runs on, you can use it on very minimal VMs where other services are running.  For people who already understand commandline tools, it's a really nice way of showing somebody that your Kafka cluster works with some plain text messages.  Use it to list topics, produce messages, and consume messages.

## Avro Generator

[Landoop's Avro Generator](https://github.com/Landoop/landoop-avro-generator) is a tool we've only recently come across.  The Confluent stack of Kafka software largely expects Avro messages which you can't easily send using something like Kafkacat, which is where this tool comes in.  It generates a large number of messages in varying Avro formats and publishes them to a number of fixed topics - integrating with the Confluent Schema Registry.  A random data generator in Avro format if you will.

## Kafka's Console tools

Let's not forget Kafka's own tooling.  Whilst they can be a little more awkward to use than the above tools, they generally do the job and are usually installed in places where the Kafka server is.

