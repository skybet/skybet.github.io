---
layout:     post
title:      H2OhNoes! Five lessons we can learn from old-world utility firms on how to handle outages
date:       2015-11-21 20:00
summary:    Utility companies have customers. And just like us, those customers expect a ubiquitous, always-on service provision. Are there therefore any lessons we can learn from an old, established industry like a utility company on how to handle outages? 
category:   Incident Response
tags:       support
author:     dan_adams
---

Earlier this week my town was affected by a burst water main that left the entire town without water supply for over 24 hours. We are so used to the convenience and ubiquity of unlimited water on demand that it comes as something of a shock to realise just how awkward life is for even a brief period when the service that we’ve come to expect and rely upon isn’t available all of a sudden.

![BBC News Report](/images/bbc-water-outage.jpg)

In the world of technology we often like to think that we’re smart. We employ bright and driven people, we work with new and cutting edge technologies, and we leverage these to deliver exciting platforms and services to our customers. In contrast centralised water distribution has existed since at least ancient Roman times, and has been providing a largely undifferentiated service in modern times for over one hundred years.

But just like us, utility companies have customers. And just like us, those customers expect a ubiquitous, always-on service provision. Are there therefore any lessons we can learn from an old, established industry like a utility company on how to handle outages?

## Lesson One: Don’t fail often

It may seem trite, but customers rightly have limited patience and long memories. The less often you fail, the more forgiving customers will be when you do fail. I am 36 and this 24-hour outage is the first water outage I have ever experienced. That’s a pretty impressive 99.99% uptime. I’ve had longer outages with my broadband, with AWS, with Facebook, none of whom have existed for half as long as my water supply has been cleanly and reliably delivered to my home.

It helps of course if you’re not just reliable but increasing in reliability over time too…

![Graph showing number of water leaks falling](/images/water-leak-graph.jpg)

## Lesson two: Don’t give estimates, they’ll be wrong

As soon as you give an estimate for when a service suffering from an outage will be restored, you are setting yourself up for a fall. At least some of your customers are going to interpret your estimate as a guarantee or a promise and then they are going to become angry or upset if your estimate proves to be inaccurate. Which it will, because it’s an estimate. Keep it simple: just reassure customers that you are committed to resolving the problem and throwing everything you have at the issue to resolve it.

![Yorkshire Water tweet](/images/yorkshire-water-twitter-estimate.jpg)

## Lesson three: if you had a tough problem, share the details

Customers by and large do not care about the exact technical issues that you encountered. They don’t want to be lectured on autonomous systems and unanticipated HSRP failover interactions when their favourite SkyVegas game isn’t available. But they will appreciate knowing that you busted your guts to sort their problem and weren’t sat around idly. Did you have to wake up twelve engineers at three in the morning and have them work on the problem til dawn? Let the customers know. Don’t fish for sympathy – it’s the customer that has been impacted – and don’t attempt to explain or justify the length of time taken to resolve an issue, but do try and reassure that the issue was not trivial and just how hard you have been working to fix it for them, for the customer. 

It’s hard to hold a utility company to fault when three teams of engineers have been kept from their families digging through a muddy ditch all night by floodlight in driving rain so that you can have a cup of tea.

![Big hole](/images/yorkshire-water-hole.jpg)

## Lesson four: Get proactive

Yorkshire Water didn’t wait for a flood of calls into their contact centre to query why there was a problem. They analysed who would be affected and alerted their entire affected customer base via text message to the issue. Anyone choosing to subscribe could receive update notifications until the issue was resolved. The experience for the customer? Instant notification of the issue before they were even aware of it, rather than irritation at discovering it and fifteen minutes sat listening to hold music trying to discover what the problem was.

## Lesson five: Provide alternative solutions

When Yorkshire Water’s delivery mechanism failed they had a backup in place and handed out free bottled water. As a tech company we attempt to provide resiliency and redundancy at various layers of our technical stack, as well as having disaster recovery and failover sites. But sometimes even this isn’t enough.

What does our “bottled water” offering for customers look like and can we do more for our customers in the event of an outage? Could our mobile apps offer registered bet customers free spins on the Sky Vegas if the sportsbook site is unavailable? Could they even do the unthinkable and support a reciprocated arrangement to give federated access for our customers to a competitor’s service in the event of an outage?

![Water Collection](/images/yorkshire-water-bottle-collection.jpg)

When handled correctly an outage doesn’t have to harm your relationship with your customers and can even positively build your customers’ relationship with you. Nobody expects perfection and if you handle an outage correctly (whilst ensuring they don’t happen often) you can gain the respect, admiration and thanks of your customers. **Let’s make betting and gaming better.**

