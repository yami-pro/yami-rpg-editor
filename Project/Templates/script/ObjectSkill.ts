/** 技能脚本(异步事件是否执行取决于是否绑定了宿主角色) */
export default class SkillScript extends Flow implements Script<Skill> {
  onSkillCast(skill: Skill): void {
    console.log('onSkillCast')
  }

  onSkillAdd(skill: Skill): void {
    console.log('onSkillAdd')
  }

  onSkillRemove(skill: Skill): void {
    console.log('onSkillRemove')
  }

  onScriptAdd(skill: Skill): void {
    console.log('onScriptAdd')
  }

  onScriptRemove(skill: Skill): void {
    console.log('onScriptRemove')
  }
}