---
layout:     post
title:      Scripting NetBackup Policy Creation
author:     tom_davidson
date:       2016-06-24 13:40:21
summary:    The documentation and examples of the use of NetBackup commands can be sparse. Here is how we used the CLI to script our policy creation.
image:      veritas_bash.png
category:   Deployment
tags:       linux, unix, scripting, bash, vmware, netbackup, policy, slp, replication, air
---

Veritas NetBackup is a powerful backup platform, with extensive range of functionality. Some of the key features are the ability to backup a VMware Virtual Machine (VM) and to replicate backup images to remote sites.

Our requirement is to have a repeatable process that can be used to create many tens, even hundreds of policies to backup VMs and replicate them to one or two remote sites. The use of the NetBackup Java Remote Administration Console (RAC) to perform this configuration would be very time consuming and the risk of human error high. The consequences of this could mean the inability to restore data in the event of a disaster.

## The Challenge

NetBackup does not (yet) have any APIs that can be used to programatically configure it, but it does come with extensive suite of CLI commands that can be used to configure most aspects of the product. However, documentation and examples of the use of these commands can be sparse and difficult to understand.

Some commands can be simple with a few, single option switches, but some can be very complex with many key-value pairs per switch, or with a variable number of key-value pairs depending on how many sub-operations you are configuring within a given object.

A policy can be as simple as a simple filesystem backup to local Storage Units (STU) with one schedule, or can be very complex with the backup of multiple VMs with a query language, multiple schedules, with multiple Storage Lifecycle Policies (SLP) each performing Auto Image Replication (AIR) to multiple sites, each of which require import policies to have been created on remote NetBackup Domains.

Putting all this together in a single one-liner tool with a few custom options requires that many CLI commands need to interact with the output from a previous command and modify their command line switches and options accordingly.

I'm not going to go into the meaning of every option for every command, but simply present the commands that worked for us. If you require more details, please drop me a line or consult the man pages or Veritas Tech Support.

### Naming Conventions

This is a good point to discuss naming conventions. In order to be able to maintain consistency across multiple policy creations, and especially across multiple users, it is essential to have a defined naming convention. For our purposes, the following naming convention was adopted, in which the various components of NetBackup are broken down into segments according to the Policy Type:

* All text is to be in lower case (to avoid complications in a mixed UNIX/Windows environment).
* Only alphanumeric characters and underscore are permitted.
* Underscores should be used in place of spaces.
* Any segment in `<angled_brackets>` is mandatory.
* Any segment in `[square_brackets]` is options.
* Other text must be reproduced verbatim.

The segments we have used are defined in the table below.

| Segment  | Description |
| :--- | :----------- |
| site | The datacentre site code
| owner | The owner of the data being backed up by this policy: bet, gam, infra, data
| type | The type of backup policy: vm, standard, windows
| name | Name is a short, arbitrary name detailing the kinds of servers/data policy/SLP covers.
| policy_name | The name of the policy that uses this SLP.
| schedule | The name of the schedule that an SLP will be used in.

The actual naming convention is as follows:

| Object | Naming Convention |
| :--- | :--- |
| Policy | ```<site>_<owner>_<type>_<name>```
| SLP | ```<policy_name>_<schedule>```
| Schedule | ```hourly, daily, weekly, monthly, yearly```

## The Commands

### Configuring the variables

For this blog post, we will just statically define variables, but in real operations these will mostly be dynamically set by other means. How do do this is left as an exercise for the reader.

``` bash
local_master=local.master.fqdn
remote_master=remote.master.fqdn
local_stu=stu_disk_${local_master%%.*}
remote_stu=stu_disk_${remote_master%%.*}
vcenter_server=vcenter.server.fqdn
site=test_site
owner=infra
type=vm
schedule=weekly
policy=${site}_${owner}_${type}_nms
```

