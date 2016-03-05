riot.tag2('mm-addfile', '<label for="inputFile"><i class="fa fa-plus-circle fa-2x"></i></label> <input id="inputFile" type="file" multiple onchange="{addFile}"></input>', '', '', function(opts) {
    'use strict'
    var id3 = require('id3js')
    var _ = require('lodash')

    this.on('mount', function() {
        opts.eventBus = this.parent.opts.eventBus;

        opts.eventBus.on('addMp3Functions',(data,url)=>{
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
                                thumbnail = 'music.png'
                            else
                                thumbnail = results[0].item.snippet.thumbnails.default.url
                            this.data = {
                                track: {
                                    artist: tags.artist,
                                    title: tags.title,
                                    duration: 0,
                                    thumbnail: thumbnail,
                                    progress: 0
                                },
                                contributor: {
                                    name: global.contributorName,
                                    thumbnail: global.contributorPictureUrl
                                },
                                file: {
                                    url: url,
                                    name: file.name
                                },
                                status: {}
                            }
                            addFunctions(this.data,url)
                            opts.eventBus.trigger('addMp3', this.data, file)

                            this.update()
                        })

                    });
                })(file);
            }
        })
    })

    this.addFile = function(e) {
        opts.eventBus.trigger('addFiles', _.values(e.target.files))
    }.bind(this)

    function addFunctions(data,url) {
        data.play = function(id) {
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

}, '{ }');

riot.tag2('mm-item', '<div> <i class="fa fa-ellipsis-v handle"></i> <img riot-src="{opts.content.track.thumbnail}" class="handle"> <i class="fa fa-play-circle fa-3x {opts.content.status.play}" onclick="{play}"></i> <i class="fa fa-pause-circle fa-3x {opts.content.status.pause}" onclick="{pause}"></i> <div> <span>{opts.content.track.artist}</span> <span> {opts.content.track.title}</span> </div> <div> <img riot-src="{opts.content.contributor.thumbnail}" class="img-circle"> <span>{opts.content.contributor.name}</span> </div> <div> <a if="{opts.content.file != undefined}" href="{opts.content.file.url}" download="{opts.content.file.name}"><i class="fa fa-arrow-circle-o-down fa-2x"></i></a> <i class="fa fa-times-circle-o fa-2x" onclick="{delete}"></i> </div> </div> <div class="{opts.content.status.pause}"> <input type="range" value="{opts.content.track.progress}" max="{opts.content.track.duration}" onclick="{seekTime}"> <span>{opts.content.track.progress} / {opts.content.track.duration}</span> </progress> </div> <div class="nanobar"></div>', '', '', function(opts) {
    'use strict'
    var Nanobar = require('nanobar')

    this.on('mount', function() {
        opts.eventBus = this.parent.opts.eventBus;
        this.nanobar = new Nanobar({
            bg: '#607d8b',
            target: this.root.lastChild
        });
    })

    this.opts.content.updateTransfert = (value) => {
        this.nanobar.go(value)
    }

    this.play = function(e) {
        opts.content.play(opts.content.id)
        if (global.isOwner) {
            opts.eventBus.trigger('stopOthers', opts.content.id)
            opts.eventBus.trigger('playId', opts.content.id)
            opts.eventBus.trigger('updateItems', this.playlist)
        }
    }.bind(this)

    this.pause = function(e) {
        if (global.isOwner) {
            opts.content.status.play = 'show'
            opts.content.status.pause = 'hide'
            opts.eventBus.trigger('updateItems')
        }
        opts.content.pause()
    }.bind(this)

    this.seekTime = function(e) {
        opts.content.seekTime(e.srcElement.value);
    }.bind(this)

    this.delete = function(e) {
        opts.eventBus.trigger('deleteItem', opts.content.id)
    }.bind(this)
}, '{ }');

