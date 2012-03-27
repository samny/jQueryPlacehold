/*
 * Placehold, A plugin for jQuery which replaces empty image sources with dummy images from either placehold.it or flickholdr.com
 * By: Samuel Nystedt, http://samn.se
 * Version: alpha 0.1
 * Updated: January 25th, 2012
 */
(function ($) {
    $.fn.placehold = function (options) {
        var settings = $.extend({
            colors:[],
            mode:'canvas', //'flickr', 'imagePhp', 'placeholdIt'
            useKuler:false,
            kulerMode:"popular",
            kulerThemeId:"",
            flickrTags:"",
            flickrHoldrUrl:"http://flickholdr.com/",
            placeHoldItUrl:"http://placehold.it/",
            imagePhpUrl:"image.php",
            replaceAll:false // even if src is not empty
        }, options),
            randomColor = false,
            $images, l, i, color, colors;

        $images = this.find("img");
        l = $images.length;

        if (settings.useFlickr === true) {
            setSources([]);
        }
        else if (settings.useKuler) {
            getKuler(setSources, settings.kulerMode, '');
        } else if (settings.colors.length > 0) {
            setSources(settings.colors);
        } else {
            colors = [];
            for (i = 0; i < l; i++) {
                var x = Math.round((Math.random() * 0xffffff));
                x = x.toString(16),
                    y = (6 - x.length),
                    z = "000000",
                    z1 = z.substring(0, y),
                    color = "#" + z1 + x;
                colors.push(color);
            }

            setSources(colors);
        }

        function setSources(colors) {
            var numColors = colors.length, w, h, url, color;

            $images.each(function (i, el) {
                if ($(el).attr("src") == "" || $(el).attr("data-src") == "" || settings.replaceAll == true) {
                    w = $(el).attr("width");
                    h = $(el).attr("height");

                    if (w != undefined && h != undefined) {
                        switch (settings.mode) {
                            case "canvas":
                                color = colors[i % numColors];
                                url = generateCanvasImage(w, h, color);
                                break;
                            case "imagePhp":
                                color = colors[i % numColors].substr(1);
                                url = settings.imagePhpUrl + "?c=" + color + "&w=" + w + "&h=" + h;
                                break;
                            case "flickr":
                                if (settings.tags != "") {
                                    url = settings.flickrHoldrUrl + w + "/" + h + "/" + settings.flickrTags + "/" + parseInt(Math.random() * 100);
                                } else {
                                    url = settings.flickrHoldrUrl + w + "/" + h + "/" + parseInt(Math.random() * 100);
                                }
                                break;
                            case "placeholdIt":
                                color = colors[i % numColors].substr(1);
                                url = settings.placeHoldItUrl + w + "x" + h + "/" + color;
                                break;
                        }

                        $(el).attr("src", url);
                        if ($(el).attr("data-src") !== undefined) $(el).attr("data-src", url);

                    }
                }
            });
        }

        function generateCanvasImage(w, h, color) {
            console.log(color);
            var canvas, context, text, textSize, fontSize, textColor;
            canvas = document.createElement('canvas');
            if (canvas !== undefined) {
                context = canvas.getContext('2d');

                canvas.width = w;
                canvas.height = h;

                context.fillStyle = color;
                context.fillRect(0, 0, w, h);

                text = '' + w + 'x' + h;
                textColor = colorLuminance(color, -0.05);

                context.fillStyle = textColor;
                context.shadowColor = "rgba(255,255,255,0.1)";
                context.shadowOffsetX = 1;
                context.shadowOffsetY = 1;
                context.shadowBlur = 0;
                context.textBaseline = 'middle';

                fontSize = h;
                context.font = 'bold ' + fontSize + 'px sans-serif';
                textSize = context.measureText(text);
                while (textSize.width > w) {
                    fontSize -= 5;
                    context.font = 'bold ' + fontSize + 'px sans-serif';
                    textSize = context.measureText(text);
                }

                context.fillText('' + w + 'x' + h, (w - textSize.width) * 0.5, h * 0.5);

                return canvas.toDataURL();
            } else return false;
        }


        // from http://www.sitepoint.com/javascript-generate-lighter-darker-color/
        function colorLuminance(hex, lum) {
            // validate hex string
            hex = String(hex).replace(/[^0-9a-f]/gi, '');
            if (hex.length < 6) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            lum = lum || 0;
            // convert to decimal and change luminosity
            var rgb = "#", c, i;
            for (i = 0; i < 3; i++) {
                c = parseInt(hex.substr(i * 2, 2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
                rgb += ("00" + c).substr(c.length);
            }
            return rgb;
        }

        function getKuler(callback, mode, theme) {
            var apiKey = "&key=D1D88C160B6C89EB90E910A9E9CA9E18",
                kulerUrl = "http://kuler-api.adobe.com/rss/",
                query = "";

            switch (mode) {
                case "popular":
                default:
                    query = "get.cfm?listtype=popular&timespan=30";
                    break;
                case "recent":
                    query = "get.cfm?listtype=recent";
                    break;
                case "random":
                    query = "get.cfm?listtype=random";
                    break;
                case "color":
                    var c = settings.colors[0].substr(1);
                    query = "search.cfm?searchQuery=hex:" + c + "&startIndex=0&itemsPerPage=10";
                    break;
                case "theme":
                    query = "search.cfm?searchQuery=themeID:" + theme + "&startIndex=0&itemsPerPage=10";
                    break;
            }
            console.log(query);
            $.ajax({
                url:'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(kulerUrl + query + apiKey),
                dataType:'json',
                success:function (data) {
                    var entries = data.responseData.feed.entries,
                        i = Math.round((entries.length - 1) * Math.random());
                    var colors = entries[i].content.toString().split("Hex:")[1];
                    colors = colors.replace(/^\s+|\s+$/g, "");
                    colors = colors.split(", ");
                    for (var j in colors) {
                        colors[j] = "#" + colors[j];
                    }
                    callback && callback(colors);
                }
            });
        }

        return this;
    };
})(jQuery);