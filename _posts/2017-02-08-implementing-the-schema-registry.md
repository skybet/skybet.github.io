---
layout:     post
title:      Implementing The Schema Registry
date:       2017-02-08 12:00
summary:    Keeping on top of an area of technology that is as rapidly moving as the big data ecosystem is hard.  Our data tribe share some of their resources for keeping up to date.
category:   Data
tags:       Data, Improvements
author:     callum_leahy
---

![Enigma Machine](/images/enigma.jpg)

## Introduction

The platform currently used within the Gaming Promotions Squad largely relies on Apache Kafka; a data streaming service. Sending data from one section of the stack to another, encoding it using Apache Avro; a data serialization system. It is because of the use of Avro that we have a need for a Schema Registry Service, which will store the various Avro schemas that we require to be able to encode and decode messages

## What it is

The Confluent Schema Registry is a schema registry idea by the creators of the Kafka platform. The schema registry is stored on the `_schema` topic on Kafka itself, so anyone who has access to Kafka also has access to the schema registry. It is a secuere and safe way of storing schema versions and ensuring that we keep an accurate history in case a rollback is needed.

## Why we need it

As stated above the main reason that this work was needed was to ensure uniform schemas accross different areas of the stream, using Kafka one system might put an Avro encoded message into the system, and then another system will pull out the message and attempt to decode it. That is where problems may arise, firstly at this point schemas are stored on disk. this means that if one system,  maintained by one team, updates their schema and pushes changes, without properly informing a team on another point along the pipeline. The entire system can flop, meaning that a successful data streaming platform could topple quite easily due to mismatching schemas. Once the Registry is implemented fully, all teams can utilise the same schemas, whilst cutting down on disk load times.

## How we do it

Our Registry client was built to spec with the [Confluent Schema Registry]( 
http://docs.confluent.io/3.1.1/schema-registry/docs/). For developement of the client we used NodeJS to ensure it can be deployed as a package and reused. Though there are less language native functions built in for Node, such as data serialization, there is the obvious advantage that is NPM. Instead of a native deserialization function we used the [AVSC package](https://github.com/mtth/avsc), this package is an implementation of the Avro specification in Javascript. It allows us to encode and decode messages sent in avro, provided the correct schema is given. 

The Schema Registry implementation came in one main part, the client, it is a layer on top of the Schema Registry Restful Service. This node package interacts with the Registry Service returning schemas by various different means. Once retrieved the package then caches the schemas to ensure as much efficiency as possible when it comes to timings and network resources.

In the Confluent Schema Registry format it specifies messages should be encoded in what is called the 'Wire Format'. The wire format is essentially a way of ensuring that all encoded messages sent include some form of identification for the schema they were encoded in. The format contains one 'Magic Byte', the Confluent serialization format version number which is currently always 0, then followed by the schema Id in 4 Bytes.
