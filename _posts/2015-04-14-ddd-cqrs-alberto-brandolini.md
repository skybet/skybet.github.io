---
layout:     post
title:      Alberto Brandolini on DDD & CQRS
date:       2015-04-14 18:49:53
summary:    Some key take-aways from having Alberto Brandolini on-site at Skybet talking to us about DDD methodologies. 
categories: ddd cqrs
---

Key take-aways from having [Alberto Brandolini](http://ziobrando.blogspot.com/) on-site for 2 days at [Skybet](https://www.skybet.com/) talking to us about Domain Driven Design (DDD) methodologies. 

### Model from Events & Commands, Not Data

Model your domain from events and commands rather than drafting a data schema. "[Event storming](http://ziobrando.blogspot.co.uk/2013/11/introducing-event-storming.html)" can be a useful technique.

![Alberto diagram of CQRS](/images/alberto-cqrs.jpg)

This approach fits well with a [CQRS (Command Query Responsibility Segregation)](http://martinfowler.com/bliki/CQRS.html) architecture where commands and events are first class citizens, and there are multiple data models (aka projections). The data model is dependent on the downstream use-case; different downstream use-cases demand different data models.  

### Don't Replicate CRUD in your Domain Events

Domain events like `CustomerAddressChanged` is indicative of this problem. *Why* did the address change? Won't the downstream applications want to know and act differently depending on this reason? Better is multiple events `CustomerAddressCorrected` and `CustomerMovedHouse`. In the former case all customer records might be updated including in-progress & previous orders as the address simply had a mistake in it; in the latter only the current address would be changed and previous historical data left intact.

Don't use CQRS for a basic CRUD problem.

### Bounded Contexts: Same Term, Different Meaning

Ubiquitous Language terms can have different meanings in different Bounded Contexts. e.g. in a *Delivery* context the "Address" is the delivery location, in a *Finance* context "Address" is the billing address. Bounded Contexts are usually reflected in company structure: different teams in a company tend to develop their own local ubitiquitous language.

### Async Communication between Aggregate Micro-Service

Aggregates within a Bounded Context are natural candidates for micro-service boundaries. Communication between aggregates should be async. 

![Alberto agreggate diagram](/images/alberto-aggregate.jpg)
