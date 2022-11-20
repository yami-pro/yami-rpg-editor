'use strict'

import './ui.css'
import { createElement } from '../vhtml/index.js'

const UIView = ()=>(
  <>
    {/*界面页面*/}
    <page-frame id="ui" value="ui">
      <box id="ui-head">
        <box id="ui-head-start">
          <item id="ui-switch-settings" class="toolbar-item" value="settings"></item>
        </box>
        <box id="ui-head-center">
          <item id="ui-element-image" class="toolbar-item" value="image"></item>
          <item id="ui-element-text" class="toolbar-item" value="text"></item>
          <item id="ui-element-textbox" class="toolbar-item" value="textbox"></item>
          <item id="ui-element-dialogbox" class="toolbar-item" value="dialogbox"></item>
          <item id="ui-element-progressbar" class="toolbar-item" value="progressbar"></item>
          <item id="ui-element-video" class="toolbar-item" value="video"></item>
          <item id="ui-element-window" class="toolbar-item" value="window"></item>
          <item id="ui-element-container" class="toolbar-item" value="container"></item>
        </box>
        <box id="ui-head-end">
          <slider-box id="ui-zoom" name="zoom" min="0" max="4" active-wheel></slider-box>
        </box>
      </box>
      <box id="ui-body">
        <box id="ui-screen" tabindex="-1">
          <marquee-area id="ui-marquee"></marquee-area>
        </box>
      </box>
    </page-frame>


    {/*界面元素列表页面*/}
    <page-frame id="ui-element" value="ui-element">
      <box id="ui-list-head">
        <text-box id="ui-searcher" name="search"></text-box>
      </box>
      <node-list id="ui-list" padded></node-list>
    </page-frame>
  </>
)

export { UIView }
