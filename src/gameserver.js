import Canvasobject from './canvasobject.js'

export default class Gameserver extends Canvasobject {

    constructor(gs, fixDPI) {
        super()
        this.gs = gs
        this.offset = 5
        this.zoom = {
            zIn: false,
            zOut: false
        }
        this.controls = {
            CurrentDirection: 0,
            CurrentSprint: false,
            CurrentZoomLevel: 5
        }
        window.addEventListener('keydown', this.handleKeyDown.bind(this), false)
        window.addEventListener('keyup', this.handleKeyUp.bind(this), false)
    }

    connect() {
        this.socket = new WebSocket(this.gs)
        this.socket.onopen = this.socketOpened.bind(this)
        this.socket.onmessage = this.mapReceived.bind(this)
    }

    socketOpened() {
        this.socket.send(JSON.stringify({
            'Name': 'Parth',
            'Token': 'token'
        }))
    }

    mapReceived(e) {
        console.log(e)
        this.colors = JSON.parse(e.data)
        window.requestAnimationFrame(this.render.bind(this))
        this.sendKeyStatus()
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
