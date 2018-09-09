import axios from 'axios'
import Gameserver from './gameserver.js'

export default class ServerList {
    constructor() {
        this.table = document.getElementById("game-list-table");
        this.spectatorMode = true
        this.getData()
    }

    async getData() {
        while (true) {
            let response = await axios.get("http://" + window.location.hostname + ":6001/games")
            this.clearTable()
            this.addData(response.data)
            await this.sleep(5000)
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    addData(data) {
        for (let gameserver in data) {
            let row = this.table.insertRow(0);
            row.insertCell(0).innerHTML = gameserver;
            row.insertCell(1).innerHTML = data[gameserver]["Players"]
            row.insertCell(2).innerHTML = data[gameserver]["Pot"]

            row.onclick = function() {
                this.connectAsSpectator(gameserver)
            }.bind(this)
            if (gameserver === this.server) {
                row.classList.add('selected')
            }
        }
    }

    connectAsSpectator(gameserver) {
        this.server = gameserver
        console.log(this.server)
        this.gameserver = new Gameserver("ws://" + window.location.hostname + ":" + gameserver + "/ws")
        this.gameserver.connect("spectating")
    }

    setName(name) {
        this.name = name
    }

    leaveSpectatorMode() {
        this.spectatorMode = false;
    }

    connectAsPlayer(token, gameserver) {
        this.gameserver = new Gameserver(gameserver)
        this.gameserver.connect(token)
    }

    clearTable() {
        this.table.innerHTML = "";
    }
}