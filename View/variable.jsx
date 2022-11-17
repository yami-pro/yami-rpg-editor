'use strict'

import { createElement } from './vhtml/index.js'

const VariableView = ()=>(
  <>
    {/*变量窗口*/}
    <window-frame id="variable" mode="center">
      <title-bar>Variable<close></close></title-bar>
      <content-frame>
        <field-set id="variable-list-fieldset" class="input pad">
          <legend>List</legend>
          <node-list id="variable-list" padded></node-list>
        </field-set>
        <field-set id="variable-properties-fieldset">
          <legend>Properties</legend>
          <flex-box id="variable-properties-flex">
            <flex-item><text>Name</text><text-box id="variable-name"></text-box></flex-item>
            <flex-item><text>Sort</text>
              <radio-box id="variable-sort-normal" name="variable-sort" class="standard" value="0"><text id="variable-sort-normal-label">Normal</text></radio-box>
              <radio-box id="variable-sort-shared" name="variable-sort" class="standard" value="1"><text id="variable-sort-shared-label">Shared</text></radio-box>
              <radio-box id="variable-sort-temporary" name="variable-sort" class="standard" value="2"><text id="variable-sort-temporary-label">Temporary</text></radio-box>
            </flex-item>
            <flex-item><text>Type</text>
              <radio-box id="variable-type-boolean" name="variable-type" class="standard" value="boolean"><text id="variable-type-boolean-label">Boolean</text></radio-box>
              <radio-box id="variable-type-number" name="variable-type" class="standard" value="number"><text id="variable-type-number-label">Number</text></radio-box>
              <radio-box id="variable-type-string" name="variable-type" class="standard" value="string"><text id="variable-type-string-label">String</text></radio-box>
              <radio-box id="variable-type-object" name="variable-type" class="standard" value="object"><text id="variable-type-object-label">Object</text></radio-box>
            </flex-item>
            <flex-item id="variable-value-box"><text>Value</text>
              <page-manager id="variable-value-manager">
                <page-frame value="boolean">
                  <radio-box name="variable-value-boolean" class="standard" value="false">False</radio-box>
                  <radio-box name="variable-value-boolean" class="standard" value="true">True</radio-box>
                </page-frame>
                <page-frame value="number">
                  <number-box id="variable-value-number" min="-1000000000" max="1000000000" decimals="10"></number-box>
                </page-frame>
                <page-frame value="string">
                  <text-area id="variable-value-string"></text-area>
                </page-frame>
              </page-manager>
            </flex-item>
            <flex-item><text>Note</text><text-area id="variable-note"></text-area></flex-item>
          </flex-box>
        </field-set>
        <text-box id="variable-searcher" name="search"></text-box>
        <button id="variable-confirm" name="confirm">Confirm</button>
        <button id="variable-cancel" name="cancel">Cancel</button>
        <button id="variable-apply" name="apply">Apply</button>
      </content-frame>
    </window-frame>
  </>
)

export { VariableView }
