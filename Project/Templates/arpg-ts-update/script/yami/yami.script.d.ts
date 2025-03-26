/** 脚本实现 */
type Script<T> = 1 extends 0 ? 0
: T extends Plugin ? YamiPluginScript
: T extends Global ? YamiEventScript
: T extends Command ? YamiCommandScript
: T extends Scene ? YamiSceneScript
: T extends Actor ? YamiActorScript
: T extends SceneRegion ? YamiRegionScript
: T extends SceneLight ? YamiLightScript
: T extends SceneAnimation ? YamiAnimationScript
: T extends SceneParticleEmitter ? YamiParticleEmitterScript
: T extends SceneParallax ? YamiParallaxScript
: T extends SceneTilemap ? YamiTilemapScript
: T extends Trigger ? YamiTriggerScript
: T extends Skill ? YamiSkillScript
: T extends State ? YamiStateScript
: T extends Equipment ? YamiEquipmentScript
: T extends Item ? YamiItemScript
: T extends TextBoxElement ? YamiTextBoxElementScript
: T extends ButtonElement ? YamiButtonElementScript
: T extends AnimationElement ? YamiAnimationElementScript
: T extends VideoElement ? YamiVideoElementScript
: T extends
| ImageElement
| TextElement
| DialogBoxElement
| ProgressBarElement
| ButtonElement
| VideoElement
| WindowElement
| ContainerElement
? YamiUIElementScript<T>
: YamiComponentScript<T>

/** 插件脚本 */
type Plugin = 0
/** 指令脚本 */
type Command = 1
/** 全局事件脚本 */
type Global = 2
/** 场景脚本 */
type Scene = 3

/** 插件脚本接口 */
interface YamiPluginScript {
  /**
   * 准备就绪后触发
   */
  onStart?(): void
}

/** 事件脚本接口 */
interface YamiEventScript extends YamiPluginScript {
  /**
   * 键盘按下时触发
   * @param event 键盘事件
   */
  onKeyDown?(event: ScriptKeyboardEvent): void
  /**
   * 键盘弹起时触发
   * @param event 键盘事件
   */
  onKeyUp?(event: ScriptKeyboardEvent): void
  /**
   * 鼠标按下时触发
   * @param event 鼠标事件
   */
  onMouseDown?(event: ScriptMouseEvent): void
  /**
   * 鼠标弹起时触发
   * @param event 鼠标事件
   */
  onMouseUp?(event: ScriptMouseEvent): void
  /**
   * 鼠标移动时触发
   * @param event 鼠标事件
   */
  onMouseMove?(event: ScriptMouseEvent): void
  /**
   * 鼠标双击时触发
   * @param event 鼠标事件
   */
  onDoubleClick?(event: ScriptMouseEvent): void
  /**
   * 鼠标滚轮滑动时触发
   * @param event 滚轮事件
   */
  onWheel?(event: ScriptWheelEvent): void
  /**
   * 触摸开始时触发
   * @param event 触摸事件
   */
  onTouchStart?(event: ScriptTouchEvent): void
  /**
   * 触摸移动时触发
   * @param event 触摸事件
   */
  onTouchMove?(event: ScriptTouchEvent): void
  /**
   * 触摸结束时触发
   * @param event 触摸事件
   */
  onTouchEnd?(event: ScriptTouchEvent): void
  /**
   * 手柄按钮按下时触发
   * @param event 手柄事件
   */
  onGamepadButtonPress?(event: ScriptGamepadEvent): void
  /**
   * 手柄按钮弹起时触发
   * @param event 手柄事件
   */
  onGamepadButtonRelease?(event: ScriptGamepadEvent): void
  /**
   * 手柄左摇杆改变时触发
   * @param event 手柄事件
   */
  onGamepadLeftStickChange?(event: ScriptGamepadEvent): void
  /**
   * 手柄右摇杆改变时触发
   * @param event 手柄事件
   */
  onGamepadRightStickChange?(event: ScriptGamepadEvent): void
  /**
   * 启动游戏时触发
   */
  onStartup?(): void
  /**
   * 创建场景时触发
   */
  onSceneCreate?(): void
  /**
   * 加载场景时触发
   */
  onSceneLoad?(): void
  /**
   * 加载存档时触发
   */
  onSaveLoad?(): void
  /**
   * 预加载时触发
   */
  onPreload?(): void
}

