// default config stuff v2
const defaultConfig = {
	"functions" : [
		{
			"name" : "eval",
			"enabled" : true,
			"pattern" : "eval"
		}, {
			"name" : "Function",
			"enabled" : true,
			"pattern" : "Function"
		}, {
			"name" : "innerHTML",
			"enabled" : true,
			"pattern" : "set(Element.innerHTML)"
		}, {
			"name" : "outerHTML",
			"enabled" : true,
			"pattern" : "set(Element.outerHTML)"
		}, {
			"name" : "createContextualFragment",
			"enabled" : true,
			"pattern" : "value(Range.createContextualFragment)"
		}, {
			"name" : "document.write",
			"enabled" : true,
			"pattern" : "document.write"
		}, {
			"name" : "document.writeln",
			"enabled" : true,
			"pattern" : "document.writeln"
		}, {
			"name" : "setTimeout",
			"enabled" : true,
			"pattern" : "setTimeout"
		}, {
			"name" : "setInterval",
			"enabled" : true,
			"pattern" : "setInterval"
		}, {
			"name" : "addEventListener",
			"enabled" : true,
			"pattern" : "window.addEventListener"
		}, {
			"name" : "fetch",
			"enabled" : true,
			"pattern" : "fetch"
		}, {
			"name" : "XMLHttpRequest",
			"enabled" : true,
			"pattern" : "value(XMLHttpRequest.open)"
		}, {
			"name": "window.open",
			"enabled": true,
			"pattern": "window.open"
		}, {
			"name": "Location.assign",
			"enabled": true,
			"pattern": "value(Location.assign)"
		}, {
			"name": "Location.replace",
			"enabled": true,
			"pattern": "value(Location.replace)"
		}, {
			"name" : "URLSearchParams.get",
			"enabled" : false,
			"pattern" : "value(URLSearchParams.get)"
		}, {
			"name" : "decodeURI",
			"enabled" : false,
			"pattern" : "decodeURI"
		}, {
			"name" : "decodeURIComponent",
			"enabled" : false,
			"pattern" : "decodeURIComponent"
		}
	],
	"blacklist" : [
		{
			"name" : "Small Stuff",
			"enabled" : true,
			"pattern" : "/^\\s*\\S{0,3}\\s*$/"
		}, {
			"name" : "Boolean",
			"enabled" : true,
			"pattern" : "/^\\s*(?:true|false)\\s*$/gi"
		}
	],
	"needles" : [
		{
			"name" : "asdf",
			"enabled" : true,
			"pattern" : "asdf"
		}, {
			"name" : "postMessage handler",
			"enabled" : false,
			"pattern" :"/^message$/"
		}
	],
	"targets" : [
		{
			"name" : "Example Filter",
			"enabled" : false,
			"pattern" :"*://example.com/*"
		}
	],
	"types" : [
		{
			"name": "string",
			"pattern": "string",
			"enabled": true
		}, {
			"name": "object",
			"pattern": "object",
			"enabled": false
		}, {
			"name": "function",
			"pattern": "function",
			"enabled": false
		}, {
			"name": "number",
			"pattern": "number",
			"enabled": false
		}, {
			"name": "boolean",
			"pattern": "boolean",
			"enabled": false
		}, {
			"name": "undefined",
			"pattern": "undefined",
			"enabled": false
		}, {
			"name": "symbol",
			"pattern": "symbol",
			"enabled": false
		}
	],
	"globals" : [
		{
			"name" : "sinker",
			"enabled" : false,
			"pattern" : "evSinker"
		}, {
			"name" : "sourcer",
			"enabled" : false,
			"pattern" : "evSourcer"
		}
	],
	"powerFeatures": [
		{
			"name": "autoSourceFetch",
			"pretty": "Auto-Source Fetch/XHR Responses",
			"enabled": false
		},
		{
			"name": "autoSourcePostMessage",
			"pretty": "Auto-Source postMessage Data",
			"enabled": false
		}
	],
	"advancedSinks": [
		{ "name": "shadowRoot", "pretty": "ShadowRoot.innerHTML", "enabled": true },
		{ "name": "insertAdjacentHTML", "pretty": "Element.insertAdjacentHTML", "enabled": true },
		{ "name": "rangeCreateContextualFragment", "pretty": "Range.createContextualFragment", "enabled": true },
		{ "name": "domParser", "pretty": "DOMParser.parseFromString", "enabled": true },
		{ "name": "createHTMLDocument", "pretty": "Document.implementation.createHTMLDocument", "enabled": true },
		{ "name": "iframeSrcdoc", "pretty": "HTMLIFrameElement.srcdoc", "enabled": true },
		{ "name": "elementOuterHTML", "pretty": "Element.outerHTML", "enabled": true },
		{ "name": "documentDomain", "pretty": "document.domain", "enabled": true },
		{ "name": "dangerousProtocols", "pretty": "javascript:/data: URLs", "enabled": true },
		{ "name": "styleInnerHTML", "pretty": "HTMLStyleElement.innerHTML", "enabled": true },
		{ "name": "cssText", "pretty": "CSSStyleSheet.cssText", "enabled": true }
	],
	"formats": [
		{
			"name"		: "title",
			"pretty"	: "Normal Results",
			"use"		: false,
			"open"		: false,
			"default"	: "color: none",
			"highlight"	: "color: #088"
		}, {
			"name"		: "interesting",
			"pretty"	: "Interesting Results",
			"use"		: true,
			"open"		: true,
			"default"	: "color: red",
			"highlight" : "color: #088"
		}, {
			"name"		: "args",
			"pretty"	: "Args Display",
			"use"		: true,
			"open"		: false,
			"default"	: "color: none",
			"highlight" : "color: #088"
		}, {
			"name"		: "needle",
			"pretty"	: "Needles Search",
			"use"		: true,
			"open"		: true,
			"default"	: "color: none",
			"highlight" : "color: #088"
		}, {
			"name"		: "query",
			"pretty"	: "Query Search",
			"limit"     : 200,
			"use"		: true,
			"open"		: true,
			"default"	: "color: none",
			"highlight" : "color: #088"
		}, {
			"name"		: "fragment",
			"pretty"	: "Fragment Search",
			"limit"     : 64,
			"use"		: true,
			"open"		: true,
			"default"	: "color: none",
			"highlight" : "color: #088"
		}, {
			"name"		: "winname",
			"pretty"	: "window.name Search",
			"limit"     : 200,
			"use"		: true,
			"open"		: true,
			"default"	: "color: none",
			"highlight" : "color: #088"
		}, {
			"name"		: "path",
			"pretty"	: "Path Search",
			"limit"     : 32,
			"use"		: false,
			"open"		: true,
			"default"	: "color: none",
			"highlight" : "color: #088"
		}, {
			"name"		: "referrer",
			"pretty"	: "Referrer Search",
			"limit"     : 32,
			"use"		: false,
			"open"		: true,
			"default"	: "color: none",
			"highlight" : "color: #088"
		}, {
			"name"		: "cookie",
			"pretty"	: "Cookie Search",
			"limit"     : 32,
			"use"		: true,
			"open"		: false,
			"default"	: "color: none",
			"highlight" : "color: yellow"
		}, {
			"name"		: "localStore",
			"pretty"	: "localStorage",
			"limit"		: 100,
			"use"		: true,
			"open"		: false,
			"default"	: "color: none",
			"highlight" : "color: yellow"
		}, {
			"name"		: "userSource",
			"pretty"	: "User Sources",
			"limit"		: 100,
			"use"		: true,
			"open"		: false,
			"default"	: "color: none",
			"highlight" : "color:#147599"
		}, {
			"name"		: "stack",
			"pretty"	: "Stack Display",
			"use"		: true,
			"open"		: false,
			"default"	: "color: none",
			"highlight" : "color: #088"
		}, {
			"name"		: "logReroute",
			"pretty"	: "Log Reroute",
			"use"		: true,
			"open"		: null,
			"default"	: "N/A",
			"highlight" : "N/A"
		}
	]
};

