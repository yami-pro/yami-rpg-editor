/*
@plugin #plugin
@version 1.0
@author
@link

@actor actor
@alias #actor

@lang en
#plugin Light - Follow Actor
#actor Actor

@lang ru
#plugin Источник света - следует за персонажем
#actor Актер

@lang zh
#plugin 光源 - 跟随角色
#actor 角色
*/

export default class Light_FollowActor implements Script<SceneLight> {
  // 接口属性
  actor!: Actor

  // 脚本属性
  light: SceneLight

  constructor(light: SceneLight) {
    this.light = light
  }

  update(): void {
    const {actor, light} = this
    if (!actor.destroyed && actor.parent === Scene.actor) {
      light.x = actor.x
      light.y = actor.y
    }
  }
}