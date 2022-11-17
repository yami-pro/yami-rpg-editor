'use strict'

import { createElement } from './vhtml/index.js'

const LogView = ()=>(
  <>
    {/*日志窗口*/}
    <window-frame id="log">
      <title-bar>Log<close></close></title-bar>
      <content-frame>
        <common-list id="log-list"></common-list>
      </content-frame>
    </window-frame>

    {/*错误消息*/}
    <box id="error-message"></box>
  </>
)

export { LogView }
