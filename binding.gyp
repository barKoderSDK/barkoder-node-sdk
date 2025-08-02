{
  "targets": [{
    "target_name": "barkoder",
    "sources": [
      "src/barkoder_node.cpp",
      "src/json/cJSON.cpp"
    ],
    "libraries": [
      "-lcurl",
      "-lpthread"
    ],
    "conditions": [
      ["target_arch=='x64'", {
        "libraries": ["<(module_root_dir)/lib/x86_64/libbarkoder.a"]
      }],
      ["target_arch=='arm64'", {
        "libraries": ["<(module_root_dir)/lib/arm64/libbarkoder.a"]
      }]
    ],
    "include_dirs": [
      "<!@(node -p \"require('node-addon-api').include\")",
      "src"
    ],
    "dependencies": [
      "<!(node -p \"require('node-addon-api').gyp\")"
    ],
    "cflags!": [ "-fno-exceptions" ],
    "cflags_cc!": [ "-fno-exceptions" ],
    "xcode_settings": {
      "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
      "CLANG_CXX_LIBRARY": "libc++",
      "MACOSX_DEPLOYMENT_TARGET": "10.7"
    },
    "msvs_settings": {
      "VCCLCompilerTool": { "ExceptionHandling": 1 }
    },
    "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ]
  }]
}