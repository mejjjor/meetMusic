<mm-item>
    <div draggable='true'>
        <i class="fa fa-play-circle fa-3x { opts.content.status.play }" onclick="{ play }"></i>
        <i class="fa fa-pause-circle fa-3x { opts.content.status.pause }" onclick="{ pause }"></i>
        <img src="{ opts.content.track.thumbnail }" />
        <div>
            <span>{ opts.content.track.artist }</span><span> { opts.content.track.title }</span>
            <span>{ opts.content.contributor.name }</span>
        </div>
        <img src="{ opts.content.contributor.thumbnail }" class="img-circle" />
    </div>
    <div class='{ opts.content.status.pause }'>
        <i class="fa fa-forward fa-2x { opts.content.status.pause }" onclick="{ next }"></i>
        <input type='range' value="{ opts.content.track.progress }" max="{ opts.content.track.duration }" onclick='{ seekTime }'>
        <span>{ opts.content.track.progress } / { opts.content.track.duration }</span>
        </progress>
    </div>
    <script>
    'use strict'
    this.on('mount', function() {
        opts.eventBus = this.parent.opts.eventBus;
    })

    play(e) {
        if (global.isOwner) {
            opts.eventBus.trigger('stopOthers', opts.content.id)
            opts.eventBus.trigger('setCurrent', opts.content.id)
            opts.eventBus.trigger('updateItems', this.playlist)
        }
        opts.content.play(opts.content.id)
    }

    pause(e) {
        if (global.isOwner) {
            opts.content.status.play = 'show'
            opts.content.status.pause = 'hide'
            opts.eventBus.trigger('updateItems')
        }
        opts.content.pause()
    }

    next(e) {
        if (global.isOwner) {
            opts.eventBus.trigger('playNext')
            opts.eventBus.trigger('updateItems')
        } else {
            //send data play next
        }
    }

    seekTime(e) {
        opts.content.seekTime(e.srcElement.value);
    }
    </script>
</mm-item>
