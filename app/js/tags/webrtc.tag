<mm-webrtc>
    <div>
        <span>Owner : { isOwner }</span>
        <button onclick='{ reset }'>reset</button>
    </div>
    <div>
        <h3>Create a playlist or join one</h3>
        <input type='text' onkeyup='{ edit }' placeholder='playlist name'></input>
        <button onclick='{ createRoom }'>Create</button>
        <button onclick='{ joinRoom }'>Join</button>
    </div>
    <script>
    'use strict'
    var SimpleWebRTC = require('../webrtc/simplewebrtc.js')
    this.room = location.search && location.search.split('?')[1]
    var isOwner = ''
    var ownerId = ''
    var ownerPeer
    var peers = []

    this.on('mount', () => {
        if (this.room) {
            this.root.childNodes[2].style.display = 'none'
            webrtc.joinRoom(this.room, (err, res) => {
                console.log('joined', this.room, err, res)
                isOwner = false
                global.isOwner = false
                this.isOwner = 'false'
                this.update()
            });
        }
    })
    var webrtc = new SimpleWebRTC({
        // we don't do video
        localVideoEl: '',
        remoteVideosEl: '',
        // dont ask for camera access
        autoRequestMedia: false,
        // dont negotiate media
        receiveMedia: {
            mandatory: {
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: false
            }
        }
    });

    edit(e) {
        this.room = e.target.value
    }

    createRoom(e) {
        this.root.childNodes[2].style.display = 'none'
        var val = this.room.toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '')
        webrtc.createRoom(val, (err, name) => {
            console.log(' create room cb', arguments)
            var newUrl = location.pathname + '?' + name
            isOwner = true
            global.isOwner = true
            this.isOwner = 'true'
            ownerId = webrtc.connection.connection.id
            this.update()
            if (!err) {
                history.replaceState({
                    foo: 'bar'
                }, null, newUrl)
            } else {
                console.log(err)
            }
        });
    }

    joinRoom(e) {
        location.search = this.room
    }

    reset(e) {
        location.search = ''
    }

    opts.eventBus.on('addMp3', (data, file) => {
        data.type = 'mp3'
        if (isOwner)
            opts.eventBus.trigger('addItem', data)
        else {
            data.file.url = ''
            ownerPeer.sendData(data)
            var sender = ownerPeer.sendFile(file)
        }
    })

    opts.eventBus.on('addVideo', (data) => {
        data.type = 'video'
        if (isOwner)
            opts.eventBus.trigger('addItem', this.data)
        else
            ownerPeer.sendData(data)
    })

    opts.eventBus.on('updatePlaylist', (playlist) => {
        if (isOwner)
            for (var peer of peers)
                peer.sendData({
                    playlist: playlist,
                    type: 'update'
                })
        else
            ownerPeer.sendData({
                playlist: playlist,
                type: 'update'
            })
    })

    opts.eventBus.on('addRemoteFunctions', (playlist) => {
        for (var item of playlist) {
            item.item.play = function(id) {
                ownerPeer.sendData({
                    id: id,
                    type: 'play'
                })
            }
            item.item.pause = function() {
                ownerPeer.sendData({
                    type: 'pause'
                })
            }
            item.item.seekTime = function(value) {
                ownerPeer.sendData({
                    type: 'seek',
                    value: value
                })
            }

        }
    })

    opts.eventBus.on('addVideo', (data) => {
        data.type = 'video'
        if (isOwner)
            opts.eventBus.trigger('addItem', this.data)
        else
            ownerPeer.sendData(data)
    })

    webrtc.on('createdPeer', (peer) => {
        console.log('me: ', webrtc.connection.connection.id)
        console.log('createdPeer: ', peer.id)
        peer.sendData({
            ownerId: ownerId,
            type: 'init'
        })
        if (peer && peer.pc) {
            peer.pc.on('iceConnectionStateChange', function(event) {
                console.log('state', peer.pc.iceConnectionState)
                if (peer.pc.iceConnectionState == 'closed')
                    _.remove(peers, (p) => {
                        return p == peer
                    })
            })
        }
        peer.on('fileTransfer', (metadata, receiver) => {
            console.log('incoming filetransfer', metadata)
            receiver.on('progress', function(bytesReceived) {
                //on progress
            })
            receiver.on('receivedFile', (file, metadata) => {
                console.log('received file', metadata.name, metadata.size)

                opts.eventBus.trigger('addFileToItem', file, metadata)
                receiver.channel.close()
            })
        })
        peer.on('dataTransfer', (metadata) => {
            console.log('incoming datatransfer', metadata)
            console.log('from', peer)
            switch (metadata.type) {
                case 'init':
                    if (isOwner)
                        peers.push(peer)
                    if (metadata.ownerId == '')
                        opts.eventBus.trigger('updateItems')
                    if (ownerId == '')
                        ownerId = metadata.ownerId

                    if (metadata.ownerId != '' && ownerId != metadata.ownerId) {
                        console.error('OWNER CONFLICT !! you: ' + webrtc.connection.connection.id + ' with owner: ' + ownerId + ' are in conflict with owner: ' + metadata.ownerId + ' from peer: ' + peer.id)
                    } else if (peer.id == ownerId)
                        ownerPeer = peer
                    console.log('ownerPeer ', ownerPeer)
                    break
                case 'mp3':
                    opts.eventBus.trigger('addItem', metadata)
                    break
                case 'video':
                    opts.eventBus.trigger('addVideoFunctions', metadata, (data) => {
                        opts.eventBus.trigger('addItem', data)
                    })
                    break
                case 'update':
                    opts.eventBus.trigger('setPlaylist', metadata.playlist)
                    break
                case 'play':
                    opts.eventBus.trigger('playId', metadata.id)
                    break
                case 'pause':
                    opts.eventBus.trigger('pauseCurrent')
                    break
                case 'seek':
                    opts.eventBus.trigger('seekCurrent', metadata.value)
                    break
            }
        })
    })

    // local p2p/ice failure
    webrtc.on('iceFailed', function(peer) {
        console.log('local fail with peer: ' + peer)
    })

    // remote p2p/ice failure
    webrtc.on('connectivityError', function(peer) {
        console.log('remote fail with peer: ' + peer)
    })
    </script>
</mm-webrtc>
