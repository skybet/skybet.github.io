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

The platform currently used within the Gaming Promotions Squad largely relies on Apache Kafka; a data streaming service. Sending data from one section of the stack to another. Encoding it using Apache Avro; a data serialization system. It is because of the use of Avro that we have a need for a Schema Registry Service, which will store the various Avro schemas that we require to be able to encode and decode messages

## What it is

The Confluent Schema Registry is a schema registry idea by the creators of the Kafka platform. It is a secure and safe way of storing schema versions and ensuring that we keep an accurate history in case a rollback is needed. The schema registry is stored on the `_schema` topic on Kafka itself, so anyone who has access to Kafka also has access to the schema registry. This gives us end-to-end schema availability meaning for massively increased reliability on a system.


![Provides end-to-end Schemas](/images/schemas-end-to-end.jpg)

## Why we need it

As stated above the main reason that this work was needed was to ensure uniform schemas accross different areas of the stream. Using Kafka, one squad might put an Avro encoded message into the system, and then another squad will consume the message and attempt to decode it. That is where problems may arise, firstly at this point in time schemas are stored on disk. This means that if one system,  maintained by one team, updates their schema and pushes changes without properly informing a team on another point along the pipeline. The entire system can flop, meaning that a successful data streaming platform could topple quite easily due to mismatching schemas (Oh no!). Once the Registry is implemented fully, it will give all teams the ability to utilise the same schemas, whilst cutting down on disk load times.

## How we do it

Our Registry client was built to spec with the [Confluent Schema Registry]( 
http://docs.confluent.io/3.1.1/schema-registry/docs/). For development of the client we used NodeJS to ensure it can be deployed as a package and taking care to ensure it can be reused by other teams. Though there are less language native functions built in for Node, such as data serialization, there is the obvious advantage that is NPM. Instead of a native deserialization function we used the [AVSC package](https://github.com/mtth/avsc), this package is an implementation of the Avro specification in Javascript. It allows us to encode and decode messages sent in avro, provided the correct schema is given.

The Schema Registry implementation came in one main part, the client, it is a layer on top of the Schema Registry Restful Service. This node package interacts with the Registry Service to return schemas to the client. Once retrieved the package then caches the schemas to ensure as much efficiency as possible when it comes to timings and network resources. Once cached it then passes the schema to another package, which in turn resolves in a promise of an encoded or decoded message back to the consumer of the package.

In the Confluent Schema Registry format it specifies messages should be encoded in what is called the 'Wire Format'. The wire format is essentially a way of ensuring that all encoded messages sent include some form of identification for the schema they were encoded in. The format contains one 'Magic Byte', the Confluent serialization format version number which is currently always 0, then followed by the schema Id in 4 Bytes.

## Overview

The Schema Registry is essential to teams using Apache Avro and Kafka to stream data from one end to another, the registry makes the encoding and decoding of these messages much more reliable and easy to collaborate on. The registry holds all different versions of a schema and can be accessed by anyone relevant to the kafka stream. The schemas are then used to encode and decode avro encoded messages, usually from Kafka.
