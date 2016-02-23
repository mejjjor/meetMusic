<mm-item>
    <i class="fa fa-play-circle fa-2x" onclick="{ play }"></i>
    <i id="force" class="fa fa-pause-circle fa-2x" onclick="{ pause }"></i>
    <i class="fa fa-forward"></i>
    <img src="{ opts.content.track.thumbnail }" />
    <div>
        <span>{ opts.content.track.title }</span>
        <span>{ opts.content.contributor.name }</span>
    </div>
    <img src="{ opts.content.contributor.thumbnail }" class="img-circle" />
    <script>
    'use strict'
    var eClone
    this.on('mount', function() {
        opts.eventBus = this.parent.opts.eventBus;
        // opts.eventBus.on('videoR', () => {
        //     document.getElementById('force').click()
        // })
    })

    play(e) {
        opts.content.play()
    }



    pause(e) {
        opts.content.pause()
    }
    </script>
</mm-item>
