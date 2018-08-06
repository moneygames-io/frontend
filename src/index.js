import Matchmaker from './matchmaker.js'
import Gameserver from './gameserver.js'
// import Payserver from './payserver.js'

class Index {
    constructor() {
        //this.Payserver = new Payserver("ws://"+window.location.hostname+ ":7000/ws")
        //this.Payserver.getBitcoinAddress()

        this.matchmaker = new Matchmaker("ws://" + window.location.hostname + ":8000/ws", this.gameserverReady.bind(this))
        this.matchmaker.joinQueue()
    }

    gameserverReady(gs) {
        this.matchmaker.destroyCanvas()
        let gameserver = new Gameserver(gs)
        gameserver.connect()
    }
}

new Index()
