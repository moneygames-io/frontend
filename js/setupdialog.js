import ServerList from './serverlist.js'
import Pay from './pay.js'
import Matchmaker from './matchmaker.js'

export default class SetupDialog {
    constructor() {
        this.serverlist = new ServerList()
        this.modal = document.getElementById('popup')

        document.getElementById('spectate-button').onclick = this.dismiss
        document.getElementById('play-button').onclick = this.playPressed.bind(this)
    }

    dismiss() {
        document.getElementById('modal').classList.remove('md-show')
    }

    async playPressed() {
        this.serverlist.leaveSpectatorMode()
        await this.clear()
        this.payserver = new Pay(this.modal, this.payDone.bind(this))
    }

    async payDone(token) {
        await this.clear()
        this.token = token
        this.matchmaker = new Matchmaker(this.modal, token, this.matchmakerDone.bind(this))
    }

    async matchmakerDone(token, gameserver) {
        await this.clear()
        await this.dismiss()
        this.serverlist.connectAsPlayer(token, gameserver, this)
    }

    async clear() {
        var seconds = 200 / 1000;
        this.modal.style.transition = "opacity " + seconds + "s ease";

        this.modal.style.opacity = 0;
        await this.sleep(200)
        this.modal.innerHTML = ""
        this.modal.style.opacity = 1
    }

    show() {
        document.getElementById('modal').classList.add('md-show')
    }

    setupReward(pot) {
        this.pot
        this.congratulations = document.createElement('h2')
        this.congratulations.classList.add('bitcoin-info')
        this.congratulations.innerHTML = 'You won ฿'+pot

        this.instructions = document.createElement('p')
        this.instructions.classList.add('bitcoin-info')
        this.instructions.innerHTML = 'Enter your reward destination address'

        this.destinationAddress = document.createElement('input')
        this.destinationAddress.classList.add('bitcoin-info')

        this.submitButton = document.createElement('a')
        this.submitButton.classList.add('waves-effect')
        this.submitButton.classList.add('waves-light')
        this.submitButton.classList.add('btn')
        this.submitButton.innerHTML = 'Send'
        this.submitButton.onclick = this.sendReward.bind(this)

        this.modal.appendChild(this.congratulations)
        this.modal.appendChild(this.instructions)
        this.modal.appendChild(this.destinationAddress)
        this.modal.appendChild(this.submitButton)
    }

    async sendReward( ){
        //must validate address before accepting it
        this.payserver.sendDestinationAddress(this.token, this.destinationAddress.value)
        await this.clear()
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
