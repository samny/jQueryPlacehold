/*
 * Placehold, A plugin for jQuery which replaces empty image sources with dummy images from either placehold.it or flickholdr.com
 * By: Samuel Nystedt, http://samn.se
 * Version: alpha 0.1
 * Updated: January 25th, 2012
 */
(function($) {
    $.fn.placehold = function(options) {
        var settings = $.extend({
            color:undefined,
            useFlickr:false,
            tags:""
        }, options), randomColor = false, w, h, url;

        if (settings.color === undefined) randomColor = true;
        this.find("img").each(function(i, el) {
            if ($(el).attr("src") == "") {
                w = $(el).attr("width");
                h = $(el).attr("height");               

                if (settings.useFlickr === false) {
                    if (randomColor) settings.color = Math.random() * 0xffffff;
                    url = "http://placehold.it/" + w + "x" + h + "/" + settings.color;
                } else if (settings.useFlickr === true && settings.tags != "") {
                    url = "http://flickholdr.com/" + w + "/" + h + "/" + settings.tags + "/" + parseInt(Math.random() * 100);
                } else if (settings.useFlickr === true) {
                    url = "http://flickholdr.com/" + w + "/" + h + "/" + parseInt(Math.random() * 100);
                }
                $(el).attr("src", url);
            }
        });

        return this;
    };
})(jQuery);