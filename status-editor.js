const statusList = document.querySelector("#status-list");
const editorTitle = document.querySelector("#editor-title");
const saveStatus = document.querySelector("#save-status");
const saveAllButton = document.querySelector("#save-all");
const addStatusButton = document.querySelector("#add-status");
const copyStatusButton = document.querySelector("#copy-status");
const deleteStatusButton = document.querySelector("#delete-status");
const addEffectButton = document.querySelector("#add-effect");
const effectsList = document.querySelector("#effects-list");

const fields = {
  label: document.querySelector("#status-label"),
  key: document.querySelector("#status-key"),
  description: document.querySelector("#status-description"),
  combat: document.querySelector("#status-combat"),
  defense: document.querySelector("#status-defense"),
  safety: document.querySelector("#status-safety"),
  eventChance: document.querySelector("#status-event-chance"),
  phaseDay: document.querySelector("#phase-day"),
  phaseNight: document.querySelector("#phase-night"),
  phaseBloodbath: document.querySelector("#phase-bloodbath"),
  clearOnEvent: document.querySelector("#clear-on-event")
};

const DEFAULT_STATUS = {
  label: "New Status",
  description: "",
  combat: 0,
  defense: 0,
  safety: 0,
  eventChance: null,
  eventPhases: [],
  clearOnEvent: false,
  effects: []
};

let statuses = [];
let activeIndex = -1;

Object.values(fields).forEach((field) => {
  field.addEventListener("input", () => {
    syncFormToStatus();
    renderStatusList();
  });
});

addStatusButton.addEventListener("click", addStatus);
copyStatusButton.addEventListener("click", copyStatus);
deleteStatusButton.addEventListener("click", deleteStatus);
addEffectButton.addEventListener("click", addEffect);
saveAllButton.addEventListener("click", saveAll);

bootstrap();

async function bootstrap() {
  try {
    const response = await fetch("/api/editor/file?name=status-editor-data.json");
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Could not load status data.");
    }

    const parsed = JSON.parse(payload.content);
    statuses = Array.isArray(parsed.statuses) ? parsed.statuses.map(normalizeEditorStatus) : [];
    if (!statuses.length) {
      statuses.push(createNewStatus());
    }

    selectStatus(0);
    saveStatus.textContent = "Ready. Pick a status, then add one or more outcomes.";
  } catch (error) {
    saveStatus.textContent = error.message;
  }
}

function renderStatusList() {
  statusList.innerHTML = "";

  statuses.forEach((status, index) => {
    const button = document.createElement("button");
    button.className = `item-button${index === activeIndex ? " is-active" : ""}`;
    button.innerHTML = `${escapeHtml(status.label || "Untitled Status")}<small>${escapeHtml(status.key || "no_key")}</small>`;
    button.addEventListener("click", () => selectStatus(index));
    statusList.append(button);
  });
}

function selectStatus(index) {
  activeIndex = index;
  const status = statuses[index];
  if (!status) {
    return;
  }

  fields.label.value = status.label || "";
  fields.key.value = status.key || "";
  fields.description.value = status.description || "";
  fields.combat.value = numberOrBlank(status.combat);
  fields.defense.value = numberOrBlank(status.defense);
  fields.safety.value = numberOrBlank(status.safety);
  fields.eventChance.value = numberOrBlank(status.eventChance);
  fields.phaseDay.checked = status.eventPhases.includes("day");
  fields.phaseNight.checked = status.eventPhases.includes("night");
  fields.phaseBloodbath.checked = status.eventPhases.includes("bloodbath");
  fields.clearOnEvent.checked = Boolean(status.clearOnEvent);

  editorTitle.textContent = status.label || "Untitled Status";
  renderStatusList();
  renderEffectsList();
}

