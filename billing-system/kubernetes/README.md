# Agros Billing System - EKS Deployment Guide

## Prerequisites
1. AWS CLI installed and configured.
2. `eksctl` and `kubectl` installed.
3. Access to an AWS EKS Cluster.
4. AWS ECR Repositories created for `agros-backend` and `agros-frontend`.

## Step 1: Build and Push Docker Images
Run these commands from the root director of the project (`billing-system`):

### Authenticate Docker to AWS ECR
```bash
aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com
```

### Build and Push Backend
```bash
docker build -t agros-backend ./backend
docker tag agros-backend:latest <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/agros-backend:latest
docker push <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/agros-backend:latest
```

### Build and Push Frontend
```bash
docker build -t agros-frontend ./frontend
docker tag agros-frontend:latest <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/agros-frontend:latest
docker push <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/agros-frontend:latest
```

## Step 2: Update Manifests
Update `kubernetes/backend-deployment.yaml` and `kubernetes/frontend-deployment.yaml` and replace `your-ecr-repo/agros-xxx:latest` with the actual ECR URI of your images.

## Step 3: Deploy to EKS
Run the following commands to apply the configurations:
```bash
kubectl apply -f kubernetes/mysql-deployment.yaml
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml
```

## Step 4: Access the Application
The `frontend-service` is exposed as an AWS Network Load Balancer (NLB). Retrieve the external DNS of the load balancer:
```bash
kubectl get svc frontend-service
```
Copy the `EXTERNAL-IP` value and paste it into your browser.
