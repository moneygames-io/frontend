import Canvasobject from './canvasobject.js'

export default class Minimap extends Canvasobject {
    constructor() {
        super('minimap')
    }

    setMinimap(data) {
        this.data = data
        window.requestAnimationFrame(this.render.bind(this))
    }

    toHexString(n) {
        if (n < 0) {
            n = 0xFFFFFFFF + n + 1
        }
        return "#" + ("000000" + n.toString(16).toUpperCase()).substr(-6)
    }

    render() {
        super.getContext().clearRect(0, 0, super.getContext().canvas.width, super.getContext().canvas.height)
        let canvasWidth = super.getContext().canvas.width
        let canvasHeight = super.getContext().canvas.height
        let gameAreaSize = Math.min(canvasWidth, canvasHeight)
        let map = this.data.Minimap
        let rows = this.data.Rows
        let cols = this.data.Cols

        for (let datum in map) {
            super.getContext().fillStyle = this.toHexString(map[datum].Color)
            super.getContext().fillRect(
                (gameAreaSize / rows) * map[datum].Row,
                (gameAreaSize / cols) * map[datum].Col,
                (gameAreaSize / rows),
                (gameAreaSize / cols)
            )
        }
    }
}