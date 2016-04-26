---
layout:     post
title:      Deploying Consul in AWS 
date:       2016-04-26 07:00:00
summary:    Looking at deploying a Consul cluster into AWS and how we can rollout upgrades with no loss of service
author:     adam_pointer
image:      consul_logo.png
category:   Deployment
tags: consul, aws, autoscaling, terraform
---

Before we start talking about how deploying Consul into AWS, it probably makes sense to start by giving a brief overview of what Consul actually is. For those of you who do not know what Consul is at all, it is a distributed service discovery and configuration application. Think *Apache Zookeeper* or *etcd*, but written by those clever chaps at HashiCorp. For this post, I really want to focus more on Consul's clustering capabilities, as this is what really sets it apart and enables us to do some neat tricks with AWS to allow rolling updates with no loss of service and also how we can make a cluster totally self-healing.

Next I will go on to discuss some of the small features of the AWS suite and how we at Sky Betting and Gaming use them to deploy our services.

Finally let's pull it all together and look at how to leverage the power of AWS combined with Consul's clustering.

## Consul Clustering
A Consul node can run in two different modes. As an agent, or as a server. An agent is similar to a client in other similar architectures, as it's responsible for consuming data from the server. The difference, however, is that agents are also responsible for health checking themselves, and also for discovering other nodes. A server has all the basic functionality of an agent but are also where data is ultimately stored and replicated within the cluster. Although a cluster consists of both agents and servers, only the server nodes store data on disk (ignoring any caching!).

Similar to Zookeeper, Consul works by electing itself a leader within the cluster, assuming that there is a *quorum* of at least three nodes in the cluster. This is required, as if there were less, it would be impossible for the election to reach a unanimous result. If the leader fails somehow and the cluster can no longer communicate with it, then a new leader is elected. For this reason, it is best to have a cluster of at least five nodes, then we can survive two nodes failing with an intact quorum.

The last thing we need to know about for this post is how new nodes join an existing cluster and how to gracefully leave a cluster. A new node knows about its peers through configuration. You can either pass a list of IP addresses on the command line or better, write the addresses into config. Why is this better? We can then use `systemd` or `upstart` or whatever to start Consul each time. 

A node also needs to leave the cluster gracefully: although a cluster will handle an ungraceful exit, it's always cleaner to exit gracefully if it's planned. We do this by including a line like `consul leave` in the systemd service file. That way when the underlying host is shut down, the cluster integrity is maintained.

## EC2 Autoscaling Groups
If you are not familiar with EC2 Autoscaling I suggest looking into it; it is the single most compelling reason for moving your compute onto AWS. In a nutshell, it allows you to automatically build or destroy EC2 instances based on some criteria: for example, load or, simply, time of day. Running instances 24/7 in AWS in not particularly cheap, but if you can only use compute on demand, then it becomes very cost effective. 

You don't have to just use it for scaling on-demand, however. You can use autoscaling groups to maintain a pre-determined number of instances alive. For example, if you had a quorum of five servers running in an autoscaling group and one died, another identical instance would be created to take its place.

## Deploying Consul in an Auto Scaling Group (ASG)
So now we know a little about what an ASG can do, we know we want to deploy our cluster in one. So how do we do that, and, more importantly: where are all these acronyms coming from? Brace yourselves, the acronyms will start coming in thick and fast from now on!

### Yet Another Amazon Abbreviation (AMI)
AMI stands for Amazon Machine Image. It's a template for an instance. In order to create an ASG for Consul, we are going to need to build an AMI with Consul installed and configured the way you want it. It is out of scope of this post to delve too deeply into how to do this, but there are many tools out there, e.g. Packer to help build machine images with your favourite configuration management setup. 

If we want to patch the OS or use a new version of Consul or change some config we have to go through the process of baking that into a new AMI.

We want to use a pre-baked image which we can launch ready to go rather that launching a vanilla Linux image and then configuring it post launch. Otherwise we increase the time needed to scale out drastically, and increase the chance of errors. Saying that, we are obviously going to need to do some kind of post launch config. EC2 has a mechanism for that, called User Data. User Data is essentially a bash script you can pass along at launch time which gets executed. That mechanism is going to be crucial for our brand new Consul nodes to discover their peers.

### Launch Configurations
An ASG needs something Amazon call a Launch Configuration (LC) in order to work. The LC determines what the ASG will build. It configures what subnets instances will live on, what security rules they have, how big they are and vitally what image (AMI) will be built. 

Here is an example LC definition. We use *Terraform* in-house as we are big HashiCorp fanboys if you couldn't tell, but the same thing applies to whatever orchestration you choose. 

