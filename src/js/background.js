const defaultConfig = {
	"functions" : [
		{ "name" : "eval", "enabled" : true, "pattern" : "eval" },
		{ "name" : "Function", "enabled" : true, "pattern" : "Function" },
		{ "name" : "setTimeout", "enabled" : true, "pattern" : "setTimeout" },
		{ "name" : "setInterval", "enabled" : true, "pattern" : "setInterval" },
		{ "name" : "document.write", "enabled" : true, "pattern" : "document.write" },
		{ "name" : "document.writeln", "enabled" : true, "pattern" : "document.writeln" },
		{ "name" : "fetch", "enabled" : true, "pattern" : "fetch" },
		{ "name": "window.open", "enabled": true, "pattern": "window.open" },
		{ "name" : "innerHTML", "enabled" : true, "pattern" : "set(Element.innerHTML)" },
		{ "name" : "outerHTML", "enabled" : true, "pattern" : "set(Element.outerHTML)" },
		{ "name" : "XMLHttpRequest.open", "enabled" : true, "pattern" : "value(XMLHttpRequest.open)" },
		{ "name": "Location.assign", "enabled": true, "pattern": "value(Location.assign)" },
		{ "name": "Location.replace", "enabled": true, "pattern": "value(Location.replace)" },
		{ "name": "Range.createContextualFragment", "enabled": true, "pattern": "value(Range.createContextualFragment)" },
		{ "name" : "URLSearchParams.get", "enabled" : false, "pattern" : "value(URLSearchParams.get)" },
		{ "name" : "decodeURI", "enabled" : false, "pattern" : "decodeURI" },
		{ "name" : "decodeURIComponent", "enabled" : false, "pattern" : "decodeURIComponent" }
	],
	"blacklist" : [
		{ "name" : "Small Stuff", "enabled" : true, "pattern" : "/^\\s*\\S{0,3}\\s*$/" },
		{ "name" : "Boolean", "enabled" : true, "pattern" : "/^\\s*(?:true|false)\\s*$/gi" }
	],
	"needles" : [
		{ "name" : "asdf", "enabled" : true, "pattern" : "asdf" },
		{ "name" : "postMessage handler", "enabled" : false, "pattern" :"/^message$/" }
	],
	"targets" : [
		{ "name" : "Example Filter", "enabled" : false, "pattern" :"*://example.com/*" }
	],
	"types" : [
		{ "name": "string", "pattern": "string", "enabled": true },
		{ "name": "object", "pattern": "object", "enabled": false },
		{ "name": "function", "pattern": "function", "enabled": false },
		{ "name": "number", "pattern": "number", "enabled": false },
		{ "name": "boolean", "pattern": "boolean", "enabled": false },
		{ "name": "undefined", "pattern": "undefined", "enabled": false },
		{ "name": "symbol", "pattern": "symbol", "enabled": false }
	],
	"globals" : [
		{ "name" : "sinker", "enabled" : false, "pattern" : "evSinker" },
		{ "name" : "sourcer", "enabled" : false, "pattern" : "evSourcer" }
	],
	"powerFeatures": [
		{ "name": "autoSourceFetch", "pretty": "Auto-Source Fetch/XHR Responses", "enabled": false },
		{ "name": "autoSourcePostMessage", "pretty": "Auto-Source postMessage Data", "enabled": false }
	],
	"advancedSinks": [
		{ "name": "ShadowRoot.innerHTML", "enabled": true, "pattern": "set(ShadowRoot.innerHTML)" },
		{ "name": "Element.insertAdjacentHTML", "enabled": true, "pattern": "Element.prototype.insertAdjacentHTML" },
		{ "name": "Range.createContextualFragment", "enabled": true, "pattern": "Range.prototype.createContextualFragment" },
		{ "name": "DOMParser.parseFromString", "enabled": true, "pattern": "DOMParser.prototype.parseFromString" },
		{ "name": "Document.implementation.createHTMLDocument", "enabled": true, "pattern": "Document.implementation.createHTMLDocument" },
		{ "name": "HTMLIFrameElement.srcdoc", "enabled": true, "pattern": "set(HTMLIFrameElement.srcdoc)" },
		{ "name": "Element.outerHTML", "enabled": true, "pattern": "set(Element.outerHTML)" },
		{ "name": "document.domain", "enabled": true, "pattern": "set(document.domain)" },
		{ "name": "javascript-urls", "enabled": true, "pattern": "dangerousProtocols" },
		{ "name": "HTMLStyleElement.innerHTML", "enabled": true, "pattern": "set(HTMLStyleElement.innerHTML)" },
		{ "name": "CSSStyleSheet.cssText", "enabled": true, "pattern": "set(CSSStyleSheet.cssText)" }
	],
	"formats": [
		{ "name" : "title", "pretty" : "Normal Results", "use" : false, "open" : false, "default" : "color: none", "highlight" : "color: #088" },
		{ "name" : "interesting", "pretty" : "Interesting Results", "use" : true, "open" : true, "default" : "color: red", "highlight" : "color: #088" },
		{ "name" : "args", "pretty" : "Args Display", "use" : true, "open" : false, "default" : "color: none", "highlight" : "color: #088" },
		{ "name" : "needle", "pretty" : "Needles Search", "use" : true, "open" : true, "default" : "color: none", "highlight" : "color: #088" },
		{ "name" : "query", "pretty" : "Query Search", "limit" : 200, "use" : true, "open" : true, "default" : "color: none", "highlight" : "color: #088" },
		{ "name" : "fragment", "pretty" : "Fragment Search", "limit" : 64, "use" : true, "open" : true, "default" : "color: none", "highlight" : "color: #088" },
		{ "name" : "winname", "pretty" : "window.name Search", "limit" : 200, "use" : true, "open" : true, "default" : "color: none", "highlight" : "color: #088" },
		{ "name" : "path", "pretty" : "Path Search", "limit" : 32, "use" : false, "open" : true, "default" : "color: none", "highlight" : "color: #088" },
		{ "name" : "referrer", "pretty" : "Referrer Search", "limit" : 32, "use" : false, "open" : true, "default" : "color: none", "highlight" : "color: #088" },
		{ "name" : "cookie", "pretty" : "Cookie Search", "limit" : 32, "use" : true, "open" : false, "default" : "color: none", "highlight" : "color: yellow" },
		{ "name" : "localStore", "pretty" : "localStorage", "limit" : 100, "use" : true, "open" : false, "default" : "color: none", "highlight" : "color: yellow" },
		{ "name" : "userSource", "pretty" : "User Sources", "limit" : 100, "use" : true, "open" : false, "default" : "color: none", "highlight" : "color:#147599" },
		{ "name" : "stack", "pretty" : "Stack Display", "use" : true, "open" : false, "default" : "color: none", "highlight" : "color: #088" },
		{ "name" : "logReroute", "pretty" : "Log Reroute", "use" : true, "open" : null, "default" : "N/A", "highlight" : "N/A" }
	]
};

