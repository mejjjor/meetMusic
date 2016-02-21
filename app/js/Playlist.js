var playlist = [];

module.exports = {
	getPlaylist: function(){
		return playlist;
	},
	add:function(item){
		playlist.push(item);
	}

}