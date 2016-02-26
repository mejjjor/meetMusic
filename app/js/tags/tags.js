'use strict';

riot.tag2('mm-addfile', '<label for="inputFile"><i class="fa fa-plus-circle fa-2x"></i></label> <input id="inputFile" type="file" multiple onchange="{addFile}"></input>', '', '', function (opts) {
    'use strict';

    var id3 = require('id3js');
    var _ = require('lodash');

    this.on('mount', function () {
        var _this = this;

        opts.eventBus = this.parent.opts.eventBus;

        opts.eventBus.on('addMp3Functions', function (data, url) {
            data.file.url = url;
            addFunctions(data, url);
        });

        opts.eventBus.on('addFiles', function (files) {
            for (var _iterator = files, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                var file = _ref;

                (function (file) {
                    id3(file, function (err, tags) {
                        if (tags.artist == null) tags.artist = file.name.substring(0, file.name.length - 4);
                        if (tags.title == null) tags.title = "";
                        var url = URL.createObjectURL(file);
                        opts.eventBus.trigger('youtubeSearch', tags.artist + " " + tags.title, 1, function (results) {
                            var thumbnail;
                            if (results[0] == undefined) thumbnail = '/favicon.png';else thumbnail = results[0].item.snippet.thumbnails.default.url;
                            _this.data = {
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
                                    url: url,
                                    name: file.name
                                },
                                status: {}
                            };
                            addFunctions(_this.data, url);
                            opts.eventBus.trigger('addMp3', _this.data, file);

                            _this.update();
                        });
                    });
                })(file);
            }
        });
    });

    this.addFile = function (e) {
        opts.eventBus.trigger('addFiles', _.values(e.target.files));
    }.bind(this);

    function addFunctions(data, url) {
        data.play = function (id) {
            opts.eventBus.trigger('playMp3', url);
        };
        data.pause = function () {
            opts.eventBus.trigger('pauseMp3');
        };
        data.seekTime = function (value) {
            opts.eventBus.trigger('seekMp3', value);
        };

        return data;
    }
}, '{ }');

riot.tag2('mm-item', '<div draggable="true"> <i class="fa fa-play-circle fa-3x {opts.content.status.play}" onclick="{play}"></i> <i class="fa fa-pause-circle fa-3x {opts.content.status.pause}" onclick="{pause}"></i> <img riot-src="{opts.content.track.thumbnail}"> <div> <span>{opts.content.track.artist}</span><span> {opts.content.track.title}</span> <span>{opts.content.contributor.name}</span> </div> <img riot-src="{opts.content.contributor.thumbnail}" class="img-circle"> </div> <div class="{opts.content.status.pause}"> <i class="fa fa-forward fa-2x {opts.content.status.pause}" onclick="{next}"></i> <input type="range" value="{opts.content.track.progress}" max="{opts.content.track.duration}" onclick="{seekTime}"> <span>{opts.content.track.progress} / {opts.content.track.duration}</span> </progress> </div>', '', '', function (opts) {
    'use strict';

    this.on('mount', function () {
        opts.eventBus = this.parent.opts.eventBus;
    });

    this.play = function (e) {
        if (global.isOwner) {
            opts.eventBus.trigger('stopOthers', opts.content.id);
            opts.eventBus.trigger('setCurrent', opts.content.id);
        }
        opts.content.play(opts.content.id);
    }.bind(this);

    this.pause = function (e) {
        if (global.isOwner) {
            opts.content.status.play = 'show';
            opts.content.status.pause = 'hide';
        }
        opts.content.pause();
    }.bind(this);

    this.next = function (e) {
        if (global.isOwner) {
            opts.eventBus.trigger('playNext');
        } else {}
    }.bind(this);

    this.seekTime = function (e) {
        opts.content.seekTime(e.srcElement.value);
    }.bind(this);
}, '{ }');

