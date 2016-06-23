---
layout:     post
title:      Scripting NetBackup Policy Creation
author:     tom_davidson
date:       2016-06-10 13:40:21
summary:    Veritas NetBackup has an extensive suite of CLI commands that can be used to configure most aspects of the product. However, documentation and examples of the use of these commands can be sparse.
finding the correct syntax for all the commands with the documentation and community 
Virtual Sports is one of our most popular products; here is one of the ways we improved our monitoring of it.
image:      tbc.png
category:   Backup
tags:       linux, unix, scripting, bash, vmware, netbackup, policy, slp, replication, air
---

Veritas NetBackup is a powerful backup platform, with extensive range of functionality. Some of the key features are the ability to backup a VMware Virtual Machine (VM) and to replicate backup images to remote sites.

Our requirement is to have a repeatable process that can be used to create many tens, even hundreds of policies to backup VMs and replicate them to one or two remote sites. The use of the NetBackup Java Remote Administration Console (RAC) to perform this configuration would be very time consuming and the risk of human error high. The consequences of could mean the inability to restore data in the event of a disaster.

### The Challenge

NetBackup does not yet have any APIs that can be used to programatically configure it, but it does come with extensive suite of CLI commands that can be used to configure most aspects of the product. However, documentation and examples of the use of these commands can be sparse and difficult to understand.

Some commands can be simple with a few, single option switches, but some can be very complex with tens of key-value pairs per switch, or with a variable number of key-value pairs depending on how many sub-operations you are configuring within a given object.

A policy can be as simple as a simple filesystem backup to local storage units with one schedule, or can be very complex with the backup of multiple VMs with a query language, multiple schedules, with multiple Storage Lifecycle Policies (SLP) each performing Auto Image Replication (AIR) to multiple sites, each of which may require import policies to be created on remote NetBackup Domains.

Putting all this together in a single one-liner tool with a few custom options requires that many CLI commands need to interact with the output from a previous command and modify their command line switches and options accordingly.

### something
blah

### Naming Conventions

This is a good point to briefly discuss naming conventions. In order to be able to maintain consistency across multiple policy creations, and especially across multiple users, it is essential to have a defined naming convention. For our purposes, the folowing naming convention was adopted, in which the various components of NetBackup are broken down into segment according to the Policy Type:
* All text is to be in lower case (to avoid complications in a mixed UNIX/Windows environment).
* Only alphanumeric characters and underscore are permitted.
* Underscores should be used in place of spaces.
* Any segment in <angled_brackets> is mandatory.
* Any segment in [square_brackets] is options.
* Other text must be reproduced verbatim.

The tags used in the sections below are defined in the table below.
| Tag  | Description |
| --- | ----------- |
| site | The datacentre site code
| owner | The owner of the data being backed up by this policy: bet, gam, infra, data
| type | The type of backup policy: vm, standard, windows
| name | Name is a short, arbitrary name detailing the kinds of servers/data policy/SLP covers.
| policy_name | The name of the policy that uses this SLP.
| schedule | The name of the schedule that an SLP will be used in.

| class | The optional Skybet Retention Class (see in the Schedules>VMware section below) is one of:
| platinum, gold, silver, bronze
It only needs to be defined to differentiate from servers of a similar type requiring different Skybet retention classes. e.g. VDI servers. 

### The Commands

## Configuring the variables