To ease the readability of the bash commands, we are going avoid prefixing the full path for most commands by setting the PATH variable to a sensible value. Please be aware that while most of these commands are in the `/usr/openv/netbackup/bin/admincmd` path, the test/display commands used at the end are in the `/usr/openv/netbackup/bin` path. You will need to allow for this in your scripts if you don't set the PATH.

``` bash
NBU_BIN=/usr/openv/netbackup/bin
PATH=$NBU_BIN/admincmd:$NBU_BIN:$PATH
MANPATH=/usr/openv/man:$MANPATH
export PATH MANPATH
```

### Creating the policy

Creating the policy is the easy part. All you need is the name of the policy and the name of the master server:

``` bash
bppolicynew ${policy} -M ${local_master}
```

### Configure as VMware policy

Now that we have our policy, we need to reconfigure it as VMware policy, rather than the default Standard (Unix) one. There are some key options for VMware policies that we need to set at this point to maximise the efficiency of VM backups, namely enabling the following:

* Block Level Incncremental Backup - this uses the VMware Changed Block Tracking capability of VM Hardware v7+ VMs.
* VMware Accelerator - this negates the need to re-copy every block for a Full backup, instead using blocks from the previous Full.

We also need to state the Storage Unit that the backup image will reside on. In order to be able to subsequently perform replication of backup images with AIR, we need to configure the policy with a destination of a DeDup storage device (though this will be overridden later).

``` bash
bpplinfo ${policy} -set -active -pt VMware -blkincr 1 -use_accelerator 1 -residence ${local_stu}
```

### Setting VMware Options

There are some additional options that apply to VMware policies that can only be set once the policy is a VMware policy. This is a very long command line, and the majority of the options are to do with configuring the VMware snapshot method that will be used to create a VM snapshot and then back it up.

Because these options are somewhat cryptic, and because you have to specify *all* of them, I found it easier to create a human readable configuration file and then construct the command line with a shell function using that config file, but I've simply displayed the command here.

``` bash
bpplinfo ${policy} -modify -use_virtual_machine 1 -alt_client_name MEDIA_SERVER -snapshot_method VMware_v2 -application_discovery 1 -snapshot_method_args file_system_optimization=1,rTO=0,snapact=2,drive_selection=0,Virtual_machine_backup=2,enable_vCloud=0,rHz=10,multi_org=0,rLim=10,disable_quiesce=0,nameuse=1,ignore_irvm=0,skipnodisk=0,exclude_swap=1,post_events=1,trantype=san:nbd,serverlist=${vcenter_server}
```

### Populating VMware Intelligent Policy Query

We are now ready to select out clients to backup. You can do this manually, but NetBackup provides a much better way of selecting the VMs to backup - using a VMware Intelligent Policy (VIP) query. This is a powerful query language that can select VMs based on the hostname, VM display name, ESXi host they reside on, whether they are powered on and many more. It has the traditional logical operators that you would expect, and can also be configured with parentheses for more advanced queries.

In our example, we are creating a VIP query that selects VMs based on the displayname of the VM in vCenter (because not all of our VMs have valid hostnames for legacy reasons). The query selects VMs with a displayname that contains one of two strings, concatenated with a logical OR and enclosed in parentheses. It's output is then filtered using AND NOT to exclude any Test or Staging VMs and any VM that is powered off.

``` bash
bpplinclude ${policy} -add vmware:/?filter=(Displayname Contains "nms0" OR Displayname Contains "nmsdb0") AND NOT Powerstate Equal poweredOff AND NOT Displayname Contains "stg" AND NOT Displayname Contains "tst"
```

### Adding MEDIA_SERVER as a client

This next step resolves an issue that seems not to be documented adequately by Veritas. Having created a policy using all the CLI commands in this article (excluding this section), I found that when I tried to perform a manual backup of the policy, it returned an error 239 that no clients could be found. I discovered that if you edit the policy, click on the Clients tab, *don't* make any changes and click OK, it then works.

