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
        if (videoPlayer != undefined) {
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
        if (videoPlayer) {
            videoPlayer.pauseVideo()
        }
        if (interval != undefined)
            window.clearInterval(interval)
    })

    opts.eventBus.on('setSeekTimeVideo', (value) => {
        videoPlayer.seekTo(videoPlayer.getDuration() * value / 100)
    })

    function getSeek() {
        if (videoPlayer)
            opts.eventBus.trigger('getSeekTime', videoPlayer.getCurrentTime() * 100 / videoPlayer.getDuration())
    }
    </script>
</mm-video>
