(function() {
    const STAT_UPDATE_DELAY = 100 // milliseconds

    let canvas, ctx
    let players, player
    let width, height
    let keys
    let lastTick
    let deltaTime
    let dtSpan, xSpan, ySpan, vxSpan, vySpan, rotSpan, rotvSpan, playercountSpan

    const socket = io()
    delete io

    function init() {
        dtSpan = document.getElementById("dt")
        xSpan = document.getElementById("x")
        ySpan = document.getElementById("y")
        vxSpan = document.getElementById("vx")
        vySpan = document.getElementById("vy")
        rotSpan = document.getElementById("rot")
        rotvSpan = document.getElementById("rotv")
        playercountSpan = document.getElementById("playercount")

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
        socket.emit("client info", player.condense(), id => players[id] = player)

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

        window.setInterval(() => {
            dtSpan.innerHTML = deltaTime * 1000
            xSpan.innerHTML = Math.round(player.pos.x * 100) / 100
            ySpan.innerHTML = Math.round(player.pos.y * 100) / 100
            vxSpan.innerHTML = Math.round(player.vel.x * 100) / 100
            vySpan.innerHTML = Math.round(player.vel.y * 100) / 100
            rotSpan.innerHTML = Math.round(player.direction * 100) / 100
            rotvSpan.innerHTML = Math.round(player.rotVel * 100) / 100
            playercountSpan.innerHTML = Object.keys(players).length
        }, STAT_UPDATE_DELAY)

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
                    players[id].pos.x = serverPlayer.x
                    players[id].pos.y = serverPlayer.y
                    players[id].direction = serverPlayer.direction
                }
            }
        }
    }

    function render() {
        ctx.clearRect(0, 0, width, height)

        for (let id in players) {
            if (players.hasOwnProperty(id)) {
                players[id].render(ctx)
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
        if (keys["ArrowRight"]) {
            player.right()
            socket.emit("right")
        }

        if (keys["ArrowLeft"]) {
            player.left()
            socket.emit("left")
        }

        if (keys["ArrowUp"]) {
            player.accelerate()
            socket.emit("accel")
        }
    }

    init()
})()