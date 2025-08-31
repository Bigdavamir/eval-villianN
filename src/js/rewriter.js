/* Eval Villain just jams this rewriter function into the loading page, with
 * some JSON as CONFIG. Normally Firefox does this for you from the
 * background.js file. But you could always copy paste this code anywhere you
 * want. Such as into a proxie'd response or electron instramentation.
 */
const rewriter = function(CONFIG) {
	// handled this way to preserve encoding...
	function getAllQueryParams(search) {
		return search.substr(search[0] == '?'? 1: 0)
			.split("&").map(x => x.split(/=(.*)/s));
	}

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

	function strSpliter(str, needle) {
		const ret = [];
		str.split(needle).forEach((x, index, arr)=> {
			ret.push(x)
			if (index != arr.length-1) {
				ret.push(needle)
			}
		});
		return ret;
	}

	function regexSpliter(str, needle) {
		const ret = [];
		if (needle.global == false) {
			// not global regex, so just split into two on first
			needle.lastIndex = 0;
			const m = needle.exec(str)[0];
			const l = str.split(m);
			ret.push(l[0], m, l[1]);
		} else {
			let holder = str;
			let match = null;
			needle.lastIndex = 0;
			let prevLast = 0;

			while ((match = needle.exec(str)) != null) {
				const m = match[0];
				ret.push(holder.substr(0, holder.indexOf(m)));
				ret.push(m);
				holder = holder.substr(holder.indexOf(m)+m.length);
				if (prevLast >= needle.lastIndex) {
					real.warn("[EV] Attempting to highlight matches for this regex will cause infinite loop, stopping")
					break;
				}
				prevLast = needle.lastIndex;
			}
			ret.push(holder);
		}
		return ret;
	}

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
				need.lastIndex = 0;
				if (need.test(str)) {
					need.lastIndex = 0;
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
					split: strSpliter(str, match)
				};
			}
			for (const match of this.needles.genRegMatches(str)) {
				yield {
					name: "needle", decode:"",
					search: match,
					split: regexSpliter(str, match)
				};
			}

			for (const [key, fifo] of Object.entries(this.fifoBank)) {
				for (const match of fifo.genAllMatches(str)) {
					yield {
						name: key,
						split: strSpliter(str, match.search),
						...match,
					};
				}
			}
		}
	}

	let rotateWarnAt = 8;

	function addToFifo(sObj, fifoName) {
		// [VF-PATCH:TimelineTracking] start
		if (!sObj.timestamp) {
			sObj.timestamp = new Date().toISOString();
			sObj.origin = location.href;
		}
		// [VF-PATCH:TimelineTracking] end

		// [VF-PATCH:PersistentInputs] start
		const EV_PERSISTENT_SOURCES_KEY = 'evalvillain_persistent_sources';
		try {
			if (fifoName === 'userSource') {
				const s = sObj.search;
				if (typeof s === 'string' && s.length > 0) {
					let persisted = real.JSON.parse(real.localStorage.getItem(EV_PERSISTENT_SOURCES_KEY) || '[]');
					if (!persisted.includes(s)) {
						persisted.push(s);
						real.localStorage.setItem(EV_PERSISTENT_SOURCES_KEY, real.JSON.stringify(persisted));
					}
				}
			}
		} catch (e) {
			real.warn('[EV] Error with persistent sources:', e);
		}
		// [VF-PATCH:PersistentInputs] end

		const fifo = ALLSOURCES[fifoName];
		if (!fifo) {
			throw `No ${fifoName}`;
		}

		for (const [search, decode] of deepDecode(sObj.search)) {
			const throwaway = fifo.nq({...sObj, search: search, decode: decode});

			if (throwaway % rotateWarnAt == 1) {
				rotateWarnAt *= 2;
				const intCol = CONFIG.formats.interesting;
				real.log(`%c[EV INFO]%c '${CONFIG.formats[fifoName].pretty}' fifo limit (${fifo.limit}) exceeded. EV has rotated out ${throwaway} items so far. From url: %c${location.href}`,
					intCol.highlight, intCol.default, intCol.highlight
				);
			}
		}

		function *deepDecode(s) {
			if (typeof(s) === 'string') {
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
			// [VF-PATCH:AdvancedBodySearch] start
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
			// [VF-PATCH:AdvancedBodySearch] end

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
			// [VF-PATCH:AdvancedBodySearch] start
			if (o && typeof o.getReader === 'function') { // Handle ReadableStream
				return; // Cannot handle streams synchronously
			}
			if (o && typeof o.clone === 'function') { // Handle Request/Response Body
				const contentType = o.headers.get('content-type') || '';
				if (contentType.includes('multipart/form-data')) {
					o.clone().text().then(text => {
						for(const result of parseMultipart(text, '', 'body')) {
							fifo.nq({...sObj, search: result[0], decode: result[1]});
						}
					});
				} else if (contentType.includes('application/json')) {
					o.clone().json().then(json => {
						for(const result of decodeAny(json, '', 'body')) {
							fifo.nq({...sObj, search: result[0], decode: result[1]});
						}
					});
				} else if (contentType.includes('application/octet-stream')) {
					o.clone().arrayBuffer().then(buffer => {
						for(const result of decodeAny(buffer, '', 'body')) {
							fifo.nq({...sObj, search: result[0], decode: result[1]});
						}
					});
				}
			}
			// [VF-PATCH:AdvancedBodySearch] end
			for (const prop in o) {
				yield *decodeAny(o[prop], decoded, fwd+`[${JSON.stringify(prop)}]`);
			}
		}

		function* parseMultipart(body, decoded, fwd) {
			const boundaryMatch = body.match(/boundary="?([^";\s]+)"?/);
			if (!boundaryMatch) return;
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
		}

		function *decodeAll(s, decoded="") {
			if (isNeedleBad(s)) {
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
				for (const [key, value] of getAllQueryParams(url.search)) {
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

			// [VF-PATCH:ExtendedDecoders] start
			try {
				// Multiple Base64
				let temp_b64 = s;
				let is_b64 = true;
				while(is_b64) {
					try {
						temp_b64 = real.atob.call(window, temp_b64);
						if (!isNeedleBad(temp_b64)) {
							yield *decodeAll(temp_b64, `\tx = btoa(x);\n${decoded}`);
						} else {
							is_b64 = false;
						}
					} catch(e) { is_b64 = false; }
				}

				// Hex strings
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

				// String.fromCharCode()
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
			// [VF-PATCH:ExtendedDecoders] end

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

	function argToString(arg) {
		if (typeof(arg) === "string") return arg
		if (typeof(arg) === "object") return real.JSON.stringify(arg)
		return arg.toString();
	}

	function typeCheck(arg) {
		const knownTypes = ["function", "string", "number", "object", "undefined", "boolean", "symbol"];
		const t = typeof(arg);
		if (!knownTypes.includes(t)) {
			throw `Unexpect argument type ${t} for ${arg}`;
		}
		if (!CONFIG.types.includes(t)) {
			return null;
		}
		return t;
	}

	function getArgs(args) {
		const ret = [];
		if (typeof(arguments[Symbol.iterator]) !== "function") {
			throw "Aguments can't be iterated over."
		}
		for (const i in args) {
			if (!args.hasOwnProperty(i)) continue;
			const t = typeCheck(args[i]);
			if (t === null) continue;
			const ar = { "type": t, "str": argToString(args[i]), "num": +i, }
			if (t !== "string") {
				ar["orig"] = args[i];
			}
			ret.push(ar);
		}
		return {"args" : ret, "len" : args.length};
	}

	function printTitle(name, format, num) {
		let titleGrp = "%c[EV] %c%s%c %s"
		let func = real.logGroup;
		const values = [format.default, format.highlight, name, format.default, location.href];
		if (!format.open) {
			func = real.logGroupCollapsed;
		}
		if (num >1) {
			titleGrp = "%c[EV] %c%s[%d]%c %s"
			values.splice(3,0,num);
		}
		func(titleGrp, ...values)
		return titleGrp;
	}

	function printArgs(argObj) {
		const argFormat = CONFIG.formats.args;
		if (!argFormat.use) return;
		const func = argFormat.open ? real.logGroup : real.logGroupCollapsed;

		function printFuncAlso(arg) {
			if (arg.type === "function" && arg.orig) {
				real.log(arg.orig);
			}
		}

		if (argObj.len === 1 && argObj.args.length == 1) {
			const arg = argObj.args[0];
			const argTitle ="%carg(%s):";
			const data = [argFormat.default, arg.type];
			func(argTitle, ...data);
			real.log("%c%s", argFormat.highlight, arg.str);
			printFuncAlso(arg);
			real.logGroupEnd(argTitle);
			return
		}

		const argTitle = "%carg[%d/%d](%s): "
		const total = argObj.len;
		for (const i of argObj.args) {
			func(argTitle, argFormat.default, i.num + 1, total, i.type);
			real.log("%c%s", argFormat.highlight, i.str);
			printFuncAlso(i);
			real.logGroupEnd(argTitle);
		}
	}

	function zebraBuild(arr, fmts) {
		const fmt = "%c%s".repeat(arr.length);
		const args = [];
		for (let i=0; i<arr.length; i++) {
			args.push(fmts[i % 2]);
			args.push(arr[i]);
		}
		args.unshift(fmt);
		return args;
	}

	function zebraLog(arr, fmt) {
		real.log(...zebraBuild(arr, [fmt.default, fmt.highlight]));
	}

	function zebraGroup(arr, fmt) {
		const a = zebraBuild(arr, [fmt.default, fmt.highlight]);
		if (fmt.open) {
			real.logGroup(...a);
		} else {
			real.logGroupCollapsed(...a);
		}
		return a[0];
	}

	function getInterest(argObj, intrBundle) {
		function printer(s, arg) {
			const fmt = CONFIG.formats[s.name];
			const display = s.display? s.display: s.name;
			let word = s.search;
			let dots = "";
			if (word.length > 80) {
				dots = "..."
				word = s.search.substr(0, 77);
			}
			const title = [s.param? `${display}[${s.param}]: ` :`${display}: `, word];
			if (argObj.len > 1) {
				title.push(`${dots} found (arg:`, arg.num, ")");
			} else {
				title.push(`${dots} found`);
			}
			if (s.decode) {
				title.push(" [Decoded]");
			}

			const end = zebraGroup(title, fmt);

			// [VF-PATCH:TimelineTracking] start
			if (s.timestamp && s.origin) {
				const timeFmt = {default: '#777', highlight: '#999'};
				real.log(`%cSource ingested at: %c${s.timestamp} %cfrom %c${s.origin}`,
					timeFmt.default, timeFmt.highlight, timeFmt.default, timeFmt.highlight
				);
			}
			// [VF-PATCH:TimelineTracking] end

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
			zebraLog(s.split, fmt);
			real.logGroupEnd(end);
		}

		addChangingSearch();
		const ret = [];
		for (const arg of argObj.args) {
			for (const match of intrBundle.genSplits(arg.str)) {
				ret.push(() => printer(match, arg));
			}
		}
		return ret;
	}

	function EvalVillainHook(intrBundle, name, args) {
		const fmts = CONFIG.formats;
		let argObj = {};
		try {
			argObj = getArgs(args);
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
		const printers = getInterest(argObj, intrBundle);

		if (printers.length > 0) {
			format = fmts.interesting;
			if (!format.use) {
				return false;
			}
			// [VF-PATCH:IframeAndSWBridge] start
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
			// [VF-PATCH:IframeAndSWBridge] end
		} else {
			format = fmts.title;
			if (!format.use) {
				return false;
			}
		}

		const titleGrp = printTitle(name, format, argObj.len);
		printArgs(argObj);
		printers.forEach(x=>x());

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
			self.intr = intr;
		}
		apply(_target, _thisArg, args) {
			EvalVillainHook(self.intr, this.evname, args);
			return Reflect.apply(...arguments);
		}
		construct(_target, args, _newArg) {
			EvalVillainHook(self.intr, this.evname, args);
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
			addToFifo({ display: "window.name", search: window.name }, "winname");
		}
		if (ALLSOURCES.fragment) {
			addToFifo({ search: location.hash.substring(1) }, "fragment");
		}
		if (ALLSOURCES.query) {
			const srch = window.location.search;
			if (srch.length > 1) {
				for (const [key, value] of getAllQueryParams(srch)) {
					addToFifo({ param: key, search: value }, "query");
				}
			}
		}
		if (ALLSOURCES.path) {
			const pth = location.pathname;
			if (pth.length >= 1) {
				addToFifo({search: pth}, "path");
				pth.substring(1).split('/').forEach((elm, index) => {
					addToFifo({ param: ""+index, search: elm }, "path");
				});
			}
		}
	}

	// [VF-PATCH:FrameworkSinkHooks] start
	function hookFrameworks() {
		const sourcerName = CONFIG.sourcerName;
		if (!sourcerName || !window[sourcerName]) {
			return;
		}
		const sourcer = window[sourcerName];

		try {
			const origAttachShadow = Element.prototype.attachShadow;
			Element.prototype.attachShadow = function (options) {
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
		} catch(e) { real.warn('[EV] Failed to hook Shadow DOM:', e); }

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
							const propVal = this.$props[key];
							if (typeof propVal === 'string') {
								 sourcer(`Vue.prop[${key}]`, propVal);
							}
						}
					}
					return origMount.apply(this, arguments);
				}
			}
		} catch(e) { real.warn('[EV] Failed to hook Vue:', e); }
	}
	// [VF-PATCH:FrameworkSinkHooks] end

	// [VF-PATCH:IframeAndSWBridge] start
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
				const sourcerName = CONFIG.sourcerName;
				navigator.serviceWorker.addEventListener('message', event => {
					if (event.data && event.data.type === 'EVALVILLAIN_NEW_SOURCE' && sourcerName && window[sourcerName]) {
						window[sourcerName](`SW[${event.data.sourceName}]`, event.data.sourceValue);
					}
				});
			}
		} catch (e) { real.warn('[EV] Failed to set up Service Worker listener:', e); }
	}
	// [VF-PATCH:IframeAndSWBridge] end

	function buildSearches() {
		const {formats} = CONFIG;

		function putInUse(nm) {
			if (formats[nm] && formats[nm].use) {
				ALLSOURCES[nm] = new SourceFifo(formats[nm].limit);
				return true;
			}
			return false;
		}

		let nm = "referrer";
		if (putInUse(nm) && document.referrer) {
			const url = new URL(document.referrer);
			if (url.search != location.search || url.search && url.pathname !== "/" && url.hostname !== location.hostname) {
				addToFifo({ search: document.referrer }, nm);
			}
		}

		nm = "cookie";
		if (putInUse(nm)) {
			for (const i of document.cookie.split(/;\s*/)) {
				const s = i.split("=");
				if (s.length >= 2) {
					addToFifo({ param: s[0], search: s[1] }, nm);
				} else {
					addToFifo({ search: s[0] }, nm);
				}
			}
		}

		nm = "localStore"
		if (putInUse(nm)){
			const l = real.localStorage.length;
			for (let i=0; i<l; i++) {
				const key = real.localStorage.key(i);
				addToFifo({ display: "localStorage", param: key, search: real.localStorage.getItem(key) }, nm);
			}
		}

		putInUse("winname");
		putInUse("fragment");
		putInUse("path");
		putInUse("query");

		// [VF-PATCH:PersistentInputs] start
		const EV_PERSISTENT_SOURCES_KEY = 'evalvillain_persistent_sources';
		const persistentSrcFmt = CONFIG.formats.userSource || { use: true, limit: 100, pretty: "Persistent" };
		if (persistentSrcFmt.use) {
			const nm = "userSource";
			if (!ALLSOURCES[nm]) {
				ALLSOURCES[nm] = new SourceFifo(persistentSrcFmt.limit);
			}
			try {
				const persisted = real.JSON.parse(real.localStorage.getItem(EV_PERSISTENT_SOURCES_KEY) || '[]');
				for (const item of persisted) {
					addToFifo({ display: "Persistent", search: item }, nm);
				}
			} catch (e) {
				real.warn('[EV] Error loading persistent sources:', e);
			}
		}
		// [VF-PATCH:PersistentInputs] end

		addChangingSearch();
	}

	if (CONFIG.checkId) {
		document.currentScript.setAttribute(CONFIG.checkId, true);
		delete CONFIG["checkId"];
	}

	const real = {
		log : console.log, debug : console.debug, warn : console.warn, dir : console.dir,
		error : console.error, logGroup : console.group, logGroupEnd : console.groupEnd,
		logGroupCollapsed : console.groupCollapsed, trace : console.trace, JSON : JSON,
		localStorage: localStorage, decodeURIComponent : decodeURIComponent, decodeURI : decodeURI,
		atob: atob,
	}

	const BLACKLIST = new NeedleBundle(CONFIG.blacklist);
	delete CONFIG.blacklist;

	// [VF-PATCH:PersistentInputs] start
	const EV_PERSISTENT_NEEDLES_KEY = 'evalvillain_persistent_needles';
	try {
		const persistedNeedles = real.JSON.parse(real.localStorage.getItem(EV_PERSISTENT_NEEDLES_KEY) || '[]');
		for (const p_needle of persistedNeedles) {
			if (!CONFIG.needles.includes(p_needle)) {
				CONFIG.needles.push(p_needle);
			}
		}
		let updated = false;
		const currentNeedles = real.JSON.parse(real.localStorage.getItem(EV_PERSISTENT_NEEDLES_KEY) || '[]');
		for (const needle of CONFIG.needles) {
			if (!currentNeedles.includes(needle)) {
				currentNeedles.push(needle);
				updated = true;
			}
		}
		if (updated) {
			real.localStorage.setItem(EV_PERSISTENT_NEEDLES_KEY, real.JSON.stringify(currentNeedles));
		}
	} catch (e) {
		real.warn('[EV] Error with persistent needles:', e);
	}
	// [VF-PATCH:PersistentInputs] end

	const INTRBUNDLE = new SearchBundle(
		new NeedleBundle(CONFIG.needles),
		ALLSOURCES
	);
	delete CONFIG.needles;

	buildSearches();

	for (const nm of CONFIG["functions"]) {
		try {
			applyEvalVillain(nm);
		} catch (e) {
			real.error(`[EV] Failed to apply hook for "${nm}":`, e);
		}
	}

	// [VF-FIX:InitAndSourcerFix] start
	// The original implementation had several points of failure that could halt the entire script.
	// 1. Any error inside the setup functions (hookFrameworks, etc.) would stop execution.
	// 2. The `evSourcer` global API was only created under specific configurations, making it unreliable.
	// 3. The PassiveInputListener setup could fail if its dependencies weren't ready immediately.
	// The following changes make the initialization robust.

	// Wrap patch initializations in try...catch to prevent one failing patch from stopping the whole script.
	try {
		hookFrameworks();
	} catch (e) {
		real.error("[EV] Error during FrameworkSinkHooks initialization:", e);
	}

	try {
		setupCommunicationBridges();
	} catch (e) {
		real.error("[EV] Error during IframeAndSWBridge initialization:", e);
	}
	// [VF-FIX:InitAndSourcerFix] end

	if (CONFIG.formats.logReroute.use) {
		console.log = console.info;
	}

	if (CONFIG.sinker) {
		window[CONFIG.sinker] = (x,y) => EvalVillainHook(INTRBUNDLE, x, y);
		delete CONFIG.sinker;
	}

	// [VF-FIX:InitAndSourcerFix] start
	// This logic ensures the `evSourcer` function is always available on the window,
	// preventing "is not defined" errors. The function internally checks if the feature
	// is enabled in the configuration before processing any data.
	const sourcerName = CONFIG.sourcer || 'evSourcer'; // Use configured name or default
	CONFIG.sourcerName = sourcerName; // Save for other patches to use.

	const sourcerFunc = (src_name, src_val, debug=false) => {
		const fmt = CONFIG.formats.userSource;
		// Only add to FIFO if the format is configured and enabled.
		if (fmt && fmt.use) {
			// Ensure the userSource FIFO exists.
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

	// Always expose the sourcer function to the global scope.
	window[sourcerName] = sourcerFunc;
	// [VF-FIX:InitAndSourcerFix] end

	// [VF-PATCH:PassiveInputListener] start
	function setupPassiveInputListener(retryCount = 5) {
		// [VF-FIX:InitAndSourcerFix]
		// This setup now includes a retry mechanism. If `ALLSOURCES.userSource` is not
		// ready yet (which can happen depending on config), it will wait and try again
		// instead of failing silently. This prevents a race condition during init.
		const userSourceFifo = ALLSOURCES.userSource;
		const sourcerName = CONFIG.sourcerName;
		const sourcerFn = sourcerName ? window[sourcerName] : null;

		if (!sourcerFn || !userSourceFifo) {
			if (retryCount > 0) {
				setTimeout(() => setupPassiveInputListener(retryCount - 1), 500);
			} else {
				real.warn("[EV] PassiveInputListener disabled: sourcer function or userSource FIFO not found after retries.");
			}
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
				// Only listen for the 'change' event to capture the final value.
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

	// [VF-FIX:InitAndSourcerFix]
	// Wrap the call in a try...catch to ensure it cannot halt the script.
	try {
		setupPassiveInputListener();
	} catch (e) {
		real.error("[EV] Error during PassiveInputListener initialization:", e);
	}
	// [VF-PATCH:PassiveInputListener] end

	// Now we can safely delete the sourcer from CONFIG
	if (CONFIG.sourcer) {
		delete CONFIG.sourcer;
	}

	real.log("%c[EV]%c Functions hooked for %c%s%c",
		CONFIG.formats.interesting.highlight,
		CONFIG.formats.interesting.default,
		CONFIG.formats.interesting.highlight,
		document.location.origin,
		CONFIG.formats.interesting.default
	);
};
