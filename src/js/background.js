console.log("[EV] Minimal background script loaded.");

let isInitialized = true; // For this test, we'll pretend we are always initialized.

function handleMessage(request, sender, sendResponse) {
	const requestStr = typeof request === 'string' ? request : request.type;
	console.log(`[EV] Message received: ${requestStr}`);

	if (requestStr === "getInitStatus") {
		// Respond that we are ready.
		return Promise.resolve(isInitialized);
	}
    // Ignore other messages for this test.
}

browser.runtime.onMessage.addListener(handleMessage);

console.log("[EV] Message listener attached.");
