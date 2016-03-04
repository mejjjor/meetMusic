global.riot = require('riot')
var $ = require('jquery')
var _ = require('lodash')
var Completely = require('./vendors/complete.ly.1.0.1.min.js')
require('./tags/webrtc.tag')
require('./tags/search.tag')
require('./tags/player.tag')
require('./tags/result.tag')
require('./tags/item.tag')
require('./tags/video.tag')
require('./tags/addFile.tag')
require('./tags/title.tag')
require('./tags/parameters.tag')
require('./tags/social.tag')
    // require('./tags/tags.js')
var eventBus

var domReady = function(callback) {
    document.readyState === "interactive" || document.readyState === "complete" ? callback() : document.addEventListener("DOMContentLoaded", callback);
};

domReady(function() {

    eventBus = riot.observable()
    riot.mount('*', { eventBus: eventBus });

    (function() {
        var log = console.error;
        console.error = function() {
            eventBus.trigger('errorOccurs')
            log.apply(this, Array.prototype.slice.call(arguments));
        };
    }());
    window.onerror = (error, url, line) => {
        eventBus.trigger('errorOccurs')
    };
});

global.init = function() {
    gapi.client.setApiKey("AIzaSyDrc_XoIlz_HqMflR0CHHOyatGemqwgAvo");
    gapi.client.load("youtube", "v3", function() {
        // eventBus.trigger('YTReady')
    });
}

global.onYTStateChange = function(event) {
    if (event.data === 0) {
        eventBus.trigger('playNext')
    }
}
