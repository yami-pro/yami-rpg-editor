'use strict'

// ******************************** 拾色器窗口 ********************************

const Color = {
  // properties
  target: null,
  dragging: null,
  paletteX: null,
  paletteY: null,
  pillarY: null,
  indexEnabled: null,
  // methods
  initialize: null,
  open: null,
  drawPalette: null,
  drawPillar: null,
  drawViewer: null,
  setPaletteCursor: null,
  setPillarCursor: null,
  getRGBFromPalette: null,
  getRGBFromPillar: null,
  getRGBAFromHex: null,
  getHexFromRGBA: null,
  getCSSColorFromRGBA: null,
  writeRGBAToInputs: null,
  readRGBAFromInputs: null,
  loadIndexedColors: null,
  simplifyHexColor: null,
  // events
  windowClosed: null,
  palettePointerdown: null,
  pillarPointerdown: null,
  indexedColorInput: null,
  indexedColorPointerdown: null,
  pointerup: null,
  pointermove: null,
  hexBeforeinput: null,
  hexInput: null,
  rgbaInput: null,
  confirm: null,
}

export { Color }
