/** 粒子发射器脚本 */
export default class ParticleEmitterScript extends Flow implements Script<SceneParticleEmitter> {
  update(deltaTime: number): void {
    // console.log('update')
  }

  onCreate(emitter: SceneParticleEmitter): void {
    console.log('onCreate')
  }

  onStart(emitter: SceneParticleEmitter): void {
    console.log('onStart')
  }

  onDestroy(emitter: SceneParticleEmitter): void {
    console.log('onDestroy')
  }

  onScriptAdd(emitter: SceneParticleEmitter): void {
    console.log('onScriptAdd')
  }

  onScriptRemove(emitter: SceneParticleEmitter): void {
    console.log('onScriptRemove')
  }
}