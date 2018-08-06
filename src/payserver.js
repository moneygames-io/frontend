import Canvasobject from './canvasobject.js'

export default class Matchmaker extends Canvasobject {

    constructor(matchmakingURL, gameserverCallback) {
        super();
        this.url = matchmakingURL;
        this.gameserverCallback = gameserverCallback;
        this.progress = 0;
    }

    joinQueue() {
        this.socket = new WebSocket(this.url);
        this.socket.onopen = this.socketOpened.bind(this);
        this.socket.onmessage = this.matchmakingMessage.bind(this);
    }

    socketOpened() {
        window.requestAnimationFrame(this.render.bind(this));
    }

    matchmakingMessage(e) {
        let data = JSON.parse(e.data);
        if (data['Port']) {
            this.gameserverCallback("ws://" + window.location.hostname + ":" + data['Port'] + "/ws");
        }

        if (data['Status']) {
            this.updateStatus(data['Status']);
        }
    }

    updateStatus(s) {
        this.progress = s.CurrentClients / s.TargetClients;
        this.render();
    }

    render() {
        super.getContext().clearRect(0, 0, super.getContext().canvas.width, super.getContext().canvas.height);
        super.getContext().beginPath();
        super.getContext().lineWidth = 3;
        super.getContext().strokeStyle = 'rgb(108, 116, 128)';
        super.getContext().arc(
            super.getContext().canvas.width / 2,
            super.getContext().canvas.height / 2,
            100,
            1.5 * Math.PI,
            this.progress * 2 * Math.PI + 1.5 * Math.PI
        );
        super.getContext().stroke();
    }
}