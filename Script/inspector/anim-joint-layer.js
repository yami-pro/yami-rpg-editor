'use strict'

import * as Yami from '../yami.js'

// ******************************** 动画 - 关节层页面 ********************************

{
  const AnimJointLayer = {
    // methods
    create: null,
  }

  // 创建关节层
  AnimJointLayer.create = function () {
    return {
      class: 'joint',
      name: 'Joint',
      expanded: true,
      hidden: false,
      locked: false,
      frames: [Yami.Inspector.animJointFrame.create()],
      children: [],
    }
  }

  Yami.Inspector.animJointLayer = AnimJointLayer
}
