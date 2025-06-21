#!/bin/bash

# Deployment script for Prescription System
# Usage: ./deploy.sh [environment]
# Environment: dev, prod (default: prod)

set -e

ENVIRONMENT=${1:-prod}
VM_HOST="4.213.115.214"
VM_USER="azureuser"
SSH_KEY="HealthSync_key.pem"
APP_DIR="prescription-app"

echo "🚀 Deploying Prescription System to $ENVIRONMENT environment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    print_error "SSH key $SSH_KEY not found!"
    print_warning "Please ensure your SSH key is in the current directory"
    exit 1
fi

# Check if we can connect to the VM
print_status "Checking VM connectivity..."
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o BatchMode=yes "$VM_USER@$VM_HOST" exit 2>/dev/null; then
    print_error "Cannot connect to VM at $VM_HOST"
    print_warning "Please check your SSH key and VM status"
    exit 1
fi
print_success "VM connectivity verified"

# Function to execute commands on VM
execute_remote() {
    ssh -i "$SSH_KEY" "$VM_USER@$VM_HOST" "$1"
}

# Function to copy files to VM
copy_to_vm() {
    scp -i "$SSH_KEY" "$1" "$VM_USER@$VM_HOST:$2"
}

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if required files exist locally
required_files=(
    "docker-compose.prod.yml"
    "Backend/Dockerfile"
    "Frontend/Dockerfile"
    "Frontend/nginx.conf"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file $file not found!"
        exit 1
    fi
done
print_success "All required files found"

# Create application directory on VM
print_status "Setting up application directory on VM..."
execute_remote "mkdir -p ~/$APP_DIR/{logs,backups,config}"

# Stop existing application
print_status "Stopping existing application..."
execute_remote "cd ~/$APP_DIR && docker-compose -f docker-compose.prod.yml down || true" || print_warning "No existing application to stop"

# Copy configuration files
print_status "Copying configuration files..."
copy_to_vm "docker-compose.prod.yml" "~/$APP_DIR/"

# Copy environment file if it exists
if [ -f ".env" ]; then
    copy_to_vm ".env" "~/$APP_DIR/"
    print_success "Environment file copied"
else
    print_warning ".env file not found, using default values"
fi

# Build and deploy based on strategy
if [ "$ENVIRONMENT" = "dev" ]; then
    print_status "Building application locally..."
    
    # Copy source code for local build
    print_status "Copying source code..."
    execute_remote "rm -rf ~/$APP_DIR/Backend ~/$APP_DIR/Frontend"
    scp -i "$SSH_KEY" -r Backend "$VM_USER@$VM_HOST:~/$APP_DIR/"
    scp -i "$SSH_KEY" -r Frontend "$VM_USER@$VM_HOST:~/$APP_DIR/"
    
    # Build and start application
    print_status "Building and starting application..."
    execute_remote "cd ~/$APP_DIR && docker-compose -f docker-compose.prod.yml up -d --build"
    
else
    print_status "Using production deployment strategy..."
    
    # For production, we expect images to be built by CI/CD
    # Just start the application with existing/pulled images
    execute_remote "cd ~/$APP_DIR && docker-compose -f docker-compose.prod.yml pull || true"
    execute_remote "cd ~/$APP_DIR && docker-compose -f docker-compose.prod.yml up -d"
fi

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Health checks
print_status "Running health checks..."

# Check if containers are running
CONTAINER_STATUS=$(execute_remote "cd ~/$APP_DIR && docker-compose -f docker-compose.prod.yml ps --format table")
echo "$CONTAINER_STATUS"

# Check application health
print_status "Checking application health..."


# Frontend health check
if execute_remote "curl -f -s http://localhost > /dev/null 2>&1"; then
    print_success "Frontend is healthy"
else
    print_warning "Frontend health check failed"
fi

# Backend health check
if execute_remote "curl -f -s http://localhost:8080/api/actuator/health > /dev/null 2>&1"; then
    print_success "Backend is healthy"
else
    print_warning "Backend health check failed"
fi

# Database health check
if execute_remote "cd ~/$APP_DIR && docker-compose -f docker-compose.prod.yml exec -T database pg_isready -U prescription_user > /dev/null 2>&1"; then
    print_success "Database is healthy"
else
    print_warning "Database health check failed"
fi

# Show recent logs
print_status "Recent application logs:"
execute_remote "cd ~/$APP_DIR && docker-compose -f docker-compose.prod.yml logs --tail=10"

# Final status
print_success "Deployment completed!"
echo
echo "📊 Application Status:"
echo "🌐 Frontend: http://$VM_HOST"
echo "🔧 Backend API: http://$VM_HOST/api"
echo "📋 Health Check: http://$VM_HOST/api/actuator/health"
echo
echo "📝 Useful commands:"
echo "  Monitor logs: ssh -i $SSH_KEY $VM_USER@$VM_HOST 'cd ~/$APP_DIR && docker-compose -f docker-compose.prod.yml logs -f'"
echo "  Check status: ssh -i $SSH_KEY $VM_USER@$VM_HOST 'cd ~/$APP_DIR && ./monitor.sh'"
echo "  Restart app: ssh -i $SSH_KEY $VM_USER@$VM_HOST 'cd ~/$APP_DIR && docker-compose -f docker-compose.prod.yml restart'"
echo

# Post-deployment tasks
print_status "Running post-deployment tasks..."

# Set up monitoring cron job if not exists
execute_remote "
cd ~/$APP_DIR
if ! crontab -l 2>/dev/null | grep -q 'monitor.sh'; then
    (crontab -l 2>/dev/null; echo '*/5 * * * * /home/$VM_USER/$APP_DIR/monitor.sh >> /home/$VM_USER/$APP_DIR/logs/monitor.log 2>&1') | crontab -
    echo 'Monitoring cron job added'
fi
"

print_success "Deployment process completed successfully! 🎉"
