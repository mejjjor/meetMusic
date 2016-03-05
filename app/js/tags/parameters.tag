<mm-parameters>
    <div>
        <h3>Create a playlist or join one</h3>
        <input type='text' onkeyup='{ edit }' placeholder='playlist name'></input>
        <button onclick='{ createRoom }'>Create</button>
        <button onclick='{ joinRoom }'>Join</button>
    </div>
    <div if={ qrcode !='' } id='qrcode'>
        <img src='{ qrcode }'>
    </div>
    <div>
        <input type='checkbox' value="{ editable }" onchange="{ changeEdit }">Playlist editable</input>
        <input type='checkbox'>Delete item after playing</input>
    </div>

    <h3>Contributors</h3>
    <ol>
        <li each={ peers } class='contributor'>
            <img src="{ item.picture }" />
            <span>{ item.name }</span>
            <span if={ item.isOwner }>&nbsp;&nbsp; -- IS OWNER !</span>
        </li>
    </ol>

    <h3>Played</h3>
    <ol>
        <li each={ playlist }>
            <mm-item content="{ item }"></mm-item>
        </li>
    </ol>
    <script>
    'use strict'
    this.editable = true
    global.editable = true
    this.playlist = []
    this.peers = []

    this.qrcode = ''

    edit(e) {
        this.room = e.target.value
    }

    joinRoom(e) {
        location.search = this.room
        this.qrcode = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + location
        this.update()
    }

    createRoom(e) {
        opts.eventBus.trigger('createRoom', this.room)
        this.qrcode = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + location + '?' + this.room
        this.update()

    }

    reset(e) {
        location.search = ''
    }

    changeEdit(e) {
        global.editable = e.target.value
    }

    opts.eventBus.on('updateListenned', (playlist) => {
        this.playlist = playlist
        this.update()
    })

    opts.eventBus.on('updateQrcode', () => {
        this.qrcode = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + location
        this.update()
    })

    opts.eventBus.on('updatePeers', (peers) => {
        this.peers = []
        for (var i = 0; i < peers.length; i++) {
            this.peers.push({
                item: peers[i].meetMusicInfo
            })
        }
        console.log('peeers: ', this.peers)
        this.update()
    })
    </script>
</mm-parameters>