riot.tag2('mm-parameters', '<div> <h3>Create a playlist or join one</h3> <input type="text" onkeyup="{edit}" placeholder="playlist name"></input> <button onclick="{createRoom}">Create</button> <button onclick="{joinRoom}">Join</button> </div> <div if="{qrcode !=\'\'}" id="qrcode"> <img riot-src="{qrcode}"> </div> <div> <input type="checkbox" value="{editable}" onchange="{changeEdit}">Playlist editable</input> <input type="checkbox">Delete item after playing</input> </div> <h3>Contributors</h3> <ol> <li each="{peers}" class="contributor"> <img riot-src="{item.picture}"> <span>{item.name}</span> <span if="{item.isOwner}">&nbsp;&nbsp; -- IS OWNER !</span> </li> </ol> <h3>Played</h3> <ol> <li each="{playlist}"> <mm-item content="{item}"></mm-item> </li> </ol>', '', '', function(opts) {
    'use strict'
    this.editable = true
    global.editable = true
    this.playlist = []
    this.peers = []

    this.qrcode = ''

    this.edit = function(e) {
        this.room = e.target.value
    }.bind(this)

    this.joinRoom = function(e) {
        location.search = this.room
        this.qrcode = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + location
        this.update()
    }.bind(this)

    this.createRoom = function(e) {
        opts.eventBus.trigger('createRoom', this.room)
        this.qrcode = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + location + '?' + this.room
        this.update()

    }.bind(this)

    this.reset = function(e) {
        location.search = ''
    }.bind(this)

    this.changeEdit = function(e) {
        global.editable = e.target.value
    }.bind(this)

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
}, '{ }');

