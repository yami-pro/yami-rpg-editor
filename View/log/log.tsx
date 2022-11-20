'use strict'

import './log.css'
import { createElement } from '../vhtml/index'

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
