---
layout:     post
title:      Optimising an AWS microservice - Part 1
date:       2018-11-02
summary:    In this two part post we'll talk about our learnings from optimising an AWS microservice to reduce latency and hit non-functional targets
author:     jamie_munro
image:      //TODO add image
tags:       aws, serverless, cloud, microservices
category:   Cloud Computing
---

In the Trading Models squad we build systems that calculate the probabilities of things happening in sporting events, and we use these probabilities to set Sky Bet’s prices. 
Recently, we’ve been building out a pricing service in AWS for Sky Bet’s RequestABet product - an API that our internal sportsbook platform can use to get the price of football betting opportunities as customers request them. One thing that’s different about this project for our team is that the traffic through our system will be customer driven rather than trader driven meaning that we need to serve requests fast, at large scale. In this two part post, I’ll take you through some of the optimisations we’ve made to our system to hit our non-functional requirements.

##Our System