let unreg = null;
let debug = false;

function debugLog(...args) {
	if (!debug) return;
	console.log(...args);
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
			const dbf = dbconf.formats;
			if (!Array.isArray(dbf)) {
				updateIt(iter);
				continue;
			}
			const defFormats = defaultConfig.formats;
			const currentNames = dbf.map(x => x.name);
			const defNames = defFormats.map(x => x.name);
			if (!arraysEqual(currentNames, defNames)) {
				updateIt(iter);
				continue;
			}
			const needsUpdate = dbf.some((obj, i) => {
				const def = defFormats[i];
				if (obj.name !== def.name) return true;
				const s1 = Object.keys(obj).join();
				const s2 = Object.keys(def).join();
				return s1 !== s2;
			});
			if (needsUpdate) {
				updateIt(iter);
			}
		}
	}
	return Promise.all(promises);
}

async function getConfigForRegister() {
    await checkStorage();
	const dbconf = await browser.storage.local.get(Object.keys(defaultConfig));
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
	for (const what of ["needles", "blacklist", "functions", "types"]) {
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
		return; // Already registered
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
	debugLog("[EV_DEBUG] %cInjection Script registered", "color:#088;");
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
}

function handleMessage(request, sender, _sendResponse) {
	const requestStr = typeof request === 'string' ? request : request.type;
	switch (requestStr) {
		case "on?":
			return Promise.resolve(!!unreg);
		case "toggle":
			return toggleEV();
		case "updated":
			if (unreg) {
				return register();
			}
			return Promise.resolve(false);
		case "getScriptInfo":
			return getConfigForRegister().then(([config, _match]) => config);
		case "csp-injection-failed":
			if (sender.tab) {
				const tabId = sender.tab.id;
				browser.browserAction.setTitle({
					tabId: tabId,
					title: "Eval Villain: Injection BLOCKED by page CSP"
				});
				browser.browserAction.setIcon({
					tabId: tabId,
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
    const { evalVillainActive, ...storedConfig } = await browser.storage.local.get(['evalVillainActive']);
    const isPristine = Object.keys(storedConfig).length === 0;

    // On a truly fresh install (or after a clear), storage is empty.
    if (isPristine) {
        debugLog("[EV DEBUG] Pristine storage detected, running first-time setup.");
        await checkStorage();
        await browser.storage.local.set({ 'evalVillainActive': true });
        await register();
    } else {
        // On subsequent startups, just ensure config is valid and register if needed.
        await checkStorage();
        if (evalVillainActive) {
            await register();
        }
    }
}

browser.runtime.onInstalled.addListener(details => {
    debug = details.temporary || false;
    // The startup logic handles initialization now, but we can log the install/update reason.
    if (details.reason === "install") {
		debugLog("[EV DEBUG] onInstalled reason: install");
	} else if (details.reason === "update") {
		debugLog("[EV DEBUG] onInstalled reason: update");
	}
});

// Main entry point for the background script
initialize().catch(console.error);

browser.runtime.onMessage.addListener(handleMessage);
browser.commands.onCommand.addListener(command => {
	if (command == "toggle") toggleEV();
});

if (typeof module !== 'undefined' && module.exports) {
	module.exports = { arraysEqual, defaultConfig };
}
