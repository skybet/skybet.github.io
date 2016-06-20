---
layout:     post
title:      Isomorphic Vegas
date:       2016-05-27 09:00:00
summary:    A summary of how we use isomorphism to render Vegas and keep state consistent between our servers and clients
author:     andrew_munro
image:      fluxible_react_logo.png
category:   Organisation
tags:       engineering, javascript, react
---

## Introduction

Back during the final months of 2014, a new Sky Betting & Gaming technology project was being born. The project, codenamed 'OneVegas', aimed to link both our mobile and desktop Vegas sites into a single responsive one. Tired of years being tied into feature-dry content management systems, we wanted to move away from them entirely and focus on fast continuous delivery to ensure quality and flexibility with the sites design.

We had a few requirements:

* Single responsive application for best possible browser experience
* Single code base for all devices
* Allow us to integrate with our existing various backend RESTful services

The project started, as many technical projects do, as a prototype trying out Facebook's new React framework. We were able to create a modern single page app that could respond to different screen sizes with ease! Both our engineers and designers loved the simplistic workflow, state management using Flux, powerful debugging tools and performance of the virtual DOM. Soon after, the decision was made to adopt it.

Being early adopters of React however, we were left with a load of questions:

* How do we tackle SEO?
* How do we pass initial server state to React for it to render?
* How can we keep it performant?
* How do we keep clients up-to-date as changes are made to games, promotions and other content?

This was a significant change from how we had engineered our sites previously, moving away from static javascript and content served by a CMS built on PHP backend systems. We were especially concerned with how search engine crawlers/scrapers would perceive our site.

To maintain SEO friendliness and plug into our existing server rendering (such as the footer bar which is shared across all our sites), we decided we wanted to keep some of the rendering on the server. To achieve this, we needed to make OneVegas *isomorphic*, a process that would keep our single application's rendering and state in sync with the server's state.

> Isomorphism is the functional aspect of seamlessly switching between client- and server-side rendering without losing state.

One early solution floating around the web was to use React on the server to render the page initially before sending it down to the clients. This is quite a popular solution today, but back in 2014 we decided against it due to performance and scalability concerns. SB&G was already set up and very good at scaling and maintaining large PHP applications so naturally we wanted to exploit this.

## Fluxible

The first technology we utilised to achieve this was [Fluxible](http://fluxible.io/), an isomorphic flux implementation created by Yahoo. [Fluxible](http://fluxible.io/) solves the problem of passing your application's state to your clients by implementing a `rehydrate()` method in your stores.

Upon creating our stores, we then populate it with JSON data embedded into the DOM via PHP and a simple script tag. This saves us from having to make subsequent requests for information after the page is loaded.

![State Transfer](/images/isomorphic-vegas/state.png)

The code to achieve this on the client front-end looks like this:

```
const app = new Fluxible();
app.registerStore(require('stores/PageStore'));

var state = JSON.parse(document.querySelector('#fluxible-state').innerHTML);
app.rehydrate(state, (err, context) => {
    logger.info('App state rehydrated!')
}
```

With our stores now populated with initial state from the server (such as games and promotions), we are able to build some simple data end points that will keep these stores up to date as and when needed... neat!

With our application's flux state now rehydrating from the server, we needed to handle rendering our React components on the server.

## Rosin

Rosin is a front end library created in-house to solve this very problem. Rosin scans the DOM on a page load and checks for a `data-react-component` attribute, replacing it with a React component found in the namespace found in the attributes value.

`<div data-react-component="my/react/component" data-prop-myprop="foo"></div>`

Rosin will look for a react component located at `my/react/component`, instantiating it with any prop types passed to it (`myprop = foo`).

This helps us by allowing the server to embed `<noscript>` tags within these elements which will simply get stripped out by Rosin and replaced with the React component. However for browsers without javascript enabled (such as search engine crawlers), these no-script tags can be populated with content we intend for the search engine to see. We can also populate them with static content that we want to be presented to users before the page loads.

```
// Mustache template file
<div data-react-component="react/game/GamesList">
    <noscript>
        { {> gamesList} }
    </noscript/>
</div>
```

Technically, we aren't actually rendering our React components at all, only specifying where in the markup we want them to be rendered. This comes with a few drawbacks such as adding to the initial loading time, but it achieves everything we need it to and we are able to integrate with our other existing SB&G products far more easily.

## Conclusion

Taking a step back from Vegas after two years, observing it's fundamental design is an interesting process. As most modern web crawlers have become more powerful, SEO is less of a problem for React applications. The React ecosystem and community has also developed to a much better state than it was in two years ago. There are far more tools available to us which would allow us to simplify our solution significantly.

That being said, I am very proud of the current state of the site and we are definitely moving in the right direction. We are slowly moving more and more of our logic to our front end giving us far more control over the user experience. Every day working on Vegas is exciting, using the latest technologies to make betting and gaming better!
