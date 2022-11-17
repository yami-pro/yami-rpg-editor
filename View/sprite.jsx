'use strict'

import { createElement } from './vhtml/index.js'

const SpriteView = ()=>(
  <>
    {/*精灵窗口*/}
    <box id="sprite-body">
      <box id="sprite-frame">
        <canvas id="sprite-canvas" width="0" height="0"></canvas>
        <box id="sprite-screen" tabindex="-1">
          <marquee-area id="sprite-marquee"></marquee-area>
        </box>
      </box>
    </box>
  </>
)

export { SpriteView }