riot.tag2('mm-player', '<audio id="mp3Player" ontimeupdate="{timeUpdate}" onplaying="{playAudio}"></audio> <ol id="playlist"> <li each="{playlist}"> <mm-item content="{item}"></mm-item> </li> </ol>', '', 'ondragover="{dragover}" ondrop="{drop}"', function (opts) {
    'use strict';

    var _this2 = this;

    var Sortable = require("sortablejs");
    var _ = require('lodash');
    this.playlist = [];
    this.currentId = 0;
    var mp3Player;

    this.on('mount', function () {
        mp3Player = document.getElementById('mp3Player');
        mp3Player.onended = function () {
            opts.eventBus.trigger('playNext');
        };

        var sortable = Sortable.create(document.getElementById('playlist'), {
            animation: 150,
            onEnd: function onEnd(evt) {
                var el = _this2.playlist[evt.oldIndex];
                _this2.playlist.splice(evt.newIndex, 0, _this2.playlist.splice(evt.oldIndex, 1)[0]);
                opts.eventBus.trigger('updatePlaylist', _this2.playlist);
            }
        });
    });

    this.timeUpdate = function (e) {
        opts.eventBus.trigger('getSeekTime', mp3Player.currentTime);
    }.bind(this);

    this.playAudio = function (e) {
        getCurrentItem().track.duration = Math.round(mp3Player.duration);
    }.bind(this);

    this.dragover = function (e) {
        e.preventDefault();
        e.stopPropagation();
    }.bind(this);
    this.drop = function (e) {
        e.preventDefault();
        e.stopPropagation();
        opts.eventBus.trigger('addFiles', _.values(e.dataTransfer.files));
    }.bind(this);

    opts.eventBus.on('addItem', function (data) {
        data.id = getId.next();
        data.status.play = 'show';
        data.status.pause = 'hide';
        _this2.playlist.push({
            item: data
        });

        opts.eventBus.trigger('updatePlaylist', _this2.playlist);
        _this2.update();
    });

    opts.eventBus.on('addFileToItem', function (file, data) {
        console.log(data);
        for (var i = 0; i < _this2.playlist.length; i++) {
            if (_this2.playlist[i].item.file.name == data.name) opts.eventBus.trigger('addMp3Functions', _this2.playlist[i].item, URL.createObjectURL(file));
            console.log(_this2.playlist[i]);
        }
    });

    opts.eventBus.on('addPlayItem', function (data) {
        data.id = getId.next();
        opts.eventBus.trigger('stopOthers', data.id);
        _this2.playlist.push({
            item: data
        });
        _this2.currentId = data.id;
        data.status.play = 'hide';
        data.status.pause = 'show';
        data.play();
        _this2.update();
    });

    opts.eventBus.on('stopOthers', function (id) {
        for (var i = 0; i < _this2.playlist.length; i++) {
            if (_this2.playlist[i].item.id != id) {
                if (_this2.playlist[i].item.status.play === 'hide') {
                    _this2.playlist[i].item.pause();
                    _this2.playlist[i].item.status.play = 'show';
                    _this2.playlist[i].item.status.pause = 'hide';
                }
            } else {
                _this2.playlist[i].item.status.play = 'hide';
                _this2.playlist[i].item.status.pause = 'show';
            }
        }
    });

    opts.eventBus.on('playNext', function () {
        var found = false;
        for (var i = 0; i < _this2.playlist.length - 1; i++) {
            if (_this2.playlist[i].item.id === _this2.currentId) {
                opts.eventBus.trigger('stopOthers', _this2.playlist[i + 1].item.id);
                _this2.playlist[i + 1].item.play();

                _this2.currentId = _this2.playlist[i + 1].item.id;
                found = true;
                break;
            }
        }

        if (!found) {
            _this2.playlist[i].item.status.play = 'show';
            _this2.playlist[i].item.status.pause = 'hide';
            _this2.playlist[i].item.pause();
        }
        _this2.update();
    });

    opts.eventBus.on('setCurrent', function (id) {
        _this2.currentId = id;
    });

    opts.eventBus.on('getSeekTime', function (value) {
        for (var i = 0; i < _this2.playlist.length; i++) {
            if (_this2.playlist[i].item.id == _this2.currentId) {
                _this2.playlist[i].item.track.progress = Math.round(value);
                break;
            }
        }_this2.update();
    });

    opts.eventBus.on('playMp3', function (url) {
        if (mp3Player.currentSrc === url && !mp3Player.ended) {
            mp3Player.play();
        } else {
            mp3Player.src = url;
            mp3Player.play();
        }
    });

    opts.eventBus.on('pauseMp3', function () {
        mp3Player.pause();
    });

    opts.eventBus.on('seekMp3', function (value) {
        mp3Player.currentTime = value;
    });

    opts.eventBus.on('setPlaylist', function (playlist) {
        _this2.playlist = playlist;
        opts.eventBus.trigger('addRemoteFunctions', _this2.playlist);
        _this2.update();
    });

    opts.eventBus.on('playId', function (id) {
        for (var _iterator2 = _this2.playlist, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
            var _ref2;

            if (_isArray2) {
                if (_i2 >= _iterator2.length) break;
                _ref2 = _iterator2[_i2++];
            } else {
                _i2 = _iterator2.next();
                if (_i2.done) break;
                _ref2 = _i2.value;
            }

            var item = _ref2;

            if (item.item.id === id) {
                opts.eventBus.trigger('stopOthers', id);
                opts.eventBus.trigger('setCurrent', id);
                item.item.play(id);
                break;
            }
        }
    });

    opts.eventBus.on('pauseCurrent', function () {
        getCurrentItem().pause();
        data.status.play = 'show';
        data.status.pause = 'hide';
    });

    var getId = function () {
        var counter = 0;
        return {
            next: function next() {
                return counter++;
            },
            set: function set(val) {
                counter = val;
            }
        };
    }();

    var getCurrentItem = function getCurrentItem() {
        for (var i = 0; i < _this2.playlist.length; i++) {
            if (_this2.playlist[i].item.id === _this2.currentId) return _this2.playlist[i].item;
        }return {};
    };
}, '{ }');

