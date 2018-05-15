---
layout:     post
title:      Using Terraform to put Kotlin in AWS Lambda
date:       2018-05-15
summary:    Maturing cloud services open up the chance to focus on the most valuable and interesting challenges and not be sidetracked by the technology that enables it.  
author:     alex_stanhope
image:
category:   Cloud Computing
tags:       AWS, serverless, kotlin
---

Some questions are just too big to answer.  How do you design for a complex, uncertain and ever-evolving cloud world?  Reduce the time-horizon, cleave off the bits that just aren't ready yet and have a clear technical goal, then you can at least redefine the question:

_How to use Terraform to automatically provision a static website and scalable dynamic (Kotlin) form processor to store made up data in a DynamoDB table?_

That was the question I tried to answer in a proof-of-concept (PoC).  It's been [published open source](https://github.com/skybet/terraform_lambda_kotlin_example) on GitHub.  This post goes into a bit more detail on how the proof-of-concept came into being, why different design decisions were made and how the code works.

## Background
Software Engineering courses in the mid-90s taught the mechanics of building good projects.  In the main, they sought to introduce the software development lifecycle (SDLC) and familiarise students with it.  Work out what you're building, design it, build it, test it, ship.  There are problems with this sort of waterfall SDLC, not least of all the bugs and limitations introduced by coding and supporting it all in-house.  Perhaps design, build, test, delay, debug, delay, ship, patch?

By the middle of the following decade, the model had turned on its head.  Engineers had become curators of code, sharing, selecting and refining an internet full of examples, frameworks, open source libraries, gists and StackOverflow answers to compose a solution.  "Not invented here" became a badge of honour, instead of a digital xenophobia that slowed innovation.

## The challenge
### Traffic spikes
The nature and timing of major sporting events means that many customers place bets at the same time.  During those peaks, SkyBet's servers receive many hundreds of requests per second, over 350/s during the run up to this year's Grand National at Aintree.
Like almost any large web service, SkyBet need an adaptive and reactive infrastructure that can cope with the spikes, but scale back during the quite times.

### Simple form processing and storage
Bets are complex to strike, so for this PoC I've simplified the model.  Here's a static HTML form that purports to gather credit card information.  Because it's a PoC, it actually doesn't gather any sensitive data.

```
<form name="addcard" action="${post_target}" method="post">
    <p>Name: <input type="text" name="name" value="" /></p>
    <p>Card number: <input class="readonly" type="text" name="number" value="" readonly="readonly" /></p>
    <p>Expiry: <input class="readonly" type="text" name="expirymonth" value="" readonly="readonly" /> / <input class="readonly" type="text" name="expiryyear" value="" readonly="readonly" /></p>
    <p>CVV: <input class="readonly" type="text" name="cvv" value="" readonly="readonly" /></p>
    <input type="submit" name="submit" value="Store" />
</form>
```

![Screenshot of the static form]({{ "/images/terraform-kotlin/terraformkotlin-static-form.png" | absolute_url }})

Instead it generates random data and pushes it to the form processor for storing in a database, though the form target isn't set until we create the form processor using Terraform.

```
// use JS to make up card details
function makeRandom(id, min, max, format) {
    var output = '';
    var separator = '-';
    // split format up into XX blocks
    var chunks = format.split(separator);
    // loop through blocks and substitute
    for (var i=0 ; i<chunks.length ; ++i) {
        // 2nd, 3rd, nth chunk is preceded by a separator
        if (i !== 0) {
            output += separator;
        }
        var chunk = chunks[i];
        // create a random number and pad to be the correct length
        var chnum = pad(Math.floor((Math.random()*(max - min)) + min), chunk.length);
        // append number to output
        output += '' + chnum;
    }
    // apply to field
    $(id).val(output);
    return output;
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

makeRandom('input[name=number]', 0, 9999, 'XXXX-XXXX-XXXX-XXXX');
makeRandom('input[name=expirymonth]', 01, 12, 'XX');
makeRandom('input[name=expiryyear]', 19, 26, 'XX');
makeRandom('input[name=cvv]', 0, 999, 'XXX');

```

