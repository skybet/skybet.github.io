(function() {
    'use strict';

    var st = document.readyState,
        readyHandlers = false,
        readyFn = function() {
            var isTouch = window.hasOwnProperty('ontouchstart') && window.ontouchstart,
                Elements = {
                    'sticky': document.querySelector('.sticky'),
                    'body': document.querySelector('body'),
                    'title': document.querySelector('.page-title'),
                    'trigger': document.querySelector('.trigger'),
                    'menu': document.querySelector('.mobile-menu'),
                },
                Positions = {
                    'sticky': Elements.sticky.offsetTop,
                    'doc': window.scrollY,
                },
                Handler = isTouch ? 'touchstart' : 'click';

            if(!!Elements.title) {
                window.addEventListener('scroll', function() {
                    Positions.doc = window.scrollY;

                    if (Positions.doc >= Positions.sticky) {
                        if (!Elements.sticky.classList.contains('headFixed')) {
                            Elements.sticky.classList.add('headFixed');
                            Elements.body.classList.add('headFixed');
                        }
                    } else {
                        if (Elements.sticky.classList.contains('headFixed')) {
                            Elements.sticky.classList.remove('headFixed');
                            Elements.body.classList.remove('headFixed');
                        }
                    }
                }, false);
            }

            if(!!Elements.trigger) {
                Elements.trigger.addEventListener(Handler, function() {
                    Elements.trigger.classList.toggle('trigger--active');
                    Elements.menu.classList.toggle('trigger--active');
                }, false);
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
