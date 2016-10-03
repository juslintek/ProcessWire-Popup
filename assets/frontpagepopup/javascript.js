/**
 * Created by barbe on 2016-04-11.
 */
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function checkCookie() {
    var user = getCookie("username");
    if (user != "") {
        alert("Welcome again " + user);
    } else {
        user = prompt("Please enter your name:", "");
        if (user != "" && user != null) {
            setCookie("username", user, 365);
        }
    }
}

jQuery(document).ready(function($) {
    function getTimeRemaining(endtime) {
        var t = Date.parse(endtime) - Date.parse(new Date());
        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        return {
            'total': t,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function initializeClock(id, endtime) {
        var clock = document.getElementById(id);
        var minutesSpan = $(clock).find('.minutes');
        var secondsSpan = $(clock).find('.seconds');

        function updateClock() {
            var t = getTimeRemaining(endtime);

            minutesSpan.html(('0' + t.minutes).slice(-2));
            secondsSpan.html(('0' + t.seconds).slice(-2));

            if (t.total <= 0) {
                clearInterval(timeinterval);
            }
        }

        updateClock();
        var timeinterval = setInterval(updateClock, 1000);
    }

    var deadline = new Date(Date.parse(new Date()) + 10 * 60 * 1000);
    initializeClock('countdown', deadline);

    $.validator.addMethod("lithuanian_phone", function(value, element) {
        return this.optional( element ) || /^(\+[\d]{1,3}\s?[\d]{3}\s?[\d]{3}\s?[\d]{2})|(\d\s?[\d]{3}\s?[\d]{3}\s?[\d]{2})$/.test( value );
    }, 'Įveskite telefono numerį lietuvišku tarptautiniu ar vietiniu formatu.');

    $.validator.addMethod("discount_code_validation", function(value, element) {
        var discount_code = $('#discount_code_check').text();
        var dc = new RegExp(discount_code,"i");
        return this.optional( element ) || dc.test( value );
    }, 'Įveskite pateiktą nuolaidos kodą.');

    $('#discount_code_submission').validate({
        rules: {
            discount_code: {
                required: true,
                discount_code_validation: true
            },
            phone_number: {
                required: true,
                lithuanian_phone: true,
                maxlength: 15

            }
        },
        messages: {
            discount_code: {
                required: 'Laukas privalomas.'
            },
            phone_number: {
                required: 'Laukas privalomas.'
            }
        },
        invalidHandler: function(form, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                //resize code goes here
                $('#discount_submit').prop('disabled',true);
            }
        },
        success: function(label){
            $('#discount_submit').prop('disabled',false);
        }
    });

    $(document).on('click','[data-dismiss=alert]', function(){
        $(this).parents('.alert').fadeOut();
    });

    function closePopup(){
        $('#popup_wrapper').fadeOut();
        $('body').removeClass('popup_open');
        setCookie('discount_closed', true, 7);
    }

    $(document).on('submit', '#discount_code_submission', function() {
        $.ajax({
            url     : $(this).attr('action'),
            type    : $(this).attr('method'),
            dataType: 'json',
            data    : $(this).serialize(),
            context : this,
            success : function( data ) {
                ga('send', 'event', 'Popupas', 'successful', 'Pateikė nuolaidos užklausą');
                var success_message = '<div class="alert alert-success" style="position: absolute; z-index: 999999; top: 50%"><a class="close" data-dismiss="alert">×</a><strong>Pavyko!</strong>  '+data.message+'</div>';
                $('#discount_code_submission').after(success_message);
                setTimeout(function() { closePopup(); },5000);
            },
            error   : function( xhr, err ) {
                //alert('Error');
            }
        });
        return false;
    });

    $('#close_popup').on('click',function(){
        ga('send', 'event', 'Popupas', 'closed', 'Išjungė nuolaidos popupą');
        closePopup();
    });

    setTimeout(function(){
        var cookie_value = getCookie('discount_closed');
        if(cookie_value.length==0&&window.location.href!=="http://langdena.lt/kontaktai/?ajax=1"){
            $('#popup_wrapper').fadeIn();
            $('body').addClass('popup_open');
        }
    },10000);

});