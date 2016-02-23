<mm-player>
    <ol id='playlist'>
        <li each={ playlist }>
            <mm-item content="{ item }"></mm-item>
        </li>
    </ol>
    <script>
    'use strict'

    var Sortable = require("sortablejs");
    this.playlist = []
    this.currentId = 0

    this.on('mount', () => {
        var sortable = Sortable.create(document.getElementById('playlist'), {
            animation: 150,
            onEnd: (evt) => {
                let el = this.playlist[evt.oldIndex]
                this.playlist.splice(evt.newIndex, 0, this.playlist.splice(evt.oldIndex, 1)[0])
            }
        });
    })

    opts.eventBus.on('addItem', (data) => {
        data.id = getId()
        data.status.play = 'show'
        data.status.pause = 'hide'
        this.playlist.push({
            item: data
        })
        this.update()
    })

    opts.eventBus.on('addPlayItem', (data) => {
        data.id = getId()
        opts.eventBus.trigger('stopOthers', data.id)
        this.playlist.push({
            item: data
        })
        this.currentId = data.id
        data.status.play = 'hide'
        data.status.pause = 'show'
        data.play()
        this.update()
    })

    opts.eventBus.on('stopOthers', (id) => {
        for (var i = 0; i < this.playlist.length; i++) {
            if (this.playlist[i].item.id != id) {
                if (this.playlist[i].item.status.play === 'hide') {
                    this.playlist[i].item.pause()
                    this.playlist[i].item.status.play = 'show'
                    this.playlist[i].item.status.pause = 'hide'
                }
            } else {
                this.playlist[i].item.status.play = 'hide'
                this.playlist[i].item.status.pause = 'show'
            }
        }
    })

    opts.eventBus.on('playNext', () => {
        var found = false
        for (var i = 0; i < this.playlist.length - 1; i++) {
            if (this.playlist[i].item.id === this.currentId) {
                opts.eventBus.trigger('stopOthers', this.playlist[i + 1].item.id)
                this.playlist[i + 1].item.play()

                this.currentId = this.playlist[i + 1].item.id
                found = true
                break
            }
        }
        //fin de la playlist
        if (!found) {
            this.playlist[i].item.status.play = 'show'
            this.playlist[i].item.status.pause = 'hide'
            this.playlist[i].item.pause()
        }
        this.update()
    })

    opts.eventBus.on('setCurrent', (id) => {
        this.currentId = id
    })

    opts.eventBus.on('getSeekTime', (value) => {
        for (var i = 0; i < this.playlist.length; i++)
            if (this.playlist[i].item.id == this.currentId) {
                this.playlist[i].item.track.progress = value
                break
            }
        this.update()
    })

    var getId = (function() {
        var counter = 0
        return function() {
            return counter++
        }
    }())
    </script>
</mm-player>