let unreg = null;
let debug = false;
let isInitialized = false;

function debugLog(...args) {
	if (!debug) return;
	console.log("[EV DEBUG]", ...args);
}

function arraysEqual(a, b) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

async function checkStorage() {
	const dbconf = await browser.storage.local.get(Object.keys(defaultConfig));
	const promises = [];
	const updateIt = (what) => {
		const k = {};
		k[what] = defaultConfig[what];
		promises.push(
			browser.storage.local.set(k).then(() => debugLog(`updated ${what}`))
		);
	};
	for (const iter in defaultConfig) {
		if (dbconf[iter] === undefined) {
			updateIt(iter);
		} else if (iter === "formats") {
			if (!Array.isArray(dbconf.formats)) {
				updateIt(iter);
				continue;
			}
			const defFormats = defaultConfig.formats;
			const currentNames = dbconf.formats.map(x => x.name);
			const defNames = defFormats.map(x => x.name);
			if (!arraysEqual(currentNames, defNames)) {
				updateIt(iter);
				continue;
			}
		}
	}
	return Promise.all(promises);
}

async function getFullConfig() {
    return browser.storage.local.get(Object.keys(defaultConfig));
}

async function broadcastConfig() {
    const [config, _match] = await getConfigForRegister();
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
      try {
        await browser.tabs.sendMessage(tab.id, {
          type: "configUpdate",
          config: config
        });
      } catch (e) {
        // This can happen if the content script is not injected in the tab
        debugLog(`Could not send config to tab ${tab.id}`);
      }
    }
    debugLog("Broadcasted config to all tabs.");
}

