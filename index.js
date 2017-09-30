const PORT = process.env.PORT || 3030
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 800

const TICK_RATE = 15 // milliseconds
let lastTick = new Date().getTime()

let express = require("express")
let app = express()
let http = require("http").Server(app)
let io = require("socket.io")(http)

let Interval = require("Interval")

let Player = require("./engine/player.js").Player

let players = {}

app.use(express.static(__dirname + "/public"))
app.use(express.static(__dirname + "/engine"))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

io.on("connection", socket => {
    const id = socket.client.id

    // receives client info from the connected client and gives him his ID
    socket.on("client info", (player, callback) => {
        players[id] = new Player(player.name, player.x, player.y)
        players[id].shape = player.shape
        players[id].direction = -Math.PI / 2

        callback(id)
    })

    socket.on("info update", player => {
        players[id].name = player.name
        players[id].pos.x = player.x
        players[id].pos.y = player.y
        players[id].direction = player.direction
        players[id].shape = player.shape
    })

    // removes a player from the server
    socket.on("disconnect", () => {
        delete players[id]

        io.emit("disconnect", id)
    })

    socket.on("accel", () => {
        if (players[id] !== undefined) {
            players[id].accelerate()
        }
    })

    socket.on("left", () => {
        if (players[id] !== undefined) {
            players[id].left()
        }
    })

    socket.on("right", () => {
        if (players[id] !== undefined) {
            players[id].right()
        }
    })
})

function tick() {
    let time = new Date().getTime()
    let diff = (time - lastTick) / 1000
    lastTick = time

    condensed = {}

    for (let id in players) {
        if (players.hasOwnProperty(id)) {
            players[id].update(diff)       
            condensed[id] = players[id].condense()
        }
    }

    io.emit("tick", condensed)
}

Interval.run(tick, TICK_RATE)

http.listen(PORT, () => {
    console.log("listening on *:" + PORT)
})