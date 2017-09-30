const PORT = process.env.PORT || 3030

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

        callback(id)
    })

    // removes a player from the server
    socket.on("disconnect", () => {
        delete players[id]

        io.emit("disconnect", id)
    })

    socket.on("accel", () => {
        players[id].accelerate()
    })

    socket.on("left", () => {
        players[id].left()
    })

    socket.on("right", () => {
        players[id].right()
    })

    socket.on("pong", callback => {
        console.log(callback);
        callback()
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