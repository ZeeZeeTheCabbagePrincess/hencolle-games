const itemList = document.querySelector("#item-list");
const editorTitle = document.querySelector("#editor-title");
const saveStatus = document.querySelector("#save-status");
const saveAllButton = document.querySelector("#save-all");
const addItemButton = document.querySelector("#add-item");
const copyItemButton = document.querySelector("#copy-item");
const deleteItemButton = document.querySelector("#delete-item");
const addEffectButton = document.querySelector("#add-effect");
const effectsList = document.querySelector("#effects-list");

const fields = {
  label: document.querySelector("#item-label"),
  key: document.querySelector("#item-key"),
  description: document.querySelector("#item-description"),
  combat: document.querySelector("#item-combat"),
  defense: document.querySelector("#item-defense"),
  safety: document.querySelector("#item-safety"),
  eventChance: document.querySelector("#item-event-chance"),
  rescueChance: document.querySelector("#item-rescue-chance"),
  phaseDay: document.querySelector("#phase-day"),
  phaseNight: document.querySelector("#phase-night"),
  phaseBloodbath: document.querySelector("#phase-bloodbath"),
  consumeOnEvent: document.querySelector("#consume-on-event"),
  consumeOnRescue: document.querySelector("#consume-on-rescue")
};

const DEFAULT_ITEM = {
  label: "New Item",
  description: "",
  combat: 0,
  defense: 0,
  safety: 0,
  eventChance: null,
  eventPhases: [],
  consumeOnEvent: false,
  rescueChance: null,
  consumeOnRescue: false,
  effects: []
};

let items = [];
let activeIndex = -1;

Object.values(fields).forEach((field) => {
  field.addEventListener("input", () => {
    syncFormToItem();
    renderItemList();
  });
});

addItemButton.addEventListener("click", addItem);
copyItemButton.addEventListener("click", copyItem);
deleteItemButton.addEventListener("click", deleteItem);
addEffectButton.addEventListener("click", addEffect);
saveAllButton.addEventListener("click", saveAll);

bootstrap();

async function bootstrap() {
  try {
    const response = await fetch("/api/editor/file?name=sponsorship-editor-data.json");
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Could not load sponsorship data.");
    }

    const parsed = JSON.parse(payload.content);
    items = Array.isArray(parsed.items) ? parsed.items.map(normalizeEditorItem) : [];
    if (!items.length) {
      items.push(createNewItem());
    }

    selectItem(0);
    saveStatus.textContent = "Ready. Pick an item, then add one or more outcomes.";
  } catch (error) {
    saveStatus.textContent = error.message;
  }
}

function renderItemList() {
  itemList.innerHTML = "";

  items.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = `item-button${index === activeIndex ? " is-active" : ""}`;
    button.innerHTML = `${escapeHtml(item.label || "Untitled Item")}<small>${escapeHtml(item.key || "no_key")}</small>`;
    button.addEventListener("click", () => selectItem(index));
    itemList.append(button);
  });
}

function selectItem(index) {
  activeIndex = index;
  const item = items[index];
  if (!item) {
    return;
  }

  fields.label.value = item.label || "";
  fields.key.value = item.key || "";
  fields.description.value = item.description || "";
  fields.combat.value = numberOrBlank(item.combat);
  fields.defense.value = numberOrBlank(item.defense);
  fields.safety.value = numberOrBlank(item.safety);
  fields.eventChance.value = numberOrBlank(item.eventChance);
  fields.rescueChance.value = numberOrBlank(item.rescueChance);
  fields.phaseDay.checked = item.eventPhases.includes("day");
  fields.phaseNight.checked = item.eventPhases.includes("night");
  fields.phaseBloodbath.checked = item.eventPhases.includes("bloodbath");
  fields.consumeOnEvent.checked = Boolean(item.consumeOnEvent);
  fields.consumeOnRescue.checked = Boolean(item.consumeOnRescue);

  editorTitle.textContent = item.label || "Untitled Item";
  renderItemList();
  renderEffectsList();
}

