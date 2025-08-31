(function() {
    const script = document.createElement('script');
    script.src = browser.runtime.getURL('/js/rewriter.js');
    (document.head || document.documentElement).appendChild(script);
    // Clean up the script tag after it has been loaded and executed
    script.onload = () => script.remove();
})();
