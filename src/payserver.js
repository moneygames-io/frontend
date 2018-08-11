import Canvasobject from './canvasobject.js'
import QRCode from 'qrcode'

export default class Payserver extends Canvasobject {

    constructor(matchmakingURL, payserverCallback) {
        super()
        this.url = matchmakingURL
        this.payserverCallback = payserverCallback
        this.progress = 0
    }

    getBitcoinAddress() {
        this.socket = new WebSocket(this.url)
        this.socket.onmessage = this.payserverMessage.bind(this)
    }

    payserverMessage(e) {
        let data = JSON.parse(e.data)
        console.log(data)
        if (data['bitcoinAddress']) {
            this.address = data['bitcoinAddress']
            QRCode.toDataURL(this.address)
                .then(url => {
                    this.dataURL = url
                    this.render()
                })

        }
        if (data['token']) {
            this.payserverCallback(data['token'])
        }
    }

    render() {
        let ctx = super.getContext()
        if (this.dataURL) {
            let img = new Image
            img.onload = function() {
                ctx.drawImage(img, 0, 0)
            }
            img.src = this.dataURL
        } 

        if (this.address) {
            ctx.font = "40px Arial"
            ctx.fillText(this.address, 10, 400)
        }
    }
}
