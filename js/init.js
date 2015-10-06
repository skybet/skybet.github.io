
function randomColour() {
    var colors = ["b1", "b2", "b3", "b4"]
    var randomColor = Math.floor(Math.random()*colors.length);

    console.log('dfg')

    $('.home .noflex').each(function () {
        $(this).addClass(colors[randomColor]);
        randomColor = (randomColor + 1) % colors.length;
    });
}


function parallax() {

    var windowHeight = $(window).height();

    var scrollfn = function(){

        var headparallax = $('header.page');
        var scrollTop = $(window).scrollTop();
        var offset = headparallax.offset().top;
        var height = headparallax.outerHeight();

        if (offset + height <= scrollTop || offset >= scrollTop + windowHeight) {
            return;
        }

        var yBgPosition = Math.round((offset - scrollTop) * 2);

        headparallax.css('background-position', 'center ' + yBgPosition + 'px');

    };

    $(document).scroll(scrollfn);

}

function hidehead() {

    if ($(window).scrollTop() > 20){
        // $('header.page').height('60px');
        $('header.page').css('z-index' , '300');
    }
    else{
         // $('header.page').height('100px');
        $('header.page').css('z-index' , '100');
    }
}

// Load functions
// -------------------------------------------------------------------------------

$(document).ready(function(){
    // randomColour();

    parallax();

});

$(document).scroll(function() {
    hidehead();
});

$(window).resize(function() {
});















