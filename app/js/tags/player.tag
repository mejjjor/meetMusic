<mm-player>
    <ul>
        <li each={ playlist }>
            <mm-item content="{ item }"></mm-item>
        </li>
    </ul>
    <script>
    'use strict'
    this.playlist = [];

    opts.eventBus.on('addItem', (data) => {
        this.playlist.push({
            item: data
        })
        this.update()
    })
    </script>
</mm-player>
