"use strict"

import {
  Local,
  IArray,
  IObject
} from "../yami"

// ******************************** 属性上下文类 ********************************

class AttributeContext {
  itemMap   //:object
  groupMap  //:object
  itemCache //:object
  itemLists //:object

  constructor(attribute) {
    const itemMap = {}
    const groupMap = {}

    // 加载数据
    const load = (groupKeys, items) => {
      for (const item of items) {
        const itemKey = item.id
        itemMap[itemKey] = item
        if (item.class === 'folder') {
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
          itemMap: IObject.empty,
          itemList: IArray.empty(),
        }
      }
    }
    this.itemMap = itemMap
    this.groupMap = groupMap
    this.itemCache = {}
    this.itemLists = {}
  }

  // 获取群组
  getGroup(groupKey) {
    return this.groupMap[groupKey]
  }

  // 获取属性
  getAttribute(attrId) {
    return this.itemMap[attrId]
  }

  // 获取群组属性
  getGroupAttribute(groupKey, attrId) {
    return this.groupMap[groupKey]?.itemMap[attrId]
  }

  // 获取默认属性ID
  getDefAttributeId(groupKey, type) {
    const group = this.groupMap[groupKey]
    if (group) {
      for (const attr of group.itemList) {
        if (!type || attr.type === type) {
          return attr.id
        }
      }
    }
    return ''
  }

  // 获取属性选项列表
  getAttributeItems(groupKey, attrType = '', allowNone = false) {
    let key = groupKey + attrType
    if (allowNone) {
      key += '-allowNone'
    }
    if (!this.itemLists[key]) {
      // 获取分组的全部同类型选项
      const items = []
      const group = this.groupMap[groupKey]
      if (group) {
        const attrTypes = attrType.split('|')
        if (attrTypes.includes('string')) {
          attrTypes.append('enum')
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
      if (allowNone) {
        items.unshift({
          name: Local.get('common.none'),
          value: '',
        })
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

// ******************************** 属性上下文类导出 ********************************

export { AttributeContext }
