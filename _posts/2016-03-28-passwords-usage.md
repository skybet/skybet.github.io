---
layout:     post
title:      Horses, batteries and staples - tips for effective password usage
author:     dan_adams
date:       2016-03-28 11:00:00
summary:    Tips for effective password usage, for both end users and system administrators
category:   security
tags:       security passwords
---


With the growth of public key infrastructure, biometrics and hardware and software tokens, the end days for passwords have been predicted for many years. But passwords remain an important and widely-implemented mechanism for user-to-system and system-to-system authentication, both as standalone measures and within multi-factor authentication systems, and poor password security practices represent.

Despite their ubiquity, password security is frequently mishandled or misunderstood, both by end users performing user-to-system authentication, and by system developers and administrators tasked with developing and supporting authentication mechanisms. A gap in strong authentication and compromised credentials were identified as the causes of the recent JP Morgan data breach, and the 2014 [Verizon Data Breach report](http://www.verizonenterprise.com/DBIR/) identified credential shortcomings as accounting for over 40% of reported data breaches. With that in mind, here are some common principles that are worth bearing in mind for both end users and administrators:

### Uniqueness (between people)

Passwords are occasionally deliberately shared amongst groups in order to deliver the required functionality, sometimes widely, such as in [military countersigns](https://en.wikipedia.org/wiki/Countersign_(military)) (“flash!”, “thunder!”) that are issued to large groups. In most use cases, however, passwords are designed to verify a unique individual’s identity to a third party, so as to provide both authentication for access, as well as non-repudiation (proof of action).

##### When users get it wrong:

End users will often lend their passwords to others, undermining the ability of the password to uniquely authenticate a user or provide non-repudiation of actions. Examples might include giving their passwords to work colleagues who have started at their workplace but have not been issued with their own logon accounts yet. The cost of convenience and expedience here is loss of security.

Even if users don't explicitly hand their password to others, they sometimes pick a password that is so generic that it is almost guaranteed to be common to several other users. [TeamsID](https://www.teamsid.com) list of the [most commonly used passwords](https://www.teamsid.com/worst-passwords-2015/) shows that 0.6% of every password used is "123456". If your password is the same as other people's, you are providing little or no difficulty in having others guess your password.

##### When IT staff get it wrong: 

IT support desk staff will often form habits of setting user account passwords on initial user setup or password reset requests to a default (“password1”, anybody?), allowing anyone with knowledge of this practice to authenticate as the user in question, both undermining non-repudiation and potentially elevating their privilege set.

### Uniqueness (between systems)

Whilst most people instinctively grasp that a password that is not unique to you represents weak security, most fail to recognise that the corollary - uniqueness of passwords between systems - is almost as important. Imagine a world in which every house had the same lock. Find one key lying on the ground and you can access any house you care to. This is an extreme example of why a password should be unique between systems. The more systems that share a common password for a given user, the more systems that can be compromised if a single password is captured, lost, mislaid or cracked. There are exceptions to this rule, such as where disparate systems use a Single Sign-On or federated access solution, but in general it is best practice to ensure the use of different passwords for different systems to which you have access.

##### When users get it wrong: 

Because they struggle to remember multiple passwords, end users may use a common password to access their email, their bank account and their online shopping as well as their work accounts. A single password compromise such as accidentally pasting in their email account password into an email or instant chat communications means that they've simultaneously disclosed their credentials to high-value systems such as their online banking account. It could mean that attackers gain access to their accounts on every system they use rather than just one, leading to complete identity theft. It also increases the risk  presented to their accounts on otherwise-secure systems such as online banking by capturing their passwords from a more vulnerable target such as a Wordpress site.

##### When IT staff get it wrong:

System administrators also undervalue the importance of unique passwords per system they administer, often having common admin or root credentials on all (or groups of) systems, leading to the loss of “keys to the kingdom” if a single password is lost, revealed or cracked.
	
### Secure transmission/submission

A password is only secure if it is communicated securely. If you had to provide a password to an individual in a public space, you would expect to at least whisper it rather than shout it out loud for everyone to hear, its value to verify your unique identity being lost if it is disclosed to others.
When users get it wrong: End users will often write down their passwords on post-it notes, even going so far as to stick them to their moinitors, for convenience, effectively disclosing it to anyone who cares to capture it.

##### When end users get it wrong:

End users should be aware when providing credentials of whether the channel they are sending their credentials across is secure or not. Modern browsers make this easy for web applications by providing "padlock" symbols in the address bar for websites using secure encryption/transmission technologies such as HTTPS.

##### When IT staff get it wrong:

IT staff will often fail to implement transport encryption on service endpoints that require authentication. Services delivered over plaintext HTTP but which ask for authentication effectively allow for end user passwords to be trivially captured or harvested by someone in the know.

### Not guessable

It is important that passwords are not trivially guessable, or they have no value to uniquely identify an end user. This is especially important given the power of modern processors to try millions of password combinations per second. For most passwords, this means making sure that the keyspace of a password is as large as practically possible, and avoiding faster-than-exhaustive attacks by avoiding the use of common dictionary words (technically, ensuring a uniform distribution or equal probability of any single password).

##### When users get it wrong:

For end users, ensuring a password isn’t guessable mainly means avoiding common dictionary words and picking a password that consists of a long string of characters from a large character set, including special symbols. A 30-character password from a large character set (such as the 95-character "ASCII printables") would still take centuries to crack for even an extremely fast dedicated multicore system able to have access to the password hashes and making 10 billion attempts per second. In a famous [XKCD](https://xkcd.com/) comic, ["Password Strength"](https://xkcd.com/936/), the author proposes the creation of lengthy passwords using a chain of randomly selected dictionary words (eg “horse battery staple”) to provide a sufficiently strong yet memorable password. We would recommend a two-tier password system, using one or a handful of XKCD-style passwords that you need to remember for authenticating to and accessing a secure password safe/store (eg [PasswordGorilla](https://github.com/zdia/gorilla/wiki) or [LastPass](https://lastpass.com)) and then for every other system, application or site using a traditional completely-random password string of the maximum length permitted from the largest character set permitted  (eg "4chyg#t_cZdS~b R=K@XP$").

##### When IT staff get it wrong: 

If you handle password resets in a corporate environment, don’t set default passwords to the same on every password reset, and set strong password length and complexity requirements on systems that support it.

### Monitoring

Your front door lock isn’t particularly hard to pick. What primarily prevents someone from breaking into your home by picking the lock is the thought for the burglar of having to sit in public view for minutes on end picking your lock in plain view of potentially curtain-twitching neighbours who could challenge them or call the police. If you are not monitoring attempted logins to a system using passwords, you’re allowing malicious parties to attempt to access your system unobserved, at their leisure - permitting the equivalent of someone sitting on a sofa to pick your front door, screened from view, with their feet up and sipping a latte. Attempted logins to any system need recording, and a system implemented for intruder detection (and lockout) and alerting on unusual activity such as multiple authentication failures.

##### When users get it wrong:

Many systems greet you on login with a “last logged in” timestamp. Given that only you log in using your account, if the last login time isn’t the last time that you yourself logged into the system, then something is clearly wrong.

##### When IT staff get it wrong:

Failing to implement alerting and monitoring on all authentication endpoints leaves systems vulnerable to long-running authentication attacks.

### Disclosed carefully

Your password is only of value so long as it remains secret, and that can be difficult since you need to hand it over every time you authenticate. If you type in your password into a phishing website, or you have a virus on your PC that is logging your keystrokes, then you can end up disclosing your password to a malicious third party. It can also be captured by anyone sniffing the network in between for traffic.

##### When users get it wrong:

Phishing attacks are increasingly prevalent, accounting for 20% of identified threat actions in a recent [Verizon data breach report](http://www.verizonenterprise.com/DBIR/). Phishing attacks, in which malicious parties attempt to capture user's passwords by masquerading as a legitimate endpoint, can trick even the most savvy of people into entering their credentials into a malicious site. It is important to be aware of what website you are on and whether the URL in your browser matches the site that you are intending to visit.

##### When IT staff get it wrong: 

Ideally passwords would never be submitted directly, being used instead to generate tokens in a challenge-response mechanism such as [SCRAM](https://tools.ietf.org/html/rfc5802) in which the original password is never exchanged and cannot be captured or recovered from the exchanged authentication data. If using a mechanism where transmitting authentication credentials cannot be avoided, then as a minimum admiistrators should ensure that the transmission is over a secure channel such as HTTPS rather than in plaintext.


### Summary

End users and system administrators both have a role to play in ensuring that password security is implemented effectively for the benefit of all.
