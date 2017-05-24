---
layout:     post
title:      "Dinosaur bitten by Python, saved by Jesus"
date:       2017-04-26 16:00
summary:    Turns out driving Infrastructure with code via APIs isn't that scary after all for your ageing engineer, it's actually fun!
author:     andrew_newsome
category:   Infrastructure
tags:       API, automation, MDNS, python
---

I'm a bit of an ageing dinosaur from back in the day when computers were expensive. I'm not talking expensive like now. I mean really expensive! You know, the sort of mountain of cash you'd need today to buy a second rate premiership striker who'd guarantee you 7 or 8 goals a season. Provided of course he didn't withdraw his services because the back office staff inadvertently gave him the wrong scented lip balm at half time. Vendors made so much margin on these goliath machines that they used to come with a couple of engineers to feed and water them for the rest of their working lives.

So in the days of automation, integration, infrastructure as code, APIs, commodity, community and a bewildering array of free stuff how does your self-respecting dinosaur avoid a meteor strike and extinction?

Well, turns out it's relatively straight forward.

First, spend the week between Xmas and New Year when everyone's on holiday and not much is going on learning a new language. For my choice I considered usability versus speed, language maturity, available libraries, the support model, industry uptake and of course its future roadmap. Then I picked the one with the coolest name, Python!

Secondly, procure the services of a couple of experienced colleagues to get you started. In my case an English & Japanese speaking Spanish contractor with hair that girls would kill for and a drumming, six foot seven hipster violinist that looks like Jesus and coincidently has hair that girls would kill for.  Maybe I'm just drawn to that type?

Finally, pick yourself a piece of infrastructure or Service with an Application Programming Interface (API) and maybe a friendly neighborhood Software Development Toolkit (SDK) and away you go. Users with 'read-only' privileges are always a good starting point just to get you into your stride. Saves lengthy "blameless" Post Incident Review discussions.

My learned colleagues assured me that nine tenths of the battle is always authenticating. Once you've persuaded it that we're good to talk, the rest is downhill.

Before you know it you'll be driving infrastructure with code as easily as I will the mobility scooter that's surely only weeks away.

First off I had a crack at the NetApp AFF8080 storage array.

It comes with a handy SDK and once you've had a play with it, via the API, you can pretty much do anything. The hipster kindly helped me with authentication and understanding how you exchange data with the API. The last generation NetApp headers you could run a snmpquery to monitor their global health. Turns out with the latest incarnations that functionality has been deprecated. To determine the global health of the devices you need to run a CLI command or query the API. It felt like a nice opener, only one call to make and not too much data to wrestle with coming back. A look at the example scripts that came with the SDK and literally 54 lines of code later, I could check that the storage array was absolutely tickety-boo and alert if otherwise. Soon I was monitoring the status of volume snapshots and confident that if it was functionality that the API supported I could drive it.

Next up was Verisign's Managed DNS Service (MDNS).

We had a number of use cases which required us to automate the manipulation of DNS resource records. One such required us to change load balanced/failover DNS records from type 'A' to type 'CNAME'. With MDNS you can't change a resource record's type, you can only do that by deleting and creating a new one. So automating the change is the only way to go unless you're up for a very stressful period when you've deleted the old record and you create the new record with your ten thumbs whilst the monitoring screens light up like a Christmas tree. No SDK here I’m afraid but some good documentation covering the API so I needed some help from the Spaniard, particularly again around authentication. The API uses an older standard of XML that took the Spaniard 40 minutes to suss but then we were away. We tested the changes in a test domain and enjoyed nice stress free runs in production as a result.

In summary, learn a language where the hard work has already been done, find a couple of experienced colleagues who'll help you out now and then, pick a nice easy moral boosting starter for ten, find a safe environment to learn to drive and just have a go.

