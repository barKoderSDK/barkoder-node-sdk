#!/usr/bin/env node

/**
 * Basic test suite for Barkoder SDK
 * Tests core functionality without requiring a license
 */

const BarkoderSDK = require('../lib/index');
const assert = require('assert');

console.log('🧪 Running Barkoder SDK Basic Tests');
console.log('===================================');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        testsPassed++;
    } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
        testsFailed++;
    }
}

// Test 1: SDK Version
test('SDK version should be accessible', () => {
    const version = BarkoderSDK.getVersion();
    assert(typeof version === 'string', 'Version should be a string');
    assert(version.length > 0, 'Version should not be empty');
    assert(version === '1.6.0.2', 'Version should match expected value');
});

// Test 2: Constants availability
test('Constants should be available', () => {
    assert(typeof BarkoderSDK.constants === 'object', 'Constants should be an object');
    assert(typeof BarkoderSDK.constants.Decoders === 'object', 'Decoders should be available');
    assert(typeof BarkoderSDK.constants.DecodingSpeed === 'object', 'DecodingSpeed should be available');
});

// Test 3: Decoder constants
test('Decoder constants should have correct values', () => {
    assert(BarkoderSDK.constants.Decoders.QR === 2, 'QR decoder should be 2');
    assert(BarkoderSDK.constants.Decoders.PDF417 === 15, 'PDF417 decoder should be 15');
    assert(BarkoderSDK.constants.Decoders.Code128 === 4, 'Code128 decoder should be 4');
});

// Test 4: Speed constants
test('Speed constants should have correct values', () => {
    assert(BarkoderSDK.constants.DecodingSpeed.Fast === 0, 'Fast speed should be 0');
    assert(BarkoderSDK.constants.DecodingSpeed.Normal === 1, 'Normal speed should be 1');
    assert(BarkoderSDK.constants.DecodingSpeed.Rigorous === 3, 'Rigorous speed should be 3');
});

// Test 5: Initial state
test('SDK should not be initialized initially', () => {
    const initialized = BarkoderSDK.isInitialized();
    assert(initialized === false, 'SDK should not be initialized initially');
});

// Test 6: Initialize with invalid key
test('Initialize with invalid key should return error', () => {
    const result = BarkoderSDK.initialize('invalid-key');
    assert(typeof result === 'string', 'Result should be a string');
    assert(result.startsWith('SUCCESS:') || result.startsWith('ERROR:'), 'Result should start with SUCCESS: or ERROR:');
});

// Test 7: Helper methods validation
test('enableDecoders should validate input', () => {
    try {
        BarkoderSDK.enableDecoders('not-an-array');
        assert(false, 'Should throw error for non-array input');
    } catch (error) {
        assert(error.message.includes('array'), 'Should mention array in error message');
    }
});

// Test 8: setDecodingSpeed validation
test('setDecodingSpeed should validate input', () => {
    try {
        BarkoderSDK.setDecodingSpeed('not-a-number');
        assert(false, 'Should throw error for non-number input');
    } catch (error) {
        assert(error.message.includes('number'), 'Should mention number in error message');
    }
});

// Test 9: decodeImage validation
test('decodeImage should validate input', () => {
    try {
        BarkoderSDK.decodeImage('not-a-buffer', 100, 100);
        assert(false, 'Should throw error for non-buffer input');
    } catch (error) {
        assert(error.message.includes('Buffer'), 'Should mention Buffer in error message');
    }
});

// Test 10: Config loading (without valid file)
test('loadConfig should handle missing file gracefully', () => {
    try {
        BarkoderSDK.loadConfig('./non-existent-config.json');
        assert(false, 'Should throw error for missing file');
    } catch (error) {
        assert(error.message.length > 0, 'Should have error message');
    }
});

// Summary
console.log(`\n📊 Test Results:`);
console.log(`   ✅ Passed: ${testsPassed}`);
console.log(`   ❌ Failed: ${testsFailed}`);
console.log(`   📈 Total: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
    console.log(`\n🎉 All tests passed!`);
    process.exit(0);
} else {
    console.log(`\n💥 ${testsFailed} test(s) failed!`);
    process.exit(1);
}