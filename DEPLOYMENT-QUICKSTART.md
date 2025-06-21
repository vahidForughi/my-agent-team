# 🚀 Quick Deployment Guide

## **Option 1: One-Command Deployment (Recommended)**

### **Complete Fresh Deployment**

```bash
# Deploy everything from scratch
./deploy.sh
```

**Time**: ~15-20 minutes  
**What it does**: Deploys entire platform including all microservices, databases, monitoring, and frontend

### **Start Services (If Already Deployed)**

```bash
# Start port-forwards and frontend for existing deployment
./start.sh
```

**Time**: ~30 seconds  
**What it does**: Starts port-forwards and Angular frontend for already deployed platform

### **Cleanup Everything**

```bash
# Remove all deployed resources
./cleanup.sh
```

**Time**: ~2-3 minutes  
**What it does**: Removes all Helm releases, stops services, optionally deletes minikube

---

## **Option 2: Manual Step-by-Step**

Follow the detailed guide in [`DEPLOYMENT-GUIDE-COMPLETE.md`](./DEPLOYMENT-GUIDE-COMPLETE.md)

---

## **🎯 Access URLs (After Deployment)**

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | <http://localhost:4200> | - |
| **API Gateway** | <http://localhost:8010> | - |
| **Prometheus** | <http://localhost:9090> | - |
| **Grafana** | <http://localhost:3000> | admin/prom-operator |
| **Jaeger** | <http://localhost:16686> | - |
| **Kiali** | <http://localhost:20001> | - |
| **RabbitMQ** | <http://localhost:15672> | guest/guest |

---

## **📋 Prerequisites**

```bash
# Install required tools (macOS)
brew install minikube helm kubectl docker

# System requirements
# RAM: 8GB+ (12GB+ recommended)
# CPU: 4+ cores
# Disk: 50GB+ free space
```

---

## **🛠️ Troubleshooting**

### **Common Issues**

```bash
# Reset minikube
minikube delete && minikube start

# Check pod status
kubectl get pods --all-namespaces

# Restart services
./start.sh

# View logs
kubectl logs <pod-name> -n <namespace>
```

### **Port Forward Issues**

```bash
# Kill existing port forwards
pkill -f "kubectl port-forward"

# Restart port forwards
./start.sh
```

---

## **🏁 Quick Start Summary**

1. **Install prerequisites**: `brew install minikube helm kubectl docker`
2. **Deploy platform**: `./deploy.sh`
3. **Access frontend**: <http://localhost:4200>
4. **Monitor services**: <http://localhost:3000> (Grafana)

**🎊 That's it! Your cloud-native e-commerce platform is ready! 🎊**
