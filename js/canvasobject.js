export default class Canvasobject {
    constructor(el) {
        this.canvas = this.createCanvas()
        document.getElementById(el).appendChild(this.canvas)
        this.fixDPI()

        this.context = this.canvas.getContext('2d')
        window.addEventListener("resize", this.resize.bind(this))
    }

    createCanvas() {
        let canv = document.createElement('canvas')
        canv.id = "canv"

        window.addEventListener('resize', this.fixDPI.bind(this), false)
        return canv
    }

    height() {
        return +getComputedStyle(this.canvas).getPropertyValue('height').slice(0, -2)
    }

    width() {
        return +getComputedStyle(this.canvas).getPropertyValue('width').slice(0, -2)
    }

    getCanvas() {
        return this.canvas
    }

    getContext() {
        return this.context
    }

    resize() {
        this.fixDPI()
        this.render()
    }

    render() {
        console.log("render")
    }

    fixDPI() {
        let dpi = window.devicePixelRatio

        this.canvas.setAttribute('width', this.width() * dpi)
        this.canvas.setAttribute('height', this.height() * dpi)
    }

    destroyCanvas() {
        this.canvas.remove()
    }
}
