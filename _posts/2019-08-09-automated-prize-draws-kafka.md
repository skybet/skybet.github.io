---
layout:     post
title:      Automated Prize Draws with Kafka
date:       2019-08-09
summary:    "A look at how we improve on our existing manual processes and remove customer pain using technology."
author:     dave_chaston
tags:       kafka, kstreams, gaming, promotions
category:   Software Engineering
---

In the Next Generation Promotions (NGP) squad, we're always looking for new ways to be the market leader for offering great promotions. This could mean faster ways of rewarding (Choose your Cashback Hour meaning players get rewarded at the end of their time slot, rather than waiting for some overnight process to finish), better rewards (Different types of freespins, available across different game providers), or even new and improved mechanics. This post details how we've taken our old prize draw mechanic and saved our CRM and Gaming Operations teams time and effort to run them, automating something which previously would have taken hours of manual effort to figure out which customer won what and then get the prizes out to them. It also gives us the ability to run them at any time, rather than them having to start and end at midnight, and lets us give customers feedback instantly on their current ticket counts.

![Screenshot showing notifications of ticket accumulation for a Prize Draw](/images/prize-draw/notification-screenshot.png)


### The Problem:
A prize draw campaign takes up a lot of effort from multiple people in order to be run, and as such doesn't tend to be utilised as much as it could be. In addition to this the feedback from customers was negative about the use of prize draws, with many either not knowing how many tickets they have before the draw, or not really believing that prizes are awarded at all as they never hear about the results when they lose. This has a further effect on our Customer Experience team as they regularly receive calls from customers who want to know the status of the promotion and how many tickets they currently have.

### The Process:
The current main use case for prize draws is that we award a number of tickets as a lower tier Prize Machine (a daily promotion on Sky Vegas, itself also a kind of prize draw) prize to customers who win that day. If the customer opts in, these tickets are collated at draw time, run through some proprietary campaign management software, and winners are selected at random. The most common example for this is via tickets awarded in Prize Machine to give people the chance to win some free spins at draw time, but the ticket counts can also be based on stake if needed, with the number of tickets determined at draw time after totalling up a customer's stake for a number of days.

We had a number of requirements for building this mechanism in NGP; we wanted to be able to award prizes automatically at a set time, tell customers what (if anything) they've won immediately, and be able to update customers "live" with how many tickets they've got. Ideally, we'd also be able to reuse this mechanism as part of our other promotions, for example using it to replicate the experience of Bonus Time - award a random prize to a number of customers based on some criteria or other.

### How we've done it:
We split this promotion into three segments: the stake tracking (Ticket Rule Engine), the ticket storage (Wallet), and the actual draw mechanism.

![Overview for the ticket rule engine component for a Prize Draw](/images/prize-draw/rule-engine-diagram.png)

We already have promotions that do similar total-stake tracking as we need here - Stake X get Y as the most commonly run example - so adding a Kafka state store to map each customer to their total stake based on all the spin data coming in was relatively straight forward. At configurable intervals in stake, we can then send on a message to a ticket "wallet" to generate a new ticket (or several tickets, depending on previous position) for a customer. This then meant that at pre-designated points (eg, first ticket, 10th ticket, etc) we can tell the customer immediately via a message the number of tickets they have reached. Long term we're planning to add a feature to this to push the data out to an API, so a customer can track their position both in terms of tickets generated, and distance to their next ticket in real-time. Splitting this part of the overall promotion into its own app meant that we could reuse the rest of it without stake requirements in the future, so arbitrary numbers of tickets could be "pushed" into a promo from other sources.

![Overview for the ticket wallet component for a Prize Draw](/images/prize-draw/ticket-wallet-diagram.png)


We didn't want to have to store potentially tens or hundreds of thousands of tickets for the duration of the promotion however, so we decided to generate UUIDs for each ticket, and then only keep the "highest" of them for each customer. Mathematically speaking, if you generate a random number for each ticket, rather than assign in order (like you would for a raffle, for instance), you can order them by value and keep the same randomness that you'd get from drawing out of a pot at the end. This saved a lot of time in the final stage where we have to pick a winner, as we had a search space of n per customer (where n is normally 1), rather than an unknown and potentially huge number of tickets per customer.

Once the desired draw time is reached, we send a "trigger" message on to the wallet, to let it know that it is time for the "draw" to take place. Due to the number of partitions we have for our spin data, we need to know that all partitions have reached the draw time before we actually do the draw, so this trigger contains the partition ID, and the wallet waited until it had seen one trigger for each partition before it moved onto the next stage.

![Overview for the prize draw mechanism for a Prize Draw](/images/prize-draw/prize-draw-diagram.png)

The draw itself involves the wallet taking the ticket that we've stored (or tickets, in the event of multiple winning opportunities) for each customer, ordering them all highest to lowest, and sending them on in order over a single partition to the draw application. This draw application contains the list of prizes, also from highest value to lowest, as well as a "default" in the event that the prize table runs out. These prizes could be cash, free spins, or just a message that appears in the 'bell' on-site. As it is trusted that the messages coming in will be already ordered, it can safely assign the next best prize to the customer attached to the ticket it receives (after doing a check to ensure that we haven't already seen this ticket). Doing it this way means that the ticket wallet didn't know how many prizes were available though, so it will send through every message in order until there are none left. The draw application itself would need to keep track of the details of the draw, for instance the prizes, and what to do with the unfortunate customers who didn't win a prize. To do this, we keep track of all the customers and tickets that we've already processed, so if we somehow see the same ticket again, we don't do anything, while if we see a new customer once all the prizes have gone we can send out either the default prize or a "Better luck next time" message to them - we don't need to do this if they've won something already though, as they'll have had a message from this promotion already.

### Benefits:

This will hopefully improve engagement with Prize Draw promotions by taking away the pain points of customers not knowing if the draw has happened yet, or having to phone Customer Experience to see how many tickets they have in the draw; as an added benefit this will save around a day of extra effort per draw for our CRM and Operations teams to actually do the draw and settle prizes with customers.

Due to the modular nature of what we've built, we're also able to drop the actual prize draw mechanism into the rewards for any other promotion - for example, rather than a ticket draw we can now order the prize table randomly and award a random prize at the exact moment a customer opts in. We're just getting started with this new mechanism, and will let feedback from live customers we put it in front of decide where we go with it next.
