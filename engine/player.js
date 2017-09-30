"use strict";

const PLAYER_SIDELENGTH = 15
const PLAYER_ACCEL = 0.15
const PLAYER_SLOWDOWN = 0.9
const PLAYER_ROT_SLOWDOWN = 0.85
const PLAYER_ROTACCEL = 0.005

class Player {
    constructor(name, x, y) {
        this.name = name
        
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
    
        ctx.fillRect(
            -PLAYER_SIDELENGTH / 2,
            -PLAYER_SIDELENGTH / 2,
            PLAYER_SIDELENGTH,
            PLAYER_SIDELENGTH
        )
    
        ctx.restore()

        ctx.font = "monospace"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(this.name, this.pos.x, this.pos.y + PLAYER_SIDELENGTH)
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
            name: this.name
        }
    }
}

if (typeof exports !== "undefined") {
    if (typeof module !== "undefined" && module.exports) {
        exports = module.exports = Player
    }

    exports.Player = Player
}