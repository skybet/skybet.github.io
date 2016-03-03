---
layout:     post
title:      Pull Requesting into Pull Requests for Collaboration
date:       2015-12-02 09:00
image:      git-pr-workflow.svg
summary:    Autonomy over development is great, but having no single project owner can bring its own problems. One workflow to help with this is to pull request a pull request.
category:   Workflow
tags:       git, github, collaboration, version control, branching
author:     adam_hepton
---

At Sky Betting & Gaming, we like to give engineers freedom - whether that be over technical choices or the work that they choose to tackle. The maxim is generally held that if you find something that provides value, you should do it. Of course, we have various sources feeding in their priorities and desires, and we also have people to wrangle that accordingly, but there are certain things where we like to get our hands dirty and give as much ownership over what happens to the people who know it best. We have several code repositories internally, which we use [Atlassian Bitbucket Server (formerly Stash)][bitbucket] to manage.

Part of the functionality that Bitbucket Server offers us is the ability to manage our pull requests: this means that lots of different people can work on lots of different things at any given time, and they can get pushed back down to a release candidate once they pass code review. On a day-to-day basis, the tasks we have are defined enough and broken down small enough to provide value that code reviews can be done in place and, if there are changes that need to be done either for functional or non-functional reasons, that feedback can be done as a discussion.

There are projects where there is no distinct end-goal - whether these are proofs-of-concept, or experiments, or, like this blog you are reading now, something that we all agree we want and need, but we don't want or need a single vision about. This blog's code isn't held internally, it's held publicly, in [our Sky Betting & Gaming GitHub repository][github], and has multiple people contributing to it. We don't tell our engineers, "We want a blog about X to be made available on Y", or "No, feature X doesn't fit into our ideas of what our engineering blog should have": we allow any engineer to contribute, whether that be code, articles, or ideas for others: it might be that we decide we'd like to cover something or we'd like a particular feature, in which case we'd speak to people to ask who wants to help do that. The way we then manage how things get onto the site is for contributors to make pull requests (which GitHub also offers): there are then a number of people who can accept that request (which goes live on the site immediately, thanks to the [technology we have chosen for our static-page site][jekyll].)

Pull requests to the blog are typically for a small piece of work: a single article, or a feature, and often these are unsolicited and uncoordinated (no one has asked me to write this article, for instance). It is understood widely that a pull request to a publicly accessible repository is, "I would like you to include this in your master repository", but for something as collaborative as our blog which is publicly available but privately owned, the understanding is that a pull request is Less "Request for Inclusion" and More "Request for Feedback", to borrow the nomenclature of Sky Bet's current Marketing campaigns.

In a typical article, there might be typos or grammatical errors: there might be phrasing which isn't that great to read through, lack of clarity over something, or something where we assume too much as a writer of an article of a reader, amongst other things. For features, it might be that mechanically something is sound, but it isn't following coding conventions with the rest of the site, or might be lacking in responsive styling, or could be repurposed to do more than one job. In all these cases, there are lots of people who want to contribute, and they're all great at different things - we could offer each other open-ended text feedback about how to make something better, but the way that pull requests work mean that we can do more.

### Pull Requests 101

When you clone a Git repository from somewhere, you take a read-only copy of that repository, together with a reference of where that copy was taken from, so that you can keep it up-to-date with any changes that may be added to it. Generally, these repositories are set up in such a way so that only one person, or group of people, are able to add to that source. However, there is nothing to stop you as an individual changing parts of that offering to suit you and still being able to update with the central changes. There may come a time where you think, "I think these changes should be part of the thing that everyone gets", and that's where pull requests come in - you are basically asking the owner/s of the original, "Hey, do you want my stuff, too?". It's then up to that owner, or those owners, to decide if it is something they want (it might be something they've asked for, it might not), and, if they do, your work goes in and forms part of the history. If not, you can always maintain your version as an alternative fork.

When you make a pull request, you are actually requesting that a branch of yours, and all its commits, are merged into the target branch that you are requesting, which is typically the master of the remote. This is not snapshotted at the moment that you make the pull request, it is a pointer to that branch: this means that if you make further commits to that branch, they are by design also automatically requested to be merged in. This is one reason git encourages you to make an isolated branch per-change.

So, instead of asking someone to introduce further change, it is possible to take a fork of their repository, make the proposed changes yourself, and present it back to them as a pull request into their branch. If they then choose to accept your pull request, your changes will be added to the original pull request: a real-life example of us doing this workflow is [within the pull request for the "How to DBA" post][pull-request].

### An illustrated example

<div class="grid">
    <div class="grid-xs-m-1-1 grid-l-1-2 svg-holder">
        <svg class="git-pr-workflow" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <use xlink:href="/images/git-pr-workflow.svg#git-pr-workflow"></use>
        </svg>
    </div>

    <div class="grid-xs-m-1-1 grid-l-1-2">
        <ol class="wrap-break">
            <li>Alice (up to you whether this is <a href="/authors#alice_kaerast">Alice</a>, or the Alice that is in most hypothetical examples) takes a fork of a source repository's <code>master</code>, and creates a feature branch to work in (<code>git checkout -b feature-branch</code>).</li>
            <li>Alice does some work in <code>feature-branch</code> and pushes this branch.</li>
            <li>Alice makes a pull request to have <code>feature-branch</code> reintegrated into the source repository's <code>master</code>.</li>
            <li>Bob, as reviewer, takes a fork of Alice's repository (<code>git add remote alice git@github.com:alice/skybet.github.io.git</code> followed by <code>git checkout alice/feature-branch</code>)</li>
            <li>Bob creates some suggested changes to Alice's work and commits to their own feature branch (<code>git checkout -b feature-branch-with-changes</code>) and pushes these changes to their own repository.</li>
            <li>Bob makes a pull request to Alice to have their <code>feature-branch-with-changes</code> integrated into the original <code>feature-branch</code></li>
            <li>Alice agrees to the changes and merges the branches. This creates a new commit in <code>feature-branch</code>.</li>
            <li>Carol, a new reviewer, sees that there are further changes in the original pull request, and agrees to them. They merge the original pull request, which brings both Alice's and Bob's work into <code>master</code>.</li>
        </ol>
    </div>
</div>

This isn't a new idea: this isn't revolutionary, but for certain use cases, it works really well - encouraging and inviting collaboration without putting barriers in the way of giving people ownership or freedom over direction. I'd certainly recommend it if you find yourselves continually batting patch files back and forth between yourselves, making lengthy comments into text boxes, or doing separate tickets for one piece of value so that back-end and front-end development can take place concurrently.

[bitbucket]: https://www.atlassian.com/software/bitbucket/server
[github]: https://github.com/skybet/skybet.github.io
[jekyll]: https://jekyllrb.com
[pull-request]: https://github.com/skybet/skybet.github.io/pull/32
