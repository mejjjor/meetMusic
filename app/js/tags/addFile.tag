<mm-addFile>
    <label for='inputFile'><i class="fa fa-plus-circle fa-2x"></i></label>
    <input id='inputFile' type='file' multiple onchange="{ addFile }"></input>
    <script>
    'use strict'
    var jsmediatags = require("jsmediatags");
    this.on('mount', function() {
        opts.eventBus = this.parent.opts.eventBus;

        opts.eventBus.on('addFiles', (files) => {
            for (let file of files) {
                ((file) => {
                    jsmediatags.read(file, {
                        onSuccess: (tag) => {
                            var url = URL.createObjectURL(file)
                            opts.eventBus.trigger('youtubeSearch', tag.tags.artist + " " + tag.tags.title, 1, (results) => {
                                var thumbnail
                                if (results[0] == undefined)
                                	thumbnail = '/favicon.png'
                                else
                                    thumbnail = results[0].item.snippet.thumbnails.default.url
                                this.data = {
                                    track: {
                                        artist: tag.tags.artist,
                                        title: tag.tags.title,
                                        duration: "00:00",
                                        thumbnail: thumbnail,
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

                                this.update()
                            })

                        },
                        onError: function(error) {
                            console.error(error.info);
                        }
                    });
                })(file);
            }
        })
    })

    addFile(e) {
        opts.eventBus.trigger('addFiles', _.values(e.srcElement.files))
    }
    </script>
</mm-addFile>
