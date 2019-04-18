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
        this.receipt = new Receipt(this.modal, this)
    }

    async showReceipt(data) {
        await this.clear()
        this.modal.innerHTML = "";

        var paymentTitle = document.createElement('h5');
        if (data.Unconfirmed < data.Confirmed) {
            paymentTitle.innerHTML = 'Winning payment initated to address: ';
        } else {
            paymentTitle.innerHTML = 'Winning payment sent to address: ';
        }
        this.modal.appendChild(paymentTitle);

        var link = document.createElement('a');
        link.text = data.DestinationAddress;
        link.href = 'https://live.blockcypher.com/btc/address/' + data.DestinationAddress;
        link.target = '_blank';
        this.modal.appendChild(link);

        if (data.Unconfirmed > data.Confirmed) {
            return;
        }

        var description = document.createElement('p');
        description.innerHTML =
            'Confirmed santoshi = ' +
            data.Confirmed +
            '/' +
            data.Unconfirmed +
            '. This payment may take up to 15 minutes. ' +
            'Waiting on the following addresses to confirm their transactions:';
        this.modal.appendChild(description);

        for (var key in data.PendingAddresses) {
            var addr = data.PendingAddresses[key];
            var link = document.createElement('a');
            var br = document.createElement('br');
            link.text = addr;
            link.href = 'https://live.blockcypher.com/btc/address/' + addr;
            link.target = '_blank';
            this.modal.appendChild(link);
            this.modal.appendChild(br);
        }

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