riot.tag2('mm-player', '<audio id="mp3Player" ontimeupdate="{timeUpdate}" onplaying="{playAudio}"></audio> <ol id="playlist"> <li each="{playlist}"> <mm-item content="{item}"></mm-item> </li> </ol>', '', 'ondragover="{dragover}" ondrop="{drop}"', function(opts) {
    'use strict'

    var Sortable = require("sortablejs")
    var _ = require('lodash')
    this.playlist = []
    this.playlistListenned = []
    this.currentId = 0
    var mp3Player

    this.on('mount', () => {
        mp3Player = document.getElementById('mp3Player')
        mp3Player.onended = () => {
            opts.eventBus.trigger('playNext')
        }

        var sortable = Sortable.create(document.getElementById('playlist'), {
            handle: '.handle',
            animation: 150,
            onEnd: (evt) => {
                let el = this.playlist[evt.oldIndex]
                this.playlist.splice(evt.newIndex, 0, this.playlist.splice(evt.oldIndex, 1)[0])
                opts.eventBus.trigger('updatePlaylist', this.playlist)
            }
        });
    })

    this.timeUpdate = function(e) {
        opts.eventBus.trigger('getSeekTime', mp3Player.currentTime)
    }.bind(this)

    this.playAudio = function(e) {
        getCurrentItem().track.duration = Math.round(mp3Player.duration)
    }.bind(this)

    this.dragover = function(e) {
        e.preventDefault();
        e.stopPropagation();
    }.bind(this)

    this.drop = function(e) {
        e.preventDefault();
        e.stopPropagation();
        opts.eventBus.trigger('addFiles', _.values(e.dataTransfer.files))
    }.bind(this)

    opts.eventBus.on('addItem', (data) => {
        data.id = getId.next()
        data.status.play = 'show'
        data.status.pause = 'hide'
        this.playlist.push({
            item: data
        })

        opts.eventBus.trigger('updatePlaylist', this.playlist)
        this.update()
    })

    opts.eventBus.on('addFileToItem', (file, data) => {
        console.log(data)
        for (var i = 0; i < this.playlist.length; i++) {
            if (this.playlist[i].item.file.name == data.name)
                opts.eventBus.trigger('addMp3Functions', this.playlist[i].item, URL.createObjectURL(file))
            console.log(this.playlist[i])
        }
    })

    opts.eventBus.on('stopOthers', (id) => {
        for (var i = 0; i < this.playlist.length; i++) {
            if (this.playlist[i].item.id != id) {
                if (this.playlist[i].item.status.play === 'hide') {
                    this.playlist[i].item.pause()
                    this.playlist[i].item.status.play = 'show'
                    this.playlist[i].item.status.pause = 'hide'
                }
            } else {
                this.playlist[i].item.status.play = 'hide'
                this.playlist[i].item.status.pause = 'show'
            }
        }
    })

    opts.eventBus.on('playNext', () => {
        var found = false
        for (var i = 0; i < this.playlist.length - 1; i++) {
            if (this.playlist[i].item.id === this.currentId) {
                opts.eventBus.trigger('playId', this.playlist[i + 1].item.id)
                found = true
                break
            }
        }

        if (!found) {
            this.playlist[i].item.status.play = 'show'
            this.playlist[i].item.status.pause = 'hide'
            this.playlist[i].item.pause()
            transitionItem(this.root.querySelector('ol').childNodes[i + 1], 'translateUp')
            opts.eventBus.trigger('updatePlaylist', this.playlist)
            this.update()
        }
    })

    opts.eventBus.on('setCurrent', (id) => {
        for (var i = 0; i < this.playlist.length; i++) {
            if (this.playlist[i].item.id == id)
                break
            transitionItem(this.root.querySelector('ol').childNodes[i + 1], 'translateUp')
        }
        this.currentId = id
        this.update()
    })

    opts.eventBus.on('deleteItem', (id) => {
        for (var i = 0; i < this.playlist.length; i++)
            if (this.playlist[i].item.id == id) {
                if (this.playlist[i].item.status.play == 'hide')
                    opts.eventBus.trigger('pauseCurrent')
                transitionItem(this.root.querySelector('ol').childNodes[i + 1], 'translateUp', i)

                break
            }
        this.update()
    })

    var transitionItem = (elem, cssClass, i) => {
        if (i == undefined)
            i = 0
        elem.addEventListener("transitionend", (e) => {
            if (e.propertyName == 'opacity') {
                this.playlistListenned.push(this.playlist.splice(i, 1)[0])
                opts.eventBus.trigger('updatePlaylist', this.playlist)
                opts.eventBus.trigger('updateListenned', this.playlistListenned)
            }
        }, false);
        elem.className += cssClass
    }

    opts.eventBus.on('getSeekTime', (value) => {
        for (var i = 0; i < this.playlist.length; i++)
            if (this.playlist[i].item.id == this.currentId) {
                var progress = this.playlist[i].item.track.progress
                if (Math.round(value) % 25 == 0 && progress != Math.round(value) || (progress == 0 && value > 0))
                    opts.eventBus.trigger('updatePlaylist', this.playlist)
                this.playlist[i].item.track.progress = Math.round(value)

                break
            }
        this.update()
    })

    opts.eventBus.on('playMp3', (url) => {
        if (mp3Player.currentSrc === url && !mp3Player.ended) {
            mp3Player.play();
        } else {
            mp3Player.src = url
            mp3Player.play()
        }
    })

    opts.eventBus.on('pauseMp3', () => {
        mp3Player.pause()
    })

    opts.eventBus.on('seekMp3', (value) => {
        mp3Player.currentTime = value
    })

    opts.eventBus.on('setPlaylist', (playlist) => {

        if (global.isOwner) {
            var newPlaylist = []
            for (var item of playlist)
                for (var item2 of this.playlist)
                    if (item2.item.id == item.item.id) {
                        newPlaylist.push(item2)
                    }
            this.playlist = newPlaylist
            opts.eventBus.trigger('updatePlaylist', this.playlist)
        } else {
            this.playlist = playlist
            opts.eventBus.trigger('addRemoteFunctions', this.playlist)
        }
        this.update()
    })

    opts.eventBus.on('playId', (id) => {
        for (var item of this.playlist)
            if (item.item.id === id && item.item.play != undefined) {
                opts.eventBus.trigger('stopOthers', id)
                opts.eventBus.trigger('setCurrent', id)
                item.item.play(id)
                opts.eventBus.trigger('updatePlaylist', this.playlist)
                break
            }
    })

    opts.eventBus.on('pauseCurrent', () => {
        var item = getCurrentItem()
        if (item.pause != undefined) {
            item.pause()
            item.status.play = 'show'
            item.status.pause = 'hide'
            opts.eventBus.trigger('updatePlaylist', this.playlist)
        }
    })

    opts.eventBus.on('updateItems', () => {
        opts.eventBus.trigger('updatePlaylist', this.playlist)
    })

    opts.eventBus.on('seekCurrent', (value) => {
        var item = getCurrentItem()
        if (item.seekTime != undefined) {
            item.seekTime(value)
        }
    })

    opts.eventBus.on('updateTransfert', function(name, ratio) {
        var item = getItemByName(name)
        if (item != undefined)
            item.updateTransfert(ratio)
    })

    var getId = (function() {
        var counter = 0
        return {
            next: function() {
                return counter++
            },
            set: function(val) {
                counter = val
            }
        }
    }())

    var getItemByName = (name) => {
        for (var i = 0; i < this.playlist.length; i++)
            if (this.playlist[i].item.file != undefined && this.playlist[i].item.file.name == name)
                return this.playlist[i].item
    }

    var getCurrentItem = () => {
        for (var i = 0; i < this.playlist.length; i++)
            if (this.playlist[i].item.id === this.currentId)
                return this.playlist[i].item
        return {}
    }
}, '{ }');

