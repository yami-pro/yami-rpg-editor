'use strict'

import * as Yami from '../yami.js'

// ******************************** 对话框元素 ********************************

class DialogBoxElement extends Yami.UI.Text {
  constructor(data) {
    super({...data,
      direction: 'horizontal-tb',
      horizontalAlign: 'left',
      verticalAlign: 'top',
      overflow: 'wrap-truncate',
    })
  }
}

Yami.UI.DialogBox = DialogBoxElement

// ******************************** 对话框元素导出 ********************************

export { DialogBoxElement }