/** 指令脚本接口 */
interface YamiCommandScript {
  /**
   * 准备就绪后触发
   */
  onStart?(): void
  /**
   * 调用指令时触发
   * @param event 事件处理器
   */
  call(event: EventHandler): void
}

/** 通用脚本接口 */
interface YamiCommonScript<T> {
  [key: string]: any
  /**
   * 添加脚本时触发
   * @param target 目标对象
   */
  onScriptAdd?(target: T): void
  /**
   * 移除脚本时触发
   * @param target 目标对象
   */
  onScriptRemove?(target: T): void
}

/** 更新脚本接口 */
interface YamiUpdateScript {
  /**
   * 更新事件(每个游戏循环执行一次)
   * @param deltaTime 增量时间(毫秒)
   */
  update?(deltaTime: number): void
}

/** 组件脚本接口 */
interface YamiComponentScript<T> extends YamiCommonScript<T>, YamiUpdateScript {
  /**
   * 创建对象时触发
   * @param target 目标对象
   */
  onCreate?(target: T): void
  /**
   * 准备就绪后触发
   * @param target 目标对象
   */
  onStart?(target: T): void
  /**
   * 对象销毁后触发
   * @param target 目标对象
   */
  onDestroy?(target: T): void
}

/** 场景脚本接口 */
interface YamiSceneScript extends YamiComponentScript<SceneContext> {
  /**
   * @param scene 场景
   */
  onScriptAdd?(scene: SceneContext): void
  /**
   * @param scene 场景
   */
  onScriptRemove?(scene: SceneContext): void
  /**
   * @param scene 场景
   */
  onCreate?(scene: SceneContext): void
  /**
   * @param scene 场景
   */
  /**
   * 加载场景时触发
   * @param scene 场景
   */
  onLoad?(scene: SceneContext): void
  /**
   * @param scene 场景
   */
  onStart?(scene: SceneContext): void
  /**
   * @param scene 场景
   */
  onDestroy?(scene: SceneContext): void
}

/** 角色脚本接口 */
interface YamiActorScript extends YamiComponentScript<Actor> {
  /**
   * @param actor 角色
   */
  onScriptAdd?(actor: Actor): void
  /**
   * @param actor 角色
   */
  onScriptRemove?(actor: Actor): void
  /**
   * @param actor 角色
   */
  onCreate?(actor: Actor): void
  /**
   * @param actor 角色
   */
  onStart?(actor: Actor): void
  /**
   * @param actor 角色
   */
  onDestroy?(actor: Actor): void
  /**
   * 与其他角色碰撞时触发
   * @param event 碰撞事件
   */
  onCollision?(event: ScriptCollisionEvent): void
  /**
   * 被触发器击中时触发
   * @param event 触发器击中事件
   */
  onHitTrigger?(event: ScriptTriggerHitEvent): void
  /**
   * 鼠标按下时触发
   * @param event 鼠标事件
   */
  onMouseDown?(event: ScriptMouseEvent): void
  /**
   * 鼠标左键按下时触发
   * @param event 鼠标事件
   */
  onMouseDownLB?(event: ScriptMouseEvent): void
  /**
   * 鼠标右键按下时触发
   * @param event 鼠标事件
   */
  onMouseDownRB?(event: ScriptMouseEvent): void
  /**
   * 鼠标弹起时触发
   * @param event 鼠标事件
   */
  onMouseUp?(event: ScriptMouseEvent): void
  /**
   * 鼠标左键弹起时触发
   * @param event 鼠标事件
   */
  onMouseUpLB?(event: ScriptMouseEvent): void
  /**
   * 鼠标右键弹起时触发
   * @param event 鼠标事件
   */
  onMouseUpRB?(event: ScriptMouseEvent): void
  /**
   * 鼠标移动时触发
   * @param event 鼠标事件
   */
  onMouseMove?(event: ScriptMouseEvent): void
  /**
   * 鼠标进入时触发
   * @param event 鼠标事件
   */
  onMouseEnter?(event: ScriptMouseEvent): void
  /**
   * 鼠标离开时触发
   * @param event 鼠标事件
   */
  onMouseLeave?(event: ScriptMouseEvent): void
  /**
   * 鼠标点击时触发
   * @param event 鼠标事件
   */
  onClick?(event: ScriptMouseEvent): void
  /**
   * 鼠标双击时触发
   * @param event 鼠标事件
   */
  onDoubleClick?(event: ScriptMouseEvent): void
}

