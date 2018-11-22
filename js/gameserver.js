import Canvasobject from './canvasobject.js'

import Leaderboard from './leaderboard.js'
import Minimap from './minimap.js'

export default class Gameserver extends Canvasobject {

    constructor(gs, sd) {
        super('game-area')
        this.gs = gs
        this.setupdialog = sd
        this.leaderboard = new Leaderboard()
        this.minimap = new Minimap()
        this.zoom = {
            zIn: false,
            zOut: false
        }
        this.controls = {
            CurrentDirection: 0,
            CurrentSprint: false,
            CurrentZoomLevel: 5
        }
        this.keyUpEventFunction = this.handleKeyDown.bind(this)
        this.keyDownEventFunction = this.handleKeyDown.bind(this)
        window.addEventListener('keydown', this.keyUpEventFunction, false)
        window.addEventListener('keyup', this.keyDownEventFunction, false)
    }

    connect(token) {
        this.token = token
        this.socket = new WebSocket(this.gs)
        this.socket.onopen = this.socketOpened.bind(this)
        this.socket.onmessage = this.dataReceived.bind(this)
    }

    socketOpened() {
        let nickname = window.localStorage.getItem('nickname')
        if (nickname == null) {
            nickname = 'unnamed'
        }
        this.socket.send(JSON.stringify({
            'Token': this.token,
            'Name': nickname
        }))
    }

    dataReceived(e) {
        let data = JSON.parse(e.data)

        if ('pot' in data) {
            this.pot = data['pot']
        }

        if (data['Perspective']) {
            this.colors = data['Perspective']
            window.requestAnimationFrame(this.render.bind(this))
            // TODO unless spectating
            this.sendKeyStatus()
        }

        if (data['Leaderboard']) {
            this.leaderboard.setLeaderboard(data['Leaderboard'])
        }

        if (data['Minimap']) {
            this.minimap.setMinimap(data['Minimap'])
        }

        if (data['status'] == 'won') {
            this.removeEventListeners()
            this.setupdialog.setupReward(this.pot)
            this.setupdialog.show()
        }
    }

    removeEventListeners()
    {
        window.removeEventListener('keydown', this.keyUpEventFunction, false)
        window.removeEventListener('keyup', this.keyDownEventFunction, false)
    }

    toHexString(n) {
        if (n < 0) {
            n = 0xFFFFFFFF + n + 1
        }
        return "#" + ("000000" + n.toString(16).toUpperCase()).substr(-6)
    }

    drawColors() {
        let canvasWidth = super.getContext().canvas.width
        let canvasHeight = super.getContext().canvas.height
        let gameAreaSize = Math.min(canvasWidth, canvasHeight)
        let gameAreaOffsetW = canvasWidth - gameAreaSize
        let gameAreaOffsetH = canvasHeight - gameAreaSize

        for (let r = 0; r < this.colors.length; r++) {
            for (let c = 0; c < this.colors[r].length; c++) {
                this.offset = (gameAreaSize / this.colors.length) * 0.01
                super.getContext().fillStyle = this.toHexString(this.colors[r][c])
                super.getContext().fillRect(
                    (gameAreaSize / this.colors.length) * r + this.offset + (gameAreaOffsetW / 2),
                    (gameAreaSize / this.colors[r].length) * c + this.offset + (gameAreaOffsetH / 2),
                    (gameAreaSize / this.colors.length) - (2 * this.offset),
                    (gameAreaSize / this.colors[r].length) - (2 * this.offset)
                )
            }
        }
    }

    // TODO are these right? Is the map oriented wrong?
    handleKeyDown(e) {
        switch (e.key) {
            case "ArrowUp":
                this.controls.CurrentDirection = 3
                break
            case "ArrowRight":
                this.controls.CurrentDirection = 0
                break
            case "ArrowDown":
                this.controls.CurrentDirection = 1
                break
            case "ArrowLeft":
                this.controls.CurrentDirection = 2
                break
            case "q":
                if (!this.zoom.zIn) {
                    this.controls.CurrentZoomLevel++
                    this.zoom.zIn = true
                }
                break
            case "w":
                if (!this.zoom.zOut) {
                    this.controls.CurrentZoomLevel--
                    this.zoom.zIn = true
                }
                break
            case " ":
                this.controls.CurrentSprint = true
                break
        }
        this.sendKeyStatus()
    }

    handleKeyUp(e) {
        switch (e.key) {
            case " ":
                this.controls.CurrentSprint = false
                break
            case "q":
                this.zoom.zIn = false
                break
            case "w":
                this.zoom.zOut = false
                break
        }

        this.sendKeyStatus()
    }

    sendKeyStatus() {
        this.socket.send(JSON.stringify(this.controls))
    }

    render() {
        super.getContext().clearRect(0, 0, super.getContext().canvas.width, super.getContext().canvas.height)
        this.drawColors()
    }
}
