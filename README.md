# @barkoder/barcode-scanner

High-performance Node.js barcode scanning SDK supporting 40+ barcode formats. Native C++ implementation with JavaScript/TypeScript bindings.

[![npm version](https://badge.fury.io/js/%40barkoder%2Fbarcode-scanner.svg)](https://badge.fury.io/js/%40barkoder%2Fbarcode-scanner)
[![Node.js CI](https://github.com/barkoder/barkoder-nodejs/workflows/Node.js%20CI/badge.svg)](https://github.com/barkoder/barkoder-nodejs/actions)

## Features

- **40+ Barcode Formats**: QR Code, PDF417, Code128, DataMatrix, UPC/EAN, Code39, Aztec, and many more
- **High Performance**: Native C++ implementation with optimized scanning algorithms
- **Cross-Platform**: Supports x86_64 and ARM64 architectures on Linux
- **TypeScript Support**: Full TypeScript definitions included
- **Configurable**: Adjustable decoding speed, region of interest, checksum validation
- **Easy Integration**: Simple API with comprehensive examples

## Supported Barcode Types

### 2D Codes
QR, QR Micro, PDF417, PDF417 Micro, DataMatrix, Aztec, Aztec Compact, MaxiCode, DotCode

### 1D Codes  
Code128, Code93, Code39, Code32, Codabar, Code11, MSI, UPC-A, UPC-E, EAN-13, EAN-8

### Industrial Codes
Code25, Interleaved 2/5, ITF-14, IATA 2/5, Matrix 2/5, Datalogic 2/5, COOP 2/5, Telepen

### Postal Codes
DataBar (RSS), Australian Post, Royal Mail, KIX, Japanese Post, PostNet, Planet, IMB

## Installation

```bash
npm install @barkoder/barcode-scanner
```

### Prerequisites

- Node.js 16+ 
- Linux (x86_64 or ARM64)
- Build tools for native compilation
- libcurl development headers

**Install system dependencies:**

```bash
# Ubuntu/Debian
sudo apt-get install build-essential libcurl4-openssl-dev

# Amazon Linux/RHEL/CentOS
sudo dnf install gcc-c++ libcurl-devel

# Or use yum on older systems
sudo yum install gcc-c++ libcurl-devel
```

## Quick Start

```javascript
const BarkoderSDK = require('@barkoder/barcode-scanner');

// Initialize with your license key
const result = BarkoderSDK.initialize('YOUR_LICENSE_KEY');
console.log('SDK Status:', result);

// Configure for QR codes
BarkoderSDK.enableDecoders(['QR', 'PDF417']);
BarkoderSDK.setDecodingSpeed(BarkoderSDK.constants.DecodingSpeed.Normal);

// Decode from image buffer (grayscale)
const fs = require('fs');
// ... load your image as grayscale buffer ...
const result = BarkoderSDK.decodeImage(imageBuffer, width, height);

if (result.resultsCount > 0) {
    console.log('Found barcode:', result.textualData);
    console.log('Type:', result.barcodeTypeName);
} else {
    console.log('No barcodes found');
}
```

## Configuration File

Create a `config.json` file for your application. You can copy the included template:

```bash
# Copy the template (included in the package)
cp node_modules/@barkoder/barcode-scanner/config.template.json ./config.json

# Edit with your license key
nano config.json
```

```json
{
  "app_name": "my-barcode-app",
  "license_key": "YOUR_ACTUAL_LICENSE_KEY_HERE", 
  "description": "My barcode scanning application",
  "version": "1.0.0"
}
```

**⚠️ Important**: Never commit your actual license key to version control. Use environment variables or secure configuration management in production.

### Using Configuration File

```javascript
// Initialize from config file
const initResult = BarkoderSDK.initializeFromConfig('./config.json');

if (initResult.success) {
    console.log('✅ SDK initialized successfully');
    console.log('App:', initResult.config.app_name);
} else {
    console.log('❌ Initialization failed:', initResult.status);
}
```

## API Reference

### Core Functions

#### `BarkoderSDK.getVersion(): string`
Get the SDK library version.

#### `BarkoderSDK.initialize(licenseKey: string): string`
Initialize SDK with license key.

#### `BarkoderSDK.isInitialized(): boolean`
Check if SDK is initialized.

#### `BarkoderSDK.initializeFromConfig(configPath?: string): InitializationResult`
Initialize SDK using configuration file.

### Decoder Configuration

#### `BarkoderSDK.setEnabledDecoders(decoders: number[]): string`
Set active barcode types using decoder constants.

```javascript
const decoders = [
    BarkoderSDK.constants.Decoders.QR,
    BarkoderSDK.constants.Decoders.PDF417,
    BarkoderSDK.constants.Decoders.Code128
];
BarkoderSDK.setEnabledDecoders(decoders);
```

#### `BarkoderSDK.enableDecoders(decoderNames: string[]): string`
Helper method using decoder names.

```javascript
BarkoderSDK.enableDecoders(['QR', 'PDF417', 'Code128']);
```

### Scanning Configuration

#### `BarkoderSDK.setDecodingSpeed(speed: number): string`
Set performance vs accuracy trade-off.

```javascript
// Available speeds
BarkoderSDK.constants.DecodingSpeed.Fast      // 0 - Fastest
BarkoderSDK.constants.DecodingSpeed.Normal    // 1 - Balanced (default)
BarkoderSDK.constants.DecodingSpeed.Slow      // 2 - More thorough  
BarkoderSDK.constants.DecodingSpeed.Rigorous  // 3 - Most thorough
```

#### `BarkoderSDK.setRegionOfInterest(left, top, width, height): string`
Set scan area (values 0-100 as percentages).

```javascript
// Scan full image
BarkoderSDK.setRegionOfInterest(0, 0, 100, 100);

// Scan center quarter
BarkoderSDK.setRegionOfInterest(25, 25, 50, 50);
```

### Image Scanning

#### `BarkoderSDK.decodeImage(imageBuffer: Buffer, width: number, height: number): BarcodeResult`
Decode barcode from grayscale image buffer.

```javascript
const result = BarkoderSDK.decodeImage(grayscaleBuffer, imageWidth, imageHeight);

// Single barcode result
if (result.resultsCount === 1) {
    console.log('Type:', result.barcodeTypeName);
    console.log('Data:', result.textualData);
    console.log('Charset:', result.character_set);
}

// Multiple barcodes
if (result.resultsCount > 1) {
    result.results.forEach((barcode, index) => {
        console.log(`[${index}] ${barcode.barcodeTypeName}: ${barcode.textualData}`);
    });
}
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import BarkoderSDK, { BarcodeResult, DecoderName } from '@barkoder/barcode-scanner';

const decoders: DecoderName[] = ['QR', 'PDF417'];
BarkoderSDK.enableDecoders(decoders);

const result: BarcodeResult = BarkoderSDK.decodeImage(buffer, width, height);
```

## Error Handling

```javascript
try {
    const result = BarkoderSDK.initialize(licenseKey);
    
    if (result.startsWith('ERROR:')) {
        throw new Error(`SDK initialization failed: ${result}`);
    }
    
    // Configure and scan...
    const scanResult = BarkoderSDK.decodeImage(imageBuffer, width, height);
    
} catch (error) {
    console.error('Barcode scanning error:', error.message);
}
```

## Performance Tips

1. **Limit enabled decoders** to only those you need
2. **Use appropriate decoding speed** for your use case
3. **Set region of interest** to reduce processing area  
4. **Use appropriate image resolution** (not too high/low)
5. **Ensure good image quality** (proper lighting, focus)

## Examples

Check the `examples/` directory for complete working examples:

- `examples/decode-image.js` - Complete image decoding example with BMP support
- `examples/decode.js` - Basic SDK usage example

## Building from Source

```bash
git clone <repository-url>
cd barkoder-nodejs
npm install
npm run build
npm test
```

## License Requirements

This SDK requires a valid license key from [Barkoder](https://barkoder.com). The license key controls:

- **Barcode format support** - Which formats can be decoded
- **Usage limits** - Number of scans per period  
- **Application binding** - Restricts usage to specific applications
- **Expiration** - License validity period

### Getting a License

1. **Contact Barkoder**: [barkoder.com/request-quote](https://barkoder.com/request-quote)
2. **Specify your requirements**: Target platform, barcode types, expected volume
3. **License types available**: Evaluation, Development, Production, Enterprise

## Troubleshooting

### Common Issues

**"SDK initialization failed"**
- Verify license key is correct and not expired
- Check that app_name matches license requirements  
- Ensure internet connectivity for license validation

**"No module named 'BarkoderSDK'"**
- Run `npm rebuild` to recompile native module
- Check that all system dependencies are installed
- Verify Node.js version compatibility (16+)

**"No barcodes found"** 
- Ensure image is grayscale format
- Check image quality and barcode visibility
- Try different decoding speed settings
- Verify correct decoders are enabled

**Build failures**
- Install system build dependencies
- Check libcurl development headers are installed

## Support

- **Documentation**: [barkoder.com/docs](https://barkoder.com/docs)
- **Contact**: [barkoder.com/contact](https://barkoder.com/contact)  
- **Issues**: [GitHub Issues](https://github.com/barkoder/barkoder-nodejs/issues)

## License

This package contains proprietary Barkoder SDK components. Contact [Barkoder](https://barkoder.com) for licensing information.

---

Made with ❤️ by [Barkoder](https://barkoder.com)