/** 区域脚本接口 */
interface YamiRegionScript extends YamiComponentScript<SceneRegion> {
  /**
   * @param region 区域
   */
  onScriptAdd?(region: SceneRegion): void
  /**
   * @param region 区域
   */
  onScriptRemove?(region: SceneRegion): void
  /**
   * @param region 区域
   */
  onCreate?(region: SceneRegion): void
  /**
   * @param region 区域
   */
  onStart?(region: SceneRegion): void
  /**
   * @param region 区域
   */
  onDestroy?(region: SceneRegion): void
  /**
   * 玩家角色进入区域时触发
   * @param event 碰撞事件
   */
  onPlayerEnter?(event: ScriptRegionEvent): void
  /**
   * 玩家角色离开区域时触发
   * @param event 触发器击中事件
   */
  onPlayerLeave?(event: ScriptRegionEvent): void
  /**
   * 任意角色进入区域时触发
   * @param event 碰撞事件
   */
  onActorEnter?(event: ScriptRegionEvent): void
  /**
   * 任意角色离开区域时触发
   * @param event 触发器击中事件
   */
  onActorLeave?(event: ScriptRegionEvent): void
}

/** 光源脚本接口 */
interface YamiLightScript extends YamiComponentScript<SceneLight> {
  /**
   * @param light 光源
   */
  onScriptAdd?(light: SceneLight): void
  /**
   * @param light 光源
   */
  onScriptRemove?(light: SceneLight): void
  /**
   * @param light 光源
   */
  onCreate?(light: SceneLight): void
  /**
   * @param light 光源
   */
  onStart?(light: SceneLight): void
  /**
   * @param light 光源
   */
  onDestroy?(light: SceneLight): void
}

/** 动画脚本接口 */
interface YamiAnimationScript extends YamiComponentScript<SceneAnimation> {
  /**
   * @param animation 动画
   */
  onScriptAdd?(animation: SceneAnimation): void
  /**
   * @param animation 动画
   */
  onScriptRemove?(animation: SceneAnimation): void
  /**
   * @param animation 动画
   */
  onCreate?(animation: SceneAnimation): void
  /**
   * @param animation 动画
   */
  onStart?(animation: SceneAnimation): void
  /**
   * @param animation 动画
   */
  onDestroy?(animation: SceneAnimation): void
}

/** 粒子发射器脚本接口 */
interface YamiParticleEmitterScript extends YamiComponentScript<SceneParticleEmitter> {
  /**
   * @param emitter 粒子发射器
   */
  onScriptAdd?(emitter: SceneParticleEmitter): void
  /**
   * @param emitter 粒子发射器
   */
  onScriptRemove?(emitter: SceneParticleEmitter): void
  /**
   * @param emitter 粒子发射器
   */
  onCreate?(emitter: SceneParticleEmitter): void
  /**
   * @param emitter 粒子发射器
   */
  onStart?(emitter: SceneParticleEmitter): void
  /**
   * @param emitter 粒子发射器
   */
  onDestroy?(emitter: SceneParticleEmitter): void
}

/** 视差图脚本接口 */
interface YamiParallaxScript extends YamiComponentScript<SceneParallax> {
  /**
   * @param parallax 视差图
   */
  onScriptAdd?(parallax: SceneParallax): void
  /**
   * @param parallax 视差图
   */
  onScriptRemove?(parallax: SceneParallax): void
  /**
   * @param parallax 视差图
   */
  onCreate?(parallax: SceneParallax): void
  /**
   * @param parallax 视差图
   */
  onStart?(parallax: SceneParallax): void
  /**
   * @param parallax 视差图
   */
  onDestroy?(parallax: SceneParallax): void
}

