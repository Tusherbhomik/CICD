#!/bin/bash

# Setup script for Azure VM
set -e

echo "🚀 Setting up Azure VM for Prescription System..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# Install required packages
echo "📦 Installing required packages..."
sudo apt-get install -y curl wget git unzip

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed successfully"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed successfully"
else
    echo "✅ Docker Compose already installed"
fi

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw --force enable

# Create application directory
echo "📁 Creating application directory..."
mkdir -p ~/prescription-app
cd ~/prescription-app

# Create necessary directories
mkdir -p logs backups

# Set up log rotation
echo "📋 Setting up log rotation..."
sudo tee /etc/logrotate.d/prescription-app > /dev/null << EOF
/home/azureuser/prescription-app/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 azureuser azureuser
}
EOF

# Create systemd service for auto-start
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/prescription-app.service > /dev/null << EOF
[Unit]
Description=Prescription System Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/azureuser/prescription-app
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0
User=azureuser
Group=docker

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable prescription-app.service

# Create monitoring script
echo "📊 Creating monitoring script..."
tee ~/prescription-app/monitor.sh > /dev/null << 'EOF'
#!/bin/bash
echo "=== Prescription System Status ==="
echo "Date: $(date)"
echo

echo "🐳 Docker Status:"
docker --version
echo

echo "📊 Running Containers:"
docker-compose -f docker-compose.prod.yml ps
echo

echo "💾 System Resources:"
echo "Memory Usage:"
free -h
echo
echo "Disk Usage:"
df -h /
echo

echo "🌐 Network Status:"
curl -s -o /dev/null -w "Frontend Health: %{http_code}\n" http://localhost || echo "Frontend: DOWN"
curl -s -o /dev/null -w "Backend Health: %{http_code}\n" http://localhost:8080/api/actuator/health || echo "Backend: DOWN"
echo

echo "📋 Recent Logs (last 10 lines):"
echo "--- Frontend Logs ---"
docker-compose -f docker-compose.prod.yml logs --tail=5 frontend
echo
echo "--- Backend Logs ---"
docker-compose -f docker-compose.prod.yml logs --tail=5 backend
echo
echo "--- Database Logs ---"
docker-compose -f docker-compose.prod.yml logs --tail=5 database
EOF

chmod +x ~/prescription-app/monitor.sh

# Create backup script
echo "💾 Creating backup script..."
tee ~/prescription-app/backup.sh > /dev/null << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/azureuser/prescription-app/backups"
DATE=$(date +"%Y%m%d_%H%M%S")

echo "📦 Creating backup: $DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
echo "💾 Backing up database..."
docker-compose -f docker-compose.prod.yml exec -T database pg_dump -U prescription_user prescription_system > $BACKUP_DIR/db_backup_$DATE.sql

# Backup application files
echo "📁 Backing up application files..."
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz docker-compose.prod.yml .env


# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR"
EOF

chmod +x ~/prescription-app/backup.sh

# Add cron job for daily backups
echo "⏰ Setting up daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /home/azureuser/prescription-app/backup.sh >> /home/azureuser/prescription-app/logs/backup.log 2>&1") | crontab -

echo "✅ VM setup completed successfully!"
echo
echo "📋 Next steps:"
echo "1. Add your GitHub secrets:"
echo "   - AZURE_SSH_PRIVATE_KEY: Your private key content"
echo "   - DB_PASSWORD: Database password"
echo "   - JWT_SECRET: JWT secret key"
echo "   - DOCKER_USERNAME: Docker Hub username"
echo "   - DOCKER_PASSWORD: Docker Hub password"
echo
echo "2. Push your code to trigger the CI/CD pipeline"
echo
echo "3. Monitor your application:"
echo "   - Run: ./monitor.sh"
echo "   - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo
echo "🌐 Your application will be available at: http://4.213.115.214"
