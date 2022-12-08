"use strict"

import { Inspector } from "../yami"

// ******************************** 文件 - 粒子页面 ********************************

{
const FileParticle = {
  // methods
  create: null,
}

// 创建粒子
FileParticle.create = function () {
  return {
    duration: 0,
    layers: [],
  }
}

Inspector.fileParticle = FileParticle
}
