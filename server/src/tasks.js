const getRandomValue = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)]
}

export const slowTask = () => {
    const ms = getRandomValue([100, 150, 200, 250, 300, 500, 1000, 1500, 2000, 3000])
    const shouldThrowError = getRandomValue([1, 2, 3, 4, 5, 6]) === 6
    if (shouldThrowError) {
        const randomError = getRandomValue([
            "Server Down",
            "Network Error",
            "Database Error",
            "Internal Server Error",
            "Gateway Timeout",
            "Bad Gateway"
        ]);
        throw new Error(randomError)
    }
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(ms)
        })
    })
}