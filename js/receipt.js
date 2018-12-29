import QRCode from 'qrcode'

export default class Pay {

    constructor(modal, setupDialog) {
        console.log("2")
        this.modal = modal
        this.token = setupDialog.token
        this.setupDialog = setupDialog
        this.url = "ws://" + window.location.hostname + ":7002/ws"
        this.socket = new WebSocket(this.url)
        this.socket.onmessage = this.receiptMessage.bind(this)
        this.setupReward()
    }

    setupReward() {
        console.log("3")
        this.congratulations = document.createElement('h2')
        this.congratulations.classList.add('bitcoin-info')
        this.congratulations.innerHTML = 'You won ฿'
        this.modal.appendChild(this.congratulations)
        this.instructions = document.createElement('p')
        this.instructions.classList.add('bitcoin-info')
        this.instructions.innerHTML = 'Enter your reward destination address'
        this.modal.appendChild(this.instructions)
        this.setupDestination()
    }

    retryReward() {
        this.congratulations = document.createElement('h3')
        this.congratulations.classList.add('bitcoin-info')
        this.congratulations.innerHTML = 'Error sending winnings'
        this.modal.appendChild(this.congratulations)
        this.instructions = document.createElement('p')
        this.instructions.classList.add('bitcoin-info')
        this.instructions.innerHTML = 'Re-Enter your bitcoin address'
        this.modal.appendChild(this.instructions)
        this.setupDestination()
    }

    setupDestination() {
        console.log("4")
        this.destinationAddress = document.createElement('input')
        this.destinationAddress.classList.add('bitcoin-info')
        this.modal.appendChild(this.destinationAddress)
        this.submitButton = document.createElement('a')
        this.submitButton.classList.add('waves-effect')
        this.submitButton.classList.add('waves-light')
        this.submitButton.classList.add('btn')
        this.submitButton.innerHTML = 'Send'
        this.modal.appendChild(this.submitButton)
        this.submitButton.onclick = this.sendReward.bind(this)
    }

    async sendReward() {
        //must validate address before accepting it
        await this.setupDialog.clear()
        this.sendDestinationAddress(this.token, this.destinationAddress.value)
    }

    getPot() {
        this.socket = new WebSocket(this.url)
        this.socket.onmessage = this.payserverMessage.bind(this)
    }

    receiptMessage(e) {
        let data = JSON.parse(e.data)
        if (data['transactionId']) {
            this.transactionId = data['transactionId']
            this.destinationAddress = data['destinationAddress']
            this.pot = data['pot']
            this.showTransaction()
        }
        if (data['pot']) {
            this.pot = data['pot']
            this.setupReward()
        }
        if (data['error']) {
            this.retryReward(this.pot)
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

}