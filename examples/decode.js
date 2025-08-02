#!/usr/bin/env node

/**
 * Basic Barkoder SDK Example
 * 
 * This example demonstrates how to:
 * 1. Load configuration from config.json
 * 2. Initialize the SDK with a license key
 * 3. Check SDK version and initialization status
 * 
 * Usage: node examples/decode.js
 */

const BarkoderSDK = require('../lib/index');
const path = require('path');

async function main() {
    console.log('🔧 Barkoder SDK Node.js Example');
    console.log('================================');
    
    try {
        // Get SDK version
        console.log(`📚 SDK Version: ${BarkoderSDK.getVersion()}`);
        
        // Try to load config from parent directory (where sample config should be)
        const configPath = path.join(__dirname, '../config.json');
        
        console.log(`📄 Loading config from: ${configPath}`);
        
        let config;
        try {
            config = BarkoderSDK.loadConfig(configPath);
            console.log(`✅ Configuration loaded successfully`);
            console.log(`   App Name: ${config.app_name || 'Not specified'}`);
            console.log(`   Version: ${config.version || 'Not specified'}`);
        } catch (error) {
            console.log(`⚠️  Could not load config: ${error.message}`);
            console.log(`   Creating example config...`);
            
            // Create example config if it doesn't exist
            const fs = require('fs');
            const exampleConfig = {
                app_name: "node-barcode-example",
                license_key: "YOUR_LICENSE_KEY_HERE",
                description: "Node.js Barkoder SDK Example",
                version: "1.6.0.2"
            };
            
            fs.writeFileSync(configPath, JSON.stringify(exampleConfig, null, 2));
            console.log(`   ✅ Example config created at: ${configPath}`);
            console.log(`   ⚠️  Please edit the config file and add your license key`);
            return;
        }
        
        // Check if license key is placeholder
        if (!config.license_key || config.license_key === 'YOUR_LICENSE_KEY_HERE') {
            console.log(`❌ Please update the license key in ${configPath}`);
            console.log(`   Current value: ${config.license_key}`);
            return;
        }
        
        // Initialize SDK
        console.log(`🔑 Initializing SDK with license key...`);
        const result = BarkoderSDK.initialize(config.license_key);
        
        if (result.startsWith('SUCCESS:')) {
            console.log(`✅ SDK initialized successfully!`);
            console.log(`   ${result}`);
            console.log(`   Initialized: ${BarkoderSDK.isInitialized()}`);
        } else {
            console.log(`❌ SDK initialization failed:`);
            console.log(`   ${result}`);
        }
        
    } catch (error) {
        console.error(`💥 Error: ${error.message}`);
        console.error(error.stack);
    }
}

// Run the example
if (require.main === module) {
    main().catch(console.error);
}