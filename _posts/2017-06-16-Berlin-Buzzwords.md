---
layout:     post
title:      Berlin Buzzwords 2017
date:       2017-06-16 09:00
summary:    What we learned at Berlin Buzzwords 2017
category:   Data
tags:       kafka
author:     alice_kaerast
---

This year, Sky Betting & Gaming sent three architects from the data tribe to [Berlin Buzzwords](https://berlinbuzzwords.de) to learn all about storing, processing, streaming and searchability of large amounts of digital data.  Focusing on open source projects, it is a great conference for talking to practitioners of big data rather than vendors.

The event started with an afternoon of barcamp sessions, followed by two days of more formal conference split across four rooms and multiple streams - Scale, Search, Stream, Store.

## Our favourite talks

Many of the more vendor-driven conferences tend to start with quite abstract keynotes and sales pitches from the sponsors.  That is far from true for Berlin Buzzwords, with the keynotes being some of the best talks.  Karen Sandler's story about the [importance of free and open source software](https://berlinbuzzwords.de/17/session/keynote-free-and-open-source-software-today-kino) for her, and Duncan Ross's talk about [data evangelism](https://berlinbuzzwords.de/17/session/bridging-gap-between-data-sceptics-and-data-evangelists-kino) were both very inspiring talks.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Data science for good? A data science pledge <a href="https://twitter.com/hashtag/bbuzz?src=hash">#bbuzz</a> <a href="https://t.co/u8fYX2yUox">pic.twitter.com/u8fYX2yUox</a></p>&mdash; Alice in Wanderland (@AliceFromOnline) <a href="https://twitter.com/AliceFromOnline/status/874544028104130560">June 13, 2017</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

Michael Häusler gave a great talk on the [integration patterns for big data applications](https://berlinbuzzwords.de/17/session/integration-patterns-big-data-applications) at Researchgate.  I highly recommend watching the video of this when it gets uploaded, as there are some unique ideas here which seem to work really well.

Lars Francke gave a good overview of [securing Hadoop](https://berlinbuzzwords.de/17/session/building-fence-around-your-hadoop-environments), encouraging people to start with kerberos authentication right from the start and adding extra security as required by your needs/regulatory requirements.

Alvaro Videla gave an interesting talk on [metaphors we compute by](https://berlinbuzzwords.de/17/session/metaphors-we-compute), and how we need to be careful with language.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Metaphors are the tools of thought <a href="https://twitter.com/hashtag/bbuzz?src=hash">#bbuzz</a> <a href="https://t.co/Hm1sXMy9Fk">pic.twitter.com/Hm1sXMy9Fk</a></p>&mdash; Stefan Rudnitzki (@stefzki) <a href="https://twitter.com/stefzki/status/874277234357481472">June 12, 2017</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

Fokko Driesprong and Vincent Warmerdam gave a thought-inspiring talk on streaming bayesian analysis to match user skill levels in online computer games.  Starting with [Pokemon](http://koaning.io/pokemon-recommendations-part-2.html).

Frank Lyaruu's talk on [embracing database diversity](https://berlinbuzzwords.de/17/session/embracing-database-diversity) reminded us that putting data into Kafka makes it available not just for your first use-case, but for many others.  Once user-data is being fed through Kafka you can then plug in elasticsearch, key-value stores, and even caching layers and push updates to web sockets.

Maxim Zaks asked some great questions about [why we're still using JSON](https://berlinbuzzwords.de/17/session/why-are-we-using-json) and looked at how binary formats perform much better.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">The talk about JSON inefficiency was eye opening. Would be interesting to see how Avro compares to the other formats tested <a href="https://twitter.com/iceX33">@iceX33</a> <a href="https://twitter.com/hashtag/bbuzz?src=hash">#bbuzz</a> <a href="https://t.co/f0LCzMSR9Z">pic.twitter.com/f0LCzMSR9Z</a></p>&mdash; Ville Brofeldt (@VilleVBro) <a href="https://twitter.com/VilleVBro/status/874864566420852736">June 14, 2017</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

I would highly recommend next year's Berlin Buzzwords, especially as it will be combined with a second conference in 2018 - one on governance and management of open source communities.