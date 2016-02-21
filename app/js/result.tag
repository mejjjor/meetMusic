<mm-result>
    <i class="fa fa-play-circle fa-3x" onclick="{ play }"></i>
    <i class="fa fa-plus-circle fa-3x" onclick="{ add }"></i>
    <img src="{ track.thumbnail }" />
    <span>{ track.duration }</span>
    <span>{ track.title }</span>
    <script>
    'use strict'
    // var Core = require('./core.js')
    // this.obs = new Core.get();



    this.on('mount',function(){
        this.opts.eventBus = this.parent.opts.eventBus;
    })

    add(e) {
        var item = {
            track: this.track,
            contributor: this.contributor
        }
        console.log('trigger addErik')
        this.opts.eventBus.trigger('addErik', item)
    }

    // play(e) {
    //     //add and play
    // }


    //How get this.contributor ?
    this.track = {
        title: opts.content.snippet.title,
        duration: opts.content.contentDetails.duration.replace(/(PT|S)/g, '').replace(/[^0-9]+/g, ':')
    };
    this.track.thumbnail = opts.content.snippet.thumbnails.default.url
    </script>
</mm-result>
