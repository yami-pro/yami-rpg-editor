'use strict'

import {
  Local,
  IArray
} from '../yami'

// ******************************** 枚举上下文类 ********************************

class EnumerationContext {
  itemMap   //:object
  groupMap  //:object
  itemCache //:object
  itemLists //:object

  constructor(enumeration) {
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
    load([], enumeration.strings)

    // 移除无效的分组设置
    const settings = enumeration.settings
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
          itemList: IArray.empty,
        }
      }
    }
    this.itemMap = itemMap
    this.groupMap = groupMap
    this.itemCache = {}
    this.itemLists = {}
  }

  // 获取枚举群组
  getEnumGroup(groupKey) {
    return this.groupMap[groupKey]
  }

  // 获取枚举字符串对象
  getString(stringId) {
    return this.itemMap[stringId]
  }

  // 获取群组枚举字符串对象
  getGroupString(groupKey, stringId) {
    return this.groupMap[groupKey]?.itemMap[stringId]
  }

  // 获取默认枚举字符串ID
  getDefStringId(groupKey) {
    return this.groupMap[groupKey]?.itemList[0]?.id ?? ''
  }

  // 获取枚举字符串选项列表
  getStringItems(groupKey, allowNone = false) {
    let key = groupKey
    if (allowNone) {
      key += '-allowNone'
    }
    if (!this.itemLists[key]) {
      // 获取分组的全部选项
      const items = []
      const group = this.groupMap[groupKey]
      if (group) {
        const itemCache = this.itemCache
        for (const string of group.itemList) {
          let item = itemCache[string.id]
          if (item === undefined) {
            item = itemCache[string.id] = {
              name: string.name,
              value: string.id,
            }
          }
          items.push(item)
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

  // 获取合并的选项列表
  getMergedItems(headItems, groupKey, mergedKey = 'merged') {
    const key = `${groupKey}-${mergedKey}`
    if (!this.itemLists[key]) {
      // 获取分组的全部选项
      const items = [...headItems]
      const group = this.groupMap[groupKey]
      if (group) {
        const itemCache = this.itemCache
        for (const string of group.itemList) {
          let item = itemCache[string.id]
          if (item === undefined) {
            item = itemCache[string.id] = {
              name: string.name,
              value: string.id,
            }
          }
          items.push(item)
        }
      }
      this.itemLists[key] = items
    }
    return this.itemLists[key]
  }
}

// ******************************** 枚举上下文类导出 ********************************

export { EnumerationContext }
