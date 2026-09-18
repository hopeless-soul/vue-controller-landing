export interface Feature {
  tag: string
  title: string
  description: string
}

export const FEATURES: Feature[] = [
  {
    tag: 'FINISH',
    title: 'Mirror-polished surface',
    description:
      'Vacuum-metallized over a precision-lattice shell. Throws back every light source in the room, and every camera on stream.',
  },
  {
    tag: 'FIT · 27G',
    title: 'Disappears in your hands',
    description:
      'Molded around every button, stick, and trigger. Full range of motion, zero added bulk, 27 grams total.',
  },
  {
    tag: 'INSTALL',
    title: 'Just stick it on',
    description: 'No tools, no glue, no warranty voided. Clicks on in seconds, pops off just as easily.',
  },
]
