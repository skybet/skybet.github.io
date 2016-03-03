---
layout:     post
title:      Preventing phishing attacks - an example of defence in depth
author:     dan_adams
date:       2016-02-29 11:00:00
summary:    Phishing attacks are difficult to entirely prevent against, but are a good example of a situation in which "defence in depth" is appropriate.
category:   security
tags:       security
---

"Phishing" attacks are attempts to acquire information such as usernames, passwords, and credit card details by masquerading as a trustworthy entity. The name derives from the similarity of using a bait in an attempt to catch a victim from a pool and the "bait" normally consist of an electronic message such as an email sent to a large group with the hope that some small percentage of targeted victims will fall for the ploy.

A phishing email is generally sent by a malicious source but purporting to be from a known or trusted source such as a company's IT department or a popular social media website or high street bank. Phishing emails will often either have a malicious payload such as a word document with a macro, or else contain links to websites that are either infected with malware or attempt to trick people into entering their credentials.

Typically the email itself (or the website linked to from the email) uses corporate imagery, branding and fonts to provide an experience which is almost identical to the genuine business being impersonated.

Phishing attacks are difficult to entirely prevent against, but are a good example of a situation in which "defence in depth" is appropriate - no one measure on its own is effective, but by implementing a range of anti-phishing countermeasures, the effectiveness of phishing attacks can be greatly reduced. So what can be done?

### 1. Server-side email filtering

The first line of defence needed is anti-spam and email filtering for inbound email, to prevent emails from being received by your employees in the first place. Various technologies can be used including anti-spam filters based on BLs and IP reputation services, a server-side antivirus scan for attachments, and MX record/domain verification using Sender Policy Framework (SPF). Emails can then be rejected by your mailserver so that they never make it to your users.

### 2. User training and internal policies

Inevitably, some emails are going to get through your email filters, no matter how infrequently. It is important to reduce the likelihood that employees are tricked into falling for the phishing scams by providing training as to how to recognise likely phishing attempts. It helps if advice is consistent - if users are aware that internal IT staff will never ask them for their passwords, then they are less likely to fall for a phishing attack asking them for their password. There are also excellent online tools such as [VirusTotal](https://www.virustotal.com/) which allow users to upload suspected attachments before opening them in order to check whether they contain any viruses.

### 3. Mail client software

Mail client software has a part to play by providing warnings to users explaining how opening attachments or clicking on links contains some element of risk. These warnings can be shown at the time a potentially malicious email is received to remind users of their training and raise awareness of the potential risk.

### 4. Spam email reporting

Several mailservers and clients now support mechanisms whereby users can report emails as spam or viruses. In a corporate mailsystem, machine logic can be used to learn based on feedback from a few users when an email is spam, a phishing attempt or contains a virus, and actively move the mail item to trash or spam folders for users who have not yet read the mail, providing a fast, automatic and crowd-sourced approach to mail veracity.

### 5. Internet Content Filtering (ICF) and restricted outbound internet access.

A further measure that can help is internet content filtering on outbound web requests from employee workstations and laptops. ICF is a mechanism that intercepts outbound web requests and verifies whether they are to be permitted. Very often a phishing email will not have a malicious payload itself, in order to improve its chances of being delivered to targeted victims. It will instead contain a seemingly innocuous word document or Excel document attachment with a simple macro that executes on file open and attempts to download the real virus payload, or just a link to a website. Usually this file or Web page will be hosted on a domain known to be malicious. ICF can be used to actively block access to such domains, preventing the payload from being downloaded or the form designed to capture passwords from loading in the user's browser.

### 6. Host permissions/group policy and data execution prevention

Assuming that all the above measures have failed, modern operating systems such as Microsoft Windows 10 incorporate DEP or Data Execution Prevention and Group Policies that prevent untrusted executables or those attempting to access certain areas of memory from executing. A well configured group policy can block the execution of downloaded executables.

### 7. Antivirus

If a phishing email succeeds in bypassing all the above measures and manages to download and execute, all is still not lost. Modern antivirus tools can perform a range of checks on attachments, from checking them against known virus patterns, to loading a copy of an attachment into a sandboxed area of memory and executing them in order to check for malicious calls or activity, before allowing the user access to the real attachment themselves.

### 8. Password management and expiry

Finally, if the worst does happen, and a phishing email is received by a user and successfully tricks them into entering their password, all is not lost. By enforcing strong password management, you can ensure that users are using different passwords for each site or service they use, meaning that the damage in the credential loss is known and limited. By enforcing frequent password rotation/expiry you can also ensure that the window during which a malicious party can exploit any captured credentials is limited.

### Defence in depth

The above example is not an exhaustive list of every measure that can be taken against phishing attacks, but does demonstrate that very often the strength of a security solution lies not at any single layer or component, but in a so-called defence in depth approach, in which a range of measures at different layers and types are stacked to provide a robust overarching protection against a given threat
