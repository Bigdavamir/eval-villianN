/* The background.js file composes this with a `config` and the rewriter.js,
 * which contains the rewriter function. So complete source that will run looks like:
 *
 * const config = {"formats": .......}      // config to be used by rewriter
 * const rewriter = function(CONFIG) { .... // Code to be injected into page, with above config
 *
*/

/**
 * Picks random number to verify the inject worked... does not need to be
 * random. It's overkill really.
*/
function makeid() {
	let ret = '';
	const alph = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let i = Math.random() * 16 + 8;
	while (i < 32) {
		ret += alph.charAt(Math.floor(Math.random() * alph.length));
		i += 1;
	}
	return ret;
}

/*
 * start content script
 *
 * Everything above is what will be injected
*/
function inject_it(func, info) {
	const checkId = `data-${makeid()}`;

	// The rewriter script (`func`) is wrapped in an IIFE. We prepend a line to this
	// function that sets an attribute on the document root. If this attribute
	// is present after injection, we know the script executed. If not, a CSP
	// or other mechanism likely blocked it.
	const rewriterScript = func.toString();
	const injectionPayload = `
		document.documentElement.setAttribute('${checkId}', '1');
		window.EVAL_VILLAIN_CONFIG = ${JSON.stringify(info)};
		(${rewriterScript})();
	`;

	const scriptEl = document.createElement('script');
	scriptEl.type = "text/javascript";
	scriptEl.innerHTML = injectionPayload;
	document.documentElement.appendChild(scriptEl);
	scriptEl.remove(); // Remove the script element from the DOM immediately after appending.

	// After a short delay, check if the attribute was successfully set.
	setTimeout(() => {
		if (!document.documentElement.hasAttribute(checkId)) {
			// The script likely did not execute.
			console.log(
				"%c[EV-ERROR]%c Eval Villain injection failed, likely due to the page's Content Security Policy (CSP).",
				"color:red;font-weight:bold;", "color:red;"
			);
			// Notify the background script to update the UI.
			browser.runtime.sendMessage({ type: "csp-injection-failed" });
		}
		// Clean up the attribute from the DOM regardless of success or failure.
		document.documentElement.removeAttribute(checkId);
	}, 100);
}

// config and rewriter should be put into this by the background script
inject_it(rewriter, config);
