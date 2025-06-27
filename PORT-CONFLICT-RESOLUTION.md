# 🔧 Port Conflict Resolution - Portainer vs Prometheus

## 🚨 **Issue Identified**

A port conflict was discovered between Portainer and Prometheus both attempting to use port 9090:

- **Prometheus**: Uses port 9090 extensively throughout the monitoring stack
- **Portainer**: Was incorrectly configured to use port 9090 in some documentation

## ⚖️ **Resolution Decision**

**Prometheus gets priority on port 9090** because:

1. **Extensive Usage**: Prometheus port 9090 is deeply integrated throughout the system:
   - All deployment scripts (`deploy.sh`, `start.sh`)
   - Port forward commands in multiple files
   - Monitoring documentation and guides
   - Grafana data source configurations
   - Istio virtual services

2. **Standard Convention**: Port 9090 is the standard Prometheus port
3. **Monitoring Priority**: Monitoring infrastructure should have stable, predictable ports

**Portainer reverted to port 9000** (original configuration):
- Port 9000 is the standard Portainer port
- No conflicts with other services
- Matches the `.env.example` configuration

## 🔄 **Changes Made**

### **Files Updated:**

1. **`docker-compose.override.yml`**
   ```yaml
   # BEFORE (conflicting)
   - "9090:9000"
   
   # AFTER (resolved)
   - "9000:9000"
   ```

2. **`access-services.sh`**
   ```bash
   # BEFORE
   "portainer") echo "http://localhost:9090"
   "portainer") echo "kubectl port-forward svc/portainer 9090:9000 -n default"
   
   # AFTER
   "portainer") echo "http://localhost:9000"
   "portainer") echo "kubectl port-forward svc/portainer 9000:9000 -n default"
   ```

3. **`Deployments/DEPLOYMENT-CONFIGURATION.md`**
   - Updated port mapping table
   - Added port conflict resolution note
   - Clarified Portainer dual-port configuration

4. **`Deployments/helm/portainer/templates/NOTES.txt`**
   ```yaml
   # BEFORE
   kubectl port-forward svc/portainer 9090:9000
   http://localhost:9090
   
   # AFTER
   kubectl port-forward svc/portainer 9000:9000
   http://localhost:9000
   ```

## 📊 **Final Port Configuration**

### **Monitoring Stack (Port 9090 Reserved for Prometheus)**
| Service | External Port | Internal Port | Status |
|---------|---------------|---------------|--------|
| **Prometheus** | 9090 | 80 | ✅ Priority |
| **Grafana** | 3000 | 3000 | ✅ No conflict |
| **Jaeger** | 16686 | 80 | ✅ No conflict |
| **Kiali** | 20001 | 20001 | ✅ No conflict |

### **Management Tools (Portainer on Port 9000)**
| Service | External Port | Internal Port | Status |
|---------|---------------|---------------|--------|
| **Portainer UI** | 9000 | 9000 | ✅ Resolved |
| **Portainer Edge** | 9080 | 8000 | ✅ No conflict |
| **pgAdmin** | 5050 | 80 | ✅ No conflict |

### **API Services (8000-8010 Range)**
| Service | External Port | Internal Port | Status |
|---------|---------------|---------------|--------|
| **Catalog API** | 8000 | 80 | ✅ No conflict |
| **Basket API** | 8001 | 80 | ✅ No conflict |
| **Discount API** | 8002 | 80 | ✅ No conflict |
| **Ordering API** | 8003 | 80 | ✅ No conflict |
| **API Gateway** | 8010 | 80 | ✅ No conflict |

## ✅ **Verification Commands**

### **Check Prometheus Access:**
```bash
# Port forward Prometheus
kubectl port-forward svc/prometheus-server 9090:80 -n monitoring

# Test access
curl http://localhost:9090/api/v1/status/config
```

### **Check Portainer Access:**
```bash
# Port forward Portainer
kubectl port-forward svc/portainer 9000:9000 -n default

# Test access (browser)
open http://localhost:9000
```

### **Use Access Script:**
```bash
# Interactive access to all services
./access-services.sh

# Select option 3 for Prometheus (port 9090)
# Select option 11 for Portainer (port 9000)
```

## 🔍 **No More Conflicts**

The port conflict has been completely resolved:

- ✅ **Prometheus**: Stable on port 9090 (monitoring priority)
- ✅ **Portainer**: Reverted to port 9000 (standard port)
- ✅ **All Documentation**: Updated to reflect correct ports
- ✅ **All Scripts**: Use correct port references
- ✅ **Docker Compose**: Fixed port mapping
- ✅ **Helm Charts**: Consistent port configuration

## 📚 **Related Documentation**

- [Deployment Configuration Guide](Deployments/DEPLOYMENT-CONFIGURATION.md) - Complete port mapping
- [Monitoring Guide](wiki/Monitoring.md) - Prometheus and Grafana setup
- [Access Services Script](access-services.sh) - Interactive service access
- [Environment Variables](.env.example) - Default port configurations

**The platform now has a clean, conflict-free port configuration that prioritizes monitoring infrastructure while maintaining easy access to all management tools.**
