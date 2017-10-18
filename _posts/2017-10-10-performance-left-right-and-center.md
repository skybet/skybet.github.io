---
layout:     post
title:      Performance Left Right and Center.
date:       2017-10-10
summary:    Why we need a holistic approach to performance testing in Agile development  - it's not all about Shifting Left.
image:      perf-lrc-frontpage.jpg
category:   Testing
tags:       testing, performance, devops
author:     paul_whitehead
---

### Performance Matters
At Sky Betting & Gaming (SBG) we are continually looking to improve the service we provide to our customers. As an online business, a key part of this is user experience and in particular performance. There have been many studies over the years that show the close relationship between page load time and abandonment rate. Slow page load times and slow response times in general can be caused by a myriad of influencing factors such as slow network, inefficient code and over-utilised servers - each of which has to potential to cause customers to become frustrated, to miss out on placing an important bet, or ultimately turn away completely and move on to one our competitors. Left untended, theses issue could escalate into intermittent loss of service or even a full blown site outage. For a business like ours, this could be disastrous, both in terms of reputation and financially, no matter when it were to occur but particularly during a big sporting event like the Grand National.

While the causes of performance problems can be many and varied, so too must the methods required to identify them. Effective risk mitigation requires an approach to performance testing that allows issues to be identified at the earliest opportunity, while also having a means to effectively assess production performance. At SBG we embrace agile ways of working like DevOps and continuous delivery allowing us to move faster by reducing delivery time and improve the quality on each release. Gone are the days when performance testing was the last step before deploying production with the potential to derail an important launch. In this fast paced environment, traditional gated waterfall methods need to make way for techniques that seek to accelerating the feedback loop.

### Shift-Left
The “Shift-left” approach to testing refers the practice of starting testing as early as possible in the software development lifecycle (SDLC). In the agile arena, testing is performed iteratively during short test cycles with the aim of getting things right from the outset and reducing cost by early defect detection. The “test early and often” approach can be applied to performance testing too. At SBG we consider performance requirements from the outset and seek opportunities to perform early performance testing both locally and early test environments. Performance is seen as everyones responsibility and although autonomous, each squad ( small agile team) works collaboratively with a shared purpose of delivering a fast and reliable service. 

![Early Perf Testing](/images/perf-lrc-jenkins.jpg)
*Early performance test job in Jenkins*

### Shift-Right
While shifting performance testing left is an important step in agile adoption and one that most test practitioners are familiar with, there is also a need to **“shift-right”**. By shifting right into production we provide a mechanism to cope with short release cycles and mitigate against the weaknesses associated with early testing in non-representative environments. Although this brings with it new risks, the rewards can be great and when done carefully can bring unparalleled insights into real-world customer experience and system behaviour. Here at SBG we combine extensive system monitoring with controlled experiments and large scale production testing to achieve our performance test goals. 

### A/B Testing
A/B Testing, which compares two versions of a product side by side, has been employed extensively at SBG. In the past, this approach has allowed us to compare old and new registration flows alongside each other in production. A fixed percentage of users were randomly channelled down the new registration path with the results observed in our application performance management tool (APM). Any performance degradation could be quickly picked up and addressed before increasing the volume of customer exposed to the new code. 

### Blue Green Deployment
More recently, a “Blue Green Deployment” approach was employed when upgrading from Redis 2 to Redis 3 and migrating to a new cluster. While primarily aimed and reducing down time this technique also provided the ability to conduct a preliminary load test of the new production cluster before opening it up to real customer traffic. By presenting a specific cookie to the front-end server the load test related calls were direct to the new Redis 3 cluster, subjecting it to simulated peak load traffic. Successful load testing was followed by a phased migration of real users to further reduce risk and guard against unexpected behaviour that can often come with real usage.

### Canary Release
A Canary Release strategy is another controlled method used to introduce changes to production. Like the canary in a coal mine (used to alert miners of toxic gases), a new version or configuration of an application is sent out into the wild of production to provide a isolated view of performance. This method was adopted recently to assess the performance a web server with different apache configurations. The selected web server was removed from policy and targeted by the load test scripts using a customer header developed to allow us to target a specific nodes. Small scale load tests were conducted against the target server before selecting the winning configuration and rolling it out to the rest of the cluster.

### Production Load Testing
The strategies outlined above can be very useful in ensuring that changes are made safely, detecting failures quickly and rolling back predictably if needed. However, they are often not enough to sufficiently reduce risk. At SBG our production environment is made up of over 1300 servers hosted across multiple data centres. These are powered by approximately 6.8 THz of compute, running everything from PHP to Couchbase and supporting a multitude of bespoke services. At peak the system has to handle around 44 million game transactions a week, 24,000 logins per minute and 16,000 bets. With an environment like this there really is no substitute for large scale production load testing. At SBG we conduct frequent load tests from Amazon Web Services (AWS) using our custom load test framework and calling on 50,000 test accounts to simulate the desired load profile. These test are performed by individual teams looking to validate a recent change or cross-team tests seeking to evaluate system behaviour across all our key services. In preparation for big sporting events like the Grand National, production testing begins months in advance with key stages of the day rigorously load tested. Once we are satisfied with the results we continue to test to guard against regression and fine tune our services. To perform these tests without impacting the our customers or causing any unwanted downtime requires control and planning. However, despite limitations on what can be tested and restriction on when testing can take place, these tests have become an integral part of our test strategy.

![Production Load Test](/images/perf-lrc-aws.jpg)
*Production load testing in action

### Monitoring
To be truly successful, shift-right must have good monitoring as a cornerstone of the approach. None of the production testing outlined above would give us the insight needed without sufficient monitoring in place to proactively evaluate performance. SBG have a range of solutions at our disposal which together give us a 360 degree view of system performance. Graphite metric gathering is used in conjunction with Grafana dashboards to give us tailored and inexhaustible view of our services and underlaying infrastructure. New Relic provides further visibility including Real User Monitoring (RUM) to give information on real user experience from page load times on specific browsers to individual calls made from each system component. Log files are fed into Splunk, an enterprise log file monitoring solution, to give us additional performance metrics and allow us to diagnose problems that may manifest themselves in the form of log patterns. Our Nagios monitoring provides system heath checks to ensure that if any part of platform encounters a problem we can quickly act the resulting alerts.

![Monitoring](/images/perf-lrc-grafana.jpg)
*One of many dashboards used to monitor the system*

### Conclusion 
Wherever and whenever performance testing takes place it cannot be done in isolation and requires a thorough understand of production usage. Any tests, even those performed at the earliest stages, require knowledge of real world usage. Ultimately performance testing requires a holistic approach which encompasses both shift-left and shift-right testing. Early testing is crucial to ensure early detection but “Released” should not mean “Done”. Performance testing should, where it is practical to do so, continue into production. Furthermore, whether performance testing is or isn’t conducted in production, real user experience should continue to be analysed as it is ultimately the only definitive means of finding out if a change is production ready. At Sky Betting & Gaming performance is critical to our success and that’s why we put performance at the left, right and center of everything we do.

