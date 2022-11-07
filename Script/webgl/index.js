'use strict'

// ******************************** WebGL ********************************

/**
 * @type {WebGLRenderingContext}
 */
let GL
namespace: {
  // 创建画布元素
  const canvas = document.createElement('canvas')
  canvas.width = 0
  canvas.height = 0
  canvas.style.position = 'absolute'
  canvas.style.width = '100%'
  canvas.style.height = '100%'

  // 主题画布背景颜色
  const background = {
    light: {r: 0xc8, g: 0xc8, b: 0xc8},
    dark: {r: 0x20, g: 0x20, b: 0x20},
  }

  // 侦听主题改变事件
  window.on('themechange', function (event) {
    const {r, g, b} = background[event.value]
    GL.BACKGROUND_RED = r / 255
    GL.BACKGROUND_GREEN = g / 255
    GL.BACKGROUND_BLUE = b / 255
  })

  // 侦听WebGL上下文丢失事件
  canvas.on('webglcontextlost', function (event) {
    event.preventDefault()
    setTimeout(() => GL.WEBGL_lose_context.restoreContext())
  })

  // 侦听WebGL上下文恢复事件
  canvas.on('webglcontextrestored', function (event) {
    GL.restore()
  })

  // WebGL上下文选项
  const options = {
    antialias: false,
    alpha: false,
    depth: true,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    desynchronized: true,
  }

  // 优先使用WebGL2(Win10 DirectX11)
  GL = canvas.getContext('webgl2', options)
  if (GL instanceof WebGL2RenderingContext) {} else {
    // 回退到WebGL1(Win7 DirectX9以及旧移动设备)
    GL = canvas.getContext('webgl', options)

    // 获取元素索引 32 位无符号整数扩展
    const element_index_uint = GL.getExtension('OES_element_index_uint')

    // 获取顶点数组对象扩展
    const vertex_array_object = GL.getExtension('OES_vertex_array_object')
    GL.createVertexArray = vertex_array_object.createVertexArrayOES.bind(vertex_array_object)
    GL.deleteVertexArray = vertex_array_object.deleteVertexArrayOES.bind(vertex_array_object)
    GL.isVertexArray = vertex_array_object.isVertexArrayOES.bind(vertex_array_object)
    GL.bindVertexArray = vertex_array_object.bindVertexArrayOES.bind(vertex_array_object)

    // 获取最小和最大混合模式扩展
    const blend_minmax = GL.getExtension('EXT_blend_minmax')
    GL.MIN = blend_minmax.MIN_EXT
    GL.MAX = blend_minmax.MAX_EXT

    // 重写更新缓冲数据方法
    const prototype = WebGLRenderingContext.prototype
    prototype._bufferData = prototype.bufferData
    prototype.bufferData = function (target, data, usage, offset, length) {
      if (length !== undefined) {
        length *= data.BYTES_PER_ELEMENT
        data = new Uint8Array(data.buffer, offset, length)
      }
      return this._bufferData(target, data, usage)
    }
  }

  // 获取失去上下文扩展
  GL.WEBGL_lose_context = GL.getExtension('WEBGL_lose_context')
}

// ******************************** 对象导出 ********************************

export { GL }

// ******************************** 类导出 ********************************

export { Matrix } from './matrix.js'
export { Vector } from './vector.js'
export { Texture } from './texture.js'
export { BaseTexture } from './base-texture.js'
export { ImageTexture } from './image-texture.js'
export { TextureManager } from './texture-manager.js'
export { BatchRenderer } from './batch-renderer.js'
