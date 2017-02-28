---
layout:     post
title:      Modernizing our app with typescript
date:       2017-03-04 09:00
summary:
category:   Software Engineering
tags:       typescript, react, re-factoring
author:     james_moorhouse
---

#Introduction
Back in October 2016 my team were looking for ways we could improve our Bet Tracker product which was written using ReactJS. We'd first made the product about 2 and a half years ago, much before my time, when ReactJS was still fairly new on the scene. As such the ReactJS itself has been through quite a few changes since then and a few of our design patterns were in need of a spring clean.

As a product, Bet Tracker allows our customers to view, cashout and track all of their bets. Bets these days are complex, they can consist of many selections consisting of multiple outcomes across multiple events - oh, and then we need to track the history of a bet i.e. all the data at the time it was placed and compare it to the data of the bet, if you were to place the same one now.

Confused? don't worry you're not alone. The important thing to note is that we needed to be able to model complex data structures and their relationships to each other, typescript seemed perfect for this. Like using babel, it promised to give us ES6 features ahead of time but also allows us to add typings to our data structures giving us more control over our data structure.

#What is typescript
So what is typescript and what does it really do? Well, it's an open source language created by Microsoft https://github.com/Microsoft/TypeScript/ which compiles down into vanilla javascript. Javascript is itself typescript, typescript is just a superset of javascript which includes typings and a few other bits of syntactic sugar such as Enums and Interfaces, things that you'd be used to seeing in "grown up" OOP languages.

Once you're happy with your typescript, you simply run `tsc` (typescript compile). Typescript will then perform static analysis of your code and remove all of the type hints and other typescript goodness and emit pure vanilla javascript. It will even compile (transpile!) from ES6 to ES5, making your code cross device friendly.

The clever part comes with the static type analysis, given all of the parameter typehints, return types, interfaces etc that you've written in your codebase, the compiler will analyse your code and make sure it all makes sense. This is a good thing because typescript is sanity checking your code for you as part of your development process, long before it ever reaches the production environment.

Other major benefits of typescript compared to babel include:
- better IDE support
- support for interfaces
- support for Enums

#The process of upgrading our app
- rename .js -> ts, jsx -> tsx
- npm install typescript
- remove all babel
- fixup webpack/gulp

- run compile

- fix imports/exports statements
- Converted most of our ES5 React.createClass Syntax to ES6 class syntax -> This lead to its own problems, having to bind - callbacks, replacing render mixins (PureRender + timer) *do something here*
- Import type definitions for external libraries
- Write our own type definitions for libraries without external typings
- fix tests to run using typescript, needed a pre-processor to compile typescript classes to JS



#How we would integrate it with our development process
Those writing large JS applications for the browser will be all too familar with build processes and we are no different. Prior to using typescript our ReactJS app was written using ES5 JSX syntax to compile to vanilla JS the build pipeline looks similar to the following

DIAGRAM

Our developers were already familar with running gulp to build the app during development, likewise our build pipeline for production so it made sense to keep things as similar to this as reasonably possible.

Quite simply put, this was one of the biggest successes of the project, we swapped babel for ts-loader, set the compile options in `tsconfig.json` as per thier docs and everything worked as expected.

#Result
Our Bet Tracker product is now fully typescripted. We've not added a typehint to every parameter or method but in order to address our initial problem, we've added types to all of our models.

Instead of looking at the codebase as a whole, we're going to add types to parts of the code as we're working on it. For example if I'm working on a component such as a scoreboard, displaying live football scores whilst the bet is in play, I might go into that component, think about all the props and then add in the relevant types.

We've found the more types we add in, the more support we get from our IDE, which is a good thing, we can click around between classes easier because the IDE can infer more from our code, this is good as it makes development easier and gives us confidence in what data structures we can expect in certain areas of our code.


#What we've learnt
- Not exactly a superset, javascript needs to be written in a specific way for it to work as typescript
- When you first convert to typescript, there are a *lot* of errors, sometimes this leads you to go for the solution which makes the error appear, rather than
- Made us re-assess our code, we've found a few basic flaws in our design patterns which we've gone and fixed, which has lead to a much better customer experience
