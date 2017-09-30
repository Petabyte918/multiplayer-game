"use strict";

const PLAYER_SIDELENGTH = 15
const PLAYER_ACCEL = 0.15
const PLAYER_SLOWDOWN = 0.9
const PLAYER_ROT_SLOWDOWN = 0.85
const PLAYER_ROTACCEL = 0.005

/*
Possible shapes:

 - square
 - triangle
 - circle
 - star
*/

class Player {
    constructor(name, x, y) {
        this.name = name
        this.shape = "square"
        
        this.pos = {
            x: x,
            y: y
        }
    
        this.vel = {
            x: 0,
            y: 0
        }
    
        this.direction = 0
        this.rotVel = 0
    }

    render(ctx) {
        ctx.save()
        
        ctx.translate(this.pos.x, this.pos.y)
        ctx.rotate(this.direction)
        ctx.beginPath()
    
        switch (this.shape) {
            case "triangle":
                ctx.rotate(Math.PI / 2)
                ctx.moveTo(-PLAYER_SIDELENGTH / 2, PLAYER_SIDELENGTH / 2)
                ctx.lineTo(PLAYER_SIDELENGTH / 2, PLAYER_SIDELENGTH / 2)
                ctx.lineTo(0, -PLAYER_SIDELENGTH / 1.5)
                ctx.lineTo(-PLAYER_SIDELENGTH / 2, PLAYER_SIDELENGTH / 2)

                break

            case "circle":
                ctx.arc(0, 0, PLAYER_SIDELENGTH * 0.7, 0, Math.PI * 2)

                break
                
            case "star":
                const n = 5
                const inset = PLAYER_SIDELENGTH / 8
                const r = PLAYER_SIDELENGTH / 2

                ctx.rotate(Math.PI / n + Math.PI / 2)

                for (let i = 0; i < 5; i++) {
                    ctx.rotate(Math.PI / 5)
                    ctx.lineTo(0, 0 - (r * inset))
                    ctx.rotate(Math.PI / 5)
                    ctx.lineTo(0, 0 - r)
                }

                break

            default:
                ctx.fillRect(
                    -PLAYER_SIDELENGTH / 2,
                    -PLAYER_SIDELENGTH / 2,
                    PLAYER_SIDELENGTH,
                    PLAYER_SIDELENGTH
                )
        }
    
        ctx.closePath()
        ctx.fill()
        ctx.restore()

        ctx.font = "monospace"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(this.name, this.pos.x, this.pos.y + PLAYER_SIDELENGTH + 5)
    }

    update(dt) {
        this.pos.x += this.vel.x
        this.pos.y += this.vel.y
    
        this.vel.x *= PLAYER_SLOWDOWN
        this.vel.y *= PLAYER_SLOWDOWN
    
        this.direction += this.rotVel
        this.rotVel *= PLAYER_ROT_SLOWDOWN
    }

    accelerate() {
        let normal = {
            x: Math.cos(this.direction) * PLAYER_ACCEL,
            y: Math.sin(this.direction) * PLAYER_ACCEL
        }
    
        this.vel.x += normal.x
        this.vel.y += normal.y
    }

    right() {
        this.rotVel += PLAYER_ROTACCEL
    }

    left() {
        this.rotVel -= PLAYER_ROTACCEL
    }

    condense() {
        return {
            x: this.pos.x,
            y: this.pos.y,
            direction: this.direction,
            name: this.name,
            shape: this.shape
        }
    }
}

if (typeof exports !== "undefined") {
    if (typeof module !== "undefined" && module.exports) {
        exports = module.exports = Player
    }

    exports.Player = Player
}