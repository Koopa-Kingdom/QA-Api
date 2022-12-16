# QA-Api
API Router and Database built using speed-oriented architecture

## Technology used
Node.js, Express, postgreSQL, jest, AWS EC2, and NGINX

## Major project Points
- Improved request throughput of existing service  to upward of 1000 requests/sec by implementing NGINX load balancers to horizontally - scale server requests to the AWS EC2 instances
- Lowered Query execution time from over 20s down to under 50ms execution time in PostgreSQL by implementing aggregate subqueries, and foreign key indexes
- Decreased Stress Testing cycle length by using Loader.io to identify and revise bottlenecks
