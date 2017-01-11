---
layout:     post
title:      Scaling Time Series Databases
date:       2017-01-13 12:00
summary:    We collect a lot of metrics about our production systems using Graphite Times Series Databases. In order to improve performance of Graphite and reduce the load on our SAN we purpose-built and tuned some very vast dedicated hardware for our Graphite Databases.
category:   Big Data
tags:       graphite, hardware, performance, data
author:
 - john_denholm
 - gary_mulder
---
As a technology company in a fast-changing industry, Sky Betting & Gaming is experiencing extremely rapid growth. To anticipate and manage this demand, we continually monitor the performance and capacity of the services and servers running in our data centres. The primary tool we use to store performance and throughput statistics about our services and servers is [Graphite](http://graphite.wikidot.com).

# The Challenge

Our Senior Platform Engineers (A.K.A. J.D.) have crafted a very robust and scalable data collection framework that feeds a large proportion of our metrics and monitoring data into Graphite. In the past year we’ve experienced significant growth in the number of metrics being sent to Graphite as we have rapidly added more services and horizontally scaled existing services. Currently we continuously collect about half a million metrics at a 10-second resolution across all of our data centres. We also have ambitious plans to capture any and all time series from newly identified data sources and integrate them all into Graphite. Our goal is to have a complete and integrated full-stack multi-layered view across all of our infrastructure and applications, as well as monitoring Sky Betting & Gaming's third party integrations.

# The Problem

Graphite's increasing volume of data generation has put significant demands on our storage infrastructure. Therefore, we identified a clear need to isolate our Graphite data processing and storage from our production storage infrastructure. While our Graphite data is critical to gain insight into Sky Betting & Gaming's systems, Sky Betting & Gaming’s 24x7 operations would not stop if Graphite went offline for a short period. With these less-stringent availability requirements in mind, we decided on a two-tier approach. We would continue to store Sky Betting & Gaming’s more critical data on our existing high-powered and highly reliable SANs (Storage Area Networks), and separate out our Graphite storage in a less-critical storage tier that we can independently manage and scale. There was the added benefit of freeing up additional production SAN storage capacity for future production growth.

# The New Design

Graphite and its Whisper data files are a type of database, similar in concept to a relational database, but optimised for time series data rather than relational data. A database is primarily concerned with accepting data and writing it to non-volatile storage both quickly and securely, as well as providing fast and reliable retrieval of this data. As a general rule, databases like lots of memory and fast storage. Therefore, we decided to commission some dedicated physical servers with plenty of RAM and some SSDs (Solid State Disks). Furthermore, since we are currently using application-level mirroring (i.e. storing two copies) of our Graphite data, we decided to install the SSDs locally in each of the Graphite servers. Using locally attached storage provided us the most bang for the buck in terms of capacity and storage density, as well as providing the highest throughput possible for reading and writing data. One cost of locally attached storage is that we lost the enterprise-level storage management tools provided by our SAN. However, given that Graphite’s Whisper files use a standard Linux file system, we concluded that Linux tools such as tar and rsync were sufficient for our Graphite storage management should we need to move data between Graphite servers.
 
Here’s the final specification of each of the Graphite servers we chose:

* Dual Socket Server with two Intel Xeon E5-2637v3 3.5GHz CPUs
* 128GB of 2133MHz RAM
* Four 1.6TB NVMe MLC SSDs

Now, dual socket is considered the "sweet spot" in price-performance for enterprise rack servers. Single socket servers do not provide sufficient memory bandwidth for a high-performance DB, and quad socket servers are prohibitively expensive. We chose the fastest memory we could buy, hence 2133MHz. The majority of requests to Graphite are for recent data, so having 128GB of RAM to cache recently captured metrics enables Graphite to serve most requests from Linux’s disk cache stored in RAM. Furthermore, the dual socket configuration uses NUMA (Non-Uniform Memory Architecture). Each socket is connected via Intel’s QPI (Quick Path Interconnect) to 64GB of RAM providing a theoretical aggregate memory bandwidth of 136GB/second. The requirement of 2133MHz memory restricted our choice of CPU model, so we were only able to configure dual quad core CPUs. As long as the servers are not running too hot, these CPUs run at a turbo frequency of 3.7GHz, which is about as fast as you can obtain in an Intel-based rack server. CPUs with more cores tend to not turbo as fast due to limits on how hot they can be run.
 
Next, we loaded each server up with four 1.6TB SSDs. Each one of these cards plugs into the PCIe (Peripheral Component Interconnect express) bus. Previously, SSDs were traditionally connected to traditional SATA (Serial AT Attachment) or SAS (Serial Attached SCSI) buses that were designed to communicate with much slower spinning disks. However, the performance of modern SSDs is now limited by SATA or SAS interface performance. Recently, storage vendors and the Linux kernel support a new storage I/O specification called NVMe (Non-Volatile Memory express), providing direct access to SSDs on the much faster PCIe bus.

The new I/O performance needed to be matched by software that could keep up, and this presented its own challenges. The Graphite app that writes our Whisper files is called ``carbon-cache`` and it is written in Python, and therefore locked to one CPU. We were pretty confident that with ``fio`` unable to drive the new drives to their limit just writing random data, that any app that wrote structure data would be further behind.  So we changed out strategy around apps.

Previously, we had run a single copy of ``carbon-cache`` on each of the eight VMs that were being replaced, and they frequently ran at over 50% CPU each. So on each of the new physical servers we started up four copies of ``carbon-cache``, and used Graphite’s data routing app, ``carbon-relay``, to hash the load between them.  ``carbon-relay`` has only to hand metrics off, not calculate database updates, so it handles the load well. But what is notable is how much better each running copy of ``carbon-cache`` performs. They typically run at 17-19% CPU apiece. A combination of faster CPUs, no virtualisation penalty, faster memory, and no iowait!

# The Results

In short: the new hardware-based Graphite solution serves requests about five to seven times as fast as the virtualised SAN-hosted Graphite solution it replaced. Upgrading the Graphite hardware has moved the bottleneck to the user’s browser, as even a high-end desktop running a browser cannot handle chart rendering requests for say 100 metrics over 14 days at 10-second samples = 12 million data points. Before such a request would time out on the Graphite server. Now we can handle multiple concurrent similar requests with ease.

We also succeeded in eliminating almost 17,000 IOPs from our primary SAN. This provided significant performance gains to other latency-sensitive users of the SAN. Graphite produces a gruesome workload of storage cache-busting read requests that do not co-exist happily with other SAN workloads. Tellingly, write performance on the SAN did not change; it was read latency that was much improved.
 
As mentioned above, the majority of recent (e.g. that day’s) data is served from the very fast 128GB of RAM on the Graphite server. The remaining I/O into the SSD array is then incoming metric new data writes. We extensively monitored the RAID array’s performance under normal load with the Linux command ``iostat``:

```
avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           3.65    0.00    1.32    0.00    0.00   95.03
 
Device:         rrqm/s   wrqm/s     r/s      w/s    rMB/s    wMB/s avgrq-sz avgqu-sz   await r_await w_await  svctm  %util
nvme0n1           0.00     0.00    0.00 14940.00     0.00    58.39     8.00    12.92    0.86    0.00    0.86   0.00   7.20
nvme1n1           0.00     0.00    0.00 24163.00     0.00    94.42     8.00    14.53    0.60    0.00    0.60   0.00   8.90
nvme2n1           0.00     0.00    0.00  3263.00     0.00    12.78     8.02     0.06    0.02    0.00    0.02   0.01   4.20
nvme3n1           0.00     0.00    0.00  3375.00     0.00    13.20     8.01     0.06    0.02    0.00    0.02   0.01   4.10
md0               0.00     0.00    0.00 45741.00     0.00   178.80     8.01     0.00    0.00    0.00    0.00   0.00   0.00
```

In the above ``iostat`` output md0 is the RAID array and nvme[0,1,2,3]n1 are the four underlying SSD devices. Graphite generated a total of 45741 write commands for 179MB/sec of data written. The maximum time it took for the individual blocks to be persisted to disk was 0.86 milliseconds with a peak SSD utilisation of 8.9%. The server’s CPUs are 90% idle (the CPUs are hyper-threaded so CPU utilisation is reported as half of physical), and Linux spends no measurable CPU time waiting for I/O due to the high-performance NVMe interface the SSDs expose to the kernel.
 
We did, in fact, do some I/O performance testing and tuning of the SSDs prior to placing the servers into production. However, we quickly found that the primary bottleneck was 100% CPU utilisation from the ``fio`` disk performance tool we used. The 3.7GHz CPUs were simply not fast enough to enqueue or dequeue I/O through the kernel and to the RAID array. Below is the best ``fio`` benchmark result we could obtain, with commentary:

``fio``'s SSD test profile performs four tests in sequence – sequential read, random read, sequential write, and then random write. The block size was set to the default 4KB, and the fastest throughput we could obtain was with a queue depth of 128:
 
```
seq-read  : (g=0): rw=read, bs=4K-4K/4K-4K/4K-4K, ioengine=libaio, iodepth=128
rand-read : (g=1): rw=randread, bs=4K-4K/4K-4K/4K-4K, ioengine=libaio, iodepth=128
seq-write : (g=2): rw=write, bs=4K-4K/4K-4K/4K-4K, ioengine=libaio, iodepth=128
rand-write: (g=3): rw=randwrite, bs=4K-4K/4K-4K/4K-4K, ioengine=libaio, iodepth=128
```
 
* Sequential read performance was 1876MB/sec. Read IOPS was 480K, and latency was 266 microsecs. User CPU of 21% was the primary bottleneck:
 
```
seq-read  : io=65536MB, bw=1876.4MB/s, iops=480337, runt= 34928msec
lat (usec): min=64, max=13770, avg=266.26, stdev=99.45
cpu       : usr=20.62%, sys=79.43%, ctx=424, majf=0, minf=1135
```
 
* Random read performance was 1771MB/sec. Read IOPS was 453K, and latency was 282 microsecs. User CPU of 24% was the primary bottleneck. Random read access for SSDs is not that much slower than sequential read performance:
 
```
rand-read : io=65536MB, bw=1771.2MB/s, iops=453401, runt= 37003msec
lat (usec): min=64, max=13003, avg=281.99, stdev=56.98
cpu       : usr=24.28%, sys=75.82%, ctx=262, majf=0, minf=4257
```
 
* Sequential write performance was 1718MB/sec. Write IOPS was 440K, and latency was 291 microsecs. User CPU of 21% was the primary bottleneck. Write performance looks to be very similar to read:
 
```
seq-write : io=65536MB, bw=1717.8MB/s, iops=439735, runt= 38153msec
lat (usec): min=19, max=12445, avg=290.86, stdev=82.87
cpu       : usr=20.98%, sys=79.01%, ctx=623, majf=0, minf=1004
```
 
* Random write performance was 1530MB/sec. Write IOPS was 392K, and latency was 326 microsecs. User CPU of 26% was the primary bottleneck. Random write performance was the “slowest”:
 
```
rand-write: io=65536MB, bw=1530.1MB/s, iops=391926, runt= 42807msec
lat (usec): min=19, max=13972, avg=326.25, stdev=93.51
cpu       : usr=25.68%, sys=74.31%, ctx=411, majf=0, minf=6857
```
# The Future
 
Several remaining parts of our graphing system are undergoing upgrades and some work to scale out better, in order to match both the demand and the new capacity at the end of the chain. Our new hardware permitted us to uplift the storage retention for our data, keeping high resolution data for longer and medium resolution data indefinitely.  Our next challenges are the tooling, know-how, and opportunities to make use of this resource to better understand our estate.

*In summary, we built a massively performant database server that was more than five times as fast as the system it replaced. We have 10X headroom in I/O capacity as compared to our current Graphite workloads, and our limiting factor is probably the performance of some single-threaded parts of the Graphite application set – and we know how to expand that when we need to.  Our biggest problem is explaining to users that their browsers are simply not powerful enough to render the huge amount of data they keep on requesting from our insatiable Graphite servers!*