function syncFormToStatus() {
  if (activeIndex < 0 || !statuses[activeIndex]) {
    return;
  }

  const current = statuses[activeIndex];
  statuses[activeIndex] = {
    ...current,
    key: sanitizeKey(fields.key.value) || current.key || "newstatus",
    label: fields.label.value.trim() || "Untitled Status",
    description: fields.description.value.trim(),
    combat: parseNumber(fields.combat.value),
    defense: parseNumber(fields.defense.value),
    safety: parseNumber(fields.safety.value),
    eventChance: parseMaybeNumber(fields.eventChance.value),
    eventPhases: [
      fields.phaseDay.checked ? "day" : null,
      fields.phaseNight.checked ? "night" : null,
      fields.phaseBloodbath.checked ? "bloodbath" : null
    ].filter(Boolean),
    clearOnEvent: fields.clearOnEvent.checked
  };

  editorTitle.textContent = statuses[activeIndex].label;
}

function renderEffectsList() {
  effectsList.innerHTML = "";
  const status = statuses[activeIndex];
  if (!status) {
    return;
  }

  if (!status.effects.length) {
    const empty = document.createElement("div");
    empty.className = "effect-preview";
    empty.innerHTML = `This status has no special outcomes yet.<strong>Press "Add Effect" to give it one.</strong>`;
    effectsList.append(empty);
    return;
  }

  status.effects.forEach((effect, index) => {
    const card = document.createElement("section");
    card.className = "effect-card";
    const previewText = getEffectPreviewText(effect, status.label);

    card.innerHTML = `
      <div class="effect-card-header">
        <div class="effect-card-title">Outcome ${index + 1}</div>
        <button class="side-button danger" type="button" data-delete-effect="${index}">Delete</button>
      </div>
      <div class="form-grid">
        <label class="field">
          <span>What happens?</span>
          <select data-effect-field="type" data-effect-index="${index}">
            <option value="story-only"${effect.type === "story-only" ? " selected" : ""}>Just a story event</option>
            <option value="kill-target"${effect.type === "kill-target" ? " selected" : ""}>Kills another tribute</option>
            <option value="kill-self"${effect.type === "kill-self" ? " selected" : ""}>Kills the holder</option>
            <option value="distract-target"${effect.type === "distract-target" ? " selected" : ""}>Distracts another tribute</option>
            <option value="custom"${effect.type === "custom" ? " selected" : ""}>Custom advanced effect</option>
          </select>
        </label>
        <label class="field">
          <span>How often should this happen?</span>
          <input data-effect-field="chance" data-effect-index="${index}" type="number" min="0" step="0.1" value="${escapeHtml(String(effect.chance ?? 1))}">
        </label>
        <label class="field field-wide">
          <span>Story text</span>
          <textarea data-effect-field="message" data-effect-index="${index}" rows="3" placeholder="Use {user}, {target}, and {item}.">${escapeHtml(effect.message || "")}</textarea>
        </label>
      </div>
      <div class="effect-preview">
        Story preview:
        <strong data-effect-preview="${index}">${escapeHtml(previewText)}</strong>
      </div>
      ${effect.type === "custom" ? `
        <div class="custom-code-box">
          <label class="field">
            <span>Custom advanced code</span>
            <textarea data-effect-field="customCode" data-effect-index="${index}" rows="8" spellcheck="false">${escapeHtml(effect.customCode || "")}</textarea>
          </label>
        </div>
      ` : ""}
    `;

    effectsList.append(card);
  });

  effectsList.querySelectorAll("[data-effect-field]").forEach((element) => {
    const eventName = element.tagName === "SELECT" ? "change" : "input";
    element.addEventListener(eventName, handleEffectFieldChange);
  });

  effectsList.querySelectorAll("[data-delete-effect]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.deleteEffect);
      statuses[activeIndex].effects.splice(index, 1);
      renderEffectsList();
      saveStatus.textContent = "Outcome deleted.";
    });
  });
}

function handleEffectFieldChange(event) {
  const index = Number(event.target.dataset.effectIndex);
  const field = event.target.dataset.effectField;
  const effect = statuses[activeIndex]?.effects?.[index];
  if (!effect) {
    return;
  }

  if (field === "chance") {
    effect[field] = parseMaybeNumber(event.target.value) ?? 0;
  } else {
    effect[field] = event.target.value;
  }

  if (field === "type") {
    renderEffectsList();
    return;
  }

  updateEffectPreview(index);
}

function addStatus() {
  statuses.push(createNewStatus());
  selectStatus(statuses.length - 1);
  saveStatus.textContent = "New status added.";
}

