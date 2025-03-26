/** 物品脚本(异步事件是否执行取决于是否绑定了宿主角色) */
export default class ItemScript extends Flow implements Script<Item> {
  onCreate(item: Item): void {
    console.log('onCreate')
  }

  onItemUse(item: Item): void {
    console.log('onItemUse')
  }

  onScriptAdd(item: Item): void {
    console.log('onScriptAdd')
  }

  onScriptRemove(item: Item): void {
    console.log('onScriptRemove')
  }
}