import SetupDialog from './setupdialog.js'
import axios from 'axios'

class MainController {
    constructor() {
        this.setupDialog = new SetupDialog()
        this.checkForDisconnectToken()
    }

    async checkForDisconnectToken() {
        let token = await window.localStorage.getItem("token")
        console.log(token)
        if(token!= null){
            let response = await axios.get("http://" + window.location.hostname + ":6002/player/"+token)
            let status = response["data"]
            if (status == "paid"){
                this.setupDialog.payDone(token)
            }
            else{
              window.localStorage.removeItem("token")
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