riot.tag2('mm-result', '<i class="fa fa-plus-circle fa-3x" onclick="{add}"></i> <img riot-src="{data.track.thumbnail}"> <span>{data.track.duration}</span> <span>{data.track.title}</span>', '', '', function (opts) {
    'use strict';

    var moment = require('moment');
    this.on('mount', function () {
        var _this3 = this;

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
                name: "erik",
                thumbnail: "/favicon.png"
            },
            status: {}
        };
        opts.eventBus.trigger('addVideoFunctions', this.data, function (data) {
            _this3.data = data;
        });
    });

    this.add = function (e) {
        opts.eventBus.trigger('removeResult', this.data.track.title);
        opts.eventBus.trigger('addVideo', this.data);
    }.bind(this);

    this.play = function (e) {
        opts.eventBus.trigger('addPlayItem', this.data);
        opts.eventBus.trigger('removeResult', this.data.track.title);
        opts.eventBus.trigger('addPlayVideo', this.data);
    }.bind(this);
}, '{ }');

riot.tag2('mm-search', '<div id="search" type="text" onpaste="{edit}" onkeyup="{edit}"> <mm-addfile></mm-addFile> </div> <ul> <li each="{results}"> <mm-result content="{item}"></mm-result> </li> </ul>', '', 'ondragover="{dragover}" ondrop="{drop}"', function (opts) {
    'use strict';

    var _this4 = this;

    var Completely = require('../vendors/complete.ly.js');
    var $ = require('jquery');
    var _ = require('lodash');
    var apiKey = 'AIzaSyDrc_XoIlz_HqMflR0CHHOyatGemqwgAvo';
    var suggest;

    this.on('mount', function () {
        suggest = Completely.completely(_this4.search, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#933'
        });
        suggest.onChange = function (text) {
            suggest.startFrom = text.length;
        };
        suggest.input.addEventListener('focus', function (e) {
            suggest.dropDown.style.visibility = 'visible';
            suggest.hint.style.visibility = 'hidden';
        });

        suggest.input.addEventListener('blur', function (e) {
            suggest.dropDown.style.visibility = 'hidden';
            suggest.hint.style.visibility = 'hidden';
        });
    });

    opts.eventBus.on('removeResult', function (name) {
        for (var i = 0; i < _this4.results.length; i++) {
            if (_this4.results[i].item.snippet.title === name) {
                _this4.results.splice(i, 1);
                _this4.update();
                break;
            }
        }
    });

    this.edit = function (e) {
        var _this5 = this;

        this.query = e.target.value;
        if (e.keyCode >= 37 && e.keyCode <= 40) return;
        if (e.keyCode == 13) {
            suggest.dropDown.style.visibility = 'hidden';
            suggest.hint.style.visibility = 'hidden';
            return;
        }
        if (this.query === "") {
            suggest.dropDown.style.visibility = 'hidden';
        } else {
            opts.eventBus.trigger('youtubeSearch', this.query, 6, function (results) {
                _this5.results = results;
                _this5.update();
            });

            $.ajax({
                url: "http://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&hjson=t&cp=1&q=" + this.query + "&key=" + apiKey + "&format=5&alt=json&callback=?",
                dataType: 'jsonp',
                success: function success(data, textStatus, request) {
                    var l = data[0].length;
                    suggest.options = _.map(data[1], function (o) {
                        return o[0].substring(l);
                    });
                    suggest.dropDown.style.visibility = 'visible';
                    suggest.hint.style.visibility = 'hidden';
                    suggest.repaint();
                }
            });
        }
        return true;
    }.bind(this);

    this.dragover = function (e) {
        e.preventDefault();
        e.stopPropagation();
    }.bind(this);
    this.drop = function (e) {
        e.preventDefault();
        e.stopPropagation();
        opts.eventBus.trigger('addFiles', _.values(e.dataTransfer.files));
    }.bind(this);

    opts.eventBus.on('addVideoFunctions', function (data, callback) {
        addFunctions(data, data.video.id);
        callback(data);
    });

    opts.eventBus.on('youtubeSearch', function (query, nb, callback) {
        var request = gapi.client.youtube.search.list({
            part: "snippet",
            type: "video",
            q: encodeURIComponent(query).replace(/%20/g, "+"),
            maxResults: nb
        });
        request.execute(function (response) {
            var ids = "";
            var results = _.map(response.result.items, function (o) {
                ids += o.id.videoId + ",";
                return {
                    item: o
                };
            });
            ids = ids.slice(0, ids.length - 1);
            var requestDetails = gapi.client.youtube.videos.list({
                part: "ContentDetails",
                id: ids
            });
            requestDetails.execute(function (response) {
                for (var i = 0; i < response.result.items.length; i++) {
                    results[i].item.contentDetails = response.result.items[i].contentDetails;
                }
                callback(results);
            });
        });
    });

    function addFunctions(data, videoId) {
        data.play = function (id) {
            opts.eventBus.trigger('playVideo', videoId);
        };
        data.pause = function () {
            opts.eventBus.trigger('pauseVideo');
        };
        data.seekTime = function (value) {
            opts.eventBus.trigger('setSeekTimeVideo', value);
        };
    }
}, '{ }');

