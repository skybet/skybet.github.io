---
layout:     post
title:      So you've been asked to support a Kafka cluster
date:       2017-04-28 09:00
summary:    There can be a gap between the people being asked to support a Kafka cluster and the people who's job it is to produce and consume from it.  In this blog post we aim to quickly get you up and running with a local instance as well as some portable tooling to test it.
category:   Data
tags:       kafka
author:     alice_kaerast
---

Building Kafka clusters is becoming ridiculously easy for anyone these days, but there's often a gap between the people who's job it is to build Kafka and the people who's job it is to produce and consume from it.  In this blog we're going to run through running a local Kafka cluster as well as producing and consuming from it.

But before we get started, we should note that it probably isn't wise to publish arbitrary messages to production Kafka topics unless you know what they do.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">I may or may not be publishing ponies to a Kafka topic for the lols (and a blog post on tooling) <a href="https://t.co/R73sNKI9bu">pic.twitter.com/R73sNKI9bu</a></p>&mdash; Alice in wanderland (@AliceFromOnline) <a href="https://twitter.com/AliceFromOnline/status/855819871531270146">April 22, 2017</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

## Kafka on Docker

It used to be that running Kafka locally required downloading zookeeper and kafka packages, and carefully configuring and running them.  With the advent of Confluent and Docker, those days are over.

Following the [Confluent Quickstart Guide](http://docs.confluent.io/current/cp-docker-images/docs/quickstart.html), let's get Zookeeper and Kafka up and running using Docker.

```bash
# Start a Zookeeper docker container
docker run -d \
    --net=host \
    --name=zookeeper \
    -e ZOOKEEPER_CLIENT_PORT=32181 \
    confluentinc/cp-zookeeper:3.2.0
    
# Start a Kafka docker container    
docker run -d \
    --net=host \
    --name=kafka \
    -e KAFKA_ZOOKEEPER_CONNECT=localhost:32181 \
    -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:29092 \
    confluentinc/cp-kafka:3.2.0
```

Lets also create a topic to use.  You don't need to worry about the meaning of partitions and replication factors just yet, we're just setting them to one to run nicely on a single instance.

```bash
docker run \
    --net=host \
    --rm \
    confluentinc/cp-kafka:3.2.0
    kafka-topics --create --topic foo --partitions 1 --replication-factor 1 --if-not-exists --zookeeper localhost:32181
```

We could continue following this quickstart guide, and you probably should do so at some point to better understand the basics, but lets quickly move on to something a little nicer to use.

## Kafkacat

The GitHub project describes [kafkacat](https://github.com/edenhill/kafkacat) as "a generic non-JVM producer and consumer for Apache Kafka >=0.8, think of it as a netcat for Kafka."  Whilst this accurately describes the tool, it undersells it somewhat.  Because it does not require Java and because it is easy to statically compile, it can run almost anywhere once built.  Build it once locally and just scp it to wherever you want to test Kafka from (assuming the target operating system is similar).

We're going to build this locally to show how easy it is, but modern Debian and Mac OS X with Brew have this in their repositories.

You'll just need curl and cmake installed (in Alpine Linux the dependencies are installed with `apk add alpine-sdk bash python cmake`), everything else is downloaded with the bootstrap script.

```bash
curl https://codeload.github.com/edenhill/kafkacat/tar.gz/master | tar xzf - && cd kafkacat-* && bash ./bootstrap.sh
```

This results in the executable file `kafkacat` being generated, which can be used with the Kafka cluster we built earlier as follows:

```bash
# Post a message
echo "hello world" | ./kafkacat -b localhost:29092 -t foo

# Receive some messages
./kafkacat -b localhost:29092 -t foo
```

Now we could stop here and be satisfied, but it's important to realise that you can pipe absolutely anything you like into kafkacat.  Frequently you'd use it to publish CSV or JSON data, but there's nothing stopping you from publishing something more interesting.

```bash
docker run --rm filia/ponysay "hello world" | ./kafkacat -b localhost:29092 -t foo
```

## Kafka Schemas

By now you should be starting to question whether it's sensible to publish any old messages to a given Kafka topic, and the answer is no, it really isn't.  That's why we have the Schema Registry component of the Confluent stack to ensure that all messages we are consuming conform to the standard (Avro) format that has been defined for the topic.

But adding these restrictions makes it hard to test with kafkacat, because now any incompatible messages will at best be ignored and at worst break our software.  This has put some teams off from using it, instead wanting to be much more flexible with the types of message they post to their topic.  We believe this to be an antipattern that should be discouraged, particularly if the topic is shared across multiple teams.

But there are tools starting to appear which can be used to test your stack with Avro and the Schema Registry.

[Landoop's Avro Generator](https://github.com/Landoop/landoop-avro-generator) is a tool we've only recently come across.  It generates a large number of messages in varying Avro formats and publishes them to a number of fixed topics - integrating with the Confluent Schema Registry.  A random data generator in Avro format if you will.  We'll save the details of using this tool and configuring/using the Schema Registry for a future blog post.

So by now you should have the tools to play around with Kafka locally, and have some portable tooling you can use to play with real Kafka clusters.