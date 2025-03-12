const random = (min, max, float = false) => {
    const val = Math.random() * (max - min) + min;
    if (float) return val;
    return Math.floor(val)
}

const degreesToRadians = (degrees) => {
    return degrees * (Math.PI / 180);
}

const lerp = (t, a1, b1, a2, b2) => {
    return a2 + (b2 - a2) * (t - a1)/(b1 - a1);
}