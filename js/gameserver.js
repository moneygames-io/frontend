import axios from 'axios'

import Canvasobject from './canvasobject.js'

import Leaderboard from './leaderboard.js'
import Minimap from './minimap.js'

export default class Gameserver extends Canvasobject {

    constructor(gs, sd) {
        super('game-area')
        this.port = gs
        this.setupdialog = sd // TODO ? 
        this.leaderboard = new Leaderboard()
        this.minimap = new Minimap()
        this.zoom = {
            zIn: false,
            zOut: false
        }
        this.controls = {
            direction: 0,
            isSprinting: false,
            zoom: 10
        }

        window.addEventListener('keydown', this.handleKeyUp.bind(this), false)
        window.addEventListener('keyup', this.handleKeyDown.bind(this), false)
    }

    connect(token) {

        console.log("connect called")

        let peerConnection = new RTCPeerConnection({
            iceServers: [{
                urls: 'stun:stun.l.google.com:19302'
            }]
        })
        peerConnection.oniceconnectionstatechange = e => console.log(peerConnection)

        peerConnection.onicecandidate = event => {
            console.log("here")
            let offer = ""
            if (event.candidate === null) {
                offer = btoa(JSON.stringify(peerConnection.localDescription))
                console.log(peerConnection.localDescription)

                let name = window.localStorage.getItem('name')
                if (name == null) {
                    name = 'unnamed'
                }


                axios.post("http://" + window.location.hostname + ":" + this.port + "/player", {
                        'token': token,
                        'name': name,
                        'offer': offer
                    })
                    .then(function(response) {
                        let sd = response.data
                        try {
                            peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(sd))))
                            console.log(new RTCSessionDescription(JSON.parse(atob(sd))))
                        } catch (e) {
                            alert(e)
                        }
                    })
            }
        }

        let sendChannel = peerConnection.createDataChannel('foo', {
            'ordered': false,
            'maxRetransmits': 0
        })
        this.socket = sendChannel
        sendChannel.onclose = () => console.log('sendChannel has closed')
        sendChannel.onopen = this.socketOpened.bind(this)
        sendChannel.onmessage = this.dataReceived.bind(this)

        peerConnection.onnegotiationneeded = e => peerConnection.createOffer().then(d => peerConnection.setLocalDescription(d)).catch(log)

    }

    socketOpened() {
        console.log("openend")
        this.time = performance.now()
    }

    dataReceived(e) {
        console.log(performance.now() - this.time)
        this.time = performance.now()
        let data = new Int32Array(e.data)
        let dataType = data[0]

        if (dataType === 1) {
            this.topLeftR = data[1]
            this.topLeftC = data[2]
            this.viewport = data[3]
            this.mapsize = data[4]

            this.perspective = []
            for (let i = 5; data[i] != -1;) {
                this.perspective.push([data[i], data[i + 1], data[i + 2]])
                i += 3
            }

            this.buildColors()
            // TODO Process leadermap
            window.requestAnimationFrame(this.render.bind(this))
        }

        if (dataType === 2) {
            this.removeEventListeners()
            this.setupdialog.setupReceipt()
            this.setupdialog.show()
        }

        if (dataType === 3) {
            // TODO Lost
        }
    }

    buildColors() {
        this.colors = []
        for (let r = 0; r < this.viewport; r++) {
            this.colors.push(new Array(this.viewport))
        }

        for (let r = 0; r < this.viewport; r++) {
            for (let c = 0; c < this.viewport; c++) {
                let row = r + this.topLeftR
                let col = c + this.topLeftC

                if (row < this.mapsize && row >= 0 && col < this.mapsize && col >= 0) {
                    this.colors[r][c] = 0xD3D3D3
                } else {
                    this.colors[r][c] = 0x000000
                }
            }
        }

        for (let i in this.perspective) {
            let color = this.perspective[i][0]

            if (color == 70) {
                color = 0x00ff00
            }

            let row = this.perspective[i][1] - this.topLeftR
            let col = this.perspective[i][2] - this.topLeftC

            this.colors[row][col] = color
        }
    }

    removeEventListeners() {
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
                    (gameAreaSize / this.colors[r].length) * c + this.offset + (gameAreaOffsetW / 2),
                    (gameAreaSize / this.colors.length) * r + this.offset + (gameAreaOffsetH / 2),
                    (gameAreaSize / this.colors.length) - (2 * this.offset),
                    (gameAreaSize / this.colors[r].length) - (2 * this.offset)
                )
            }
        }
    }

    handleKeyDown(e) {
        switch (e.key) {
            case "ArrowUp":
                this.controls.direction = 0
                this.sendKeyStatus()
                break
            case "ArrowRight":
                this.controls.direction = 1
                this.sendKeyStatus()
                break
            case "ArrowDown":
                this.controls.direction = 2
                this.sendKeyStatus()
                break
            case "ArrowLeft":
                this.controls.direction = 3
                this.sendKeyStatus()
                break
            case "q":
                if (!this.zoom.zIn) {
                    this.controls.zoom++
                    this.zoom.zIn = true
                    this.sendKeyStatus()
                }
                break
            case "w":
                if (!this.zoom.zOut) {
                    this.controls.zoom--
                    this.zoom.zOut = true
                    this.sendKeyStatus()
                }
                break
            case " ":
                this.controls.isSprinting = true
                this.sendKeyStatus()
                break
        }
    }

    handleKeyUp(e) {
        switch (e.key) {
            case " ":
                this.controls.isSprinting = false
                this.sendKeyStatus()
                break
            case "q":
                this.zoom.zIn = false
                break
            case "w":
                this.zoom.zOut = false
                break
        }

    }

    sendKeyStatus() {
        let bytearray = new Uint8Array(3);
        bytearray[0] = this.controls.direction
        bytearray[1] = this.controls.zoom
        bytearray[2] = this.controls.isSprinting ? 1 : 0 // TODO current required?
        console.log(bytearray)
        this.socket.send(bytearray.buffer)
    }

    render() {
        super.getContext().clearRect(0, 0, super.getContext().canvas.width, super.getContext().canvas.height)
        this.drawColors()
    }
}