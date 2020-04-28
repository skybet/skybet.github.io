---
layout:     post
title:      Visualising Complex Systems
date:       2020-04-28 09:00:00
summary:    Last week I gave a Tech Talk called "Beyond Dashboards - Visualising Complex Systems"
author:     andy_burgin
category:   Community
tags:       conference, community, tech talk
---

It's common practice to collect a multitude of metrics from our builds, tests, releases and running applications. Typically we use dashboard tools to visualise these metrics creating a plethora of interrelated graphs and charts to enable us to quickly review performance, spot anomalies and monitor the health of our system components. Although we may have detailed knowledge of individual components of the system, can dashboards alone give us the ability to understand how those components and the many others relate, interact and operate as a complex system?

<iframe width="560" height="315" src="https://www.youtube.com/embed/J9Hq2JA1iSE" frameborder="0" allowfullscreen></iframe>


Based on the analysis of Kubernetes clusters this session will demonstrate ways to "see" the workloads running on clusters. Helping to better understand a system through visualisation, anomaly identification and exploratory analysis. Using tools such as graph databases and visualisation tools, you'll see how they can help explore and understand cluster workloads. Sharing examples of how these tools have identified issues and how they can help engage with users of the systems to share best practices and ultimately improve cluster performance. 

## Resources

You can [download the go source code](/resources/vis-complex-systems/vis-complex-systems-golang.zip) to export kubernetes objects to Neo4j and GEXF. The [slide deck](/resources/vis-complex-systems/beyond-dashboards-vis-complex-systems.pdf) is also available. 