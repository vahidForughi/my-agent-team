# LocalStack DNS Setup for Image Access

## Quick Setup

To enable product images to load from LocalStack in your browser, add this to your `/etc/hosts`:

```bash
echo "127.0.0.1 localstack" | sudo tee -a /etc/hosts
```

## What This Does

- Maps the hostname `localstack` to `127.0.0.1` (localhost) on your machine
- Allows your browser to resolve URLs like `http://localstack:4566/...`
- Works with the port-forward to LocalStack that runs at `localhost:4566`

## Automated Setup

You can use the provided script:

```bash
bash setup-localstack-dns.sh
```

## How It Works

### 1. Product URLs in Database
Products are stored with LocalStack S3 URLs:
```json
{
  "imageFile": "http://localstack:4566/ecommerce-product-images/products/image.png"
}
```

### 2. Port-Forward
The `deploy.sh` or `access-services.sh` scripts start a port-forward:
```bash
kubectl port-forward svc/localstack 4566:4566 -n default &
```

This makes `localhost:4566` route to LocalStack service in Kubernetes.

### 3. DNS Resolution
With `/etc/hosts` entry, your browser resolves:
```
http://localstack:4566/... → 127.0.0.1:4566 → LocalStack in K8s
```

## Manual Port-Forward

If the port-forward isn't running, start it manually:

```bash
kubectl port-forward svc/localstack 4566:4566 -n default &
```

## Using access-services.sh

The `access-services.sh` script now includes LocalStack:

```bash
bash access-services.sh

# Menu options:
# 3) LocalStack S3 - Open LocalStack health dashboard
# 15) Start All Port Forwards - Automatically starts LocalStack port-forward
```

## Verification

Test LocalStack is accessible:

```bash
# Health check
curl http://localhost:4566/_localstack/health
curl http://localstack:4566/_localstack/health

# Test image
curl -I http://localstack:4566/ecommerce-product-images/products/acer_helios_300_1.png
```

## Cleanup

To remove the hosts entry later:

```bash
sudo sed -i '' '/127.0.0.1 localstack/d' /etc/hosts
```

## Troubleshooting

### Images Still Not Loading

1. **Check /etc/hosts entry**:
   ```bash
   grep localstack /etc/hosts
   # Should show: 127.0.0.1 localstack
   ```

2. **Check port-forward is running**:
   ```bash
   ps aux | grep "port-forward.*localstack"
   ```

3. **Restart port-forward if needed**:
   ```bash
   pkill -f "port-forward.*localstack"
   kubectl port-forward svc/localstack 4566:4566 -n default &
   ```

4. **Verify LocalStack pod is running**:
   ```bash
   kubectl get pods -n default -l app.kubernetes.io/name=localstack
   # Should show: 1/1 Running
   ```

### Still Having Issues?

Check the bucket has images:

```bash
kubectl port-forward svc/localstack 4566:4566 -n default &
aws --endpoint-url=http://localhost:4566 s3 ls s3://ecommerce-product-images/products/
```

If empty, run the initialization:

```bash
bash scripts/init-localstack-s3.sh ecommerce-product-images http://localhost:4566 client/src/images/products
```

## AWS Deployment

**Note**: On AWS, products use real S3 URLs, not LocalStack URLs. This DNS setup is **only needed for local development** with Minikube.

## Why This Approach?

This is a **temporary workaround** for local development. The cleaner solution would be:

1. **Image Proxy via API Gateway** (recommended for production)
   - Store relative URLs: `/Images/products/image.png`
   - API Gateway proxies to S3 (LocalStack or AWS)
   - No DNS hacks needed
   - Works everywhere

2. **Current Approach** (simpler for now)
   - Store LocalStack URLs: `http://localstack:4566/...`
   - Add hosts file entry
   - Quick to implement
   - Good enough for local dev

For production deployments, consider implementing the image proxy solution.
