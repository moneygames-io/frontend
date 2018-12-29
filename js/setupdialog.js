import ServerList from './serverlist.js'
import Pay from './pay.js'
import Matchmaker from './matchmaker.js'
import Receipt from './receipt.js'

export default class SetupDialog {
    constructor() {
        this.serverlist = new ServerList()
        this.modal = document.getElementById('popup')

        document.getElementById('spectate-button').onclick = this.spectatingPressed.bind(this)
        document.getElementById('play-button').onclick = this.playPressed.bind(this)
        M.updateTextFields()
        this.setToPriorName()
    }

    spectatingPressed() {
        this.serverlist.setName(this.getName())
        this.dismiss()
    }

    dismiss() {
        document.getElementById('modal').classList.remove('md-show')
    }

    getName() {
        let name = document.getElementById('nickname').value
        if (name === '') {
            return 'unnamed'
        } else {
            window.localStorage.setItem("nickname", name)
            return name
        }
    }

    setToPriorName() {
        let nickname = window.localStorage.getItem("nickname")
        if (nickname == null) {
            return
        }

        document.getElementById('nickname').value = nickname
    }

    async playPressed() {
        this.name = this.getName()
        this.serverlist.leaveSpectatorMode()
        await this.clear()
        this.payserver = new Pay(this.modal, this.payDone.bind(this), this.name, this)
    }

    async setupReceipt() {
        await this.clear()
        this.payserver = new Receipt(this.modal, this)
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

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}