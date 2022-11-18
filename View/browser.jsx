'use strict'

import './browser.css'
import { createElement } from './vhtml/index.js'

const BrowserView = ()=>(
  <>
    {/*资源选择器*/}
    <window-frame id="selector" mode="center">
      <title-bar>Select File<maximize></maximize><close></close></title-bar>
      <content-frame>
        <file-browser id="selector-browser"></file-browser>
        <button id="selector-confirm" name="confirm">Confirm</button>
        <button id="selector-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>
  </>
)

export { BrowserView }
