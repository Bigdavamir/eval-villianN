if (typeof browser === "undefined" && typeof chrome !== "undefined") {
    window.browser = chrome;

    const promisify = (fn, context) => (...args) =>
        new Promise((resolve, reject) => {
            // Check if the last argument is a function (a callback).
            // If it is, the original function will be called with it.
            // Otherwise, we'll provide our own callback to resolve the promise.
            if (typeof args[args.length - 1] === 'function') {
                fn.call(context, ...args);
            } else {
                fn.call(context, ...args, result => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result);
                    }
                });
            }
        });

    // Wrap storage.local methods if they exist to return promises.
    if (chrome.storage && chrome.storage.local) {
        const originalGet = chrome.storage.local.get;
        const originalSet = chrome.storage.local.set;
        const originalRemove = chrome.storage.local.remove;

        browser.storage.local.get = promisify(originalGet, chrome.storage.local);
        browser.storage.local.set = promisify(originalSet, chrome.storage.local);
        browser.storage.local.remove = promisify(originalRemove, chrome.storage.local);
    }
}
