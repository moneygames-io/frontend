import ProgressBar from 'progressbar.js'

export default class Matchmaker {

    constructor(modal, token, matchmakerCallback) {
        this.url = "ws://" + window.location.hostname + ":8000/ws"
        this.matchmakerCallback = matchmakerCallback
        this.modal = modal
        this.progress = 0
        this.joinQueue(token)

        this.container = document.createElement('div')
        this.container.id = 'container'

        this.modal.appendChild(this.container)

        this.bar = this.createProgressBar()
        this.countdown = false
    }

    createProgressBar() {
        let bar = new ProgressBar.SemiCircle(this.container, {
            strokeWidth: 6,
            color: '#FFEA82',
            trailColor: '#eee',
            trailWidth: 1,
            easing: 'easeInOut',
            duration: 1400,
            svgStyle: null,
            text: {
                value: '',
                alignToBottom: false
            },
            from: {
                color: '#FFEA82'
            },
            to: {
                color: '#ED6A5A'
            },
            // Set default step function for all animate calls
            step: (state, bar) => {
                bar.path.setAttribute('stroke', state.color);
                var value = Math.round(bar.value() * 100);
                if (value === 0) {
                    bar.setText('');
                } else {
                    if (this.countdown) {
                        bar.setText(this.current);
                    } else {
                        bar.setText(this.current + ' / ' + this.target);
                    }
                }

                bar.text.style.color = state.color;
            }
        });
        bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
        bar.text.style.fontSize = '2rem';
        return bar
    }

    joinQueue(token) {
        this.token = token
        this.socket = new WebSocket(this.url)
        this.socket.onopen = this.socketOpened.bind(this)
        this.socket.onmessage = this.matchmakingMessage.bind(this)
    }

    socketOpened() {
        this.socket.send(JSON.stringify({
            'Token': this.token
        }))
    }

    matchmakingMessage(e) {
        let data = JSON.parse(e.data)
        if (data['Port']) {
            this.matchmakerCallback(this.token, "ws://" + window.location.hostname + ":" + data['Port'] + "/ws")
        }

        if (data['Status']) {
            this.updateStatus(data['Status'])
        }

        if (data['Time']) {
            this.countdown = true
            this.updateStatus(data['Time'])
        }
    }

    updateStatus(s) {
        this.current = s.Current
        this.target = s.Target
        this.progress = s.Current / s.Target
        this.bar.animate(this.progress);
    }
}