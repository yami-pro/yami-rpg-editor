"use strict"

import './palette.css'
import { createElement } from '../vhtml/index'

const PaletteView = ()=>(
  <>
    {/*自动图块*/}
    <window-frame id="autoTile">
      <title-bar>Auto Tile<close></close></title-bar>
      <content-frame>
        <field-set id="autoTile-general-fieldset">
          <legend>General</legend>
          <grid-box id="autoTile-general-grid">
            <text>Image</text><custom-box id="autoTile-image" type="file" filter="image"></custom-box>
            <text>Offset X</text><number-box id="autoTile-x" min="0" max="255"></number-box>
            <text>Offset Y</text><number-box id="autoTile-y" min="0" max="255"></number-box>
          </grid-box>
        </field-set>
        <field-set id="autoTile-templates-fieldset" class="input pad">
          <legend>Templates</legend>
          <node-list id="autoTile-templates" padded></node-list>
        </field-set>
        <field-set id="autoTile-nodes-fieldset" class="input pad">
          <legend>Tiles</legend>
          <common-list id="autoTile-nodes"></common-list>
        </field-set>
        <field-set id="autoTile-canvas-fieldset">
          <legend>View</legend>
          <canvas id="autoTile-canvas" width="128" height="128"></canvas>
        </field-set>
        <field-set id="autoTile-rule-fieldset">
          <legend>Neighbors</legend>
          <grid-box id="autoTile-rule-grid">
            <switch-item id="autoTile-rule-1" class="autoTile-switch autoTile-neighbor" length="3"></switch-item>
            <switch-item id="autoTile-rule-2" class="autoTile-switch autoTile-neighbor" length="3"></switch-item>
            <switch-item id="autoTile-rule-3" class="autoTile-switch autoTile-neighbor" length="3"></switch-item>
            <switch-item id="autoTile-rule-0" class="autoTile-switch autoTile-neighbor" length="3"></switch-item>
            <empty></empty>
            <switch-item id="autoTile-rule-4" class="autoTile-switch autoTile-neighbor" length="3"></switch-item>
            <switch-item id="autoTile-rule-7" class="autoTile-switch autoTile-neighbor" length="3"></switch-item>
            <switch-item id="autoTile-rule-6" class="autoTile-switch autoTile-neighbor" length="3"></switch-item>
            <switch-item id="autoTile-rule-5" class="autoTile-switch autoTile-neighbor" length="3"></switch-item>
          </grid-box>
        </field-set>
        <field-set id="autoTile-frames-fieldset" class="input pad">
          <legend>Frames</legend>
          <common-list id="autoTile-frames"></common-list>
        </field-set>
        <button id="autoTile-confirm" name="confirm">Confirm</button>
        <button id="autoTile-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*自动图块 - 生成动画帧窗口*/}
    <window-frame id="autoTile-generateFrames">
      <title-bar>Generate Frames<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Stride X</text><number-box id="autoTile-generateFrames-strideX" min="-128" max="128"></number-box>
          <text>Stride Y</text><number-box id="autoTile-generateFrames-strideY" min="-128" max="128"></number-box>
          <text>Count</text><number-box id="autoTile-generateFrames-count" min="1" max="255"></number-box>
        </grid-box>
        <button id="autoTile-generateFrames-confirm" name="confirm">Confirm</button>
        <button id="autoTile-generateFrames-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*自动图块 - 动画帧索引窗口*/}
    <window-frame id="autoTile-frameIndex">
      <title-bar>Tile Index<close></close></title-bar>
      <content-frame>
        <box id="autoTile-frameIndex-screen">
          <box id="autoTile-frameIndex-image-clip">
            <img id="autoTile-frameIndex-image"/>
            <box id="autoTile-frameIndex-mask"></box>
          </box>
          <marquee-area id="autoTile-frameIndex-marquee"></marquee-area>
          <text id="autoTile-frameIndex-info"></text>
        </box>
      </content-frame>
    </window-frame>


    {/*自动图块 - 选择节点窗口*/}
    <window-frame id="autoTile-selectNode">
      <title-bar>Tile Node<close></close></title-bar>
      <content-frame>
        <canvas id="autoTile-selectNode-canvas" width="0" height="0"></canvas>
        <box id="autoTile-selectNode-screen">
          <marquee-area id="autoTile-selectNode-marquee"></marquee-area>
        </box>
      </content-frame>
    </window-frame>
  </>
)

export { PaletteView }
