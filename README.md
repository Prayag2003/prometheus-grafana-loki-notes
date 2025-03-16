# Prometheus, Grafana, and Loki: Building a Central Monitoring System

![alt text](images/image-20.png)

## Contents

- [Introduction](#introduction)
- [Components](#components) - [Prometheus](#prometheus) - [Grafana](#grafana) - [Loki](#loki)
- [Architecture Overview](#architecture-overview)
- [Setup](#setup) - [1. Install Prometheus Client](#1-install-prometheus-client) - [2. Initiate the Client](#2-initiate-the-client) - [3. Create a Route to Expose Metrics](#3-create-a-route-to-expose-metrics) - [4. Run the Server](#4-run-the-server) - [5. Run the Prometheus Server](#5-run-the-prometheus-server) - [6. Create a Docker Compose File](#6-create-a-docker-compose-file) - [7. Set up Grafana with Prometheus](#7-set-up-grafana-with-prometheus)
- [Add Your Custom Metrics](#add-your-custom-metrics)
- [Grafana Loki](#grafana-loki) - [Configure Logging Levels](#configure-logging-levels) - [Add Info and Error Logs to the Grafana Dashboard](#add-info-and-error-logs-to-the-grafana-dashboard)

## Introduction

This project demonstrates how to set up a comprehensive monitoring and observability stack using three powerful open-source tools: Prometheus, Grafana, and Loki.

# Components

## Prometheus

Prometheus is an open-source monitoring and alerting toolkit designed for reliability and scalability.

- Collects and stores metrics as time-series data
- Features a flexible query language (PromQL)
- Supports multiple modes of graphing and dashboarding

## Grafana

Grafana is a multi-platform open-source analytics and interactive visualization web application.

- Creates customizable dashboards
- Visualizes metrics from various data sources
- Provides alerting capabilities

## Loki

Loki is a horizontally scalable, highly available log aggregation system.

- Designed to be cost-effective
- Uses labels for indexing (similar to Prometheus)
- Doesn't index the contents of logs

## Architecture Overview

### Monitoring = Metrics + Logs + Alerts

This project demonstrates how to set up a comprehensive monitoring and observability stack using three powerful open-source tools:

- **Prometheus**: An open-source monitoring and alerting toolkit designed for reliability and scalability. - Collects and stores metrics as time-series data - Features a flexible query language (PromQL) - Supports multiple modes of graphing and dashboarding

- **Grafana**: A multi-platform open-source analytics and interactive visualization web application. - Creates customizable dashboards - Visualizes metrics from various data sources - Provides alerting capabilities

- **Loki**: A horizontally scalable, highly available log aggregation system. - Designed to be cost-effective - Uses labels for indexing (similar to Prometheus) - Doesn't index the contents of logs

### Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Applications │────►│ Prometheus/ │────►│   Grafana   │
│ & Services   │     │    Loki     │     │ Dashboards  │
└─────────────┘     └─────────────┘     └─────────────┘
                                                                                                                                 Expose          Collect and         Visualize and
                                                                                                                                 Metrics         Store Data          Alert
```

This stack provides a complete observability solution, capturing both metrics and logs for comprehensive system monitoring.

## Setup

### 1. Install Prometheus Client

```bash
npm i prom-client
```

### 2. Initiate the Client

```javascript
const client = require("prom-client");

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });
```

### 3. Create a Route to Expose Metrics

```javascript
app.get("/metrics", (req, res) => {
	res.set("Content-Type", client.register.contentType);
	res.end(client.register.metrics());
});
```

### 4. Run the Server

```bash
npm run dev
```

![alt text](images/image.png)
![alt text](images/image2.png)

### 5. Run the Prometheus Server

- Pull the logs from localhost:8000/metrics every 5 seconds

```bash
touch prometheus.yml
```

- Search your PRIVATE IP by running:

```bash
ifconfig # linux/mac
ipconfig # windows
```

```yml
global:
        scrape_interval: 5s

scrape_configs:
        - job_name: "prometheus"
                static_configs:
                        - targets: ["<PRIVATE_IP>:8000"]
```

### 6. Create a Docker Compose File

```yml
version: "3.7"

services:
        prom-server:
                image: prom/prometheus
                volumes:
                        - ./prometheus.yml:/etc/prometheus/prometheus.yml
                ports:
                        - 9090:9090
```

```bash
docker-compose up
```

![alt text](images/image4.png)

Visit the Prometheus dashboard at:

```bash
localhost:9090
```

![alt text](images/image5.png)

Hit as many requests as you can to see the metrics increasing in 5-10 seconds.
The CPU User seconds increases suddenly.
![alt text](images/image6.png)

As time passes, it becomes less steep since no new requests are being made.
![alt text](images/image7.png)

### 7. Set up Grafana with Prometheus

1. Start Grafana.

```bash
docker run -d -p 3000:3000 --name=grafana_dashboard grafana/grafana-oss
```

2. Login to Grafana - Open your browser and go to `http://localhost:3000` - Use `admin` for both username and password - You'll be prompted to change the password on first login

3. Connect Prometheus as a data source - Click on "Create your first dashboard" - Select "Add a new Data Source" - Choose "Prometheus" - Enter your Prometheus server URL (`http://<PRIVATE_IP>:9090`) - Save and test the connection

4. Create your first dashboard - Click "Create Dashboard" - Add panels to visualize your metrics

![alt text](images/image10.png)

- Using Gauge
  ![alt text](images/image11.png)

- Import Ready made Grafana Dashboard from https://grafana.com/grafana/dashboards/11159-nodejs-application-dashboard/

![alt text](images/image12.png)

# Dashboard for Node.js Application

![alt text](images/image13.png)
![alt text](image.png)

## Add Your Custom Metrics

First, install the `response-time` package:

```bash
npm install response-time
```

Next, add custom requests for tracking HTTP request duration and total number of HTTP requests:

```javascript
const responseTime = require("response-time");
const client = require("prom-client");

const reqResTime = new client.Histogram({
	name: "http_req_res_duration_seconds",
	help: "Duration of HTTP requests in seconds",
	labelNames: ["method", "route", "status_code"],
	buckets: [0.1, 0.5, 1, 50, 100, 200, 500, 800, 1000, 2000],
});

const totalReqCounter = new client.Counter({
	name: "http_requests_total",
	help: "Total number of HTTP requests",
	labelNames: ["method", "route", "status_code"],
});

app.use(
	responseTime((req, res, time) => {
		totalReqCounter.inc();
		reqResTime
			.labels({
				method: req.method,
				route: req.url,
				status_code: res.statusCode,
			})
			.observe(time);
	})
);
```

![alt text](images/image-14.png)

## Grafana Loki

To push logs to the Loki server, run the following command:

```bash
docker run -d -p 3100:3100 --name=loki grafana/loki
```

Install the necessary packages:

```bash
npm i winston winston-loki
```

### Configure Logging Levels

![alt text](images/image-15.png)

### For "info" level logs:

![alt text](images/image-16.png)

### For "error" level logs:

![alt text](images/image-17.png)
![alt text](images/image-18.png)

## Add Info and Error Logs to the Grafana Dashboard

![alt text](images/image-19.png)
