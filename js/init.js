
function randomColour() {
    var colors = ["b1", "b2", "b3", "b4"]
    var randomColor = Math.floor(Math.random()*colors.length);

    console.log('dfg')

    $('.home .noflex').each(function () {
        $(this).addClass(colors[randomColor]);
        randomColor = (randomColor + 1) % colors.length;
    });
}

function stickHead() {
    var stickyOffset = $('.sticky').offset().top;

    $(window).scroll(function(){
        var sticky = $('.sticky'),
            scroll = $(window).scrollTop();

        if (scroll >= stickyOffset) {
            sticky.addClass('headFixed')
            $('body').addClass('headFixed')
        } else {
            sticky.removeClass('headFixed')
            $('body').removeClass('headFixed')
        };
    });
}

// Load functions
// -------------------------------------------------------------------------------

$(document).ready(function(){
    stickHead();
});

$(document).scroll(function() {
});

$(window).resize(function() {
});















