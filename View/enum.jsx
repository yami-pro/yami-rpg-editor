'use strict'

import { createElement } from './vhtml/index.js'

const EnumView = ()=>(
  <>
    {/*枚举窗口*/}
    <window-frame id="enum" mode="center">
      <title-bar>Enumeration<close></close></title-bar>
      <content-frame>
        <field-set id="enum-list-fieldset" class="input pad">
          <legend>List</legend>
          <node-list id="enum-list" padded></node-list>
        </field-set>
        <field-set id="enum-properties-fieldset">
          <legend>Properties</legend>
          <flex-box id="enum-properties-flex">
            <flex-item><text>Name</text><text-box id="enum-name"></text-box></flex-item>
            <flex-item><text>Value</text><text-box id="enum-value"></text-box></flex-item>
            <flex-item id="enum-spacing-box"></flex-item>
            <flex-item><text>Note</text><text-area id="enum-note"></text-area></flex-item>
          </flex-box>
        </field-set>
        <text-box id="enum-searcher" name="search"></text-box>
        <button id="enum-confirm" name="confirm">Confirm</button>
        <button id="enum-cancel" name="cancel">Cancel</button>
        <button id="enum-apply" name="apply">Apply</button>
      </content-frame>
    </window-frame>
  </>
)

export { EnumView }
