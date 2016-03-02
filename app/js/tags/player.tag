<mm-player ondragover='{ dragover }' ondrop='{ drop }'>
    <audio id='mp3Player' ontimeupdate="{ timeUpdate }" onplaying='{ playAudio }'></audio>
    <ol id='playlist'>
        <li each={ playlist }>
            <mm-item content="{ item }"></mm-item>
        </li>
    </ol>
    <script>
    'use strict'

    var Sortable = require("sortablejs")
    var _ = require('lodash')
    this.playlist = []
    this.playlistListenned = []
    this.currentId = 0
    var mp3Player

    this.on('mount', () => {
        mp3Player = document.getElementById('mp3Player')
        mp3Player.onended = () => {
            opts.eventBus.trigger('playNext')
        }

        var sortable = Sortable.create(document.getElementById('playlist'), {
            handle: '.handle',
            animation: 150,
            onEnd: (evt) => {
                let el = this.playlist[evt.oldIndex]
                this.playlist.splice(evt.newIndex, 0, this.playlist.splice(evt.oldIndex, 1)[0])
                opts.eventBus.trigger('updatePlaylist', this.playlist)
            }
        });
    })

    timeUpdate(e) {
        opts.eventBus.trigger('getSeekTime', mp3Player.currentTime)
    }


    playAudio(e) {
        getCurrentItem().track.duration = Math.round(mp3Player.duration)
    }

    dragover(e) {
        e.preventDefault();
        e.stopPropagation();

    }
    drop(e) {
        e.preventDefault();
        e.stopPropagation();
        opts.eventBus.trigger('addFiles', _.values(e.dataTransfer.files))
    }

    opts.eventBus.on('addItem', (data) => {
        data.id = getId.next()
        data.status.play = 'show'
        data.status.pause = 'hide'
        this.playlist.push({
            item: data
        })

        //send playlist to others (just item, no file)
        opts.eventBus.trigger('updatePlaylist', this.playlist)
        this.update()
    })

    opts.eventBus.on('addFileToItem', (file, data) => {
        console.log(data)
        for (var i = 0; i < this.playlist.length; i++) {
            if (this.playlist[i].item.file.name == data.name)
                opts.eventBus.trigger('addMp3Functions', this.playlist[i].item, URL.createObjectURL(file))
            console.log(this.playlist[i])
        }
    })

    // opts.eventBus.on('addPlayItem', (data) => {
    //     data.id = getId.next()
    //     opts.eventBus.trigger('stopOthers', data.id)
    //     this.playlist.push({
    //         item: data
    //     })
    //     this.currentId = data.id
    //     data.status.play = 'hide'
    //     data.status.pause = 'show'
    //     data.play()
    //     this.update()
    // })

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
                // opts.eventBus.trigger('stopOthers', this.playlist[i + 1].item.id)
                // this.playlist[i + 1].item.play()
                    //this.currentId = this.playlist[i + 1].item.id
                    // opts.eventBus.trigger('setCurrent', this.playlist[i + 1].item.id)
                opts.eventBus.trigger('playId', this.playlist[i + 1].item.id)
                found = true
                break
            }
        }

        //fin de la playlist
        if (!found) {
            this.playlist[i].item.status.play = 'show'
            this.playlist[i].item.status.pause = 'hide'
            this.playlist[i].item.pause()
            this.playlistListenned.push(this.playlist.splice(0, 1)[0])
            opts.eventBus.trigger('updatePlaylist', this.playlist)
            this.update()
        }
    })

    opts.eventBus.on('setCurrent', (id) => {
        var toDelete = []
        for (var i = 0; i < this.playlist.length; i++) {
            if (this.playlist[i].item.id == id)
                break
        }
        Array.prototype.push.apply(this.playlistListenned, this.playlist.splice(0, i))
        console.log("zzz", this.playlistListenned)

        this.currentId = id
        this.update()
    })

    opts.eventBus.on('deleteItem', (id) => {
        for (var i = 0; i < this.playlist.length; i++)
            if (this.playlist[i].item.id == id) {
                if (this.playlist[i].item.status.play == 'hide')
                    opts.eventBus.trigger('pauseCurrent')
                this.playlist.splice(i, 1)
                opts.eventBus.trigger('updatePlaylist', this.playlist)
                break
            }
        this.update()
    })

    opts.eventBus.on('getSeekTime', (value) => {
        for (var i = 0; i < this.playlist.length; i++)
            if (this.playlist[i].item.id == this.currentId) {
                var progress = this.playlist[i].item.track.progress
                if (Math.round(value) % 25 == 0 && progress != Math.round(value) || (progress == 0 && value > 0))
                    opts.eventBus.trigger('updatePlaylist', this.playlist)
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
        mp3Player.pause()
    })

    opts.eventBus.on('seekMp3', (value) => {
        mp3Player.currentTime = value
    })

    opts.eventBus.on('setPlaylist', (playlist) => {
        //si owner, uniquement reorder
        if (global.isOwner) {
            var newPlaylist = []
            for (var item of playlist)
                for (var item2 of this.playlist)
                    if (item2.item.id == item.item.id) {
                        newPlaylist.push(item2)
                        break
                    }
            this.playlist = newPlaylist
            opts.eventBus.trigger('updatePlaylist', this.playlist)
        } else {
            this.playlist = playlist
            opts.eventBus.trigger('addRemoteFunctions', this.playlist)
        }
        this.update()
    })

    opts.eventBus.on('playId', (id) => {
        for (var item of this.playlist)
            if (item.item.id === id && item.item.play != undefined) {
                opts.eventBus.trigger('stopOthers', id)
                opts.eventBus.trigger('setCurrent', id)
                item.item.play(id)
                opts.eventBus.trigger('updatePlaylist', this.playlist)
                break
            }
    })

    opts.eventBus.on('pauseCurrent', () => {
        var item = getCurrentItem()
        if (item.pause != undefined) {
            item.pause()
            item.status.play = 'show'
            item.status.pause = 'hide'
            opts.eventBus.trigger('updatePlaylist', this.playlist)
        }
    })

    opts.eventBus.on('updateItems', () => {
        opts.eventBus.trigger('updatePlaylist', this.playlist)
    })

    opts.eventBus.on('seekCurrent', (value) => {
        var item = getCurrentItem()
        if (item.seekTime != undefined) {
            item.seekTime(value)
        }
    })

    opts.eventBus.on('updateTransfert', function(name, ratio) {
        var item = getItemByName(name)
        if (item != undefined)
            item.updateTransfert(ratio)
    })

    var getId = (function() {
        var counter = 0
        return {
            next: function() {
                return counter++
            },
            set: function(val) {
                counter = val
            }
        }
    }())

    var getItemByName = (name) => {
        for (var i = 0; i < this.playlist.length; i++)
            if (this.playlist[i].item.file != undefined && this.playlist[i].item.file.name == name)
                return this.playlist[i].item
    }

    var getCurrentItem = () => {
        for (var i = 0; i < this.playlist.length; i++)
            if (this.playlist[i].item.id === this.currentId)
                return this.playlist[i].item
        return {}
    }
    </script>
</mm-player>