async function getConfigForRegister() {
	const dbconf = await getFullConfig();
	const config = {};
	config.formats = {};
	for (const i of dbconf.formats) {
		const tmp = Object.assign({}, i);
		config.formats[tmp.name] = tmp;
		delete tmp.name;
	}
	config.globals = dbconf.globals;
	config.powerFeatures = dbconf.powerFeatures;
	config.advancedSinks = dbconf.advancedSinks;

	config.functions = dbconf.functions
		.filter(x => x.enabled)
		.map(x => x.pattern);

	for (const what of ["needles", "blacklist", "types"]) {
		config[what] = dbconf[what]
			.filter(x => x.enabled)
			.map(x => x.pattern);
	}
	const match = [];
	const targRegex = /^(https?|wss?|file|ftp|\*):\/\/(\*|\*\.[^|)}>#]+|[^|)}>#]+)\/.*$/;
	for (const i of dbconf.targets) {
		if (i.enabled) {
			if (targRegex.test(i.pattern)) {
				match.push(i.pattern);
			} else {
				console.error(`Error on Target ${i.name}: ${i.pattern} must match: ${targRegex}`);
			}
		}
	}
	if (match.length === 0) {
		match.push("<all_urls>");
	}
	return [config, match];
}

async function register() {
	if (unreg != null) {
		return;
	}
	const [config, match] = await getConfigForRegister();
	if (config.functions.length === 0) {
		await removeScript();
		return false;
	}
	unreg = await browser.contentScripts.register({
		matches: match,
		js: [
			{ code: `const EVAL_VILLAIN_CONFIG = ${JSON.stringify(config)};` },
			{ file: "/js/switcheroo.js" }
		],
		runAt: "document_start",
		allFrames: true
	});
	browser.browserAction.setTitle({title: "EvalVillain: ON"});
	browser.browserAction.setIcon({path: "/icons/on_48.png"});
	debugLog("Injection Script registered");
	return true;
}

async function removeScript(icon=true) {
	if (unreg) {
		await unreg.unregister();
	}
	unreg = null;
	if (icon) {
		browser.browserAction.setTitle({title: "EvalVillain: OFF"});
		browser.browserAction.setIcon({ path: "/icons/off_48.png"});
	}
}

async function toggleEV() {
	const isActive = !!unreg;
	if (isActive) {
		await removeScript();
		await browser.storage.local.set({ 'evalVillainActive': false });
	} else {
		await register();
		await browser.storage.local.set({ 'evalVillainActive': true });
	}
    await broadcastConfig();
}

function handleMessage(request, sender, sendResponse) {
	const requestStr = typeof request === 'string' ? request : request.type;
	switch (requestStr) {
		case "getInitStatus":
			return Promise.resolve(isInitialized);
        case "backgroundReady":
            return;
		case "on?":
			return Promise.resolve(!!unreg);
		case "toggle":
			return toggleEV();
		case "updated":
            Promise.all([register(), broadcastConfig()]);
			return Promise.resolve(true);
		case "getScriptInfo":
			return getConfigForRegister().then(([config, _match]) => config);
		case "csp-injection-failed":
			if (sender.tab) {
				browser.browserAction.setTitle({
					tabId: sender.tab.id,
					title: "Eval Villain: Injection BLOCKED by page CSP"
				});
				browser.browserAction.setIcon({
					tabId: sender.tab.id,
					path: "/extra_icons/on_48_red.png"
				});
			}
			return;
		default:
			console.error(`Unknown message received: ${JSON.stringify(request)}`);
			return Promise.reject(new Error(`Unknown message: ${requestStr}`));
	}
}

async function initialize() {
    debugLog("Initializing background script...");
	await checkStorage();
	const { evalVillainActive } = await browser.storage.local.get('evalVillainActive');
    if (evalVillainActive) {
        await register();
    }
	isInitialized = true;
    debugLog("Initialization complete. Firing ready signal.");
	try {
		await browser.runtime.sendMessage({type: "backgroundReady"});
	} catch (e) {
		debugLog("Could not send backgroundReady message. No popup was open.");
	}
}

browser.runtime.onInstalled.addListener(async (details) => {
    debug = details.temporary || false;
    if (details.reason === "install") {
		debugLog("First-time install detected.");
		await browser.storage.local.clear();
		await browser.storage.local.set({ 'evalVillainActive': true });
	}
    await initialize();
});

(async () => {
    const { evalVillainActive } = await browser.storage.local.get('evalVillainActive');
	if (evalVillainActive === undefined) {
		debugLog("No active flag found, performing first-time setup.");
		await browser.storage.local.set({ 'evalVillainActive': true });
	}
	await initialize();
})();

browser.runtime.onMessage.addListener(handleMessage);
browser.commands.onCommand.addListener(command => {
	if (command == "toggle") toggleEV();
});

if (typeof module !== 'undefined' && module.exports) {
	module.exports = { arraysEqual, defaultConfig };
}
