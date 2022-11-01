'use strict'

// ******************************** 属性上下文类 ********************************

class AttributeContext {
  groupMap  //:object
  itemCache //:object
  itemLists //:object

  constructor(attribute) {
    const groupMap = {}

    // 加载数据
    const load = (groupKeys, items) => {
      for (const item of items) {
        const itemKey = item.id
        if (item.class === 'folder') {
          // 这里可能会创建用不到的属性分组
          groupMap[itemKey] = {
            groupName: item.name,
            itemMap: {},
            itemList: [],
          }
          groupKeys.push(itemKey)
          load(groupKeys, item.children)
          groupKeys.pop()
          continue
        }
        for (let i = 0; i < groupKeys.length; i++) {
          const group = groupMap[groupKeys[i]]
          group.itemMap[itemKey] = item
          group.itemList.push(item)
        }
      }
    }
    load([], attribute.keys)

    // 移除无效的分组设置
    const settings = attribute.settings
    for (const [key, groupId] of Object.entries(settings)) {
      if (groupId in groupMap) {
        groupMap[key] = groupMap[groupId]
      } else {
        if (groupId !== '') {
          settings[key] = ''
        }
        groupMap[key] = {
          groupName: '',
          itemMap: Object.empty,
          itemList: Array.empty,
        }
      }
    }
    this.groupMap = groupMap
    this.itemCache = {}
    this.itemLists = {}
  }

  // 获取群组
  getGroup(groupKey) {
    return this.groupMap[groupKey]
  }

  // 获取群组属性
  getGroupAttribute(groupKey, attrId) {
    return this.groupMap[groupKey]?.itemMap[attrId]
  }

  // 获取默认属性ID
  getDefAttributeId(groupKey) {
    return this.groupMap[groupKey]?.itemList[0]?.id ?? ''
  }

  // 获取属性选项列表
  getAttributeItems(groupKey, attrType = '') {
    const key = groupKey + attrType
    if (!this.itemLists[key]) {
      // 获取分组的全部同类型选项
      const items = []
      const group = this.groupMap[groupKey]
      if (group) {
        const attrTypes = [attrType]
        if (attrType === 'string') {
          attrTypes.push('enum')
        }
        const itemCache = this.itemCache
        for (const attr of group.itemList) {
          if (!attrType || attrTypes.includes(attr.type)) {
            let item = itemCache[attr.id]
            if (item === undefined) {
              item = itemCache[attr.id] = {
                name: attr.name,
                value: attr.id,
              }
            }
            items.push(item)
          }
        }
      }
      if (items.length === 0) {
        items.push({
          name: Local.get('common.none'),
          value: '',
        })
      }
      this.itemLists[key] = items
    }
    return this.itemLists[key]
  }
}