Cue extensive investigation with Veritas Tech Support, who were at times clearly reluctant to investigate further, stating something along the lines of, "None of our customers has ever tried to do this before. We can investigate, but you'll have to provide debugging logs". You (Veritas) provide the CLI as an interface to the product - I cannot believe no-one has tried it before!

Anyway, it was discovered that you *must* have a client defined in the policy, even though you are backing up VM clients using a VIP query. To this end, there is a reserved word "MEDIA_SERVER" that you must add as a VMware client to the policy.

``` bash
bpplclients ${policy} -add MEDIA_SERVER VMware VMware
```

### Creating Storage Lifecycle Policies

In order to be able to replicate backup images to a remote NetBackup Domain (with a different master server), we need to create Storage Lifecycle Policies. These control where a backup image is initially written and the retention time of the image. They can also have subsequent actions, such as to Duplicate (same NBU Domain) or Replicate (different NBU Domain) the images to another destination.

We have a need to ensure that an off-site backup image is created, and this is performed using NetBackup AIR. This maximises the bandwidth of your WAN link by utilising deduplication data and only sending unique blocks when replicating.

Configuring SLPs via the command line is the most complex part of the process as they require multiple, comma separated values to some options, depending on the number of actions in the SLP.  The complexities of this are too great to go into in fine detail here, but hopefully this will give an indication of how the SLP configuration command line is constructed.

For simplicity, we are only covering the creation of a weekly schedule and associated SLPs. In reality, you may well have daily, monthly and even yearly schedules and SLPs. However, the basics of the configuration is the same. From a naming convention perspective, we have simply taken the policy name and added a suffix indicating the name of the schedule to which this SLP will be linked. We have also kept the name of the remote SLP the same as that of the local SLP. This also has the side effect of being able to easily see in the RAC when this specific import job is running and know that it relates to a backup image of a particular policy from the source site.

### Creating Import SLPs in remote NBU domain

The first step in configuring SLPs for replication is to create an Import SLP in the remote NBU domain. Because the remote NBU domain has no knowledge of anything about the backup image, it needs to run an import job once the replication is complete. This is specified in the local SLP and consequently the remote import SLP must already exist or the command will fail.

When creating an Import SLP, the "used for" switch (`-uf`) is set to 4 to set this as an Import action. You then need to specify the dedup STU where the image will reside on the remote site. Some of the options for the command to create/modify an SLP must be specified, even if the option is not relevant for the action. This is done by the presence of the `__NA__` tag. You can also configure the retention level (`-rl`) of this replicated image if you require it to be different from the source image.

``` bash
ssh ${remote_master} /usr/openv/netbackup/bin/admincmd/nbstl ${policy}_weekly -add -uf 4 -residence ${remote_stu} -target_master __NA__ -target_importslp __NA__ -source 0 -managed 3 -rl 3
```
This is performed from the local master server over SSH using public keys.

### Creating local SLPs

Now that we have our remote SLP created, we can configure the local SLP. The command syntax is the same, but this time, we are creating a Backup action followed by a Replication action in the SLP. This necessitates adding additional comma separated values to most of the options. For all those options, the structure is the same: the value for the first action for each option is the first comma separated value. The value for the second action is the second comma separated value etc. While it seems complicated, the hard part is actually getting the right option values for the each of the options that action requires, including when to use the `__NA__` tag.

For the Backup action:

* The "used for" switch (`-uf`) is set to 0 (Backup)
* We need to specify the dedup STU there the image will reside in the `-residence` option. 
* The `-target_master` and `-target_importslp` have no meaning, so use the `__NA__` tag.

For the Replication action

* the "used for" switch (`-uf`) is set to 3 (Replication)
* We use the `__NA__` tag for `-residence` since the import SLP controls this.
* Now we specify the master server FQDN in the remote site for `-target_master`
* The value for `-target_importslp` is the name of the dedup STU in the remote site.

