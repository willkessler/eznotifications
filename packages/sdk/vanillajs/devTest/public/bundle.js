(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ThisIsNotADrillSDK"] = factory();
	else
		root["ThisIsNotADrillSDK"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
// Assuming this file is `sdk.ts`
var SDK = /** @class */ (function () {
    function SDK(apiKey) {
        this.apiUrl = 'https://api.example.com/data'; // API endpoint
        this.apiKey = apiKey;
        this.initializeToasts();
    }
    SDK.prototype.initializeToasts = function () {
        var container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    };
    SDK.prototype.showToast = function (options) {
        var _a;
        var message = options.message, onClose = options.onClose;
        var toast = document.createElement('div');
        toast.textContent = message;
        toast.className = 'toast';
        toast.onclick = function () {
            var _a;
            (_a = document.getElementById('toast-container')) === null || _a === void 0 ? void 0 : _a.removeChild(toast);
            if (onClose) {
                onClose();
            }
        };
        (_a = document.getElementById('toast-container')) === null || _a === void 0 ? void 0 : _a.appendChild(toast);
        setTimeout(function () {
            toast.click(); // Automatically close after 5 seconds
        }, 5000);
    };
    SDK.prototype.pollApi = function () {
        var _this = this;
        fetch("".concat(this.apiUrl, "?apiKey=").concat(this.apiKey))
            .then(function (response) { return response.json(); })
            .then(function (data) {
            if (data.messages && Array.isArray(data.messages)) {
                data.messages.forEach(function (message) { return _this.showToast({ message: message }); });
            }
        })
            .catch(console.error);
    };
    return SDK;
}());
var Toast = /** @class */ (function () {
    function Toast() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container';
        document.body.appendChild(this.toastContainer);
    }
    Toast.prototype.show = function (options) {
        var _this = this;
        if (options === void 0) { options = { message: 'Default message' }; }
        var _a = options.message, message = _a === void 0 ? "Default message" : _a; // Provide a default message
        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        // Apply custom styles if any
        if (options.styles) {
            Object.assign(toast.style, options.styles);
        }
        // Auto-dismiss
        if (!options.stayOpen) {
            setTimeout(function () {
                if (_this.toastContainer.contains(toast)) {
                    _this.toastContainer.removeChild(toast);
                }
            }, options.duration || 3000);
        }
        this.toastContainer.appendChild(toast);
    };
    // Static method to handle automatic initialization
    Toast.init = function () {
        var instance = new Toast();
        return instance;
    };
    return Toast;
}());
// Adding event listener to initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded');
    var scriptTag = document.getElementById('api-script');
    var apiKey = scriptTag.getAttribute('data-api-key') || '';
    var sdk = new SDK(apiKey);
    sdk.pollApi();
    // Listen for custom events
    document.addEventListener('dismissToast', function () {
        console.log('Toast dismissed!');
    });
    var toaster = Toast.init();
    toaster.show({
        message: 'Welcome! This toast is auto-initialized on DOM content load.',
        duration: 5000
    });
});

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=bundle.js.map