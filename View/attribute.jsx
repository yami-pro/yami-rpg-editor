'use strict'

import './attribute.css'
import { createElement } from './vhtml/index.js'

const AttributeView = ()=>(
  <>
    {/*属性窗口*/}
    <window-frame id="attribute">
      <title-bar>Attribute<close></close></title-bar>
      <content-frame>
        <field-set id="attribute-list-fieldset" class="input pad">
          <legend>List</legend>
          <node-list id="attribute-list" padded></node-list>
        </field-set>
        <field-set id="attribute-properties-fieldset">
          <legend>Properties</legend>
          <flex-box id="attribute-properties-flex">
            <flex-item><text>Name</text><text-box id="attribute-name"></text-box></flex-item>
            <flex-item><text>Key</text><text-box id="attribute-key"></text-box></flex-item>
            <flex-item id="attribute-type-box"><text>Type</text>
              <radio-box id="attribute-type-boolean" name="attribute-type" class="standard" value="boolean"><text id="attribute-type-boolean-label">Boolean</text></radio-box>
              <radio-box id="attribute-type-number" name="attribute-type" class="standard" value="number"><text id="attribute-type-number-label">Number</text></radio-box>
              <radio-box id="attribute-type-string" name="attribute-type" class="standard" value="string"><text id="attribute-type-string-label">String</text></radio-box>
              <radio-box id="attribute-type-enum" name="attribute-type" class="standard" value="enum"><text id="attribute-type-enum-label">String(Enum)</text></radio-box>
              <radio-box id="attribute-type-object" name="attribute-type" class="standard" value="object"><text id="attribute-type-object-label">Object(For Element)</text></radio-box>
            </flex-item>
            <flex-item id="attribute-enum-box"><text>Options</text>
              <custom-box id="attribute-enum" type="enum-group"></custom-box>
            </flex-item>
            <flex-item><text>Note</text><text-area id="attribute-note"></text-area></flex-item>
          </flex-box>
        </field-set>
        <text-box id="attribute-searcher" name="search"></text-box>
        <button id="attribute-confirm" name="confirm">Confirm</button>
        <button id="attribute-cancel" name="cancel">Cancel</button>
        <button id="attribute-apply" name="apply">Apply</button>
      </content-frame>
    </window-frame>
  </>
)

export { AttributeView }
