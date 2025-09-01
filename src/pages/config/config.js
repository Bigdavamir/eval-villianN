const configList = ["targets", "needles",  "blacklist", "functions", "globals", "types", "powerFeatures", "advancedSinks"];
const normalHeaders = ["enabled", "name", "pattern"];

function getTableData(tblName) {
	const tbl = document.getElementById(`${tblName}-form`);
	return Array.from(tbl.querySelectorAll(".row:not(:first-child)")).map(row => {
		const obj = {};
		obj.row = row;

		for (const h of normalHeaders) {
			const input = row.querySelector(`input[name='${h}']`);
			if (!input) continue;
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
	function markSaved(isSaved) {
		const butt = document.getElementById(`save-${tblName}`);
		butt.disabled = isSaved;
		if (!isSaved) {
			butt.classList.remove("saved");
		}
	}

	function compareData(savedData) {
		const tblData = getTableData(tblName);
		const saved = savedData[tblName];
		if (!saved || saved.length !== tblData.length) {
			markSaved(false);
			return;
		}

		for (let i=0; i<tblData.length; i++) {
			for (const h of normalHeaders) {
				if (saved[i][h] !== undefined && saved[i][h] != tblData[i][h]) {
					markSaved(false);
					return;
				}
			}
		}
		markSaved(true);
	}

	browser.storage.local.get(tblName).then(compareData);
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
			const tblName = e.target.closest(".container").id.replace("-container", "");
			unsavedTable(tblName);
		};
	}
	div.appendChild(input);
	return div;
}

function createSwitch(initialState, tblName, itemName) {
	const div = document.createElement("div");
	div.className = "cell";
	const label = document.createElement("label");
	label.className = "switch";
	const input = document.createElement("input");
	input.type = "checkbox";
	input.name = "enabled";
	input.checked = initialState;
	input.dataset.name = itemName; // Store the internal name for saving
	input.onclick = () => unsavedTable(tblName);
	const slider = document.createElement("div");
	slider.className = "slider";
	label.appendChild(input);
	label.appendChild(slider);
	div.appendChild(label);
	return div;
}

function addThreeColumnRow(tblName, ex, focus=false) {
	function addDelete() {
		const delRow = document.createElement("div");
		delRow.className = "row";
		const ecks = document.createElement("ecks");
		ecks.innerText = "\u2297";
		ecks.className = "ecks";
		delRow.appendChild(ecks);
		ecks.onclick = function() {
			for (const input of row.getElementsByTagName("input")) {
				if (input.type === "text") removeFromErrorArray(input, tblName);
			}
			row.remove();
			delRow.remove();
			unsavedTable(tblName);
		}
		document.getElementById(tblName + "-deletes").appendChild(delRow);
	}

	const row = document.createElement("div");
	row.className = "row";
	const cols = [];
	for (const cls of ["col-sm", "col-md", "col-lg"]) {
		const div = document.createElement("div");
		div.className = cls;
		cols.push(div);
	}

	cols[0].appendChild(createSwitch(ex.enabled, tblName, ex.name));
	cols[1].appendChild(createField("name", ex.name, tblName == "globals"));
	cols[2].appendChild(createField("pattern", ex.pattern));

	cols.forEach(c => row.appendChild(c));
	document.getElementById(`${tblName}-form`).appendChild(row);
	if (tblName != "globals") addDelete();
	if (focus) row.getElementsByTagName("input")[1].focus();
}

function addTwoColumnRow(tblName, item) {
	const row = document.createElement("div");
	row.className = "row";

	const col1 = document.createElement("div");
	col1.className = "col-sm";
	col1.appendChild(createSwitch(item.enabled, tblName, item.name));

	const col2 = document.createElement("div");
	col2.className = "col-lg";
	const nameField = createField("name", item.pretty || item.name, true);
	col2.appendChild(nameField);

	row.appendChild(col1);
	row.appendChild(col2);
	document.getElementById(`${tblName}-form`).appendChild(row);
}

function getThreeColumnElements(form) {
	const all = [];
	let i = 0;
	let current = {};
	for (const input of form.elements) {
		if (input.name === "enabled") {
			if (i > 0) all.push(current);
			current = { "enabled": input.checked };
			i++;
		} else {
			current[input.name] = input.value;
		}
	}
	if (i > 0) all.push(current);
	return all;
}

function getTwoColumnElements(form) {
	const all = [];
	for (const input of form.elements) {
		if (input.type === "checkbox") {
			all.push({ "name": input.dataset.name, "enabled": input.checked });
		}
	}
	return all;
}


async function saveTable(tblName) {
	if (!validateTable(tblName)) return;

	const form = document.getElementById(`${tblName}-form`);
	let dataToSave;

	if (["types", "powerFeatures", "advancedSinks"].includes(tblName)) {
		const currentData = await browser.storage.local.get(tblName);
		const toggledData = getTwoColumnElements(form);

		dataToSave = currentData[tblName].map(item => {
			const toggledItem = toggledData.find(t => t.name === item.name);
			if (toggledItem) {
				return {...item, enabled: toggledItem.enabled };
			}
			return item;
		});

	} else {
		dataToSave = getThreeColumnElements(form);
	}

	await browser.storage.local.set({ [tblName]: dataToSave });
	await updateBackground();
	unsavedTable(tblName);
}


function onLoad() {
	function appendDefault(tblName) {
		const example = { "name": "", "enabled": true, "pattern": "" };
		addThreeColumnRow(tblName, example, focus = true);
	}

	function writeDOM(res) {
		for (const sub of configList) {
			if (!res[sub]) {
				console.error("Could not get: " + sub);
				continue;
			}
			for (const itr of res[sub]) {
				if (["types", "powerFeatures", "advancedSinks"].includes(sub)) {
					addTwoColumnRow(sub, itr);
				} else {
					addThreeColumnRow(sub, itr);
				}
			}
		}
		for (const sub of configList) {
			validateTable(sub);
			unsavedTable(sub);
		}
	}

	for (const i of configList) {
		const hasAddButton = !["globals", "types", "powerFeatures", "advancedSinks"].includes(i);
		if (hasAddButton) {
			document.getElementById(`add-${i}`).onclick = () => {
				appendDefault(i);
				unsavedTable(i);
			};
		}
		document.getElementById(`save-${i}`).onclick = () => saveTable(i);
	}

	browser.storage.local.get(configList).then(
		writeDOM,
		err => console.error("failed to get storage: " + err)
	);

	populateFormats();
	setCopyHandlers();
}

// formats and limits are special
async function populateFormats() {
	function createInptCol(name, value, xl, disabled=false) {
		const col = document.createElement("div");
		col.className = xl? "col-xl" : "col-md";
		col.appendChild(createField(name, value, disabled));
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
		row.appendChild(createInptCol(fmt.name, fmt.pretty, true, true));
		row.appendChild(createInptCol("limit", fmt.limit, true));
		return row;
	}
	document.getElementById("save-formats").onclick = () => formatsSave("formats");
	document.getElementById("test-formats").onclick = colorTest;
	document.getElementById("save-limits").onclick = () => formatsSave("limits");
	const {formats} = await browser.storage.local.get("formats");
	if (!formats) {
		console.error("could not get color formats from storage");
		return false;
	}
	const fmtTbl = document.getElementById("formats-form");
	const limitTbl = document.getElementById("limits-form");
	formats.forEach(i => {
		if (i.open !== null) fmtTbl.appendChild(createFmtRow(i));
		if (i.limit) limitTbl.appendChild(createLimitRow(i));
	});
}

function formatsSave(tblName) {
	// ... (This function can remain as is)
}

function colorTest() {
	// ... (This function can remain as is)
}
async function getConfig() {
	// ... (This function can remain as is)
}
async function getInjection() {
	// ... (This function can remain as is)
}
function clipit(x, nm) {
	// ... (This function can remain as is)
}
function setCopyHandlers() {
	// ... (This function can remain as is)
}

self.addEventListener('load', onLoad);
