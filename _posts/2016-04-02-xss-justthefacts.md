---
layout:     post
title:      XSS - Just the facts, ma'am
author:     dan_adams
date:       2016-04-02 11:00:00
summary:    A basic primer on Cross-site scripting (XSS) and its prevention
category:   Security
tags:       security,scripting,xss,sanitisation,encoding,vulnerability,exploit
---

One of the simplest and most prevalent vulnerabilities found in web applications that we pentest is Cross-Site Scripting or XSS. It is still the third most critical vulnerability according to the [Owasp Top 10 Vulnerabilities](https://www.owasp.org/index.php/Top10) list as of 2013, and closely linked to the number 1 most critical vulnerability: injection.

Clearly, despite its ubiquity, there is still a lot of uncertainty amongst developers and others around what exactly XSS is and how to prevent it. Very often the topic is made overly complex, when in reality it is relatively simple to both understand and defend against.

Cross-site scripting is the slightly clunky name for the malicious insertion of unauthorised JavaScript into a Web site or Web application. JavaScript can be dangerous because it executes client-side within the context of the end user's browser and hence can have access to customer data as well as control of browser actions. Malicious payloads can include:

* Capturing user input such as passwords via a keylogger
* Sending cookies, tokens and other cached data to a third party
* Performing network requests and system operations that the user hasn't requested
* Forcing downloads of files to the end user PC

At its simplest, XSS relies on a website returning executable code to a client that a third party has injected, rather than data that the Web server is intending to serve. This can take a variety of forms but usually relies on the Web site returning a parameter to a customer that the customer has previously entered in an earlier Web request. That is, it relies on data that is intended to be passive/handled data (such as raw text) to transform context into some form of executable payload such as a command or script, which can then execute. If the parameter containing the executable code is passed to and executes on the server side, it can lead to a SQL injection or command execution attack, and if executed on the client side, it can lead to an XSS attack.

A trivial example of a website that could be vulnerable to this could be as simple as a site containing a single form that echoes your name back to you: you enter your name ("Bob") in a login form field, and the website returns "Hello, Bob" in its HTTP response. If the website can instead be forced to process the name of `<script>...</script>` then it is possible to inject JavaScript into unsuspecting visitors' browsers.

[![Bobby Tables cartoon](https://imgs.xkcd.com/comics/exploits_of_a_mom.png)](https://xkcd.com/327/)

It is this combination of the widespread susceptibility to XSS with the powerful payloads that the vulnerability that can deliver and the relative simplicity of exploiting it that make XSS such an important threat to protect against.

The reason that XSS vulnerabilities are so prevalent is that whilst XSS is a trivial vulnerability to defend against, doing so requires robust coding practices that are consistently implemented over time, considering how data is handled at input and output in almost every piece of code you write, and at every level of your stack.

The correct approach to protect your website against XSS and other linked vulnerabilities is to ensure that all input data is treated as raw data/text and doesn't allow the data to context-jump into an executable command. In practice this means performing some combination of:

1. Sanitisation of any data received from an external context or user; and
2. Encoding of any data output to another component

### Sanitisation of input data

You should sanitise input, ideally against a type, or if not then against whitelist regex of allowed values. This is simpler for some parameters and form fields than others. If you are processing a parameter representing a numeric item ID, then simply checking the type is an integer may be simple and sufficient. For other data that is richer, this is more difficult, and sanitisation is of more limited value for such parameters - when you sanitise input, you risk altering the data in ways that might make it unusable. Input sanitisation is therefore generally avoided in cases where the nature of the data is unknown, such as free-form text entry fields, especially if these may legitimately contain complex data sets such as code samples.

### Encoding of output data

The more effective measure to prevent XSS (as well as Injection attacks etc) is to ensure that every function in your code that passes data to another context encodes the data for that system, ensuring that it continues to be interpreted as data, and not permitted to jump contexts into being interpreted as executable code. There is no universal encoding standard that can be used, since the encoding mechanism to use will vary depending upon the context:

* If exporting to the browser in HTML, HTML-encoding should be used:
    * `<script>` → `&lt;script&gt;`
* If exporting to a SQL DB, SQL escape strings (or preferably parameterised queries) should be used
* and so on.

Rather than being an easy fix, this means that an understanding of XSS, and incorporation of data encoding, needs to be standard practice amongst every developer in your team.
