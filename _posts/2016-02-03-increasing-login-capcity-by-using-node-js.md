---
layout:     post
title:      Increasing Login Capacity by Using Node.js
date:       2016-02-03 12:31:00
summary:    How we went about transitioning key parts of our stack to Node.js to benefit from the asynchronous nature that it brings.
author:     tom_lomas
category:   Product
tags:       product, lamp, deployment, node, node.js, nginx, uptime, availability
---

Historically speaking, the sidebar that you may have come to use on Sky Betting & Gaming has been completely powered by a LAMP stack. It has worked well over the years and allows our customers to both login and register, but to also view account history, like open bets and casino spins.

However, as demand increases - especially at crucial times of the year - we need to ensure that our platform remains available and page times are responsive. Login, for example, is used by nearly everyone that comes to the website: whether that is logging in fresh on a desktop browser, opening any of the apps, or moving between websites (single sign on) in the Sky Betting & Gaming portfolio.

We regularly load test key customer flows through the sidebar to gauge our throughput and using this enables us to get a good idea of our capacity. From this we can investigate any bottlenecks and identify any areas of focus. It also allows us to benchmark proposed changes and determine if they are really worth it from a performance standpoint.

## Logging in

Each of the websites, apps or services that integrate with us are referred to as a 'consumer' and on the busiest day of a normal week (usually a Saturday) logins across the consumers can run into the hundreds **per second**. This can increase astronomically on large sporting days, such as the Grand National.

Each consumer requires different information about the customer. For example, [Sky Bet](https://www.skybet.com) may want to know the customer's balance whereas [Super 6](https://super6.skysports.com) may only want to know their unique customer ID. The amount of information that they require determines how many calls we need to make to our backend API and datastores.

Traditionally all of this was handled in PHP. However, with that it meant that each call to find information about the customer (XML over curl) would block the next until it was complete.

To keep up with the growth of the business and the new products launching, we needed to come up with a solution. The solution was Node.js.

## Utilising the asychronous nature of Node.js in login

When a login is performed it can require up to four separate calls to an XML-based API for customer information, or even further datastores such as Couchbase. Traditionally this would mean that the fourth call is forced to wait for the three others to complete, even if it didn't care about the result of the earlier calls. As most of these can be executed asynchronously without needing the response of another first, Node.js suites us perfectly.

We make heavy use of the [Async.js module](https://github.com/caolan/async), particularly the "auto" control flow that this provides. It allows us to create cross dependencies between calls, blocking some until another finishes or allowing calls that can operate independently to do so straight away.

An example of this would be the following:

In this example we expect `callOne` and `callFour` to be triggered immediately. This is because they both have no other requirements. We expect `callTwo` to first wait for `callOne` to be successful.

However, `callThree` we expect to wait for both `callOne` and `callTwo` to complete successfully. This is a result of `callTwo` first requiring `callOne`.

The final function is only executed once all four have been successful. If any of them return an error, further execution of this sequence is stopped and the final callback is performed with the error passed to it as an argument.

``` javascript
var async = require('async');

async.auto({
    callOne: function(callback) {
        // We expect this to run straight away
        return callback(null, true);
    },
    callTwo: ['callOne', function(callback, results) {
        // We expect this to run once `callOne` has successfully triggered the callback
        // `results` is an object containing the result of callOne
        return callback(null, true);
    }],
    callThree: ['callTwo', function(callback, results) {
        // We expect this to run once `callOne` and `callTwo`
        // have successfully triggered the callback
        // `results` is an object containing the result of callTwo
        return callback(null, true);
    }],
    callFour: function(callback) {
        // We also expect this to be run straight away
        // Note that the order of tasks in this object has no baring
        return callback(null, true);
    }
}, function(err) {
    // This will run either on error or if everything has successfully completed
});
```

## In conclusion

Applying this logic to login alone has allowed us to more than double our login-per-second capacity without greatly expanding our infrastructure.

By better using the technology that we have available and using the right tool for the job it has meant that we can give our customers a faster and greater overall experience and thus contributing to our mission of ["Making Betting & Gaming better."](http://skybetcareers.com/about-us)