function syncFormToItem() {
  if (activeIndex < 0 || !items[activeIndex]) {
    return;
  }

  const current = items[activeIndex];
  items[activeIndex] = {
    ...current,
    key: sanitizeKey(fields.key.value) || current.key || "newitem",
    label: fields.label.value.trim() || "Untitled Item",
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
    consumeOnEvent: fields.consumeOnEvent.checked,
    rescueChance: parseMaybeNumber(fields.rescueChance.value),
    consumeOnRescue: fields.consumeOnRescue.checked
  };

  editorTitle.textContent = items[activeIndex].label;
}

function renderEffectsList() {
  effectsList.innerHTML = "";
  const item = items[activeIndex];
  if (!item) {
    return;
  }

  if (!item.effects.length) {
    const empty = document.createElement("div");
    empty.className = "effect-preview";
    empty.innerHTML = `This item has no special outcomes yet.<strong>Press "Add Effect" to give it one.</strong>`;
    effectsList.append(empty);
    return;
  }

  item.effects.forEach((effect, index) => {
    const card = document.createElement("section");
    card.className = "effect-card";
    const previewText = getEffectPreviewText(effect, item.label);

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
        <label class="field">
          <span>How many tributes?</span>
          <select data-effect-field="targetCount" data-effect-index="${index}" ${effect.type === "kill-self" ? "disabled" : ""}>
            <option value="1"${Number(effect.targetCount ?? 1) === 1 ? " selected" : ""}>1 tribute</option>
            <option value="2"${Number(effect.targetCount ?? 1) === 2 ? " selected" : ""}>2 tributes</option>
          </select>
        </label>
        <label class="field field-wide">
          <span>Story text</span>
          <textarea data-effect-field="message" data-effect-index="${index}" rows="3" placeholder="Use {user}, {target}, {target2}, and {item}.">${escapeHtml(effect.message || "")}</textarea>
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
      items[activeIndex].effects.splice(index, 1);
      renderEffectsList();
      saveStatus.textContent = "Outcome deleted.";
    });
  });
}

function handleEffectFieldChange(event) {
  const index = Number(event.target.dataset.effectIndex);
  const field = event.target.dataset.effectField;
  const effect = items[activeIndex]?.effects?.[index];
  if (!effect) {
    return;
  }

  if (field === "chance") {
    effect[field] = parseMaybeNumber(event.target.value) ?? 0;
  } else {
    effect[field] = event.target.value;
  }

  if (field === "type") {
    if (event.target.value === "kill-self") {
      effect.targetCount = 1;
    }
    renderEffectsList();
    return;
  }

  updateEffectPreview(index);
}

function addItem() {
  items.push(createNewItem());
  selectItem(items.length - 1);
  saveStatus.textContent = "New item added.";
}

function copyItem() {
  if (activeIndex < 0 || !items[activeIndex]) {
    return;
  }

  syncFormToItem();
  const copy = JSON.parse(JSON.stringify(items[activeIndex]));
  copy.key = getUniqueKey(`${copy.key}copy`);
  copy.label = `${copy.label} Copy`;
  items.push(copy);
  selectItem(items.length - 1);
  saveStatus.textContent = "Item copied.";
}

function deleteItem() {
  if (activeIndex < 0 || !items[activeIndex]) {
    return;
  }

  items.splice(activeIndex, 1);
  if (!items.length) {
    items.push(createNewItem());
  }
  selectItem(Math.max(0, activeIndex - 1));
  saveStatus.textContent = "Item deleted.";
}

function addEffect() {
  if (activeIndex < 0 || !items[activeIndex]) {
    return;
  }
  syncFormToItem();
  items[activeIndex].effects.push(createNewEffect());
  renderEffectsList();
  saveStatus.textContent = "New outcome added.";
}