## The landscape
Several forces have shaped the demand for and form of this PoC.

As the pace of technology development has been accelerated, by more people doing it and more of them sharing it openly, great solutions to many of the problems landing on my desk were just 'out there'.  To solve problem D, it was no longer necessary to solve problems A, B, and C - the generic (boring) precursors - to get to the good stuff.  Coders got to concentrate on the top of the pyramid, the bit that was specific to the core business.

I saw Arun Gupta give a talk at Devoxx UK 2017.  This table comes from his well-worth-watching talk entitled [Deploy microservice using Amazon Web Services S3, API Gateway, Lambda and Couchbase](https://www.youtube.com/watch?v=eT4EaU2mfL0).

<style>
table tr td {
    background-color: #ffc300;
    color: #ffffff;
}
table tr td.cust {
    background-color: #3498db;
}
table tr td.scale {
    background-color: #ff5733;
}
</style>

<table>
<tr><th>IaaS</th><th>CaaS</th><th>PaaS</th><th>FaaS</th></tr>
<tr><td class="cust">Functions</td><td class="cust">Functions</td><td class="cust">Functions</td><td class="scale">Functions</td></tr>
<tr><td class="cust">Applications</td><td class="cust">Applications</td><td class="scale">Applications</td><td>Applications</td></tr>
<tr><td class="cust">Runtime</td><td class="cust">Runtime</td><td>Runtime</td><td>Runtime</td></tr>
<tr><td class="cust">Containers</td><td class="scale">Containers</td><td>Containers</td><td>Containers</td></tr>
<tr><td class="scale">Operating System</td><td>Operating System</td><td>Operating System</td><td>Operating System</td></tr>
<tr><td>Virtualisation</td><td>Virtualisation</td><td>Virtualisation</td><td>Virtualisation</td></tr>
<tr><td>Hardware</td><td>Hardware</td><td>Hardware</td><td>Hardware</td></tr>
</table>

<table>
<tr><th>Key</th></tr>
<tr><td class="cust">Customer Managed</td></tr>
<tr><td class="scale">Customer Scaled</td></tr>
<tr><td class="">Vendor Managed</td></tr>
</table>

### Focussing on the value
Arun highlights the change that I'm talking about.  Where before we had to _solve_ the hardware _problem_, in that we had to build and operate hardware to run the apps, there was now a service whose total cost of ownership (TCO) was substantially lower.  The same applies to the management of virtualisation layer, operating system, container, run-time environment (JRE). 
To say it's 'solved' is a bit of an over-simplification, but the point is that there are managed services in each of these domains that reduce the amount of management we have to do of them.

Serverless computing is another example of a shift that allows us to focus on the top of the stack.

### Advances in language tech
Thinking back to those Software Engineering courses from twenty years ago, many taught C, Java and sometimes Haskell.  That language selection was pretty cutting edge at it's time.  C for memory management, Java for OO design and Haskell for a functional future that we didn't quite understand yet.

SkyBet has always been progressive in its attitude towards language selection, so anything that lets the engineering teams cut _better_ code - cleaner, clearer, more reliable, more scalable - is welcomed into the supported tech stable.  Kotlin is a fantastic divergence from Java so let's use that for the PoC.  It's not one of the AWS Lambda natively supported languages, but as it's JVM-based we can compile a fat JAR and run in the same way as Java. 

### Automated provisioning
On the infrastructure-as-code (IAC) side, multi-cloud languages like Terraform are making it easier to spin up and glue all the pieces together; and there are a whole lot of pieces.  It also means the whole shooting match can be instantiated with a single `terraform apply`, rather than an elaborate "open this console window and tick this option" tutorial.

## The architecture
Gone are the days where you can stick a form handler in a single PHP script and fire requests at it.  That AWS Lambda function needs some infrastructure wrapped around it to handle the NFRs.

![Proof of concept architecture]({{ "/images/terraform-kotlin/terraformkotlin-poc-architecture.png" | absolute_url }})

## The proof-of-concept code
All of these factors compound to create the unknowns that this proof-of-concept seeks to better understand.  Broadly, what are the performance characteristics associated with using Kotlin-based Lambda functions to dynamically scale to meet demand?

### Kotlin form processor
We'll need a form processor to take the data and write to DynamoDB:

```
/**
 * AWS Lambda handler function
 * @param input Map Input fields
 * @param context Context Lambda function context
 * @return ApiGateWayResponse returned to gateway en route to requesting browser
 */
override fun handleRequest(input: Map<String, Any>, context: Context): ApiGatewayResponse {
    LOG.info("received: " + input.keys.toString())

    // decode using Spring
    val bodystr: String = "http://www.example.com/index.html?" + input.get("body").toString()
    val parameters = UriComponentsBuilder.fromUriString(bodystr).build().getQueryParams()
    var name: String? = parameters.get("name")?.first()
    var number: String? = parameters.get("number")?.first()
    var expirymonth: String? = parameters.get("expirymonth")?.first()
    var expiryyear: String? = parameters.get("expiryyear")?.first()
    var cvv: String? = parameters.get("cvv")?.first()

    // fill with defaults if not submitted
    if (name == null) name = "MRS A. N. OTHER"
    if (number == null) number = makeRandom(0, 9999, "XXXX-XXXX-XXXX-XXXX")
    if (expirymonth == null) expirymonth = makeRandom(1, 12, "XX")
    if (expiryyear == null) expiryyear = makeRandom(19, 26, "XX")
    if (cvv == null) cvv = makeRandom(0, 999, "XXX")

    // write values to database
    writeToDB(name, number, "${expirymonth}/${expiryyear}", cvv)

    // write only log reference back to response
    val log_targets = String.format("Kotlin function executed successfully.  log_group = %s, log_stream = %s", context.getLogGroupName(), context.getLogStreamName())
    return ApiGatewayResponse.build {
        statusCode = 200
        objectBody = MsgResponse(log_targets)
        headers = mapOf("X-Powered-By" to "AWS Lambda")
    }
}
```

^ This also creates random defaults if for any reason the form fields aren't set.  This will be useful later when we come to load test it.

Now we just need some terraform to push the Lambda function:

```
resource "aws_lambda_function" "kardapi_func" {
  description = "Kotlin CardAPI HTTP request handler"
  function_name = "kardapi"
  filename = "${path.root}/../kotlin/build/libs/paypoc-kotlin-0.1-all.jar"
  source_code_hash = "${base64sha256(file("${path.root}/../kotlin/build/libs/paypoc-kotlin-0.1-all.jar"))}"
  handler = "com.skybettingandgaming.demos.paypoc.kotlin.Handler::handleRequest"
  role = "${aws_iam_role.lambda_exec.arn}"
  runtime = "java8"
  timeout = 30
  memory_size = 256
}
```

an API gateway to field and forward requests to it:

```
resource "aws_api_gateway_rest_api" "kardapi" {
  name        = "Card API in Kotlin"
  description = "Terraform with AWS Lambda"
}

resource "aws_api_gateway_resource" "kardapi_resource_proxy" {
  rest_api_id = "${aws_api_gateway_rest_api.kardapi.id}"
  parent_id   = "${aws_api_gateway_rest_api.kardapi.root_resource_id}"
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "kardapi_method_proxy" {
  rest_api_id   = "${aws_api_gateway_rest_api.kardapi.id}"
  resource_id   = "${aws_api_gateway_resource.kardapi_resource_proxy.id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "kardapi_integ" {
  rest_api_id = "${aws_api_gateway_rest_api.kardapi.id}"
  resource_id = "${aws_api_gateway_method.kardapi_method_proxy.resource_id}"
  http_method = "${aws_api_gateway_method.kardapi_method_proxy.http_method}"
  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = "${aws_lambda_function.kardapi_func.invoke_arn}"
}

resource "aws_api_gateway_deployment" "kardapi_deploy_alpha" {
  depends_on = [
    "aws_api_gateway_integration.kardapi_integ",
  ]
  rest_api_id = "${aws_api_gateway_rest_api.kardapi.id}"
  stage_name  = "alpha"
}

resource "aws_lambda_permission" "kardapi_gw_perm" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.kardapi_func.arn}"
  principal     = "apigateway.amazonaws.com"
  # The /*/* portion grants access from any method on any resource
  # within the API Gateway "REST API".
  source_arn = "${aws_api_gateway_deployment.kardapi_deploy_alpha.execution_arn}/*/*"
}
```

and some permissions to give the gateway access to it:

```
# create iam role to empower the function(s) to do stuff
resource "aws_iam_role" "lambda_exec" {
  name = "cardapi"
  assume_role_policy = "${data.aws_iam_policy_document.lambda_exec-role-policy.json}"
}

data "aws_iam_policy_document" "lambda_exec-role-policy" {
  statement {
    actions = [ "sts:AssumeRole" ]

    principals {
      type = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    effect = "Allow"
    sid = ""
  }

  # can't give Lambda log access here, so use attachment (below)
  # statement {
  #   actions = [
  #     "logs:CreateLogGroup",
  #     "logs:CreateLogStream",
}

resource "aws_iam_policy_attachment" "lambda_exec-role-policy-attachment" {
  name       = "policy_atchmt"
  roles      = ["${aws_iam_role.lambda_exec.name}"]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaDynamoDBExecutionRole"
}
```

We can also use Terraform to set up the database table (in DynamoDB):

```
# create DynamoDB table to store cards in
resource "aws_dynamodb_table" "kard_table" {
  name           = "Kards"
  read_capacity  = 2
  write_capacity = 200
  hash_key       = "UserId"
  attribute {
    name = "UserId"
    type = "S"
  }
}

resource "aws_iam_role_policy" "lambda_dynamo_kard_access" {
  name = "DynamoDB-access"
  role = "${aws_iam_role.lambda_exec.id}"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Action": [
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": "${aws_dynamodb_table.kard_table.arn}"
    }
  ]
}
EOF
}
``` 

and logging (in CloudWatch):
 
```
resource "aws_cloudwatch_log_group" "kardapi" {
  name = "/aws/lambda/kardapi"
}
```

As this isn't production code, I'll also dump some identifiers into the output so we can readily find the log entries in CloudWatch:

```
// write only log reference back to response
val log_targets = String.format("Kotlin function executed successfully.  log_group = %s, log_stream = %s", context.getLogGroupName(), context.getLogStreamName())
```

### Static HTML website in S3
We need somewhere to host the \<form\> created earlier on.  S3 is a good candidate, inexpensive and web accessible.  We can use Terraform to substitute in the form target and send the static HTML to our new public bucket:

```
# create bucket
resource "aws_s3_bucket" "site_static" {
  bucket = "${var.site_bucket_name}"
  acl = "public-read"

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT","POST"]
    allowed_origins = ["*"]
    expose_headers = ["ETag"]
    max_age_seconds = 3000
  }
  policy = <<EOF
{
  "Id": "bucket_policy_site_static",
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "bucket_policy_site_static_main",
      "Action": [
        "s3:GetObject"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::${var.site_bucket_name}/*",
      "Principal": "*"
    }
  ]
}
EOF
  website {
      index_document = "index.html"
      error_document = "error.html"
  }
  tags {
  }
  force_destroy = true
}

# substitute post_target into index.html
data "template_file" "template_index" {
  template = "${file("${path.root}/../static/index.html")}"
  vars {
    post_target = "${var.post_target}"
  }
}

# upload files, only when bucket exists
resource "aws_s3_bucket_object" "index" {
  bucket = "${var.site_bucket_name}"
  key = "index.html"
  content = "${data.template_file.template_index.rendered}"
  # source = "${path.root}/../static/index.html"
  content_type = "text/html"
  # etag   = "${md5(file("${path.root}/../static/index.html"))}"
  depends_on = ["aws_s3_bucket.site_static"]
}
```

### Submitting the form
After a simple `terragrunt apply` (prefer terragrunt as a wrapper to terraform) to push it all to AWS, we can submit the form and get the response back:

```
{
message: "Kotlin function executed successfully. log_group = /aws/lambda/kardapi, log_stream = 2018/05/10/[$LATEST]5f7356899dcd4997bd45a0bee9c08e78"
}
```

### Viewing the logs and the DB 
Our form post created an entry in the DynamoDB table:

![Snapshot of DynamoDB entry]({{ "/images/terraform-kotlin/terraformkotlin-dynamodb-entry.png" | absolute_url }})

and a stack of log data, accessible in near-real-time:

![Snapshot of CloudWatch logging]({{ "/images/terraform-kotlin/terraformkotlin-logging-snapshot.png" | absolute_url }})
 
### Performance
I broke out Apache Benchmark to do some crude load testing.  First of all just a few dozen requests:

```
ab -n 100 -c 20 https://ys3dx2tl46.execute-api.eu-west-2.amazonaws.com/alpha/something
```

+ 75% of the requests done within 1s, but the longest takes about 30s

```
Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:       79  122  55.0     96     247
Processing:   269 2658 6462.9    643   24108
Waiting:      269 2658 6463.0    643   24108
Total:        365 2780 6496.8    737   24335

Percentage of the requests served within a certain time (ms)
  50%    737
  66%    812
  75%    912
  80%   1039
  90%   2301
  95%  23528
  98%  23855
  99%  24335
 100%  24335 (longest request)
```

What this shows I think is that the Kotlin Lambda function is quick to respond when Amazon has spun up a container for it (AWS Lambda uses [containers under the hood](https://aws.amazon.com/blogs/compute/container-reuse-in-lambda/)), but slow when either there isn't a container, or the existing containers are over-capacity and new ones need to be instantiated.  Let's validate that at a larger scale:

```
ab -n 10000 -c 200 https://ys3dx2tl46.execute-api.eu-west-2.amazonaws.com/alpha/something
```

+ 75% of the requests done within 3s, but the longest takes 30s

```
Connect:       76  714 433.6    764    2554
Processing:   193 3030 6561.6    994   29436
Waiting:      192 3010 6567.2    971   29435
Total:        283 3743 6437.8   1888   30033

Percentage of the requests served within a certain time (ms)
  50%   1888
  66%   2156
  75%   2311
  80%   2410
  90%   6006
  95%  23996
  98%  29128
  99%  29205
 100%  30033
```

It's important to mention that I've done zero optimisation on this, so it's a crude illustration of the Lambda starting point, not it's ultimate performance.

### Future work

As with all good PoCs, there's lots more to look at:

+ I started on a Lambda-based (Node.js) load testing function, based on Amazon's reference example.
+ There exists a DynamoDB "click-to-encrypt" type option, but at the time of writing it's not in Terraform yet.  I'm confident it will be shortly, so I'd like to turn that on to more closely mimic a live environment.
    + Alternatively, I'd like to create a KMS key pair and use it to do in-app encryption of the data, but that'd be more expensive because you pay for Lambda execution time.
+ I'm in the habit of writing AWSpec tests for provisioned infrastructure, but haven't worked out the best way to do that for Lambda functions yet.  In fact Lambda test-driven development (TDD) is a whole area I'd like to investigate further.

### Open source

All the code in this post is available in the [GitHub repo](https://github.com/skybet/terraform_lambda_kotlin_example).  There's also a [getting started](https://github.com/skybet/terraform_lambda_kotlin_example/blob/master/docs/getting_set_up.md) guide to help you set up your AWS Environment and local/remote provisioning machine to bulid the PoC using terraform.  Enjoy!
