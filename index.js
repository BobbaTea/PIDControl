

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

var target = {
    x: 0,
    y: 0
}

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

addEventListener('mousemove', (event) => {
    mouse.x = event.clientX
    mouse.y = event.clientY
    controllerx.target = mouse.x
    controllery.target = mouse.y

})

addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight
    init()
})

class Arrow {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.xvel = 0
        this.yvel = 0
        this.xacc = 0
        this.yacc = 0
        this.angle = 0
        this.icon = new Image();
        this.icon.src = "arrowsmall.png";
    }

    draw() {
        var a = (canvas.width * canvas.height) * 0.0006
        var scale = Math.sqrt(a / (this.icon.width * this.icon.height))
        c.save()
        c.translate(this.x, this.y);
        c.rotate(this.angle)
        c.drawImage(this.icon, -this.icon.height * scale / 2, -this.icon.width * scale / 2, this.icon.width * scale, this.icon.height * scale)
        c.restore()
    }

    set setXacc(acc) {
        this.xacc = acc
    }

    set setYacc(acc) {
        this.yacc = acc
    }

    update() {
        this.xvel += this.xacc
        this.yvel += this.yacc
        this.x += this.xvel
        this.y += this.yvel
        console.log("xAcc: " + this.xacc + " xVel: " + this.xvel)
        if (this.yvel >= 0) {
            if (this.xvel >= 0) {
                this.angle = Math.atan(this.yvel / this.xvel)
            } else {
                this.angle = Math.PI + Math.atan(this.yvel / this.xvel)
            }
        } else {
            if (this.xvel >= 0) {
                this.angle = (2 * Math.PI) + Math.atan(this.yvel / this.xvel)
            } else {
                this.angle = Math.PI + Math.atan(this.yvel / this.xvel)
            }
        }
        this.angle -= 3 * Math.PI / 2
        this.draw()
    }
}

class PID {
    constructor(pGain, iGain, dGain) {
        this.pGain = pGain
        this.iGain = iGain
        this.dGain = dGain

        this.pError = 0
        this.iError = 0
        this.dError = 0

        this.netError = 0

        this.target = 0
        this.current = 0
        this.past = 0
        this.integrator = 0
    }

    run() {
        this.calcPError()
        this.calcIError()
        this.calcDError()
        this.netError = this.pError + this.iError + this.dError

        console.log("Target: " + this.target + " | Current: " + this.current.toFixed(3) + "\tP: " + this.pError.toFixed(3) + " I: " + this.iError.toFixed(3) + " D: " + this.dError.toFixed(3) + " Net: " + this.netError.toFixed(3))
        // this.past = this.current
        return this.netError
    }

    set currentVal(val) {
        this.past = this.current
        this.current = val
    }

    calcPError() {
        this.pError = (this.target - this.current) * this.pGain
    }

    calcIError() {
        this.integrator += (this.current - this.target)
        if (this.current >= this.target && this.past <= this.target) {
            this.integrator = 0
        } else if (this.current < this.target && this.past > this.target) {
            this.integrator = 0
        }
        this.iError = -this.iGain * this.integrator
    }

    calcDError() {
        this.dError = -(this.current - this.past) * this.dGain
    }

}
var main = new Arrow(200, 300)
var controllerx = new PID(0.006, 0.0001, 0.16)
var controllery = new PID(0.006, 0.0001, 0.16)

function init() {
    controllerx.target = 300
    controllery.target = 300

}

function animate() {
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    controllerx.currentVal = main.x
    main.xvel += controllerx.run()
    main.update()
    c.beginPath();
    c.moveTo(controllerx.target, -5);
    c.lineTo(controllerx.target, canvas.height + 5);
    c.stroke();
    c.closePath()
    controllery.currentVal = main.y
    main.yvel += controllery.run()
    main.update()
    c.beginPath();
    c.moveTo(-5, controllery.target);
    c.lineTo(canvas.width + 5, controllery.target);
    c.stroke();
    c.closePath()


    // objects.forEach(object => {
    //  object.update()
    // })
}

init()
animate()