async function saveAll() {
  syncFormToItem();
  saveStatus.textContent = "Saving...";

  try {
    const dataJson = JSON.stringify({ items }, null, 2);
    const itemsJs = buildItemsJs(items);
    const effectsJs = buildEffectsJs(items);

    await Promise.all([
      saveFile("sponsorship-editor-data.json", dataJson),
      saveFile("sponsor-items.js", itemsJs),
      saveFile("sponsor-item-effects.js", effectsJs)
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

function buildItemsJs(sourceItems) {
  const entries = sourceItems.map((item) => {
    const built = {
      label: item.label,
      description: item.description,
      combat: item.combat,
      defense: item.defense,
      safety: item.safety
    };

    if (item.eventChance !== null) {
      built.eventChance = item.eventChance;
    }
    if (item.eventPhases.length) {
      built.eventPhases = item.eventPhases;
    }
    if (item.consumeOnEvent) {
      built.consumeOnEvent = true;
    }
    if (item.rescueChance !== null) {
      built.rescueChance = item.rescueChance;
    }
    if (item.consumeOnRescue) {
      built.consumeOnRescue = true;
    }

    return `  ${item.key}: ${toObjectLiteral(built, 2)}`;
  });

  return `window.HENCOLLE_SPONSOR_ITEMS = {\n${entries.join(",\n")}\n};\n`;
}

function buildEffectsJs(sourceItems) {
  const entries = sourceItems
    .filter((item) => item.effects?.length)
    .map((item) => `  ${item.key}: ${JSON.stringify(buildEffectSource(item))}`);

  return `window.HENCOLLE_SPONSOR_ITEM_EFFECTS_SOURCE = {\n${entries.join(",\n")}\n};\n`;
}

function buildEffectSource(item) {
  const effects = item.effects.filter((effect) => effect.type !== "none");
  if (!effects.length) {
    return "return false;";
  }

  const lines = [
    "const { tribute, target, targetPool, fallenIds, events, item, definition, helpers, pickOne } = context;",
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

  const targetCount = Math.max(1, Number(effect.targetCount) || 1);
  const lines = [];
  if (effect.type === "story-only") {
    lines.push("let target2 = null;");
    if (targetCount > 1) {
      lines.push("if (!target) { return false; }");
      lines.push("target2 = pickOne(targetPool.filter((candidate) => candidate.id !== target.id)) || null;");
      lines.push("if (!target2) { return false; }");
    }
    if (targetCount > 1) {
      lines.push("/* Two targets required. */");
    }
    const message = escapeForTemplate(effect.message || defaultMessageForType(effect));
    lines.push(`events.push(\`${message}\`);`);
    lines.push("item.used = Boolean(definition.consumeOnEvent);");
    lines.push("return true;");
    return lines;
  }
  lines.push("let target2 = null;");
  if (effect.type === "kill-target") {
    lines.push("if (!target) { return false; }");
    if (targetCount > 1) {
      lines.push("target2 = pickOne(targetPool.filter((candidate) => candidate.id !== target.id)) || null;");
      lines.push("if (!target2) { return false; }");
      lines.push("fallenIds.push(target2.id);");
    }
    lines.push("fallenIds.push(target.id);");
  }
  if (effect.type === "kill-self") {
    lines.push("fallenIds.push(tribute.id);");
  }
  if (effect.type === "distract-target") {
    lines.push("if (!target) { return false; }");
    if (targetCount > 1) {
      lines.push("target2 = pickOne(targetPool.filter((candidate) => candidate.id !== target.id)) || null;");
      lines.push("if (!target2) { return false; }");
    }
  }

  const message = escapeForTemplate(effect.message || defaultMessageForType(effect));
  lines.push(`events.push(\`${message}\`);`);
  lines.push("item.used = Boolean(definition.consumeOnEvent);");
  lines.push("return true;");
  return lines;
}

function defaultMessageForType(effect) {
  const type = effect?.type;
  const targetCount = Math.max(1, Number(effect?.targetCount) || 1);
  if (type === "story-only") {
    return targetCount > 1 ? "{user} uses {item} on {target} and {target2}." : "{user} is affected by {item}.";
  }
  if (type === "kill-target") {
    return targetCount > 1 ? "{user} uses {item} on {target} and {target2}." : "{user} uses {item} on {target}.";
  }
  if (type === "kill-self") {
    return "{user} dies because of {item}.";
  }
  if (type === "distract-target") {
    return targetCount > 1 ? "{user} distracts {target} and {target2} with {item}." : "{user} distracts {target} with {item}.";
  }
  return "";
}

function escapeForTemplate(message) {
  return message
    .replaceAll("\\", "\\\\")
    .replaceAll("`", "\\`")
    .replaceAll("{user}", "${helpers.formatTributeName(tribute)}")
    .replaceAll("{target}", "${helpers.formatTributeName(target)}")
    .replaceAll("{target2}", "${target2 ? helpers.formatTributeName(target2) : 'someone'}")
    .replaceAll("{food}", "${helpers.escapeHtml(definition.label.toLowerCase())}")
    .replaceAll("{item}", "${helpers.escapeHtml(definition.label.toLowerCase())}");
}

function normalizeEditorItem(item) {
  const normalized = {
    ...DEFAULT_ITEM,
    ...item,
    eventPhases: Array.isArray(item.eventPhases) ? item.eventPhases : [],
    effects: Array.isArray(item.effects) ? item.effects.map(normalizeEffect) : []
  };

  if (!normalized.effects.length && item.effectType && item.effectType !== "none") {
    normalized.effects.push(normalizeEffect({
      type: item.effectType,
      chance: 1,
      message: item.effectMessage || "",
      customCode: item.customCode || ""
    }));
  }

  return normalized;
}

function normalizeEffect(effect) {
  return {
    type: effect?.type || "kill-target",
    chance: effect?.chance ?? 1,
    targetCount: effect?.targetCount ?? 1,
    message: effect?.message || "",
    customCode: effect?.customCode || ""
  };
}

function getEffectPreviewText(effect, itemLabel) {
  if (effect.type === "custom") {
    return effect.customCode ? "This outcome uses custom advanced code." : "Custom outcome is empty.";
  }
  return (effect.message || defaultMessageForType(effect))
    .replaceAll("{user}", "Mandy")
    .replaceAll("{target}", "Berry")
    .replaceAll("{target2}", "Tomonia")
    .replaceAll("{food}", itemLabel || "item")
    .replaceAll("{item}", itemLabel || "item")
    .replace(/\{[^}]+\}/g, "");
}

function updateEffectPreview(index) {
  const item = items[activeIndex];
  const effect = item?.effects?.[index];
  if (!effect) {
    return;
  }

  const previewNode = effectsList.querySelector(`[data-effect-preview="${index}"]`);
  if (previewNode) {
    previewNode.textContent = getEffectPreviewText(effect, item.label);
  }
}

function createNewItem() {
  const key = getUniqueKey("newitem");
  return {
    ...DEFAULT_ITEM,
    key,
    label: "New Item",
    effects: []
  };
}

function createNewEffect() {
  return {
    type: "kill-target",
    chance: 1,
    targetCount: 1,
    message: "{user} uses {item} on {target}.",
    customCode: ""
  };
}

function getUniqueKey(base) {
  const clean = sanitizeKey(base) || "item";
  let key = clean;
  let index = 2;
  while (items.some((item) => item.key === key)) {
    key = `${clean}${index}`;
    index += 1;
  }
  return key;
}

function sanitizeKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9_]/g, "");
}

function numberOrBlank(value) {
  return value === null || value === undefined ? "" : String(value);
}

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseMaybeNumber(value) {
  if (value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toObjectLiteral(value, indent) {
  const pad = " ".repeat(indent);
  const childPad = " ".repeat(indent + 2);
  const lines = Object.entries(value).map(([key, entry]) => {
    if (Array.isArray(entry)) {
      return `${childPad}${key}: [${entry.map((item) => JSON.stringify(item)).join(", ")}]`;
    }
    return `${childPad}${key}: ${typeof entry === "string" ? JSON.stringify(entry) : entry}`;
  });
  return `{\n${lines.join(",\n")}\n${pad}}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
