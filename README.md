## Prometheus, Grafana, and Loki: Building a Central Monitoring System

This project demonstrates how to set up a comprehensive monitoring and observability stack using three powerful open-source tools:

### Components

- **Prometheus**: An open-source monitoring and alerting toolkit designed for reliability and scalability.

     - Collects and stores metrics as time-series data
     - Features a flexible query language (PromQL)
     - Supports multiple modes of graphing and dashboarding

- **Grafana**: A multi-platform open-source analytics and interactive visualization web application.

     - Creates customizable dashboards
     - Visualizes metrics from various data sources
     - Provides alerting capabilities

- **Loki**: A horizontally scalable, highly available log aggregation system.
     - Designed to be cost-effective
     - Uses labels for indexing (similar to Prometheus)
     - Doesn't index the contents of logs

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
