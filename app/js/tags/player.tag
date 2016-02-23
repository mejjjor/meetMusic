<mm-player>
    <audio id='mp3Player' ontimeupdate="{ timeUpdate }"></audio>
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
    var mp3Player

    this.on('mount', () => {
        mp3Player = document.getElementById('mp3Player')
        mp3Player.onended = () => {
            opts.eventBus.trigger('playNext')
        }

        var sortable = Sortable.create(document.getElementById('playlist'), {
            animation: 150,
            onEnd: (evt) => {
                let el = this.playlist[evt.oldIndex]
                this.playlist.splice(evt.newIndex, 0, this.playlist.splice(evt.oldIndex, 1)[0])
            }
        });
    })

    timeUpdate(e) {
        getCurrentItem().track.progress = mp3Player.currentTime
    }

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
                this.playlist[i].item.track.progress = Math.round(value)
                break
            }
        this.update()
    })

    opts.eventBus.on('playMp3', (url) => {
        if (mp3Player.currentSrc === url && !mp3Player.ended) {
            mp3Player.play();
        } else {
            mp3Player.src = url
            mp3Player.play()
        }
    })

    opts.eventBus.on('pauseMp3', () => {
        //mp3Player.src = URL.createObjectURL(file)
        mp3Player.pause()
    })



    var getId = (function() {
        var counter = 0
        return function() {
            return counter++
        }
    }())

    var getCurrentItem = ()=> {
        for (var i = 0; i < this.playlist.length; i++)
            if (this.playlist[i].item.id === this.currentId)
                return this.playlist[i].item
        return {}
    }
    </script>
</mm-player>
