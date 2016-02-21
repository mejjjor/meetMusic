<mm-player>
    <ul>
        <li each={ playlist }>
            <mm-item content="{ item }"></mm-item>
        </li>
    </ul>
    <script>
    'use strict'

    this.opts.eventBus.on('addErik', function(data) {
        console.log('add it in player.tag' + data)
        //this.update()
    })
    </script>
</mm-player>
