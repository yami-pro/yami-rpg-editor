'use strict'

import './data.css'
import { createElement } from '../vhtml/index'

const DataView = ()=>(
  <>
    {/*项目设置窗口*/}
    <window-frame id="project-settings">
      <title-bar>Project Settings<close></close></title-bar>
      <content-frame>
        <box id="project-page">
          <box id="project-grid-box">
            <text id="config-window-summary" class="project-summary">Window</text>
            <text class="project-label">Title</text><text-box id="config-window-title"></text-box>
            <text class="project-label">Width</text><number-box id="config-window-width" min="240" max="3840" unit="px"></number-box>
            <text class="project-label">Height</text><number-box id="config-window-height" min="240" max="3840" unit="px"></number-box>
            <text class="project-label">Display</text><select-box id="config-window-display"></select-box>
            <text id="config-resolution-summary" class="project-summary">Virtual Resolution</text>
            <text class="project-label">Width</text><number-box id="config-resolution-width" min="240" max="3840" unit="px"></number-box>
            <text class="project-label">Height</text><number-box id="config-resolution-height" min="240" max="3840" unit="px"></number-box>
            <text id="config-scene-summary" class="project-summary">Scene</text>
            <text class="project-label">Padding</text><number-box id="config-scene-padding" min="0" max="3840" unit="px"></number-box>
            <text class="project-label">Animation Interval</text><number-box id="config-scene-animationInterval" min="0" max="1000" unit="ms"></number-box>
            <text id="config-tileArea-summary" class="project-summary">Tile Rendering Area</text>
            <text class="project-label">Expansion Top</text><number-box id="config-tileArea-expansionTop" min="0" max="400" unit="px"></number-box>
            <text class="project-label">Expansion Left</text><number-box id="config-tileArea-expansionLeft" min="0" max="400" unit="px"></number-box>
            <text class="project-label">Expansion Right</text><number-box id="config-tileArea-expansionRight" min="0" max="400" unit="px"></number-box>
            <text class="project-label">Expansion Bottom</text><number-box id="config-tileArea-expansionBottom" min="0" max="400" unit="px"></number-box>
            <text id="config-animationArea-summary" class="project-summary">Animation Rendering Area</text>
            <text class="project-label">Expansion Top</text><number-box id="config-animationArea-expansionTop" min="0" max="800" unit="px"></number-box>
            <text class="project-label">Expansion Left</text><number-box id="config-animationArea-expansionLeft" min="0" max="800" unit="px"></number-box>
            <text class="project-label">Expansion Right</text><number-box id="config-animationArea-expansionRight" min="0" max="800" unit="px"></number-box>
            <text class="project-label">Expansion Bottom</text><number-box id="config-animationArea-expansionBottom" min="0" max="800" unit="px"></number-box>
            <text id="config-lightArea-summary" class="project-summary">Light Rendering Area</text>
            <text class="project-label">Expansion Top</text><number-box id="config-lightArea-expansionTop" min="0" max="400" unit="px"></number-box>
            <text class="project-label">Expansion Left</text><number-box id="config-lightArea-expansionLeft" min="0" max="400" unit="px"></number-box>
            <text class="project-label">Expansion Right</text><number-box id="config-lightArea-expansionRight" min="0" max="400" unit="px"></number-box>
            <text class="project-label">Expansion Bottom</text><number-box id="config-lightArea-expansionBottom" min="0" max="400" unit="px"></number-box>
            <text id="config-collision-summary" class="project-summary">Collision System</text>
            <text class="project-label">Actor Collision</text><select-box id="config-collision-actor-enabled"></select-box>
            <text class="project-label">Ignore Team Member</text><select-box id="config-collision-actor-ignoreTeamMember"></select-box>
            <text class="project-label">Scene Collision</text><select-box id="config-collision-scene-enabled"></select-box>
            <text class="project-label">Scene Collision Size</text><number-box id="config-collision-scene-actorSize" min="0.5" max="1" step="0.1" decimals="4"></number-box>
            <text id="config-font-summary" class="project-summary">Font</text>
            <text class="project-label">Imports</text><param-list id="config-font-imports" flexible></param-list>
            <text class="project-label">Default</text><text-box id="config-font-default"></text-box>
            <text class="project-label">Pixelated</text><select-box id="config-font-pixelated"></select-box>
            <text class="project-label">Threshold</text><number-box id="config-font-threshold" min="1" max="255" unit="alpha"></number-box>
            <text id="config-event-summary" class="project-summary">Special Events</text>
            <text class="project-label">Startup</text><custom-box id="config-event-startup" type="file" filter="event"></custom-box>
            <text class="project-label">Load Game</text><custom-box id="config-event-loadGame" type="file" filter="event"></custom-box>
            <text class="project-label">Init Scene</text><custom-box id="config-event-initScene" type="file" filter="event"></custom-box>
            <text class="project-label">Show Text</text><custom-box id="config-event-showText" type="file" filter="event"></custom-box>
            <text class="project-label">Show Choices</text><custom-box id="config-event-showChoices" type="file" filter="event"></custom-box>
            <text id="config-actor-summary" class="project-summary">Actor</text>
            <text class="project-label">Player Team</text><select-box id="config-actor-playerTeam"></select-box>
            <text class="project-label">Player Actor</text><custom-box id="config-actor-playerActor" type="file" filter="actor"></custom-box>
            <text class="project-label">Party Member 1</text><custom-box id="config-actor-partyMembers-0" type="file" filter="actor"></custom-box>
            <text class="project-label">Party Member 2</text><custom-box id="config-actor-partyMembers-1" type="file" filter="actor"></custom-box>
            <text class="project-label">Party Member 3</text><custom-box id="config-actor-partyMembers-2" type="file" filter="actor"></custom-box>
            <text class="project-label">Party Member 4</text><custom-box id="config-actor-partyMembers-3" type="file" filter="actor"></custom-box>
            <text class="project-label">Party Inventory Mode</text><select-box id="config-actor-partyInventory"></select-box>
            <text class="project-label">Temporary Attributes</text><param-list id="config-actor-tempAttributes" group="actor" flexible></param-list>
            <text id="config-animation-summary" class="project-summary">Animation</text>
            <text class="project-label">Frame Rate</text><number-box id="config-animation-frameRate" min="1" max="240" unit="fps"></number-box>
            <text id="config-script-summary" class="project-summary">Script</text>
            <text class="project-label">Default Scripting Language</text><select-box id="config-script-language"></select-box>
            <text class="project-label">Output Directory</text><text-box id="config-script-outDir"></text-box>
          </box>
        </box>
        <button id="project-confirm" name="confirm">Confirm</button>
        <button id="project-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*过渡窗口*/}
    <window-frame id="easing">
      <title-bar>Easing<close></close></title-bar>
      <content-frame>
        <field-set id="easing-list-fieldset" class="input pad">
          <legend>List</legend>
          <node-list id="easing-list" padded></node-list>
        </field-set>
        <field-set id="easing-points-fieldset">
          <legend>Points</legend>
          <grid-box id="easing-points-grid">
            <text>Mode</text><select-box id="easing-mode"></select-box>
            <text>Point 1</text>
            <number-box id="easing-points-0-x" min="0" max="1" step="0.01" decimals="2"><text class="label">X</text></number-box>
            <number-box id="easing-points-0-y" min="-5" max="5" step="0.01" decimals="2"><text class="label">Y</text></number-box>
            <text>Point 2</text>
            <number-box id="easing-points-1-x" min="0" max="1" step="0.01" decimals="2"><text class="label">X</text></number-box>
            <number-box id="easing-points-1-y" min="-5" max="5" step="0.01" decimals="2"><text class="label">Y</text></number-box>
            <text>Point 3</text>
            <number-box id="easing-points-2-x" min="0" max="1" step="0.01" decimals="2"><text class="label">X</text></number-box>
            <number-box id="easing-points-2-y" min="-5" max="5" step="0.01" decimals="2"><text class="label">Y</text></number-box>
            <text>Point 4</text>
            <number-box id="easing-points-3-x" min="0" max="1" step="0.01" decimals="2"><text class="label">X</text></number-box>
            <number-box id="easing-points-3-y" min="-5" max="5" step="0.01" decimals="2"><text class="label">Y</text></number-box>
            <text>Point 5</text>
            <number-box id="easing-points-4-x" min="0" max="1" step="0.01" decimals="2"><text class="label">X</text></number-box>
            <number-box id="easing-points-4-y" min="-5" max="5" step="0.01" decimals="2"><text class="label">Y</text></number-box>
            <text>Point 6</text>
            <number-box id="easing-points-5-x" min="0" max="1" step="0.01" decimals="2"><text class="label">X</text></number-box>
            <number-box id="easing-points-5-y" min="-5" max="5" step="0.01" decimals="2"><text class="label">Y</text></number-box>
            <text>Point 7</text>
            <number-box id="easing-points-6-x" min="0" max="1" step="0.01" decimals="2"><text class="label">X</text></number-box>
            <number-box id="easing-points-6-y" min="-5" max="5" step="0.01" decimals="2"><text class="label">Y</text></number-box>
            <text>Point 8</text>
            <number-box id="easing-points-7-x" min="0" max="1" step="0.01" decimals="2"><text class="label">X</text></number-box>
            <number-box id="easing-points-7-y" min="-5" max="5" step="0.01" decimals="2"><text class="label">Y</text></number-box>
          </grid-box>
        </field-set>
        <field-set id="easing-curve-fieldset">
          <legend>Curve</legend>
          <canvas id="easing-curve-canvas" width="0" height="0" tabindex="-1"></canvas>
          <radio-box name="easing-scale" value="1">100%</radio-box>
          <radio-box name="easing-scale" value="0.5">50%</radio-box>
        </field-set>
        <field-set id="easing-preview-fieldset">
          <legend>Preview</legend>
          <canvas id="easing-preview-canvas" width="0" height="0"></canvas>
          <grid-box id="easing-preview-grid">
            <text>Reverse</text><select-box id="easing-preview-reverse"></select-box>
            <text>Duration</text><number-box id="easing-preview-duration" min="1" max="60000" unit="ms"></number-box>
            <text>Wait</text><number-box id="easing-preview-delay" min="0" max="5000" unit="ms"></number-box>
          </grid-box>
        </field-set>
        <button id="easing-confirm" name="confirm">Confirm</button>
        <button id="easing-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*队伍窗口*/}
    <window-frame id="team">
      <title-bar>Team<close></close></title-bar>
      <content-frame>
        <field-set id="team-list-fieldset" class="input pad">
          <node-list id="team-list"></node-list>
        </field-set>
        <button id="team-confirm" name="confirm">Confirm</button>
        <button id="team-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>
  </>
)

export { DataView }