function copyStatus() {
  if (activeIndex < 0 || !statuses[activeIndex]) {
    return;
  }

  syncFormToStatus();
  const copy = JSON.parse(JSON.stringify(statuses[activeIndex]));
  copy.key = getUniqueKey(`${copy.key}copy`);
  copy.label = `${copy.label} Copy`;
  statuses.push(copy);
  selectStatus(statuses.length - 1);
  saveStatus.textContent = "Status copied.";
}

function deleteStatus() {
  if (activeIndex < 0 || !statuses[activeIndex]) {
    return;
  }

  statuses.splice(activeIndex, 1);
  if (!statuses.length) {
    statuses.push(createNewStatus());
  }
  selectStatus(Math.max(0, activeIndex - 1));
  saveStatus.textContent = "Status deleted.";
}

function addEffect() {
  if (activeIndex < 0 || !statuses[activeIndex]) {
    return;
  }
  syncFormToStatus();
  statuses[activeIndex].effects.push(createNewEffect());
  renderEffectsList();
  saveStatus.textContent = "New outcome added.";
}

async function saveAll() {
  syncFormToStatus();
  saveStatus.textContent = "Saving...";

  try {
    const dataJson = JSON.stringify({ statuses }, null, 2);
    const statusJs = buildStatusJs(statuses);

    await Promise.all([
      saveFile("status-editor-data.json", dataJson),
      saveFile("status-effects.js", statusJs)
    ]);

    saveStatus.textContent = `Saved everything at ${new Date().toLocaleTimeString()}.`;
  } catch (error) {
    saveStatus.textContent = error.message;
  }
}

async function saveFile(name, content) {
  const response = await fetch("/api/editor/file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, content })
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || `Could not save ${name}.`);
  }
  return payload;
}

function buildStatusJs(sourceStatuses) {
  const entries = sourceStatuses.map((status) => {
    const built = {
      label: status.label,
      description: status.description,
      combat: status.combat,
      defense: status.defense,
      safety: status.safety
    };

    if (status.eventChance !== null) {
      built.eventChance = status.eventChance;
    }
    if (status.eventPhases.length) {
      built.eventPhases = status.eventPhases;
    }
    if (status.clearOnEvent) {
      built.clearOnEvent = true;
    }
    if (status.effects?.length) {
      built.effectSource = buildEffectSource(status);
    }

    return `  ${status.key}: ${toObjectLiteral(built, 2)}`;
  });

  return `window.HENCOLLE_STATUS_EFFECTS = {\n${entries.join(",\n")}\n};\n`;
}

function buildEffectSource(status) {
  const effects = status.effects.filter((effect) => effect.type !== "none");
  if (!effects.length) {
    return "return false;";
  }

  const lines = [
    "const { tribute, target, fallenIds, events, item, definition, helpers } = context;",
    `const totalWeight = ${effects.map((effect) => Number(effect.chance) || 0).join(" + ") || "0"};`,
    "if (totalWeight <= 0) { return false; }",
    "let roll = Math.random() * totalWeight;"
  ];

  effects.forEach((effect) => {
    const blockLines = buildSingleEffectBlock(effect);
    lines.push(`if ((roll -= ${Number(effect.chance) || 0}) <= 0) {`);
    blockLines.forEach((line) => {
      const split = String(line).split("\n");
      split.forEach((part) => lines.push(`  ${part}`));
    });
    lines.push("}");
  });

  lines.push("return false;");
  return lines.join("\n");
}

function buildSingleEffectBlock(effect) {
  if (effect.type === "custom") {
    return String(effect.customCode || "return false;").trim().split("\n");
  }

  const lines = [];
  if (effect.type === "story-only") {
    const message = escapeForTemplate(effect.message || defaultMessageForType(effect.type));
    lines.push(`events.push(\`${message}\`);`);
    lines.push("item.used = Boolean(definition.clearOnEvent);");
    lines.push("return true;");
    return lines;
  }
  if (effect.type === "kill-target") {
    lines.push("if (!target) { return false; }");
    lines.push("fallenIds.push(target.id);");
  }
  if (effect.type === "kill-self") {
    lines.push("fallenIds.push(tribute.id);");
  }
  if (effect.type === "distract-target") {
    lines.push("if (!target) { return false; }");
  }

  const message = escapeForTemplate(effect.message || defaultMessageForType(effect.type));
  lines.push(`events.push(\`${message}\`);`);
  lines.push("item.used = Boolean(definition.clearOnEvent);");
  lines.push("return true;");
  return lines;
}

