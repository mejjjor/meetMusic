<mm-social>
    <div>
        <div>
            <span>Name :</span>
            <span>Url picture :</span>
        </div>
        <div>
            <input type='text' value='{ name }' onkeyup='{ editName }' onpaste='{ editName }'></input>
            <input type='text' onkeyup='{ editPicture }' onpaste='{ editPicture }'></input>
        </div>
        <div>
            <img src='{ pictureUrl }'>
        </div>
    </div>
    <script>
    'use strict'

    var themes = ['sugarsweets', 'heatwave', 'daisygarden', 'seascape', 'summerwarmth', 'bythepool', 'duskfalling', 'frogideas', 'berrypie']


    this.on('mount', () => {
        var req = new XMLHttpRequest();
        req.open('GET', 'http://uinames.com/api/?region=france', true);
        req.onreadystatechange = (aEvt) => {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    this.name = JSON.parse(req.responseText).name
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
            }
        }
        req.send(null)
    })


    function getRandomPicture(name) {
        var theme = themes[Math.round(Math.random() * themes.length)]
        return 'http://tinygraphs.com/labs/isogrids/hexa16/' + name + '?theme=' + theme + '&numcolors=4&size=220&fmt=svg'
    }

    editPicture(e) {
        this.pictureUrl = e.target.value
        global.contributorPictureUrl = e.target.value

        this.update()
        return true
    }

    editName(e) {
        global.contributorName = e.target.value
    }
    </script>
</mm-social>
