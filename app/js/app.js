var riot = require('riot')
require('./search.tag')
require('./player.tag')
require('./result.tag')
require('./item.tag')
var playlist = require('./Playlist.js')

var Completely = require('./complete.ly.1.0.1.min.js')
var $ = require('jquery')
var _ = require('lodash')


var domReady = function(callback) {
    document.readyState === "interactive" || document.readyState === "complete" ? callback() : document.addEventListener("DOMContentLoaded", callback);
};

domReady(function() {
    var eventBus = riot.observable()
    riot.mount('*',{eventBus:eventBus})
    playlist.add({ item: "zzzz" })
    //console.log(playlist.getPlaylist())
});

global.init = function() {
    gapi.client.setApiKey("AIzaSyDrc_XoIlz_HqMflR0CHHOyatGemqwgAvo");
    gapi.client.load("youtube", "v3", function() {
        // player = new YT.Player('video-placeholder', {
        //     width: 600,
        //     height: 400,
        //     videoId: 'Xa0Q0J5tOP0',
        //     events: {
        //         onReady: initialize
        //     }
        // });
        console.log("YT READDDYY!");
    });
}
