'use strict'

import './content.css'
import { createElement } from '../vhtml/index.js'
import { AnimationView } from '../animation.jsx'
import { InspectorView } from '../inspector.jsx'
import { UIView } from '../ui.jsx'
import { ParticleView } from '../particle.jsx'

const LayoutContentView = ()=>(
  <>
    {/*布局内容*/}
    <box id="layout-content">
      <nav-bar id="layout-nav">
        <nav-item value="project"><nav-icon>&#xf07b;</nav-icon><nav-text id="nav-project">Project</nav-text></nav-item>
        <nav-item value="scene"><nav-icon>&#xf26c;</nav-icon><nav-text id="nav-scene">Scene</nav-text></nav-item>
        <nav-item value="scene-object"><nav-icon>&#xf1b2;</nav-icon><nav-text id="nav-scene-object">Object</nav-text></nav-item>
        <nav-item value="ui"><nav-icon>&#xf26c;</nav-icon><nav-text id="nav-ui">UI</nav-text></nav-item>
        <nav-item value="ui-element"><nav-icon>&#xf1b2;</nav-icon><nav-text id="nav-ui-element">Element</nav-text></nav-item>
        <nav-item value="animation"><nav-icon>&#xf26c;</nav-icon><nav-text id="nav-animation">Animation</nav-text></nav-item>
        <nav-item value="animation-motion"><nav-icon>&#xf1b2;</nav-icon><nav-text id="nav-animation-motion">Motion</nav-text></nav-item>
        <nav-item value="animation-timeline"><nav-icon>&#xf017;</nav-icon><nav-text id="nav-animation-timeline">Timeline</nav-text></nav-item>
        <nav-item value="animation-easing"><nav-icon>&#xf201;</nav-icon><nav-text id="nav-animation-easing">Easing</nav-text></nav-item>
        <nav-item value="particle"><nav-icon>&#xf26c;</nav-icon><nav-text id="nav-particle">Particle</nav-text></nav-item>
        <nav-item value="particle-layer"><nav-icon>&#xf1b2;</nav-icon><nav-text id="nav-particle-layer">Layer</nav-text></nav-item>
        <nav-item value="inspector"><nav-icon>&#xf05a;</nav-icon><nav-text id="nav-inspector">Inspector</nav-text></nav-item>
      </nav-bar>
      <page-manager id="layout-page-manager">

        {/*项目页面*/}
        <page-frame id="project" value="project">
          <file-browser id="project-browser"></file-browser>
        </page-frame>

        {/*场景页面*/}
        <page-frame id="scene" value="scene">
          <box id="scene-head">
            <box id="scene-head-start">
              <item id="scene-switch-grid" class="toolbar-item" value="grid"></item>
              <item id="scene-switch-light" class="toolbar-item" value="light"></item>
              <item id="scene-switch-animation" class="toolbar-item" value="animation"></item>
              <item id="scene-switch-settings" class="toolbar-item" value="settings"></item>
            </box>
            <box id="scene-head-center">
              <box id="scene-layer">
                <item id="scene-layer-object" class="toolbar-item" value="object"></item>
                <item id="scene-layer-tilemap-1" class="toolbar-item hidden" value="1"></item>
                <item id="scene-layer-tilemap-2" class="toolbar-item hidden" value="2"></item>
                <item id="scene-layer-tilemap-3" class="toolbar-item hidden" value="3"></item>
                <item id="scene-layer-tilemap-4" class="toolbar-item hidden" value="4"></item>
                <item id="scene-layer-tilemap-5" class="toolbar-item hidden" value="5"></item>
                <item id="scene-layer-tilemap-6" class="toolbar-item hidden" value="6"></item>
                <item id="scene-layer-terrain" class="toolbar-item" value="terrain"></item>
              </box>
              <box id="scene-brush">
                <item id="scene-brush-eraser" class="toolbar-item" value="eraser"></item>
                <item id="scene-brush-pencil" class="toolbar-item" value="pencil"></item>
                <item id="scene-brush-rect" class="toolbar-item" value="rect"></item>
                <item id="scene-brush-oval" class="toolbar-item" value="oval"></item>
                <item id="scene-brush-fill" class="toolbar-item" value="fill"></item>
              </box>
            </box>
            <box id="scene-head-end">
              <slider-box id="scene-zoom" name="zoom" min="0" max="4" active-wheel></slider-box>
            </box>
          </box>
          <box id="scene-body">
            <box id="scene-screen" tabindex="-1">
              <marquee-area id="scene-marquee"></marquee-area>
            </box>
            <text id="scene-info"></text>
          </box>
        </page-frame>

        {/*场景对象列表页面*/}
        <page-frame id="scene-object" value="scene-object">
          <box id="scene-list-head">
            <text-box id="scene-searcher" name="search"></text-box>
          </box>
          <node-list id="scene-list" padded></node-list>
        </page-frame>

        <UIView />
        <AnimationView />
        <ParticleView />
        <InspectorView />
      </page-manager>
    </box>
  </>
)

export { LayoutContentView }
