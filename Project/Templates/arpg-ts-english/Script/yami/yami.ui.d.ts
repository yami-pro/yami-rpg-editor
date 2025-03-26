/** 界面文件数据 */
type UIFile = {
  id: string //+
  path: string //+
  width: number
  height: number
  nodes: Array<UIElementData>
}

/** 混合模式选项 */
type BlendingMode = 'normal' | 'screen' | 'additive' | 'subtract' | 'max' | 'copy'

/** 光源混合模式选项 */
type LightBlendingMode = 'screen' | 'additive' | 'subtract' | 'max'

/** 指针事件选项 */
type PointerEvents = 'enabled' | 'disabled' | 'skipped'

/** 元素变换对象的键 */
type TransformKey = keyof TransformData

/** 元素变换数据 */
type TransformData = {
  anchorX: number
  anchorY: number
  x: number
  x2: number
  y: number
  y2: number
  width: number
  width2: number
  height: number
  height2: number
  rotation: number
  scaleX: number
  scaleY: number
  skewX: number
  skewY: number
  opacity: number
}

/** 元素变换对象选项 */
type TransformOptions = {
  anchorX?: number
  anchorY?: number
  x?: number
  x2?: number
  y?: number
  y2?: number
  width?: number
  width2?: number
  height?: number
  height2?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
  skewX?: number
  skewY?: number
  opacity?: number
}

/** 界面元素数据 */
type UIElementData =
| ImageElementData
| TextElementData
| TextBoxElementData
| DialogBoxElementData
| ProgressBarElementData
| ButtonElementData
| AnimationElementData
| VideoElementData
| WindowElementData
| ContainerElementData

/** 图像元素数据 */
type ImageElementData = {
  ui: UIFile //+
  class: 'image'
  name: string
  enabled: boolean
  expanded: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  referenceId?: string //+
  image: string
  display: ImageElementDisplay
  flip: FlipMode
  blend: BlendingMode | 'mask'
  shiftX: number
  shiftY: number
  clip: ImageClip
  border: number
  tint: ImageTint
  pointerEvents: PointerEvents
  transform: TransformData
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  children: Array<UIElementData>
}

/** 图像元素显示模式 */
type ImageElementDisplay = 'stretch' | 'tile' | 'clip' | 'slice'

/** 翻转模式 */
type FlipMode = 'none' | 'horizontal' | 'vertical' | 'both'

/** 文本元素数据 */
type TextElementData = {
  ui: UIFile //+
  class: 'text'
  name: string
  enabled: boolean
  expanded: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  referenceId?: string //+
  direction: TextElementDirection
  horizontalAlign: HorizontalAlignment
  verticalAlign: VerticalAlignment
  content: string
  size: number
  lineSpacing: number
  letterSpacing: number
  color: string
  font: string
  typeface: TypeFace
  effect: TextEffect
  overflow: TextOverflowMode
  blend: BlendingMode
  pointerEvents: PointerEvents
  transform: TransformData
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  children: Array<UIElementData>
}

/** 水平对齐 */
type HorizontalAlignment = 'left' | 'center' | 'right'

/** 垂直对齐 */
type VerticalAlignment = 'top' | 'middle' | 'bottom'

/** 文本元素文字方向 */
type TextElementDirection = 'horizontal-tb' | 'vertical-lr' | 'vertical-rl'

/** 字型 */
type TypeFace = 'regular' | 'bold' | 'italic' | 'bold-italic'

/** 文字效果 */
type TextEffect = TextEffectNone | TextEffectShadow | TextEffectStroke | TextEffectOutline

/** 文字效果 - 无 */
type TextEffectNone = {
  type: 'none'
}

/** 文字效果 - 阴影 */
type TextEffectShadow = {
  type: 'shadow'
  shadowOffsetX: number
  shadowOffsetY: number
  color: string
}

/** 文字效果 - 描边 */
type TextEffectStroke = {
  type: 'stroke'
  strokeWidth: number
  color: string
}

/** 文字效果 - 轮廓 */
type TextEffectOutline = {
  type: 'outline'
  color: string
}

/** 文本溢出模式 */
type TextOverflowMode = 'visible' | 'wrap' | 'truncate' | 'wrap-truncate'

/** 文本框元素数据 */
type TextBoxElementData = {
  ui: UIFile //+
  class: 'textbox'
  name: string
  enabled: boolean
  expanded: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  referenceId?: string //+
  type: TextBoxContentType
  align: HorizontalAlignment
  text: string
  maxLength: number
  number: number
  min: number
  max: number
  decimals: number
  padding: number
  size: number
  font: string
  color: string
  selectionColor: string
  selectionBgColor: string
  pointerEvents: PointerEvents
  transform: TransformData
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  children: Array<UIElementData>
}

