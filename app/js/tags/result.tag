<mm-result>
    <i class="fa fa-play-circle fa-3x" onclick="{ play }"></i>
    <i class="fa fa-plus-circle fa-3x" onclick="{ add }"></i>
    <img src="{ data.track.thumbnail }" />
    <span>{ data.track.duration }</span>
    <span>{ data.track.title }</span>
    <script>
    'use strict'
    var moment = require('moment')
    this.on('mount', function() {
        opts.eventBus = this.parent.opts.eventBus;
    })

    add(e) {
        opts.eventBus.trigger('addItem', this.data)
        opts.eventBus.trigger('removeResult', this.data.track.title)
    }

    play(e) {
        opts.eventBus.trigger('addPlayItem', this.data)
        opts.eventBus.trigger('removeResult', this.data.track.title)
    }

    this.data = {
        track: {
            title: opts.content.snippet.title,
            duration: moment.duration(opts.content.contentDetails.duration).asSeconds(),
            thumbnail: opts.content.snippet.thumbnails.default.url,
            progress:0
        },
        contributor: {
            name: "erik",
            thumbnail: "/favicon.png"
        },
        status: {},
        play: function() {
            opts.eventBus.trigger('playVideo', opts.content.id.videoId)
        },
        pause: function() {
            opts.eventBus.trigger('pauseVideo')
        },
        seekTime:function(value){
            opts.eventBus.trigger('setSeekTimeVideo', value)
        }
    }
    </script>
</mm-result>
