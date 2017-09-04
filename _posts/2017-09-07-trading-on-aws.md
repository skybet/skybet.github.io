---
layout:     post
title:      Moving Our Trading Engine to AWS
date:       2017-09-07 09:00
summary:    A look at why we moved to AWS for our in-house trading engine and the benefits we receive.
category:   Cloud Computing
tags:       AWS
author:     leanne_jagger
---

In the Trading Models squad of the Bet Trading tribe, we have already released to production an in-house trading engine that allows our football traders to manually trade in-play football fixtures. This involves taking inputs from the traders and using a mathematical model to generate prices to be used on skybet.com. Whilst this application addresses some business requirements such as providing a way to failover from a third party failure it comes with a few technical concerns due to the way it has been built.

We built the trading engine as one Java application that took data in from a Kafka topic and fed data out onto another Kafka topic whilst also making use of RabbitMQ, MySQL, Node and a React UI. One downside to this design is that to release a change to just one part of the large Java application we could affect other areas and would have to release the entire thing. Another downside is that to deploy the application and its other components we have to provision multiple servers which means choosing when to provision them and if timed poorly could cause delays when attempting to scale and costly if we choose to build the wrong thing. Finally from a feature perspective we weren’t able to power scoreboards using a feed so this needed developing and meant revisiting our design.

![Scoreboard](/images/trading-on-aws/01_Scoreboard.png)
*A scoreboard taken from skybet.com*

The team began looking toward a serverless based architecture and a new design for the trading engine made up of microservices that we then proved out earlier this year during a two week proof of concept using AWS. Since then we have gone on to refactor the trading engine almost entirely using a mostly serverless architecture and AWS native components such as Lambda, SQS/SNS, API Gateway and DynamoDB. The components that are not serverless are small Spring Boot Java applications hosted for us by the Bet Platform Engineering squad using Docker images, Kubernetes and AWS.

This new design now allows us to make code changes to one microservice and release it individually to other microservices that make up the trading engine as a whole. It also means that as markets have been separated out we have finer grained control and can turn off specific markets should we choose to. As we are using AWS native components rather than having forklifted our application into Amazon’s EC2 servers, when it comes to scaling, most services auto scale and the few that don’t can be scaled by changing a limit in the AWS console and clicking a button. We are now also able to ingest feeds that can power scoreboards which has seen us double uniques, bets and stakes as well as increase the number of games a single trader can handle at one time.

One huge benefit of using AWS over building and hosting our own servers is that we get redundancy out of the box as all of the AWS services we are using are hosted across multiple availability zones in each region. We can also take it further by choosing to deploy into a multiple regions. We now also no longer have to provision servers as we can spin up new environments and deploy to them incredibly quickly with Terraform and a script. The same goes for if we choose to swap out a technology, for example we began our AWS application using Kinesis but we soon found the latency too high for our use case and in an afternoon were able to swap out the library used, deploy the new SQS/SNS services and remove Kinesis; all without the cost of having built the wrong servers.

![AWS Cost Breakdown](/images/trading-on-aws/02_CostBreakdown.png)
*An example breakdown of the cost of our serverless AWS components.*

The benefits of using AWS continue as we now have clear visibility of what we are spending and can even tell how much it costs us per fixture that we trade using this new system. The AWS console also comes with an array of tools that aids us with monitoring and testing, for example we can use the console to send a request straight to an endpoint in our API Gateway or we can drop a JSON message directly on an SNS topic. Having these testing tools in one place can really help save time when performing manual developer testing.

With this new system we have been able to develop some exciting automation tools to make deploying and testing easier for the whole squad. Using Terraform we have created deploy and teardown scripts that allow us to deploy our entire environment prefixed with something unique to us allowing us to test in AWS as if it were staging or production, all with just one command. Whilst not strictly a benefit of AWS we have also been able to better automate our CI/CD pipeline so that we can step through the entire process of deploying to test, staging and production, along with running our integration test suite, by clicking on approval prompts we integrated into Slack. 

![Generated output in Slack](/images/trading-on-aws/03_SlackOutput.png)
*The Slack output generated by a single Jenkins job to release the UI component through the different environments*

Having systems deployed in AWS means relying on Amazon to keep services running as opposed to having control of our own servers and datacentres. Many services provided on AWS are across multiple availability zones by default but to be multi region you need to deploy into multiple regions and design the application to handle the complexities of running cross region. Amazon recently reported elevated error rates and latencies in a single region for almost two hours meaning anyone hosting their application in just that region may have suffered downtime on their application which shows you still need to consider availability and redundancy and it may be necessary to have cross region deployments to meet service level agreements.

The refactor of our application to use AWS will certainly have incurred an up front cost due to the time spent developing the new system however given the long list of technical and business benefits discussed above it is something we have been excited about and certainly enjoyed developing.