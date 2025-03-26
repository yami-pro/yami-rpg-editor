/** ******************************** 独立变量管理器 ******************************** */

let SelfVariable = new class SelfVariableManager {
  /** 独立变量映射表 */
  public map: AttributeMap = {}

  /** 重置变量值 */
  public reset(): void {
    this.map = {}
  }

  /**
   * 获取变量值
   * @param key 独立变量ID
   * @returns 独立变量值
   */
  public get(key: string): AttributeValue | undefined {
    return SelfVariable.map[key]
  }

  /**
   * 设置变量值
   * @param key 变量ID
   * @param value 变量值
   */
  public set(key: string, value: AttributeValue): void {
    switch (typeof SelfVariable.map[key]) {
      case typeof value:
      case 'undefined':
        SelfVariable.map[key] = value
        break
    }
  }

  /**
   * 保存独立变量数据
   * @returns 独立变量存档数据
   */
  public saveData(): AttributeMap {
    return this.map
  }

  /**
   * 加载独立变量数据(无法删除旧存档中的无效数据)
   * @param variables 独立变量存档数据
   */
  public loadData(variables: AttributeMap): void {
    this.map = variables
  }
}

/** ******************************** 全局变量管理器 ******************************** */

let Variable = new class GlobalVariableManager {
  /** 全局变量群组(0:正常 1:共享 2:临时) */
  public groups: VariableGroupList = [[], [], []]
  // 全局变量映射表
  public map: AttributeMap = {}

  /** 初始化全局变量 */
  public initialize(): void {
    // 解包变量数据
    this.unpack(Data.variables!)
    delete Data.variables

    // 重置变量数据
    this.reset([0, 1, 2])

    // 加载共享变量
    this.loadData(1, Data.globalData.variables)
  }

  /**
   * 解包变量数据
   * @param items 变量数据列表
   */
  private unpack(items: VariablesFile): void {
    const groups = Variable.groups
    for (const item of items) {
      if ('children' in item) {
        // 解包文件夹中的变量
        this.unpack(item.children)
      } else {
        // 按分类存放变量对象
        groups[item.sort].push(item)
      }
    }
  }

  /**
   * 重置指定群组的变量值
   * @param groupIndices 变量群组索引数组
   */
  public reset(groupIndices: Array<0 | 1 | 2> = [0, 2]): void {
    for (const i of groupIndices) {
      for (const item of Variable.groups[i]) {
        // 以ID为键，写入变量值
        Variable.map[item.id] = item.value ?? undefined
      }
    }
  }

  /**
   * 获取变量值
   * @param key 变量ID
   * @returns 变量值
   */
  public get(key: string): AttributeValue | undefined {
    return Variable.map[key]
  }

  /**
   * 设置变量值
   * @param key 变量ID
   * @param value 变量值
   */
  public set(key: string, value: AttributeValue): void {
    switch (typeof value) {
      case typeof Variable.map[key]:
        Variable.map[key] = value
        break
      case 'object':
        if (key in Variable.map && typeof Variable.map[key] === 'undefined') {
          Variable.map[key] = value
        }
        break
      case 'undefined':
        if (typeof Variable.map[key] === 'object') {
          Variable.map[key] = value
        }
        break
    }
  }

  /**
   * 保存全局变量数据
   * @param groupIndex 变量群组索引(0:常规, 1:共享)
   * @returns 变量存档数据
   */
  public saveData(groupIndex: 0 | 1): AttributeMap {
    const data: AttributeMap = {}
    const group = Variable.groups[groupIndex]
    const length = group.length
    for (let i = 0; i < length; i++) {
      const key = group[i].id
      data[key] = Variable.map[key]
    }
    return data
  }

  /**
   * 加载全局变量数据
   * @param groupIndex 变量群组索引(0:常规, 1:共享)
   * @param variables 保存的全局变量数据
   */
  public loadData(groupIndex: number, variables: AttributeMap): void {
    const group = Variable.groups[groupIndex]
    const length = group.length
    for (let i = 0; i < length; i++) {
      const item = group[i]
      const key = item.id
      // 从存档数据中加载变量值
      // 如果类型有效，则写入值
      const value = variables[key]
      const type = typeof item.value
      if (type === typeof value) {
        Variable.map[key] = value
      }
    }
  }
}

