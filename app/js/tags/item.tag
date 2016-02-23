<mm-item>
    <i class="fa fa-play-circle fa-2x { opts.content.status.play }" onclick="{ play }"></i>
    <i class="fa fa-pause-circle fa-2x { opts.content.status.pause }" onclick="{ pause }"></i>
    <i class="fa fa-forward { opts.content.status.next }" onclick="{ next }"></i>
    <img src="{ opts.content.track.thumbnail }" />
    <div>
        <span>{ opts.content.track.title }</span>
        <span>{ opts.content.contributor.name }</span>
    </div>
    <img src="{ opts.content.contributor.thumbnail }" class="img-circle" />
    <script>
    'use strict'
    this.on('mount', function() {
        opts.eventBus = this.parent.opts.eventBus;
    })

    play(e) {
        opts.eventBus.trigger('stopOthers',opts.content.id)
        opts.eventBus.trigger('setCurrent',opts.content.id)
        opts.content.play()
    }

    pause(e) {
        opts.content.status.play = 'show'
        opts.content.status.pause = 'hide'
        opts.content.pause()
    }

    next(e) {
        eventBus.trigger('playNext')
    }
    </script>
</mm-item>
