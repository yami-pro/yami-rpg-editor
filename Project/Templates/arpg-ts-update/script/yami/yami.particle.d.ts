/** 粒子文件数据 */
type ParticleFile = {
  id: string //+
  path: string //+
  layers: Array<ParticleLayerData>
}

/** 粒子图层数据 */
type ParticleLayerData = {
  class: 'particle'
  name: string
  hidden: boolean
  area: ParticleEmissionArea
  count: number
  delay: number
  interval: number
  lifetime: number
  lifetimeDev: number
  fadeout: number
  anchor: {
    x: ParticleParameter
    y: ParticleParameter
    speedX: ParticleParameter
    speedY: ParticleParameter
  }
  movement: {
    angle: ParticleParameter
    speed: ParticleParameter
    accelAngle: ParticleParameter
    accel: ParticleParameter
  }
  rotation: {
    angle: ParticleParameter
    speed: ParticleParameter
    accel: ParticleParameter
  }
  hRotation: {
    radius: ParticleParameter
    expansionSpeed: ParticleParameter
    expansionAccel: ParticleParameter
    angle: ParticleParameter
    angularSpeed: ParticleParameter
    angularAccel: ParticleParameter
  }
  scale: {
    factor: ParticleParameter
    speed: ParticleParameter
    accel: ParticleParameter
  }
  image: string
  blend: BlendingMode
  light: ParticleLightSamplingMode
  sort: ParticleSortMode
  sprite: ParticleSprite
  color: ParticleColor
}

/** 粒子发射区域 */
type ParticleEmissionArea = ParticleEmissionAreaPoint | ParticleEmissionAreaRectangle | ParticleEmissionAreaCircle | ParticleEmissionAreaEdge

/** 粒子发射区域 - 点 */
type ParticleEmissionAreaPoint = {
  type: 'point'
  x: number
  y: number
}

/** 粒子发射区域 - 矩形 */
type ParticleEmissionAreaRectangle = {
  type: 'rectangle'
  x: number
  y: number
  width: number
  height: number
}

/** 粒子发射区域 - 圆形 */
type ParticleEmissionAreaCircle = {
  type: 'circle'
  x: number
  y: number
  radius: number
}

/** 粒子发射区域 - 屏幕边缘 */
type ParticleEmissionAreaEdge = {
  type: 'edge'
}

/** 粒子参数 */
type ParticleParameter = [std: number, dev: number]

/** 粒子光线采样模式映射表 */
type ParticleLightSamplingModes = {raw: 0, global: 1, ambient: 2}

/** 粒子光线采样模式 */
type ParticleLightSamplingMode = 'raw' | 'global' | 'ambient'

/** 粒子排序模式 */
type ParticleSortMode = 'youngest-in-front' | 'oldest-in-front' | 'by-scale-factor'

/** 粒子精灵图 */
type ParticleSprite = {
  mode: string
  hframes: number
  vframes: number
  interval: number
}

/** 粒子颜色模式 */
type ParticleColor = ParticleColorFixed | ParticleColorRandom | ParticleColorEasing | ParticleColorTexture

/** 粒子颜色 - 固定 */
type ParticleColorFixed = {
  mode: 'fixed'
  rgba: ColorArray
}

/** 粒子颜色 - 随机 */
type ParticleColorRandom = {
  mode: 'random'
  min: ColorArray
  max: ColorArray
}

/** 粒子颜色 - 过渡 */
type ParticleColorEasing = {
  mode: 'easing'
  easingId: string
  startMin: ColorArray
  startMax: ColorArray
  endMin: ColorArray
  endMax: ColorArray
}

/** 粒子颜色 - 纹理采样 */
type ParticleColorTexture = {
  mode: 'texture'
  tint: ImageTint
}