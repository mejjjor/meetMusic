<mm-addFile>
    <label for='inputFile'><i class="fa fa-plus-circle fa-2x"></i></label>
    <input id='inputFile' type='file' multiple onchange="{ addFile }"></input>
    <script>
    'use strict'
    var id3 = require('id3js')

    this.on('mount', function() {
        opts.eventBus = this.parent.opts.eventBus;

        opts.eventBus.on('addFunctions',(data,url)=>{
            data.file.url = url
            addFunctions(data,url)
        })

        opts.eventBus.on('addFiles', (files) => {
            for (let file of files) {
                ((file) => {
                    id3(file, (err, tags) => {
                        if (tags.artist == null)
                            tags.artist = file.name.substring(0, file.name.length - 4)
                        if (tags.title == null)
                            tags.title = ""
                        var url = URL.createObjectURL(file)
                        opts.eventBus.trigger('youtubeSearch', tags.artist + " " + tags.title, 1, (results) => {
                            var thumbnail
                            if (results[0] == undefined)
                                thumbnail = '/favicon.png'
                            else
                                thumbnail = results[0].item.snippet.thumbnails.default.url
                            this.data = {
                                track: {
                                    artist: tags.artist,
                                    title: tags.title,
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
                                status: {}
                            }
                            addFunctions(this.data,url)
                            opts.eventBus.trigger('addItem', this.data)
                            console.log('addItem')
                            opts.eventBus.trigger('addMp3', this.data, file)

                            this.update()
                        })


                    });
                })(file);
            }
        })
    })


    addFile(e) {
        opts.eventBus.trigger('addFiles', _.values(e.srcElement.files))
    }

    function addFunctions(data,url) {
        data.play = function() {
            opts.eventBus.trigger('playMp3', url)
        }
        data.pause= function() {
            opts.eventBus.trigger('pauseMp3')
        }
        data.seekTime= function(value) {
            opts.eventBus.trigger('seekMp3', value)
        }

        return data
    }


    </script>
</mm-addFile>
