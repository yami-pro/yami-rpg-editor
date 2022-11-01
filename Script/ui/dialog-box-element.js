'use strict'

// ******************************** 对话框元素 ********************************

UI.DialogBox = class DialogBoxElement extends UI.Text {
  constructor(data) {
    super({...data,
      direction: 'horizontal-tb',
      horizontalAlign: 'left',
      verticalAlign: 'top',
      overflow: 'wrap-truncate',
    })
  }
}
