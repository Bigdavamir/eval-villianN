// Simple WebExtensions API polyfill
if (typeof browser === "undefined" && typeof chrome !== "undefined") {
    // create a browser namespace and map its API calls to chrome
    window.browser = {};
    for (let key in chrome) {
        try {
            if (typeof chrome[key] === "function") {
                window.browser[key] = function (...args) {
                    return new Promise((resolve, reject) => {
                        try {
                            chrome[key](...args, result => {
                                if (chrome.runtime.lastError) {
                                    reject(chrome.runtime.lastError);
                                } else {
                                    resolve(result);
                                }
                            });
                        } catch (err) {
                            reject(err);
                        }
                    });
                };
            } else {
                window.browser[key] = chrome[key];
            }
        } catch (e) {
            // ignore inaccessible properties
        }
    }
}
