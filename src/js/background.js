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

// Rewritten to use callbacks for Chrome compatibility.
function getAllConf(callback) {
	browser.storage.local.get(Object.keys(defaultConfig), function(result) {
		if (chrome.runtime.lastError) {
			console.error("Error in getAllConf:", chrome.runtime.lastError);
			callback(null); // Pass null on error
		} else {
			callback(result);
		}
	});
}

// Rewritten to use callbacks for Chrome compatibility.
function getAllConfValidated(callback) {
	let attempts = 0;
	const maxAttempts = 2;

	function tryValidation() {
		getAllConf(function(dbconf) {
			if (!dbconf) {
				callback(null); // Propagate error
				return;
			}

			let success = true;
			for (const key of Object.keys(defaultConfig)) {
				if (dbconf[key] === undefined || !Array.isArray(dbconf[key])) {
					success = false;
					break;
				}
			}

			if (success) {
				callback(dbconf);
			} else {
				attempts++;
				if (attempts < maxAttempts) {
					checkStorage(tryValidation); // Pass tryValidation as the callback
				} else {
					console.error("Failed to get validated config after multiple attempts.");
					callback(null);
				}
			}
		});
	}
	tryValidation();
}

function debugLog() {
	if (!this.debug) return;
	console.log(...arguments);
}

// Rewritten to use callbacks for Chrome compatibility.
function checkStorage(callback) {
	getAllConf(function(dbconf) {
		if (!dbconf) {
			if (callback) callback();
			return; // Error handled in getAllConf
		}

		let updatesPending = 0;
		let updatesCompleted = 0;

		function onUpdateComplete() {
			updatesCompleted++;
			if (updatesCompleted === updatesPending && callback) {
				callback();
			}
		}

		function updateIt(what) {
			updatesPending++;
			const k = {};
			k[what] = defaultConfig[what];
			browser.storage.local.set(k, function() {
				if (chrome.runtime.lastError) {
					console.error(`Failed to update ${what}:`, chrome.runtime.lastError);
				} else {
					console.log(`updated ${what}`);
				}
				onUpdateComplete();
			});
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
				const defFormats = defaultConfig.formats;
				const currentNames = dbf.map(x => x.name);
				const defNames = defFormats.map(x => x.name);
				if (!arraysEqual(currentNames, defNames)) {
					updateIt(iter);
					continue; // Prevent further checks on this iteration
				}

				dbf.some((obj, i) => {
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
				});
			}
		}

		if (updatesPending === 0 && callback) {
			callback();
		}
	});
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

// Rewritten to use a callback instead of returning a Promise.
function getConfigForRegister(callback) {
	getAllConfValidated(function(dbconf) {
		if (!dbconf) {
			callback(null); // Propagate error
			return;
		}

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

		for (const what of ["needles", "blacklist", "functions", "types"]) {
			config[what] = dbconf[what]
				.filter(x => x.enabled)
				.map(x => x.pattern);
		}

		// target stuff
		const match = [];
		const targRegex = /^(https?|wss?|file|ftp|\*):\/\/(\*|\*\.[^|)}>#]+|[^|)}>#]+)\/.*$/;
		for (const i of dbconf.targets) {
			if (i.enabled) {
				if (targRegex.test(i.pattern)) {
					match.push(i.pattern);
				} else {
					// NOTE: This throw will be unhandled in a callback.
					// Consider passing an error to the callback instead.
					console.error(`Error on Target ${i.name}: ${i.pattern} must match: ${targRegex}`);
				}
			}
		}

		if (match.length === 0) {
			match.push("<all_urls>");
		}
		debugLog("[EV DEBUG] matches: %s", match);
		callback([config, match]);
	});
}


/**
* Registers the content script with the current config
**/
// Rewritten to use callbacks for Chrome compatibility.
function register() {
	return new Promise((resolve, reject) => {
		if (this.unreg != null) {
			removeScript(false);
		}

		getConfigForRegister(function(result) {
			if (!result) {
				removeScript();
				resolve(false); // Resolve with false on failure
				return;
			}
			const [config, match] = result;

			if (config.functions.length === 0) {
				removeScript();
				resolve(false);
				return;
			}

			const code = `config = ${JSON.stringify(config)};`;

			// CRITICAL NOTE FOR CHROME PORT:
			// browser.contentScripts.register is a Firefox-specific API.
			// This will NOT work in Chrome. Chrome requires content scripts to be
			// declared in manifest.json or uses the chrome.scripting API in Manifest V3.
			// The simple `window.browser = chrome;` polyfill is insufficient for this.
			browser.contentScripts.register({
				matches: match,
				js: [
					{code: code},
					{file: "/js/rewriter.js"},
					{file: "/js/switcheroo.js"}
				],
				runAt: "document_start",
				allFrames: true
			}).then(reg => {
				this.unreg = reg;
				browser.browserAction.setTitle({title: "EvalVillain: ON"});
				browser.browserAction.setIcon({path: "/icons/on_48.png"});
				debugLog("[EV_DEBUG] %cInjection Script registered", "color:#088;");
				resolve(true);
			}).catch(err => {
				console.error("Failed to register content script:", err);
				removeScript();
				reject(err);
			});
		});
	});
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

function handleMessage(request, _sender, _sendResponse) {
	if (request === "on?") {
		return new Promise(res => res(this.unreg ? true: false));
	} else if (request === "toggle") {
		return toggleEV();
	} else if (request === "updated") {
		if (this.unreg) {
			return register();
		} else {
			return new Promise(res => res(false));
		}
	} else if (request === "getScriptInfo") {
		return getConfigForRegister();
	} else {
		const er = `unkown msg: ${request}`;
		console.error(er);
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
