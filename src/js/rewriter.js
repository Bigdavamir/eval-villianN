// This script is injected into the page context.....
(function() {
	'use strict';

	// CONFIG is set by the injector script on the window object.
	let CONFIG = window.EVAL_VILLAIN_CONFIG;
	if (!CONFIG) {
		console.warn("[EV] Config not found. Using minimal default.");
		CONFIG = {
			functions: [],
			blacklist: [],
			needles: [],
			types: [],
			globals: [],
			powerFeatures: [],
			advancedSinks: [],
			formats: {}
		};
	}

	const EV = {};

	//================================================================
	//   ##   ##   ######    #####   ######   #####   ###  ##
	//   ##   ##   ##       ##   ##   ##  ##  ##   ##  ##  ##
	//   ## # ##   ####     ######   ##  ##  ##   ##  ##  ##
	//   # ### #   ##       ##   ##   ##  ##  ##   ##  ##  ##
	//   ##   ##   ######   ##   ##  ######   #####   ### ##
	//
	// Module for utility and helper functions.
	//================================================================
	EV.utils = {
		getAllQueryParams: function(search) {
			return search.substr(search[0] == '?' ? 1 : 0).split("&").map(x => x.split(/=(.*)/s));
		},
		strSpliter: function(str, needle) {
			const ret = [];
			str.split(needle).forEach((x, index, arr) => {
				ret.push(x);
				if (index != arr.length - 1) ret.push(needle);
			});
			return ret;
		},
		regexSpliter: function(str, needle) {
			const ret = [];
			if (needle.global == false) {
				needle.lastIndex = 0;
				const m = needle.exec(str)[0];
				const l = str.split(m);
				ret.push(l[0], m, l[1]);
			} else {
				let holder = str, match = null, prevLast = 0;
				needle.lastIndex = 0;
				while ((match = needle.exec(str)) != null) {
					const m = match[0];
					ret.push(holder.substr(0, holder.indexOf(m)));
					ret.push(m);
					holder = holder.substr(holder.indexOf(m) + m.length);
					if (prevLast >= needle.lastIndex) {
						real.warn("[EV] Attempting to highlight matches for this regex will cause infinite loop, stopping");
						break;
					}
					prevLast = needle.lastIndex;
				}
				ret.push(holder);
			}
			return ret;
		},
		argToString: function(arg) {
			if (typeof(arg) === "string") return arg;
			if (typeof(arg) === "object") return real.JSON.stringify(arg);
			return arg.toString();
		},
		typeCheck: function(arg) {
			const knownTypes = ["function", "string", "number", "object", "undefined", "boolean", "symbol"];
			const t = typeof(arg);
			if (!knownTypes.includes(t)) throw `Unexpect argument type ${t} for ${arg}`;
			if (!CONFIG.types.includes(t)) return null;
			return t;
		},
		getArgs: function(args) {
			const ret = [];
			if (typeof(args[Symbol.iterator]) !== "function") throw "Aguments can't be iterated over.";
			for (const i in args) {
				if (!args.hasOwnProperty(i)) continue;
				const t = this.typeCheck(args[i]);
				if (t === null) continue;
				const ar = { "type": t, "str": this.argToString(args[i]), "num": +i };
				if (t !== "string") ar["orig"] = args[i];
				ret.push(ar);
			}
			return { "args": ret, "len": args.length };
		},
		printTitle: function(name, format, num) {
			let titleGrp = "%c[EV] %c%s%c %s";
			let func = real.logGroup;
			const values = [format.default, format.highlight, name, format.default, location.href];
			if (!format.open) func = real.logGroupCollapsed;
			if (num > 1) {
				titleGrp = "%c[EV] %c%s[%d]%c %s";
				values.splice(3, 0, num);
			}
			func(titleGrp, ...values);
			return titleGrp;
		},
		printArgs: function(argObj) {
			const argFormat = CONFIG.formats.args;
			if (!argFormat.use) return;
			const func = argFormat.open ? real.logGroup : real.logGroupCollapsed;
			function printFuncAlso(arg) {
				if (arg.type === "function" && arg.orig) real.log(arg.orig);
			}
			if (argObj.len === 1 && argObj.args.length == 1) {
				const arg = argObj.args[0];
				const argTitle = "%carg(%s):";
				const data = [argFormat.default, arg.type];
				func(argTitle, ...data);
				real.log("%c%s", argFormat.highlight, arg.str);
				printFuncAlso(arg);
				real.logGroupEnd(argTitle);
				return;
			}
			const argTitle = "%carg[%d/%d](%s): ";
			const total = argObj.len;
			for (const i of argObj.args) {
				func(argTitle, argFormat.default, i.num + 1, total, i.type);
				real.log("%c%s", argFormat.highlight, i.str);
				printFuncAlso(i);
				real.logGroupEnd(argTitle);
			}
		},
		zebraBuild: function(arr, fmts) {
			const fmt = "%c%s".repeat(arr.length);
			const args = [];
			for (let i = 0; i < arr.length; i++) {
				args.push(fmts[i % 2]);
				args.push(arr[i]);
			}
			args.unshift(fmt);
			return args;
		},
		zebraLog: function(arr, fmt) {
			real.log(...this.zebraBuild(arr, [fmt.default, fmt.highlight]));
		},
		zebraGroup: function(arr, fmt) {
			const a = this.zebraBuild(arr, [fmt.default, fmt.highlight]);
			if (fmt.open) {
				real.logGroup(...a);
			} else {
				real.logGroupCollapsed(...a);
			}
			return a[0];
		}
	};

	class SourceFifo {
		constructor(limit) {
			this.limit = limit;
			this.fifo = [];
			this.set = new Set();
			this.removed = 0;
		}
		nq(sObj) {
			this.set.add(sObj.search);
			this.fifo.push(sObj);
			while (this.set.size > this.limit) {
				this.removed++;
				this.dq();
			}
			return this.removed;
		}
		dq() {
			const last = this.fifo.shift();
			this.set.delete(last.search);
			return last;
		}
		has(x) {
			return this.set.has(x);
		}
		*genAllMatches(str) {
			for (const sObj of this.fifo) {
				if (str.includes(sObj.search)) {
					yield sObj;
				}
			}
		}
	}

	/** hold all interest fifos */
	const ALLSOURCES = {}; // Used to hold all interest Fifo's

	/** Contains regex/str searches for needles/blacklists **/
	class NeedleBundle {
		constructor(needleList) {
			this.needles = [];
			this.regNeedle = [];
			const test = /^\/(.*)\/(i|g|gi|ig)?$/;
			for (const need of needleList) {
				const s = test.exec(need);
				if (s) {
					const reg = new RegExp(s[1],
						s[2] === undefined? "": s[2]);
					this.regNeedle.push(reg);
				} else {
					this.needles.push(need);
				}
			}
		}
		*genStrMatches(str) {
			for (const need of this.needles) {
				if (str.includes(need)) {
					yield need;
				}
			}
		}
		*genRegMatches(str) {
			for (const need of this.regNeedle) {
				need.lastIndex = 0; // just to be sure there is no funny buisness
				if (need.test(str)) {
					need.lastIndex = 0; // This line is important b/c JS regex holds a state secretly :(
					yield need;
				}
			}
		}
		*genMatches(str) {
			for (const match of this.genStrMatches(str)) {
				yield match;
			}
			for (const match of this.genRegMatches(str)) {
				yield match;
			}
		}
		matchAny(str) {
			for (const match of this.genMatches(str)) {
				if (match) {
					return true;
				}
			}
			return false;
		}
	}

	/** Everything that might make a particular sink interesting */
	class SearchBundle {
		constructor(needles, fifoBank) {
			this.needles = needles;
			this.fifoBank = fifoBank
		}
		*genSplits(str) {
			for (const match of this.needles.genStrMatches(str)) {
				yield {
					name: "needle", decode:"",
					search: match,
					split: EV.utils.strSpliter(str, match)
				};
			}
			for (const match of this.needles.genRegMatches(str)) {
				yield {
					name: "needle", decode:"",
					search: match,
					split: EV.utils.regexSpliter(str, match)
				};
			}
			for (const [key, fifo] of Object.entries(this.fifoBank)) {
				for (const match of fifo.genAllMatches(str)) {
					yield {
						name: key,
						split: EV.utils.strSpliter(str, match.search),
						...match,
					};
				}
			}
		}
	}

	let rotateWarnAt = 8;

	/**
	 * Saves a given source string to the persistent list in browser storage,
	 * automatically handling storage quota by removing the oldest entries if needed.
	 * @param {string} source - The string to save.
	 */
	function savePersistentSourceSafe(source) {
		const EV_PERSISTENT_SOURCES_KEY = 'evalvillain_persistent_sources';
		try {
			if (typeof source !== 'string' || source.length === 0) {
				return;
			}
			browser.storage.local.get(EV_PERSISTENT_SOURCES_KEY, (result) => {
				if (browser.runtime.lastError) { return; } // Silently fail if storage is unavailable.

				let persisted = result[EV_PERSISTENT_SOURCES_KEY] || [];
				if (!persisted.includes(source)) {
					persisted.push(source);

					const MAX_STORAGE_SIZE = 4500000; // 4.5 MB
					let currentSize = JSON.stringify(persisted).length;

					if (currentSize > MAX_STORAGE_SIZE) {
						real.warn(`[EV] Persistent storage near quota limit. Pruning oldest entries.`);
						while (currentSize > MAX_STORAGE_SIZE && persisted.length > 1) {
							persisted.shift();
							currentSize = JSON.stringify(persisted).length;
						}
					}
					browser.storage.local.set({ [EV_PERSISTENT_SOURCES_KEY]: persisted });
				}
			});
		} catch (e) {
			real.warn('[EV] Error with persistent sources:', e);
		}
	}

	// set of strings to search for
	function addToFifo(sObj, fifoName) { // TODO: add blacklist arg
		// [VF-PATCH:TimelineTracking] start
		if (!sObj.timestamp) { // Add timestamp and origin if not already present
			sObj.timestamp = new Date().toISOString();
			sObj.origin = location.href;
		}
		// [VF-PATCH:TimelineTracking] end

		// [VF-PATCH:PersistentInputs]
		// Persist sources that are explicitly provided by the user via the sourcer API.
		if (fifoName === 'userSource') {
			savePersistentSourceSafe(sObj.search);
		}

		const fifo = ALLSOURCES[fifoName];
		if (!fifo) {
			throw `No ${fifoName}`;
		}
		for (const [search, decode] of deepDecode(sObj.search)) {
			const sourceEvent = {
				type: 'source',
				timestamp: sObj.timestamp,
				origin: sObj.origin,
				sourceType: fifoName,
				sourceDisplay: sObj.display || fifoName,
				sourceValue: search,
				decode: decode
			};
			saveTimelineEvent(sourceEvent);

			const throwaway = fifo.nq({...sObj, search: search, decode: decode});

			if (throwaway % rotateWarnAt == 1) {
				rotateWarnAt *= 2;
				const intCol = CONFIG.formats.interesting;
				real.log(`%c[EV INFO]%c '${CONFIG.formats[fifoName].pretty}' fifo limit (${fifo.limit}) exceeded. EV has rotated out ${throwaway} items so far. From url: %c${location.href}`,
					intCol.highlight, intCol.default, intCol.highlight
				);
			}
		}

		// [VF-PATCH:AdvancedBodySearch] start
		function* parseMultipart(body, decoded, fwd) {
			const boundaryMatch = body.match(/boundary="?([^";\s]+)"?/);
			if (!boundaryMatch) return false;
			const boundary = `--${boundaryMatch[1]}`;
			const parts = body.split(boundary).slice(1, -1);
			for (let i = 0; i < parts.length; i++) {
				const part = parts[i].trim();
				const headerEnd = part.indexOf('\r\n\r\n');
				if (headerEnd === -1) continue;
				const header = part.substring(0, headerEnd);
				const partBody = part.substring(headerEnd + 4);
				const nameMatch = header.match(/name="([^"]+)"/);
				const partName = nameMatch ? nameMatch[1] : `part_${i}`;
				const newFwd = `${fwd}['${partName}']`;
				yield* decodeAny(partBody, decoded, newFwd);
			}
			return true;
		}
		// [VF-PATCH:AdvancedBodySearch] end

		function *deepDecode(s) {
			if (typeof(s) === 'string') {
				if (s.includes('multipart/form-data') && s.includes('boundary=')) {
					if (yield* parseMultipart(s, '', '')) {
						return;
					}
				}
				yield *decodeAll(s);
			} else if (typeof(s) === "object") {
				const fwd = `\t{\n\t\tlet _ = ${JSON.stringify(s)};\n\t\t_`;
				yield *decodeAny(s, `\t\tx = _\n\t}\n`, fwd);
			}
		}

		function isNeedleBad(str) {
			if (typeof(str) !== "string" || str.length == 0 || fifo.has(str)) {
				return true;
			}
			return BLACKLIST.matchAny(str);
		}


		function *decodeAny(any, decoded, fwd) {
			if (any instanceof ArrayBuffer) {
				try {
					const text = new TextDecoder("utf-8", { fatal: true }).decode(any);
					yield* decodeAll(text, `	x = new TextEncoder().encode(x);\n${decoded}`);
				} catch (e) {
					const s = String.fromCharCode.apply(null, new Uint8Array(any));
					yield* decodeAll(s, `/* ... encoded from byte array ... */\n${decoded}`);
				}
				return;
			}
			if (Array.isArray(any)) {
				yield *decodeArray(any, decoded, fwd);
			} else if (typeof(any) == "object"){
				yield *decodeObject(any, decoded, fwd);
			} else {
				yield *decodeAll(any, fwd + "= x;\n" + decoded);
			}
		}

		function *decodeArray(a, decoded, fwd) {
			for (const i in a) {
				yield *decodeAny(a[i], decoded, fwd+`[${i}]`);
			}
		}

		function* decodeObject(o, decoded, fwd) {
			for (const prop in o) {
				yield *decodeAny(o[prop], decoded, fwd+`[${JSON.stringify(prop)}]`);
			}
		}

		function *decodeAll(s, decoded="") {
			if (isNeedleBad (s)) {
				return;
			}
			yield [s, decoded];
			try {
				const dec = real.JSON.parse(s);
				if (dec) {
					const fwd = `\t{\n\t\tlet _ = ${s};\n\t\t_`;
					yield *decodeAny(dec, `\t\tx = JSON.stringify(_);\n\t}\n${decoded}`, fwd);
					return;
				}
			} catch (_) {}
			try {
				let url = new URL(s);
				for (const [key, value] of EV.utils.getAllQueryParams(url.search)) {
					const dec = `\t{\n\t\tconst _ = new URL("${s.replaceAll('"', "%22")}");\n\t\t_.searchParams.set('${key.replaceAll('"', '\x22')}', decodeURIComponent(x));\n\t\tx = _.href;\n\t}\n` + decoded;
					yield *decodeAll(value, dec);
				}
				if (url.hash.length > 1) {
					const dec = `\t{\n\t\tconst _ = new URL("${s.replaceAll('"', "%22")}");\n\t\t_.hash = x;\n\t\tx = _.href;\n\t}\n` + decoded;
					yield *decodeAll(url.hash.substring(1), dec);
				}
			} catch (err) {}
			try {
				const dec = real.atob.call(window, s);
				if (dec) {
					yield *decodeAll(dec, `\tx = btoa(x);\n${decoded}`);
					return;
				}
			} catch (_) {}
			try {
				if (/^([0-9a-fA-F]{2})+$/.test(s)) {
					let dec = '';
					for (let i = 0; i < s.length; i += 2) {
						dec += String.fromCharCode(parseInt(s.substr(i, 2), 16));
					}
					if (dec && dec !== s && !isNeedleBad(dec)) {
						const encoder = `	x = x.split('').map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join('');\n`;
						yield *decodeAll(dec, encoder + decoded);
					}
				}
				if (s.includes('\\u')) {
					const dec = s.replace(/\\u([\d\w]{4})/gi, (match, grp) => String.fromCharCode(parseInt(grp, 16)));
					if (dec && dec !== s && !isNeedleBad(dec)) {
						const encoder = `	x = x.split('').map(c => '\\\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('');\n`;
						yield *decodeAll(dec, encoder + decoded);
					}
				}
				if (s.includes('String.fromCharCode')) {
					const match = /String\.fromCharCode\(([\d,\s]+)\)/.exec(s);
					if (match && match[1]) {
						const args = match[1].split(',').map(n => parseInt(n.trim(), 10));
						const dec = String.fromCharCode(...args);
						if (dec && !isNeedleBad(dec)) {
							const encoder = `	x = 'String.fromCharCode(' + x.split('').map(c => c.charCodeAt(0)).join(',') + ')';\n`;
							yield *decodeAll(dec, encoder + decoded);
						}
					}
				}
			} catch(e) {
				real.warn('[EV] Error during extended decoding:', e);
			}
			const dec_plus = s.replaceAll("+", " ");
			if (dec_plus !== s) {
				yield *decodeAll(dec_plus, `\tx = x.replaceAll("+", " ");\n${decoded}`);
			}
			if (!s.includes("%")) {
				return;
			}
			try {
				const dec_uri_comp = real.decodeURIComponent(s);
				if (dec_uri_comp && dec_uri_comp != s) {
					yield *decodeAll(dec_uri_comp, `\tx = encodeURIComponent(x);\n${decoded}`);
				}
			} catch(_){}
			try {
				const dec_uri = real.decodeURI(s);
				if (dec_uri && dec_uri != s) {
					yield *decodeAll(dec_uri, `\tx = encodeURIComponent(x);\n${decoded}`);
				}
			} catch(_){}
		}
	}

