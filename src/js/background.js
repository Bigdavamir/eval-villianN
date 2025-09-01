// default config stuff
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
}

function getAllConf() {
	return browser.storage.local.get(Object.keys(defaultConfig)).catch(console.error);
}

async function getAllConfValidated() {
	let dbconf = await getAllConf();
	for (let i = 0; i < 2; i++) { // retry loop
		let success = true;
		for (const i of Object.keys(defaultConfig)) {
			if (dbconf[i] === undefined || !Array.isArray(dbconf[i])) {
				await checkStorage();
				dbconf = await getAllConf();
				success = false;
			}
		}
		if (success) {
			return dbconf;
		}
	}
	return null;
}

function debugLog() {
	if (!this.debug) return;
	console.log(...arguments);
}

async function checkStorage() {
	const dbconf = await getAllConf();

	function updateIt(what) {
		const k = {};
		k[what] = defaultConfig[what];
		return browser.storage.local.set(k)
			.then(() => console.log(`updated ${what}`));
	}

	for (const iter in defaultConfig) {
		if (dbconf[iter] === undefined) {
			updateIt(iter); // DNE, add it
		} else if (iter === "formats") {
			const dbf = dbconf.formats;
			if (!Array.isArray(dbf)) {
				updateIt(iter);
				continue;
			}
			// if defaultConfig has changed since install, we update
			const defFormats = defaultConfig.formats;
			const currentNames = dbf.map(x => x.name);
			const defNames = defFormats.map(x => x.name);
			if (!arraysEqual(currentNames, defNames)) {
				updateIt(iter);
			}

			// if formats fields change, update it
			dbf.some((obj, i) => {
				// TODO: improve DB representation of formats
				const def = defFormats[i];
				if (obj.name != def.name) {
					updateIt(iter);
					return true;
				}
				const s1 = Object.keys(obj).join();
				const s2 = Object.keys(def).join();
				if (s1 != s2) {
					updateIt(iter);
					return true;
				}
				return false;
			})
		}
	}
}

function arraysEqual(a, b) {
	if (a.length !== b.length) {
		return false;
	}
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}
	return true;
}

async function getConfigForRegister() {
	const dbconf = await getAllConfValidated();
		// .then(worked);

	const config = {};
	config.formats = {};
	for (const i of dbconf.formats) {
		const tmp = Object.assign({}, i);
		config.formats[tmp.name] = tmp;
		delete tmp.name;
	}

	// globals
	for (const i of dbconf.globals) {
		if (i.enabled) {
			config[i.name] = i.pattern;
		}
	}

	// Pass these full config objects to the rewriter
	config.powerFeatures = dbconf.powerFeatures;
	config.advancedSinks = dbconf.advancedSinks;

	for (const what of ["needles", "blacklist", "functions", "types"]) {
		config[what] = config[what] = dbconf[what]
			.filter(x => x.enabled)
			.map(x => x.pattern);
	}

	// target stuff {
	const match = [];
	const targRegex = /^(https?|wss?|file|ftp|\*):\/\/(\*|\*\.[^|)}>#]+|[^|)}>#]+)\/.*$/;
	for (const i of dbconf.targets) {
		if (i.enabled) {
			if (targRegex.test(i.pattern)) {
				match.push(i.pattern);
			} else {
				throw `Error on Target ${i.name}: ${i.pattern} must match: ${targRegex}`;
			}
		}
	}

	// no targets enabled means do all
	if (match.length === 0) {
		match.push("<all_urls>");
	}
	debugLog("[EV DEBUG] matches: %s", match);
	return [config, match];
}


/**
* Registers the content script with the current config
**/
async function register() {
	if (this.unreg != null) {
		// content script is registered already, so remove it first don't worry
		// about the icon though, if we fail something else will change it to off
		removeScript(false);
	}
	const [config, match] = await getConfigForRegister();

	// anything to register?
	if (config.functions.length === 0) {
		removeScript();
		res(false);
		return;
	}

	const code = `config = ${JSON.stringify(config)};`;


	// firefox >=59, not supported in chrome...
	this.unreg = await browser.contentScripts.register({
		matches: match,
		js: [
			{code: code}, 					// contains configuration for rewriter
			{file: "/js/rewriter.js"},		// Has actual code that gets injected into the page
			{file: "/js/switcheroo.js"}		// cause the injection
		],
		runAt: "document_start",
		allFrames: true
	});

	browser.browserAction.setTitle({title: "EvalVillain: ON"});
	browser.browserAction.setIcon({path: "/icons/on_48.png"});
	debugLog("[EV_DEBUG] %cInjection Script registered", "color:#088;")
	return true;
}

function removeScript(icon=true) {
	if (this.unreg) {
		this.unreg.unregister();
	}
	this.unreg = null;

	if (icon) {
		// turn of UI
		browser.browserAction.setTitle({title: "EvalVillain: OFF"});
		browser.browserAction.setIcon({ path: "/icons/off_48.png"});
	}
}

function toggleEV() {
	if (this.unreg) {
		removeScript();
		return new Promise(res => res());
	} else {
		return register();
	}
}

browser.commands.onCommand.addListener(function(command) {
	if (command == "toggle") toggleEV();
});

function handleMessage(request, sender, _sendResponse) {
	const requestStr = typeof request === 'string' ? request : request.type;

	switch (requestStr) {
		case "on?":
			return Promise.resolve(!!this.unreg);
		case "toggle":
			return toggleEV();
		case "updated":
			if (this.unreg) {
				return register();
			}
			return Promise.resolve(false);
		case "getScriptInfo":
			// The new switcheroo script only needs the config object.
			// The matches are handled by the register function.
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
			return; // No response needed
		default:
			const er = `Unknown message received: ${JSON.stringify(request)}`;
			console.error(er);
			// Optionally return a rejection to inform the sender
			return Promise.reject(new Error(er));
	}
}

function handleInstalled(details) {
	this.debug = details.temporary;
	debugLog("[EV DEBUG] installed with debugging");
	checkStorage();
	if (this.debug) {
		register();
	}
}

browser.runtime.onMessage.addListener(handleMessage);
browser.runtime.onInstalled.addListener(handleInstalled);

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
	module.exports = { arraysEqual, defaultConfig };
}