/** 文本框内容类型 */
type TextBoxContentType = 'text' | 'number'

/** 文本框影子输入框 */
interface TextBoxShadowInput extends HTMLInputElement {
  target?: TextBoxElement
  events?: Array<[string, (event: any) => void]>
}

/** 对话框元素数据 */
type DialogBoxElementData = {
  ui: UIFile //+
  class: 'dialogbox'
  name: string
  enabled: boolean
  expanded: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  referenceId?: string //+
  content: string
  interval: number
  size: number
  lineSpacing: number
  letterSpacing: number
  color: string
  font: string
  typeface: TypeFace
  effect: TextEffect
  blend: BlendingMode
  pointerEvents: PointerEvents
  transform: TransformData
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  children: Array<UIElementData>
}

/** 进度条元素数据 */
type ProgressBarElementData = {
  ui: UIFile //+
  class: 'progressbar'
  name: string
  enabled: boolean
  expanded: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  referenceId?: string //+
  image: string
  display: ProgressBarElementDisplay
  clip: ImageClip
  type: ProgressBarElementType
  centerX: number
  centerY: number
  startAngle: number
  centralAngle: number
  step: number
  progress: number
  blend: BlendingMode
  colorMode: ProgressBarElementColorMode
  color: ColorArray
  pointerEvents: PointerEvents
  transform: TransformData
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  children: Array<UIElementData>
}

/** 进度条元素显示模式 */
type ProgressBarElementDisplay = 'stretch' | 'clip'

/** 进度条元素类型 */
type ProgressBarElementType = 'horizontal' | 'vertical' | 'round'

/** 进度条元素颜色模式 */
type ProgressBarElementColorMode = 'texture' | 'fixed'

/** 按钮元素数据 */
type ButtonElementData = {
  ui: UIFile //+
  class: 'button'
  name: string
  enabled: boolean
  expanded: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  referenceId?: string //+
  display: ImageElementDisplay
  normalImage: string
  normalClip: ImageClip
  hoverImage: string
  hoverClip: ImageClip
  activeImage: string
  activeClip: ImageClip
  flip: FlipMode
  border: number
  imagePadding: number
  imageOpacity: number
  imageEffect: ButtonElementImageEffect
  normalTint: ImageTint
  hoverTint: ImageTint
  activeTint: ImageTint
  direction: TextDirection
  horizontalAlign: HorizontalAlignment
  verticalAlign: VerticalAlignment
  content: string
  size: number
  letterSpacing: number
  textPadding: number
  font: string
  typeface: TypeFace
  textEffect: TextEffect
  normalColor: string
  hoverColor: string
  activeColor: string
  hoverSound: string
  clickSound: string
  pointerEvents: PointerEvents
  transform: TransformData
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  children: Array<UIElementData>
}

/** 按钮元素图像效果 */
type ButtonElementImageEffect = 'none' | 'tint-1' | 'tint-2' | 'tint-3'

/** 按钮元素文字方向 */
type TextElementDirection = 'horizontal-tb' | 'vertical-lr'

/** 动画元素数据 */
type AnimationElementData = {
  ui: UIFile //+
  class: 'animation'
  name: string
  enabled: boolean
  expanded: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  referenceId?: string //+
  animation: string
  motion: string
  autoplay: boolean
  rotatable: boolean
  angle: number
  frame: number
  offsetX: number
  offsetY: number
  pointerEvents: PointerEvents
  transform: TransformData
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  children: Array<UIElementData>
}

/** 视频元素数据 */
type VideoElementData = {
  ui: UIFile //+
  class: 'video'
  name: string
  enabled: boolean
  expanded: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  referenceId?: string //+
  video: string
  playbackRate: number
  loop: boolean
  flip: FlipMode
  blend: BlendingMode
  pointerEvents: PointerEvents
  transform: TransformData
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  children: Array<UIElementData>
}

/** 窗口元素数据 */
type WindowElementData = {
  ui: UIFile //+
  class: 'window'
  name: string
  enabled: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  referenceId?: string //+
  layout: WindowElementLayout
  scrollX: number
  scrollY: number
  gridWidth: number
  gridHeight: number
  gridGapX: number
  gridGapY: number
  paddingX: number
  paddingY: number
  overflow: WindowElementOverflow
  pointerEvents: PointerEvents
  transform: TransformData
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  children: Array<UIElementData>
}

/** 窗口元素布局 */
type WindowElementLayout = 'normal' | 'horizontal-grid' | 'vertical-grid'

/** 窗口元素溢出模式 */
type WindowElementOverflow = 'visible' | 'hidden'