When you use an SLP in a schedule as we are, it overrides certain values in the policy and the key ones are retention level and residence (STU). Consequently, we need to take care to set the retention level (`-rl`) in the SLP to the desired value. In this case, a value of 3 means a retention of 1 month, typical for a weekly backup.

``` bash
nbstl ${policy}_weekly -add -uf 0,3 -residence ${local_stu},__NA__ -target_master __NA__,${remote_master} -target_importslp __NA__,${policy}_weekly -source 0,1 -managed 0,0 -rl 3,3
```

If you wanted to replicate to two different NBU domains, you need to add an additional series of comma separated values to the options as per the example below.

``` bash
nbstl ${policy}_weekly -add -uf 0,3,3 -residence ${local_stu},__NA__,__NA__ -target_master __NA__,${remote_master},${remote_master2} -target_importslp __NA__,${policy}_weekly,${policy}_weekly -source 0,1,1 -managed 0,0,0 -rl 3,3,3
```

### Creating Schedules

The final stage is to create the schedules in the policy. This has to happen last because we need to specify the SLP as a destination for the backup image.

### Creating weekly full schedule

The first step is adding the schedule itself. We give it a name (`-add`) and state that the type of backup is a full backup (`-st`). The next options override the policy default residence (STU) and retention levels by specifying the SLP to the `-residence` option and adding an option to state that it is a **ST**orage **L**ifecycle destination.

``` bash
bpplsched ${policy} -add weekly -st FULL -residence ${policy}_weekly -res_is_stl 1
```

Then we configure it with a frequency based schedule, specifying the retention level (which will be overriden) and the frequency in seconds. It's easier to use shell arithmetic here if you don't know off the top of your head how many seconds there are in a week!

``` bash
bpplschedrep ${policy} weekly -rl 3 -freq $[86400*7]
```

Lastly, we define the schedule window. The day that the schedule will run on is a numeric switch using the usual Unix day numbering scheme where Sunday is 0. The two values to this option are the start time in seconds after midnight and the duration of the window, also in seconds. Again, the use of shell arithmetic helps here, specifying a 2am start and lasting for 4 hours in this example.

``` bash
bpplschedrep ${policy} weekly -2 $[3600*2] $[3600*4]
```

You can add multiple schedule windows all on the same command line, though we found it easier just to put the days of the week into a for loop and run a separate `bpplschedrep` each time.

### Check Your Work

Our policy creation is now complete. We can use the CLI to check what we have done and that it works as expected. Finally, once you are happy, you can kick off a manual backup using a defined schedule, rather than waiting for the schedule to trigger.

### Displaying policy settings

You can display many of the basic settings for your policy and it's schedules in a mostly human readable format with the following commands.

``` bash
bpplinfo ${policy} -L
bpplsched ${policy} -L
```

### Displaying policy query

It is also possible display the VIP query. You might want to do this as if you run multiple `bpplinclude` commands to correct a minor error, you in fact add multiple VIP queries and these could potentially result in multiple simultaneous backups of VMs.

``` bash
bpplinclude ${policy} -L
```

### Testing policy query

We can also test exactly which VMs the VIP query evaluates to by running the following command. If you remove the `-includedonly` switch, you will get an unsorted list of all VMs, prefixed with a + for included and a - for excluded.

``` bash
nbdiscover -noxmloutput -noreason -includedonly -policy ${policy}
```

### Initiating manual backup

Now you can initiate a manual backup from the CLI, specifying the schedule you wish to use.

``` bash
bpbackup -i -p ${policy} -s weekly
```

## Conclusion

This is just an example of what can be achieved by scripting NetBackup. There are many enhancements that could be made using the CLI tools that NetBackup provides. We have also scripted the migration of production DBs from our legacy NetBackup platform to a new one and have used it multiple times successfully.

I do actually have a script and a suite of shell functions that turn all the above into a one-liner with three options, but it's a bit dirty and kludgy and not really ready for publication! But I have used it to deploy most of our production VM backup policies, so it *does* work.
