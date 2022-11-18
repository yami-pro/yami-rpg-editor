'use strict'

import './particle.css'
import { createElement } from './vhtml/index.js'

const ParticleView = ()=>(
  <>
    {/*粒子页面*/}
    <page-frame id="particle" value="particle">
      <box id="particle-head">
        <box id="particle-head-start">
          <item id="particle-view-wireframe" class="toolbar-item" value="wireframe"></item>
          <item id="particle-view-anchor" class="toolbar-item" value="anchor"></item>
        </box>
        <box id="particle-head-center">
          <box id="particle-control">
            <item id="particle-control-restart" class="toolbar-item" value="restart"></item>
            <item id="particle-control-pause" class="toolbar-item" value="pause"></item>
          </box>
          <number-box id="particle-speed" min="0" max="4" step="0.05" decimals="2"><text class="label">speed:</text></number-box>
          <number-box id="particle-duration" min="0" max="60000" unit="ms"><text class="label">duration:</text></number-box>
        </box>
        <box id="particle-head-end">
          <slider-box id="particle-zoom" name="zoom" min="0" max="4" active-wheel></slider-box>
        </box>
      </box>
      <box id="particle-body">
        <box id="particle-screen" tabindex="-1">
          <marquee-area id="particle-marquee"></marquee-area>
        </box>
        <text id="particle-info"></text>
      </box>
    </page-frame>


    {/*粒子图层列表页面*/}
    <page-frame id="particle-layer" value="particle-layer">
      <node-list id="particle-list" padded></node-list>
    </page-frame>
  </>
)

export { ParticleView }
