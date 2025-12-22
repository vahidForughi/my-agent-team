#!/usr/bin/env python3
import requests
import json
import time
import subprocess
import os
import signal
import sys

# Product image mappings (local path -> S3 URL)
IMAGE_MAPPINGS = {
    "images/products/acer_predator_x28_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/acer_predator_x28_1_20251218191908_68e6cab5.png",
    "images/products/apple_airpods_pro_2.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/apple_airpods_pro_2_20251218191908_d75d0ac5.png",
    "images/products/apple_iphone_16_pro_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/apple_iphone_16_pro_1_20251218191908_4d1d6a91.png",
    "images/products/apple_macbook_air_m3_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/apple_macbook_air_m3_1_20251218191909_c3e8e1d3.png",
    "images/products/apple_macbook_pro_m4_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/apple_macbook_pro_m4_1_20251218191909_f2aa8e8b.png",
    "images/products/asus_rog_swift_pg27aqdm_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/asus_rog_swift_pg27aqdm_1_20251218191909_e5d68d78.png",
    "images/products/benq_pd3220u_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/benq_pd3220u_1_20251218191909_0cd38a29.png",
    "images/products/bose_quietcomfort_ultra_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/bose_quietcomfort_ultra_1_20251218191909_72c81279.png",
    "images/products/dell_ultrasharp_u2723de_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/dell_ultrasharp_u2723de_1_20251218191909_b9dac32d.png",
    "images/products/dell_xps_15_9530_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/dell_xps_15_9530_1_20251218191910_13c6d5ee.png",
    "images/products/dell_xps_17_9730_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/dell_xps_17_9730_1_20251218191910_c9fa40f8.png",
    "images/products/hp_envy_move_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/hp_envy_move_1_20251218191910_3e4e3f81.png",
    "images/products/hp_omen_transcend_14_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/hp_omen_transcend_14_1_20251218191910_8cf7d577.png",
    "images/products/jbl_tour_one_m2_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/jbl_tour_one_m2_1_20251218191910_43062976.png",
    "images/products/keychron_q1_pro_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/keychron_q1_pro_1_20251218191910_cd2697b0.png",
    "images/products/keychron_v6_max_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/keychron_v6_max_1_20251218191910_2c0dce58.png",
    "images/products/lenovo_thinkpad_x1_carbon_gen_12_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/lenovo_thinkpad_x1_carbon_gen_12_1_20251218191911_07e18584.png",
    "images/products/lg_27gp950_b_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/lg_27gp950_b_1_20251218191911_4ab43a4b.png",
    "images/products/lg_c4_oled_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/lg_c4_oled_1_20251218191911_c95e662d.png",
    "images/products/lg_ultrafine_5k_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/lg_ultrafine_5k_1_20251218191911_e7e2cc6c.png",
    "images/products/logitech_mx_keys_s_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/logitech_mx_keys_s_1_20251218191911_79f4eda2.png",
    "images/products/logitech_mx_master_3s_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/logitech_mx_master_3s_1_20251218191911_e08c7aa6.png",
    "images/products/razer_blackwidow_v4_pro_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/razer_blackwidow_v4_pro_1_20251218191911_2e0e3f43.png",
    "images/products/razer_blade_18_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/razer_blade_18_1_20251218191912_3c75fcb3.png",
    "images/products/razer_deathadder_v3_pro_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/razer_deathadder_v3_pro_1_20251218191912_77de7810.png",
    "images/products/samsung_galaxy_buds_3_pro_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/samsung_galaxy_buds_3_pro_1_20251218191912_2ad4e96a.png",
    "images/products/samsung_galaxy_s24_ultra_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/samsung_galaxy_s24_ultra_1_20251218191912_b2a481c7.png",
    "images/products/samsung_odyssey_oled_g9_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/samsung_odyssey_oled_g9_1_20251218191912_7f699487.png",
    "images/products/sony_wh_1000xm5_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/sony_wh_1000xm5_1_20251218191912_4ce17e9e.png",
    "images/products/steelseries_apex_pro_tkl_1.png": "https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/steelseries_apex_pro_tkl_1_20251218191912_f01c2868.png",
}

API_BASE = "http://localhost:8001"
port_forward_proc = None

def cleanup(signum=None, frame=None):
    """Cleanup port-forward process"""
    global port_forward_proc
    print("\n🧹 Cleaning up...")
    if port_forward_proc:
        port_forward_proc.terminate()
        port_forward_proc.wait()
    sys.exit(0)

# Register signal handlers
signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

def main():
    global port_forward_proc
    
    print("🔄 Updating products to use S3 URLs...")
    print("")
    
    # Setup port-forward
    print("📡 Setting up port-forward...")
    port_forward_proc = subprocess.Popen(
        ["kubectl", "port-forward", "svc/catalog", "8001:80", "-n", "dev"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(3)
    
    # Fetch all products
    print("📦 Fetching all products...")
    try:
        response = requests.get(f"{API_BASE}/api/v1/Catalog/GetAllProducts")
        response.raise_for_status()
        products_data = response.json()
    except Exception as e:
        print(f"❌ Failed to fetch products: {e}")
        cleanup()
        return
    
    if not products_data.get('data'):
        print("❌ No products found")
        cleanup()
        return
    
    products = products_data['data']
    updated = 0
    skipped = 0
    
    # Update each product
    for product in products:
        product_id = product['id']
        current_image = product['imageFile']
        product_name = product['name']
        
        # Check if image needs updating (starts with "images/")
        if current_image.startswith("images/"):
            # Find matching S3 URL
            s3_url = IMAGE_MAPPINGS.get(current_image)
            
            if s3_url:
                # Update product with S3 URL
                product['imageFile'] = s3_url
                
                try:
                    update_response = requests.put(
                        f"{API_BASE}/api/v1/Catalog/UpdateProduct",
                        json=product,
                        headers={"Content-Type": "application/json"}
                    )
                    update_response.raise_for_status()
                    result = update_response.json()
                    
                    if result:
                        print(f"✅ Updated: {product_name}")
                        updated += 1
                    else:
                        print(f"❌ Failed to update: {product_name}")
                except Exception as e:
                    print(f"❌ Failed to update {product_name}: {e}")
            else:
                print(f"⚠️  No S3 mapping for: {current_image}")
                skipped += 1
        else:
            print(f"ℹ️  Already S3 URL: {product_name}")
            skipped += 1
    
    print("")
    print("📊 Summary:")
    print(f"   Updated: {updated}")
    print(f"   Skipped: {skipped}")
    print("")
    print("✨ Done!")
    
    cleanup()

if __name__ == "__main__":
    main()
