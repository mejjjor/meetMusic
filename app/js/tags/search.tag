<mm-search ondragover='{ dragover }' ondrop='{ drop }'>
    <div id="search" type="text" onpaste="{ edit }" onkeyup="{ edit }">
        <mm-addFile></mm-addFile>
    </div>
    <ul>
        <li each={ results }>
            <mm-result content="{ item }"></mm-result>
        </li>
    </ul>
    <script>
    'use strict'
    var Completely = require('../vendors/complete.ly.js')
    var $ = require('jquery')
    var _ = require('lodash')
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
            suggest.hint.style.visibility = 'hidden';
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
            opts.eventBus.trigger('youtubeSearch', this.query, 6, (results) => {
                this.results = results
                this.update()
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
                    suggest.hint.style.visibility = 'hidden';
                    suggest.repaint()
                }
            });
        }
        return true
    }

    dragover(e) {
        e.preventDefault();
        e.stopPropagation();

    }
    drop(e) {
        e.preventDefault();
        e.stopPropagation();
        opts.eventBus.trigger('addFiles', _.values(e.dataTransfer.files))
    }

    opts.eventBus.on('addVideoFunctions', (data, callback) => {
        addFunctions(data,data.video.id)
        callback(data)
    })

    opts.eventBus.on('youtubeSearch', function(query, nb, callback) {
        var request = gapi.client.youtube.search.list({
            part: "snippet",
            type: "video",
            q: encodeURIComponent(query).replace(/%20/g, "+"),
            maxResults: nb
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
                callback(results)
            })
        })
    })

    function addFunctions(data,videoId) {
        data.play = function(id) {
            opts.eventBus.trigger('playVideo', videoId)
        }
        data.pause = function() {
            opts.eventBus.trigger('pauseVideo')
        }
        data.seekTime = function(value) {
            opts.eventBus.trigger('setSeekTimeVideo', value)
        }
    }
    </script>
</mm-search>
