// This file has been refactored to use callback-based storage APIs for Chrome compatibility.
const configList = ["targets", "needles",  "blacklist", "functions", "globals"];
const normalHeaders = ["enabled", "name", "pattern"];

function getTableData(tblName) {
	const tbl = document.getElementById(`${tblName}-form`);
	return Array.from(tbl.querySelectorAll(".row:not(:first-child)")).map(row => {
		const obj = {};
		obj.row = row;

		for (const h of normalHeaders) {
			const input = row.querySelector(`input[name='${h}']`);
			if (input.type === "checkbox") {
				obj[h] = input.checked;
			} else {
				obj[h] = input.value;
			}
		}
		return obj;
	})
}

function unsavedTable(tblName) {
	function markSaved(v) {
		const butt = document.getElementById(`save-${tblName}`);
		if (v) {
			butt.disabled = true;
		} else {
			butt.classList.remove("saved");
			butt.disabled = false;
		}
	}

	function compareFormatData(saveData) {
		if (!saveData || !saveData.formats) {
			markSaved(false); // Can't compare, assume unsaved
			return;
		}
		for (const [save, nm, value] of genFormatPairs(tblName, saveData)) {
			const test = typeof(save[nm]) == "number"? Number(value): value;
			if (save[nm] != test) {
				markSaved(false);
				return;
			}
		}
		markSaved(true);
	}

	function compareData(saveData) {
		if (!saveData || !saveData[tblName]) {
			markSaved(false); // Can't compare, assume unsaved
			return;
		}
		const tblData = getTableData(tblName);
		const saved = saveData[tblName];
		if (saved.length !== tblData.length) {
			markSaved(false);
			return;
		}

		for (let i=0; i<tblData.length; i++) {
			for (const h of normalHeaders) {
				if (saved[i][h] != tblData[i][h]) {
					markSaved(false);
					return;
				}
			}
		}
		markSaved(true);
	}

	const key = ["formats","limits"].includes(tblName) ? "formats" : tblName;
	const callback = ["formats","limits"].includes(tblName) ? compareFormatData : compareData;

	browser.storage.local.get([key], function(result) {
		if (chrome.runtime.lastError) {
			console.error("Error in unsavedTable:", chrome.runtime.lastError);
			markSaved(false);
		} else {
			callback(result);
		}
	});
}

function createField(name, value, disabled=false) {
	const div = document.createElement("div");
	div.className = "cell";
	const input = document.createElement("input");
	input.disabled = disabled;

	input.type = "text";
	input.value = value;
	input.name = name;
	if (!disabled) {
		input.onblur = function(e) {
			validate(e.target);
			unsavedTable(e.target
				.parentElement
				.parentElement
				.parentElement
				.parentElement
				.id.replace("-form", "")
			);
		};
	}

	div.appendChild(input);
	return div;
}

function defAddRow(tblName, ex, focus=false) {
	function addDelete() {
		const delRow = document.createElement("div");
		delRow.className = "row";
		const ecks = document.createElement("ecks");
		ecks.innerText = "\u2297"; // CIRCLED TIMES
		ecks.className = "ecks";
		delRow.appendChild(ecks);
		ecks.onclick = function() {
			for (const input of row.getElementsByTagName("input")) {
				if (input.type === "text") {
					removeFromErrorArray(input, tblName);
				}
			}
			row.remove();
			delRow.remove();
			unsavedTable(tblName);
		}
		document.getElementById(tblName + "-deletes").appendChild(delRow);
	}

	function createSwitch() {
		const div = document.createElement("div");
		div.className = "cell";
		const label = document.createElement("label");
		label.className = "switch";
		const input = document.createElement("input");
		input.type = "checkbox";
		input.name = "enabled";
		input.checked = ex.enabled;
		input.onclick = () => unsavedTable(tblName);

		const slider = document.createElement("div");
		slider.className = "slider";

		label.appendChild(input);
		label.appendChild(slider);
		div.appendChild(label);
		return div;
	}

	const row = document.createElement("div");
	row.className = "row";
	const cols = [];

	for (const cls of ["col-sm", "col-md", "col-lg"]) {
		const div = document.createElement("div");
		div.className = cls;
		cols.push(div);
	}

	cols[0].appendChild(createSwitch());
	cols[1].appendChild(createField("name", ex.name, tblName == "globals"));
	cols[2].appendChild(createField("pattern", ex.pattern));

	cols.forEach(c => row.appendChild(c));

	document.getElementById(`${tblName}-form`).appendChild(row);
	if (tblName != "globals") {
		addDelete();
	}
	if (focus) {
		row.getElementsByTagName("input")[1].focus();
	}
}

function rowFromName(tbl, rowName) {
	const nodes = tbl.querySelector(`input[name='${rowName}']`)
		?.parentElement
		?.parentElement
		.querySelectorAll("input");
	return nodes? Array.from(nodes): undefined;
}

function *genFormatPairs(tblName, res) {
	if (!res || !res.formats) return;
	const saved = res.formats;
	const tbl = document.getElementById(`${tblName}-form`);
	if (!tbl) {
		throw "Unknown table name";
	}

	for (const save of saved) {
		const cols = rowFromName(tbl, save.name);
		if (cols && cols.length > 0 && cols[0].name === save.name) {
			for (const val of cols) {
				const {name, value} = val;
				yield [save, name, value];
			}
		}
	}
}

