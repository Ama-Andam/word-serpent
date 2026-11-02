/**
 * Word pools for each serpent tier. Add words freely; the engine only needs
 * a decent spread of first characters so the three choices start differently.
 */
const split = (s: string) => s.trim().split(/\s+/)

export const WORDS = {
  hatchling: split(`
    ant ash bay bee bud cat cog cub dew dot elm egg fig fin fox fog gem gum hat hay hen
    ink ivy jam jar jet kit key log lid map mud mint nap net nut oak owl oat pod pen pea
    rag ray rib sun sap sky tea tin toe urn van vat web wax yak yam zip zoo arc bow cup
    dig end fun gap hop joy kin leaf moss nest pond quay rain seed tide vine wren yarn
  `),
  viper: split(`
    amber anchor bloom branch cedar clover dapple dusk ember engine fable feather
    garden glimmer harbor hollow island ivory jasmine jungle kettle kindle lantern ledger
    meadow mirror nectar nimble orchid oyster pebble puzzle quartz quiver ripple river
    saddle signal tangle timber umber unfold velvet violet willow winter yonder yellow
    zephyr zigzag bright candle drift forest grain honey jolly knack lemon marble noble
    olive parcel quest rover spark thistle utter vivid whisk
  `),
  cobra: split(`
    Amber, Bloom. Cedar; Dusk! Ember, Fable. Garden; Harbor, Island. Jasmine! Kettle,
    Lantern. Meadow; Nectar, Orchid. Pebble! Quartz, River. Saddle; Timber, Umbra.
    Velvet! Willow, Yonder. Zephyr; "Aha," Bramble. Copper, Dawn's Echo; Frost.
    Glade! Hearth, Ivory. Juniper; Kestrel, Lagoon. Marrow! North, Opal. Prism;
    Quill, Raven. Sable! Thorn, Upland. Vesper; Wander, Yarrow. Zenith!
  `),
  basilisk: split(`
    archipelago belvedere cartography daydreaming effervescent filigree gossamer
    hieroglyph incandescent juxtapose kaleidoscope labyrinthine melancholy nightingale
    obsidian peregrine quintessence rhapsodic serendipity tessellate undulating
    vermilion whimsical xylophone yesteryear zoological ambrosial bioluminescent
    chrysalis dandelion ephemeral fathomless glockenspiel halcyon iridescent jubilation
    kinetograph luminescent mnemonic nocturnal onomatopoeia phosphorescent quixotic
    reverberate silhouette thunderstruck ultramarine vicissitude wanderlust zealously
  `),
  ouroboros: split(`
    x=42 #inkwell 3rd co-op e.g. $9.99 @home it's 50% (aside) [draft] {curly} <tag/>
    O'Neil 7:45pm 1,024 half-moon re-entry ~approx 2^10 v1.0.3 ¿qué? well-read
    a+b=c snake_case camelCase *stars* 99¢ 4x4 "quoted" mid-1800s 12/31 f(x) n'est
    50/50 ?!? hello_world Ångström λ-calc pH7 user@mail #42 -> &more
  `),
} as const
