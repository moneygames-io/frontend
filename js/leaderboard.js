export default class Leaderboard {
    constructor() {
        this.table = document.getElementById("leaderboard-table");
    }

    toHexString(n) {
        if (n < 0) {
            n = 0xFFFFFFFF + n + 1
        }
        return "#" + ("000000" + n.toString(16).toUpperCase()).substr(-6)
    }

    setLeaderboard(data) {
        this.clearTable()
        for (let datum in data) {
            let row = this.table.insertRow(0);
            row.style.color = this.toHexString(data[datum].Color)
            row.insertCell(0).innerHTML = data[datum].Name;
            row.insertCell(1).innerHTML = data[datum].Length;
        }
    }

    clearTable() {
        this.table.innerHTML = "";
    }
}
