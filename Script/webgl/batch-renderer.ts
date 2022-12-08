"use strict"

// ******************************** 批量渲染器 ********************************

class BatchRenderer {
  response      //:array
  setAttrSize   //:function
  getEndIndex   //:function
  setBlendMode  //:function
  bindProgram   //:function
  unbindProgram //:function
  push          //:function
  draw          //:function

  constructor(gl) {
    // 初始化上下文
    const vertices = gl.arrays[0].float32
    const texMap = gl.textureManager.map
    const texUnits = gl.maxTexUnits - 1
    const queue = new Uint32Array(512 * 512)
    const step = texUnits + 3
    const samplers = new Int8Array(10000).fill(-1)
    const response = new Uint32Array(2)
    let attrSize = 0
    let queueIndex = 0
    let samplerLength = 0
    let startIndex = 0
    let endIndex = 0
    let blendMode = 'normal'
    let program = null

    // 设置属性大小
    const setAttrSize = size => {
      attrSize = size
    }

    // 获取结束索引
    const getEndIndex = () => {
      return endIndex
    }

    // 设置混合模式
    const setBlendMode = blend => {
      if (blendMode !== blend) {
        draw()
        blendMode = blend
      }
    }

    // 绑定GL程序(中途切换程序可恢复)
    const bindProgram = () => {
      program = gl.program
    }

    // 解除绑定GL程序
    const unbindProgram = () => {
      program = null
    }

    // 推送绘制数据
    const push = texIndex => {
      let samplerIndex = samplers[texIndex]
      if (samplerIndex === -1) {
        samplerIndex = samplerLength
        if (samplerIndex === texUnits) {
          for (let i = 0; i < samplerLength; i++) {
            samplers[queue[queueIndex + i]] = -1
          }
          const offset = queueIndex + texUnits
          queue[offset    ] = samplerLength
          queue[offset + 1] = startIndex
          queue[offset + 2] = endIndex
          startIndex = endIndex
          queueIndex += step
          samplerLength = 0
          samplerIndex = 0
        }
        queue[queueIndex + samplerIndex] = texIndex
        samplers[texIndex] = samplerIndex
        samplerLength += 1
      }
      response[0] = endIndex
      response[1] = samplerIndex
      endIndex += 4
    }

    // 绘制图像
    const draw = () => {
      if (endIndex !== 0) {
        if (samplerLength !== 0) {
          for (let i = 0; i < samplerLength; i++) {
            samplers[queue[queueIndex + i]] = -1
          }
          const offset = queueIndex + texUnits
          queue[offset    ] = samplerLength
          queue[offset + 1] = startIndex
          queue[offset + 2] = endIndex
          queueIndex += step
          samplerLength = 0
        }
        if (program !== null && program !== gl.program) {
          program.use()
          gl.bindVertexArray(program.vao)
        }
        const vLength = endIndex * attrSize
        if (vLength > 0) {
          gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vLength)
        }
        gl.blend = blendMode
        gl.updateBlending()
        for (let qi = 0; qi < queueIndex; qi += step) {
          const offset = qi + step
          const length = queue[offset - 3]
          const start = queue[offset - 2] * 1.5
          const end = queue[offset - 1] * 1.5
          for (let si = length - 1; si >= 0; si--) {
            gl.activeTexture(gl.TEXTURE0 + si)
            gl.bindTexture(gl.TEXTURE_2D, texMap[queue[qi + si]].glTexture)
          }
          gl.updateSamplerNum(length)
          gl.drawElements(gl.TRIANGLES, end - start, gl.UNSIGNED_INT, start * 4)
        }
        queueIndex = 0
        startIndex = 0
        endIndex = 0
      }
    }

    // 设置属性
    this.response = response
    this.setAttrSize = setAttrSize
    this.getEndIndex = getEndIndex
    this.setBlendMode = setBlendMode
    this.bindProgram = bindProgram
    this.unbindProgram = unbindProgram
    this.push = push
    this.draw = draw
  }
}

// ******************************** 批量渲染器导出 ********************************

export { BatchRenderer }
