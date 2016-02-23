<mm-search>
    <div id="search" type="text" onpaste="{ edit }" onkeyup="{ edit }">
        <label for='inputFile'><i class="fa fa-plus-circle fa-2x"></i></label>
        <input id='inputFile' type='file' multiple onchange="{ addFile }"></input>
    </div>
    <ul>
        <li each={ results }>
            <mm-result content="{ item }"></mm-result>
        </li>
    </ul>
    <script>
    'use strict'
    var Completely = require('../vendors/complete.ly.1.0.1.min.js')
    var $ = require('jquery')
    var _ = require('lodash')
    var jsmediatags = require("jsmediatags");
    var apiKey = 'AIzaSyDrc_XoIlz_HqMflR0CHHOyatGemqwgAvo'
    var suggest

    this.on('mount', () => {
        suggest = Completely.completely(this.search, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#933',
        });
        suggest.onChange = (text) => {
            suggest.startFrom = text.length;
        }
        suggest.input.addEventListener('focus', function(e) {
            suggest.dropDown.style.visibility = 'visible';
            suggest.hint.style.visibility = 'visible';
        })

        suggest.input.addEventListener('blur', function(e) {
            suggest.dropDown.style.visibility = 'hidden';
            suggest.hint.style.visibility = 'hidden';
        })
    })

    opts.eventBus.on('removeResult', (name) => {
        for (var i = 0; i < this.results.length; i++)
            if (this.results[i].item.snippet.title === name) {
                this.results.splice(i, 1)
                this.update()
                break
            }
    })

    addFile(e) {
        console.log(e)
        this.getFiles(_.values(e.srcElement.files));
    }

    edit(e) {
        this.query = e.target.value
        if (e.keyCode >= 37 && e.keyCode <= 40)
            return;
        if (e.keyCode == 13) {
            suggest.dropDown.style.visibility = 'hidden'
            suggest.hint.style.visibility = 'hidden'
            return;
        }
        if (this.query === "") {
            suggest.dropDown.style.visibility = 'hidden'
        } else {
            var request = gapi.client.youtube.search.list({
                part: "snippet",
                type: "video",
                q: encodeURIComponent(this.query).replace(/%20/g, "+"),
                maxResults: 6
            })
            request.execute((response) => {
                var ids = ""
                var results = _.map(response.result.items, function(o) {
                    ids += o.id.videoId + ","
                    return {
                        item: o
                    }
                })
                ids = ids.slice(0, ids.length - 1)
                var requestDetails = gapi.client.youtube.videos.list({
                    part: "ContentDetails",
                    id: ids
                })
                requestDetails.execute((response) => {
                    for (var i = 0; i < response.result.items.length; i++) {
                        results[i].item.contentDetails = response.result.items[i].contentDetails
                    }
                    this.results = results
                    this.update()
                })
            })

            $.ajax({
                url: "http://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&hjson=t&cp=1&q=" + this.query + "&key=" + apiKey + "&format=5&alt=json&callback=?",
                dataType: 'jsonp',
                success: function(data, textStatus, request) {
                    var l = data[0].length
                    suggest.options = _.map(data[1], function(o) {
                        return o[0].substring(l)
                    })
                    suggest.dropDown.style.visibility = 'visible'
                    suggest.hint.style.visibility = 'visible'
                    suggest.repaint()
                }
            });
        }
        return true
    }

    this.getFiles = function(files) {
        for (let file of files) {
            ((file) => {
                jsmediatags.read(file, {
                    onSuccess: (tag) => {
                        var url = URL.createObjectURL(file)
                        this.data = {
                            track: {
                                artist:tag.tags.artist,
                                title: tag.tags.title,
                                duration: "00:00",
                                thumbnail: "/favicon.png",
                                progress: 0
                            },
                            contributor: {
                                name: "erik",
                                thumbnail: "/favicon.png"
                            },
                            file:{
                                url:url
                            },
                            status: {},
                            play: function() {

                                opts.eventBus.trigger('playMp3', url)
                            },
                            pause: function() {
                                opts.eventBus.trigger('pauseMp3')
                            },
                            seekTime: function(value) {
                                
                                console.log('seekTime it !')
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
</mm-search>
