'use strict'

import './scene.css'
import { createElement } from '../vhtml/index'

const SceneView = ()=>(
  <>
    {/*移动场景*/}
    <window-frame id="scene-shift">
      <title-bar>Shift<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Shift X</text><number-box id="scene-shift-x" min="-512" max="512"></number-box>
          <text>Shift Y</text><number-box id="scene-shift-y" min="-512" max="512"></number-box>
        </grid-box>
        <button id="scene-shift-confirm" name="confirm">Confirm</button>
        <button id="scene-shift-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*默认对象文件夹*/}
    <window-frame id="object-folder">
      <title-bar>Default Object Folders<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Tilemap</text><text-box id="object-folder-tilemap"></text-box>
          <text>Actor</text><text-box id="object-folder-actor"></text-box>
          <text>Region</text><text-box id="object-folder-region"></text-box>
          <text>Light</text><text-box id="object-folder-light"></text-box>
          <text>Animation</text><text-box id="object-folder-animation"></text-box>
          <text>Particle</text><text-box id="object-folder-particle"></text-box>
          <text>Parallax</text><text-box id="object-folder-parallax"></text-box>
        </grid-box>
        <button id="object-folder-confirm" name="confirm">Confirm</button>
        <button id="object-folder-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>
  </>
)

export { SceneView }