```
# Create an ELB load balancer to sit in front
resource "aws_elb" "consul" {
    name = "consul"
    subnets = ["s-abc123"]
    security_groups = ["sg-abc123"]

    listener {
        instance_port = 8500
        instance_protocol = "http"
        lb_port = 80
        lb_protocol = "http"
    }

    health_check {
        healthy_threshold = 2
        unhealthy_threshold = 2
        timeout = 3
        target = "HTTP:8500/v1/status/leader"
        interval = 30
    }
    
    lifecycle {
        create_before_destroy = true
    }
}

# Define the ASG
resource "aws_autoscaling_group" "consul" {
    name = "consul - ${aws_launch_configuration.consul.name}"
    launch_configuration = "${aws_launch_configuration.consul.name}"
    desired_capacity = 5
    min_size = 3
    max_size = 5
    min_elb_capacity = 3
    load_balancers = ["${aws_elb.consul.id}"]

    lifecycle {
        create_before_destroy = true
    }
    
    tag {
        key = "Name"
        value = "consul"
        propagate_at_launch = true
    }
}

# Define it's Launch Configuration
resource "aws_launch_configuration" "consul" {
    image_id  = "ami-abc123"
    instance_type = "t2.medium"
    key_name = "deploy-key"
    security_groups = ["sg-abc123"]

    # Make sure our instance has a policy which grants read-only access to EC2 API
    iam_instance_profile = "arn:aws:iam::0123456789:some_profile/ec2"

    # More on user_data later on
    user_data = "${template_file.consul_userdata.rendered}"

    root_block_device {
        volume_type = "gp2"
        volume_size = 10
    }

    lifecycle {
        create_before_destroy = true
    }
}
```
**Nb.** This is simplified a lot, in a real example, much would be variable-ised, but for the sake of a self-contained example I have used real (made-up) values instead of variables.

Nothing too crazy here, we have an ASG + LC which will launch five instances based off our AMI. The cleverness here, which is a bit specific to Terraform but can be replicated in other ways using Cloud Formation for example, is the `create_before_destroy = true` statement. So what does that mean? If you change the AMI id, it will create a new ASG+LC alongside the old one. Only when the new instances are attached to the ELB (Elastic Load Balancer) and the ELB declares them healthy will the old instances be torn down. 

### User Data
If we build this now, we will get a set of five Consul nodes, we won't get a Cluster. As I alluded to before, we need to do a little post launch config to get the nodes to start talking to each other. If we make sure our Consul AMI has the AWS CLI tools installed, it's fairly easy to use that to query AWS and ask for all instances tagged 'consul', get their IP addresses, shove those values into Consul's config file and finally, start the service.

```
#!/bin/bash

internalIP=$(curl http://169.254.169.254/latest/meta-data/local-ipv4)
instanceID=$(curl http://169.254.169.254/latest/meta-data/instance-id)
hostname="consul-${instanceID#*-}"

hostnamectl set-hostname $hostname

aws ec2 describe-instances --region eu-west-1 --filters 'Name=tag:Name,Values=consul' 'Name=instance-state-name,Values=running' | jq -r '.Reservations[].Instances[].PrivateIpAddress' > /tmp/instances

while read line;
do
 if [ "$line" != "$internalIP" ]; then
    echo "Adding address $line"
    cat /etc/consul/000-consul.json | jq ".retry_join += [\"$line\"]" > /tmp/${line}-consul.json

    if [ -s /tmp/${line}-consul.json ]; then
        cp /tmp/${line}-consul.json /etc/consul/000-consul.json
    fi
 fi
done < /tmp/instances

rm -f /tmp/instances

# Clear any old state from the build process
rm -rf /var/lib/consul/*

systemctl start consul
```
**Nb.** If using this script as a Terraform template, don't forget to escape ${blah} with a second dollar or Terraform will try to interpolate these variables itself. 

## Pulling It All Together
We now have all the elements we need. Let's describe from start to finish what happens during a rolling upgrade of the cluster.

 1. Produce a new AMI with your upgrades installed
 2. Change the AMI value in your launch configuration to point at the new image
 3. New ASG+LC is created alongside the existing cluster
 4. As instances are launched, they query the AWS API to discover the IP addresses of the existing cluster
 5. Consul server starts and data starts replicating to new nodes
 6. Load balancer health checks pass for the new nodes
 7. Destruction of old nodes initiated, each one gracefully leaving the cluster
 8. New leader elected
 9. Profit

An important point to note is that if at the ELB health checks do not pass during a given timeout, the new instances are destroyed without ever taking control.

## Summary
I hope during this whistle-stop tour of AWS, Consul (and a little Terraform) you have learned some interesting concepts that you can apply to your own projects. This pattern of performing outage-less upgrades does not just apply to Consul of course. In theory, any server deployment which has clustering or even just has some mechanism of storing the data off-host, can with a little effort be deployed to an Auto Scaling Group and gain all the advantages that go along with it.


