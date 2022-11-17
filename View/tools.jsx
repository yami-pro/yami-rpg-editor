'use strict'

import { createElement } from './vhtml/index.js'

const ToolsView = ()=>(
  <>
    {/*窗口环境*/}
    <box id="window-ambient"></box>


    {/*指针区域*/}
    <box id="cursor-region"></box>


    {/*确认窗口*/}
    <window-frame id="confirmation">
      <title-bar><close></close></title-bar>
      <content-frame>
        <text id="confirmation-message"></text>
        <box id="confirmation-button-frame">
          <button id="confirmation-button-0"></button>
          <button id="confirmation-button-1"></button>
          <button id="confirmation-button-2"></button>
        </box>
      </content-frame>
    </window-frame>


    {/*对象属性窗口*/}
    <window-frame id="object-attribute">
      <title-bar>Attribute<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Key</text><select-box id="object-attribute-key"></select-box>
          <text>Boolean</text><select-box id="object-attribute-boolean-value"></select-box>
          <text>Number</text><number-box id="object-attribute-number-value" min="-1000000000" max="1000000000" decimals="6"></number-box>
          <text>String</text><text-area id="object-attribute-string-value"></text-area>
          <text>Option</text><select-box id="object-attribute-enum-value"></select-box>
        </grid-box>
        <button id="object-attribute-confirm" name="confirm">Confirm</button>
        <button id="object-attribute-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*预设对象窗口*/}
    <window-frame id="presetObject" mode="center">
      <title-bar>Object<close></close></title-bar>
      <content-frame>
        <text-box id="presetObject-searcher" name="search"></text-box>
        <node-list id="presetObject-list"></node-list>
        <button id="presetObject-confirm" name="confirm">Confirm</button>
        <button id="presetObject-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*预设元素窗口*/}
    <window-frame id="presetElement" mode="center">
      <title-bar>Element<close></close></title-bar>
      <content-frame>
        <custom-box id="presetElement-uiId" type="file" filter="ui"></custom-box>
        <node-list id="presetElement-list"></node-list>
        <button id="presetElement-confirm" name="confirm">Confirm</button>
        <button id="presetElement-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*图像剪辑窗口*/}
    <window-frame id="imageClip">
      <title-bar>Image Clip<maximize></maximize><close></close></title-bar>
      <content-frame>
        <box id="imageClip-screen" tabindex="-1">
          <img id="imageClip-image"/>
          <marquee-area id="imageClip-marquee"></marquee-area>
        </box>
        <flex-box id="imageClip-flex">
          <number-box id="imageClip-x" min="0" max="10000"><text class="label">X:</text></number-box>
          <number-box id="imageClip-y" min="0" max="10000"><text class="label">Y:</text></number-box>
          <number-box id="imageClip-width" min="0" max="2000"><text class="label">W:</text></number-box>
          <number-box id="imageClip-height" min="0" max="2000"><text class="label">H:</text></number-box>
        </flex-box>
        <button id="imageClip-confirm" name="confirm">Confirm</button>
        <button id="imageClip-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*拾色器*/}
    <window-frame id="color">
      <title-bar>Color Picker<close></close></title-bar>
      <content-frame>
        <canvas id="color-palette-canvas" width="256" height="194"></canvas>
        <box id="color-palette-frame">
          <box id="color-palette-cursor"></box>
        </box>
        <grid-box id="color-index-grid">
          <radio-box name="color-index" value="0"></radio-box>
          <radio-box name="color-index" value="1"></radio-box>
          <radio-box name="color-index" value="2"></radio-box>
          <radio-box name="color-index" value="3"></radio-box>
          <radio-box name="color-index" value="4"></radio-box>
          <radio-box name="color-index" value="5"></radio-box>
          <radio-box name="color-index" value="6"></radio-box>
          <radio-box name="color-index" value="7"></radio-box>
          <radio-box name="color-index" value="8"></radio-box>
          <radio-box name="color-index" value="9"></radio-box>
          <radio-box name="color-index" value="10"></radio-box>
          <radio-box name="color-index" value="11"></radio-box>
          <radio-box name="color-index" value="12"></radio-box>
          <radio-box name="color-index" value="13"></radio-box>
          <radio-box name="color-index" value="14"></radio-box>
          <radio-box name="color-index" value="15"></radio-box>
        </grid-box>
        <canvas id="color-pillar-canvas" width="20" height="256"></canvas>
        <box id="color-pillar-frame">
          <box id="color-pillar-cursor"></box>
        </box>
        <box id="color-viewer-frame">
          <box id="color-viewer"></box>
        </box>
        <grid-box id="color-rgba-grid">
          <text>#</text><text-box id="color-hex"></text-box>
          <text>R</text><number-box id="color-r" min="0" max="255"></number-box>
          <text>G</text><number-box id="color-g" min="0" max="255"></number-box>
          <text>B</text><number-box id="color-b" min="0" max="255"></number-box>
          <text>A</text><number-box id="color-a" min="0" max="255"></number-box>
        </grid-box>
        <button id="color-confirm" name="confirm">Confirm</button>
        <button id="color-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置字体*/}
    <window-frame id="font">
      <title-bar>Set Font<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Font Family</text><text-box id="font-font"></text-box>
        </grid-box>
        <button id="font-confirm" name="confirm">Confirm</button>
        <button id="font-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置字体大小*/}
    <window-frame id="fontSize">
      <title-bar>Set Font Size<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Size</text><number-box id="fontSize-size" min="10" max="400" unit="px"></number-box>
        </grid-box>
        <button id="fontSize-confirm" name="confirm">Confirm</button>
        <button id="fontSize-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置文字位置*/}
    <window-frame id="textPosition">
      <title-bar>Set Text Position<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Axis</text><select-box id="textPosition-axis"></select-box>
          <text>Operation</text><select-box id="textPosition-operation"></select-box>
          <text>Value</text><number-box id="textPosition-value" min="-1000" max="1000" unit="px"></number-box>
        </grid-box>
        <button id="textPosition-confirm" name="confirm">Confirm</button>
        <button id="textPosition-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置文字效果*/}
    <window-frame id="textEffect">
      <title-bar>Set Text Effect<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Effect</text><select-box id="textEffect-type"></select-box>
          <text>Shadow X</text><number-box id="textEffect-shadowOffsetX" min="-9" max="9" unit="px"></number-box>
          <text>Shadow Y</text><number-box id="textEffect-shadowOffsetY" min="-9" max="9" unit="px"></number-box>
          <text>Stroke Width</text><number-box id="textEffect-strokeWidth" min="1" max="20" unit="px"></number-box>
          <text>Effect Color</text><color-box id="textEffect-color"></color-box>
        </grid-box>
        <button id="textEffect-confirm" name="confirm">Confirm</button>
        <button id="textEffect-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置本地变量*/}
    <window-frame id="localVariable">
      <title-bar>Set Local Variable<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Local Variable</text><text-box id="localVariable-key"></text-box>
        </grid-box>
        <button id="localVariable-confirm" name="confirm">Confirm</button>
        <button id="localVariable-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*缩放窗口*/}
    <window-frame id="zoom">
      <title-bar>Zoom<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Zoom Factor</text><number-box id="zoom-factor" min="0.6666" max="2" decimals="4"></number-box>
        </grid-box>
        <button id="zoom-confirm" name="confirm">Confirm</button>
        <button id="zoom-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*重命名窗口*/}
    <window-frame id="rename">
      <title-bar>Rename<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Name</text><text-box id="rename-name"></text-box>
        </grid-box>
        <button id="rename-confirm" name="confirm">Confirm</button>
        <button id="rename-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置键窗口*/}
    <window-frame id="setKey">
      <title-bar>Set Key<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Key</text><text-box id="setKey-key"></text-box>
        </grid-box>
        <button id="setKey-confirm" name="confirm">Confirm</button>
        <button id="setKey-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*设置数量窗口*/}
    <window-frame id="setQuantity">
      <title-bar>Set Quantity<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Quantity</text><number-box id="setQuantity-quantity" min="1"></number-box>
        </grid-box>
        <button id="setQuantity-confirm" name="confirm">Confirm</button>
        <button id="setQuantity-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*数组窗口*/}
    <window-frame id="arrayList" mode="center">
      <title-bar>Array<close></close></title-bar>
      <content-frame>
        <param-list id="arrayList-list"></param-list>
        <button id="arrayList-confirm" name="confirm">Confirm</button>
        <button id="arrayList-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*数组窗口 - 数值*/}
    <window-frame id="arrayList-number">
      <title-bar>Number<close></close></title-bar>
      <content-frame>
        <number-box id="arrayList-number-value" min="-1000000000" max="1000000000" decimals="10"></number-box>
        <button id="arrayList-number-confirm" name="confirm">Confirm</button>
        <button id="arrayList-number-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*数组窗口 - 字符串*/}
    <window-frame id="arrayList-string">
      <title-bar>String<close></close></title-bar>
      <content-frame>
        <text-area id="arrayList-string-value"></text-area>
        <button id="arrayList-string-confirm" name="confirm">Confirm</button>
        <button id="arrayList-string-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>
  </>
)

export { ToolsView }
