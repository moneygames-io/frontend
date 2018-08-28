import axios from 'axios'
import Gameserver from './gameserver.js'

export default class ServerList {
    constructor() {
        this.table = document.getElementById("game-list-table");
        this.spectatorMode = true
        this.getData()
    }

    async getData() {
        while (this.spectatorMode) {
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
        for (let datum in data) {
            let row = this.table.insertRow(0);
            row.insertCell(0).innerHTML = data[datum];
        }
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
