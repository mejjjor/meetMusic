<mm-video>
    <div id="video-container">
        <div id="video"></div>
    </div>
    <script>
    'use strict'
    var videoPlayer
    opts.eventBus.on('playVideo', (videoId) => {
        if (!videoPlayer) {
            videoPlayer = new YT.Player('video', {
                playerVars: {
                    'autoplay': 1
                },
                width: 600,
                height: 400,
                videoId: videoId
                    // events: {
                    //     onReady: initialize
                    // }
            });
        } else {
            document.getElementById('video').setAttribute('src', 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&enablejsapi=1&origin=http%3A%2F%2Flocalhost%3A8080')
        }
    })
    opts.eventBus.on('pauseVideo', () => {
    	if (videoPlayer) {
    		videoPlayer.pauseVideo()
    	}
    })
    </script>
</mm-video>
