/*
 * Placehold, A plugin for jQuery which replaces empty image sources with dummy images from either placehold.it or flickholdr.com
 * By: Samuel Nystedt, http://samn.se
 * Version: alpha 0.1
 * Updated: January 25th, 2012
 */
(function ($) {
    $.fn.placehold = function (options) {
        var settings = $.extend({
            color:undefined,
            useFlickr:false,
            useCanvas:false,
            tags:"",
            replaceAll:false
        }, options), randomColor = false, w, h, url;

        if (settings.color === undefined) randomColor = true;
        this.find("img").each(function (i, el) {
            if ($(el).attr("src") == "" || $(el).attr("data-src") == "" || settings.replaceAll == true) {
                w = $(el).attr("width");
                h = $(el).attr("height");

                if (w != undefined && h != undefined) {

                    if (settings.useFlickr === true && settings.tags != "") {
                        url = "http://flickholdr.com/" + w + "/" + h + "/" + settings.tags + "/" + parseInt(Math.random() * 100);
                    } else if (settings.useFlickr === true) {
                        url = "http://flickholdr.com/" + w + "/" + h + "/" + parseInt(Math.random() * 100);
                    } else if (settings.useCanvas === true) {
                        if (randomColor) settings.color = Math.floor(Math.random() * 0xffffff);
                        url = generateCanvasImage(w, h, settings.color);
                    } else {
                        if (randomColor) settings.color = Math.floor(Math.random() * 0xffffff);
                        url = "http://placehold.it/" + w + "x" + h + "/" + settings.color;
                    }


                    $(el).attr("src", url);
                    if ($(el).attr("data-src") !== undefined) $(el).attr("data-src", url); // if using data attribute to control img preloading

                }
            }
        });

        function generateCanvasImage(w, h, color) {

            var canvas, context, text, textSize, fontSize, textColor;
            canvas = document.createElement('canvas');
            if (canvas !== undefined) {
                context = canvas.getContext('2d');

                canvas.width = w;
                canvas.height = h;

                context.fillStyle = '#' +color.toString(16);
                context.fillRect(0, 0, w, h);

                text = '' + w + 'x' + h;

                // darken the txt color
                textColor =(color & 0xfefefe) >> 1; 
                textColor = textColor.toString(16);                            
                if(textColor.length == 5)textColor ='0'+textColor;
                if(textColor.length == 4)textColor ='00'+textColor;

                context.fillStyle = '#' +textColor.toString(16);
                context.textBaseline = 'middle';

                fontSize =100;
                context.font = 'bold '+fontSize+'px sans-serif';
                textSize = context.measureText(text);
                while(textSize.width>w){
                    fontSize --;
                    context.font = 'bold '+fontSize+'px sans-serif';
                    textSize = context.measureText(text);
                }

                context.fillText('' + w + 'x' + h, (w-textSize.width)*0.5, h*0.5);

                return canvas.toDataURL();
            } else return false;
        }

        return this;
    };
})(jQuery);