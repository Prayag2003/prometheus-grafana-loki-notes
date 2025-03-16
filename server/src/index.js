import express from 'express';
import { slowTask } from './tasks.js';
// import { logger } from './logger.js'
import client, { register } from 'prom-client';
import responseTime from "response-time";
import winston, { createLogger } from 'winston';
import LokiTransport from "winston-loki";
const options = {
    transports: [
        new LokiTransport({
            labels: {
                appName: "nodejs-logging-prometheus",
            },
            host: "http://127.0.0.1:3100",
            json: true,
            format: winston.format.json()
        })
    ]
};

const logger = createLogger(options);

const app = express()
const PORT = process.env.PORT || 8000

const collectDefaultMetrics = client.collectDefaultMetrics

// collects metrics like event loop lags, heap usage, RAM and CPU usage
collectDefaultMetrics({ register: client.register })

const reqResTime = new client.Histogram({
    name: 'http_req_res_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 50, 100, 200, 500, 800, 1000, 2000]
})

const totalReqCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
})

app.use(responseTime((req, res, time) => {
    totalReqCounter.inc()
    reqResTime.labels({
        method: req.method,
        route: req.url,
        status_code: res.statusCode
    }).observe(time)
}))

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
    logger.info('GET request to /metrics endpoint')
    res.set('Content-Type', register.contentType)
    const metrics = await client.register.metrics()
    res.send(metrics)
})

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`)
})