const EV_TIMELINE_KEY = 'evalvillain_timeline';
const MAX_TIMELINE_EVENTS = 200;

function saveTimelineEvent(event) {
	try {
		browser.storage.local.get(EV_TIMELINE_KEY, (result) => {
			if (browser.runtime.lastError) {
				// Storage API not available on this page.
				return;
			}
			let timeline = result[EV_TIMELINE_KEY] || [];
			timeline.push(event);

			if (timeline.length > MAX_TIMELINE_EVENTS) {
				timeline = timeline.slice(timeline.length - MAX_TIMELINE_EVENTS);
			}

			browser.storage.local.set({ [EV_TIMELINE_KEY]: timeline }, () => {
				if (browser.runtime.lastError) {
					real.warn('[EV] Error saving timeline event:', browser.runtime.lastError.message);
				}
			});
		});
	} catch (e) {
		// This can happen if the content script is injected into a page
		// where the extension APIs are not available (e.g., about:blank in an iframe).
		}
}

function getInterest(argObj, intrBundle) {
		addChangingSearch();
	const matches = [];
		for (const arg of argObj.args) {
			for (const match of intrBundle.genSplits(arg.str)) {
			matches.push({
				matchData: match,
				argData: { str: arg.str, num: arg.num, type: arg.type }
			});
			}
		}
	return matches;
	}

	function EvalVillainHook(intrBundle, name, args) {
		const fmts = CONFIG.formats;
		let argObj = {};
		try {
			argObj = EV.utils.getArgs(args);
		} catch(err) {
			real.log("%c[ERROR]%c EV args error: %c%s%c on %c%s%c",
				fmts.interesting.default, fmts.interesting.highlight,
				fmts.interesting.default, err, fmts.interesting.highlight,
				fmts.interesting.default, document.location.href, fmts.interesting.highlight
			);
			return false;
		}

		if (argObj.args.length == 0) {
			return false;
		}

		let format = null;
		const interestingMatches = getInterest(argObj, intrBundle);

		if (interestingMatches.length > 0) {
			format = fmts.interesting;
			if (!format.use) {
				return false;
			}

			const sinkEvent = {
				type: 'sink',
				timestamp: new Date().toISOString(),
				origin: location.href,
				sinkName: name,
				sinkArgs: argObj.args.map(a => a.str),
				sources: interestingMatches.map(m => ({
					sourceType: m.matchData.name,
					sourceValue: m.matchData.search,
					sourceTimestamp: m.matchData.timestamp,
					sourceOrigin: m.matchData.origin,
					decode: m.matchData.decode,
					argNum: m.argData.num
				}))
			};
			saveTimelineEvent(sinkEvent);

			try {
				if (navigator.serviceWorker && navigator.serviceWorker.controller) {
					navigator.serviceWorker.controller.postMessage({
						type: 'EVALVILLAIN_SINK_FOUND',
						sink: name,
						args: argObj.args.map(a => a.str),
						url: location.href
					});
				}
			} catch(e) { real.warn('[EV] Failed to post message to Service Worker:', e); }
		} else {
			format = fmts.title;
			if (!format.use) {
				return false;
			}
		}

		const titleGrp = EV.utils.printTitle(name, format, argObj.len);
		EV.utils.printArgs(argObj);

		// Recreate printer logic for console logging
		interestingMatches.forEach(m => {
			const s = m.matchData;
			const arg = m.argData;
			const fmt = CONFIG.formats[s.name];
			const display = s.display ? s.display : s.name;
			let word = typeof s.search === 'string' ? s.search : s.search.toString();
			let dots = "";
			if (word.length > 80) {
				dots = "..."
				word = word.substr(0, 77);
			}
			const title = [
				s.param ? `${display}[${s.param}]: ` : `${display}: `, word
			];
			if (argObj.len > 1) {
				title.push(`${dots} found (arg:`, arg.num, ")");
			} else {
				title.push(`${dots} found`);
			}
			if (s.decode) {
				title.push(" [Decoded]");
			}
			const end = EV.utils.zebraGroup(title, fmt);
			if (s.timestamp && s.origin) {
				const timeFmt = { default: '#777', highlight: '#999' };
				real.log(`%cSource ingested at: %c${s.timestamp} %cfrom %c${s.origin}`,
					timeFmt.default, timeFmt.highlight, timeFmt.default, timeFmt.highlight
				);
			}
			if (dots) {
				const d = "Entire needle:"
				real.logGroupCollapsed(d);
				real.log(s.search);
				real.logGroupEnd(d);
			}
			if (s.decode) {
				const d = "Encoder function:";
				real.logGroupCollapsed(d);
				real.log(s.decode)
				real.logGroupEnd(d);
			}
			EV.utils.zebraLog(s.split, fmt);
			real.logGroupEnd(end);
		});

		const stackFormat = CONFIG.formats.stack;
		if (stackFormat.use) {
			const stackTitle = "%cstack: "
			if (stackFormat.open) {
				real.logGroup(stackTitle, stackFormat.default);
			} else {
				real.logGroupCollapsed(stackTitle, stackFormat.default);
			}
			real.trace();
			real.logGroupEnd(stackTitle);
		}
		real.logGroupEnd(titleGrp);
		return false;
	}

	class evProxy {
		constructor(intr) {
			this.intr = intr;
		}
		apply(_target, _thisArg, args) {
			EvalVillainHook(this.intr, this.evname, args);
			return Reflect.apply(...arguments);
		}
		construct(_target, args, _newArg) {
			EvalVillainHook(this.intr, this.evname, args);
			return Reflect.construct(...arguments);
		}
	}

	function applyEvalVillain(evname) {
		function getFunc(n) {
			const ret = {}
			ret.where = window;
			const groups = n.split(".");
			let i = 0;
			for (i=0; i<groups.length-1; i++) {
				ret.where = ret.where[groups[i]];
				if (!ret.where) {
					return null;
				}
			}
			ret.leaf = groups[i];
			return ret ? ret : null;
		}

		const sourcer = (CONFIG.sourcerName && window[CONFIG.sourcerName]) ? window[CONFIG.sourcerName] : () => {};

		const autoSourceFetch = CONFIG.powerFeatures.find(f => f.name === 'autoSourceFetch')?.enabled;
		if (evname === 'fetch' && autoSourceFetch) {
			const originalFetch = window.fetch;
			const MAX_SIZE = 51200;
			const ALLOWED_TYPES = ['text/html', 'application/json', 'application/javascript', 'text/plain'];

			window.fetch = new Proxy(originalFetch, {
				apply: function(target, thisArg, args) {
					EvalVillainHook(INTRBUNDLE, 'fetch', args);
					const result = Reflect.apply(target, thisArg, args);
					return result.then(response => {
						const contentType = response.headers.get('content-type') || '';
						const contentLength = response.headers.get('content-length');

						if (contentLength && parseInt(contentLength, 10) > MAX_SIZE) {
							return response;
						}
						if (!ALLOWED_TYPES.some(type => contentType.includes(type))) {
							return response;
						}

						const responseProxy = new Proxy(response, {
							get: function(target, prop) {
								const originalValue = target[prop];
								if (['text', 'json'].includes(prop) && typeof originalValue === 'function') {
									return function(...args) {
										return originalValue.apply(target, args).then(body => {
											const bodyStr = (typeof body === 'object') ? JSON.stringify(body) : String(body);
											if (bodyStr.length <= MAX_SIZE && INTRBUNDLE.needles.matchAny(bodyStr)) {
												sourcer('fetch.response', body);
											}
											return body;
										});
									};
								}
								return originalValue;
							}
						});
						return responseProxy;
					});
				}
			});
			return;
		}
		if (evname === 'value(XMLHttpRequest.open)' && autoSourceFetch) {
			const originalOpen = XMLHttpRequest.prototype.open;
			XMLHttpRequest.prototype.open = new Proxy(originalOpen, {
				apply: function(target, thisArg, args) {
					EvalVillainHook(INTRBUNDLE, 'XMLHttpRequest.open', args);
					thisArg.addEventListener('load', function() {
						if (this.responseText) {
							sourcer('XHR.response', this.responseText);
						}
					}, { passive: true });
					return Reflect.apply(target, thisArg, args);
				}
			});
			return;
		}
		const autoSourcePostMessage = CONFIG.powerFeatures.find(f => f.name === 'autoSourcePostMessage')?.enabled;
		const recentMessages = new Set();
		if (evname === 'window.addEventListener' && autoSourcePostMessage) {
			const originalAddEventListener = window.addEventListener;
			window.addEventListener = new Proxy(originalAddEventListener, {
				apply: function(target, thisArg, args) {
					const [type, listener] = args;
					if (type === 'message') {
						const wrappedListener = function(event) {
							const msgData = (typeof event.data === 'object') ? JSON.stringify(event.data) : String(event.data);
							const msgKey = msgData.substring(0, 256);
							if (!recentMessages.has(msgKey)) {
								sourcer('postMessage.data', event.data);
								recentMessages.add(msgKey);
								setTimeout(() => recentMessages.delete(msgKey), 5000);
							}
							return listener.apply(this, arguments);
						};
						args[1] = wrappedListener;
					}
					EvalVillainHook(INTRBUNDLE, 'window.addEventListener', args);
					return Reflect.apply(target, thisArg, args);
				}
			});
			return;
		}
		if (evname === 'WebSocket') {
			const originalWebSocket = window.WebSocket;
			window.WebSocket = new Proxy(originalWebSocket, {
				construct: function(target, args) {
					EvalVillainHook(INTRBUNDLE, 'new WebSocket()', args);
					const instance = Reflect.construct(target, args);
					return new Proxy(instance, {
						set: function(target, prop, value) {
							if (prop === 'onmessage' && typeof value === 'function') {
								target[prop] = function(event) {
									sourcer('WebSocket.onmessage', event.data);
									return value.apply(this, arguments);
								};
							} else {
								target[prop] = value;
							}
							return true;
						}
					});
				}
			});
			return;
		}

		const ownprop = /^(set|value)\(([a-zA-Z.]+)\)\s*$/.exec(evname);
		const ep = new evProxy(INTRBUNDLE);
		ep.evname = evname;
		if (ownprop) {
			const prop = ownprop[1];
			const f = getFunc(ownprop[2]);
			const orig = Object.getOwnPropertyDescriptor(f.where.prototype, f.leaf)[prop];
			Object.defineProperty(f.where.prototype, f.leaf, {[prop] : new Proxy(orig, ep)});
		} else if (!/^[a-zA-Z.]+$/.test(evname)) {
			real.log("[EV] name: %s invalid, not hooking", evname);
		} else {
			const f = getFunc(evname);
			f.where[f.leaf] = new Proxy(f.where[f.leaf], ep);
		}
	}

	function addChangingSearch() {
		if (ALLSOURCES.winname) {
			addToFifo({
				display: "window.name",
				search: window.name,
			}, "winname");
		}
		if (ALLSOURCES.fragment) {
			addToFifo({
				search: location.hash.substring(1),
			}, "fragment");
		}
		if (ALLSOURCES.query) {
			const srch = window.location.search;
			if (srch.length > 1) {
				for (const [key, value] of EV.utils.getAllQueryParams(srch)) {
					addToFifo({
						param: key,
						search: value
					}, "query");
				}
			}
		}
		if (ALLSOURCES.path) {
			const pth = location.pathname;
			if (pth.length >= 1) {
				addToFifo({search: pth}, "path");
				pth.substring(1)
					.split('/').forEach((elm, index) => {
						addToFifo({
							param: ""+index,
							search: elm
						}, "path");
				});
			}
		}
	}

	function hookFrameworks() {
		const sourcerName = CONFIG.sourcerName;
		const sourcer = window[sourcerName];

		const hookProp = (proto, prop, name) => {
			try {
				if (typeof proto !== 'undefined' && proto.prototype) {
					const descriptor = Object.getOwnPropertyDescriptor(proto.prototype, prop);
					if (descriptor && descriptor.set) {
						const originalSetter = descriptor.set;
						const proxy = new evProxy(INTRBUNDLE);
						proxy.evname = name || `set(${proto.name}.${prop})`;
						Object.defineProperty(proto.prototype, prop, { set: new Proxy(originalSetter, proxy) });
					}
				}
			} catch (e) { real.warn(`[EV] Failed to hook ${name || prop}:`, e); }
		};
		const hookMethod = (proto, prop, name) => {
			try {
				if (proto && proto.prototype && proto.prototype[prop]) {
					const originalMethod = proto.prototype[prop];
					const proxy = new evProxy(INTRBUNDLE);
					proxy.evname = name || `${proto.name}.${prop}`;
					proto.prototype[prop] = new Proxy(originalMethod, proxy);
				}
			} catch (e) { real.warn(`[EV] Failed to hook ${name || prop}:`, e); }
		};
		const hookDangerousUrlScheme = (proto, prop) => {
			try {
				if (typeof proto !== 'undefined' && proto.prototype) {
					const descriptor = Object.getOwnPropertyDescriptor(proto.prototype, prop);
					if (descriptor && descriptor.set) {
						const originalSetter = descriptor.set;
						const proxy = {
							apply: function(target, thisArg, args) {
								const value = args[0];
								if (typeof value === 'string') {
									const lowerValue = value.trim().toLowerCase();
									if (lowerValue.startsWith('javascript:') || lowerValue.startsWith('data:')) {
										EvalVillainHook(INTRBUNDLE, `set(${proto.name}.${prop})`, [value]);
									}
								}
								return Reflect.apply(target, thisArg, args);
							}
						};
						Object.defineProperty(proto.prototype, prop, { set: new Proxy(originalSetter, proxy) });
					}
				}
			} catch (e) { real.warn(`[EV] Failed to hook ${proto.name}.prototype.${prop}:`, e); }
		};

		if (CONFIG.advancedSinks.find(s => s.name === 'shadowRoot')?.enabled) hookProp(ShadowRoot, 'innerHTML');
		if (CONFIG.advancedSinks.find(s => s.name === 'insertAdjacentHTML')?.enabled) hookMethod(Element, 'insertAdjacentHTML');
		if (CONFIG.advancedSinks.find(s => s.name === 'rangeCreateContextualFragment')?.enabled) hookMethod(Range, 'createContextualFragment');
		if (CONFIG.advancedSinks.find(s => s.name === 'createHTMLDocument')?.enabled) hookMethod(Document.implementation, 'createHTMLDocument');
		if (CONFIG.advancedSinks.find(s => s.name === 'iframeSrcdoc')?.enabled) hookProp(HTMLIFrameElement, 'srcdoc');
		if (CONFIG.advancedSinks.find(s => s.name === 'elementOuterHTML')?.enabled) hookProp(Element, 'outerHTML');
		if (CONFIG.advancedSinks.find(s => s.name === 'documentDomain')?.enabled) hookProp(Document, 'domain');
		if (CONFIG.advancedSinks.find(s => s.name === 'styleInnerHTML')?.enabled) hookProp(HTMLStyleElement, 'innerHTML');
		if (CONFIG.advancedSinks.find(s => s.name === 'cssText')?.enabled) hookProp(CSSStyleSheet, 'cssText');

		if (CONFIG.advancedSinks.find(s => s.name === 'dangerousProtocols')?.enabled) {
			hookDangerousUrlScheme(HTMLAnchorElement, 'href');
			hookDangerousUrlScheme(HTMLLinkElement, 'href');
			hookDangerousUrlScheme(HTMLScriptElement, 'src');
			hookDangerousUrlScheme(HTMLImageElement, 'src');
		}

		if (CONFIG.advancedSinks.find(s => s.name === 'domParser')?.enabled) {
			try {
				if (DOMParser.prototype.parseFromString) {
					const originalMethod = DOMParser.prototype.parseFromString;
					const proxy = {
						apply: function(target, thisArg, args) {
							const [string, type] = args;
							if (type === 'text/html') EvalVillainHook(INTRBUNDLE, 'DOMParser.parseFromString', [string]);
							return Reflect.apply(target, thisArg, args);
						}
					};
					DOMParser.prototype.parseFromString = new Proxy(originalMethod, proxy);
				}
			} catch (e) { real.warn('[EV] Failed to hook DOMParser.prototype.parseFromString:', e); }
		}

		// --- Existing framework source hooks (these are not considered "advanced sinks" for this setting) ---
		if (!sourcer) return;

		try {
			const origAttachShadow = Element.prototype.attachShadow;
			Element.prototype.attachShadow = function(options) {
				const shadowRoot = origAttachShadow.call(this, options);
				const scripts = shadowRoot.querySelectorAll('script');
				scripts.forEach((script, i) => {
					if (script.src) {
						sourcer(`ShadowDOM.script[${i}].src`, script.src);
					}
					if (script.innerHTML) {
						sourcer(`ShadowDOM.script[${i}].innerHTML`, script.innerHTML);
					}
				});
				return shadowRoot;
			};
		} catch(e) { real.warn('[EV] Failed to hook Shadow DOM sources:', e); }
		try {
			if (window.React && window.React.createElement) {
				const origCreateElement = window.React.createElement;
				window.React.createElement = function(type, props, ...children) {
					if (props) {
						if (props.dangerouslySetInnerHTML && props.dangerouslySetInnerHTML.__html) {
							sourcer('React.dangerouslySetInnerHTML', props.dangerouslySetInnerHTML.__html);
						}
						for (const propName in props) {
							if (propName.toLowerCase() === 'href' || propName.toLowerCase() === 'src' || propName.toLowerCase().startsWith('on')) {
								if (typeof props[propName] === 'string') {
									sourcer(`React.prop[${propName}]`, props[propName]);
								}
							}
						}
					}
					return origCreateElement.apply(this, arguments);
				};
			}
		} catch(e) { real.warn('[EV] Failed to hook React:', e); }
		try {
			if (window.Vue && window.Vue.prototype && window.Vue.prototype.$mount) {
				const origMount = window.Vue.prototype.$mount;
				window.Vue.prototype.$mount = function() {
					if (this.$props) {
						for (const key in this.$props) {
							if (typeof this.$props[key] === 'string') {
								 sourcer(`Vue.prop[${key}]`, this.$props[key]);
							}
						}
					}
					return origMount.apply(this, arguments);
				}
			}
		} catch(e) { real.warn('[EV] Failed to hook Vue:', e); }

		// --- Angular Hook ---
		try {
			// Modern Angular (v9+ with Ivy)
			if (window.ng && typeof window.ng.applyChanges === 'function') {
				const originalApplyChanges = window.ng.applyChanges;
				const proxy = {
					apply: function(target, thisArg, args) {
						const component = args[0];
						if (component) {
							for (const key in component) {
								if (Object.prototype.hasOwnProperty.call(component, key)) {
									const propVal = component[key];
									// Source primitive types that are not functions
									if (propVal !== null && typeof propVal !== 'object' && typeof propVal !== 'function') {
										sourcer(`Angular.prop[${key}]`, propVal);
									}
								}
							}
						}
						return Reflect.apply(target, thisArg, args);
					}
				};
				window.ng.applyChanges = new Proxy(originalApplyChanges, proxy);
			}
			// Fallback for older AngularJS
			else if (window.angular && typeof window.angular.element === 'function') {
				const originalElement = window.angular.element;
				const proxy = {
					apply: function(target, thisArg, args) {
						const result = Reflect.apply(target, thisArg, args);
						try {
							if (result && result.scope()) {
								const scope = result.scope();
								for (const key in scope) {
									if (Object.prototype.hasOwnProperty.call(scope, key) && !key.startsWith('$')) {
										const propVal = scope[key];
										if (typeof propVal === 'string') {
											sourcer(`AngularJS.scope[${key}]`, propVal);
										}
									}
								}
							}
						} catch(e) { /* ignore */ }
						return result;
					}
				};
				window.angular.element = new Proxy(originalElement, proxy);
			}
		} catch(e) { real.warn('[EV] Failed to hook Angular:', e); }
	}

	function hookJQuerySinks() {
		if (typeof window.jQuery !== 'function') {
			return; // jQuery not found, do nothing.
		}

		const $ = window.jQuery;
		const methodsToHook = ['html', 'append', 'prepend', 'before', 'after'];

		methodsToHook.forEach(methodName => {
			try {
				const originalMethod = $.fn[methodName];
				if (typeof originalMethod !== 'function') return;

				$.fn[methodName] = new Proxy(originalMethod, {
					apply: function(target, thisArg, args) {
						if (args.length > 0) {
							EvalVillainHook(INTRBUNDLE, `jQuery.${methodName}`, args);
						}
						return Reflect.apply(target, thisArg, args);
					}
				});
			} catch (e) {
				real.warn(`[EV] Failed to hook jQuery.${methodName}:`, e);
			}
		});

		try {
			const originalParseHTML = $.parseHTML;
			if (typeof originalParseHTML !== 'function') return;

			$.parseHTML = new Proxy(originalParseHTML, {
				apply: function(target, thisArg, args) {
					if (args.length > 0) {
						EvalVillainHook(INTRBUNDLE, 'jQuery.parseHTML', args);
					}
					return Reflect.apply(target, thisArg, args);
				}
			});
		} catch (e) {
			real.warn('[EV] Failed to hook jQuery.parseHTML:', e);
		}
	}

	function setupCommunicationBridges() {
		function applyToFrame(frameWindow) {
			function getFuncInFrame(n) {
				const ret = {};
				ret.where = frameWindow;
				const groups = n.split(".");
				let i = 0;
				for (i = 0; i < groups.length - 1; i++) {
					ret.where = ret.where[groups[i]];
					if (!ret.where) return null;
				}
				ret.leaf = groups[i];
				return ret;
			}

			for (const evname of CONFIG["functions"]) {
				try {
					const ownprop = /^(set|value)\(([a-zA-Z.]+)\)\s*$/.exec(evname);
					const ep = new evProxy(INTRBUNDLE);
					ep.evname = evname;

					if (ownprop) {
						const prop = ownprop[1];
						const f = getFuncInFrame(ownprop[2]);
						if (f && f.where && typeof f.where.prototype === 'object' && f.where.prototype !== null) {
							const orig = Object.getOwnPropertyDescriptor(f.where.prototype, f.leaf);
							if (orig && orig[prop]) {
								Object.defineProperty(f.where.prototype, f.leaf, { [prop]: new Proxy(orig[prop], ep) });
							}
						}
					} else if (/^[a-zA-Z.]+$/.test(evname)) {
						const f = getFuncInFrame(evname);
						if (f && f.where && f.where[f.leaf]) {
							const desc = Object.getOwnPropertyDescriptor(f.where, f.leaf);
							if (desc && desc.configurable) {
							   f.where[f.leaf] = new Proxy(f.where[f.leaf], ep);
							}
						}
					}
				} catch (e) {
					real.warn(`[EV] Failed to hook ${evname} in iframe:`, e);
				}
			}
		}

		for (let i = 0; i < window.frames.length; i++) {
			try {
				if (window.frames[i].location.origin === window.location.origin) {
					real.log(`[EV] Applying hooks to same-origin iframe #${i}`);
					applyToFrame(window.frames[i].window);
				}
			} catch (e) {}
		}
		try {
			if (navigator.serviceWorker) {
				navigator.serviceWorker.addEventListener('message', event => {
					if (event.data && event.data.type === 'EVALVILLAIN_NEW_SOURCE' && CONFIG.sourcerName && window[CONFIG.sourcerName]) {
						window[CONFIG.sourcerName](`SW[${event.data.sourceName}]`, event.data.sourceValue);
					}
				});
			}
		} catch (e) { real.warn('[EV] Failed to set up Service Worker listener:', e); }
	}

	function setupPassiveInputListener() {
		const userSourceFifo = ALLSOURCES.userSource;
		const sourcerFn = window[CONFIG.sourcerName];

		if (!sourcerFn || !userSourceFifo) {
			real.warn("[EV] PassiveInputListener disabled: sourcer function or userSource FIFO not found.");
			return;
		}

		const handleInput = (event) => {
			const target = event.target;
			if (target.type === 'password') return;
			const value = target.value.trim();
			if (value === '' || userSourceFifo.has(value)) return;
			sourcerFn("PassiveInputListener", value, true);
		};

		const attachListeners = (element) => {
			if ((element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') && !element.dataset.ev_listener) {
				element.addEventListener('change', handleInput, { passive: true });
				element.dataset.ev_listener = true;
			}
		};

		document.querySelectorAll('input, textarea').forEach(attachListeners);

		const observer = new MutationObserver((mutationsList) => {
			for (const mutation of mutationsList) {
				if (mutation.type === 'childList') {
					mutation.addedNodes.forEach(node => {
						if (node.nodeType === Node.ELEMENT_NODE) {
							attachListeners(node);
							node.querySelectorAll('input, textarea').forEach(attachListeners);
						}
					});
				}
			}
		});

		observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
	}

	function buildSearches() {
		const {formats} = CONFIG;
		function putInUse(nm) {
			if (formats[nm] && formats[nm].use) {
				ALLSOURCES[nm] = new SourceFifo(formats[nm].limit);
				return true;
			}
			return false;
		}
		if (putInUse("referrer") && document.referrer) {
			const url = new URL(document.referrer);
			if (url.search != location.search || url.search && url.pathname !== "/" && url.hostname !== location.hostname) {
				addToFifo({
					search: document.referrer
				}, "referrer");
			}
		}
		if (putInUse("cookie")) {
			for (const i of document.cookie.split(/;\s*/)) {
				const s = i.split("=");
				if (s.length >= 2) {
					addToFifo({
						param: s[0],
						search: s[1],
					}, "cookie");
				} else {
					addToFifo({
						search: s[0],
					}, "cookie");
				}
			}
		}
		if (putInUse("localStore")){
			const l = real.localStorage.length;
			for (let i=0; i<l; i++) {
				const key = real.localStorage.key(i);
				addToFifo({
					display: "localStorage",
					param: key,
					search: real.localStorage.getItem(key),
				}, "localStore");
			}
		}

		putInUse("winname");
		putInUse("fragment");
		putInUse("path");
		putInUse("query");

		const EV_PERSISTENT_SOURCES_KEY = 'evalvillain_persistent_sources';
		const persistentSrcFmt = CONFIG.formats.userSource || { use: true, limit: 100, pretty: "Persistent" };
		if (persistentSrcFmt.use) {
			const nm = "userSource";
			if (!ALLSOURCES[nm]) {
				ALLSOURCES[nm] = new SourceFifo(persistentSrcFmt.limit);
			}
			try {
				browser.storage.local.get(EV_PERSISTENT_SOURCES_KEY, (result) => {
					const persisted = result[EV_PERSISTENT_SOURCES_KEY] || [];
					for (const item of persisted) {
						addToFifo({
							display: "Persistent",
							search: item,
						}, nm);
					}
				});
			} catch (e) {
				real.warn('[EV] Error loading persistent sources:', e);
			}
		}
		addChangingSearch();
	}

	const real = {
		log : console.log,
		debug : console.debug,
		warn : console.warn,
		dir : console.dir,
		error : console.error,
		logGroup : console.group,
		logGroupEnd : console.groupEnd,
		logGroupCollapsed : console.groupCollapsed,
		trace : console.trace,
		JSON : JSON,
		localStorage: localStorage,
		decodeURIComponent : decodeURIComponent,
		decodeURI : decodeURI,
		atob: atob,
	}

	const BLACKLIST = new NeedleBundle(CONFIG.blacklist);

	const EV_PERSISTENT_NEEDLES_KEY = 'evalvillain_persistent_needles';
	try {
		browser.storage.local.get(EV_PERSISTENT_NEEDLES_KEY, (result) => {
			const persistedNeedles = result[EV_PERSISTENT_NEEDLES_KEY] || [];
			for (const p_needle of persistedNeedles) {
				if (!CONFIG.needles.includes(p_needle)) {
					CONFIG.needles.push(p_needle);
				}
			}
			let updated = false;
			const currentNeedles = result[EV_PERSISTENT_NEEDLES_KEY] || [];
			for (const needle of CONFIG.needles) {
				if (!currentNeedles.includes(needle)) {
					currentNeedles.push(needle);
					updated = true;
				}
			}
			if (updated) {
				browser.storage.local.set({ [EV_PERSISTENT_NEEDLES_KEY]: currentNeedles });
			}
		});
	} catch (e) {
		real.warn('[EV] Error with persistent needles:', e);
	}

	const INTRBUNDLE = new SearchBundle(
		new NeedleBundle(CONFIG.needles),
		ALLSOURCES
	);

	buildSearches();

	if (CONFIG.sinker) {
		window[CONFIG.sinker] = (x,y) => EvalVillainHook(INTRBUNDLE, x, y);
	}

	const sourcerName = (CONFIG.globals.find(g => g.name === 'sourcer' && g.enabled) || {}).pattern || 'evSourcer';
	CONFIG.sourcerName = sourcerName;
	window[sourcerName] = (src_name, src_val, debug=false) => {
		const fmt = CONFIG.formats.userSource;
		if (fmt && fmt.use) {
			if (!ALLSOURCES.userSource) {
				ALLSOURCES.userSource = new SourceFifo(fmt.limit);
			}
			if (debug) {
				const o = typeof(src_val) === 'string'? src_val: real.JSON.stringify(src_val);
				real.debug(`[EV] ${sourcerName}[${src_name}] from ${document.location.origin}  added:\n ${o}`);
			}
			addToFifo({ display: `${sourcerName}[${src_name}]`, search: src_val }, "userSource");
		} else {
			real.warn(`[EV] evSourcer called, but 'User Sources' feature is disabled in config.`);
		}
		return false;
	};

	for (const nm of CONFIG["functions"]) {
		try {
			applyEvalVillain(nm);
		} catch (e) {
			real.error(`[EV] Failed to apply hook for "${nm}":`, e);
		}
	}

	try { hookFrameworks(); } catch (e) { real.error("[EV] Error during FrameworkSinkHooks init:", e); }
	try { setupCommunicationBridges(); } catch (e) { real.error("[EV] Error during IframeAndSWBridge init:", e); }
	try { setupPassiveInputListener(); } catch (e) { real.error("[EV] Error during PassiveInputListener init:", e); }

	if (CONFIG.formats.logReroute.use) {
		console.log = console.info;
	}

	real.log("%c[EV]%c Functions hooked for %c%s%c",
		CONFIG.formats.interesting.highlight,
		CONFIG.formats.interesting.default,
		CONFIG.formats.interesting.highlight,
		document.location.origin,
		CONFIG.formats.interesting.default
	);
})();
