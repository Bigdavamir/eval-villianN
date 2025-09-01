var configList = ["targets", "needles", "blacklist", "functions", "autoOpen", "onOff", "types", "powerfeatures", "advancedsinks"];

// --- Start of bkg_api.js content ---
function amIOn() {
    return browser.runtime.sendMessage({type: "on?"});
}

function toggleBackground() {
    return browser.runtime.sendMessage({type: "toggle"});
}

function updateBackground() {
    return browser.runtime.sendMessage({type: "updated"});
}
// --- End of bkg_api.js content ---


function updateToggle(on) {
	if (typeof(on) !== "boolean") {
		console.error("unexpected message type in updateToggle");
		return;
	}
	let d = document.getElementById("toggle");
	d.checked = on;

	d = document.getElementById("toggle-label");
	d.innerText = "Villain is " + (on ? "ON" : "OFF");
}

async function update_if_on() {
	try {
        const on = await amIOn();
	    updateToggle(on);
    } catch (e) {
        console.error("Failed to check extension status:", e);
        updateToggle(false);
        const main = document.getElementById("main-content");
        const status = document.getElementById("status-message");
        main.classList.add("hidden");
        status.innerText = "Error! Could not connect to background script.";
        status.classList.remove("hidden");
    }
}

function createCheckBox(name, checked, subMenu) {
	var d = document;
	var li = d.createElement("li");
	li.className = "toggle";

	var label = d.createElement("label");
	label.className = "switch";

	var input = d.createElement("input");
	input.type = "checkbox";
	input.name = subMenu;
	input.value = name;
	input.checked = checked;
	input.id = name;
	label.appendChild(input);

	let div = d.createElement("div");
	div.className = "slider";
	label.appendChild(div);
	li.appendChild(label);

	var span = d.createElement("span");
	span.className = "label";
	span.innerText = name;

	li.appendChild(span);
	return li;
}

async function getSections() {
	const keys = ["targets", "needles", "blacklist", "functions", "types", "formats", "powerfeatures", "advancedsinks"];
	const all = await browser.storage.local.get(keys);
	const autoOpen = [];
	const onOff = [];
	if (all.formats && Array.isArray(all.formats)) {
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
	return all;
}

async function populateSubMenus() {
	const res = await getSections();
	for (let sub of configList) {
		if (!res[sub]) {
			console.error("Could not get: " + sub + " from storage.");
			continue;
		}

		var where = document.getElementById(`${sub}-sub`);
		// This was the site of the crash. If `where` is null, something is wrong.
		if (!where) {
			console.error(`Could not find element with ID: ${sub}-sub`);
			continue;
		}
		for (let itr of res[sub]) {
			if (typeof(itr.enabled) === 'boolean') {
				const displayName = itr.pretty || itr.name;
				const inpt = createCheckBox(displayName, itr.enabled, sub);
				if (itr.pretty) {
					inpt.querySelector('input').id = itr.name;
				}
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
}

async function updateSubmenu(target) {
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

	if (["autoOpen", "onOff"].includes(name)) {
		name = "formats";
	}

	const res = await browser.storage.local.get(name);
	for (let k of res[name]) {
		if (k[ident] === id && typeof(k[chg]) === 'boolean') {
			k[chg] = checked;
			break;
		}
	}
	if (id === "User Sources") {
		const {globals} = await browser.storage.local.get("globals");
		globals.forEach(x => {
			if (x.name == "sourcer")
				x.enabled = checked;
		});
		res.globals = globals;
	}

	return browser.storage.local.set(res)
		.then(updateBackground)
		.then(update_if_on)
		.catch(err => console.error("failed to get storage: " + err));
}

function listener(ev) {
	let node = ev.target.nodeName;
	let id = ev.target.id;
	let name = ev.target.name;

	if (node === "INPUT") {
		if (id === "toggle") {
			toggleBackground()
				.then(update_if_on)
				.catch(err => {
					console.error(`toggle error: ${err}`);
					updateToggle(false);
				});
		} else if (configList.includes(name)) {
			updateSubmenu(ev.target);
		}
		return
	}

	if (id.startsWith("h1-")) {
		const sub = id.substring(3);
		const element = document.getElementById(sub);
		if (element) {
			element.classList.toggle('closed');
			element.classList.toggle('open');
		}
		return;
	}
	if (id == "h1-config" ) {
		goToConfig();
		return;
	}
	if (id == "view-timeline-btn") {
        browser.tabs.create({ url: '../timeline/timeline.html' });
        return;
    }
}

function goToConfig() {
		let confUrl = browser.runtime.getURL("/pages/config/config.html");
		let tab = browser.tabs.create({url:confUrl});
		tab.then(() => window.close());
		return;
}

function showContent() {
    document.getElementById("status-message").classList.add("hidden");
    document.getElementById("main-content").classList.remove("hidden");
}

function showLoading() {
    document.getElementById("main-content").classList.add("hidden");
    document.getElementById("status-message").innerText = "Initializing...";
    document.getElementById("status-message").classList.remove("hidden");
}

async function main() {
    showLoading();
    document.addEventListener("click", listener);

    const readyPopup = async () => {
        await update_if_on();
        await populateSubMenus();
        showContent();
    };

    try {
        const isReady = await browser.runtime.sendMessage({type: "getInitStatus"});
        if (isReady) {
            await readyPopup();
        } else {
            browser.runtime.onMessage.addListener(async (message) => {
                if (message.type === "backgroundReady") {
                    await readyPopup();
                }
            });
        }
    } catch (e) {
        console.error("Error communicating with background script:", e);
        const status = document.getElementById("status-message");
        status.innerText = "Error: Could not connect to extension background. Please try reloading the extension.";
    }
}

main();
