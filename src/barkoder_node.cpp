#include <napi.h>
#include <iostream>
#include <string>
#include <vector>
#include "Barkoder.hpp"
#include "Config.hpp"
#include "json/cJSON.h"

using namespace NSBarkoder;

// External function from the SDK
extern void SetDeviceInfo(std::string& appName, std::string& operatingSystem, std::string& operatingSystemVersion, std::string& manufacturerName, std::string& deviceName, std::string& deviceId);

// Global config pointer (similar to Python implementation)
Config *config = nullptr;

/**
 * Get the SDK library version
 */
Napi::String GetVersion(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    try {
        std::string version = Barkoder::GetLibVersion();
        return Napi::String::New(env, version);
    } catch (const std::exception& e) {
        Napi::TypeError::New(env, e.what()).ThrowAsJavaScriptException();
        return Napi::String::New(env, "");
    }
}

/**
 * Initialize the SDK with license key
 * Similar to init_config() in cpython.cpp:53
 */
Napi::String Initialize(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "License key string expected").ThrowAsJavaScriptException();
        return Napi::String::New(env, "ERROR: License key string expected");
    }
    
    std::string licenseKey = info[0].As<Napi::String>().Utf8Value();
    
    try {
        auto response = Config::InitializeWithLicenseKey(licenseKey);
        
        std::string message = response.Message();
        
        if (response.GetResult() == ConfigResponse::Result::Error) {
            return Napi::String::New(env, "ERROR: " + message);
        }
        
        // Store global config
        config = response.GetConfig();
        
        // Set default configurations (similar to Python implementation)
        Config::SetGlobalOption(BKGlobalOption_SetMaximumThreads, 1);
        Config::SetGlobalOption(BKGlobalOption_UseGPU, 0);
        
        config->decodingSpeed = NSBarkoder::DecodingSpeed::Normal;
        config->maximumResultsCount = 1;
        
        return Napi::String::New(env, "SUCCESS: " + message);
        
    } catch (const std::exception& e) {
        std::string error = "Exception during initialization: " + std::string(e.what());
        return Napi::String::New(env, "ERROR: " + error);
    }
}

/**
 * Check if SDK is initialized
 */
Napi::Boolean IsInitialized(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::Boolean::New(env, config != nullptr);
}

/**
 * Set which decoders are enabled for scanning
 * @param decodersArray - Array of decoder type integers
 */
Napi::String SetEnabledDecoders(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (!config) {
        return Napi::String::New(env, "ERROR: SDK not initialized");
    }
    
    if (info.Length() < 1 || !info[0].IsArray()) {
        return Napi::String::New(env, "ERROR: Array of decoder types expected");
    }
    
    try {
        Napi::Array decodersArray = info[0].As<Napi::Array>();
        std::vector<DecoderType> enabledDecoders;
        
        for (uint32_t i = 0; i < decodersArray.Length(); i++) {
            Napi::Value element = decodersArray[i];
            if (element.IsNumber()) {
                int decoderType = element.As<Napi::Number>().Int32Value();
                enabledDecoders.push_back(static_cast<DecoderType>(decoderType));
            }
        }
        
        config->SetEnabledDecoders(enabledDecoders);
        return Napi::String::New(env, "SUCCESS: Enabled " + std::to_string(enabledDecoders.size()) + " decoders");
        
    } catch (const std::exception& e) {
        return Napi::String::New(env, "ERROR: " + std::string(e.what()));
    }
}

/**
 * Set the decoding speed
 * @param speed - Speed value (0=Fast, 1=Normal, 2=Slow, 3=Rigorous)
 */
Napi::String SetDecodingSpeed(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (!config) {
        return Napi::String::New(env, "ERROR: SDK not initialized");
    }
    
    if (info.Length() < 1 || !info[0].IsNumber()) {
        return Napi::String::New(env, "ERROR: Speed integer expected");
    }
    
    try {
        int speed = info[0].As<Napi::Number>().Int32Value();
        config->decodingSpeed = static_cast<DecodingSpeed>(speed);
        return Napi::String::New(env, "SUCCESS: Decoding speed set to " + std::to_string(speed));
        
    } catch (const std::exception& e) {
        return Napi::String::New(env, "ERROR: " + std::string(e.what()));
    }
}

/**
 * Set the region of interest for scanning
 * @param left, top, width, height - ROI coordinates (floats 0-100)
 */
Napi::String SetRegionOfInterest(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (!config) {
        return Napi::String::New(env, "ERROR: SDK not initialized");
    }
    
    if (info.Length() < 4 || !info[0].IsNumber() || !info[1].IsNumber() || 
        !info[2].IsNumber() || !info[3].IsNumber()) {
        return Napi::String::New(env, "ERROR: Four numbers expected (left, top, width, height)");
    }
    
    try {
        float left = info[0].As<Napi::Number>().FloatValue();
        float top = info[1].As<Napi::Number>().FloatValue();
        float width = info[2].As<Napi::Number>().FloatValue();
        float height = info[3].As<Napi::Number>().FloatValue();
        
        config->SetRegionOfInterest(left, top, width, height);
        
        return Napi::String::New(env, "SUCCESS: ROI set to (" + 
                                std::to_string(left) + "," + std::to_string(top) + "," +
                                std::to_string(width) + "," + std::to_string(height) + ")");
        
    } catch (const std::exception& e) {
        return Napi::String::New(env, "ERROR: " + std::string(e.what()));
    }
}

