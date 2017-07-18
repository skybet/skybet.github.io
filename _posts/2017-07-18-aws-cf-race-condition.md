---
layout:     post
title:      Avoid CloudFormation Distress with this Amazing Trick!
date:       2017-07-18 15:00
summary:    A nasty race condition in CloudFormation Lambda support and how you can avoid it
category:   Cloud Computing
tags:       AWS, CloudFormation, Lambda, EventSourceMapping, IAM, STS, deployment, rollback, permissions
author:     paul_brabban
---

UPDATE_FAILED.

ROLLBACK_IN_PROGRESS.

The groan from across the desk.
The classic head-in-hands sign of a developer in distress.
The test deployment had failed for the third time.

It was the beginning of a painful and time-consuming journey of discovery.
An apparently simple change to feed new data sources in
[Lambda functions](https://aws.amazon.com/lambda/) using
the [CloudFormation](https://aws.amazon.com/cloudformation/)
infrastructure templating system uncovered a subtle bug that
took several days and help from AWS support to figure out.

We can save you the hassle.
This post will explain the problem, what causes it, and give you a fairly
painless workaround until it's fixed.

### A Little Context

I work in Data Engineering here in Sky Betting and Gaming. My squad works almost exclusively
with streaming data - messages that flow from other systems into ours.
We've built an infrastructure using serverless technology to process these messages.
For the purposes of this post, that means Lambda functions
consuming messages from [Kinesis](https://aws.amazon.com/kinesis/) streams.

We're bringing a new system integration online, which means we need to feed new
data into our Lambda functions.
Our system is quite new, which explains why we haven't come across this bug before.
It's the first time we've updated existing Lambda functions to feed new
Kinesis streams into them.

I'll illustrate with a simplified CloudFormation template.
The four resources it contains are described below.

```yaml
---
AWSTemplateFormatVersion: "2010-09-09"

Resources:
  # A kinesis stream to hook up to our Lambda function
  Stream:
    Type: "AWS::Kinesis::Stream"
    Properties:
      ShardCount: 1

  # A lambda function that doesn't do a lot
  Lambda:
    Type: "AWS::Lambda::Function"
    Properties:
      Runtime: "nodejs4.3"
      Code:
        ZipFile: !Sub |
          exports.handler = function(event, context) {
            console.log('hello world!');
          };
      Handler: "index.handler"
      Role: !GetAtt Role.Arn

  # A role for the lambda function to assume
  # that gives access to read from Stream
  Role:
    Type: "AWS::IAM::Role"
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
        - Effect: "Allow"
          Principal:
            Service:
            - "lambda.amazonaws.com"
          Action:
          - "sts:AssumeRole"
      Path: "/"
      Policies:
      - PolicyName: "root"
        PolicyDocument:
          Version: "2012-10-17"
          Statement:
          - Effect: "Allow"
            Action:
            - "kinesis:GetRecords"
            - "kinesis:GetShardIterator"
            - "kinesis:DescribeStream"
            Resource: !GetAtt Stream.Arn
          - Effect: "Allow"
            Action: "kinesis:ListStreams"
            Resource: !Sub "arn:aws:kinesis:${AWS::Region}:${AWS::AccountId}:stream/*"

  # Mapping Stream to Lambda
  SourceMapping:
    Type: "AWS::Lambda::EventSourceMapping"
    Properties:
      EventSourceArn: !GetAtt Stream.Arn
      FunctionName: !Ref Lambda
      StartingPosition: "TRIM_HORIZON"
```

[Download the template](/resources/aws-cf-race-condition/1-race-start.yml)

`Stream` is the Kinesis stream, our event source.

`Lambda` is a dummy lambda function. It doesn't need to do anything useful to
demonstrate the problem.
It references `Role`.

`Role` describes the permissions that our `Lambda` will have.
The `AssumeRolePolicyDocument` part says that a lambda function may assume this role.
The `Policies` part has a single policy that grants access to list all streams,
and read from `Stream`.

`SourceMapping` describes the relationship between `Lambda` and `Stream`.

If you deploy this template, you'll see something like...

![Stack Deployment](/images/aws-cf-race-condition/race-demo-start.png)

As you can see, CloudFormation has figured out the correct order
to deploy the resources. It uses the `Ref`s and `GetAtt`s to work out how to
order things to satisfy all the dependencies correctly.

### The problem

Now, let's add a second Kinesis stream `Stream2` and map it into the Lambda function.
Heres's a summary of what changes in the template.

```yaml
Resources:
  # this is the new Kinesis stream
  Stream2:
    Type: "AWS::Kinesis::Stream"
    Properties:
      ShardCount: 1

  Stream: ...
  Lambda: ...
  Role: ...
  SourceMapping: ...

  # mapping Stream2 onto Lambda
  SourceMapping2:
    Type: "AWS::Lambda::EventSourceMapping"
    Properties:
      EventSourceArn: !GetAtt Stream2.Arn
      FunctionName: !Ref Lambda
      StartingPosition: "TRIM_HORIZON"

```

[Download the full template](/resources/aws-cf-race-condition/2-race-fail.yml)

When we're updating a stack through the console, we can see a summary of the
changes that CloudFormation is going to make.

![Change set for updated template](/images/aws-cf-race-condition/race-demo-bug-change-set.png)

As you can see, `Lambda` and `Role` will be modified to give read permission
on the new stream `Stream2`, and a new `SourceMapping2` will be created to
feed the `Stream2` into `Lambda`.

Let's deploy...

![Failed deployment](/images/aws-cf-race-condition/race-demo-bug-effect.png)

Oh no! The deployment fails when it tries create `SourceMapping2`, because
the `Lambda` doesn't have permission to access `Stream2`.

> Cannot access stream arn:aws:kinesis:eu-west-1:my-account:stream/race-demo-Stream2-1405LP7STN2DR. Please ensure the role can perform the GetRecords, GetShardIterator, DescribeStream, and ListStreams Actions on your stream in IAM.

We explicitly gave access permission to `Role`.
We can see that `Role` finishes updating before `Stream2` is created,
so the dependencies are being resolved correctly.
What could be wrong?

### The Bug

With the help of Andre at AWS support, we got to the bottom of it.
When a lambda function assumes a role, it gets a time-limited token that it can
use to access services as that role.

In a pretty reasonable optimisation,
the lambda will hold onto a token for an *hour* before it requests another.
It's very unlikely that the token will get refreshed and pick up new permissions
during deployment in the few seconds between granting the new permissions and
needing them to read from the stream.

That means that a deployment like this just won't work.

### The Workaround

After a bit of experimentation, we found a workaround that's pretty painless
and might be the best way of dealing with this problem until AWS deal with it in
CloudFormation.

It's pretty simple... *rename the role*.

That'll mean that the Lambda must request a new access token when it tries
to assume the new role.

Here's the final template, renaming `Role` to `Role2`
and updating the Role property of `Lambda` accordingly.

``` yaml
---
AWSTemplateFormatVersion: "2010-09-09"

Resources:
  Stream: ...
  Stream2: ...

  # Lambda needs to re-referenced to Role2
  Lambda:
    Type: "AWS::Lambda::Function"
    Properties: ...as before
      Role: !GetAtt Role2.Arn

  # renaming Role to Role2 will ensure a new security token is requested
  Role2:
    Type: "AWS::IAM::Role"
    Properties: ...as before

  SourceMapping: ...
  SourceMapping2: ...
```

[Download the full template](/resources/aws-cf-race-condition/2-race-fail.yml)

Here's the change set, confirming the difference in activities.
We're going to replace the role, instead of updating it in-place.

![Change Set for updated template](/images/aws-cf-race-condition/race-demo-fix-change-set.png)

Running the deployment this time...

![Successful deployment at the console](/images/aws-cf-race-condition/race-demo-fix.png)

Easy when you know how!
Here's the proof that it worked, we now have two Kinesis triggers on our Lambda.

![Success Proof](/images/aws-cf-race-condition/race-demo-proof.png)

### Wrapping Up

Thanks for reading! I'm sure AWS will find an easy fix for the problem and soon
no workaround will be necessary.
In the meantime, this quick workaround will help you avoid the head-in-hands
moment if you find yourself facing this problem!
