'use strict'

import { createElement } from './vhtml/index.js'
import { LayoutPageManager } from './layout-page-manager.jsx'

const LayoutContent = () => {
  const LayoutNav = () => (
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
  )

  return (
    <box id="layout-content">
      <LayoutNav />
      <LayoutPageManager />
    </box>
  )
}

export { LayoutContent }