function formatsSave(tblName) {
	browser.storage.local.get(["formats"], function(res) {
		if (chrome.runtime.lastError) {
			console.error("Error in formatsSave get:", chrome.runtime.lastError);
			return;
		}

		for (const [save, nm, value] of genFormatPairs(tblName, res)) {
			if (typeof(save[nm]) == "number") {
				save[nm] = Number(value);
			} else {
				save[nm] = value;
			}
		}

		browser.storage.local.set(res, function() {
			if (chrome.runtime.lastError) {
				console.error("Error in formatsSave set:", chrome.runtime.lastError);
				return;
			}
			updateBackground().then(() => unsavedTable(tblName));
		});
	});
}

function getDefElements(form) {
	const all = [];
	let i = 0;
	for (const input of form.elements) {
		if (input.name === "enabled") {
			all.push({"enabled" : input.checked});
		} else if (input.name === "name") {
			all[i]["name"] = input.value;
		} else if (input.name === "pattern") {
			all[i]["pattern"] = input.value;
			i++;
		}
	}
	return all;
}

function saveTable(tblName) {
	if (!validateTable(tblName)) {
		return;
	}

	const tbl = document.getElementById(`${tblName}-form`);
	const data = {};
	data[tblName] = getDefElements(tbl);

	browser.storage.local.set(data, function() {
		if (chrome.runtime.lastError) {
			console.error("Error in saveTable:", chrome.runtime.lastError);
			return;
		}
		updateBackground().then(() => unsavedTable(tblName));
	});
}

function onLoad() {
	function appendDefault(tblName) {
		const example = { "name" : "", "enabled" : true, "pattern" : "" }
		defAddRow(tblName, example, focus=true);
	}

	function writeDOM(res) {
		if (!res) return;
		for (const sub of configList) {
			if (!res[sub]) {
				console.error("Could not get: " + sub);
				continue;
			}

			for (const itr of res[sub]) {
				defAddRow(sub, itr);
			}
		}
		for (const sub of configList) {
			validateTable(sub);
			unsavedTable(sub);
		}
	}

	for (const i of configList) {
		if (i != "globals") {
			document.getElementById(`add-${i}`).onclick = function() {
				appendDefault(i);
				unsavedTable(i);
			}
		}
		document.getElementById(`save-${i}`).onclick = function() {
			saveTable(i);
		}
	}

	browser.storage.local.get(configList, function(result) {
		if (chrome.runtime.lastError) {
			console.error("failed to get storage: " + chrome.runtime.lastError);
		} else {
			writeDOM(result);
		}
	});

	populateFormats();
	setCopyHandlers();
}

function populateFormats() {
	function createInptCol(name, value, xl, disabled=false) {
		const col = document.createElement("div");
		col.className = xl? "col-xl" : "col-md";
		const field = createField(name, value, disabled);
		col.appendChild(field);
		return col;
	}

	function createFmtRow(fmt) {
		const row = document.createElement("div");
		row.className = "row";
		row.appendChild(createInptCol(fmt.name, fmt.pretty, false, true));
		row.appendChild(createInptCol("default", fmt.default, false));
		row.appendChild(createInptCol("highlight", fmt.highlight, false));
		return row;
	}

	function createLimitRow(fmt) {
		const row = document.createElement("div");
		row.className = "row";
		row.appendChild(createInptCol(fmt.name, fmt.pretty, true));
		row.appendChild(createInptCol("limit", fmt.limit, true));
		return row;
	}

	document.getElementById("save-formats").onclick = () => formatsSave("formats");
	document.getElementById("test-formats").onclick = colorTest;
	document.getElementById("save-limits").onclick = () => formatsSave("limits");

	browser.storage.local.get(["formats"], function(result) {
		if (chrome.runtime.lastError || !result || !result.formats) {
			console.error("could not get color formats from storage:", chrome.runtime.lastError);
			return;
		}

		const fmtTbl = document.getElementById("formats-form");
		const limitTbl = document.getElementById("limits-form");
		result.formats.forEach(i => {
			if (i.open !== null) {
				fmtTbl.appendChild(createFmtRow(i));
			}
			if (i.limit) {
				limitTbl.appendChild(createLimitRow(i));
			}
		});
	});
}

function colorTest() {
	browser.storage.local.get(["formats"], function(result) {
		if (chrome.runtime.lastError || !result.formats) {
			console.error("Error getting formats for color test:", chrome.runtime.lastError);
			return;
		}
		for (const i of result.formats) {
			console.log("[%s] %cDefault %chighlighted",
				i.name, i.default, i.highlight
			);
		}
	});
}

async function getConfig() {
	const conf = await browser.runtime.sendMessage("getScriptInfo");
	return JSON.stringify(conf[0], null, 2);
}

async function getInjection() {
	const conf = await getConfig();
	const func = rewriter.toString();
	return `(${func})(${conf});`;
}

function clipit(x, nm) {
	navigator.clipboard.writeText(x)
		.then(() => alert(`${nm} put in clipbaord`))
}

function setCopyHandlers() {
	document.getElementById('copyconfig').onclick = function() {
		getConfig().then(x => clipit(x, "Config"));
	}
	document.getElementById('copyinjec').onclick = function() {
		getInjection().then(x => clipit(x, "Injection"));
	}
}

self.addEventListener('load', onLoad);