riot.tag2('mm-result', '<i class="fa fa-plus-circle fa-3x" onclick="{add}"></i> <img riot-src="{data.track.thumbnail}"> <span>{data.track.duration}</span> <span>{data.track.title}</span>', '', '', function(opts) {
    'use strict'
    var moment = require('moment')
    this.on('mount', function() {
        opts.eventBus = this.parent.opts.eventBus;
        this.data = {
            track: {
                title: opts.content.snippet.title,
                duration: moment.duration(opts.content.contentDetails.duration).asSeconds(),
                thumbnail: opts.content.snippet.thumbnails.default.url,
                progress: 0
            },
            video: {
                id: opts.content.id.videoId
            },
            contributor: {
                name: global.contributorName,
                thumbnail: global.contributorPictureUrl
            },
            status: {}
        }
        opts.eventBus.trigger('addVideoFunctions', this.data, (data) => {
            this.data = data
        })
    })

    this.add = function(e) {
        opts.eventBus.trigger('removeResult', this.data.track.title)
        opts.eventBus.trigger('addVideo', this.data)
    }.bind(this)
}, '{ }');

riot.tag2('mm-search', '<div id="search" type="text" onpaste="{edit}" onkeyup="{edit}"> <mm-addfile></mm-addFile> </div> <ul> <li each="{results}"> <mm-result content="{item}"></mm-result> </li> </ul>', '', 'ondragover="{dragover}" ondrop="{drop}"', function(opts) {
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
            color: '#3f51b5',
        });
        suggest.input.setAttribute('placeholder', 'video search  ///  add file ->')
        suggest.onChange = (text) => {
            suggest.startFrom = text.length;
            queryYoutube(text,false)
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

    this.edit = function(e) {
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
            queryYoutube(this.query,true)
        }
        return true
    }.bind(this)

    this.dragover = function(e) {
        e.preventDefault();
        e.stopPropagation();

    }.bind(this)
    this.drop = function(e) {
        e.preventDefault();
        e.stopPropagation();
        opts.eventBus.trigger('addFiles', _.values(e.dataTransfer.files))
    }.bind(this)

    opts.eventBus.on('addVideoFunctions', (data, callback) => {
        addFunctions(data, data.video.id)
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

    function addFunctions(data, videoId) {
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

    var queryYoutube = (query,showDropDown) => {
        opts.eventBus.trigger('youtubeSearch', query, 6, (results) => {
            this.results = results
            this.update()
        })

        $.ajax({
            url: "http://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&hjson=t&cp=1&q=" + query + "&key=" + apiKey + "&format=5&alt=json&callback=?",
            dataType: 'jsonp',
            success: function(data, textStatus, request) {
                var l = data[0].length
                suggest.options = _.map(data[1], function(o) {
                    return o[0].substring(l)
                })
                if(showDropDown)
                suggest.dropDown.style.visibility = 'visible'
                else
                suggest.dropDown.style.visibility = 'hidden'

                suggest.repaint()
            }
        })
    }

    function addItems(){
        opts.eventBus.trigger('addItem', {"track":{"title":"Adele - Hello","duration":367,"thumbnail":"https://i.ytimg.com/vi/YQHsXMglC9A/default.jpg","progress":0},"video":{"id":"YQHsXMglC9A"},"contributor":{"name":"erik","thumbnail":"/favicon.png"},"status":{},"type":"video"})

    }
}, '{ }');

riot.tag2('mm-social', '<div> <div> <span>Name :</span> <span>Picture :</span> </div> <div> <div> <input type="text" value="{name}" onkeyup="{editName}" onpaste="{editName}" maxlength="7"></input><i class="fa fa-refresh" onclick="{newName}"></i> </div> <input type="text" onkeyup="{editPicture}" onpaste="{editPicture}" placeholder="url ..."></input> </div> <div> <img riot-src="{pictureUrl}"> </div> </div>', '', '', function(opts) {
    'use strict'

    var themes = ['sugarsweets', 'heatwave', 'daisygarden', 'seascape', 'summerwarmth', 'bythepool', 'duskfalling', 'frogideas', 'berrypie']

    this.refresh = () => {
        var req = new XMLHttpRequest();
        req.open('GET', 'http://uinames.com/api/?region=france', true);
        req.onreadystatechange = (aEvt) => {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    this.name = JSON.parse(req.responseText).name
                    this.name = this.name.slice(0,7)
                    this.pictureUrl = getRandomPicture(this.name)
                    this.update()
                } else {
                    this.name = 'Mr black'
                    this.pictureUrl = getRandomPicture(this.name)
                    this.update()
                    console.error('uinames ERROR')
                }
                global.contributorName = this.name
                global.contributorPictureUrl = this.pictureUrl
                opts.eventBus.trigger('sendInitToAll')
            }
        }
        req.send(null)
    }

    this.on('mount', () => {
        this.refresh()
    })

    function getRandomPicture(name) {
        var theme = themes[Math.round(Math.random() * themes.length)]
        return 'http://tinygraphs.com/labs/isogrids/hexa16/' + name + '?theme=' + theme + '&numcolors=4&size=220&fmt=svg'
    }

    this.newName = function(e) {
        this.refresh()
    }.bind(this)

    this.editPicture = function(e) {
        this.pictureUrl = e.target.value
        global.contributorPictureUrl = e.target.value

        this.update()
        return true
    }.bind(this)

    this.editName = function(e) {
        global.contributorName = e.target.value
    }.bind(this)
}, '{ }');

