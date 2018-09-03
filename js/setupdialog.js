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
        window.localStorage.setItem("token",token)
        this.matchmaker = new Matchmaker(this.modal, token, this.matchmakerDone.bind(this))
    }

    async matchmakerDone(token, gameserver) {
        await this.dismiss()
        this.serverlist.connectAsPlayer(token, gameserver)
    }

    async clear() {
        var seconds = 200 / 1000;
        this.modal.style.transition = "opacity " + seconds + "s ease";

        this.modal.style.opacity = 0;
        await this.sleep(200)
        this.modal.innerHTML = ""
        this.modal.style.opacity = 1
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
