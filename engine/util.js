function lerp(start, end, progress) {
    return (1 - progress) * start + progress * end
}

function round(n, decimals) {
    const mul = Math.pow(10, decimals)

    return Math.round(n * mul) / mul
}