/** 动画文件数据 */
type AnimationFile = {
  id: string //+
  path: string //+
  images: HashMap<string> //+
  sprites: HashMap<AnimationSpriteData> //*
  motions: HashMap<AnimationMotionData> //*
}

/** 动画精灵数据 */
type AnimationSpriteData = {
  name: string
  id: string
  image: string
  hframes: number
  vframes: number
}

/** 动画动作数据 */
type AnimationMotionData = {
  class: 'motion'
  id: string
  name: string //+
  mode: AnimationMotionMode
  skip: boolean
  loop: boolean
  loopStart: number
  dirCases: Array<AnimationDirectionData>
  dirList: Array<AnimationDirectionMap> //+
}

/** 动画方向数据 */
type AnimationDirectionData = {
  layers: Array<AnimationLayer>
  loopStart: number //+
  length: number //+
}

/** 动画光线采样模式映射表 */
type AnimationLightSamplingModes = {raw: 0, global: 1, anchor: 2}

/** 动画方向列表的映射表 */
type AnimationDirectionListMap = {
  '1-dir': Array<AnimationDirectionMap>
  '2-dir': Array<AnimationDirectionMap>
  '4-dir': Array<AnimationDirectionMap>
  '8-dir': Array<AnimationDirectionMap>
  '1-dir-mirror': Array<AnimationDirectionMap>
  '2-dir-mirror': Array<AnimationDirectionMap>
  '3-dir-mirror': Array<AnimationDirectionMap>
  '5-dir-mirror': Array<AnimationDirectionMap>
}

/** 动画动作模式 */
type AnimationMotionMode = keyof AnimationDirectionListMap

/** 动画方向映射 */
type AnimationDirectionMap = {
  index: number
  mirror: boolean
}

/** 动画图层 */
type AnimationLayer = AnimationJointLayer | AnimationSpriteLayer | AnimationParticleLayer | AnimationSoundLayer

/** 动画帧 */
type AnimationFrame = AnimationJointFrame | AnimationSpriteFrame | AnimationParticleFrame | AnimationSoundFrame

/** 动画关节图层 */
type AnimationJointLayer = {
  class: 'joint'
  name: string
  expanded: boolean
  hidden: boolean
  locked: boolean
  frames: Array<AnimationJointFrame>
  children: Array<AnimationLayer>
}

/** 动画关节帧 */
type AnimationJointFrame = {
  start: number
  end: number
  easingId: string
  x: number
  y: number
  rotation: number
  scaleX: number
  scaleY: number
  opacity: number
}

/** 动画精灵图层 */
type AnimationSpriteLayer = {
  class: 'sprite'
  name: string
  hidden: boolean
  locked: boolean
  sprite: string
  blend: BlendingMode
  light: SpriteLightSamplingMode
  frames: Array<AnimationSpriteFrame>
}

/** 精灵光线采样模式 */
type SpriteLightSamplingMode = 'raw' | 'global' | 'anchor'

/** 动画精灵帧 */
type AnimationSpriteFrame = {
  start: number
  end: number
  easingId: string
  anchorX: number
  anchorY: number
  pivotX: number
  pivotY: number
  x: number
  y: number
  rotation: number
  scaleX: number
  scaleY: number
  opacity: number
  spriteX: number
  spriteY: number
  tint: ImageTint
}

/** 动画粒子层 */
type AnimationParticleLayer = {
  class: 'particle'
  name: string
  hidden: boolean
  locked: boolean
  particleId: string
  position: AnimationParticlePosition
  angle: AnimationParticleAngle
  frames: Array<AnimationParticleFrame>
}

/** 动画粒子位置 */
type AnimationParticlePosition = 'absolute' | 'relative'

/** 动画粒子角度 */
type AnimationParticleAngle = 'default' | 'inherit'

/** 动画粒子帧 */
type AnimationParticleFrame = {
  start: number
  end: number
  easingId: string
  x: number
  y: number
  rotation: number
  scaleX: number
  scaleY: number
  opacity: number
  scale: number
  speed: number
}

/** 动画音效层 */
type AnimationSoundLayer = {
  class: 'sound'
  name: string
  hidden: boolean
  locked: boolean
  playbackRate: AnimationSoundPlaybackRate
  frames: Array<AnimationSoundFrame>
}

/** 动画音效播放速度 */
type AnimationSoundPlaybackRate = 'default' | 'inherit'

/** 动画音效帧 */
type AnimationSoundFrame = {
  start: number
  end: number
  sound: string
  volume: number
}

/** 动画图层上下文 */
type AnimationFrameContext = {
  animation: AnimationPlayer
  parent: AnimationLayerContext
  layer: AnimationLayer
  frame: AnimationFrame | null
  tint: Int16Array | null
  emitter: AnimationParticleEmitter | null
  matrix: Matrix
  anchorX: number
  anchorY: number
  pivotX: number
  pivotY: number
  opacity: number
  version: number
  update(frame: AnimationFrame, time?: number, next?: AnimationFrame): void
  reset(): void
}

/** 动画粒子发射器 */
interface AnimationParticleEmitter extends SceneParticleEmitter {
  disabled: boolean
}