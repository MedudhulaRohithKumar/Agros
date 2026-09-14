from mangum import Mangum
from app.main import app

# AWS Lambda Handler using Mangum ASGI adapter
# Supports AWS API Gateway REST API, HTTP API (v2), and Lambda Function URLs
handler = Mangum(app, lifespan="auto")
