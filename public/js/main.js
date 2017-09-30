(function() {
    const STAT_UPDATE_DELAY = 100 // milliseconds

    let canvas, ctx
    let players, player
    let clientID
    let width, height
    let keys, orientation
    let lastTick
    let deltaTime
    let dtSpan, xSpan, ySpan, vxSpan, vySpan,
        rotSpan, rotvSpan, playercountSpan,
        betaSpan, gammaSpan

    const socket = io()
    delete io

    function init() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", evt => {
                orientation = {
                    gamma: evt.gamma,
                    beta: evt.beta
                }
            }, true)
        }

        dtSpan = document.getElementById("dt")
        xSpan = document.getElementById("x")
        ySpan = document.getElementById("y")
        vxSpan = document.getElementById("vx")
        vySpan = document.getElementById("vy")
        rotSpan = document.getElementById("rot")
        rotvSpan = document.getElementById("rotv")
        playercountSpan = document.getElementById("playercount")
        betaSpan = document.getElementById("beta")
        gammaSpan = document.getElementById("gamma")

        canvas = document.getElementById("game")
        ctx = canvas.getContext("2d")

        // Make the stage render properly on HiDPI displays
        {
            const dpr = window.devicePixelRatio || 1
            height = canvas.height
            width = canvas.width

            canvas.width = Math.round(width * dpr)
            canvas.height = Math.round(height * dpr)

            canvas.style.width = width + "px"
            canvas.style.height = height + "px"

            ctx.scale(dpr, dpr)
        }

        players = {}

        player = new Player("anon", 256, 256)

        console.log("Sending client info...")
        socket.emit("client info", player.condense(), id => {
            players[id] = player
            clientID = id
        })

        socket.on("tick", onTick)

        socket.on("disconnect", id => {
            delete players[id]
        })

        keys = {}

        document.addEventListener("keydown", evt => {
            keys[evt.key] = true
        })

        document.addEventListener("keyup", evt => {
            delete keys[evt.key]
        })

        document.getElementById("name-form").addEventListener("submit", evt => {
            let name = document.getElementById("change-name-input").value.trim()

            if (name.length >= 1 || name.length >= 32) {
                players[clientID].name = name
            }

            socket.emit("info update", player.condense())

            evt.preventDefault()

            return false
        })

        window.setInterval(() => {
            dtSpan.innerHTML = deltaTime * 1000
            xSpan.innerHTML = round(player.pos.x, 2)
            ySpan.innerHTML = round(player.pos.y, 2)
            vxSpan.innerHTML = round(player.vel.x, 2)
            vySpan.innerHTML = round(player.vel.y, 2)
            rotSpan.innerHTML = round(player.direction, 2)
            rotvSpan.innerHTML = round(player.rotVel, 2)
            playercountSpan.innerHTML = Object.keys(players).length

            if (orientation !== undefined && orientation.gamma !== null && orientation.beta !== null) {
                betaSpan.innerHTML = round(orientation.beta, 2)
                gammaSpan.innerHTML = round(orientation.gamma, 2)
            }
        }, STAT_UPDATE_DELAY)

        window.setTimeout(() => {
            writeInstructions()
        }, STAT_UPDATE_DELAY * 2)

        lastTick = new Date().getTime()
        update()
    }

    function onTick(serverPlayers) {
        for (let id in serverPlayers) {
            if (serverPlayers.hasOwnProperty(id)) {
                let serverPlayer = serverPlayers[id];
                
                if (players[id] === undefined) {
                    players[id] = new Player(serverPlayer.name, serverPlayer.x, serverPlayer.y)
                } else {
                    players[id].name = serverPlayer.name
                    players[id].pos.x = lerp(players[id].pos.x, serverPlayer.x, 0.5)
                    players[id].pos.y = lerp(players[id].pos.y, serverPlayer.y, 0.5)
                    players[id].direction = lerp(players[id].direction, serverPlayer.direction, 0.5)
                }
            }
        }
    }

    function render() {
        ctx.clearRect(0, 0, width, height)

        for (let id in players) {
            if (players.hasOwnProperty(id)) {
                if (id === clientID) {
                    ctx.fillStyle = "black"
                }

                players[id].render(ctx)

                if (id === clientID) {
                    ctx.fillStyle = "darkgrey"
                }
            }
        }
    }

    function update() {
        let time = new Date().getTime()
        deltaTime = (time - lastTick) / 1000
        lastTick = time

        handleInput()

        for (let id in players) {
            if (players.hasOwnProperty(id)) {
                players[id].update(deltaTime)
            }
        }

        render()

        requestAnimationFrame(update)
    }

    function handleInput() {
        let shouldMove = {
            left: false,
            right: false,
            forward: false
        }

        // If on a mobile device
        if (orientation !== undefined && orientation.gamma !== null && orientation.beta !== null) {
            if (orientation.gamma < -5) {
                shouldMove.left = true
            }
            
            if (orientation.gamma > 5) {
                shouldMove.right = true
            }
    
            if (orientation.beta < -1) {
                shouldMove.forward = true
            }
        } else {
            if (keys.ArrowRight) {
                shouldMove.right = true
            }
    
            if (keys.ArrowLeft) {
                shouldMove.left = true
            }
    
            if (keys.ArrowUp) {
                shouldMove.forward = true
            }
        }

        if (shouldMove.left) {
            left()
        }

        if (shouldMove.right) {
            right()
        }

        if (shouldMove.forward) {
            accel()
        }
    }

    function accel() {
        player.accelerate()
        socket.emit("accel")
    }

    function left() {
        player.left()
        socket.emit("left")
    }

    function right() {
        player.right()
        socket.emit("right")
    }

    function writeInstructions() {
        const elem = document.getElementById("instructions")

        if (orientation !== undefined && orientation.gamma !== null && orientation.beta !== null) {
            elem.innerHTML = "Tilt your device forwards to move forwards, and roll it to the sides to turn."
        } else {
            elem.innerHTML = "Use the arrow keys to move around."
        }
    }

    init()
})()