/**
 * Decode barcode from image buffer
 * @param imageBuffer - Buffer containing grayscale image data
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 */
Napi::String DecodeImage(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (!config) {
        return Napi::String::New(env, "ERROR: SDK not initialized");
    }
    
    if (info.Length() < 3 || !info[0].IsBuffer() || !info[1].IsNumber() || !info[2].IsNumber()) {
        return Napi::String::New(env, "ERROR: Buffer and two numbers expected (imageBuffer, width, height)");
    }
    
    try {
        Napi::Buffer<uint8_t> buffer = info[0].As<Napi::Buffer<uint8_t>>();
        int width = info[1].As<Napi::Number>().Int32Value();
        int height = info[2].As<Napi::Number>().Int32Value();
        
        uint8_t* imageData = buffer.Data();
        size_t bufferLength = buffer.Length();
        
        // Validate buffer size
        if (bufferLength < static_cast<size_t>(width * height)) {
            return Napi::String::New(env, "ERROR: Buffer too small for specified dimensions");
        }
        
        // Decode the image
        std::vector<BaseResult> results = Barkoder::DecodeImageMemory(config, imageData, width, height);
        
        // Convert results to JSON
        int resultsCount = static_cast<int>(results.size());
        
        if (resultsCount == 0) {
            // No barcodes found
            cJSON* root = cJSON_CreateObject();
            cJSON_AddNumberToObject(root, "resultsCount", 0);
            cJSON_AddStringToObject(root, "barcodeTypeName", "");
            cJSON_AddStringToObject(root, "textualData", "");
            
            char* jsonString = cJSON_Print(root);
            std::string result(jsonString);
            
            cJSON_Delete(root);
            free(jsonString);
            
            return Napi::String::New(env, result);
        }
        else if (resultsCount == 1) {
            // Single barcode result
            cJSON* root = cJSON_CreateObject();
            cJSON_AddNumberToObject(root, "resultsCount", 1);
            cJSON_AddStringToObject(root, "barcodeTypeName", results[0].barcodeTypeName.c_str());
            cJSON_AddStringToObject(root, "textualData", results[0].textualData.c_str());
            
            // Add extra data if available
            for (const auto& pair : results[0].extra) {
                cJSON_AddStringToObject(root, pair.first.c_str(), pair.second.c_str());
            }
            
            char* jsonString = cJSON_Print(root);
            std::string result(jsonString);
            
            cJSON_Delete(root);
            free(jsonString);
            
            return Napi::String::New(env, result);
        }
        else {
            // Multiple barcode results
            cJSON* root = cJSON_CreateObject();
            cJSON_AddNumberToObject(root, "resultsCount", resultsCount);
            
            cJSON* resultsArray = cJSON_CreateArray();
            
            for (int i = 0; i < resultsCount; i++) {
                cJSON* singleResult = cJSON_CreateObject();
                cJSON_AddStringToObject(singleResult, "barcodeTypeName", results[i].barcodeTypeName.c_str());
                cJSON_AddStringToObject(singleResult, "textualData", results[i].textualData.c_str());
                
                // Add extra data if available
                for (const auto& pair : results[i].extra) {
                    cJSON_AddStringToObject(singleResult, pair.first.c_str(), pair.second.c_str());
                }
                
                cJSON_AddItemToArray(resultsArray, singleResult);
            }
            
            cJSON_AddItemToObject(root, "results", resultsArray);
            
            char* jsonString = cJSON_Print(root);
            std::string result(jsonString);
            
            cJSON_Delete(root);
            free(jsonString);
            
            return Napi::String::New(env, result);
        }
        
    } catch (const std::exception& e) {
        return Napi::String::New(env, "ERROR: " + std::string(e.what()));
    }
}

/**
 * Module initialization
 */
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("getVersion", Napi::Function::New(env, GetVersion));
    exports.Set("initialize", Napi::Function::New(env, Initialize));
    exports.Set("isInitialized", Napi::Function::New(env, IsInitialized));
    exports.Set("setEnabledDecoders", Napi::Function::New(env, SetEnabledDecoders));
    exports.Set("setDecodingSpeed", Napi::Function::New(env, SetDecodingSpeed));
    exports.Set("setRegionOfInterest", Napi::Function::New(env, SetRegionOfInterest));
    exports.Set("decodeImage", Napi::Function::New(env, DecodeImage));
    
    return exports;
}

NODE_API_MODULE(barkoder, Init)