import SetupDialog from './setupdialog.js'
import axios from 'axios'

class MainController {
    constructor() {
        this.setupDialog = new SetupDialog()
        this.checkForDisconnectToken()
    }

    async checkForDisconnectToken() {
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("receipt")) {
            console.log("Reciept Redirect");
            let gameserverid = urlParams.get("receipt")
            let response = await axios.get("http://" + window.location.hostname + ":6002/receipt/" + gameserverid)
            this.setupDialog.showReceipt(response.data)
        } else {
            let token = window.localStorage.getItem("token")
            if (token != null) {
                let response = await axios.get("http://" + window.location.hostname + ":6002/player/" + token)
                let status = response["data"]
                if (status == "paid") {
                    this.setupDialog.payDone(token)
                } else {
                    window.localStorage.removeItem("token")
                }
            }
        }

    }

    matchmakerDone(gs) {
        this.matchmaker.destroyCanvas()
        let gameserver = new Gameserver(gs)
        gameserver.connect(this.token)
    }
}

new MainController()