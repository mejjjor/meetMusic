<mm-addFile>
    <label for='inputFile'><i class="fa fa-plus-circle fa-2x"></i></label>
    <input id='inputFile' type='file' multiple onchange="{ addFile }"></input>
    <script>
    'use strict'
    var jsmediatags = require("jsmediatags");
    this.on('mount', function() {
        opts.eventBus = this.parent.opts.eventBus;
    })

    addFile(e) {
        for (let file of _.values(e.srcElement.files)) {
            ((file) => {
                jsmediatags.read(file, {
                    onSuccess: (tag) => {
                        var url = URL.createObjectURL(file)
                        this.data = {
                            track: {
                                artist: tag.tags.artist,
                                title: tag.tags.title,
                                duration: "00:00",
                                thumbnail: "/favicon.png",
                                progress: 0
                            },
                            contributor: {
                                name: "erik",
                                thumbnail: "/favicon.png"
                            },
                            file: {
                                url: url
                            },
                            status: {},
                            play: function() {
                                opts.eventBus.trigger('playMp3', url)
                            },
                            pause: function() {
                                opts.eventBus.trigger('pauseMp3')
                            },
                            seekTime: function(value) {
                                opts.eventBus.trigger('seekMp3', value)
                            }
                        }
                        opts.eventBus.trigger('addItem', this.data)
                    },
                    onError: function(error) {
                        console.error(error.info);
                    }
                });
            })(file);
        }
    }
    </script>
</mm-addFile>
