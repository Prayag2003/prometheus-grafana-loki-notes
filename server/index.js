import express from 'express'
import { slowTask } from './tasks.js'
import { logger } from './logger.js'

const app = express()
const PORT = process.env.PORT || 8000

app.get('/', (req, res) => {
    logger.info('GET request to root endpoint')
    res.json({ message: 'Hello World' })
})

app.get('/slow', async (req, res) => {
    logger.info('GET request to /slow endpoint')
    try {
        const timeTaken = await slowTask()
        logger.info(`Slow task completed in ${timeTaken}ms`)
        res.json({
            status: 'Success',
            message: `Heavy task completed in ${timeTaken}ms`
        })
    }
    catch (error) {
        logger.error('Error in slow task', { error: error.message })
        res.json({
            status: 'Error',
            error: error.message
        })
    }
})

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`)
})
