/*
 * jQuery Placehold, A plugin for jQuery which replaces empty image sources with dummy images
 *
 * Supports color.js for color-schemes (https://github.com/brehaut/color-js)
 *
 * (First version used remote services placehold.it or flickholdr.com, but removed support for simplicity, now uses HTML5 canvas and fallback url for older browsers).
 *
 * By: Samuel Nystedt, http://samn.se
 * Version: alpha
 * Updated: March 27th, 2012
 *
 */

/*global jQuery, net*/

(function ($) {
    "use strict";

    //color.js schemes
    var colorSchemes = [
        "complementaryScheme",
        "splitComplementaryScheme",
        "splitComplementaryCWScheme",
        "splitComplementaryCCWScheme",
        "triadicScheme",
        "clashScheme",
        "tetradicScheme",
        "fourToneCWScheme",
        "fourToneCCWScheme",
        "fiveToneAScheme",
        "fiveToneCScheme",
        "fiveToneBScheme",
        "fiveToneDScheme",
        "fiveToneEScheme",
        "sixToneCWScheme",
        "sixToneCCWScheme",
        "neutralScheme",
        "analogousScheme"
    ];


    $.fn["placehold"] = function (options) {

        var settings = $.extend({
            "colors":[],
            "useScheme":"neutralScheme", //neutralScheme
            "replaceAll":false, // even if src is not empty
            "forceFallback":false,
            "fallbackImage":"placehold.php"
        }, options),

            hasCanvas = (function () {
                var canvas = document.createElement("canvas"),
                    hasCanvas = (canvas.getContext) ? true : false;
                return hasCanvas;
            }()),

            /**
             * getRandomHexColor
             * @return {string}
             */
                getRandomHexColor = function () {
                var x = Math.round((Math.random() * 0xffffff)), y, z, z1;
                x = x.toString(16);
                y = (6 - x.length);
                z = "000000";
                z1 = z.substring(0, y);
                return "#" + z1 + x;
            },

            // from http://www.sitepoint.com/javascript-generate-lighter-darker-color/

            /**
             * colorLuminance
             *  @param {(string|number)} hex
             *  @param {number} lum
             *  @return {string}
             */
                colorLuminance = function (hex, lum) {
                var rgb = "#", c, i;
                // validate hex string
                hex = String(hex).replace(/[^0-9a-f]/gi, "");
                if (hex.length < 6) {
                    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
                }
                lum = lum || 0;

                // convert to decimal and change luminosity
                for (i = 0; i < 3; i++) {
                    c = parseInt(hex.substr(i * 2, 2), 16);
                    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
                    rgb += ("00" + c).substr(c.length);
                }
                return rgb;
            },

            /**
             * generateCanvasImage
             * @param {(string|number)} w
             * @param {(string|number)} h
             * @param {(string|number)} color
             * @return {string}
             */
                generateCanvasImage = function (w, h, color) {
                var canvas, context, text, textSize, fontSize, textColor, url = null;
                canvas = document.createElement("canvas");
                if (canvas !== undefined) {
                    context = canvas.getContext("2d");

                    canvas.width = w;
                    canvas.height = h;

                    context.fillStyle = color;
                    context.fillRect(0, 0, w, h);

                    text = w + "x" + h;
                    textColor = colorLuminance(color, -0.05);

                    context.fillStyle = textColor;
                    context.shadowColor = "rgba(255,255,255,0.1)";
                    context.shadowOffsetX = 1;
                    context.shadowOffsetY = 1;
                    context.shadowBlur = 0;
                    context.textBaseline = "middle";

                    fontSize = h;
                    context.font = "bold " + fontSize + "px sans-serif";
                    textSize = context.measureText(text);
                    while (textSize.width > w) {
                        fontSize -= 5;
                        context.font = "bold " + fontSize + "px sans-serif";
                        textSize = context.measureText(text);
                    }

                    context.fillText(w + "x" + h, (w - textSize.width) * 0.5, h * 0.5);

                    url = canvas.toDataURL();
                }
                return url;
            },

            /**
             * setSources
             * @param {(Array)} colors
             */
                setSources = function (colors) {
                var numColors = colors.length, w, h, url, color;

                this.each(function (i, el) {
                    var attrSrc = $(el).attr("src"), attrDataSrc = $(el).attr("data-src");
                    if (attrSrc === "" || attrDataSrc === "" || settings.replaceAll === true) {
                        w = $(el).attr("width");
                        h = $(el).attr("height");

                        if (w !== undefined && h !== undefined) {
                            color = colors[i % numColors];
                            if (settings["forceFallback"] !== true && hasCanvas) {
                                url = generateCanvasImage(w, h, color);
                            } else if (settings["fallbackImage"]) {
                                url = settings["fallbackImage"] + "?c=" + color.substr(1) + "&w=" + w + "&h=" + h;
                            }
                            $(el).attr("src", url);
                            if (attrDataSrc !== undefined) {
                                $(el).attr("data-src", url);
                            }
                        }
                    }
                });
            };

        return this.each(function () {
            var $this = $(this), $images, l, i, c, color, colors = settings["colors"] , Color, useScheme = settings["useScheme"];

            try {
                Color = window["net"]["brehaut"]["Color"];
            } catch (err) {
                // color.js not available
            }

            $images = $this.find("img");
            l = $images.length;

            if (useScheme !== "" && Color) {
                if (useScheme === "random") {
                    useScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
                }

                color = colors[0] || getRandomHexColor();
                c = Color(color);

                if (typeof(c[useScheme]) === typeof(Function)) {
                    colors = c[useScheme]();
                    for (i = 0; i < colors.length; i++) {
                        colors[i] = colors[i]["toCSS"]();
                    }
                }
            } else if (!colors || colors.length === 0) {
                colors = [];
                for (i = 0; i < l; i++) {
                    color = getRandomHexColor();
                    colors.push(color);
                }
            }

            setSources.call($images, colors);
        });

    };
}(jQuery));

