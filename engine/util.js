function lerp(start, end, progress) {
    return (1 - progress) * start + progress * end
}

function round(n, decimals) {
    const mul = Math.pow(10, decimals)

    return Math.round(n * mul) / mul
}

function length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y)
}

function scale(v, s) {
    v.x *= s
    v.y *= s

    return v
}

function normalise(v) {
    let len = length(v)
    v.x /= len
    v.y /= len

    return v
}

function direction(a, b) {
    let dir = {
        x: b.x - a.x,
        y: b.y - a.y
    }

    return normalise(dir)
}