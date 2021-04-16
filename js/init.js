(function() {
    'use strict';

    var st = document.readyState,
        readyHandlers = false,
        running = false,
        scrollFn = function() {
            if (running) { return; }
            running = true;
            requestAnimationFrame(function() {
                window.dispatchEvent(new CustomEvent('optimisedScroll'));
                running = false;
            });
        },

        readyFn = function() {

            var isTouch = window.hasOwnProperty('ontouchstart') && window.ontouchstart,
                Elements = {
                    'header': document.querySelector('header'),
                    'body': document.querySelector('body'),
                    'title': document.querySelector('.page-title'),
                    'trigger': document.querySelector('.trigger'),
                    'pageLinks': document.querySelector('.page-links'),
                    'social': document.querySelector('.social'),
                    'menu': document.querySelector('.mobile-menu'),
                },
                Positions = {
                    'pageLinks': Elements.pageLinks.offsetTop,
                    'doc': window.scrollY,
                },
                Handler = isTouch ? 'touchstart' : 'click';

            if (!~Elements.header.classList.value.indexOf('hasImage')) {
                var images = ['header-bg.jpg', 'header-bg2.jpg', 'header-bg3.jpg', 'header-bg5.jpg', 'header-bg6.jpg', 'header-bg7.jpg'];
                Elements.header.style.backgroundImage = 'url(/images/bg/' + images[Math.floor(Math.random() * images.length)] + ')';
            }


            if (!!Elements.title) {
                window.addEventListener('scroll', scrollFn);
                window.addEventListener('optimisedScroll', function() {
                    Positions.doc = window.scrollY;

                    if (Positions.doc >= Positions.pageLinks) {
                        Elements.body.classList.add('headFixed');
                    } else if (!Elements.body.classList.contains('always')) {
                        Elements.body.classList.remove('headFixed');
                    }
                }, false);
            }

            if (!!Elements.trigger) {
                Elements.trigger.addEventListener(Handler, function() {
                    Elements.trigger.classList.toggle('trigger--active');
                    Elements.menu.classList.toggle('trigger--active');
                    Elements.pageLinks.classList.toggle('trigger--active');
                    Elements.social.classList.toggle('trigger--active');
                }, false);
            }

            if (typeof Function === typeof svg4everybody) {
                svg4everybody();
            }

        }, readyIe = function() {
            if ('complete' === st) {
                readyFn();
            }
        };

    if (('complete' === st) || (!document.attachEvent && 'interactive' === st)) {
        setTimeout(readyFn, 1);
    } else if (!readyHandlers) {
        document.addEventListener ?
            document.addEventListener('DOMContentLoaded', readyFn, false)
            : document.attachEvent('onreadystatechange', readyIe);

        readyHandlers = true;
    }
})();