function defaultMessageForType(type) {
  if (type === "story-only") {
    return "{user} is affected by {item}.";
  }
  if (type === "kill-target") {
    return "{user} harms {target} because of {item}.";
  }
  if (type === "kill-self") {
    return "{user} dies because of {item}.";
  }
  if (type === "distract-target") {
    return "{user} distracts {target} because of {item}.";
  }
  return "{user} is affected by {item}.";
}

function getEffectPreviewText(effect, label) {
  const source = effect.message || defaultMessageForType(effect.type);
  return source
    .replaceAll("{user}", "Phoenix")
    .replaceAll("{target}", "Inky")
    .replaceAll("{item}", label || "this status");
}

function updateEffectPreview(index) {
  const preview = effectsList.querySelector(`[data-effect-preview="${index}"]`);
  const effect = statuses[activeIndex]?.effects?.[index];
  if (!preview || !effect) {
    return;
  }
  preview.textContent = getEffectPreviewText(effect, statuses[activeIndex].label);
}

function createNewStatus() {
  const status = JSON.parse(JSON.stringify(DEFAULT_STATUS));
  status.key = getUniqueKey("newstatus");
  return status;
}

function createNewEffect() {
  return {
    type: "story-only",
    chance: 1,
    message: "",
    customCode: ""
  };
}

function normalizeEditorStatus(status) {
  const key = sanitizeKey(status.key || status.label || "status") || getUniqueKey("status");
  return {
    key,
    label: status.label || "Untitled Status",
    description: status.description || "",
    combat: parseNumber(status.combat),
    defense: parseNumber(status.defense),
    safety: parseNumber(status.safety),
    eventChance: parseMaybeNumber(status.eventChance),
    eventPhases: Array.isArray(status.eventPhases) ? status.eventPhases.filter((phase) => ["day", "night", "bloodbath"].includes(phase)) : [],
    clearOnEvent: Boolean(status.clearOnEvent),
    effects: Array.isArray(status.effects) ? status.effects.map(normalizeEffect) : []
  };
}

function normalizeEffect(effect) {
  return {
    type: effect?.type || "story-only",
    chance: parseMaybeNumber(effect?.chance) ?? 1,
    message: effect?.message || "",
    customCode: effect?.customCode || ""
  };
}

function getUniqueKey(base) {
  const existing = new Set(statuses.map((status) => status.key));
  let candidate = sanitizeKey(base) || "status";
  let counter = 2;
  while (existing.has(candidate)) {
    candidate = `${sanitizeKey(base) || "status"}${counter}`;
    counter += 1;
  }
  return candidate;
}

function sanitizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 40);
}

function parseNumber(value) {
  return Number(value || 0);
}

function parseMaybeNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function numberOrBlank(value) {
  return value === null || value === undefined ? "" : String(value);
}

function toObjectLiteral(value, indentLevel = 0) {
  const indent = "  ".repeat(indentLevel);
  const childIndent = "  ".repeat(indentLevel + 1);

  if (Array.isArray(value)) {
    return `[${value.map((entry) => JSON.stringify(entry)).join(", ")}]`;
  }

  const entries = Object.entries(value).map(([key, entry]) => `${childIndent}${key}: ${JSON.stringify(entry)}`);
  return `{\n${entries.join(",\n")}\n${indent}}`;
}

function escapeForTemplate(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll("`", "\\`")
    .replaceAll("${user}", "${helpers.formatTributeName(tribute)}")
    .replaceAll("${target}", "${target ? helpers.formatTributeName(target) : 'someone'}")
    .replaceAll("${item}", "${helpers.escapeHtml(definition.label.toLowerCase())}")
    .replaceAll("{user}", "${helpers.formatTributeName(tribute)}")
    .replaceAll("{target}", "${target ? helpers.formatTributeName(target) : 'someone'}")
    .replaceAll("{item}", "${helpers.escapeHtml(definition.label.toLowerCase())}");
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
