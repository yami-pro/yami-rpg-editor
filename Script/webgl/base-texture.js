'use strict'

import * as Yami from '../yami.js'

// ******************************** 基础纹理类 ********************************

class BaseTexture {
  constructor() {
    this.glTexture = Yami.GL.createTexture()
    this.width = 0
    this.height = 0
  }

  // 恢复普通纹理
  restoreNormalTexture() {
    this.glTexture = Yami.GL.createTexture()
    const {format, width, height} = this
    Yami.GL.bindTexture(Yami.GL.TEXTURE_2D, this.glTexture)
    Yami.GL.texParameteri(Yami.GL.TEXTURE_2D, Yami.GL.TEXTURE_MAG_FILTER, this.magFilter)
    Yami.GL.texParameteri(Yami.GL.TEXTURE_2D, Yami.GL.TEXTURE_MIN_FILTER, this.minFilter)
    Yami.GL.texParameteri(Yami.GL.TEXTURE_2D, Yami.GL.TEXTURE_WRAP_S, Yami.GL.CLAMP_TO_EDGE)
    Yami.GL.texParameteri(Yami.GL.TEXTURE_2D, Yami.GL.TEXTURE_WRAP_T, Yami.GL.CLAMP_TO_EDGE)
    Yami.GL.texImage2D(Yami.GL.TEXTURE_2D, 0, format, width, height, 0, format, Yami.GL.UNSIGNED_BYTE, null)
  }

  // 恢复图像纹理
  restoreImageTexture() {
    this.glTexture = Yami.GL.createTexture()
    Yami.GL.bindTexture(Yami.GL.TEXTURE_2D, this.glTexture)
    Yami.GL.texParameteri(Yami.GL.TEXTURE_2D, Yami.GL.TEXTURE_MAG_FILTER, this.magFilter)
    Yami.GL.texParameteri(Yami.GL.TEXTURE_2D, Yami.GL.TEXTURE_MIN_FILTER, this.minFilter)
    Yami.GL.texParameteri(Yami.GL.TEXTURE_2D, Yami.GL.TEXTURE_WRAP_S, Yami.GL.CLAMP_TO_EDGE)
    Yami.GL.texParameteri(Yami.GL.TEXTURE_2D, Yami.GL.TEXTURE_WRAP_T, Yami.GL.CLAMP_TO_EDGE)
    Yami.GL.texImage2D(Yami.GL.TEXTURE_2D, 0, Yami.GL.RGBA, Yami.GL.RGBA, Yami.GL.UNSIGNED_BYTE, this.image)
  }

  /**
   * 基础纹理方法 - 设置加载回调
   * @param {string} type 回调事件类型
   * @param {function} callback 回调函数
   */
  on(type, callback) {
    // 如果已加载完成，立即执行回调
    let cache = this[BaseTexture.CALLBACK]
    if (cache === type) {
      callback(this)
      return
    }
    // 首次调用，创建加载回调缓存
    if (cache === undefined) {
      cache = this[BaseTexture.CALLBACK] =
      {load: [], error: []}
    }
    // 如果未加载完成，添加回调到缓存中
    if (typeof cache === 'object') {
      cache[type].push(callback)
    }
  }

  /**
   * 基础纹理方法 - 执行加载回调
   * @param {string} type 回调事件类型
   */
  reply(type) {
    const cache = this[BaseTexture.CALLBACK]
    if (typeof cache === 'object') {
      // 调用所有的纹理加载回调
      for (const callback of cache[type]) {
        callback(this)
      }
    }
    // 将缓存替换为类型名称
    this[BaseTexture.CALLBACK] = type
  }

  static CALLBACK = Symbol('LOAD_CALLBACK')
}

// ******************************** 基础纹理类导出 ********************************

export { BaseTexture }