riot.tag2('mm-title', '<div> <h1> <a href="/" class="{error}">MEET ~ MUSIC</a> </h1> </div>', '', '', function(opts) {
    'use strict'

    this.error = ''
    opts.eventBus.on('errorOccurs', () => {
        this.error = 'error'
        this.update()
    })
}, '{ }');

riot.tag2('mm-video', '<div id="video-container"> <div id="video"></div> </div>', '', '', function(opts) {
    'use strict'
    var videoPlayer
    var interval
    opts.eventBus.on('playVideo', (videoId) => {
        if (interval != undefined)
            window.clearInterval(interval)
        interval = setInterval(getSeek, 800)
        if (videoPlayer != undefined && typeof videoPlayer.getVideoUrl == 'function') {
            if (videoPlayer.getVideoUrl().split('v=')[1] == videoId) {
                videoPlayer.playVideo()
                return
            }
        }
        document.getElementById('video-container').innerHTML = '<div id="video"></div>'
        videoPlayer = new YT.Player('video', {
            playerVars: {
                'autoplay': 1
            },
            width: 600,
            height: 400,
            videoId: videoId,
            events: {
                onStateChange: onYTStateChange
            }
        })
    })

    opts.eventBus.on('pauseVideo', () => {
        if (videoPlayer && typeof videoPlayer.pauseVideo == 'function') {
            videoPlayer.pauseVideo()
        }
        if (interval != undefined)
            window.clearInterval(interval)
    })

    opts.eventBus.on('setSeekTimeVideo', (value) => {
        videoPlayer.seekTo(value)
    })

    function getSeek() {
        if (typeof videoPlayer.getCurrentTime === 'function')
            opts.eventBus.trigger('getSeekTime', videoPlayer.getCurrentTime())
    }
});

