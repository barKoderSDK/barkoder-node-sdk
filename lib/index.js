/**
 * Barkoder SDK Node.js Wrapper
 * 
 * High-level JavaScript interface for the Barkoder barcode scanning SDK.
 * This module provides a similar API to the Python implementation.
 * 
 * @version 1.6.2
 * @author barKoder
 */

const BarkoderNative = require('../build/Release/barkoder');
const constants = require('./constants');

/**
 * Main BarkoderSDK class
 */
class BarkoderSDK {
    /**
     * Constants for decoder types, speeds, etc.
     */
    static constants = constants;
    /**
     * Get the SDK library version
     * @returns {string} SDK version string
     */
    static getVersion() {
        return BarkoderNative.getVersion();
    }

    /**
     * Initialize the SDK with a license key
     * @param {string} licenseKey - Valid Barkoder license key
     * @returns {string} Initialization result message
     */
    static initialize(licenseKey) {
        if (typeof licenseKey !== 'string') {
            throw new Error('License key must be a string');
        }
        return BarkoderNative.initialize(licenseKey);
    }

    /**
     * Check if the SDK is initialized
     * @returns {boolean} True if initialized, false otherwise
     */
    static isInitialized() {
        return BarkoderNative.isInitialized();
    }

    /**
     * Load configuration from a JSON file
     * @param {string} configPath - Path to config.json file
     * @returns {Object} Configuration object
     */
    static loadConfig(configPath = './config.json') {
        const fs = require('fs');
        try {
            const configData = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            throw new Error(`Failed to load config from ${configPath}: ${error.message}`);
        }
    }

    /**
     * Initialize SDK using configuration file
     * @param {string} configPath - Path to config.json file (default: './config.json')
     * @returns {Object} Object with status and config
     */
    static initializeFromConfig(configPath = './config.json') {
        const config = this.loadConfig(configPath);
        
        if (!config.license_key) {
            throw new Error('No license_key found in configuration file');
        }

        // Set the process title so the SDK can read it (similar to Python's setproctitle)
        if (config.app_name) {
            process.title = config.app_name;
        }

        const result = this.initialize(config.license_key);
        
        return {
            status: result,
            config: config,
            success: result.startsWith('SUCCESS:')
        };
    }

    /**
     * Set which decoders are enabled for scanning
     * @param {Array<number>} decoders - Array of decoder type constants
     * @returns {string} Result message
     */
    static setEnabledDecoders(decoders) {
        if (!Array.isArray(decoders)) {
            throw new Error('Decoders must be an array');
        }
        return BarkoderNative.setEnabledDecoders(decoders);
    }

    /**
     * Set the decoding speed
     * @param {number} speed - Speed constant (Fast=0, Normal=1, Slow=2, Rigorous=3)
     * @returns {string} Result message
     */
    static setDecodingSpeed(speed) {
        if (typeof speed !== 'number') {
            throw new Error('Speed must be a number');
        }
        return BarkoderNative.setDecodingSpeed(speed);
    }

    /**
     * Set the region of interest for scanning
     * @param {number} left - Left coordinate (0-100)
     * @param {number} top - Top coordinate (0-100) 
     * @param {number} width - Width (0-100)
     * @param {number} height - Height (0-100)
     * @returns {string} Result message
     */
    static setRegionOfInterest(left, top, width, height) {
        if (typeof left !== 'number' || typeof top !== 'number' || 
            typeof width !== 'number' || typeof height !== 'number') {
            throw new Error('All ROI parameters must be numbers');
        }
        return BarkoderNative.setRegionOfInterest(left, top, width, height);
    }

    /**
     * Decode barcode from image buffer
     * @param {Buffer} imageBuffer - Buffer containing grayscale image data
     * @param {number} width - Image width in pixels
     * @param {number} height - Image height in pixels
     * @returns {Object} Decoded barcode result(s) as JSON object
     */
    static decodeImage(imageBuffer, width, height) {
        if (!Buffer.isBuffer(imageBuffer)) {
            throw new Error('First parameter must be a Buffer');
        }
        if (typeof width !== 'number' || typeof height !== 'number') {
            throw new Error('Width and height must be numbers');
        }
        
        const resultJson = BarkoderNative.decodeImage(imageBuffer, width, height);
        
        try {
            return JSON.parse(resultJson);
        } catch (error) {
            throw new Error('Failed to parse decode result: ' + error.message);
        }
    }

    /**
     * Helper method to enable only specific decoder types
     * @param {Array<string>} decoderNames - Array of decoder names (e.g., ['QR', 'PDF417'])
     * @returns {string} Result message
     */
    static enableDecoders(decoderNames) {
        if (!Array.isArray(decoderNames)) {
            throw new Error('Decoder names must be an array');
        }

        const decoderValues = decoderNames.map(name => {
            if (!(name in this.constants.Decoders)) {
                throw new Error(`Unknown decoder: ${name}`);
            }
            return this.constants.Decoders[name];
        });

        return this.setEnabledDecoders(decoderValues);
    }
}

// Export the main class
module.exports = BarkoderSDK;