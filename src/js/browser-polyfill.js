// Simple Chrome browser.* API polyfill for Chrome
if (typeof browser === "undefined" && typeof chrome !== "undefined") {
    window.browser = chrome;
}
