'use strict'

import './command.css'
import { createElement } from '../vhtml/index'

const CommandView = ()=>(
  <>
    {/*条件窗口*/}
    <window-frame id="condition">
      <title-bar>Condition<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Condition Type</text><select-box id="condition-type"></select-box>
          <text>Variable</text><custom-box id="condition-key" type="global-variable" filter="all"></custom-box>
          <text>Operation</text><select-box id="condition-boolean-operation"></select-box>
          <text>Boolean</text><select-box id="condition-boolean-value"></select-box>
          <text>Operation</text><select-box id="condition-number-operation"></select-box>
          <text>Number</text><number-box id="condition-number-value" min="-1000000000" max="1000000000" decimals="10"></number-box>
          <text>Operation</text><select-box id="condition-string-operation"></select-box>
          <text>String</text><text-area id="condition-string-value"></text-area>
        </grid-box>
        <button id="condition-confirm" name="confirm">Confirm</button>
        <button id="condition-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*动画精灵图窗口*/}
    <window-frame id="fileAnimation-sprite">
      <title-bar>Sprite<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Name</text><text-box id="fileAnimation-sprite-name"></text-box>
          <text>Image</text><custom-box id="fileAnimation-sprite-image" type="file" filter="image"></custom-box>
          <text>Horiz Frames</text><number-box id="fileAnimation-sprite-hframes" min="1" max="256"></number-box>
          <text>Vert Frames</text><number-box id="fileAnimation-sprite-vframes" min="1" max="256"></number-box>
        </grid-box>
        <button id="fileAnimation-sprite-confirm" name="confirm">Confirm</button>
        <button id="fileAnimation-sprite-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*动画精灵图窗口*/}
    <window-frame id="fileActor-sprite">
      <title-bar>Sprite<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Name</text><select-box id="fileActor-sprite-id"></select-box>
          <text>Image</text><custom-box id="fileActor-sprite-image" type="file" filter="image"></custom-box>
        </grid-box>
        <button id="fileActor-sprite-confirm" name="confirm">Confirm</button>
        <button id="fileActor-sprite-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*角色技能窗口*/}
    <window-frame id="fileActor-skill">
      <title-bar>Skill<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Skill</text><custom-box id="fileActor-skill-id" type="file" filter="skill"></custom-box>
          <text>Shortcut Key</text><select-box id="fileActor-skill-key"></select-box>
        </grid-box>
        <button id="fileActor-skill-confirm" name="confirm">Confirm</button>
        <button id="fileActor-skill-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*角色装备窗口*/}
    <window-frame id="fileActor-equipment">
      <title-bar>Equipment<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Equipment</text><custom-box id="fileActor-equipment-id" type="file" filter="equipment"></custom-box>
          <text>Slot</text><select-box id="fileActor-equipment-slot"></select-box>
        </grid-box>
        <button id="fileActor-equipment-confirm" name="confirm">Confirm</button>
        <button id="fileActor-equipment-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*自定义指令窗口*/}
    <window-frame id="command">
      <title-bar>Custom Command<close></close></title-bar>
      <content-frame>
        <field-set id="command-list-fieldset" class="input pad">
          <legend>List</legend>
          <node-list id="command-list" padded></node-list>
        </field-set>
        <box id="command-inspector">
          <detail-box id="command-overview-detail" open>
            <detail-summary>Overview</detail-summary>
            <box id="command-overview"></box>
          </detail-box>
          <detail-box id="command-settings-detail" open>
            <detail-summary>Settings</detail-summary>
            <detail-grid id="command-settings-grid">
              <text>Alias</text><text-box id="command-alias"></text-box>
              <text>Keywords</text><text-box id="command-keywords"></text-box>
            </detail-grid>
          </detail-box>
        </box>
        <button id="command-confirm" name="confirm">Confirm</button>
        <button id="command-cancel" name="cancel">Cancel</button>
        <button id="command-apply" name="apply">Apply</button>
      </content-frame>
    </window-frame>


    {/*事件窗口*/}
    <window-frame id="event" class="opaque">
      <title-bar id="event-title">Event<maximize></maximize><close></close></title-bar>
      <content-frame>
        <field-set id="event-commands-fieldset" class="input pad">
          <box id="event-commands-gutter-background"></box>
          <command-list id="event-commands"></command-list>
          <box id="event-commands-gutter-outer">
            <box id="event-commands-gutter-inner"></box>
          </box>
        </field-set>
        <select-box id="event-type"></select-box>
        <button id="event-confirm" name="confirm">Confirm</button>
        <button id="event-cancel" name="cancel">Cancel</button>
        <button id="event-apply" name="apply">Apply</button>
      </content-frame>
    </window-frame>


    {/*事件指令组件*/}
    <window-frame id="command-widget">
      <text-box id="command-searcher"></text-box>
    </window-frame>


    {/*指令建议列表*/}
    <node-list id="command-suggestions" class="hidden"></node-list>


    {/*变量访问器窗口*/}
    <window-frame id="variableGetter">
      <title-bar>Variable<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="variableGetter-type"></select-box>
          <text>Actor</text><custom-box id="variableGetter-actor" type="actor"></custom-box>
          <text>Skill</text><custom-box id="variableGetter-skill" type="skill"></custom-box>
          <text>State</text><custom-box id="variableGetter-state" type="state"></custom-box>
          <text>Equipment</text><custom-box id="variableGetter-equipment" type="equipment"></custom-box>
          <text>Item</text><custom-box id="variableGetter-item" type="item"></custom-box>
          <text>Element</text><custom-box id="variableGetter-element" type="element"></custom-box>
          <text>Key</text><text-box id="variableGetter-common-key"></text-box>
          <text>Key</text><select-box id="variableGetter-preset-key"></select-box>
          <text>Key</text><custom-box id="variableGetter-global-key" type="global-variable"></custom-box>
        </grid-box>
        <button id="variableGetter-confirm" name="confirm">Confirm</button>
        <button id="variableGetter-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*对象变量访问器窗口*/}
    <window-frame id='objectGetter'>
      <title-bar>Variable<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id='objectGetter-type'></select-box>
          <text>Key</text><text-box id='objectGetter-common-key'></text-box>
          <text>Key</text><custom-box id='objectGetter-global-key' type='global-variable' filter='object'></custom-box>
        </grid-box>
        <button id='objectGetter-confirm' name='confirm'>Confirm</button>
        <button id='objectGetter-cancel' name='cancel'>Cancel</button>
      </content-frame>
    </window-frame>


    {/*角色访问器窗口*/}
    <window-frame id="actorGetter">
      <title-bar>Actor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="actorGetter-type"></select-box>
          <text>Actor</text><select-box id="actorGetter-memberId"></select-box>
          <text>Actor</text><custom-box id="actorGetter-actorId" type="file" filter="actor"></custom-box>
          <text>Data ID</text><custom-box id="actorGetter-presetId" type="preset-object" filter="actor"></custom-box>
          <text>Variable</text><custom-box id="actorGetter-variable" type="variable" filter="object"></custom-box>
        </grid-box>
        <button id="actorGetter-confirm" name="confirm">Confirm</button>
        <button id="actorGetter-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*技能访问器窗口*/}
    <window-frame id="skillGetter">
      <title-bar>Actor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="skillGetter-type"></select-box>
          <text>Actor</text><custom-box id="skillGetter-actor" type="actor"></custom-box>
          <text>Shortcut Key</text><select-box id="skillGetter-key"></select-box>
          <text>Skill</text><custom-box id="skillGetter-skillId" type="file" filter="skill"></custom-box>
          <text>Variable</text><custom-box id="skillGetter-variable" type="variable" filter="object"></custom-box>
        </grid-box>
        <button id="skillGetter-confirm" name="confirm">Confirm</button>
        <button id="skillGetter-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*状态访问器窗口*/}
    <window-frame id="stateGetter">
      <title-bar>Actor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="stateGetter-type"></select-box>
          <text>Actor</text><custom-box id="stateGetter-actor" type="actor"></custom-box>
          <text>State</text><custom-box id="stateGetter-stateId" type="file" filter="state"></custom-box>
          <text>Variable</text><custom-box id="stateGetter-variable" type="variable" filter="object"></custom-box>
        </grid-box>
        <button id="stateGetter-confirm" name="confirm">Confirm</button>
        <button id="stateGetter-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*装备访问器窗口*/}
    <window-frame id="equipmentGetter">
      <title-bar>Actor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="equipmentGetter-type"></select-box>
          <text>Actor</text><custom-box id="equipmentGetter-actor" type="actor"></custom-box>
          <text>Slot</text><select-box id="equipmentGetter-slot"></select-box>
          <text>Variable</text><custom-box id="equipmentGetter-variable" type="variable" filter="object"></custom-box>
        </grid-box>
        <button id="equipmentGetter-confirm" name="confirm">Confirm</button>
        <button id="equipmentGetter-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*物品访问器窗口*/}
    <window-frame id="itemGetter">
      <title-bar>Actor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="itemGetter-type"></select-box>
          <text>Actor</text><custom-box id="itemGetter-actor" type="actor"></custom-box>
          <text>Shortcut Key</text><select-box id="itemGetter-key"></select-box>
          <text>Variable</text><custom-box id="itemGetter-variable" type="variable" filter="object"></custom-box>
        </grid-box>
        <button id="itemGetter-confirm" name="confirm">Confirm</button>
        <button id="itemGetter-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*位置访问器窗口*/}
    <window-frame id="positionGetter">
      <title-bar>Position<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="positionGetter-type"></select-box>
          <text>X</text><number-var id="positionGetter-common-x" min="-512" max="512" decimals="4" unit="tile"></number-var>
          <text>Y</text><number-var id="positionGetter-common-y" min="-512" max="512" decimals="4" unit="tile"></number-var>
          <text>Actor</text><custom-box id="positionGetter-actor" type="actor"></custom-box>
          <text>Trigger</text><custom-box id="positionGetter-trigger" type="trigger"></custom-box>
          <text>Light</text><custom-box id="positionGetter-light" type="light"></custom-box>
          <text>Object</text><custom-box id="positionGetter-objectId" type="preset-object" filter="any"></custom-box>
        </grid-box>
        <button id="positionGetter-confirm" name="confirm">Confirm</button>
        <button id="positionGetter-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*角度访问器窗口*/}
    <window-frame id="angleGetter">
      <title-bar>Angle<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="angleGetter-type"></select-box>
          <text>Position</text><custom-box id="angleGetter-position-position" type="position"></custom-box>
          <text>Degrees</text><number-var id="angleGetter-common-degrees" min="-36000" max="36000" decimals="4" unit="deg"></number-var>
        </grid-box>
        <button id="angleGetter-confirm" name="confirm">Confirm</button>
        <button id="angleGetter-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*触发器访问器窗口*/}
    <window-frame id="triggerGetter">
      <title-bar>Trigger<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="triggerGetter-type"></select-box>
          <text>Variable</text><custom-box id="triggerGetter-variable" type="variable" filter="object"></custom-box>
        </grid-box>
        <button id="triggerGetter-confirm" name="confirm">Confirm</button>
        <button id="triggerGetter-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*光源访问器窗口*/}
    <window-frame id="lightGetter">
      <title-bar>Light<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="lightGetter-type"></select-box>
          <text>Light</text><custom-box id="lightGetter-presetId" type="preset-object" filter="light"></custom-box>
          <text>Variable</text><custom-box id="lightGetter-variable" type="variable" filter="object"></custom-box>
        </grid-box>
        <button id="lightGetter-confirm" name="confirm">Confirm</button>
        <button id="lightGetter-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*元素访问器窗口*/}
    <window-frame id="elementGetter">
      <title-bar>Element<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="elementGetter-type"></select-box>
          <text>Ancestor</text><custom-box id="elementGetter-ancestor" type="ancestor-element"></custom-box>
          <text>Data ID</text><custom-box id="elementGetter-presetId" type="preset-element"></custom-box>
          <text>Index</text><number-var id='elementGetter-index' min='0' max='10000'></number-var>
          <text>Variable</text><custom-box id="elementGetter-variable" type="variable" filter="object"></custom-box>
        </grid-box>
        <button id="elementGetter-confirm" name="confirm">Confirm</button>
        <button id="elementGetter-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*祖先元素访问器窗口*/}
    <window-frame id="ancestorGetter">
      <title-bar>Element<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="ancestorGetter-type"></select-box>
          <text>Data ID</text><custom-box id="ancestorGetter-presetId" type="preset-element"></custom-box>
          <text>Variable</text><custom-box id="ancestorGetter-variable" type="variable" filter="object"></custom-box>
        </grid-box>
        <button id="ancestorGetter-confirm" name="confirm">Confirm</button>
        <button id="ancestorGetter-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*显示文本*/}
    <window-frame id="showText">
      <title-bar>Show Text<close></close></title-bar>
      <content-frame>
        <custom-box id="showText-target" type="actor"></custom-box>
        <text-box id="showText-parameters"></text-box>
        <text-area id="showText-content" menu="tag-variable"></text-area>
        <button id="showText-confirm" name="confirm">Confirm</button>
        <button id="showText-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*显示选项*/}
    <window-frame id="showChoices">
      <title-bar>Show Choices<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Choice 1</text><text-box id="showChoices-choices-0"></text-box>
          <text>Choice 2</text><text-box id="showChoices-choices-1"></text-box>
          <text>Choice 3</text><text-box id="showChoices-choices-2"></text-box>
          <text>Choice 4</text><text-box id="showChoices-choices-3"></text-box>
          <text>Parameters</text><text-box id="showChoices-parameters"></text-box>
        </grid-box>
        <button id="showChoices-confirm" name="confirm">Confirm</button>
        <button id="showChoices-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置布尔值*/}
    <window-frame id="setBoolean">
      <title-bar>Set Boolean<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Variable</text><custom-box id="setBoolean-variable" type="variable" filter="writable-boolean"></custom-box>
          <text>Operation</text><select-box id="setBoolean-operation"></select-box>
          <text>Type</text><select-box id="setBoolean-operand-type"></select-box>
          <text>Constant</text><select-box id="setBoolean-constant-value"></select-box>
          <text>Variable</text><custom-box id="setBoolean-common-variable" type="variable" filter="all"></custom-box>
          <text>Index</text><number-var id="setBoolean-list-index" min="0" max="1000000000"></number-var>
          <text>Param Name</text><string-var id="setBoolean-parameter-key"></string-var>
        </grid-box>
        <button id="setBoolean-confirm" name="confirm">Confirm</button>
        <button id="setBoolean-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置数值*/}
    <window-frame id="setNumber">
      <title-bar>Set Number<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Variable</text><custom-box id="setNumber-variable" type="variable" filter="writable-number"></custom-box>
          <text>Expression</text><param-list id="setNumber-operands"></param-list>
        </grid-box>
        <button id="setNumber-confirm" name="confirm">Confirm</button>
        <button id="setNumber-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置数值 - 操作数*/}
    <window-frame id="setNumber-operand">
      <title-bar>Number Operand<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Operation</text><select-box id="setNumber-operation"></select-box><select-box id="setNumber-operand-operation"></select-box>
          <text>Type</text><select-box id="setNumber-operand-type"></select-box>
          <text>Constant</text><number-box id="setNumber-operand-constant-value" min="-1000000000" max="1000000000" decimals="10"></number-box>
          <text>Math Method</text><select-box id="setNumber-operand-math-method"></select-box>
          <text>String Method</text><select-box id="setNumber-operand-string-method"></select-box>
          <text>Property</text><select-box id="setNumber-operand-object-property"></select-box>
          <text>Property</text><select-box id="setNumber-operand-element-property"></select-box>
          <text>Element</text><custom-box id="setNumber-operand-element-element" type="element"></custom-box>
          <text>Variable</text><custom-box id="setNumber-operand-common-variable" type="variable" filter="all"></custom-box>
          <text>Actor</text><custom-box id="setNumber-operand-common-actor" type="actor"></custom-box>
          <text>Skill</text><custom-box id="setNumber-operand-common-skill" type="skill"></custom-box>
          <text>State</text><custom-box id="setNumber-operand-common-state" type="state"></custom-box>
          <text>Equipment</text><custom-box id="setNumber-operand-common-equipment" type="equipment"></custom-box>
          <text>Item</text><custom-box id="setNumber-operand-common-item" type="item"></custom-box>
          <text>Trigger</text><custom-box id="setNumber-operand-common-trigger" type="trigger"></custom-box>
          <text>Item</text><custom-box id="setNumber-operand-object-itemId" type="file" filter="item"></custom-box>
          <text>Equipment</text><custom-box id="setNumber-operand-object-equipmentId" type="file" filter="equipment"></custom-box>
          <text>Search String</text><string-var id="setNumber-operand-string-search"></string-var>
          <text>Decimal Places</text><number-box id="setNumber-operand-math-decimals" min="0" max="10"></number-box>
          <text>Min</text><number-var id="setNumber-operand-math-min" min="-1000000000" max="1000000000"></number-var>
          <text>Max</text><number-var id="setNumber-operand-math-max" min="-1000000000" max="1000000000"></number-var>
          <text>Start Position</text><custom-box id="setNumber-operand-math-startPosition" type="position"></custom-box>
          <text>End Position</text><custom-box id="setNumber-operand-math-endPosition" type="position"></custom-box>
          <text>Cooldown Key</text><select-var id="setNumber-operand-cooldown-key"></select-var>
          <text>Index</text><number-var id="setNumber-operand-list-index" min="0" max="1000000000"></number-var>
          <text>Param Name</text><string-var id="setNumber-operand-parameter-key"></string-var>
          <text>Data</text><select-box id="setNumber-operand-other-data"></select-box>
        </grid-box>
        <button id="setNumber-operand-confirm" name="confirm">Confirm</button>
        <button id="setNumber-operand-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置字符串*/}
    <window-frame id="setString">
      <title-bar>Set String<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Variable</text><custom-box id="setString-variable" type="variable" filter="writable-string"></custom-box>
          <text>Operation</text><select-box id="setString-operation"></select-box>
          <text>Type</text><select-box id="setString-operand-type"></select-box>
          <text>Constant</text><text-area id="setString-operand-constant-value"></text-area>
          <text>String Method</text><select-box id="setString-operand-string-method"></select-box>
          <text>Variable</text><custom-box id="setString-operand-common-variable" type="variable" filter="all"></custom-box>
          <text>Index</text><number-var id="setString-operand-string-char-index" min="0" max="1000000000"></number-var>
          <text>Begin Index</text><number-var id="setString-operand-string-slice-begin" min="-1000000000" max="1000000000"></number-var>
          <text>End Index</text><number-var id="setString-operand-string-slice-end" min="-1000000000" max="1000000000"></number-var>
          <text>Target Length</text><number-box id="setString-operand-string-pad-start-length" min="2" max="10"></number-box>
          <text>Pad String</text><text-box id="setString-operand-string-pad-start-pad"></text-box>
          <text>Substring</text><string-var id="setString-operand-string-replace-pattern"></string-var>
          <text>Replacement</text><string-var id="setString-operand-string-replace-replacement"></string-var>
          <text>Enum String</text><custom-box id="setString-operand-enum-stringId" type="enum-string"></custom-box>
          <text>Property</text><select-box id="setString-operand-object-property"></select-box>
          <text>Property</text><select-box id="setString-operand-element-property"></select-box>
          <text>Element</text><custom-box id="setString-operand-element-element" type="element"></custom-box>
          <text>Actor</text><custom-box id="setString-operand-common-actor" type="actor"></custom-box>
          <text>Skill</text><custom-box id="setString-operand-common-skill" type="skill"></custom-box>
          <text>State</text><custom-box id="setString-operand-common-state" type="state"></custom-box>
          <text>Equipment</text><custom-box id="setString-operand-common-equipment" type="equipment"></custom-box>
          <text>Item</text><custom-box id="setString-operand-common-item" type="item"></custom-box>
          <text>File</text><custom-box id="setString-operand-object-fileId" type="file"></custom-box>
          <text>Index</text><number-var id="setString-operand-list-index" min="0" max="1000000000"></number-var>
          <text>Param Name</text><string-var id="setString-operand-parameter-key"></string-var>
          <text>Data</text><select-box id="setString-operand-other-data"></select-box>
        </grid-box>
        <button id="setString-confirm" name="confirm">Confirm</button>
        <button id="setString-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置对象*/}
    <window-frame id="setObject">
      <title-bar>Set Object<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Variable</text><custom-box id="setObject-variable" type="variable" filter="object"></custom-box>
          <text>Type</text><select-box id="setObject-operand-type"></select-box>
          <text>Actor</text><custom-box id="setObject-operand-actor" type="actor"></custom-box>
          <text>Skill</text><custom-box id="setObject-operand-skill" type="skill"></custom-box>
          <text>State</text><custom-box id="setObject-operand-state" type="state"></custom-box>
          <text>Equipment</text><custom-box id="setObject-operand-equipment" type="equipment"></custom-box>
          <text>Item</text><custom-box id="setObject-operand-item" type="item"></custom-box>
          <text>Trigger</text><custom-box id="setObject-operand-trigger" type="trigger"></custom-box>
          <text>Light</text><custom-box id="setObject-operand-light" type="light"></custom-box>
          <text>Element</text><custom-box id="setObject-operand-element" type="element"></custom-box>
          <text>Variable</text><custom-box id="setObject-operand-variable" type="variable" filter="object"></custom-box>
          <text>Index</text><number-var id="setObject-operand-list-index" min="0" max="1000000000"></number-var>
        </grid-box>
        <button id="setObject-confirm" name="confirm">Confirm</button>
        <button id="setObject-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置列表*/}
    <window-frame id="setList">
      <title-bar>Set List<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Variable</text><custom-box id="setList-variable" type="variable" filter="object"></custom-box>
          <text>Operation</text><select-box id="setList-operation"></select-box>
          <text>Numbers</text><custom-box id="setList-numbers" type="array" filter="number"></custom-box>
          <text>Strings</text><custom-box id="setList-strings" type="array" filter="string"></custom-box>
          <text>Index</text><number-var id="setList-index" min="0" max="1000000000"></number-var>
          <text>Boolean</text><select-box id="setList-boolean"></select-box>
          <text>Number</text><number-box id="setList-number" min="-1000000000" max="1000000000" decimals="10"></number-box>
          <text>String</text><text-area id="setList-string"></text-area>
          <text>Variable</text><custom-box id="setList-operand" type="variable" filter="all"></custom-box>
        </grid-box>
        <button id="setList-confirm" name="confirm">Confirm</button>
        <button id="setList-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*删除变量*/}
    <window-frame id="deleteVariable">
      <title-bar>Delete Variable<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Variable</text><custom-box id="deleteVariable-variable" type="variable" filter="deletable"></custom-box>
        </grid-box>
        <button id="deleteVariable-confirm" name="confirm">Confirm</button>
        <button id="deleteVariable-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*条件分支*/}
    <window-frame id="if">
      <title-bar>If<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Branches</text><param-list id="if-branches"></param-list>
        </grid-box>
        <check-box id="if-else" class="standard"><text id="if-else-label">Else</text></check-box>
        <button id="if-confirm" name="confirm">Confirm</button>
        <button id="if-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*条件分支 - 分支*/}
    <window-frame id="if-branch">
      <title-bar>Branch<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Mode</text><select-box id="if-branch-mode"></select-box>
          <text>Conditions</text><param-list id="if-branch-conditions"></param-list>
        </grid-box>
        <button id="if-branch-confirm" name="confirm">Confirm</button>
        <button id="if-branch-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*条件分支 - 条件*/}
    <window-frame id="if-condition">
      <title-bar>Condition<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Condition Type</text><select-box id="if-condition-type"></select-box>
          <text>Variable</text><custom-box id="if-condition-common-variable" type="variable" filter="all"></custom-box>
          <text>Operation</text><select-box id="if-condition-boolean-operation"></select-box>
          <text>Operand Type</text><select-box id="if-condition-boolean-operand-type"></select-box>
          <text>Constant</text><select-box id="if-condition-boolean-constant-value"></select-box>
          <text>Operation</text><select-box id="if-condition-number-operation"></select-box>
          <text>Operand Type</text><select-box id="if-condition-number-operand-type"></select-box>
          <text>Constant</text><number-box id="if-condition-number-constant-value" min="-1000000000" max="1000000000" decimals="10"></number-box>
          <text>Operation</text><select-box id="if-condition-string-operation"></select-box>
          <text>Operand Type</text><select-box id="if-condition-string-operand-type"></select-box>
          <text>Constant</text><text-area id="if-condition-string-constant-value"></text-area>
          <text>Enum String</text><custom-box id="if-condition-string-enum-stringId" type="enum-string"></custom-box>
          <text>Operation</text><select-box id="if-condition-object-operation"></select-box>
          <text>Operand Type</text><select-box id="if-condition-object-operand-type"></select-box>
          <text>Operation</text><select-box id="if-condition-list-operation"></select-box>
          <text>Variable</text><custom-box id="if-condition-operand-variable" type="variable" filter="all"></custom-box>
          <text>Actor</text><custom-box id="if-condition-common-actor" type="actor"></custom-box>
          <text>Skill</text><custom-box id="if-condition-common-skill" type="skill"></custom-box>
          <text>State</text><custom-box id="if-condition-common-state" type="state"></custom-box>
          <text>Equipment</text><custom-box id="if-condition-common-equipment" type="equipment"></custom-box>
          <text>Item</text><custom-box id="if-condition-common-item" type="item"></custom-box>
          <text>Trigger</text><custom-box id="if-condition-common-trigger" type="trigger"></custom-box>
          <text>Light</text><custom-box id="if-condition-common-light" type="light"></custom-box>
          <text>Element</text><custom-box id="if-condition-common-element" type="element"></custom-box>
          <text>Operation</text><select-box id="if-condition-actor-operation"></select-box>
          <text>Skill</text><custom-box id="if-condition-actor-skillId" type="file" filter="skill"></custom-box>
          <text>State</text><custom-box id="if-condition-actor-stateId" type="file" filter="state"></custom-box>
          <text>Item</text><custom-box id="if-condition-actor-itemId" type="file" filter="item"></custom-box>
          <text>Equipment</text><custom-box id="if-condition-actor-equipmentId" type="file" filter="equipment"></custom-box>
          <text>Quantity</text><number-box id="if-condition-actor-quantity" min="1" max="10000"></number-box>
          <text>Operation</text><select-box id="if-condition-element-operation"></select-box>
          <text>KeyCode</text><keyboard-box id="if-condition-keyboard-keycode"></keyboard-box>
          <text>State</text><select-box id="if-condition-keyboard-state"></select-box>
          <text>Button</text><select-box id="if-condition-mouse-button"></select-box>
          <text>State</text><select-box id="if-condition-mouse-state"></select-box>
          <text>Other</text><select-box id="if-condition-other-key"></select-box>
        </grid-box>
        <button id="if-condition-confirm" name="confirm">Confirm</button>
        <button id="if-condition-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*匹配*/}
    <window-frame id="switch">
      <title-bar>Switch<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Variable</text><custom-box id="switch-variable" type="variable" filter="all"></custom-box>
          <text>Branches</text><param-list id="switch-branches"></param-list>
        </grid-box>
        <check-box id="switch-default" class="standard"><text id="switch-default-label">Default</text></check-box>
        <button id="switch-confirm" name="confirm">Confirm</button>
        <button id="switch-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*匹配 - 分支*/}
    <window-frame id="switch-branch">
      <title-bar>Branch<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Cases</text><param-list id="switch-branch-conditions"></param-list>
        </grid-box>
        <button id="switch-branch-confirm" name="confirm">Confirm</button>
        <button id="switch-branch-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*匹配 - 条件*/}
    <window-frame id="switch-condition">
      <title-bar>Condition<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Condition Type</text><select-box id="switch-condition-type"></select-box>
          <text>Boolean</text><select-box id="switch-condition-boolean-value"></select-box>
          <text>Number</text><number-box id="switch-condition-number-value" min="-1000000000" max="1000000000" decimals="10"></number-box>
          <text>String</text><text-area id="switch-condition-string-value"></text-area>
          <text>Enum String</text><custom-box id="switch-condition-enum-stringId" type="enum-string"></custom-box>
          <text>Key</text><keyboard-box id="switch-condition-keyboard-keycode"></keyboard-box>
          <text>Button</text><select-box id="switch-condition-mouse-button"></select-box>
          <text>Variable</text><custom-box id="switch-condition-variable-variable" type="variable" filter="all"></custom-box>
        </grid-box>
        <button id="switch-condition-confirm" name="confirm">Confirm</button>
        <button id="switch-condition-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*循环*/}
    <window-frame id="loop">
      <title-bar>Loop<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Mode</text><select-box id="loop-mode"></select-box>
          <text>Conditions</text><param-list id="loop-conditions"></param-list>
        </grid-box>
        <button id="loop-confirm" name="confirm">Confirm</button>
        <button id="loop-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*遍历*/}
    <window-frame id="forEach">
      <title-bar>For Each<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Data</text><select-box id="forEach-data"></select-box>
          <text>List Variable</text><custom-box id="forEach-list" type="variable" filter="object"></custom-box>
          <text>Actor</text><custom-box id="forEach-actor" type="actor"></custom-box>
          <text>Parent Element</text><custom-box id="forEach-element" type="element"></custom-box>
          <text>Save to Variable</text><custom-box id="forEach-variable" type="variable" filter="object"></custom-box>
        </grid-box>
        <button id="forEach-confirm" name="confirm">Confirm</button>
        <button id="forEach-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*调用事件*/}
    <window-frame id="callEvent">
      <title-bar>Call Event<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="callEvent-type"></select-box>
          <text>Actor</text><custom-box id="callEvent-actor" type="actor"></custom-box>
          <text>Skill</text><custom-box id="callEvent-skill" type="skill"></custom-box>
          <text>State</text><custom-box id="callEvent-state" type="state"></custom-box>
          <text>Equipment</text><custom-box id="callEvent-equipment" type="equipment"></custom-box>
          <text>Item</text><custom-box id="callEvent-item" type="item"></custom-box>
          <text>Light</text><custom-box id="callEvent-light" type="light"></custom-box>
          <text>Element</text><custom-box id="callEvent-element" type="element"></custom-box>
          <text>Event</text><custom-box id="callEvent-eventId" type="file" filter="event"></custom-box>
          <text>Event</text><select-box id="callEvent-eventType"></select-box>
        </grid-box>
        <button id="callEvent-confirm" name="confirm">Confirm</button>
        <button id="callEvent-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置事件*/}
    <window-frame id="setEvent">
      <title-bar>Set Event<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Operation</text><select-box id="setEvent-operation"></select-box>
          <text>Variable</text><custom-box id="setEvent-variable" type="variable" filter="object"></custom-box>
          <text>Event</text><custom-box id="setEvent-eventId" type="file" filter="event"></custom-box>
          <text>Choice</text><select-box id="setEvent-choiceIndex"></select-box>
        </grid-box>
        <button id="setEvent-confirm" name="confirm">Confirm</button>
        <button id="setEvent-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*注释*/}
    <window-frame id="comment">
      <title-bar>Comment<close></close></title-bar>
      <content-frame>
        <text-area id="comment-comment"></text-area>
        <button id="comment-confirm" name="confirm">Confirm</button>
        <button id="comment-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*标签*/}
    <window-frame id="label">
      <title-bar>Label<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Label Name</text><text-box id="label-name"></text-box>
        </grid-box>
        <button id="label-confirm" name="confirm">Confirm</button>
        <button id="label-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*跳转到*/}
    <window-frame id="jumpTo">
      <title-bar>Jump to<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Operation</text><select-box id="jumpTo-operation"></select-box>
          <text>Label Name</text><text-box id="jumpTo-label"></text-box>
        </grid-box>
        <button id="jumpTo-confirm" name="confirm">Confirm</button>
        <button id="jumpTo-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*等待*/}
    <window-frame id="wait">
      <title-bar>Wait<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Duration</text><number-var id="wait-duration" min="1" max="3600000" unit="ms"></number-var>
        </grid-box>
        <button id="wait-confirm" name="confirm">Confirm</button>
        <button id="wait-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*创建元素*/}
    <window-frame id="createElement">
      <title-bar>Create Element<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Operation</text><select-box id="createElement-operation"></select-box>
          <text>Parent</text><custom-box id="createElement-parent" type="element"></custom-box>
          <text>UI Elements</text><custom-box id="createElement-uiId" type="file" filter="ui"></custom-box>
          <text>UI Element</text><custom-box id="createElement-presetId" type="preset-element"></custom-box>
        </grid-box>
        <button id="createElement-confirm" name="confirm">Confirm</button>
        <button id="createElement-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置图像*/}
    <window-frame id="setImage">
      <title-bar>Set Image<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Element</text><custom-box id="setImage-element" type="element"></custom-box>
          <text>Properties</text><param-list id="setImage-properties"></param-list>
        </grid-box>
        <button id="setImage-confirm" name="confirm">Confirm</button>
        <button id="setImage-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置图像 - 属性*/}
    <window-frame id="setImage-property">
      <title-bar>Image Property<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Property</text><select-box id="setImage-property-key"></select-box>
          <text>Image</text><custom-box id="setImage-property-image" type="file" filter="image"></custom-box>
          <text>Display</text><select-box id="setImage-property-display"></select-box>
          <text>Flip</text><select-box id="setImage-property-flip"></select-box>
          <text>Blend</text><select-box id="setImage-property-blend"></select-box>
          <text>Shift X</text><number-var id="setImage-property-shiftX" min="-10000" max="10000" unit="px"></number-var>
          <text>Shift Y</text><number-var id="setImage-property-shiftY" min="-10000" max="10000" unit="px"></number-var>
          <text>Clip - X</text><number-var id="setImage-property-clip-0" min="0" max="10000" unit="px"></number-var>
          <text>Clip - Y</text><number-var id="setImage-property-clip-1" min="0" max="10000" unit="px"></number-var>
          <text>Clip - Width</text><number-var id="setImage-property-clip-2" min="0" max="10000" unit="px"></number-var>
          <text>Clip - Height</text><number-var id="setImage-property-clip-3" min="0" max="10000" unit="px"></number-var>
        </grid-box>
        <button id="setImage-property-confirm" name="confirm">Confirm</button>
        <button id="setImage-property-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*加载图像*/}
    <window-frame id="loadImage">
      <title-bar>Load Image<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Element</text><custom-box id="loadImage-element" type="element"></custom-box>
          <text>Type</text><select-box id="loadImage-type"></select-box>
          <text>Actor</text><custom-box id="loadImage-actor" type="actor"></custom-box>
          <text>Skill</text><custom-box id="loadImage-skill" type="skill"></custom-box>
          <text>State</text><custom-box id="loadImage-state" type="state"></custom-box>
          <text>Equipment</text><custom-box id="loadImage-equipment" type="equipment"></custom-box>
          <text>Item</text><custom-box id="loadImage-item" type="item"></custom-box>
        </grid-box>
        <button id="loadImage-confirm" name="confirm">Confirm</button>
        <button id="loadImage-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*改变图像色调*/}
    <window-frame id="tintImage">
      <title-bar>Tint Image<close></close></title-bar>
      <content-frame>
        <grid-box id="tintImage-grid-box">
          <text>Element</text><custom-box id="tintImage-element" type="element"></custom-box>
          <text>Mode</text><select-box id="tintImage-mode"></select-box>
          <text>Tint - Red</text><number-box id="tintImage-tint-0" min="-255" max="255" step="5"></number-box>
          <text>Tint - Green</text><number-box id="tintImage-tint-1" min="-255" max="255" step="5"></number-box>
          <text>Tint - Blue</text><number-box id="tintImage-tint-2" min="-255" max="255" step="5"></number-box>
          <text>Tint - Gray</text><number-box id="tintImage-tint-3" min="0" max="255" step="5"></number-box>
          <text>Easing</text><select-box id="tintImage-easingId"></select-box>
          <text>Duration</text><number-box id="tintImage-duration" min="0" max="3600000" unit="ms"></number-box>
          <text>Wait</text><select-box id="tintImage-wait"></select-box>
        </grid-box>
        <filter-box id="tintImage-filter" width="96" height="208"></filter-box>
        <button id="tintImage-confirm" name="confirm">Confirm</button>
        <button id="tintImage-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置文本*/}
    <window-frame id="setText">
      <title-bar>Set Text<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Element</text><custom-box id="setText-element" type="element"></custom-box>
          <text>Properties</text><param-list id="setText-properties"></param-list>
        </grid-box>
        <button id="setText-confirm" name="confirm">Confirm</button>
        <button id="setText-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置文本 - 属性*/}
    <window-frame id="setText-property">
      <title-bar>Text Property<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Property</text><select-box id="setText-property-key"></select-box>
          <text>Content</text><text-area id="setText-property-content" menu="tag-variable"></text-area>
          <text>Size</text><number-box id="setText-property-size" min="10" max="400" unit="px"></number-box>
          <text>Line Spacing</text><number-box id="setText-property-lineSpacing" min="-10" max="100" unit="px"></number-box>
          <text>Letter Spacing</text><number-box id="setText-property-letterSpacing" min="-10" max="100" unit="px"></number-box>
          <text>Color</text><color-box id="setText-property-color"></color-box>
          <text>Font</text><text-box id="setText-property-font"></text-box>
          <text>Effect</text><select-box id="setText-property-effect-type"></select-box>
          <text>Shadow X</text><number-box id="setText-property-effect-shadowOffsetX" min="-9" max="9" unit="px"></number-box>
          <text>Shadow Y</text><number-box id="setText-property-effect-shadowOffsetY" min="-9" max="9" unit="px"></number-box>
          <text>Stroke Width</text><number-box id="setText-property-effect-strokeWidth" min="1" max="20" unit="px"></number-box>
          <text>Effect Color</text><color-box id="setText-property-effect-color"></color-box>
          <text>Blend</text><select-box id="setText-property-blend"></select-box>
        </grid-box>
        <button id="setText-property-confirm" name="confirm">Confirm</button>
        <button id="setText-property-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置文本框*/}
    <window-frame id="setTextBox">
      <title-bar>Set Text Box<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Element</text><custom-box id="setTextBox-element" type="element"></custom-box>
          <text>Properties</text><param-list id="setTextBox-properties"></param-list>
        </grid-box>
        <button id="setTextBox-confirm" name="confirm">Confirm</button>
        <button id="setTextBox-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置文本框 - 属性*/}
    <window-frame id="setTextBox-property">
      <title-bar>Text Property<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Property</text><select-box id="setTextBox-property-key"></select-box>
          <text>Type</text><select-box id="setTextBox-property-type"></select-box>
          <text>Text</text><string-var id="setTextBox-property-text"></string-var>
          <text>Number</text><number-var id="setTextBox-property-number" min="-1000000000" max="1000000000" decimals="10"></number-var>
          <text>Min</text><number-var id="setTextBox-property-min" min="-1000000000" max="1000000000" decimals="10"></number-var>
          <text>Max</text><number-var id="setTextBox-property-max" min="-1000000000" max="1000000000" decimals="10"></number-var>
          <text>Decimal Places</text><number-box id="setTextBox-property-decimals" min="0" max="10"></number-box>
          <text>Color</text><color-box id="setTextBox-property-color"></color-box>
        </grid-box>
        <button id="setTextBox-property-confirm" name="confirm">Confirm</button>
        <button id="setTextBox-property-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置对话框*/}
    <window-frame id="setDialogBox">
      <title-bar>Set Dialog Box<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Element</text><custom-box id="setDialogBox-element" type="element"></custom-box>
          <text>Properties</text><param-list id="setDialogBox-properties"></param-list>
        </grid-box>
        <button id="setDialogBox-confirm" name="confirm">Confirm</button>
        <button id="setDialogBox-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置对话框 - 属性*/}
    <window-frame id="setDialogBox-property">
      <title-bar>Dialog Box Property<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Property</text><select-box id="setDialogBox-property-key"></select-box>
          <text>Content</text><text-area id="setDialogBox-property-content" menu="tag-variable"></text-area>
          <text>Interval</text><number-box id="setDialogBox-property-interval" min="0" max="100" unit="ms"></number-box>
          <text>Size</text><number-box id="setDialogBox-property-size" min="10" max="400" unit="px"></number-box>
          <text>Line Spacing</text><number-box id="setDialogBox-property-lineSpacing" min="-10" max="100" unit="px"></number-box>
          <text>Letter Spacing</text><number-box id="setDialogBox-property-letterSpacing" min="-10" max="100" unit="px"></number-box>
          <text>Color</text><color-box id="setDialogBox-property-color"></color-box>
          <text>Font</text><text-box id="setDialogBox-property-font"></text-box>
          <text>Effect</text><select-box id="setDialogBox-property-effect-type"></select-box>
          <text>Shadow X</text><number-box id="setDialogBox-property-effect-shadowOffsetX" min="-9" max="9" unit="px"></number-box>
          <text>Shadow Y</text><number-box id="setDialogBox-property-effect-shadowOffsetY" min="-9" max="9" unit="px"></number-box>
          <text>Stroke Width</text><number-box id="setDialogBox-property-effect-strokeWidth" min="1" max="20" unit="px"></number-box>
          <text>Effect Color</text><color-box id="setDialogBox-property-effect-color"></color-box>
          <text>Blend</text><select-box id="setDialogBox-property-blend"></select-box>
        </grid-box>
        <button id="setDialogBox-property-confirm" name="confirm">Confirm</button>
        <button id="setDialogBox-property-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*控制对话框*/}
    <window-frame id="controlDialog">
      <title-bar>Control Dialog<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Element</text><custom-box id="controlDialog-element" type="element"></custom-box>
          <text>Operation</text><select-box id="controlDialog-operation"></select-box>
        </grid-box>
        <button id="controlDialog-confirm" name="confirm">Confirm</button>
        <button id="controlDialog-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置进度条*/}
    <window-frame id="setProgressBar">
      <title-bar>Set Progress Bar<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Element</text><custom-box id="setProgressBar-element" type="element"></custom-box>
          <text>Properties</text><param-list id="setProgressBar-properties"></param-list>
        </grid-box>
        <button id="setProgressBar-confirm" name="confirm">Confirm</button>
        <button id="setProgressBar-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置进度条 - 属性*/}
    <window-frame id="setProgressBar-property">
      <title-bar>Image Property<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Property</text><select-box id="setProgressBar-property-key"></select-box>
          <text>Image</text><custom-box id="setProgressBar-property-image" type="file" filter="image"></custom-box>
          <text>Display</text><select-box id="setProgressBar-property-display"></select-box>
          <text>Blend</text><select-box id="setProgressBar-property-blend"></select-box>
          <text>Progress</text><number-var id="setProgressBar-property-progress" min="0" max="1" step="0.1" decimals="4"></number-var>
          <text>Clip - X</text><number-var id="setProgressBar-property-clip-0" min="0" max="10000" unit="px"></number-var>
          <text>Clip - Y</text><number-var id="setProgressBar-property-clip-1" min="0" max="10000" unit="px"></number-var>
          <text>Clip - Width</text><number-var id="setProgressBar-property-clip-2" min="0" max="10000" unit="px"></number-var>
          <text>Clip - Height</text><number-var id="setProgressBar-property-clip-3" min="0" max="10000" unit="px"></number-var>
          <text>Color - Red</text><number-var id="setProgressBar-property-color-0" min="0" max="255"></number-var>
          <text>Color - Green</text><number-var id="setProgressBar-property-color-1" min="0" max="255"></number-var>
          <text>Color - Blue</text><number-var id="setProgressBar-property-color-2" min="0" max="255"></number-var>
          <text>Color - Alpha</text><number-var id="setProgressBar-property-color-3" min="0" max="255"></number-var>
        </grid-box>
        <button id="setProgressBar-property-confirm" name="confirm">Confirm</button>
        <button id="setProgressBar-property-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*等待视频结束*/}
    <window-frame id="waitForVideo">
      <title-bar>Wait For Video<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Element</text><custom-box id="waitForVideo-element" type="element"></custom-box>
        </grid-box>
        <button id="waitForVideo-confirm" name="confirm">Confirm</button>
        <button id="waitForVideo-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置元素*/}
    <window-frame id="setElement">
      <title-bar>Set Element<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Element</text><custom-box id="setElement-element" type="element"></custom-box>
          <text>Operation</text><select-box id="setElement-operation"></select-box>
        </grid-box>
        <button id="setElement-confirm" name="confirm">Confirm</button>
        <button id="setElement-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*嵌套元素*/}
    <window-frame id="nestElement">
      <title-bar>Nest Element<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Parent Element</text><custom-box id="nestElement-parent" type="element"></custom-box>
          <text>Child Element</text><custom-box id="nestElement-child" type="element"></custom-box>
        </grid-box>
        <button id="nestElement-confirm" name="confirm">Confirm</button>
        <button id="nestElement-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*移动元素*/}
    <window-frame id="moveElement">
      <title-bar>Move Element<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Element</text><custom-box id="moveElement-element" type="element"></custom-box>
          <text>Properties</text><param-list id="moveElement-properties"></param-list>
          <text>Easing</text><select-box id="moveElement-easingId"></select-box>
          <text>Duration</text><number-box id="moveElement-duration" min="0" max="3600000" unit="ms"></number-box>
          <text>Wait</text><select-box id="moveElement-wait"></select-box>
        </grid-box>
        <button id="moveElement-confirm" name="confirm">Confirm</button>
        <button id="moveElement-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*移动元素 - 属性*/}
    <window-frame id="moveElement-property">
      <title-bar>Transform Property<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Property</text><select-box id="moveElement-property-key"></select-box>
          <text>Anchor X</text><number-var id="moveElement-property-anchorX" min="-100" max="100" step="0.1" decimals="4"></number-var>
          <text>Anchor Y</text><number-var id="moveElement-property-anchorY" min="-100" max="100" step="0.1" decimals="4"></number-var>
          <text>X</text><number-var id="moveElement-property-x" min="-10000" max="10000" decimals="4" unit="px"></number-var>
          <text>X2</text><number-var id="moveElement-property-x2" min="-100" max="100" step="0.1" decimals="4" unit="r"></number-var>
          <text>Y</text><number-var id="moveElement-property-y" min="-10000" max="10000" decimals="4" unit="px"></number-var>
          <text>Y2</text><number-var id="moveElement-property-y2" min="-100" max="100" step="0.1" decimals="4" unit="r"></number-var>
          <text>Width</text><number-var id="moveElement-property-width" min="-10000" max="10000" decimals="4" unit="px"></number-var>
          <text>Width2</text><number-var id="moveElement-property-width2" min="-100" max="100" step="0.1" decimals="4" unit="r"></number-var>
          <text>Height</text><number-var id="moveElement-property-height" min="-10000" max="10000" decimals="4" unit="px"></number-var>
          <text>Height2</text><number-var id="moveElement-property-height2" min="-100" max="100" step="0.1" decimals="4" unit="r"></number-var>
          <text>Rotation</text><number-var id="moveElement-property-rotation" min="-36000" max="36000" decimals="4" unit="deg"></number-var>
          <text>Scale X</text><number-var id="moveElement-property-scaleX" min="-100" max="100" step="0.1" decimals="4"></number-var>
          <text>Scale Y</text><number-var id="moveElement-property-scaleY" min="-100" max="100" step="0.1" decimals="4"></number-var>
          <text>Skew X</text><number-var id="moveElement-property-skewX" min="-100" max="100" step="0.1" decimals="4"></number-var>
          <text>Skew Y</text><number-var id="moveElement-property-skewY" min="-100" max="100" step="0.1" decimals="4"></number-var>
          <text>Opacity</text><number-var id="moveElement-property-opacity" min="0" max="1" step="0.05" decimals="4"></number-var>
        </grid-box>
        <button id="moveElement-property-confirm" name="confirm">Confirm</button>
        <button id="moveElement-property-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*删除元素*/}
    <window-frame id="deleteElement">
      <title-bar>Delete Element<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Operation</text><select-box id="deleteElement-operation"></select-box>
          <text>Element</text><custom-box id="deleteElement-element" type="element"></custom-box>
        </grid-box>
        <button id="deleteElement-confirm" name="confirm">Confirm</button>
        <button id="deleteElement-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*创建光源*/}
    <window-frame id="createLight">
      <title-bar>Create Light<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Light</text><custom-box id="createLight-presetId" type="preset-object" filter="light"></custom-box>
          <text>Position</text><custom-box id="createLight-position" type="position"></custom-box>
        </grid-box>
        <button id="createLight-confirm" name="confirm">Confirm</button>
        <button id="createLight-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*移动光源*/}
    <window-frame id="moveLight">
      <title-bar>Move Light<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Light</text><custom-box id="moveLight-light" type="light"></custom-box>
          <text>Properties</text><param-list id="moveLight-properties"></param-list>
          <text>Easing</text><select-box id="moveLight-easingId"></select-box>
          <text>Duration</text><number-box id="moveLight-duration" min="0" max="3600000" unit="ms"></number-box>
          <text>Wait</text><select-box id="moveLight-wait"></select-box>
        </grid-box>
        <button id="moveLight-confirm" name="confirm">Confirm</button>
        <button id="moveLight-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*移动光源 - 属性*/}
    <window-frame id="moveLight-property">
      <title-bar>Point Light Property<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Property</text><select-box id="moveLight-property-key"></select-box>
          <text>X</text><number-var id="moveLight-property-x" min="0" max="512" step="0.1" decimals="4"></number-var>
          <text>Y</text><number-var id="moveLight-property-y" min="0" max="512" step="0.1" decimals="4"></number-var>
          <text>Range</text><number-var id="moveLight-property-range" min="0" max="128" decimals="4" unit="tile"></number-var>
          <text>Intensity</text><number-var id="moveLight-property-intensity" min="0" max="1" step="0.1" decimals="4"></number-var>
          <text>Anchor X</text><number-var id="moveLight-property-anchorX" min="0" max="1" step="0.1" decimals="4"></number-var>
          <text>Anchor Y</text><number-var id="moveLight-property-anchorY" min="0" max="1" step="0.1" decimals="4"></number-var>
          <text>Width</text><number-var id="moveLight-property-width" min="0" max="128" decimals="4" unit="tile"></number-var>
          <text>Height</text><number-var id="moveLight-property-height" min="0" max="128" decimals="4" unit="tile"></number-var>
          <text>Angle</text><number-var id="moveLight-property-angle" min="-36000" max="36000" step="5" decimals="4" unit="deg"></number-var>
          <text>Red</text><number-var id="moveLight-property-red" min="0" max="255" step="5"></number-var>
          <text>Green</text><number-var id="moveLight-property-green" min="0" max="255" step="5"></number-var>
          <text>Blue</text><number-var id="moveLight-property-blue" min="0" max="255" step="5"></number-var>
        </grid-box>
        <button id="moveLight-property-confirm" name="confirm">Confirm</button>
        <button id="moveLight-property-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*删除光源*/}
    <window-frame id="deleteLight">
      <title-bar>Delete Light<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Light</text><custom-box id="deleteLight-light" type="light"></custom-box>
        </grid-box>
        <button id="deleteLight-confirm" name="confirm">Confirm</button>
        <button id="deleteLight-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置状态*/}
    <window-frame id="setState">
      <title-bar>Set State<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>State</text><custom-box id="setState-state" type="state"></custom-box>
          <text>Operation</text><select-box id="setState-operation"></select-box>
          <text>Time</text><number-var id="setState-time" min="0" max="36000000" unit="ms"></number-var>
        </grid-box>
        <button id="setState-confirm" name="confirm">Confirm</button>
        <button id="setState-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*播放动画*/}
    <window-frame id="playAnimation">
      <title-bar>Play Animation<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Mode</text><select-box id="playAnimation-mode"></select-box>
          <text>Position</text><custom-box id="playAnimation-position" type="position"></custom-box>
          <text>Actor</text><custom-box id="playAnimation-actor" type="actor"></custom-box>
          <text>Animation</text><custom-box id="playAnimation-animationId" type="file" filter="animation"></custom-box>
          <text>Motion</text><select-box id="playAnimation-motion"></select-box>
          <text>Priority</text><number-box id="playAnimation-priority" min="-100" max="100"></number-box>
          <text>Offset Y</text><number-box id="playAnimation-offsetY" min="-100" max="100" unit="px"></number-box>
          <text>Rotation</text><number-var id="playAnimation-rotation" min="-360" max="360" decimals="4" unit="deg"></number-var>
          <text>Wait</text><select-box id="playAnimation-wait"></select-box>
        </grid-box>
        <button id="playAnimation-confirm" name="confirm">Confirm</button>
        <button id="playAnimation-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*播放音频*/}
    <window-frame id="playAudio">
      <title-bar>Play Audio<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="playAudio-type"></select-box>
          <text>Audio</text><custom-box id="playAudio-audio" type="file" filter="audio"></custom-box>
          <text>Volume</text><number-box id="playAudio-volume" min="0" max="1" step="0.1" decimals="4"></number-box>
        </grid-box>
        <button id="playAudio-confirm" name="confirm">Confirm</button>
        <button id="playAudio-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*停止播放音频*/}
    <window-frame id="stopAudio">
      <title-bar>Stop Audio<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="stopAudio-type"></select-box>
        </grid-box>
        <button id="stopAudio-confirm" name="confirm">Confirm</button>
        <button id="stopAudio-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置音量*/}
    <window-frame id="setVolume">
      <title-bar>Set Volume<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="setVolume-type"></select-box>
          <text>Volume</text><number-var id="setVolume-volume" min="0" max="1" step="0.1" decimals="4"></number-var>
          <text>Easing</text><select-box id="setVolume-easingId"></select-box>
          <text>Duration</text><number-box id="setVolume-duration" min="0" max="3600000" unit="ms"></number-box>
          <text>Wait</text><select-box id="setVolume-wait"></select-box>
        </grid-box>
        <button id="setVolume-confirm" name="confirm">Confirm</button>
        <button id="setVolume-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置声像*/}
    <window-frame id="setPan">
      <title-bar>Set Pan<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="setPan-type"></select-box>
          <text>Pan</text><number-var id="setPan-pan" min="-1" max="1" step="0.1" decimals="4"></number-var>
          <text>Easing</text><select-box id="setPan-easingId"></select-box>
          <text>Duration</text><number-box id="setPan-duration" min="0" max="3600000" unit="ms"></number-box>
          <text>Wait</text><select-box id="setPan-wait"></select-box>
        </grid-box>
        <button id="setPan-confirm" name="confirm">Confirm</button>
        <button id="setPan-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置混响*/}
    <window-frame id="setReverb">
      <title-bar>Set Reverb<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="setReverb-type"></select-box>
          <text>Dry</text><number-var id="setReverb-dry" min="0" max="1" step="0.1" decimals="4"></number-var>
          <text>Wet</text><number-var id="setReverb-wet" min="0" max="1" step="0.1" decimals="4"></number-var>
          <text>Easing</text><select-box id="setReverb-easingId"></select-box>
          <text>Duration</text><number-box id="setReverb-duration" min="0" max="3600000" unit="ms"></number-box>
          <text>Wait</text><select-box id="setReverb-wait"></select-box>
        </grid-box>
        <button id="setReverb-confirm" name="confirm">Confirm</button>
        <button id="setReverb-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置循环*/}
    <window-frame id="setLoop">
      <title-bar>Set Loop<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="setLoop-type"></select-box>
          <text>Loop</text><select-box id="setLoop-loop"></select-box>
        </grid-box>
        <button id="setLoop-confirm" name="confirm">Confirm</button>
        <button id="setLoop-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*保存音频*/}
    <window-frame id="saveAudio">
      <title-bar>Save Audio<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="saveAudio-type"></select-box>
        </grid-box>
        <button id="saveAudio-confirm" name="confirm">Confirm</button>
        <button id="saveAudio-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*恢复音频*/}
    <window-frame id="restoreAudio">
      <title-bar>Restore Audio<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Type</text><select-box id="restoreAudio-type"></select-box>
        </grid-box>
        <button id="restoreAudio-confirm" name="confirm">Confirm</button>
        <button id="restoreAudio-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*创建角色*/}
    <window-frame id="createActor">
      <title-bar>Create Actor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="createActor-actorId" type="file" filter="actor"></custom-box>
          <text>Team</text><select-box id="createActor-teamId"></select-box>
          <text>Position</text><custom-box id="createActor-position" type="position"></custom-box>
          <text>Angle</text><number-var id="createActor-angle" min="-360" max="360" decimals="4" unit="deg"></number-var>
        </grid-box>
        <button id="createActor-confirm" name="confirm">Confirm</button>
        <button id="createActor-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*移动角色*/}
    <window-frame id="moveActor">
      <title-bar>Move Actor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="moveActor-actor" type="actor"></custom-box>
          <text>Mode</text><select-box id="moveActor-mode"></select-box>
          <text>Angle</text><number-var id="moveActor-angle" min="-360" max="360" decimals="4" unit="deg"></number-var>
          <text>Destination</text><custom-box id="moveActor-destination" type="position"></custom-box>
          <text>Wait</text><select-box id="moveActor-wait"></select-box>
        </grid-box>
        <button id="moveActor-confirm" name="confirm">Confirm</button>
        <button id="moveActor-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*跟随角色*/}
    <window-frame id="followActor">
      <title-bar>Follow Actor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="followActor-actor" type="actor"></custom-box>
          <text>Target</text><custom-box id="followActor-target" type="actor"></custom-box>
          <text>Mode</text><select-box id="followActor-mode"></select-box>
          <text>Min Distance</text><number-box id="followActor-minDist" min="0" max="16" decimals="4" unit="tile"></number-box>
          <text>Max Distance</text><number-box id="followActor-maxDist" min="0" max="20" decimals="4" unit="tile"></number-box>
          <text>Offset Ratio</text><number-box id="followActor-offset" min="-0.8" max="0.8" decimals="4" unit="r"></number-box>
          <text>Vert Distance</text><number-box id="followActor-vertDist" min="0" max="4" decimals="4" unit="tile"></number-box>
          <text>Navigate</text><select-box id="followActor-navigate"></select-box>
          <text>Once</text><select-box id="followActor-once"></select-box>
          <text>Wait</text><select-box id="followActor-wait"></select-box>
        </grid-box>
        <button id="followActor-confirm" name="confirm">Confirm</button>
        <button id="followActor-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*平移角色*/}
    <window-frame id="translateActor">
      <title-bar>Translate Actor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="translateActor-actor" type="actor"></custom-box>
          <text>Angle</text><custom-box id="translateActor-angle" type="angle"></custom-box>
          <text>Distance</text><number-var id="translateActor-distance" min="0" max="512" decimals="4" unit="tile"></number-var>
          <text>Easing</text><select-box id="translateActor-easingId"></select-box>
          <text>Duration</text><number-var id="translateActor-duration" min="0" max="3600000" unit="ms"></number-var>
          <text>Wait</text><select-box id="translateActor-wait"></select-box>
        </grid-box>
        <button id="translateActor-confirm" name="confirm">Confirm</button>
        <button id="translateActor-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*增减仇恨值*/}
    <window-frame id="changeThreat">
      <title-bar>Change Threat<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="changeThreat-actor" type="actor"></custom-box>
          <text>Target</text><custom-box id="changeThreat-target" type="actor"></custom-box>
          <text>Operation</text><select-box id="changeThreat-operation"></select-box>
          <text>Threat</text><number-var id="changeThreat-threat" min="0" max="1000000000" decimals="4"></number-var>
        </grid-box>
        <button id="changeThreat-confirm" name="confirm">Confirm</button>
        <button id="changeThreat-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置体重*/}
    <window-frame id="setWeight">
      <title-bar>Set Weight<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="setWeight-actor" type="actor"></custom-box>
          <text>Weight</text><number-var id="setWeight-weight" min="0" max="8" step="0.1" decimals="4"></number-var>
        </grid-box>
        <button id="setWeight-confirm" name="confirm">Confirm</button>
        <button id="setWeight-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置移动速度*/}
    <window-frame id="setMovementSpeed">
      <title-bar>Set Movement Speed<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="setMovementSpeed-actor" type="actor"></custom-box>
          <text>Property</text><select-box id="setMovementSpeed-property"></select-box>
          <text>Base Speed</text><number-var id="setMovementSpeed-base" min="0" max="32" decimals="4" unit="t/s"></number-var>
          <text>Speed Factor</text><number-var id="setMovementSpeed-factor" min="0" max="4" decimals="4"></number-var>
        </grid-box>
        <button id="setMovementSpeed-confirm" name="confirm">Confirm</button>
        <button id="setMovementSpeed-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置角度*/}
    <window-frame id="setAngle">
      <title-bar>Set Angle<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="setAngle-actor" type="actor"></custom-box>
          <text>Angle</text><custom-box id="setAngle-angle" type="angle"></custom-box>
          <text>Easing</text><select-box id="setAngle-easingId"></select-box>
          <text>Duration</text><number-var id="setAngle-duration" min="0" max="3600000" unit="ms"></number-var>
          <text>Wait</text><select-box id="setAngle-wait"></select-box>
        </grid-box>
        <button id="setAngle-confirm" name="confirm">Confirm</button>
        <button id="setAngle-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*固定角度*/}
    <window-frame id="fixAngle">
      <title-bar>Fix Angle<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="fixAngle-actor" type="actor"></custom-box>
          <text>State</text><select-box id="fixAngle-fixed"></select-box>
        </grid-box>
        <button id="fixAngle-confirm" name="confirm">Confirm</button>
        <button id="fixAngle-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置激活状态*/}
    <window-frame id="setActive">
      <title-bar>Set Active<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="setActive-actor" type="actor"></custom-box>
          <text>State</text><select-box id="setActive-active"></select-box>
        </grid-box>
        <button id="setActive-confirm" name="confirm">Confirm</button>
        <button id="setActive-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*删除角色*/}
    <window-frame id="deleteActor">
      <title-bar>Delete Actor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="deleteActor-actor" type="actor"></custom-box>
        </grid-box>
        <button id="deleteActor-confirm" name="confirm">Confirm</button>
        <button id="deleteActor-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置玩家角色*/}
    <window-frame id="setPlayerActor">
      <title-bar>Set Player Actor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Global Actor</text><custom-box id="setPlayerActor-actor" type="actor"></custom-box>
        </grid-box>
        <button id="setPlayerActor-confirm" name="confirm">Confirm</button>
        <button id="setPlayerActor-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置队伍成员*/}
    <window-frame id="setPartyMember">
      <title-bar>Set Party Member<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Operation</text><select-box id="setPartyMember-operation"></select-box>
          <text>Global Actor</text><custom-box id="setPartyMember-actor" type="actor"></custom-box>
        </grid-box>
        <button id="setPartyMember-confirm" name="confirm">Confirm</button>
        <button id="setPartyMember-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*改变角色队伍*/}
    <window-frame id="changeActorTeam">
      <title-bar>Change Actor Team<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="changeActorTeam-actor" type="actor"></custom-box>
          <text>Team</text><select-box id="changeActorTeam-teamId"></select-box>
        </grid-box>
        <button id="changeActorTeam-confirm" name="confirm">Confirm</button>
        <button id="changeActorTeam-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*改变角色状态*/}
    <window-frame id="changeActorState">
      <title-bar>Change Actor State<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="changeActorState-actor" type="actor"></custom-box>
          <text>Operation</text><select-box id="changeActorState-operation"></select-box>
          <text>State</text><custom-box id="changeActorState-stateId" type="file" filter="state"></custom-box>
          <text>State</text><custom-box id="changeActorState-state" type="state"></custom-box>
        </grid-box>
        <button id="changeActorState-confirm" name="confirm">Confirm</button>
        <button id="changeActorState-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*改变角色装备*/}
    <window-frame id="changeActorEquipment">
      <title-bar>Change Actor Equipment<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="changeActorEquipment-actor" type="actor"></custom-box>
          <text>Operation</text><select-box id="changeActorEquipment-operation"></select-box>
          <text>Shortcut Key</text><select-box id="changeActorEquipment-slot"></select-box>
          <text>Equipment</text><custom-box id="changeActorEquipment-equipmentId" type="file" filter="equipment"></custom-box>
          <text>Equipment</text><custom-box id="changeActorEquipment-equipment" type="equipment"></custom-box>
        </grid-box>
        <button id="changeActorEquipment-confirm" name="confirm">Confirm</button>
        <button id="changeActorEquipment-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*改变角色技能*/}
    <window-frame id="changeActorSkill">
      <title-bar>Change Actor Skill<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="changeActorSkill-actor" type="actor"></custom-box>
          <text>Operation</text><select-box id="changeActorSkill-operation"></select-box>
          <text>Skill</text><custom-box id="changeActorSkill-skillId" type="file" filter="skill"></custom-box>
          <text>Skill</text><custom-box id="changeActorSkill-skill" type="skill"></custom-box>
        </grid-box>
        <button id="changeActorSkill-confirm" name="confirm">Confirm</button>
        <button id="changeActorSkill-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*改变角色头像*/}
    <window-frame id="changeActorPortrait">
      <title-bar>Change Actor Portrait<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="changeActorPortrait-actor" type="actor"></custom-box>
          <text>Mode</text><select-box id="changeActorPortrait-mode"></select-box>
          <text>Portrait</text><custom-box id="changeActorPortrait-portrait" type="file" filter="image"></custom-box>
          <text>Clip</text><custom-box id="changeActorPortrait-clip" type="clip" image="changeActorPortrait-portrait"></custom-box>
        </grid-box>
        <button id="changeActorPortrait-confirm" name="confirm">Confirm</button>
        <button id="changeActorPortrait-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*改变角色动画*/}
    <window-frame id="changeActorAnimation">
      <title-bar>Change Actor Animation<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="changeActorAnimation-actor" type="actor"></custom-box>
          <text>Animation</text><custom-box id="changeActorAnimation-animationId" type="file" filter="animation"></custom-box>
        </grid-box>
        <button id="changeActorAnimation-confirm" name="confirm">Confirm</button>
        <button id="changeActorAnimation-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*改变角色精灵图*/}
    <window-frame id="changeActorSprite">
      <title-bar>Change Actor Sprite<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="changeActorSprite-actor" type="actor"></custom-box>
          <text>Animation</text><custom-box id="changeActorSprite-animationId" type="file" filter="animation"></custom-box>
          <text>Sprite Name</text><select-box id="changeActorSprite-spriteId"></select-box>
          <text>Sprite</text><custom-box id="changeActorSprite-image" type="file" filter="image"></custom-box>
        </grid-box>
        <button id="changeActorSprite-confirm" name="confirm">Confirm</button>
        <button id="changeActorSprite-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*映射角色动作*/}
    <window-frame id="remapActorMotion">
      <title-bar>Remap Actor Motion<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="remapActorMotion-actor" type="actor"></custom-box>
          <text>Type</text><select-box id="remapActorMotion-type"></select-box>
          <text>Motion</text><custom-box id="remapActorMotion-motion" type="enum-string"></custom-box>
        </grid-box>
        <button id="remapActorMotion-confirm" name="confirm">Confirm</button>
        <button id="remapActorMotion-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*播放角色动画*/}
    <window-frame id="playActorAnimation">
      <title-bar>Play Actor Animation<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="playActorAnimation-actor" type="actor"></custom-box>
          <text>Motion</text><custom-box id="playActorAnimation-motion" type="enum-string"></custom-box>
          <text>Playback Speed</text><number-var id="playActorAnimation-speed" min="0" max="4" step="0.1" decimals="4"></number-var>
          <text>Wait</text><select-box id="playActorAnimation-wait"></select-box>
        </grid-box>
        <button id="playActorAnimation-confirm" name="confirm">Confirm</button>
        <button id="playActorAnimation-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*停止角色动画*/}
    <window-frame id="stopActorAnimation">
      <title-bar>Play Actor Animation<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="stopActorAnimation-actor" type="actor"></custom-box>
        </grid-box>
        <button id="stopActorAnimation-confirm" name="confirm">Confirm</button>
        <button id="stopActorAnimation-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*创建全局角色*/}
    <window-frame id="createGlobalActor">
      <title-bar>Create Global Actor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="createGlobalActor-actorId" type="file" filter="actor"></custom-box>
          <text>Team</text><select-box id="createGlobalActor-teamId"></select-box>
        </grid-box>
        <button id="createGlobalActor-confirm" name="confirm">Confirm</button>
        <button id="createGlobalActor-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*放置全局角色*/}
    <window-frame id="placeGlobalActor">
      <title-bar>Place Global Actor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="placeGlobalActor-actor" type="actor"></custom-box>
          <text>Position</text><custom-box id="placeGlobalActor-position" type="position"></custom-box>
        </grid-box>
        <button id="placeGlobalActor-confirm" name="confirm">Confirm</button>
        <button id="placeGlobalActor-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*删除全局角色*/}
    <window-frame id="deleteGlobalActor">
      <title-bar>Delete Global Actor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="deleteGlobalActor-actorId" type="file" filter="actor"></custom-box>
        </grid-box>
        <button id="deleteGlobalActor-confirm" name="confirm">Confirm</button>
        <button id="deleteGlobalActor-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*获取目标*/}
    <window-frame id="getTarget">
      <title-bar>Get Target<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="getTarget-actor" type="actor"></custom-box>
          <text>Selector</text><select-box id="getTarget-selector"></select-box>
          <text>Condition</text><select-box id="getTarget-condition"></select-box>
          <text>Attribute</text><select-box id="getTarget-attribute"></select-box>
          <text>Attribute 2</text><select-box id="getTarget-divisor"></select-box>
        </grid-box>
        <button id="getTarget-confirm" name="confirm">Confirm</button>
        <button id="getTarget-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*添加目标*/}
    <window-frame id="appendTarget">
      <title-bar>Append Target<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="appendTarget-actor" type="actor"></custom-box>
          <text>Target</text><custom-box id="appendTarget-target" type="actor"></custom-box>
        </grid-box>
        <button id="appendTarget-confirm" name="confirm">Confirm</button>
        <button id="appendTarget-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*探测目标*/}
    <window-frame id="detectTargets">
      <title-bar>Detect Targets<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="detectTargets-actor" type="actor"></custom-box>
          <text>Distance</text><number-box id="detectTargets-distance" min="0" max="512" decimals="4" unit="tile"></number-box>
          <text>Selector</text><select-box id="detectTargets-selector"></select-box>
          <text>In Sight</text><select-box id="detectTargets-inSight"></select-box>
        </grid-box>
        <button id="detectTargets-confirm" name="confirm">Confirm</button>
        <button id="detectTargets-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*放弃目标*/}
    <window-frame id="discardTargets">
      <title-bar>Discard Targets<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="discardTargets-actor" type="actor"></custom-box>
          <text>Selector</text><select-box id="discardTargets-selector"></select-box>
          <text>Distance</text><number-box id="discardTargets-distance" min="0" max="512" decimals="4" unit="tile"></number-box>
        </grid-box>
        <button id="discardTargets-confirm" name="confirm">Confirm</button>
        <button id="discardTargets-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*重置目标列表*/}
    <window-frame id="resetTargets">
      <title-bar>Reset Targets<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="resetTargets-actor" type="actor"></custom-box>
        </grid-box>
        <button id="resetTargets-confirm" name="confirm">Confirm</button>
        <button id="resetTargets-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*施放技能*/}
    <window-frame id="castSkill">
      <title-bar>Cast Skill<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="castSkill-actor" type="actor"></custom-box>
          <text>Mode</text><select-box id="castSkill-mode"></select-box>
          <text>Shortcut Key</text><select-box id="castSkill-key"></select-box>
          <text>Skill</text><custom-box id="castSkill-skillId" type="file" filter="skill"></custom-box>
          <text>Skill</text><custom-box id="castSkill-skill" type="skill"></custom-box>
          <text>Wait</text><select-box id="castSkill-wait"></select-box>
        </grid-box>
        <button id="castSkill-confirm" name="confirm">Confirm</button>
        <button id="castSkill-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置技能*/}
    <window-frame id="setSkill">
      <title-bar>Set Skill<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Skill</text><custom-box id="setSkill-skill" type="skill"></custom-box>
          <text>Operation</text><select-box id="setSkill-operation"></select-box>
          <text>Cooldown</text><number-var id="setSkill-cooldown" min="1" max="3600000" unit="ms"></number-var>
        </grid-box>
        <button id="setSkill-confirm" name="confirm">Confirm</button>
        <button id="setSkill-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*创建触发器*/}
    <window-frame id="createTrigger">
      <title-bar>Create Trigger<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Trigger</text><custom-box id="createTrigger-triggerId" type="file" filter="trigger"></custom-box>
          <text>Caster</text><custom-box id="createTrigger-caster" type="actor"></custom-box>
          <text>Origin</text><custom-box id="createTrigger-origin" type="position"></custom-box>
          <text>Angle</text><custom-box id="createTrigger-angle" type="angle"></custom-box>
          <text>Distance</text><number-var id="createTrigger-distance" min="-512" max="512" decimals="4" unit="tile"></number-var>
          <text>Global Speed</text><number-var id="createTrigger-timeScale" min="0" max="4" step="0.1" decimals="4"></number-var>
        </grid-box>
        <button id="createTrigger-confirm" name="confirm">Confirm</button>
        <button id="createTrigger-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置触发器速度*/}
    <window-frame id="setTriggerSpeed">
      <title-bar>Set Trigger Speed<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Trigger</text><custom-box id="setTriggerSpeed-trigger" type="trigger"></custom-box>
          <text>Speed</text><number-var id="setTriggerSpeed-speed" min="0" max="512" decimals="4" unit="t/s"></number-var>
        </grid-box>
        <button id="setTriggerSpeed-confirm" name="confirm">Confirm</button>
        <button id="setTriggerSpeed-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置触发器角度*/}
    <window-frame id="setTriggerAngle">
      <title-bar>Set Trigger Angle<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Trigger</text><custom-box id="setTriggerAngle-trigger" type="trigger"></custom-box>
          <text>Angle</text><custom-box id="setTriggerAngle-angle" type="angle"></custom-box>
        </grid-box>
        <button id="setTriggerAngle-confirm" name="confirm">Confirm</button>
        <button id="setTriggerAngle-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置包裹*/}
    <window-frame id="setInventory">
      <title-bar>Set Inventory<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="setInventory-actor" type="actor"></custom-box>
          <text>Operation</text><select-box id="setInventory-operation"></select-box>
          <text>Money</text><number-var id="setInventory-money" min="1" max="100000000"></number-var>
          <text>Item</text><file-var id="setInventory-itemId" type="file" filter="item"></file-var>
          <text>Quantity</text><number-var id="setInventory-quantity" min="1" max="10000"></number-var>
          <text>Equipment</text><file-var id="setInventory-equipmentId" type="file" filter="equipment"></file-var>
          <text>Equipment</text><custom-box id="setInventory-equipment" type="equipment"></custom-box>
          <text>Global Actor</text><custom-box id="setInventory-refActor" type="actor"></custom-box>
        </grid-box>
        <button id="setInventory-confirm" name="confirm">Confirm</button>
        <button id="setInventory-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*使用物品*/}
    <window-frame id="useItem">
      <title-bar>Use Item<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="useItem-actor" type="actor"></custom-box>
          <text>Mode</text><select-box id="useItem-mode"></select-box>
          <text>Shortcut Key</text><select-box id="useItem-key"></select-box>
          <text>Item</text><custom-box id="useItem-itemId" type="file" filter="item"></custom-box>
          <text>Item</text><custom-box id="useItem-item" type="item"></custom-box>
          <text>Wait</text><select-box id="useItem-wait"></select-box>
        </grid-box>
        <button id="useItem-confirm" name="confirm">Confirm</button>
        <button id="useItem-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置物品*/}
    <window-frame id="setItem">
      <title-bar>Set Item<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Item</text><custom-box id="setItem-item" type="item"></custom-box>
          <text>Operation</text><select-box id="setItem-operation"></select-box>
          <text>Quantity</text><number-var id="setItem-quantity" min="1" max="10000"></number-var>
        </grid-box>
        <button id="setItem-confirm" name="confirm">Confirm</button>
        <button id="setItem-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置冷却时间*/}
    <window-frame id="setCooldown">
      <title-bar>Set Cooldown<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="setCooldown-actor" type="actor"></custom-box>
          <text>Operation</text><select-box id="setCooldown-operation"></select-box>
          <text>Cooldown Key</text><select-var id="setCooldown-key"></select-var>
          <text>Cooldown Time</text><number-var id="setCooldown-cooldown" min="1" max="3600000" unit="ms"></number-var>
        </grid-box>
        <button id="setCooldown-confirm" name="confirm">Confirm</button>
        <button id="setCooldown-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置快捷键*/}
    <window-frame id="setShortcut">
      <title-bar>Set Shortcut<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Actor</text><custom-box id="setShortcut-actor" type="actor"></custom-box>
          <text>Operation</text><select-box id="setShortcut-operation"></select-box>
          <text>Shortcut Key</text><select-box id="setShortcut-key"></select-box>
          <text>Item</text><custom-box id="setShortcut-itemId" type="file" filter="item"></custom-box>
          <text>Skill</text><custom-box id="setShortcut-skillId" type="file" filter="skill"></custom-box>
        </grid-box>
        <button id="setShortcut-confirm" name="confirm">Confirm</button>
        <button id="setShortcut-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*激活场景*/}
    <window-frame id="activateScene">
      <title-bar>Activate Scene<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Scene</text><select-box id="activateScene-pointer"></select-box>
        </grid-box>
        <button id="activateScene-confirm" name="confirm">Confirm</button>
        <button id="activateScene-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*加载场景*/}
    <window-frame id="loadScene">
      <title-bar>Load Scene<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Scene</text><file-var id="loadScene-sceneId" type="file" filter="scene"></file-var>
          <text>Transfer Player</text><select-box id="loadScene-transfer"></select-box>
          <text>X</text><number-var id="loadScene-x" min="0" max="512" step="0.5" decimals="4"></number-var>
          <text>Y</text><number-var id="loadScene-y" min="0" max="512" step="0.5" decimals="4"></number-var>
        </grid-box>
        <button id="loadScene-confirm" name="confirm">Confirm</button>
        <button id="loadScene-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*移动摄像机*/}
    <window-frame id="moveCamera">
      <title-bar>Move Camera<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Mode</text><select-box id="moveCamera-mode"></select-box>
          <text>Position</text><custom-box id="moveCamera-position" type="position"></custom-box>
          <text>Actor</text><custom-box id="moveCamera-actor" type="actor"></custom-box>
          <text>Easing</text><select-box id="moveCamera-easingId"></select-box>
          <text>Duration</text><number-box id="moveCamera-duration" min="0" max="3600000" unit="ms"></number-box>
          <text>Wait</text><select-box id="moveCamera-wait"></select-box>
        </grid-box>
        <button id="moveCamera-confirm" name="confirm">Confirm</button>
        <button id="moveCamera-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置缩放率*/}
    <window-frame id="setZoomFactor">
      <title-bar>Set Zoom Factor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Zoom Factor</text><number-var id="setZoomFactor-zoom" min="1" max="8" step="0.1" decimals="4"></number-var>
          <text>Easing</text><select-box id="setZoomFactor-easingId"></select-box>
          <text>Duration</text><number-var id="setZoomFactor-duration" min="0" max="3600000" unit="ms"></number-var>
          <text>Wait</text><select-box id="setZoomFactor-wait"></select-box>
        </grid-box>
        <button id="setZoomFactor-confirm" name="confirm">Confirm</button>
        <button id="setZoomFactor-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置环境光*/}
    <window-frame id="setAmbientLight">
      <title-bar>Set Ambient Light<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Red</text><number-var id="setAmbientLight-red" min="0" max="255" step="5"></number-var>
          <text>Green</text><number-var id="setAmbientLight-green" min="0" max="255" step="5"></number-var>
          <text>Blue</text><number-var id="setAmbientLight-blue" min="0" max="255" step="5"></number-var>
          <text>Easing</text><select-box id="setAmbientLight-easingId"></select-box>
          <text>Duration</text><number-var id="setAmbientLight-duration" min="0" max="3600000" unit="ms"></number-var>
          <text>Wait</text><select-box id="setAmbientLight-wait"></select-box>
        </grid-box>
        <button id="setAmbientLight-confirm" name="confirm">Confirm</button>
        <button id="setAmbientLight-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*改变画面色调*/}
    <window-frame id="tintScreen">
      <title-bar>Tint Screen<close></close></title-bar>
      <content-frame>
        <grid-box id="tintScreen-grid-box">
          <text>Tint - Red</text><number-box id="tintScreen-tint-0" min="-255" max="255" step="5"></number-box>
          <text>Tint - Green</text><number-box id="tintScreen-tint-1" min="-255" max="255" step="5"></number-box>
          <text>Tint - Blue</text><number-box id="tintScreen-tint-2" min="-255" max="255" step="5"></number-box>
          <text>Tint - Gray</text><number-box id="tintScreen-tint-3" min="0" max="255" step="5"></number-box>
          <text>Easing</text><select-box id="tintScreen-easingId"></select-box>
          <text>Duration</text><number-box id="tintScreen-duration" min="0" max="3600000" unit="ms"></number-box>
          <text>Wait</text><select-box id="tintScreen-wait"></select-box>
        </grid-box>
        <filter-box id="tintScreen-filter" width="96" height="160"></filter-box>
        <button id="tintScreen-confirm" name="confirm">Confirm</button>
        <button id="tintScreen-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置游戏速度*/}
    <window-frame id="setGameSpeed">
      <title-bar>Set Game Speed<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Speed</text><number-var id="setGameSpeed-speed" min="0" max="10" step="0.1" decimals="4"></number-var>
          <text>Easing</text><select-box id="setGameSpeed-easingId"></select-box>
          <text>Duration</text><number-var id="setGameSpeed-duration" min="0" max="3600000" unit="ms"></number-var>
          <text>Wait</text><select-box id="setGameSpeed-wait"></select-box>
        </grid-box>
        <button id="setGameSpeed-confirm" name="confirm">Confirm</button>
        <button id="setGameSpeed-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置鼠标指针*/}
    <window-frame id="setCursor">
      <title-bar>Set Cursor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Image</text><custom-box id="setCursor-image" type="file" filter="image"></custom-box>
        </grid-box>
        <button id="setCursor-confirm" name="confirm">Confirm</button>
        <button id="setCursor-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置队伍关系*/}
    <window-frame id="setTeamRelation">
      <title-bar>Change Team Relation<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Team A</text><select-box id="setTeamRelation-teamId1"></select-box>
          <text>Team B</text><select-box id="setTeamRelation-teamId2"></select-box>
          <text>Relation</text><select-box id="setTeamRelation-relation"></select-box>
        </grid-box>
        <button id="setTeamRelation-confirm" name="confirm">Confirm</button>
        <button id="setTeamRelation-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*开关碰撞系统*/}
    <window-frame id="switchCollisionSystem">
      <title-bar>Switch Collision System<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Operation</text><select-box id="switchCollisionSystem-operation"></select-box>
        </grid-box>
        <button id="switchCollisionSystem-confirm" name="confirm">Confirm</button>
        <button id="switchCollisionSystem-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*执行脚本*/}
    <window-frame id="script">
      <title-bar>Run Script<close></close></title-bar>
      <content-frame>
        <text-area id="script-script"></text-area>
        <button id="script-confirm" name="confirm">Confirm</button>
        <button id="script-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*脚本指令*/}
    <window-frame id="scriptCommand">
      <title-bar>Custom Command<close></close></title-bar>
      <content-frame>
        <parameter-pane id="scriptCommand-parameter-pane">
          <detail-box id="scriptCommand-parameter-detail" open>
            <detail-grid id="scriptCommand-parameter-grid"></detail-grid>
          </detail-box>
        </parameter-pane>
        <button id="scriptCommand-confirm" name="confirm">Confirm</button>
        <button id="scriptCommand-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>
  </>
)

export { CommandView }
