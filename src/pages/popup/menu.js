var configList = ["targets", "needles", "blacklist", "functions", "autoOpen", "onOff", "types"];
function updateToggle(on) {
	if (typeof(on) !== "boolean") {
		console.error("unexpected message type");
		return;
	}
	let d = document.getElementById("toggle");
	d.checked = on;

	d = document.getElementById("toggle-label");
	d.innerText = "Villain is " + (on ? "ON" : "OFF");
}

// Rewritten to use callbacks for Chrome compatibility.
function update_if_on() {
	amIOn().then(updateToggle).catch(err => {
		console.error("Error getting toggle state:", err);
		updateToggle(false);
	});
}

function createCheckBox(name, checked, subMenu) {
	var d = document;
	var li = d.createElement("li");
	li.className = "toggle";

	// first child of li
	var label = d.createElement("label");
	label.className = "switch";

	// first child of label
	var input = d.createElement("input");
	input.type = "checkbox";
	input.name = subMenu;
	input.value = name;
	input.checked = checked;
	input.id = name;
	label.appendChild(input);

	// second child of label
	let div = d.createElement("div");
	div.className = "slider";
	label.appendChild(div);
	li.appendChild(label);

	// second child of li
	var span = d.createElement("span");
	span.className = "label";
	span.innerText = name;

	li.appendChild(span);
	return li;
}

// Rewritten to use a callback instead of returning a Promise.
function getSections(callback) {
	browser.storage.local.get(["targets", "needles", "blacklist", "functions", "types", "formats"], function(all) {
		if (chrome.runtime.lastError) {
			console.error("Error in getSections:", chrome.runtime.lastError);
			return;
		}
		const autoOpen = [];
		const onOff = [];
		if (all.formats) {
			for (let k of all.formats) {
				autoOpen.push({
					name: k.pretty,
					pattern: k.name,
					enabled: k.open,
				});
				onOff.push({
					name: k.pretty,
					pattern: k.name,
					enabled: k.use,
				});
			}
		}
		all.autoOpen = autoOpen;
		all.onOff = onOff;
		delete all.formats;
		callback(all);
	});
}

// Rewritten to use a callback from getSections.
function populateSubMenus() {
	getSections(function(res) {
		for (let sub of configList) {
			if (!res[sub]) {
				console.error("Could not get: " + sub);
				continue; // Continue to next item in configList
			}

			var where = document.getElementById(`${sub}-sub`);
			for (let itr of res[sub]) {
				if (typeof(itr.enabled) === 'boolean') {
					const inpt = createCheckBox(itr.name, itr.enabled, sub);
					where.appendChild(inpt);
				}
			}

			if (res[sub].length == 0) {
				const em = document.createElement("em");
				em.innerText = "Nothing Configured";
				em.className = "configure";
				em.onclick = () => goToConfig();
				where.appendChild(em);
			}
		}
	});
}

// Rewritten to use nested callbacks for Chrome compatibility.
function updateSubmenu(target) {
	let name = target.name;
	const {checked, id} = target;
	let chg = "enabled";
	let ident = "name";

	if (name === "autoOpen") {
		chg = "open";
		ident = "pretty";
	} else if (name === "onOff") {
		chg = "use";
		ident = "pretty";
	}

	let storageKey = (["autoOpen", "onOff"].includes(name)) ? "formats" : name;

	browser.storage.local.get([storageKey], function(res) {
		if (chrome.runtime.lastError) {
			console.error("Failed to get storage for", storageKey, ":", chrome.runtime.lastError);
			return;
		}

		for (let k of res[storageKey]) {
			if (k[ident] === id && typeof(k[chg]) === 'boolean') {
				k[chg] = checked;
				break;
			}
		}

		const finalUpdate = function(dataToSet) {
			browser.storage.local.set(dataToSet, function() {
				if (chrome.runtime.lastError) {
					console.error("Failed to set storage:", chrome.runtime.lastError);
					return;
				}
				updateBackground().then(update_if_on).catch(err => console.error("Failed to update background:", err));
			});
		};

		if (id === "User Sources") {
			browser.storage.local.get(["globals"], function(globalsRes) {
				if (chrome.runtime.lastError) {
					console.error("Failed to get globals:", chrome.runtime.lastError);
					finalUpdate(res); // Still try to update the original data
					return;
				}
				globalsRes.globals.forEach(x => {
					if (x.name == "sourcer")
						x.enabled = checked;
				});
				res.globals = globalsRes.globals;
				finalUpdate(res);
			});
		} else {
			finalUpdate(res);
		}
	});
}


function listener(ev) {
	let node = ev.target.nodeName;
	let id = ev.target.id;
	let name = ev.target.name;

	if (node === "INPUT") {
		if (id === "toggle") {															// on off button
			toggleBackground()
				.then(update_if_on)
				.catch(err => {
					console.error(`toggle error: ${err}`);
					updateToggle(false);
				});
		} else if (configList.includes(name)) {						// submenu checkbox?
			updateSubmenu(ev.target);
		}
		return
	}

	if (["h1-functions", "h1-targets", "h1-enable",	"h1-autoOpen", "h1-onOff", "h1-blacklist",	"h1-needles", "h1-types"].includes(id)) {
		let sub = id.substr(3);
		let formats = document.getElementById(sub);
		formats.classList.toggle('closed');
		formats.classList.toggle('open');
		return
	}
	if (id == "h1-config" ) {
		goToConfig();
		return;
	}
}

function goToConfig() {
		// Using browser.* is fine here because of the polyfill.
		let confUrl = browser.runtime.getURL("/pages/config/config.html");
		browser.tabs.create({url:confUrl}).then(() => window.close());
		return;
}

update_if_on();
document.addEventListener("click", listener);
populateSubMenus();
