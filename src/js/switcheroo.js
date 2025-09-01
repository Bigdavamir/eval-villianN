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
    function inject_it(rewriterSource) {
        // Use a random ID to check if the script was successfully executed.
        const checkId = `data-eval-villain-${Math.random().toString(36).substring(2, 10)}`;

        // The payload to be injected. It first sets the check attribute,
        // then executes the rewriter source code. The rewriter will use the
        // window.EVAL_VILLAIN_CONFIG set by the initial content script.
        const injectionPayload = `
            try {
                document.documentElement.setAttribute('${checkId}', '1');
                ${rewriterSource}
            } catch (e) {
                console.error("Eval Villain injection error:", e);
            }
        `;

        const scriptEl = document.createElement('script');
        scriptEl.type = "text/javascript";
        scriptEl.textContent = injectionPayload;
        (document.head || document.documentElement).appendChild(scriptEl);

        if (scriptEl.parentNode) {
            scriptEl.parentNode.removeChild(scriptEl);
        }

        setTimeout(() => {
            if (!document.documentElement.hasAttribute(checkId)) {
                console.log(
                    "%c[EV-ERROR]%c Eval Villain injection failed, likely due to the page's Content Security Policy (CSP).",
                    "color:red;font-weight:bold;", "color:red;"
                );
                browser.runtime.sendMessage({ type: "csp-injection-failed" });
            }
            document.documentElement.removeAttribute(checkId);
        }, 100);
    }

    /**
     * Fetches the necessary resources and starts the injection process.
     */
    async function main() {
        try {
            // The config is now set on the window by the background script's first injected script.
            // This script's job is just to inject the rewriter into the page's context.
            const rewriterResponse = await fetch(browser.runtime.getURL('/js/rewriter.js'));

            if (!rewriterResponse.ok) {
                throw new Error(`Failed to fetch rewriter.js: ${rewriterResponse.statusText}`);
            }

            const rewriterSource = await rewriterResponse.text();

            inject_it(rewriterSource);
        } catch (error) {
            console.error("Eval Villain bootstrap failed:", error);
        }
    }

    main();
})();