riot.tag2('mm-webrtc', '', '', '', function(opts) {
    'use strict'
    var SimpleWebRTC = require('../webrtc/simplewebrtc.js')
    this.room = location.search && location.search.split('?')[1]
    var isOwner = ''
    var ownerId = ''
    var ownerPeer
    var peers = []

    this.on('mount', () => {
        if (this.room) {

            webrtc.joinRoom(this.room, (err, res) => {
                console.log('joined', this.room, err, res)
                isOwner = false
                global.isOwner = false
                this.isOwner = 'false'
                opts.eventBus.trigger('updateQrcode')
                this.update()
            });
        }
    })
    var webrtc = new SimpleWebRTC({

        localVideoEl: '',
        remoteVideosEl: '',

        autoRequestMedia: false,

        receiveMedia: {
            mandatory: {
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: false
            }
        }
    });

    opts.eventBus.on('createRoom', (room) => {
        this.room = room

        var val = this.room.toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '')
        webrtc.createRoom(val, (err, name) => {
            console.log(' create room cb', arguments)
            var newUrl = location.pathname + '?' + name
            isOwner = true
            global.isOwner = true
            this.isOwner = 'true'
            ownerId = webrtc.connection.connection.id
            this.update()
            if (!err) {
                history.replaceState({
                    foo: 'bar'
                }, null, newUrl)
            } else {
                console.log(err)
            }
        });
    })

    opts.eventBus.on('addMp3', (data, file) => {
        data.type = 'mp3'
        if (isOwner)
            opts.eventBus.trigger('addItem', data)
        else {
            data.file.url = ''
            ownerPeer.sendData(data)
            var sender = ownerPeer.sendFile(file)
            sender.on('progress', (bytesSended) => {
                opts.eventBus.trigger('updateTransfert', file.name, bytesSended / file.size * 100)
            })
        }
    })

    opts.eventBus.on('addVideo', (data) => {
        data.type = 'video'
        if (isOwner) {
            opts.eventBus.trigger('addItem', data)
        } else
            ownerPeer.sendData(data)
    })

    opts.eventBus.on('updatePlaylist', (playlist) => {
        if (isOwner)
            for (var peer of peers)
                peer.sendData({
                    playlist: playlist,
                    type: 'update'
                })
        else
            ownerPeer.sendData({
                playlist: playlist,
                type: 'update'
            })
    })

    opts.eventBus.on('addRemoteFunctions', (playlist) => {
        for (var item of playlist) {
            item.item.play = function(id) {
                ownerPeer.sendData({
                    id: id,
                    type: 'play'
                })
            }
            item.item.pause = function() {
                ownerPeer.sendData({
                    type: 'pause'
                })
            }
            item.item.seekTime = function(value) {
                ownerPeer.sendData({
                    type: 'seek',
                    value: value
                })
            }
        }
    })

    opts.eventBus.on('sendInitToAll', () => {
        for (var i = 0; i < peers.length; i++)
            peers[i].sendData({
                type: 'init',
                ownerId: ownerId,
                me: {
                    name: global.contributorName,
                    picture: global.contributorPictureUrl,
                    isOwner: isOwner
                }
            })
    })

    webrtc.on('createdPeer', (peer) => {
        console.log('me: ', webrtc.connection.connection.id)
        console.log('createdPeer: ', peer.id)
        peer.sendData({
            type: 'init',
            ownerId: ownerId,
            me: {
                name: global.contributorName,
                picture: global.contributorPictureUrl,
                isOwner: isOwner
            }
        })
        if (peer && peer.pc) {
            peer.pc.on('iceConnectionStateChange', function(event) {
                console.log('state', peer.pc.iceConnectionState)
                if (peer.pc.iceConnectionState == 'closed') {
                    _.remove(peers, (p) => {
                        return p == peer
                    })
                    opts.eventBus.trigger('updatePeers', peers)
                }
            })
        }
        peer.on('fileTransfer', (metadata, receiver) => {
            console.log('incoming filetransfer', metadata)
            receiver.on('progress', (bytesReceived) => {
                opts.eventBus.trigger('updateTransfert', metadata.name, bytesReceived / metadata.size * 100)
            })
            receiver.on('receivedFile', (file, metadata) => {
                console.log('received file', metadata.name, metadata.size)

                opts.eventBus.trigger('addFileToItem', file, metadata)
                receiver.channel.close()
            })
        })
        peer.on('dataTransfer', (metadata) => {
            console.log('incoming datatransfer', metadata)
            console.log('from', peer)
            switch (metadata.type) {
                case 'init':

                    peer.meetMusicInfo = metadata.me
                    _.remove(peers, (p) => {
                        return p.id == peer.id
                    })
                    peers.push(peer)
                    opts.eventBus.trigger('updatePeers', peers)
                    if (metadata.ownerId == '')
                        opts.eventBus.trigger('updateItems')
                    if (ownerId == '')
                        ownerId = metadata.ownerId

                    if (metadata.ownerId != '' && ownerId != metadata.ownerId) {
                        console.error('OWNER CONFLICT !! you: ' + webrtc.connection.connection.id + ' with owner: ' + ownerId + ' are in conflict with owner: ' + metadata.ownerId + ' from peer: ' + peer.id)
                    } else if (peer.id == ownerId)
                        ownerPeer = peer
                    console.log('ownerPeer ', ownerPeer)
                    break
                case 'mp3':
                    opts.eventBus.trigger('addItem', metadata)
                    break
                case 'video':
                    opts.eventBus.trigger('addVideoFunctions', metadata, (data) => {
                        opts.eventBus.trigger('addItem', data)
                    })
                    break
                case 'update':
                    opts.eventBus.trigger('setPlaylist', metadata.playlist)
                    break
                case 'play':
                    opts.eventBus.trigger('playId', metadata.id)
                    break
                case 'pause':
                    opts.eventBus.trigger('pauseCurrent')
                    break
                case 'seek':
                    opts.eventBus.trigger('seekCurrent', metadata.value)
                    break
            }
        })
    })

    webrtc.on('iceFailed', function(peer) {
        console.log('local fail with peer: ' + peer)
    })

    webrtc.on('connectivityError', function(peer) {
        console.log('remote fail with peer: ' + peer)
    })
});
