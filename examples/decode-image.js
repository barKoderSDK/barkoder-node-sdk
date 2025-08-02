#!/usr/bin/env node

/**
 * Comprehensive Barkoder SDK Example with Image Decoding
 * 
 * This example demonstrates how to:
 * 1. Initialize the SDK with a license key
 * 2. Configure decoder types and settings
 * 3. Load and decode a barcode image
 * 4. Process the results
 * 
 * Usage: node examples/decode-image.js
 */

const BarkoderSDK = require('../lib/index');
const fs = require('fs');
const path = require('path');

// Helper function to load BMP image as grayscale buffer
function loadBmpAsGrayscale(filePath) {
    const buffer = fs.readFileSync(filePath);
    
    // Parse BMP header (simplified - assumes 24-bit BMP)
    const fileSize = buffer.readUInt32LE(2);
    const dataOffset = buffer.readUInt32LE(10);
    const width = buffer.readUInt32LE(18);
    const height = buffer.readUInt32LE(22);
    const bitsPerPixel = buffer.readUInt16LE(28);
    
    console.log(`📷 Image Info: ${width}x${height}, ${bitsPerPixel}bpp, size: ${fileSize} bytes`);
    
    if (bitsPerPixel !== 24) {
        throw new Error('Only 24-bit BMP images are supported in this example');
    }
    
    // Calculate row padding (BMP rows are padded to 4-byte boundaries)
    const bytesPerPixel = 3;
    const rowSizeWithoutPadding = width * bytesPerPixel;
    const rowSizeWithPadding = Math.ceil(rowSizeWithoutPadding / 4) * 4;
    const padding = rowSizeWithPadding - rowSizeWithoutPadding;
    
    console.log(`   Row size: ${rowSizeWithoutPadding} bytes, with padding: ${rowSizeWithPadding} bytes`);
    
    // Extract pixel data and convert to grayscale
    const pixelData = buffer.slice(dataOffset);
    const grayscaleBuffer = Buffer.alloc(width * height);
    
    // BMP rows are stored bottom-to-top, so we need to flip
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate source index accounting for padding and vertical flip
            const srcRowIndex = (height - 1 - y) * rowSizeWithPadding; // Flip vertically
            const srcIndex = srcRowIndex + x * bytesPerPixel;
            const dstIndex = y * width + x;
            
            // Convert BGR to grayscale using proper luminance weights (like OpenCV)
            const b = pixelData[srcIndex];
            const g = pixelData[srcIndex + 1];
            const r = pixelData[srcIndex + 2];
            
            // Use the same weights as OpenCV's RGB to grayscale conversion
            const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            
            grayscaleBuffer[dstIndex] = gray;
        }
    }
    
    return {
        buffer: grayscaleBuffer,
        width: width,
        height: height
    };
}

async function main() {
    console.log('🔧 Barkoder SDK - Image Decoding Example');
    console.log('=========================================');
    
    try {
        // Get SDK version
        console.log(`📚 SDK Version: ${BarkoderSDK.getVersion()}`);
        
        // Load configuration (create from template if needed)
        const configPath = path.join(__dirname, '../config.json');
        const templatePath = path.join(__dirname, '../config.template.json');
        
        console.log(`📄 Loading config from: ${configPath}`);
        
        // Create config from template if it doesn't exist
        if (!fs.existsSync(configPath)) {
            if (fs.existsSync(templatePath)) {
                console.log(`   📋 Creating config from template...`);
                fs.copyFileSync(templatePath, configPath);
                console.log(`   ✅ Config created from template`);
            } else {
                console.log(`   Creating example config...`);
                const exampleConfig = {
                    app_name: "node-barcode-example",
                    license_key: "YOUR_LICENSE_KEY_HERE",
                    description: "Node.js Barkoder SDK Example",
                    version: "1.6.0.2"
                };
                fs.writeFileSync(configPath, JSON.stringify(exampleConfig, null, 2));
                console.log(`   ✅ Example config created`);
            }
            console.log(`   ⚠️  Please edit ${configPath} and add your license key`);
            return;
        }
        
        let initResult;
        try {
            initResult = BarkoderSDK.initializeFromConfig(configPath);
            console.log(`✅ Configuration loaded: ${initResult.config.app_name}`);
        } catch (error) {
            console.log(`❌ Config error: ${error.message}`);
            console.log(`   Please update your license key in: ${configPath}`);
            return;
        }
        
        if (!initResult.success) {
            console.log(`❌ SDK initialization failed: ${initResult.status}`);
            return;
        }
        
        console.log(`✅ SDK initialized successfully!`);
        console.log(`   Status: ${initResult.status}`);
        console.log(`   Initialized: ${BarkoderSDK.isInitialized()}`);
        
        // Configure decoders - enable QR and PDF417
        console.log(`\n🔧 Configuring decoders...`);
        const enableResult = BarkoderSDK.enableDecoders(['QR', 'PDF417', 'Code128']);
        console.log(`   ${enableResult}`);
        
        // Set decoding speed
        const speedResult = BarkoderSDK.setDecodingSpeed(BarkoderSDK.constants.DecodingSpeed.Normal);
        console.log(`   ${speedResult}`);
        
        // Set region of interest (full image)
        const roiResult = BarkoderSDK.setRegionOfInterest(0, 0, 100, 100);
        console.log(`   ${roiResult}`);
        
        // Load and decode the test image
        const imagePath = path.join(__dirname, 'qr.bmp');
        console.log(`\n📷 Loading image: ${imagePath}`);
        
        if (!fs.existsSync(imagePath)) {
            console.log(`❌ Test image not found: ${imagePath}`);
            console.log(`   Please ensure qr.bmp exists in the examples directory`);
            return;
        }
        
        const imageData = loadBmpAsGrayscale(imagePath);
        console.log(`   Converted to grayscale: ${imageData.buffer.length} bytes`);
        
        // Decode the barcode
        console.log(`\n🔍 Decoding barcode...`);
        const startTime = Date.now();
        const result = BarkoderSDK.decodeImage(imageData.buffer, imageData.width, imageData.height);
        const decodeTime = Date.now() - startTime;
        
        console.log(`   Decode time: ${decodeTime}ms`);
        
        // Process results
        if (result.resultsCount === 0) {
            console.log(`❌ No barcodes found in the image`);
        } else if (result.resultsCount === 1) {
            console.log(`✅ Found 1 barcode:`);
            console.log(`   Type: ${result.barcodeTypeName}`);
            console.log(`   Data: "${result.textualData}"`);
            
            // Show any extra data
            const extraKeys = Object.keys(result).filter(key => 
                !['resultsCount', 'barcodeTypeName', 'textualData'].includes(key));
            if (extraKeys.length > 0) {
                console.log(`   Extra data:`);
                extraKeys.forEach(key => {
                    console.log(`     ${key}: ${result[key]}`);
                });
            }
        } else {
            console.log(`✅ Found ${result.resultsCount} barcodes:`);
            result.results.forEach((barcode, index) => {
                console.log(`   [${index + 1}] Type: ${barcode.barcodeTypeName}`);
                console.log(`       Data: "${barcode.textualData}"`);
            });
        }
        
        console.log(`\n🎉 Example completed successfully!`);
        
    } catch (error) {
        console.error(`💥 Error: ${error.message}`);
        console.error(error.stack);
    }
}

// Run the example
if (require.main === module) {
    main().catch(console.error);
}