/** ******************************** 属性管理器 ******************************** */

let Attribute = new class AttributeManager {
  // {属性ID:属性对象}映射表
  public idMap: HashMap<Attribute> = {}
  // {群组ID:属性键:属性名称}映射表
  public groupMap: HashMap<AttributeGroup> = {}

  /** 初始化属性管理器 */
  public initialize(): void {
    this.unpack(Data.attribute!.keys, [])
    delete Data.attribute
  }

  /**
   * 获取属性
   * @param attrId 属性ID
   * @returns 属性对象
   */
  public get(attrId: string): Attribute | undefined {
    return this.idMap[attrId]
  }

  /**
   * 获取属性名称(未使用)
   * @param attrId 属性ID
   * @returns 属性名称
   */
  public getName(attrId: string): string {
    return this.idMap[attrId]?.name ?? ''
  }

  /**
   * 获取属性键
   * @param attrId 属性ID
   * @returns 属性键
   */
  public getKey(attrId: string): string {
    return this.idMap[attrId]?.key ?? ''
  }

  /**
   * 获取属性群组
   * @param groupId 群组ID
   * @returns 属性群组
   */
  public getGroup(groupId: string): AttributeGroup | undefined {
    return this.groupMap[groupId]
  }

  /**
   * 解包属性数据
   * @param items 属性数据列表
   * @param groupKeys 群组ID的栈列表
   */
  private unpack(items: AttributeDirectory, groupKeys: Array<string>): void {
    for (const item of items) {
      const id = item.id
      if ('children' in item) {
        // 解包文件夹中的属性
        Attribute.groupMap[id] = new ItemGroup()
        groupKeys.push(id)
        this.unpack(item.children, groupKeys)
        groupKeys.pop()
      } else {
        // 构建属性对象映射关系
        this.idMap[id] = item
        if (item.key === '') {
          item.key = id
        }
        // 构建{群组ID:属性键:属性名称}映射表
        for (const key of groupKeys) {
          Attribute.groupMap[key]!.set(item.key, item)
        }
      }
    }
  }

  /**
  * 加载属性词条到映射表中
  * @param map 属性映射表
  * @param entries 属性键值对列表
  */
  public loadEntries(map: AttributeMap, entries: Array<InitialAttribute>): void {
    for (const entry of entries) {
      const attr = Attribute.get(entry.key)
      if (attr !== undefined) {
        if (attr.type === 'enum') {
          const enumstr = Enum.get(entry.value as string)
          if (enumstr !== undefined) {
            map[attr.key] = enumstr.value
          }
        } else {
          map[attr.key] = entry.value
        }
      }
    }
  }

  /**
   * 获取属性
   * @param map 属性映射表
   * @param key 属性键
   * @returns 属性值
   */
  public GET = (map: AttributeMap, key: string): AttributeValue | undefined => {
    return map[key]
  }

  /**
   * 设置属性
   * @param map 属性映射表
   * @param key 属性键
   * @param value 属性值
   */
  public SET = (map: AttributeMap, key: string, value: AttributeValue): void => {
    map[key] = value
  }

  /**
   * 删除属性
   * @param map 属性映射表
   * @param key 属性键
   */
  public DELETE = (map: AttributeMap, key: string): void => {
    delete map[key]
  }

  /**
   * 类型安全 - 设置
   * @param map 属性映射表
   * @param key 属性键
   * @param value 属性值
   */
  public SAFE_SET = (map: AttributeMap, key: string, value: AttributeValue): void => {
    if (Variable.map === map) {
      Variable.set(key, value)
    } else switch (typeof value) {
      case typeof map[key]:
        map[key] = value
        break
      case 'boolean':
      case 'number':
      case 'string':
      case 'object':
        if (typeof map[key] === 'undefined') {
          map[key] = value
        }
        break
      case 'undefined':
        if (typeof map[key] === 'object') {
          map[key] = value
        }
        break
    }
  }

  /**
   * 布尔值 - 获取
   * @param map 属性映射表
   * @param key 属性键
   * @returns 布尔值
   */
  public BOOLEAN_GET = (map: AttributeMap, key: string): boolean | undefined => {
    const value = map[key]
    return typeof value === 'boolean' ? value : undefined
  }

  /**
   * 布尔值 - 设置
   * @param map 属性映射表
   * @param key 属性键
   * @param value 布尔值
   */
  public BOOLEAN_SET = (map: AttributeMap, key: string, value: boolean): void => {
    switch (typeof map[key]) {
      case 'boolean':
      case 'undefined':
        map[key] = value
        return
    }
  }

  /**
   * 布尔值 - 非
   * @param map 属性映射表
   * @param key 属性键
   * @param value 布尔值
   */
  public BOOLEAN_NOT = (map: AttributeMap, key: string, value: boolean): void => {
    if (typeof map[key] === 'boolean') {
      map[key] = !value
    }
  }

  /**
   * 布尔值 - 与
   * @param map 属性映射表
   * @param key 属性键
   * @param value 布尔值
   */
  public BOOLEAN_AND = (map: AttributeMap, key: string, value: boolean): void => {
    if (typeof map[key] === 'boolean') {
      // chrome 85 support: &&=, ||=
      map[key] &&= value
    }
  }

  /**
   * 布尔值 - 或
   * @param map 属性映射表
   * @param key 属性键
   * @param value 布尔值
   */
  public BOOLEAN_OR = (map: AttributeMap, key: string, value: boolean): void => {
    if (typeof map[key] === 'boolean') {
      map[key] ||= value
    }
  }

  /**
   * 布尔值 - 异或
   * @param map 属性映射表
   * @param key 属性键
   * @param value 布尔值
   */
  public BOOLEAN_XOR = (map: AttributeMap, key: string, value: boolean): void => {
    if (typeof map[key] === 'boolean') {
      map[key] = map[key] !== value
    }
  }

  /**
   * 数值 - 获取
   * @param map 属性映射表
   * @param key 属性键
   * @returns 数值
   */
  public NUMBER_GET = (map: AttributeMap, key: string): number | undefined => {
    const value = map[key]
    return typeof value === 'number' ? value : undefined
  }

  /**
   * 数值 - 设置
   * @param map 属性映射表
   * @param key 属性键
   * @param value 数值
   */
  public NUMBER_SET = (map: AttributeMap, key: string, value: number): void => {
    switch (typeof map[key]) {
      case 'number':
      case 'undefined':
        map[key] = value
        return
    }
  }

  /**
   * 数值 - 加法
   * @param map 属性映射表
   * @param key 属性键
   * @param value 数值
   */
  public NUMBER_ADD = (map: AttributeMap, key: string, value: number): void => {
    const number = map[key]
    if (typeof number === 'number') {
      map[key] = number + value
    }
  }

  /**
   * 数值 - 减法
   * @param map 属性映射表
   * @param key 属性键
   * @param value 数值
   */
  public NUMBER_SUB = (map: AttributeMap, key: string, value: number): void => {
    const number = map[key]
    if (typeof number === 'number') {
      map[key] = number - value
    }
  }

  /**
   * 数值 - 乘法
   * @param map 属性映射表
   * @param key 属性键
   * @param value 数值
   */
  public NUMBER_MUL = (map: AttributeMap, key: string, value: number): void => {
    const number = map[key]
    if (typeof number === 'number') {
      map[key] = number * value
    }
  }

  /**
   * 数值 - 除法
   * @param map 属性映射表
   * @param key 属性键
   * @param value 数值
   */
  public NUMBER_DIV = (map: AttributeMap, key: string, value: number): void => {
    const number = map[key]
    if (typeof number === 'number' && value !== 0) {
      map[key] = number / value
    }
  }

  /**
   * 数值 - 取余
   * @param map 属性映射表
   * @param key 属性键
   * @param value 数值
   */
  public NUMBER_MOD = (map: AttributeMap, key: string, value: number): void => {
    const number = map[key]
    if (typeof number === 'number' && value !== 0) {
      map[key] = number % value
    }
  }

  /**
   * 字符串 - 获取
   * @param map 属性映射表
   * @param key 属性键
   * @returns 字符串
   */
  public STRING_GET = (map: AttributeMap, key: string): string | undefined => {
    const value = map[key]
    return typeof value === 'string' ? value : undefined
  }

  /**
   * 字符串 - 设置
   * @param map 属性映射表
   * @param key 属性键
   * @param value 字符串
   */
  public STRING_SET = (map: AttributeMap, key: string, value: string): void => {
    switch (typeof map[key]) {
      case 'string':
      case 'undefined':
        map[key] = value
        return
    }
  }

  /**
   * 字符串 - 加法
   * @param map 属性映射表
   * @param key 属性键
   * @param value 字符串
   */
  public STRING_ADD = (map: AttributeMap, key: string, value: string): void => {
    if (typeof map[key] === 'string') {
      map[key] += value
    }
  }

  /**
   * 角色 - 获取
   * @param map 属性映射表
   * @param key 属性键
   * @returns 角色实例
   */
  public ACTOR_GET = (map: AttributeMap, key: string): Actor | undefined => {
    const value = map[key]
    return value instanceof Actor ? value : undefined
  }

  /**
   * 技能 - 获取
   * @param map 属性映射表
   * @param key 属性键
   * @returns 技能实例
   */
  public SKILL_GET = (map: AttributeMap, key: string): Skill | undefined => {
    const value = map[key]
    return value instanceof Skill ? value : undefined
  }

  /**
   * 状态 - 获取
   * @param map 属性映射表
   * @param key 属性键
   * @returns 状态实例
   */
  public STATE_GET = (map: AttributeMap, key: string): State | undefined => {
    const value = map[key]
    return value instanceof State ? value : undefined
  }

  /**
   * 装备 - 获取
   * @param map 属性映射表
   * @param key 属性键
   * @returns 装备实例
   */
  public EQUIPMENT_GET = (map: AttributeMap, key: string): Equipment | undefined => {
    const value = map[key]
    return value instanceof Equipment ? value : undefined
  }

  /**
   * 物品 - 获取
   * @param map 属性映射表
   * @param key 属性键
   * @returns 物品实例
   */
  public ITEM_GET = (map: AttributeMap, key: string): Item | undefined => {
    const value = map[key]
    return value instanceof Item ? value : undefined
  }

  /**
   * 触发器 - 获取
   * @param map 属性映射表
   * @param key 属性键
   * @returns 触发器实例
   */
  public TRIGGER_GET = (map: AttributeMap, key: string): Trigger | undefined => {
    const value = map[key]
    return value instanceof Trigger ? value : undefined
  }

  /**
   * 光源 - 获取
   * @param map 属性映射表
   * @param key 属性键
   * @returns 光源实例
   */
  public LIGHT_GET = (map: AttributeMap, key: string): SceneLight | undefined => {
    const value = map[key]
    return value instanceof SceneLight ? value : undefined
  }

  /**
   * 元素 - 获取
   * @param map 属性映射表
   * @param key 属性键
   * @returns 元素实例
   */
  public ELEMENT_GET = (map: AttributeMap, key: string): UIElement | undefined => {
    const value = map[key]
    return value instanceof UIElement ? value : undefined
  }

  /**
   * 对象 - 获取
   * @param map 属性映射表
   * @param key 属性键
   * @returns 对象
   */
  public OBJECT_GET = (map: AttributeMap, key: string): object | undefined => {
    const value = map[key]
    return typeof value === 'object' ? value : undefined
  }

  /**
   * 对象 - 设置
   * @param map 属性映射表
   * @param key 属性键
   * @param value 对象
   */
  public OBJECT_SET = (map: AttributeMap, key: string, value: object): void => {
    switch (typeof map[key]) {
      case 'object':
      case 'undefined':
        map[key] = value ?? undefined
        return
    }
  }

  /**
   * 列表 - 获取
   * @param map 属性映射表
   * @param key 属性键
   * @returns 列表
   */
  public LIST_GET = (map: AttributeMap, key: string): Array<any> | undefined => {
    const value = map[key]
    return Array.isArray(value) ? value : undefined
  }
}

