<mm-video>
    <div id="video-container">
        <div id="video"></div>
    </div>
    <script>
    'use strict'
    var videoPlayer
    opts.eventBus.on('playVideo', (videoId) => {
        if (videoPlayer != undefined) {
            if (videoPlayer.getVideoUrl().split('v=')[1] == videoId)
                videoPlayer.playVideo()
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
    })
    </script>
</mm-video>
