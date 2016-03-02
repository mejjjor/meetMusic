<mm-item>
    <div>
        <!-- 
    if status.transfert == (ready || downloading)
        ready -> show play / pause / seek
        downloading -> show progress bar
        
    if status.player ==  (play || pause || stop)
        play -> show pause + seek
        pause -> show play + seek
        stop -> show play
 -->
        <i class="fa fa-ellipsis-v handle"></i>
        <img src="{ opts.content.track.thumbnail }" class='handle' />
        <i class="fa fa-play-circle fa-3x { opts.content.status.play }" onclick="{ play }"></i>
        <i class="fa fa-pause-circle fa-3x { opts.content.status.pause }" onclick="{ pause }"></i>
        <div>
            <span>{ opts.content.track.artist }</span>
            <span> { opts.content.track.title }</span>
        </div>
        <div>
            <img src="{ opts.content.contributor.thumbnail }" class="img-circle" />
            <span>{ opts.content.contributor.name }</span>
        </div>
        <div>
            <i class="fa fa-arrow-circle-o-down fa-2x"></i>
            <i class="fa fa-times-circle-o fa-2x" onclick="{ delete }"></i>
        </div>
    </div>
    <div class='{ opts.content.status.pause }'>
        <input type='range' value="{ opts.content.track.progress }" max="{ opts.content.track.duration }" onclick='{ seekTime }'>
        <span>{ opts.content.track.progress } / { opts.content.track.duration }</span>
        </progress>
    </div>
    <div class='nanobar'></div>
    <script>
    'use strict'
    var Nanobar = require('nanobar')

    this.on('mount', function() {
        opts.eventBus = this.parent.opts.eventBus;
        this.nanobar = new Nanobar({
            bg: '#607d8b',
            target: this.root.lastChild
        });
    })

    this.opts.content.updateTransfert = (value) => {
        this.nanobar.go(value)
    }

    play(e) {
        opts.content.play(opts.content.id)
        if (global.isOwner) {
            opts.eventBus.trigger('stopOthers', opts.content.id)
            opts.eventBus.trigger('playId', opts.content.id)
            opts.eventBus.trigger('updateItems', this.playlist)
        }
    }

    pause(e) {
        if (global.isOwner) {
            opts.content.status.play = 'show'
            opts.content.status.pause = 'hide'
            opts.eventBus.trigger('updateItems')
        }
        opts.content.pause()
    }

    seekTime(e) {
        opts.content.seekTime(e.srcElement.value);
    }

    delete(e) {
        opts.eventBus.trigger('deleteItem', opts.content.id)
    }
    </script>
</mm-item>
