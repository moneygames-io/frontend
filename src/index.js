import Matchmaker from './matchmaker.js'
import Gameserver from './gameserver.js'
import Payserver from './payserver.js'

class Index {
    constructor() {
        this.payserver = new Payserver("ws://"+window.location.hostname+ ":7000/ws", this.payserverDone.bind(this))
        this.payserver.getBitcoinAddress()
    }

    payserverDone(token) {
        this.payserver.destroyCanvas()
        this.token = token
        this.matchmaker = new Matchmaker("ws://" + window.location.hostname + ":8000/ws", this.matchmakerDone.bind(this))
        this.matchmaker.joinQueue()
    }

    matchmakerDone(gs) {
        this.matchmaker.destroyCanvas()
        let gameserver = new Gameserver(gs)
        gameserver.connect()
    }
}

new Index()