/** 瓦片地图脚本接口 */
interface YamiTilemapScript extends YamiComponentScript<SceneTilemap> {
  /**
   * @param tilemap 瓦片地图
   */
  onScriptAdd?(tilemap: SceneTilemap): void
  /**
   * @param tilemap 瓦片地图
   */
  onScriptRemove?(tilemap: SceneTilemap): void
  /**
   * @param tilemap 瓦片地图
   */
  onCreate?(tilemap: SceneTilemap): void
  /**
   * @param tilemap 瓦片地图
   */
  onStart?(tilemap: SceneTilemap): void
  /**
   * @param tilemap 瓦片地图
   */
  onDestroy?(tilemap: SceneTilemap): void
}

/** 触发器脚本接口 */
interface YamiTriggerScript extends YamiComponentScript<Trigger> {
  /**
   * @param trigger 触发器
   */
  onScriptAdd?(trigger: Trigger): void
  /**
   * @param trigger 触发器
   */
  onScriptRemove?(trigger: Trigger): void
  /**
   * @param trigger 触发器
   */
  onCreate?(trigger: Trigger): void
  /**
   * @param trigger 触发器
   */
  onStart?(trigger: Trigger): void
  /**
   * @param trigger 触发器
   */
  onDestroy?(trigger: Trigger): void
  /**
   * 击中角色时触发
   * @param event 触发器击中事件
   */
  onHitActor?(event: ScriptTriggerHitEvent): void
}

/** 技能脚本接口 */
interface YamiSkillScript extends YamiCommonScript<Skill> {
  /**
   * @param skill 技能
   */
  onScriptAdd?(skill: Skill): void
  /**
   * @param skill 技能
   */
  onScriptRemove?(skill: Skill): void
  /**
   * 施放技能时触发
   * @param skill 技能
   */
  onSkillCast?(skill: Skill): void
  /**
   * 添加技能到角色的技能列表时触发
   * @param skill 技能
   */
  onSkillAdd?(skill: Skill): void
  /**
   * 从角色的技能列表中移除技能时触发
   * @param skill 技能
   */
  onSkillRemove?(skill: Skill): void
}

/** 状态脚本接口 */
interface YamiStateScript extends YamiCommonScript<State>, YamiUpdateScript {
  /**
   * @param state 状态
   */
  onScriptAdd?(state: State): void
  /**
   * @param state 状态
   */
  onScriptRemove?(state: State): void
  /**
   * 添加状态到角色的状态列表时触发
   * @param state 状态
   */
  onStateAdd?(state: State): void
  /**
   * 从角色的状态列表中移除状态时触发
   * @param state 状态
   */
  onStateRemove?(state: State): void
}

/** 装备脚本接口 */
interface YamiEquipmentScript extends YamiCommonScript<Equipment> {
  /**
   * @param equipment 装备
   */
  onScriptAdd?(equipment: Equipment): void
  /**
   * @param equipment 装备
   */
  onScriptRemove?(equipment: Equipment): void
  /**
   * 创建对象时触发
   * @param equipment 装备
   */
  onCreate?(equipment: Equipment): void
  /**
   * 添加装备到角色的装备槽时触发
   * @param equipment 装备
   */
  onEquipmentAdd?(equipment: Equipment): void
  /**
   * 从角色的装备槽中移除装备时触发
   * @param equipment 装备
   */
  onEquipmentRemove?(equipment: Equipment): void
}

/** 物品脚本接口 */
interface YamiItemScript extends YamiCommonScript<Item> {
  /**
   * @param item 物品
   */
  onScriptAdd?(item: Item): void
  /**
   * @param item 物品
   */
  onScriptRemove?(item: Item): void
  /**
   * 创建对象时触发
   * @param item 物品
   */
  onCreate?(item: Item): void
  /**
   * 使用物品时触发
   * @param item 物品
   */
  onItemUse?(item: Item): void
}

