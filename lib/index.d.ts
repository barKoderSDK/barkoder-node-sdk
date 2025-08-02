/**
 * Barkoder SDK Node.js TypeScript Definitions
 * High-performance barcode scanning SDK for Node.js
 * 
 * @version 1.6.0.2
 * @author barKoder
 */

export interface BarcodeResult {
    resultsCount: number;
    barcodeTypeName: string;
    textualData: string;
    character_set?: string;
    results?: BarcodeResult[];
    [key: string]: any;
}

export interface ConfigObject {
    app_name: string;
    license_key: string;
    description?: string;
    version?: string;
}

export interface InitializationResult {
    status: string;
    config: ConfigObject;
    success: boolean;
}

export interface Constants {
    DecodingSpeed: {
        Fast: 0;
        Normal: 1;
        Slow: 2;
        Rigorous: 3;
    };
    
    Decoders: {
        // 2D Matrix Codes
        Aztec: 0;
        AztecCompact: 1;
        QR: 2;
        QRMicro: 3;
        PDF417: 15;
        PDF417Micro: 16;
        Datamatrix: 17;
        Dotcode: 27;
        MaxiCode: 39;
        
        // Linear 1D Codes
        Code128: 4;
        Code93: 5;
        Code39: 6;
        Codabar: 7;
        Code11: 8;
        Msi: 9;
        Code32: 25;
        Telepen: 26;
        
        // UPC/EAN Family
        UpcA: 10;
        UpcE: 11;
        UpcE1: 12;
        Ean13: 13;
        Ean8: 14;
        
        // Code 25 Family
        Code25: 18;
        Interleaved25: 19;
        ITF14: 20;
        IATA25: 21;
        Matrix25: 22;
        Datalogic25: 23;
        COOP25: 24;
        
        // GS1 DataBar Family
        Databar14: 29;
        DatabarLimited: 30;
        DatabarExpanded: 31;
        
        // Postal Codes
        PostalIMB: 32;
        Postnet: 33;
        Planet: 34;
        AustralianPost: 35;
        RoyalMail: 36;
        KIX: 37;
        JapanesePost: 38;
    };
    
    SettingType: {
        checksumType: 0;
        expandToUPCA: 1;
        dpmMode: 2;
        multiPartMerge: 3;
    };
    
    Code11ChecksumType: {
        disabled: 0;
        single: 1;
        double: 2;
    };
    
    Code39ChecksumType: {
        disabled: 0;
        enabled: 1;
    };
    
    MsiChecksumType: {
        disabled: 0;
        mod10: 1;
        mod11: 2;
        mod1010: 3;
        mod1110: 4;
        mod11IBM: 5;
        mod1110IBM: 6;
    };
    
    UpcEanDeblur: {
        Disable: 0;
        Enable: 1;
    };
    
    MulticodeCachingEnabled: {
        Disable: 0;
        Enable: 1;
    };
    
    EnableMisshaped1D: {
        Disable: 0;
        Enable: 1;
    };
    
    EnableVINRestrictions: {
        Disable: 0;
        Enable: 1;
    };
    
    Formatting: {
        Disabled: 0;
        Automatic: 1;
        GS1: 2;
        AAMVA: 3;
        SADL: 4;
    };
}

export type DecoderName = keyof Constants['Decoders'];
export type DecodingSpeed = 0 | 1 | 2 | 3;

/**
 * Main Barkoder SDK class
 */
export declare class BarkoderSDK {
    /**
     * Constants for decoder types, speeds, etc.
     */
    static readonly constants: Constants;
    
    /**
     * Get the SDK library version
     */
    static getVersion(): string;
    
    /**
     * Initialize the SDK with a license key
     * @param licenseKey Valid Barkoder license key
     */
    static initialize(licenseKey: string): string;
    
    /**
     * Check if the SDK is initialized
     */
    static isInitialized(): boolean;
    
    /**
     * Load configuration from a JSON file
     * @param configPath Path to config.json file
     */
    static loadConfig(configPath?: string): ConfigObject;
    
    /**
     * Initialize SDK using configuration file
     * @param configPath Path to config.json file (default: './config.json')
     */
    static initializeFromConfig(configPath?: string): InitializationResult;
    
    /**
     * Set which decoders are enabled for scanning
     * @param decoders Array of decoder type constants
     */
    static setEnabledDecoders(decoders: number[]): string;
    
    /**
     * Set the decoding speed
     * @param speed Speed constant (Fast=0, Normal=1, Slow=2, Rigorous=3)
     */
    static setDecodingSpeed(speed: DecodingSpeed): string;
    
    /**
     * Set the region of interest for scanning
     * @param left Left coordinate (0-100)
     * @param top Top coordinate (0-100) 
     * @param width Width (0-100)
     * @param height Height (0-100)
     */
    static setRegionOfInterest(left: number, top: number, width: number, height: number): string;
    
    /**
     * Decode barcode from image buffer
     * @param imageBuffer Buffer containing grayscale image data
     * @param width Image width in pixels
     * @param height Image height in pixels
     */
    static decodeImage(imageBuffer: Buffer, width: number, height: number): BarcodeResult;
    
    /**
     * Helper method to enable only specific decoder types
     * @param decoderNames Array of decoder names (e.g., ['QR', 'PDF417'])
     */
    static enableDecoders(decoderNames: DecoderName[]): string;
}

export default BarkoderSDK;