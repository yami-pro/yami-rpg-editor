/*
@plugin #plugin
@version 1.1
@author
@link
@desc #desc

@option actor {'trigger', 'local', 'global'}
@alias #actor {#actor-trigger, #actor-local, #actor-global}

@string localActorKey
@alias #localActorKey
@cond actor {'local'}

@variable globalActorKey
@alias #globalActorKey
@cond actor {'global'}

@option type {'item', 'equipment'}
@alias #type {#type-item, #type-equipment}

@file itemId
@alias #itemId
@filter item
@cond type {'item'}

@file equipmentId
@alias #equipmentId
@filter equipment
@cond type {'equipment'}

@number min
@alias #min
@clamp 1 1000000000
@decimals 0
@default 1
@cond type {'item'}

@number max
@alias #max
@clamp 1 1000000000
@decimals 0
@default 1
@cond type {'item'}

@variable-number dropRate
@alias #dropRate
@clamp 0 1
@default 1

@lang en
#plugin Drop Item
#desc A command related to the drop item plugin
#actor Target Actor
#actor-trigger Event Trigger Actor
#actor-local Local Actor Variable
#actor-global Global Actor Variable
#localActorKey Actor Key
#globalActorKey Actor
#type Type
#type-item Item
#type-equipment Equipment
#itemId Item
#equipmentId Equipment
#min Min Quantity
#max Max Quantity
#dropRate Drop Rate

@lang ru
#plugin Бросить предмет
#desc Команда, связанная с подключаемым модулем Бросить предмет
#actor Цель Актер
#actor-trigger Триггер Актер
#actor-local Лок. переменная Актер 
#actor-global Глоб. переменная Актер 
#localActorKey Лок. Актер 
#globalActorKey Глоб. Актер
#type Тип
#type-item Предмет
#type-equipment Снаряжение
#itemId Предмет
#equipmentId Id Снаряжение
#min Мин. кол-во
#max Мак. кол-во
#dropRate Скор. выпадения

@lang zh
#plugin 掉落物品
#desc 掉落物品插件的相关指令
#actor 目标角色
#actor-trigger 事件触发角色
#actor-local 本地角色变量
#actor-global 全局角色变量
#localActorKey 角色变量
#globalActorKey 角色变量
#type 类型
#type-item 物品
#type-equipment 装备
#itemId 物品
#equipmentId 装备
#min 最小数量
#max 最大数量
#dropRate 掉落几率
*/

export default class DropItem implements Script<Command> {
  // 接口属性
  actor!: 'trigger' | 'local' | 'global'
  localActorKey!: string
  globalActorKey!: string
  type!: 'item' | 'equipment'
  itemId!: string
  equipmentId!: string
  min!: number
  max!: number
  dropRate!: number

  call(): void {
    if (this.dropRate === 1 || Math.random() < this.dropRate) {
      let actor
      switch (this.actor) {
        case 'trigger':
          actor = CurrentEvent.triggerActor
          break
        case 'local':
          actor = CurrentEvent.attributes[this.localActorKey]
          break
        case 'global':
          actor = Variable.get(this.globalActorKey)
          break
      }
      if (actor instanceof Actor) {
        let item
        switch (this.type) {
          case 'item': {
            const data = Data.items[this.itemId]
            if (data) {
              item = new Item(data)
              item.quantity = Math.randomInt(this.min, this.max)
            }
            break
          }
          case 'equipment': {
            const data = Data.equipments[this.equipmentId]
            if (data) {
              item = new Equipment(data)
            }
            break
          }
        }
        if (item) {
          PluginManager.DropItem?.drop(actor, item)
        }
      }
    }
  }
}