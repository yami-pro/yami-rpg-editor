'use strict'

// ******************************** 纹理管理器类 ********************************

class TextureManager {
  gl      //:object
  map     //:object
  images  //:object
  pointer //:number
  count   //:number

  constructor() {
    this.gl = GL
    this.map = {}
    this.images = {}
    this.pointer = 0
    // count属性未使用，可在devTools中查看纹理数量
    this.count = 0
  }

  // 更新图像纹理
  updateImage(guid) {
    const texture = this.images[guid]
    if (texture === undefined) return
    File.get({
      guid: guid,
      type: 'image',
    }).then(image => {
      if (this.images[guid] === texture && image) {
        const {gl} = this
        texture.image = image
        texture.width = image.naturalWidth
        texture.height = image.naturalHeight
        gl.bindTexture(gl.TEXTURE_2D, texture.glTexture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      }
    })
  }

  // 添加纹理
  append(texture) {
    if (texture.index === undefined) {
      // 给纹理分配一个未使用的索引
      let i = this.pointer
      const map = this.map
      while (map[i] !== undefined) {i++}
      map[i] = texture
      texture.index = i
      this.pointer = i + 1
      this.count++
    }
  }

  // 删除纹理
  delete(texture) {
    const i = texture.index
    const {gl, map} = this
    gl.deleteTexture(texture.glTexture)
    // 通过ID删除图像映射表中的纹理
    if (texture.refCount === 0) {
      delete this.images[texture.guid]
    }
    // 通过索引删除映射表中的纹理
    if (map[i] === texture) {
      delete map[i]
      this.count--
      if (this.pointer > i) {
        this.pointer = i
      }
    }
  }

  // 清除所有纹理
  clear() {
    const {gl, map, images} = this
    for (const texture of Object.values(map)) {
      if (texture.protected === undefined) {
        delete map[texture.index]
        gl.deleteTexture(texture.glTexture)
        this.count--
        if (this.pointer > texture.index) {
          this.pointer = texture.index
        }
      }
    }
    for (const texture of Object.values(images)) {
      if (texture.protected === undefined) {
        delete images[texture.guid]
      }
    }
  }

  // 替换纹理
  replace(oldTex, newTex) {
    newTex.index = oldTex.index
    if (this.map[oldTex.index]) {
      this.map[oldTex.index] = newTex
    }
    if (oldTex instanceof ImageTexture &&
      oldTex.guid === newTex.guid) {
      if (this.images[oldTex.guid] === oldTex) {
        this.images[oldTex.guid] = newTex
      }
    }
  }

  // 恢复纹理
  restore() {
    for (const texture of Object.values(this.map)) {
      if (texture.onRestore) {
        texture.onRestore(texture)
        continue
      }
      if (texture.image !== undefined) {
        texture.restoreImageTexture()
      } else {
        texture.restoreNormalTexture()
      }
    }
  }
}

export { TextureManager }
