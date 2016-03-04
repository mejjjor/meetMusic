<mm-result>
    <i class="fa fa-plus-circle fa-3x" onclick="{ add }"></i>
    <img src="{ data.track.thumbnail }" />
    <span>{ data.track.duration }</span>
    <span>{ data.track.title }</span>
    <script>
    'use strict'
    var moment = require('moment')
    this.on('mount', function() {
        opts.eventBus = this.parent.opts.eventBus;
        this.data = {
            track: {
                title: opts.content.snippet.title,
                duration: moment.duration(opts.content.contentDetails.duration).asSeconds(),
                thumbnail: opts.content.snippet.thumbnails.default.url,
                progress: 0
            },
            video: {
                id: opts.content.id.videoId
            },
            contributor: {
                name: global.contributorName,
                thumbnail: global.contributorPictureUrl
            },
            status: {}
        }
        opts.eventBus.trigger('addVideoFunctions', this.data, (data) => {
            this.data = data
        })
    })

    add(e) {
        opts.eventBus.trigger('removeResult', this.data.track.title)
        opts.eventBus.trigger('addVideo', this.data)
    }
    </script>
</mm-result>
