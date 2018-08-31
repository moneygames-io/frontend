import SetupDialog from './setupdialog.js'

class MainController {
    constructor() {
        this.token = this.getStoredToken();
        if (this.token == null) {
            this.setupDialog = new SetupDialog()
        } else {
            // TODO go straight to payserver with this token
        }
    }

    getStoredToken() {
        // TODO
        return null;
    }

    matchmakerDone(gs) {
        this.matchmaker.destroyCanvas()
        let gameserver = new Gameserver(gs)
        gameserver.connect(this.token)
    }
}

new MainController()
