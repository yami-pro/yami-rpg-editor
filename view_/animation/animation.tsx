"use strict"

import './animation.css'
import { createElement } from '../vhtml/index'

const AnimationView = ()=>(
  <>
    {/*动画页面*/}
    <page-frame id="animation" value="animation">
      <box id="animation-head">
        <box id="animation-head-start">
          <item id="animation-switch-mark" class="toolbar-item" value="mark"></item>
          <item id="animation-switch-onionskin" class="toolbar-item" value="onionskin"></item>
          <item id="animation-switch-mirror" class="toolbar-item" value="mirror"></item>
          <item id="animation-switch-settings" class="toolbar-item" value="settings"></item>
        </box>
        <box id="animation-head-center">
          <number-box id="animation-speed" min="0" max="4" step="0.05" decimals="2"><text class="label">speed:</text></number-box>
        </box>
        <box id="animation-head-end">
          <slider-box id="animation-zoom" name="zoom" min="0" max="4" active-wheel></slider-box>
        </box>
      </box>
      <box id="animation-body">
        <box id="animation-screen" tabindex="-1">
          <marquee-area id="animation-marquee"></marquee-area>
        </box>
        <box id="animation-dirList"></box>
      </box>
    </page-frame>


    {/*动画动作列表页面*/}
    <page-frame id="animation-motion" value="animation-motion">
      <box id="animation-list-head">
        <text-box id="animation-searcher" name="search"></text-box>
      </box>
      <node-list id="animation-list" padded></node-list>
    </page-frame>


    {/*动画时间轴页面*/}
    <page-frame id="animation-timeline" value="animation-timeline">
      <box id="animation-timeline-head">
        <box id="animation-timeline-toolbar">
          <item id="animation-timeline-previousKey" class="toolbar-item" value="previousKey"></item>
          <item id="animation-timeline-previous" class="toolbar-item" value="previous"></item>
          <item id="animation-timeline-play" class="toolbar-item" value="play"></item>
          <item id="animation-timeline-next" class="toolbar-item" value="next"></item>
          <item id="animation-timeline-nextKey" class="toolbar-item" value="nextKey"></item>
          <item id="animation-timeline-loop" class="toolbar-item" value="loop"></item>
        </box>
        <box id="animation-timeline-ruler-outer">
          <box id="animation-timeline-ruler-inner"></box>
        </box>
      </box>
      <node-list id="animation-layer-list"></node-list>
      <box id="animation-timeline-list-outer" tabindex="0">
        <box id="animation-timeline-list-inner"></box>
        <box id="animation-timeline-cursor"></box>
        <box id="animation-timeline-marquee"></box>
        <box id="animation-timeline-marquee-shift"></box>
      </box>
      <box id="animation-timeline-pointer-area-outer">
        <box id="animation-timeline-pointer-area-inner">
          <box id="animation-timeline-pointer"></box>
        </box>
      </box>
    </page-frame>


    {/*动画过渡页面*/}
    <page-frame id="animation-easing" value="animation-easing">
      <box id="animation-easing-head">
        <item id="animation-easing-settings" class="toolbar-item" value="bezier"></item>
        <select-box id="animation-easing-id"></select-box>
      </box>
      <canvas id="animation-easing-canvas" width="0" height="0"></canvas>
    </page-frame>
  </>
)

export { AnimationView }
