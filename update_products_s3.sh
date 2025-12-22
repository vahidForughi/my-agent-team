#!/bin/bash

# Product image mappings (local path -> S3 URL)
declare -A IMAGE_MAPPINGS
IMAGE_MAPPINGS["images/products/acer_predator_x28_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/acer_predator_x28_1_20251218191908_68e6cab5.png"
IMAGE_MAPPINGS["images/products/apple_airpods_pro_2.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/apple_airpods_pro_2_20251218191908_d75d0ac5.png"
IMAGE_MAPPINGS["images/products/apple_iphone_16_pro_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/apple_iphone_16_pro_1_20251218191908_4d1d6a91.png"
IMAGE_MAPPINGS["images/products/apple_macbook_air_m3_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/apple_macbook_air_m3_1_20251218191909_c3e8e1d3.png"
IMAGE_MAPPINGS["images/products/apple_macbook_pro_m4_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/apple_macbook_pro_m4_1_20251218191909_f2aa8e8b.png"
IMAGE_MAPPINGS["images/products/asus_rog_swift_pg27aqdm_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/asus_rog_swift_pg27aqdm_1_20251218191909_e5d68d78.png"
IMAGE_MAPPINGS["images/products/benq_pd3220u_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/benq_pd3220u_1_20251218191909_0cd38a29.png"
IMAGE_MAPPINGS["images/products/bose_quietcomfort_ultra_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/bose_quietcomfort_ultra_1_20251218191909_72c81279.png"
IMAGE_MAPPINGS["images/products/dell_ultrasharp_u2723de_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/dell_ultrasharp_u2723de_1_20251218191909_b9dac32d.png"
IMAGE_MAPPINGS["images/products/dell_xps_15_9530_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/dell_xps_15_9530_1_20251218191910_13c6d5ee.png"
IMAGE_MAPPINGS["images/products/dell_xps_17_9730_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/dell_xps_17_9730_1_20251218191910_c9fa40f8.png"
IMAGE_MAPPINGS["images/products/hp_envy_move_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/hp_envy_move_1_20251218191910_3e4e3f81.png"
IMAGE_MAPPINGS["images/products/hp_omen_transcend_14_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/hp_omen_transcend_14_1_20251218191910_8cf7d577.png"
IMAGE_MAPPINGS["images/products/jbl_tour_one_m2_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/jbl_tour_one_m2_1_20251218191910_43062976.png"
IMAGE_MAPPINGS["images/products/keychron_q1_pro_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/keychron_q1_pro_1_20251218191910_cd2697b0.png"
IMAGE_MAPPINGS["images/products/keychron_v6_max_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/keychron_v6_max_1_20251218191910_2c0dce58.png"
IMAGE_MAPPINGS["images/products/lenovo_thinkpad_x1_carbon_gen_12_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/lenovo_thinkpad_x1_carbon_gen_12_1_20251218191911_07e18584.png"
IMAGE_MAPPINGS["images/products/lg_27gp950_b_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/lg_27gp950_b_1_20251218191911_4ab43a4b.png"
IMAGE_MAPPINGS["images/products/lg_c4_oled_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/lg_c4_oled_1_20251218191911_c95e662d.png"
IMAGE_MAPPINGS["images/products/lg_ultrafine_5k_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/lg_ultrafine_5k_1_20251218191911_e7e2cc6c.png"
IMAGE_MAPPINGS["images/products/logitech_mx_keys_s_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/logitech_mx_keys_s_1_20251218191911_79f4eda2.png"
IMAGE_MAPPINGS["images/products/logitech_mx_master_3s_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/logitech_mx_master_3s_1_20251218191911_e08c7aa6.png"
IMAGE_MAPPINGS["images/products/razer_blackwidow_v4_pro_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/razer_blackwidow_v4_pro_1_20251218191911_2e0e3f43.png"
IMAGE_MAPPINGS["images/products/razer_blade_18_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/razer_blade_18_1_20251218191912_3c75fcb3.png"
IMAGE_MAPPINGS["images/products/razer_deathadder_v3_pro_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/razer_deathadder_v3_pro_1_20251218191912_77de7810.png"
IMAGE_MAPPINGS["images/products/samsung_galaxy_buds_3_pro_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/samsung_galaxy_buds_3_pro_1_20251218191912_2ad4e96a.png"
IMAGE_MAPPINGS["images/products/samsung_galaxy_s24_ultra_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/samsung_galaxy_s24_ultra_1_20251218191912_b2a481c7.png"
IMAGE_MAPPINGS["images/products/samsung_odyssey_oled_g9_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/samsung_odyssey_oled_g9_1_20251218191912_7f699487.png"
IMAGE_MAPPINGS["images/products/sony_wh_1000xm5_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/sony_wh_1000xm5_1_20251218191912_4ce17e9e.png"
IMAGE_MAPPINGS["images/products/steelseries_apex_pro_tkl_1.png"]="https://ecommerce-product-images-471112812838.s3.ap-southeast-1.amazonaws.com/products/steelseries_apex_pro_tkl_1_20251218191912_f01c2868.png"

API_BASE="http://localhost:8001"

echo "🔄 Updating products to use S3 URLs..."
echo ""

# Setup port-forward
echo "📡 Setting up port-forward..."
kubectl port-forward svc/catalog 8001:80 -n dev > /dev/null 2>&1 &
PORT_FORWARD_PID=$!
sleep 3

# Function to cleanup port-forward
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    kill $PORT_FORWARD_PID 2>/dev/null
    exit
}
trap cleanup EXIT INT TERM

# Fetch all products
echo "📦 Fetching all products..."
PRODUCTS=$(curl -s "${API_BASE}/api/v1/Catalog/GetAllProducts")

if [ $? -ne 0 ]; then
    echo "❌ Failed to fetch products"
    exit 1
fi

# Parse product IDs
PRODUCT_IDS=$(echo "$PRODUCTS" | jq -r '.data[].id')

if [ -z "$PRODUCT_IDS" ]; then
    echo "❌ No products found"
    exit 1
fi

UPDATED=0
SKIPPED=0

# Update each product
for PRODUCT_ID in $PRODUCT_IDS; do
    # Get product details
    PRODUCT=$(curl -s "${API_BASE}/api/v1/Catalog/${PRODUCT_ID}")
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Failed to fetch product ${PRODUCT_ID}"
        continue
    fi
    
    CURRENT_IMAGE=$(echo "$PRODUCT" | jq -r '.imageFile')
    PRODUCT_NAME=$(echo "$PRODUCT" | jq -r '.name')
    
    # Check if image needs updating (starts with "images/")
    if [[ "$CURRENT_IMAGE" == images/* ]]; then
        # Find matching S3 URL
        S3_URL="${IMAGE_MAPPINGS[$CURRENT_IMAGE]}"
        
        if [ -n "$S3_URL" ]; then
            # Update product with S3 URL
            UPDATED_PRODUCT=$(echo "$PRODUCT" | jq --arg url "$S3_URL" '.imageFile = $url')
            
            RESPONSE=$(curl -s -X PUT \
                -H "Content-Type: application/json" \
                -d "$UPDATED_PRODUCT" \
                "${API_BASE}/api/v1/Catalog")
            
            if echo "$RESPONSE" | jq -e '.isSuccess == true' > /dev/null 2>&1; then
                echo "✅ Updated: ${PRODUCT_NAME}"
                ((UPDATED++))
            else
                echo "❌ Failed to update: ${PRODUCT_NAME}"
            fi
        else
            echo "⚠️  No S3 mapping for: ${CURRENT_IMAGE}"
            ((SKIPPED++))
        fi
    else
        echo "ℹ️  Already S3 URL: ${PRODUCT_NAME}"
        ((SKIPPED++))
    fi
done

echo ""
echo "📊 Summary:"
echo "   Updated: ${UPDATED}"
echo "   Skipped: ${SKIPPED}"
echo ""
echo "✨ Done!"