riot.tag2('mm-video', '<div id="video-container"> <div id="video"></div> </div>', '', '', function (opts) {
    'use strict';

    var videoPlayer;
    var interval;
    opts.eventBus.on('playVideo', function (videoId) {
        if (interval != undefined) window.clearInterval(interval);
        interval = setInterval(getSeek, 800);
        if (videoPlayer != undefined) {
            if (videoPlayer.getVideoUrl().split('v=')[1] == videoId) {
                videoPlayer.playVideo();
                return;
            }
        }
        document.getElementById('video-container').innerHTML = '<div id="video"></div>';
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
        });
    });

    opts.eventBus.on('pauseVideo', function () {
        if (videoPlayer) {
            videoPlayer.pauseVideo();
        }
        if (interval != undefined) window.clearInterval(interval);
    });

    opts.eventBus.on('setSeekTimeVideo', function (value) {
        videoPlayer.seekTo(value);
    });

    function getSeek() {
        if (typeof videoPlayer.getCurrentTime === 'function') opts.eventBus.trigger('getSeekTime', videoPlayer.getCurrentTime());
    }
});

riot.tag2('mm-webrtc', '<div> <span>Owner : {isOwner}</span> <button onclick="{reset}">reset</button> </div> <div> <h3>Create a playlist or join one</h3> <input type="text" onkeyup="{edit}" placeholder="playlist name"></input> <button onclick="{createRoom}">Create</button> <button onclick="{joinRoom}">Join</button> </div>', '', '', function (opts) {
    'use strict';

    var _this6 = this;

    var SimpleWebRTC = require('../webrtc/simplewebrtc.js');
    this.room = location.search && location.search.split('?')[1];
    var isOwner = '';
    var ownerId = '';
    var ownerPeer;
    var peers = [];

    this.on('mount', function () {
        if (_this6.room) {
            _this6.root.childNodes[2].style.display = 'none';
            webrtc.joinRoom(_this6.room, function (err, res) {
                console.log('joined', _this6.room, err, res);
                isOwner = false;
                global.isOwner = false;
                _this6.isOwner = 'false';
                _this6.update();
            });
        }
    });
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

    this.edit = function (e) {
        this.room = e.target.value;
    }.bind(this);

    this.createRoom = function (e) {
        var _arguments = arguments,
            _this7 = this;

        this.root.childNodes[2].style.display = 'none';
        var val = this.room.toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
        webrtc.createRoom(val, function (err, name) {
            console.log(' create room cb', _arguments);
            var newUrl = location.pathname + '?' + name;
            isOwner = true;
            global.isOwner = true;
            _this7.isOwner = 'true';
            ownerId = webrtc.connection.connection.id;
            _this7.update();
            if (!err) {
                history.replaceState({
                    foo: 'bar'
                }, null, newUrl);
            } else {
                console.log(err);
            }
        });
    }.bind(this);

    this.joinRoom = function (e) {
        location.search = this.room;
    }.bind(this);

    this.reset = function (e) {
        location.search = '';
    }.bind(this);

    opts.eventBus.on('addMp3', function (data, file) {
        data.type = 'mp3';
        if (isOwner) opts.eventBus.trigger('addItem', data);else {
            data.file.url = '';
            ownerPeer.sendData(data);
            var sender = ownerPeer.sendFile(file);
        }
    });

    opts.eventBus.on('addVideo', function (data) {
        data.type = 'video';
        if (isOwner) opts.eventBus.trigger('addItem', _this6.data);else ownerPeer.sendData(data);
    });

    opts.eventBus.on('updatePlaylist', function (playlist) {
        if (isOwner) {
            for (var _iterator3 = peers, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
                var _ref3;

                if (_isArray3) {
                    if (_i3 >= _iterator3.length) break;
                    _ref3 = _iterator3[_i3++];
                } else {
                    _i3 = _iterator3.next();
                    if (_i3.done) break;
                    _ref3 = _i3.value;
                }

                var peer = _ref3;

                peer.sendData({
                    playlist: playlist,
                    type: 'update'
                });
            }
        } else ownerPeer.sendData({
            playlist: playlist,
            type: 'update'
        });
    });

    opts.eventBus.on('addRemoteFunctions', function (playlist) {
        for (var _iterator4 = playlist, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
            var _ref4;

            if (_isArray4) {
                if (_i4 >= _iterator4.length) break;
                _ref4 = _iterator4[_i4++];
            } else {
                _i4 = _iterator4.next();
                if (_i4.done) break;
                _ref4 = _i4.value;
            }

            var item = _ref4;

            item.item.play = function (id) {
                ownerPeer.sendData({
                    id: id,
                    type: 'play'
                });
            };
            item.item.pause = function () {
                ownerPeer.sendData({
                    type: 'pause'
                });
            };
        }
    });

    webrtc.on('createdPeer', function (peer) {
        console.log('me: ', webrtc.connection.connection.id);
        console.log('createdPeer: ', peer.id);
        peer.sendData({
            ownerId: ownerId,
            type: 'init'
        });
        if (peer && peer.pc) {
            peer.pc.on('iceConnectionStateChange', function (event) {
                console.log('state', peer.pc.iceConnectionState);
            });
        }
        peer.on('fileTransfer', function (metadata, receiver) {
            console.log('incoming filetransfer', metadata);
            receiver.on('progress', function (bytesReceived) {});
            receiver.on('receivedFile', function (file, metadata) {
                console.log('received file', metadata.name, metadata.size);

                opts.eventBus.trigger('addFileToItem', file, metadata);
                receiver.channel.close();
            });
        });
        peer.on('dataTransfer', function (metadata) {
            console.log('incoming datatransfer', metadata);
            console.log('from', peer);
            switch (metadata.type) {
                case 'init':
                    if (isOwner) peers.push(peer);
                    if (ownerId == '') {
                        ownerId = metadata.ownerId;
                    }
                    if (metadata.ownerId != '' && ownerId != metadata.ownerId) {
                        console.error('OWNER CONFLICT !! you: ' + webrtc.connection.connection.id + ' with owner: ' + ownerId + ' are in conflict with owner: ' + metadata.ownerId + ' from peer: ' + peer.id);
                    } else if (peer.id == ownerId) ownerPeer = peer;
                    console.log('ownerPeer ', ownerPeer);
                    break;
                case 'mp3':
                    opts.eventBus.trigger('addItem', metadata);
                    break;
                case 'video':
                    opts.eventBus.trigger('addVideoFunctions', metadata, function (data) {
                        opts.eventBus.trigger('addItem', data);
                    });
                    break;
                case 'update':
                    opts.eventBus.trigger('setPlaylist', metadata.playlist);
                    if (isOwner) opts.eventBus.trigger('updatePlaylist', metadata.playlist);
                    break;
                case 'play':
                    opts.eventBus.trigger('playId', metadata.id);
                    break;
                case 'pause':
                    opts.eventBus.trigger('pauseCurrent');
                    break;
            }
        });
    });

    webrtc.on('iceFailed', function (peer) {
        console.log('local fail with peer: ' + peer);
    });

    webrtc.on('connectivityError', function (peer) {
        console.log('remote fail with peer: ' + peer);
    });
}, '{ }');
