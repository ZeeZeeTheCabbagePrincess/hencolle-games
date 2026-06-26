window.HENCOLLE_STATUS_EFFECTS = {
  paranoia: {
      label: "Paranoia",
      description: "They hear threats everywhere and start making bad choices.",
      combat: -0.2,
      defense: -0.4,
      safety: -1.2,
      eventChance: 0.18,
      eventPhases: ["day","night"],
      effectSource: "const { tribute, target, fallenIds, events, item, definition, helpers } = context;\nconst totalWeight = 2 + 1;\nif (totalWeight <= 0) { return false; }\nlet roll = Math.random() * totalWeight;\nif ((roll -= 2) <= 0) {\n  events.push(`${helpers.formatTributeName(tribute)} keeps hearing footsteps that are not there and wastes precious time.`);\n  item.used = Boolean(definition.clearOnEvent);\n  return true;\n}\nif ((roll -= 1) <= 0) {\n  if (!target) { return false; }\n  fallenIds.push(target.id);\n  events.push(`${helpers.formatTributeName(tribute)} gives in to paranoia and attacks ${target ? helpers.formatTributeName(target) : 'someone'} first.`);\n  item.used = Boolean(definition.clearOnEvent);\n  return true;\n}\nreturn false;"
    },
  exhaustion: {
      label: "Exhaustion",
      description: "They are drained and can barely keep moving.",
      combat: -1.5,
      defense: -1,
      safety: -0.8,
      eventChance: 0.14,
      eventPhases: ["day","night"],
      effectSource: "const { tribute, target, fallenIds, events, item, definition, helpers } = context;\nconst totalWeight = 3 + 1;\nif (totalWeight <= 0) { return false; }\nlet roll = Math.random() * totalWeight;\nif ((roll -= 3) <= 0) {\n  events.push(`${helpers.formatTributeName(tribute)} stumbles around in a haze, barely keeping up.`);\n  item.used = Boolean(definition.clearOnEvent);\n  return true;\n}\nif ((roll -= 1) <= 0) {\n  fallenIds.push(tribute.id);\n  events.push(`${helpers.formatTributeName(tribute)} collapses from exhaustion and never gets back up.`);\n  item.used = Boolean(definition.clearOnEvent);\n  return true;\n}\nreturn false;"
    },
  adrenaline: {
      label: "Adrenaline",
      description: "A dangerous burst of energy makes them faster and more aggressive.",
      combat: 1.5,
      defense: 0.6,
      safety: -0.2,
      eventChance: 0.12,
      eventPhases: ["bloodbath","day","night"],
      clearOnEvent: true,
      effectSource: "const { tribute, target, fallenIds, events, item, definition, helpers } = context;\nconst totalWeight = 2 + 1;\nif (totalWeight <= 0) { return false; }\nlet roll = Math.random() * totalWeight;\nif ((roll -= 2) <= 0) {\n  events.push(`${helpers.formatTributeName(tribute)} rides a rush of adrenaline and pushes through the pain.`);\n  item.used = Boolean(definition.clearOnEvent);\n  return true;\n}\nif ((roll -= 1) <= 0) {\n  if (!target) { return false; }\n  fallenIds.push(target.id);\n  events.push(`${helpers.formatTributeName(tribute)} snaps into motion and overwhelms ${target ? helpers.formatTributeName(target) : 'someone'}.`);\n  item.used = Boolean(definition.clearOnEvent);\n  return true;\n}\nreturn false;"
    },
  horny: {
      label: "Horniness",
      description: "They become horny, what more can I say",
      combat: 1,
      defense: 0,
      safety: 0,
      eventChance: 0.2,
      eventPhases: ["day","night"],
      clearOnEvent: true,
      effectSource: "const { tribute, target, fallenIds, events, item, definition, helpers } = context;\nconst totalWeight = 1 + 1 + 1;\nif (totalWeight <= 0) { return false; }\nlet roll = Math.random() * totalWeight;\nif ((roll -= 1) <= 0) {\n  events.push(`${helpers.formatTributeName(tribute)} gets horny and starts gooning!`);\n  item.used = Boolean(definition.clearOnEvent);\n  return true;\n}\nif ((roll -= 1) <= 0) {\n  if (!target) { return false; }\n  events.push(`${helpers.formatTributeName(tribute)} gets horny and uses ${target ? helpers.formatTributeName(target) : 'someone'} as a sex toy!`);\n  item.used = Boolean(definition.clearOnEvent);\n  return true;\n}\nif ((roll -= 1) <= 0) {\n  if (!target) { return false; }\n  fallenIds.push(target.id);\n  events.push(`${helpers.formatTributeName(tribute)} gets horny and fucks ${target ? helpers.formatTributeName(target) : 'someone'} with a spear, killing them in the process...`);\n  item.used = Boolean(definition.clearOnEvent);\n  return true;\n}\nreturn false;"
    },
  kitten: {
      label: "Kitten",
      description: "They get needy, clingy, and easier to throw off their game.",
      combat: -0.2,
      defense: -0.4,
      safety: -0.6,
      eventChance: 0.16,
      eventPhases: ["day","night"],
      effectSource: "const { tribute, target, fallenIds, events, item, definition, helpers } = context;\nconst totalWeight = 2 + 1;\nif (totalWeight <= 0) { return false; }\nlet roll = Math.random() * totalWeight;\nif ((roll -= 2) <= 0) {\n  events.push(`${helpers.formatTributeName(tribute)} slips into kitten mode and loses focus on the arena.`);\n  item.used = Boolean(definition.clearOnEvent);\n  return true;\n}\nif ((roll -= 1) <= 0) {\n  if (!target) { return false; }\n  events.push(`${helpers.formatTributeName(tribute)} misbehaves and daddy ${target ? helpers.formatTributeName(target) : 'someone'} gets vewy vewy angy...\"daddies super mad kitten... meow for dada....mm dats a gud kitty.. make dada pwoud...\" ${target ? helpers.formatTributeName(target) : 'someone'} says to ${helpers.formatTributeName(tribute)} as they meow`);\n  item.used = Boolean(definition.clearOnEvent);\n  return true;\n}\nreturn false;"
    }
};
