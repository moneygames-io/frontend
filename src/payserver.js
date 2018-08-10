import Canvasobject from './canvasobject.js'

export default class Matchmaker extends Canvasobject {

    constructor(matchmakingURL, gameserverCallback) {
        super();
        this.url = matchmakingURL;
        this.gameserverCallback = gameserverCallback;
        this.progress = 0;
    }

    getBitcoinAddress() {
        this.socket = new WebSocket(this.url);
        this.socket.onmessage = this.matchmakingMessage.bind(this);
    }

    matchmakingMessage(e) {
        let data = JSON.parse(e.data);
        console.log(data);
        super.getContext().clearRect(0, 0, super.getContext().canvas.width, super.getContext().canvas.height)
        // Name abbreviated for the sake of these examples her
        var i = qrcodegen;
        console.log(i);
        var j = qrcodegen.qrcode;
        console.log(j);
        var ecl = qrcodegen.QrCode.Ecc.HIGH;
    	var text = "Bitcoin Address";
    	var segs = qrcodegen.QrSegment.makeSegments(text);
    	var minVer = 1;
    	var maxVer = 40;
    	var mask = -1;
    	var boostEcc = false;
        var scale = 4;
        var border = 4;
    	var qr = qrcodegen.QrCode.encodeSegments(segs, ecl, minVer, maxVer, mask, boostEcc);
        qr.drawCanvas(scale, border, canvas);
    }

}
