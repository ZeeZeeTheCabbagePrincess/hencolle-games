window.HENCOLLE_SPONSOR_ITEMS = {
  medkit: {
    label: "Medkit",
    description: "Can save a tribute from a bad fatal event once.",
    combat: 0,
    defense: 2,
    safety: 1,
    eventChance: 0.1,
    eventPhases: ["day", "night", "bloodbath"],
    rescueChance: 0.38,
    consumeOnRescue: true
  },
  armor: {
    label: "Armor",
    description: "Makes direct confrontations less likely to kill them.",
    combat: 0,
    defense: 3,
    safety: 0.5
  },
  rifle: {
    label: "Rifle",
    description: "Greatly improves their odds in direct combat.",
    combat: 3,
    defense: 0,
    safety: 0,
    eventChance: 0.2,
    eventPhases: ["day", "night", "bloodbath"],
    consumeOnEvent: true
  },
  explosives: {
    label: "Explosives",
    description: "Has a chance to create an exclusive kill event during the day or night.",
    combat: 2,
    defense: 0,
    safety: 0,
    eventChance: 0.2,
    eventPhases: ["day", "night"],
    consumeOnEvent: true
  },
  trapkit: {
    label: "Trap Kit",
    description: "Lets them rig a nasty arena trap for another tribute.",
    combat: 1,
    defense: 1,
    safety: 0.5,
    eventChance: 0.14,
    eventPhases: ["day", "night"],
    consumeOnEvent: true
  },
  sponsorfood: {
    label: "Food",
    description: "Keeps them steady and less likely to die to random hazards.",
    combat: 0,
    defense: 1,
    safety: 2,
    eventChance: 0.5,
    eventPhases: ["day", "night", "bloodbath"]
  },
  luckycharm: {
    label: "Lucky Charm",
    description: "A quiet sponsor bias that nudges events away from disaster.",
    combat: 0,
    defense: 1,
    safety: 2.5
  },
  dildo: {
    label: "Dildo",
    description: "A rubber toy that can be used in combat",
    combat: 1,
    defense: 0,
    safety: 0,
    eventChance: 0.2,
    eventPhases: ["day", "night"]
  },
  sharkbuttplug: {
    label: "Shark Buttplug",
    description: "",
    combat: 0,
    defense: 0,
    safety: 1,
    eventChance: 1,
    eventPhases: ["day", "bloodbath"],
    rescueChance: 1
  },
  chrishansen: {
    label: "Chris Hansen",
    description: "uhhh... hes gonna get ya",
    combat: 10,
    defense: 0,
    safety: 0,
    eventChance: 0.25,
    eventPhases: ["day", "bloodbath"],
    consumeOnEvent: true
  },
  cuckchair: {
    label: "Cuck Chair",
    description: "It's a cuck chair, get cucked idiot!",
    combat: 1,
    defense: 0,
    safety: 0,
    eventChance: 0.3,
    eventPhases: ["day", "night", "bloodbath"],
    consumeOnEvent: true
  },
  sharkhoodie: {
    label: "Gura Hoodie",
    description: "It's pretty stinky....",
    combat: 0,
    defense: 1,
    safety: 2,
    eventChance: 0.49,
    eventPhases: ["day", "night", "bloodbath"]
  },
  powpowgun: {
    label: "Pow Pow",
    description: "Pow Pow is the name of Jinx's gun!",
    combat: 3,
    defense: 0,
    safety: 0,
    eventChance: 0.47,
    eventPhases: ["day", "night", "bloodbath"],
    consumeOnEvent: true
  }
};
