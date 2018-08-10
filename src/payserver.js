import Canvasobject from './canvasobject.js'

export default class Payserver extends Canvasobject {

    constructor(matchmakingURL, payserverCallback) {
        super();
        this.url = matchmakingURL;
        this.payserverCallback = payserverCallback;
        this.progress = 0;
    }

    getBitcoinAddress() {
        this.socket = new WebSocket(this.url);
        this.socket.onmessage = this.payserverMessage.bind(this);
    }

    payserverMessage(e) {
        let data = JSON.parse(e.data);
        console.log(data);
        if (data['bitcoinAddress']) {
            this.address = data['bitcoinAddress']
            this.render()
        }
        if (data['token']) {
            this.payserverCallback(data['token'])
        }
    }

    render() {
        if (this.address) {
            QR.draw(this.address, super.getContext().canvas)
        } 
    }
}
