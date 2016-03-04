<mm-video>
    <div id="video-container">
        <div id="video"></div>
    </div>
    <script>
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
    </script>
</mm-video>
