import express from 'express'
import { slowTask } from './tasks.js'
import { logger } from './logger.js'
import client, { register } from 'prom-client'

const app = express()
const PORT = process.env.PORT || 8000

const collectDefaultMetrics = client.collectDefaultMetrics

// collects metrics like event loop lags, heap usage, RAM and CPU usage
collectDefaultMetrics({ register: client.register })

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

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType)
    const metrics = await client.register.metrics()
    res.send(metrics)
})

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`)
})
