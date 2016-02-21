var riot = require('riot')
var playlist
module.exports = {


    get: function() {

        // Make Car instances observable
        riot.observable(this);

        // listen to "start" event
        this.on("addToPlaylist", function(item) {
            console.log(item)
            playlist.add({item:item})
        })
    },
    addPlaylist: function(list) {
        console.log('dedede')
        playlist = list
    }

}
