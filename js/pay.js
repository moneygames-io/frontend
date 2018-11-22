import QRCode from 'qrcode'

export default class Pay {

    constructor(modal, paidCallback, name, setupDialog) {
        this.setupDialog = setupDialog
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
        if (data['transactionId']) {
            this.transactionId = data['transactionId']
            this.destinationAddress = data['destinationAddress']
            this.pot = data['pot']
            this.showTransaction()
        }
        if (data['error']) {
            this.setupDialog.retryReward(this.pot)
        }
    }

    sendDestinationAddress(token, destinationAddress) {
        let msg = {
            'token': token,
            'destinationAddress': destinationAddress,
            'pot': this.pot
        }
        this.socket.send(JSON.stringify(msg))
    }

    showTransaction() {
        this.sent = document.createElement('h2')
        this.sent.classList.add('bitcoin-info')
        this.sent.innerHTML = 'Sent'

        this.description = document.createElement('p')
        this.description.classList.add('bitcoin-info')
        this.description.innerHTML =
            'Congratulations ' +
            this.pot +
            ' Satoshi has been sent to' +
            ' BitcoinAddress: ' +
            this.destinationAddress +
            ' with TransactionId: ' +
            this.transactionId
        this.modal.appendChild(this.sent)
        this.modal.appendChild(this.description)
    }

    saveToken(token) {
        this.token = token
        window.localStorage.setItem("token", token)
    }
}
