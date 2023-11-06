---
layout:     post
title:      If you can describe it, you can automate it
date:       2021-04-16
summary:    The truly Agile team never has enough time to make any product the best it can be. Yet there is a difference between "it will have to do" and "this is good enough _for now_". This is the story of automation, of continuous iterative improvement. A story of a horrendous manual process that was rarely used and never properly understood, and the work to turn it into a better, more automated process. Along on this adventure, you will meet a Core design pattern, a lot of Bash, a cunning Chef hack, a dramatic MySQL oversight, and a surprising lesson in agility.
category:   Devops
tags:       bash,chef,hashicorp,percona,mysql,backup,automation
author:     andrei_sandu
---
## The design pattern

When you hear stories involving big, monolithic code repositories, they tend to end in, or at least centre around, a lament against legacy code and un-maintainability,
with an optional ridiculous story about a 1000 line single SQL statement. The story of core_mysql is somewhat odd in that category - while absolutely a big, seemingly
monolithic structure, this has a different, more content ending than your usual anecdote of this kind. Put simply, core_mysql is Core Customer Tribe's solution to the
problem of persistent storage, and it has been iterated upon whilst in service for a long time. It has been two years since we put it live for the first time, in which
time more than 60 new versions have been released, expanding well beyond its initial functionality. Initially built for a single use case, with a specific if not so
tight deadline, the Chef-based solution has grown to cover multiple use cases, handle encryption at rest and in transit, multiple databases, users, custom configurable
user permissions, countless monitoring items, backup, disaster recovery and other fancy-sounding features. At the time of writing, the cookbook turned design pattern
has helped deploy five highly available database clusters handling diverse data, from customer Safer Gambling data to Payments, Document Verification data, and static
assets(don't ask!). And, for what it's worth, we are actually really proud of it! Without going into too much detail, core_mysql is a design pattern that uses
[Percona XTraDB Cluster](https://www.percona.com/software/mysql-database/percona-xtradb-cluster) to build and deploy a highly available synchronous cluster. It
also deploys [ProxySQL](https://proxysql.com/documentation/) for service discovery, configures Table Encryption,
[XTraBackup](https://www.percona.com/software/mysql-database/percona-xtrabackup) for data backup, monitoring and alerting via Nagios/NRPE and collectd/Graphite,
and can deploy and configure cross-site asynchronous replication for Disaster Recovery purposes. It is a complex solution, designed to accommodate as many use
cases and provide as many useful features as possible. At the centre of it all sits the sbg_core_mysql Chef cookbook, which installs and configures all the components
needed for this to work. Clocking at fourteen interlinked recipes and seven custom resources, the cookbook has been built upon non-stop since it was first deployed.

Most components of core_mysql are currently some level of automated - this was the ultimate intention behind it, to make persistent storage available, repeatable,
and easy-to-use across the tribe. However, this was not always the case. As it so often happens in this industry, deadlines meant that we had no shortage of elements
left to be automated at a later date "when we had the time". I like to think we did a great job of delivering on those promises with time. Sometimes out of necessity,
when new requirements arose from the roadmaps of the tribe, other times simply on an ad-hoc basis when there was time, out of passion, or out of the frustration of
some engineer having to deal with manual processes. This post will examine one example of such an arduous manual process I recently automated, the challenges it
presented and the adventure it took me on. The process in question is the restore from backup process.

## The backup restore process

While the backup process for core_mysql has always been a question of running a backup script - roughly speaking a push-button job - the backup restore process
has been far less thought out. The process has always been manual, and to put it mildly, it is a very complex operation. Recently, we have better documented the
process as part of a new compliance piece (as well as wanting better on-call documentation in general), but that does not solve the main issue with it:
it's MASSIVE! It is a seven-step, six-page behemoth of a runbook - and it needs to be this big - and has been affectionately called the longest runbook
known to man. Since we rarely had to actually restore from a backup, we have been content with the manual process for a long time. That said, it was a cause
of much toil and frustration whenever the process was needed. There is only so much that knowledge sharing sessions can hope to accomplish, the ideal situation
would be a process that is straightforward.

SBG often runs what we call a DR Dry Run. We pretend that our live environment has been compromised, and act out our plan for Disaster Recovery,
failing over to a secondary site. In the context of core_mysql, that meant we have to transfer data from our cross-site replication servers into
the database clusters built into the DR site. It was this use case that had got the most use out of the backup restore process, it being the main
cleanup step following the DR Dry Run. I took part in a DR Dry Run in October and finally finished at 7pm after running through the painful manual
process that I had created. It was obvious to me then what a tremendous pain point this process could become in the wrong scenario. The fact we don't
usually need to restore from backup, in my mind, would only amplify the pain when we do need to do so.

I was taught that if you can describe a process, you CAN automate it. There already was a step-by-step runbook of how the process is performed.
So I decided to make a straightforward, automated process for it.  I knew it was possible, it had to be - and I hoped I would learn something from it.

## Challenges

There is a reason why the manual runbook was so complex. Aside from the obvious considerations for a backup restore scenario (there will be an outage,
the process is destructive, etc.), there is an important consideration for Table Encryption. A requirement from the very beginning, our solution for
Table Encryption has always been complicated in subtle ways. Without getting into too much detail, we used a readily available Table Encryption solution for
encryption at rest, which relies on a keyring file for encryption and decryption (essentially a master encryption key, although with a few twists that
fortunately are not relevant for the problem at hand). This posed a problem regarding the storage and integrity of the encryption key, as the backups we
take are encrypted (so long as Table Encryption is used). Restoring the backup, therefore, does not guarantee we get the data back, unless we also have the
right encryption key to unlock that data. Known as "Step 5 of the longest runbook known to man", this problem constituted the most esoteric and confusing
obstacle to automation, and it involved interacting with Hashicorp Vault and understanding the custom (and convoluted) way we used it to preserve the
integrity and history of the encryption keys we use. The cookbook deals with key rotation by storing and archiving all encryption keys in Hashicorp
Vault - the company-approved choice for all our secret-keeping needs. This way, both the integrity and the history of our Encryption Keys is preserved via Chef,
courtesy of a big custom-designed resource. We had Chef recognise when the key was missing on disk so it can restore it from Vault; similarly, we had Chef
recognise when the key had rotated, so that it could have the archived key still available if needed. Most relevant for the problem at hand, if we were to
restore from a backup, we would have to make sure that the encryption key on disk was the same as the one present at the time we had taken said backup.

## The solution

Early on, a naive solution in the shape of a Jenkins pipeline has quickly presented itself. We are dealing with multi-server clusters, after-all, and Jenkins
is designed for just such requirements. It is a well understood tool, synonymous with push-button jobs, and (in theory) should be able to achieve what I seek.
The only obstacle to this approach was the problem of Encryption restore, and the fact that I would need to make Jenkins interact with our Hashicorp Vault API.
I was initially quite confident that I would learn what I needed to make it work quickly, in an epic feat of Learning and Development, however, after a brief
read-through of everything I could find about Hashicorp Vault API, I eventually had to accept I would not be able to find the odd, specific solution I needed.
In truth, I failed to find a way to interact directly with the Vault API through Jenkins altogether. If I were brutally honest with myself, there probably
is a way to do so, I just never found the right resource for it. All the same, I had grown impatient, and was longing for progress.

I realised I needed a different approach if I were to deliver anything. It had occurred to me that all these issues I had solved before, that I did not need a
brand new, shiny solution. Instead, I decided to stay faithful to the existing design pattern, and harness the techniques my squad had perfected in dealing with
all things core_mysql (and many other situations, as well). I decided to code what I know, and rely on what I already have and know. If there is one technical skill
I excel at, it is Chef and Ruby! I had worked on core_mysql for three years, and there is a reason why Chef is the heart of it all. I know Chef! I have used it
before to interface with Hashicorp Vault! I could make it work in the context of a backup restore!  Likewise, I have solved automation problems before: I have
automated Replication Setup using Bash scripts. I have written the manual runbook, I should be able to translate it into Bash. This would strip away the glamour
of a Jenkins pipeline, with a literal push-button, but on the other hand it would allow me to make progress faster (as well as allowing me to establish a
solid baseline to expand upon).

The decision was made. A couple of coding sessions, and a handful of testing sessions later, the solution was proven and production-ready. A Chef-controlled
Bash script would be installed on the MySQL servers, which takes the backup file paths as parameters and performs the backup restore steps. The brunt of the
necessary work was in truth quite uninteresting - the sequence of steps were already there, in the manual runbook, simply awaiting to be translated into Bash.
I made sure the script fails safely as much as possible, and tested the different failure states on one of the test clusters. I endeavoured to make the script
as verbose as possible, and included a confirmation step as an extra safety measure. But I would like to focus attention on two aspects that I found surprisingly
insightful, and interesting to deal with, respectively.

First, I want to highlight that while production-ready and deployed, the present solution is still very much bare-bones. Aside from the fact that it is
essentially just a Bash script, rather than an intuitive Jenkins Pipeline, it does not deal with taking the cluster down, and it assumes that the backup
originated from the same server. Yet, I see this as a strength, rather than a weakness. The solution is good enough for now., which has always been the
underlying theme with core_mysql . We have always shipped solutions that are "good enough", then continuously built upon them every step of the way. This
is how this huge design pattern has come to grow this big, and this is why it is successful. The present backup restore solution has achieved what was set
out - the runbook is a third the size of the old manual one, it is far less prone to error or failure, and it shall save a lot of time, especially in DR
exercises. Everything else will come later, as soon as we have the time to improve it. And we will, eventually, because we care about it. I know, for
example, that given the present baseline, I can integrate it in a Jenkins pipeline at some point.

Secondly, the focus of this whole endeavour has been the problem of the Encryption Keys, and interacting with Hashicorp Vault. As mentioned previously,
we have used Chef resources to interact with Vault's API in the past. It made sense to exploit that capability further, so I created a similar custom Chef
resource, aimed solely at restoring the correct Encryption key to disk. But putting it in Chef meant it would be evaluated every time Chef ran, which,
given we have daemonised chef-client on pretty much all our servers, would be quite often. In order to ensure it only executed when a backup restore is
ongoing, I needed to tie this Chef resource to the Bash script somehow. The way to achieve this is simple, but effective. I had the Bash script place a
file on disk as part of the backup restore process, containing the necessary information for Chef to know which Encryption key to restore. Then, I had
the new Chef resource listen for that file on disk, and only execute if it is present. Lastly, I had Chef delete that file whenever it finds it. That way,
the only time Chef tries to restore a specific Encryption key is when it runs right at the end of a backup restore. I find it almost poetic how Chef
controls the Bash script, but in turn, that Bash script controls Chef's execution whenever it is triggered.

## The Belly of the Beast

It was a sunny early spring Friday, when it became clear that something was certainly wrong. The evening before I had tried and failed to perform a now
routine test of the backup restore process on one of our test clusters. It was not the first time I had seen this kind of error, but this time there was
no doubt: the process did not work. I do not mean the automated script had a bug, but the process itself was flawed - I had tried every backup in the
last week, both the ones scheduled each night, and backups taken manually. I had tried the manual runbook, switching the order of steps - nothing was
working. I was off the next week, and on Thursday was scheduled the first DR Dry Run that would have used the new shiny automated process for backup restore.

I was not to know yet, but the "longest runbook known to man" was missing a step. It transpires that xtrabackup (the backup tool we use) has a --prepare
command, designed to ensure the backup is ready to be restored. This option deals with encryption when present, and is important in order to ensure the
data does not get corrupted after it gets restored. However, it appears this step is not always a deal breaker, as we have successfully restored backups
without using it in the past. But not reliably - in fact, at the second demo we held within the tribe, and the one which we recorded on video, the backup
restore failed. At that time, it was only that backup that failed to restore, so we wrote it off as one corrupt backup - an exception to the rule.

This terrifying Friday got me thinking about the importance of testing our processes. As previously stated, backup restore was seldom used until recently.
It is this infrequency that allowed a potentially devastating flaw to slip through in our runbook - and by extension, in my script. Conversely,
it is the dawn of routine testing for this process that uncovered it, and prevented it surfacing when we need the process to work perfectly/in an
actual incident. It also got me to appreciate my team's culture of covering for one another. Early in the day, two of my colleagues offered to look
into the issue with me, and continue investigations while I was off. They discovered the missing step, and pointed me to the best way to fix the automated
script upon my return! The DR Dry Run completed without too much trouble thanks to them.

Fixing this bug required me to re-think the way I dealt with Encryption restore, as the --prepare command requires the encryption key to be present
before the data is restored. I ended up refactoring the chef resources, in order to separate the Encryption Restore logic from the rest of the cookbook.
I had the script run chef-client with a custom runlist, before the --prepare command, using only the recipe necessary for Encryption Restore.

## Conclusions

First and foremost, this project has been a success. We have already saved a lot of time when we conducted our first backup restore test a couple of
weeks after the project was done, and not too long before the time of writing, and that economy will only grow as time passes. A less tangible boon,
yet I would argue a more important one, is that we have reduced the chances of human error associated with this process. Now, this is a very hard one
to measure, because we rarely ever used the process at all, and when we did, I was usually the one to perform the feat (even so, I remember screwing
up at times, thankfully not in Production). But there is no denying this is the case, and it is a lot more valuable than the time the new script
will save. We would ideally never need to do a restore from backup in Production, but if we ever do, I am now far less terrified of the thought, and
this is thanks to the shortening of the "longest runbook known to man".

Furthermore, I take pride in the circumstances by which this script has come to be. We identified a point of pain that was extremely rarely felt, yet
we saw its potentially disastrous impact. In other words, we were proactive! This project was not planned out, it was not put on any roadmaps, it was
not prioritised nor refined - at least not to begin with. It was incepted as a Learning and Development project. and yet, it was delivered. What's more,
my team is now looking at formalizing this kind of project born out of L&D. We saw the value in it, and I was empowered to do it. More than that, I was
given the whole team's support when it went wrong.

For as large a codebase as core_mysql is, it never ceases to amaze me how much more it always seems to need to grow. This is a loved product, one in which
I personally believe, and one which I want to see succeed. It will never be perfect, but it will always be better than it used to be. This little project,
the automation of backup restore, is but the latest example of a set of engineering practices that has guided my team and I, ones that I found myself
contemplating about every step of the way. I see it as nothing but a good example of those principles. I started by exploring shiny solutions, but realized
the value of coding what I know, and building with the tools closest to me. In the beginning, I had imagined a big single-button cluster-level solution, that
solves all the problems, and covers all the possible edge cases, but then I had to accept that if I were to deliver anything, I had to stick to the bare-bones
solution which is good enough for now. I had to remind myself of the difference between "That's enough, it will do" and "This is good enough for now" - that
is, a difference in mentality spawning from caring about my code and vowing to improve it continuously, and incrementally. This design pattern is not just a
monolith the kind of which engineers tell horror stories about, it is a supported, ever evolving thing, which builds upon its past.
