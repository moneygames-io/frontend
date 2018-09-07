import QRCode from 'qrcode'

export default class Pay {

    constructor(modal, paidCallback) {
        this.paidCallback = paidCallback
        this.url = "ws://" + window.location.hostname + ":7000/ws"
        this.img = document.createElement('img')
        this.img.classList.add('bitcoin-info')
        this.addressField = document.createElement('p')
        this.addressField.classList.add('bitcoin-info')
        modal.appendChild(this.img)
        modal.appendChild(this.addressField)
        this.modal = modal
        this.getBitcoinAddress()
    }

    getBitcoinAddress() {
        this.socket = new WebSocket(this.url)
        this.socket.onmessage = this.payserverMessage.bind(this)
    }

    payserverMessage(e) {
        let data = JSON.parse(e.data)
        if (data['bitcoinAddress']) {
            this.address = data['bitcoinAddress']
            this.addressField.innerHTML = this.address
            QRCode.toDataURL(this.address)
                .then(url => {
                    this.img.src = url
                })
        }
        if (data['token']) {
            this.saveToken(data['token'])
        }

        if (data['status']) {
            if (data['status'] === 'paid') {
                this.paidCallback(this.token)
            }
        }
    }

    saveToken(token) {
        this.token = token // TODO actual persistence
    }
}
