var riot = require('riot')
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
var eventBus

var domReady = function(callback) {
    document.readyState === "interactive" || document.readyState === "complete" ? callback() : document.addEventListener("DOMContentLoaded", callback);
};

domReady(function() {

    eventBus = riot.observable()
    riot.mount('*', { eventBus: eventBus })
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
