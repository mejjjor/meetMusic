<mm-parameters>
    <div>
        <h3>Create a playlist or join one</h3>
        <input type='text' onkeyup='{ edit }' placeholder='playlist name'></input>
        <button onclick='{ createRoom }'>Create</button>
        <button onclick='{ joinRoom }'>Join</button>
    </div>
    <div id='qrcode'>
        <img src='{ qrcode }'>
    </div>
    <div>
        <input type='checkbox' value="{ editable }" onchange="{ changeEdit }">Playlist editable</input>
        <input type='checkbox'>Delete item after playing</input>
    </div>
    <script>
    'use strict'
    this.editable = true
    global.editable = true

    this.qrcode = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + location

    edit(e) {
        this.room = e.target.value
    }

    joinRoom(e) {
        location.search = this.room
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
    </script>
</mm-parameters>
