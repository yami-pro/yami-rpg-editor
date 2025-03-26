/** 装备脚本(异步事件是否执行取决于是否绑定了宿主角色) */
export default class EquipmentScript extends Flow implements Script<Equipment> {
  onCreate(equipment: Equipment): void {
    console.log('onCreate')
  }

  onEquipmentAdd(equipment: Equipment): void {
    console.log('onEquipmentAdd')
  }

  onEquipmentRemove(equipment: Equipment): void {
    console.log('onEquipmentRemove')
  }

  onScriptAdd(equipment: Equipment): void {
    console.log('onScriptAdd')
  }

  onScriptRemove(equipment: Equipment): void {
    console.log('onScriptRemove')
  }
}