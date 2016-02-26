<mm-webrtc>
    <h3>Create a playlist or join one</h3>
    <input type='text' onkeyup='{ edit }' placeholder='playlist name'></input>
    <button onclick='{ createRoom }'>Create</button>
    <button onclick='{ joinRoom }'>Join</button>
    <script>
    'use strict'
    var SimpleWebRTC = require('../webrtc/simplewebrtc.js')
    this.room = location.search && location.search.split('?')[1]

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
        this.root.style.display = 'none'
        var val = this.room.toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '')
        webrtc.createRoom(val, function(err, name) {
            console.log(' create room cb', arguments)
            var newUrl = location.pathname + '?' + name
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

    opts.eventBus.on('addMp3', (data, file) => {
        data.file.name = file.name
        data.file.url = ''
        data.type = 'mp3'
        this.peer.sendData(data)
        var sender = this.peer.sendFile(file)
    })

    opts.eventBus.on('addVideo', (data) => {
        data.type = 'video'
        this.peer.sendData(data)
        console.log('send data video')
    })

    webrtc.on('createdPeer', (peer) => {
        console.log('createdPeer: ', peer.id)
        this.peer = peer
        if (peer && peer.pc) {
            peer.pc.on('iceConnectionStateChange', function(event) {
                console.log('state', peer.pc.iceConnectionState)
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
            if (metadata.type == 'mp3') {
                opts.eventBus.trigger('addItem', metadata)
                console.log('rtc mp3')
            }
            if (metadata.type == 'video') {
                opts.eventBus.trigger('addVideoFunctions', metadata, (data)=> {
                    opts.eventBus.trigger('addItem', data)
                    console.log('rtc video')
                })
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

    if (this.room) {
        this.root.style.display = 'none'
        webrtc.joinRoom(this.room, (err, res) => {
            console.log('joined', this.room, err, res)
        });
    }
    </script>
</mm-webrtc>