/** ******************************** 枚举管理器 ******************************** */

let Enum = new class EnumerationManager {
  // {枚举ID:枚举对象}映射表
  public idMap: HashMap<Enumeration> = {}
  // {群组ID:枚举值:枚举名称}映射表
  public groupMap: HashMap<EnumerationGroup> = {}

  /** 初始化枚举管理器 */
  public initialize(): void {
    this.unpack(Data.enumeration!.strings, [])
    delete Data.enumeration
  }

  /**
   * 获取枚举对象
   * @param enumId 枚举ID
   * @returns 枚举对象
   */
  public get(enumId: string): Enumeration | undefined {
    return this.idMap[enumId]
  }

  /**
   * 获取枚举名称(未使用)
   * @param enumId 枚举ID
   * @returns 枚举名称
   */
  public getName(enumId: string): string {
    return this.idMap[enumId]?.name ?? ''
  }

  /**
   * 获取枚举值
   * @param enumId 枚举ID
   * @returns 枚举值(默认: '')
   */
  public getValue(enumId: string): string {
    return this.idMap[enumId]?.value ?? ''
  }

  /**
   * 获取枚举群组
   * @param groupId 群组ID
   * @returns 枚举群组
   */
  public getGroup(groupId: string): EnumerationGroup | undefined {
    return this.groupMap[groupId]
  }

  /**
   * 解包枚举和群组的数据
   * @param items 枚举数据列表
   * @param groupKeys 群组ID的栈列表
   */
  private unpack(items: EnumerationDirectory, groupKeys: Array<string>): void {
    for (const item of items) {
      const id = item.id
      if ('children' in item) {
        // 解包文件夹中的枚举对象
        Enum.groupMap[id] = new ItemGroup()
        groupKeys.push(id)
        this.unpack(item.children, groupKeys)
        groupKeys.pop()
      } else {
        // 构建枚举对象映射关系
        this.idMap[id] = item
        if (item.value === '') {
          item.value = id
        }
        // 构建{群组ID:枚举值:枚举名称}映射表
        for (const key of groupKeys) {
          Enum.groupMap[key]!.set(item.id, item)
        }
      }
    }
  }
}

/** ******************************** 数据项群组 ******************************** */

class ItemGroup<T> {
  /** 数据项列表 */
  public list: Array<T> = []
  /** {键:数据项}映射表 */
  public map: HashMap<T> = {}

  /**
   * 获取数据项
   * @param key 键
   * @returns 数据项
   */
  public get(key: string): T | undefined {
    return this.map[key]
  }

  /**
   * 设置数据项
   * @param key 键
   * @param item 数据项
   */
  public set(key: string, item: T): void {
    if (!(key in this.map)) {
      this.map[key] = item
      this.list.push(item)
    }
  }

  /**
   * 删除数据项
   * @param key 键
   */
  public delete(key: string): void {
    const item = this.map[key]
    if (item) {
      this.list.remove(item)
      delete this.map[key]
    }
  }
}