/** 基础元素脚本接口 */
interface YamiUIElementScript<T> extends YamiComponentScript<T> {
  /**
   * @param element 元素
   */
  onScriptAdd?(element: T): void
  /**
   * @param element 元素
   */
  onScriptRemove?(element: T): void
  /**
   * @param element 元素
   */
  onCreate?(element: T): void
  /**
   * @param element 元素
   */
  onStart?(element: T): void
  /**
   * @param element 元素
   */
  onDestroy?(element: T): void
  /**
   * 元素获得焦点时触发
   * @param element 元素
   */
  onFocus?(element: T): void
  /**
   * 元素失去焦点时触发
   * @param element 元素
   */
  onBlur?(element: T): void
  /**
   * 键盘按下时触发
   * @param event 键盘事件
   */
  onKeyDown?(event: ScriptKeyboardEvent): void
  /**
   * 键盘弹起时触发
   * @param event 键盘事件
   */
  onKeyUp?(event: ScriptKeyboardEvent): void
  /**
   * 鼠标按下时触发
   * @param event 鼠标事件
   */
  onMouseDown?(event: ScriptMouseEvent): void
  /**
   * 鼠标左键按下时触发
   * @param event 鼠标事件
   */
  onMouseDownLB?(event: ScriptMouseEvent): void
  /**
   * 鼠标右键按下时触发
   * @param event 鼠标事件
   */
  onMouseDownRB?(event: ScriptMouseEvent): void
  /**
   * 鼠标弹起时触发
   * @param event 鼠标事件
   */
  onMouseUp?(event: ScriptMouseEvent): void
  /**
   * 鼠标左键弹起时触发
   * @param event 鼠标事件
   */
  onMouseUpLB?(event: ScriptMouseEvent): void
  /**
   * 鼠标右键弹起时触发
   * @param event 鼠标事件
   */
  onMouseUpRB?(event: ScriptMouseEvent): void
  /**
   * 鼠标移动时触发
   * @param event 鼠标事件
   */
  onMouseMove?(event: ScriptMouseEvent): void
  /**
   * 鼠标进入时触发
   * @param event 鼠标事件
   */
  onMouseEnter?(event: ScriptMouseEvent): void
  /**
   * 鼠标离开时触发
   * @param event 鼠标事件
   */
  onMouseLeave?(event: ScriptMouseEvent): void
  /**
   * 鼠标点击时触发
   * @param event 鼠标事件
   */
  onClick?(event: ScriptMouseEvent): void
  /**
   * 鼠标双击时触发
   * @param event 鼠标事件
   */
  onDoubleClick?(event: ScriptMouseEvent): void
  /**
   * 鼠标滚轮滑动时触发
   * @param event 滚轮事件
   */
  onWheel?(event: ScriptWheelEvent): void
  /**
   * 触摸开始时触发
   * @param event 触摸事件
   */
  onTouchStart?(event: ScriptTouchEvent): void
  /**
   * 触摸移动时触发
   * @param event 触摸事件
   */
  onTouchMove?(event: ScriptTouchEvent): void
  /**
   * 触摸结束时触发
   * @param event 触摸事件
   */
  onTouchEnd?(event: ScriptTouchEvent): void
  /**
   * 手柄按钮按下时触发
   * @param event 手柄事件
   */
  onGamepadButtonPress?(event: ScriptGamepadEvent): void
  /**
   * 手柄按钮弹起时触发
   * @param event 手柄事件
   */
  onGamepadButtonRelease?(event: ScriptGamepadEvent): void
  /**
   * 手柄左摇杆改变时触发
   * @param event 手柄事件
   */
  onGamepadLeftStickChange?(event: ScriptGamepadEvent): void
  /**
   * 手柄右摇杆改变时触发
   * @param event 手柄事件
   */
  onGamepadRightStickChange?(event: ScriptGamepadEvent): void
}

/** 文本框元素脚本接口 */
interface YamiTextBoxElementScript extends YamiUIElementScript<TextBoxElement> {
  /**
   * 元素输入内容时触发
   * @param event 输入事件
   */
  onInput?(event: ScriptInputEvent): void
}

/** 按钮元素脚本接口 */
interface YamiButtonElementScript extends YamiUIElementScript<ButtonElement> {
  /**
   * 元素被选中时触发
   * @param element 元素
   */
  onSelect?(element: ButtonElement): void
  /**
   * 元素被取消选中时触发
   * @param element 元素
   */
  onDeselect?(element: ButtonElement): void
}

/** 动画元素脚本接口 */
interface YamiAnimationElementScript extends YamiUIElementScript<AnimationElement> {
  /**
   * 动画播放结束时触发
   * @param element 元素
   */
  onEnded?(element: AnimationElement): void
}

/** 视频元素脚本接口 */
interface YamiVideoElementScript extends YamiUIElementScript<VideoElement> {
  /**
   * 视频播放结束时触发
   * @param element 元素
   */
  onEnded?(element: VideoElement): void
}