/** 容器元素数据 */
type ContainerElementData = {
  ui: UIFile //+
  class: 'container'
  name: string
  enabled: boolean
  expanded: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  referenceId?: string //+
  pointerEvents: PointerEvents
  transform: TransformData
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  children: Array<UIElementData>
}

/** 引用元素数据 */
type ReferenceElementData = {
  ui: UIFile //+
  class: 'reference'
  name: string
  enabled: boolean
  expanded: boolean
  hidden: boolean
  locked: boolean
  presetId: string
  prefabId: string
  synchronous: boolean
  transform: TransformData
  events: HashMap<CommandFunctionList> //*
  scripts: Array<ScriptData>
  children: Array<UIElementData>
}

/** 元素类映射表 */
type ElementClassMap = {
  image: ImageElementConstructor
  text: TextElementConstructor
  textbox: TextBoxElementConstructor
  dialogbox: DialogBoxElementConstructor
  progressbar: ProgressBarElementConstructor
  button: ButtonElementConstructor
  animation: AnimationElementConstructor
  video: VideoElementConstructor
  window: WindowElementConstructor
  container: ContainerElementConstructor
}

/** 按钮相对方向 */
type ButtonRelativeDirection = 'Up' | 'Down' | 'Left' | 'Right'

/** 元素基类接口 */
interface UIElement {
  focusMode?: FocusMode
  focusCancelable?: boolean
  draw(): void
  resize(): void
  updateTextContent?(): void
  updatePrinter?(): void
}

/** 焦点模式 */
type FocusMode = 'control-child-buttons' | 'control-descendant-buttons'

/** 极简界面元素数据 */
interface MiniUIElementData {
  presetId: string
  referenceId?: string
  name: string
  pointerEvents: PointerEvents
  events: HashMap<CommandFunctionList>
  scripts: Array<ScriptData>
  transform: TransformData
}

/** 极简图像元素数据 */
interface MiniImageElementData extends MiniUIElementData {
  image: string
  display: ImageElementDisplay
  flip: FlipMode
  blend: BlendingMode
  shiftX: number
  shiftY: number
  clip: ImageClip
  border: number
  tint: ImageTint
}

/** 极简文本元素数据 */
interface MiniTextElementData extends MiniUIElementData {
  direction: TextElementDirection
  horizontalAlign: HorizontalAlignment
  verticalAlign: VerticalAlignment
  content: string
  size: number
  lineSpacing: number
  letterSpacing: number
  color: string
  font: string
  typeface: TypeFace
  effect: TextEffect
  overflow: TextOverflowMode
  blend: BlendingMode
}

/** 动态文本更新器 */
type DynamicTextUpdater = {
  /**
   * 变化时回调函数
   * @param content 新的内容
   */
  onChange: (content: string) => void
  /** 更新函数 */
  update: () => void
}

/** 极简文本框元素数据 */
interface MiniTextBoxElementData extends MiniUIElementData {
  type: TextBoxContentType
  align: HorizontalAlignment
  text: string
  maxLength: number
  number: number
  min: number
  max: number
  decimals: number
  padding: number
  size: number
  font: string
  color: string
  selectionColor: string
  selectionBgColor: string
}

/** 极简对话框元素数据 */
interface MiniDialogBoxElementData extends MiniUIElementData {
  content: string
  interval: number
  size: number
  lineSpacing: number
  letterSpacing: number
  color: string
  font: string
  typeface: TypeFace
  effect: TextEffect
  blend: BlendingMode
}

/** 极简进度条元素数据 */
interface MiniProgressBarElementData extends MiniUIElementData {
  image: string
  display: ProgressBarElementDisplay
  clip: ImageClip
  type: ProgressBarElementType
  centerX: number
  centerY: number
  startAngle: number
  centralAngle: number
  step: number
  progress: number
  blend: BlendingMode
  colorMode: ProgressBarElementColorMode
  color: ColorArray
}

/** 进度条响应数据 */
type ProgressBarResponse = {
  vertices: Float32Array
  angles: Float64Array
  array: Float64Array
  vertexLength: number
  drawingLength: number
}

/** 按钮元素状态 */
type ButtonElementState = 'normal' | 'hover' | 'active'

/** 极简视频元素数据 */
interface MiniVideoElementData extends MiniUIElementData {
  video: string
  playbackRate: number
  loop: boolean
  flip: FlipMode
  blend: BlendingMode
}

/** HTML视频播放器 */
interface HTMLVideoPlayer extends HTMLVideoElement {
  guid: string
}

/** 极简窗口元素数据 */
interface MiniWindowElementData extends MiniUIElementData {
  layout: WindowElementLayout
  scrollX: number
  scrollY: number
  gridWidth: number
  gridHeight: number
  gridGapX: number
  gridGapY: number
  paddingX: number
  paddingY: number
  overflow: WindowElementOverflow
}