---
layout:     post
title:      QCon London
date:       2016-05-19 09:00:00
summary:    I went to the QCon conference this year. This is some of the stuff I learned.
author:     andy_butcher
image:      qcon.png
category:   Conferences
tags:       conference,infrastructure,containers,cloud,stream,fault-injection,testing
---

So this year I used my Tech Ninja Fund to go along to [QCon London](https://qconlondon.com/). For the uninitiated, QCon is a global software engineering conference run by the same folk who produce [infoq.com](https://qconlondon.com/) (an excellent website which I’ve used for years to keep up with new tech and trends).

About one and a half thousand people rocked up to the QEII Conference Centre in London back in March, and spent a few days listening to about 140 speakers from across the tech world talking about what’s new. 
There’s always a great mixture of tech giants like Netflix and Google, smaller-scale innovators like [Sysdig](http://www.sysdig.org/) and [BoxFuse](https://boxfuse.com/), and independent gurus, experts and academics all contributing to the mental deluge of ideas and perspectives.
Combined with the facilitated collaboration sessions, workshops, and lots of opportunities to meet new people, it really does leave you feeling bewildered but inspired with new ideas and viewpoints.

Anyway, here’s an overview of some of the stuff I saw.

## Unevenly distributed

[Adrian Colyer](https://twitter.com/adriancolyer), (previous CTO of Applications for VMWare, and also of SpringSource), publishes [a blog](https://blog.acolyer.org/) in which he summarises an academic paper each weekday. His [keynote presentation](http://www.infoq.com/presentations/research-future) on Day 1, about why we should love papers, was a whistle-stop tour of some of them. (In case you're wondering, the title Unevenly Distributed is from [William Gibson](https://en.wikipedia.org/wiki/William_Gibson): "The future is already here — it's just not very evenly distributed")

Of stand out interest to me was his guide to some of the [up and coming developments in hardware and networking](https://blog.acolyer.org/2016/01/22/all-change-please/):

![Next Generation Hardware](/images/allchangeplease.png)

* [100Gb Ethernet](https://en.wikipedia.org/wiki/100_Gigabit_Ethernet)
* [RDMA](https://en.wikipedia.org/wiki/Remote_direct_memory_access) (Remote Dynamic Memory Access). This allows memory in any host on a network to be accessed by another host without requiring its CPU (all done through the network card) resulting in blisteringly fast performance.
* Non-Volatile RAM. Blurring the lines between memory and storage, [NVDIMMS](https://en.wikipedia.org/wiki/NVDIMM) and distributed UPS both use a battery or capacitor to ensure enough power to persist to NAND Flash in case of failure. All the performance benefits of DRAM, plus persistence.
* HTM (Hardware Transactional Memory), available in the x86 instruction set architecture since Haswell.
* [FPGAs](https://www.youtube.com/watch?v=L2wsockKwPQ) (Field Programmable Gate Arrays). Intel will soon start shipping Xeon chips with integrated FPGAs (talking over Intel’s QPI interconnect), which will be highly suited to efficiently handling big data workloads in an energy efficient way. These will be available on AWS EC2 soon as well.

Combining these technologies has some pretty far reaching implications for how we design our architectures in the future. Our traditional notions of IO and networking being bottlenecks might become a thing of the past, with CPU and choice of algorithm demanding our focus instead.
Take for example a system which Adrian has written about a couple of times, most recently [back in January](https://blog.acolyer.org/2016/01/14/no-compromises/), called FaRM (Fast Remote Memory). It gives you distributed transactions with strict serialisability while combining **high performance, low latency, durability and high availability**:

> A 90 machine FaRM cluster achieved 4.5 million TPC-C ‘new order’ transactions per second with a 99th percentile latency of 1.9ms. If you’re prepared to run at ‘only’ 4M tps, you can cut that latency in half. Oh, and it can recover from failure in about 60ms.

Pretty impressive stuff.

And a system called RAMCloud exploits RDMA to allow reads from anywhere in a 1000-node cluster in **5µs**. Writes take **13.5µs**. A system built on top of that named RIFL (Re-usable InFrastructure for Linearisability) handles distributed transactions in about 20µs. Yep, you read that correctly. **20µs**.

## Immutable Infrastructure

Another theme that is affecting how we think about our systems right now is containers, unikernels, and cloud. This area had its own track, and there were [great talks on the subject](http://www.infoq.com/conferences/qconlondon2016) (see Containers (In Production) on Day 2).

![The Rise of the Machine Images](/images/riseofthemachineimages.png)

[Axel Fontaine](https://axelfontaine.com/), of [BoxFuse](https://boxfuse.com/), gave a great talk entitled [Immutable Infrastructure: Rise of the Machine Images](http://www.infoq.com/presentations/immutable-infrastructure) in which he points out that we would never dream of deploying different code artifacts across our environments, and across our cluster. Neither would we think it was okay to release features by delving into a tarball and making changes to it. Our deployables are **immutable, single use, cheap and disposable**. So now we live in a world of abundance ("every day, AWS adds enough server capacity to power the whole $7B enterprise Amazon.com was in 2004") why are we treating our infrastructure differently?

Henry Ford has been quoted as saying:

![Henry Ford quote](/images/fasterhorse.png)

Here at Sky Betting & Gaming we use Chef to ensure consistent configuration across our estate, but Axel argues that Chef (and Puppet etc.) are simply a _faster horse_ - a faster way of delving into the infrastructure equivalent of tarballs and tinkering around to try and make them all consistent.

Coining another animal-based analogy, with machine images **we should now be treating our servers like cattle instead of pets**. We should no longer care about individual servers, thinking of a name for them, taking them to the vet when they’re poorly. It seems to me that where we want to get to is that if a server has a problem affecting a live service, **we should shoot it in the head** and spawn a pristine new one.

![The U in CRUD for servers is dead](/images/crudisdead.png)

Sky Betting & Gaming has been adopting cloud, and containerisation, for a little while now - and Axel had some helpful insights into what this means for how we design and plan our systems. _Cost-driven architecture_ makes more sense now that we can spin up servers for a few hours when we need them and kill them off when we don’t - something which is pretty handy for a business model like Sky Betting & Gaming's where we essentially have a **Black Friday every Saturday afternoon**.
And now that we can start to care less about individual servers, from an operational perspective we can think about **services** instead: 
_Is this service available? How is it performing across different data centres or regions? Which versions of the services are we running currently? Are we ready to start migrating traffic onto the newest release?_

At design time this has implications: Operationally, we need to ensure that we automate all the things. We need health check endpoints, log shipping, dynamic monitoring. Architecturally, we need service discovery. We need statelessless. We need small, simple solutions that scale horizontally.

So in a world where we have lots of small services (maybe microservices), each potentially with their own de-normalised data store appropriate to their specific use case, _how do we go about keeping our data in sync?_

## Staying In Sync

[Martin Kleppmann](https://martin.kleppmann.com/) made the case for one solution in his talk [Staying in Sync: From Transactions to Streams](http://www.infoq.com/presentations/event-streams-kafka).
The problem essentially is that most of us no longer live in a world where we have a single monolithic application talking to a single monolithic database - at Sky Betting & Gaming we certainly don’t.
Most companies have a multitude of derived data stores like caches, search indexes, recommendation engines - all those myriad data stores which support individual services.

![Insanity](/images/insanity.png)

When the data changes in the “system of record” we need to update all those derived data stores, but doing that reliably is a notoriously difficult challenge due to the risk of write failures, deadlocks, updates occurring out of order and so on.
One commonly used solution is the use of [distributed transaction management](https://en.wikipedia.org/wiki/Distributed_transaction). This has been around a while, and essentially involves introducing a central coordinator (your application + a transaction manager) whose job it is to orchestrate some kind of **n-phase commit** across multiple data sources.
And this works fine as long as:
 a) The application doesn’t crash
 b) Nothing fails during the commit phase
 c) No deadlocks occur, and 
 d) You don’t mind your system running slower because of all the locks and synchronous commits. (Typically systems run ten times slower with distributed transaction management).

![Two Phase Commit](/images/twophasecommit.png)

I’d argue that you very rarely need distributed transaction management - and if you do, **maybe you should rethink the problem**.
Martin described solving the same challenges using event streams and [Kafka](http://kafka.apache.org/).
Essentially, instead of orchestrating multiple systems using the application, don’t orchestrate at all. Write all changes as immutable events onto an append-only log (a Kafka topic in his example). Then let all the systems that need to be kept up to date with those changes subscribe to the events and update themselves independently. Anyone familiar with [CQRS](http://martinfowler.com/bliki/CQRS.html) and [event sourcing](http://martinfowler.com/eaaDev/EventSourcing.html), or database replication oplogs will recognise this.

![Database replication](/images/databasereplication.png)

As Martin points out:

> Stupidly simple solutions are the best

![Embrace the log](/images/embracethelog.png)

Essentially, I’d say it has the following features:

* You guarantee consistency across your data stores, because you have total ordering of events, and each consumer processes those events in a single-threaded sequential manner.
* A failure preventing the data source from reading (such as a network interruption) will only affect that consumer. Since the consumer is responsible for maintaining its own position in the log, it can pick up where it left off when the failure is corrected.
* A slower data source will take longer to update itself, so at any given point in time the data sources might not be in sync, but they will be. (This is what’s known as eventual consistency). This might not make it suitable for situations where you present data from two or more data sources next to each other on a web page for example.
* A slower data source won’t slow down updates being available in the others, in the way that transaction management would.
* Since the reliability and consistency guarantees come from the single-threaded sequential nature of the consumers, scaling is achieved by sharding the events into separate logs (Kafka topics).
* It leads to an architecture which can continue to grow without incurring large-scale technical debt, due to its loosely coupled nature. In this way, it goes nicely hand in hand with microservices should you wish to go down that route.

It’s worth noting that financial systems, famous for stringent requirements around consistency, reliability and performance, very often use this kind of model.

## Failure Testing

So talking of reliability, the last talk I wanted to touch on is a hugely entertaining one I watched about **fault injection testing at Netflix**.
In a pretty slick double act, academic [Peter Alvaro](https://twitter.com/palvaro) and [Kolton Andrus](https://twitter.com/koltonandrus) previously at Netflix, described how they met and collaborated on finding a way of discovering fault-intolerance in Netflix’s architectural estate: [Monkeys in Lab Coats: Applying Failure Testing Research at Netflix](http://www.infoq.com/presentations/failure-test-research-netflix).

I highly recommend watching this talk, but the core concept was this:

If you run 100 services and you’re interested in scenarios involving a _single service failure_, that’s quite easy to write fault injection tests for - there’s only 100 of them you need to run. But... it's probably not very interesting, because you’ll have built redundancy in (right?), so you won’t be discovering the “deep” bugs that happen when multiple things fail.

So how big is the space of possible failures? It’s the power set of 100, which is **2^100**, or roughly **1,000,000,000,000,000,000,000,000,000,000**. That’s probably not going to be a viable number of test executions. [If each execution took 1 second, it would take longer than [the age of the universe](https://en.wikipedia.org/wiki/Age_of_the_universe) to run them all. About 40 trillion times longer in fact!]

![What could possibly go wrong?](/images/whatcouldpossiblygowrong.png)

Even if you decided to only look at combinations of 7 faults, that would mean a search space of **16 billion** [over 500 years of continuous executions each one second in duration]. Even just combinations of 4 would be **3 million** executions [maybe do-able in a month. But how much stuff changes in that month? And you’re still not testing for very deep bugs].

![Random search](/images/randomsearch.png)

So another approach is **random testing**: Switch things off at random, and hope you find some bugs. This certainly might catch some deep bugs given enough time, but the vast majority of interesting failures will remain undiscovered.


![Engineer guided search](/images/engineerguidedsearch.png)

Yet another approach is what they called **engineer-guided search**, where you rely on the knowledge of your engineers to identify possible deep faults. This can be effective, but it's sloooow, and inherently not automatable.

So enter Peter’s paper on [Lineage Driven Fault Injection](http://www.cs.berkeley.edu/~palvaro/molly.pdf). This turned the question of “What could go wrong?” into a more directed question: Consider a good outcome and ask “Why did this good thing happen? Could we have made any wrong turns along the way?"

![Success lineage](/images/successlineage.png)
For example, consider the diagram. Each layer has redundancy, so the failures depicted don’t represent an interesting failure scenario because there’s still a path to a good outcome.
Whereas a failure in both the Bcast nodes would break all paths from leaf to root.

And so the idea that Peter and Kolton developed was one that started with the _lineage of successful outcomes_ and from that DAG, extracted a set of trees, each of which is sufficient to produce a good outcome. For each one of those trees, breaking _one step_ will break that path (e.g. breaking RepA or Bcast1 in the diagram).

And so now the space of interesting failures can be written as a boolean formula in [conjunctive normal form](https://en.wikipedia.org/wiki/Conjunctive_normal_form):

>(RepA OR Bcast1) AND (RepA OR Bcast2) AND (RepB OR Bcast2) AND (RepB OR Bcast1)

...which can be offloaded to a highly efficient satisfiability server.

![Lineages in CNF](/images/lineagesincnf.png)

Now, creating those lineage graphs becomes the challenge, and Peter and Kolton started by using data available in the front end (where they use [Falcor](https://netflix.github.io/falcor/) ) to understand what the successful path was that resulted in each good outcome for a customer.
And using this approach for “Netflix AppBoot", in an architecture of around 100 services, they reduced the search space from 1,000,000,000,000,000,000,000,000,000,000 to just **200 failure scenarios, which were interesting**. When they tested them, they identified 6 bugs which would have impacted on their customers - some of them deep bugs that would never have been found by an exhaustive enumeration strategy, or thought of by engineers.

![Netflix AppBoot](/images/netflixappboot.png)

The nature of our business and architecture is very different to Netflix’s, but our Site Reliability Team are constantly looking at new and interesting ways of identifying fault injection tests across our architecture, and ideas like this make the problem manageable.

---

There were many many other fascinating talks at QCon which I don’t have space to go on about here (and let's be honest, you might not have got this far anyway!), but I highly recommend checking out the videos as they become available on [http://infoq.com/](http://infoq.com/).



