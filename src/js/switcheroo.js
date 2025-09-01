/**
 * This is the content script that gets injected into the page by the background script.
 * Its mission is to bootstrap the main rewriter script into the page's own execution context.
 */
(function() {
    'use strict';

    /**
     * Injects the main rewriter script into the page's world.
     * @param {string} rewriterSource - The source code of the rewriter script.
     * @param {object} config - The configuration object for the rewriter.
     */
    function inject_it(rewriterSource, config) {
        // Use a random ID to check if the script was successfully executed.
        const checkId = `data-eval-villain-${Math.random().toString(36).substring(2, 10)}`;

        // The payload to be injected. It first sets the check attribute,
        // then sets the global config object, and finally executes the rewriter source code.
        const injectionPayload = `
            try {
                document.documentElement.setAttribute('${checkId}', '1');
                window.EVAL_VILLAIN_CONFIG = ${JSON.stringify(config)};
                ${rewriterSource}
            } catch (e) {
                console.error("Eval Villain injection error:", e);
            }
        `;

        const scriptEl = document.createElement('script');
        scriptEl.type = "text/javascript";
        scriptEl.textContent = injectionPayload; // Use textContent for security, though it's our own code.
        (document.head || document.documentElement).appendChild(scriptEl);

        // The script content is executed synchronously on append, so we can remove the element immediately.
        if (scriptEl.parentNode) {
            scriptEl.parentNode.removeChild(scriptEl);
        }

        // After a short delay, check if the attribute was successfully set.
        // If not, a Content Security Policy (CSP) or another mechanism likely blocked the inline script.
        setTimeout(() => {
            if (!document.documentElement.hasAttribute(checkId)) {
                console.log(
                    "%c[EV-ERROR]%c Eval Villain injection failed, likely due to the page's Content Security Policy (CSP).",
                    "color:red;font-weight:bold;", "color:red;"
                );
                // Notify the background script to update the UI icon.
                browser.runtime.sendMessage({ type: "csp-injection-failed" });
            }
            // Clean up the attribute from the DOM regardless of success or failure.
            document.documentElement.removeAttribute(checkId);
        }, 100);
    }

    /**
     * Fetches the necessary resources and starts the injection process.
     */
    async function main() {
        try {
            // Concurrently fetch the config from the background and the rewriter script text.
            const [config, rewriterResponse] = await Promise.all([
                browser.runtime.sendMessage("getScriptInfo"),
                fetch(browser.runtime.getURL('/js/rewriter.js'))
            ]);

            if (!rewriterResponse.ok) {
                throw new Error(`Failed to fetch rewriter.js: ${rewriterResponse.statusText}`);
            }

            const rewriterSource = await rewriterResponse.text();

            // Now that we have both, inject the script.
            inject_it(rewriterSource, config);
        } catch (error) {
            console.error("Eval Villain bootstrap failed:", error);
        }
    }

    main();

    browser.runtime.onMessage.addListener((message) => {
        if (message.type === "configUpdate" && message.config) {
          fetch(browser.runtime.getURL('/js/rewriter.js'))
            .then(r => r.text())
            .then(src => {
              inject_it(src, message.config); // use full config
            })
            .catch(error => {
                console.error("Eval Villain re-injection failed:", error);
            });
        }
      });
})();