For this blog post, we will just statically define variables, but in real operations these will be dynamically set by other means. How do do this is left as an exercise for the reader.
``` bash
local_master=local.master.fqdn
remote_master=remote.master.fqdn
site=test_site
owner=infra
type=vm
schedule=weekly
policy=${site}_${owner}_${type}_nms

## Creating the policy

Creating the policy is the easy part. All you need is the name of the policy and the name of the master server:
``` bash
/usr/openv/netbackup/bin/admincmd/bppolicynew ${policy} -M ${local_master}
```

## Configure VMware Options

Now that we have our policy, we need to reconfigure it as VMware policy, rather than the default Standard (Unix) one. There are some key options for VMware policies that we need to set at this point to maximise the efficiency of VM backups, namely enabling the following:
* Block Level Incncremental Backup - this uses the VMware Changed Block Tracking capability of VM Hardware v7+ VMs.
* VMware Accelerator - this negates the need to re-copy every block for a Full backup, instead using blocks from the previous Full.
We also need to state the Storage Unit that the backup image will reside on. In order to be able to subsequently perform replication of backup images with AIR, we need to configure the policy with a destination of a DeDup storage device.
``` bash
/usr/openv/netbackup/bin/admincmd/bpplinfo ${policy} -set -active -pt VMware -blkincr 1 -use_accelerator 1 -residence stu_disk_appliance
```

## Setting VMware options for policy ${policy}
/usr/openv/netbackup/bin/admincmd/bpplinfo ${policy} -modify -use_virtual_machine 1 -alt_client_name MEDIA_SERVER -snapshot_method VMware_v2 -application_discovery 1 -snapshot_method_args file_system_optimization=1,rTO=0,snapact=2,drive_selection=0,Virtual_machine_backup=2,enable_vCloud=0,rHz=10,multi_org=0,rLim=10,disable_quiesce=0,nameuse=1,ignore_irvm=0,skipnodisk=0,exclude_swap=1,post_events=1,trantype=san

# Adding MEDIA_SERVER as a client to ${policy}
/usr/openv/netbackup/bin/admincmd/bpplclients ${policy} -add MEDIA_SERVER VMware VMware
Next, you need to craft a VMware Intelligent Policy (VIP) query to just select the subset of VMs you want and deselect the things you don't want. In this example, we first select any hosts we want (linking with OR and enclosing in brackets) and then deselect Test/Staging VMs and those that are powered off.

# Populating VMware Intelligent Policy (VIP) Query into ${policy}
/usr/openv/netbackup/bin/admincmd/bpplinclude ${policy} -add vmware:/?filter=(Displayname Contains "nms0" OR Displayname Contains "nmsdb0") AND NOT Powerstate Equal poweredOff AND NOT Displayname Contains "stg" AND NOT Displayname Contains "tst"
Then, you need to create the SLPs for each Schedule you plan to create.
If you are replicating to another site, first you need to create the Import SLPs in the destination site and then create the SLPs in the source site to first backup and then perform the replication.
# Creating Import SLPs on ${remote_master} for ${policy}
/usr/openv/netbackup/bin/admincmd/nbstl ${policy}_daily -add -uf 4 -residence stu_disk_remote_appliance -target_master __NA__ -target_importslp __NA__ -source 0 -managed 3 -rl 0
/usr/openv/netbackup/bin/admincmd/nbstl ${policy}_weekly -add -uf 4 -residence stu_disk_remote_appliance -target_master __NA__ -target_importslp __NA__ -source 0 -managed 3 -rl 3
/usr/openv/netbackup/bin/admincmd/nbstl ${policy}_monthly -add -uf 4 -residence stu_disk_remote_appliance -target_master __NA__ -target_importslp __NA__ -source 0 -managed 3 -rl 8

# Creating SLPs for ${policy}
/usr/openv/netbackup/bin/admincmd/nbstl ${policy}_daily -add -uf 0,3 -residence stu_disk_appliance,__NA__ -target_master __NA__,${remote_master} -target_importslp __NA__,${policy}_daily -source 0,1 -managed 0,0 -rl 0,0
/usr/openv/netbackup/bin/admincmd/nbstl ${policy}_weekly -add -uf 0,3 -residence stu_disk_appliance,__NA__ -target_master __NA__,${remote_master} -target_importslp __NA__,${policy}_weekly -source 0,1 -managed 0,0 -rl 3,3
/usr/openv/netbackup/bin/admincmd/nbstl ${policy}_monthly -add -uf 0,3 -residence stu_disk_appliance,__NA__ -target_master __NA__,${remote_master} -target_importslp __NA__,${policy}_monthly -source 0,1 -managed 0,0 -rl 8,8
Otherwise, just create the local SLPs.
# Creating SLPs for ${policy}
/usr/openv/netbackup/bin/admincmd/nbstl ${policy}_daily -add -residence stu_disk_appliance -rl 0
/usr/openv/netbackup/bin/admincmd/nbstl ${policy}_weekly -add -residence stu_disk_appliance -rl 3
/usr/openv/netbackup/bin/admincmd/nbstl ${policy}_monthly -add -residence stu_disk_appliance -rl 8
After that, you can create all your Schedules and their associated SLPs and backup windows. I have included a section for each Skybet Retention Class.
# Creating weekly full schedule in ${policy} to use created SLPs
/usr/openv/netbackup/bin/admincmd/bpplsched ${policy} -add weekly -st FULL -residence ${policy}_weekly -res_is_stl 1
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} weekly -rl 3 -freq 345600
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} weekly -2 28800 28800

# Creating daily schedule in ${policy} to use created SLPs
/usr/openv/netbackup/bin/admincmd/bpplsched ${policy} -add daily -st INCR -residence ${policy}_daily -res_is_stl 1
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} daily -rl 0 -freq 86400
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} daily -0 21600 18000
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} daily -1 28800 28800
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} daily -3 28800 28800
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} daily -4 28800 28800
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} daily -5 28800 28800
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} daily -6 21600 18000
# Creating weekly full schedule in ${policy} to use created SLPs
/usr/openv/netbackup/bin/admincmd/bpplsched ${policy} -add weekly -st FULL -residence ${policy}_weekly -res_is_stl 1
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} weekly -rl 3 -freq 345600
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} weekly -2 28800 28800

# Creating daily schedule in ${policy} to use created SLPs
/usr/openv/netbackup/bin/admincmd/bpplsched ${policy} -add daily -st INCR -residence ${policy}_daily -res_is_stl 1
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} daily -rl 0 -freq 86400
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} daily -0 21600 18000
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} daily -1 28800 28800
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} daily -3 28800 28800
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} daily -4 28800 28800
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} daily -5 28800 28800
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} daily -6 21600 18000
# Creating weekly full schedule in ${policy} to use created SLPs
/usr/openv/netbackup/bin/admincmd/bpplsched ${policy} -add weekly -st FULL -residence ${policy}_weekly -res_is_stl 1
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} weekly -rl 3 -freq 345600
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} weekly -2 28800 28800
# Creating monthly full schedule in ${policy} to use created SLPs
/usr/openv/netbackup/bin/admincmd/bpplsched ${policy} -add monthly -st FULL -residence ${policy}_monthly -res_is_stl 1
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} monthly -rl 8 -freq 2419200
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} monthly -0 0 3600
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} monthly -1 0 3600
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} monthly -2 0 3600
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} monthly -3 0 3600
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} monthly -4 0 3600
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} monthly -5 0 3600
/usr/openv/netbackup/bin/admincmd/bpplschedrep ${policy} monthly -6 0 3600
Everything is now complete. You can display the VIP query and perform a test of the query to check the list of VMs that will be backed up.
# Displaying policy query for ${policy}
/usr/openv/netbackup/bin/admincmd/bpplinclude ${policy} -L
# Testing policy query for ${policy}
/usr/openv/netbackup/bin/nbdiscover -noxmloutput -noreason -includedonly -policy ${policy}
Finally, you should be able to initiate a manual backup from the CLI, only there is a bug (under investigation with Veritas) and it doesn't work until you perform the following:
Click on the policy and click on the edit policy button. Infrastructure & Security Delivery > NetBackup Operational Support > image2016-3-15 11:14:25.png
Click on the Clients Tab.
Don't make any changes and click OK.
This is now resolved with the step of adding "MEDIA_SERVER" as a client to the policy.
Now you can initiate a manual backup from the CLI.
# Initiating manual backup for ${policy}
/usr/openv/netbackup/bin/bpbackup -i -p ${policy} -s weekly




There are many CLI commands that are required to create a fully functional policy, and it's beyond the scope of this document to document all the possible options we might use. Instead, I've documented how I've setup all the policies by default, with sections to cover off each of the different Skybet Retention Classes. For anything outside this scope, the reader is invited to RTFM.

### Wrapping Up

some closing content will go here.
