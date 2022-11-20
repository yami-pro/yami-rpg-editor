'use strict'

import './inspector.css'
import { createElement } from '../vhtml/index'
import { SpriteView } from '../sprite/sprite'

const InspectorView = ()=>(
  <>
    {/*检查器页面*/}
    <page-frame id="inspector" value="inspector">
      <page-manager id="inspector-page-manager" tabindex="-1">
        {/*文件 - 场景*/}
        <page-frame value="fileScene">
          <detail-box open>
            <detail-summary>Scene</detail-summary>
            <detail-grid id="fileScene-general-grid">
              <text>Width</text><number-box id="fileScene-width" min="0" max="512" unit="tile"></number-box>
              <text>Height</text><number-box id="fileScene-height" min="0" max="512" unit="tile"></number-box>
              <text>Tile Width</text><number-box id="fileScene-tileWidth" min="16" max="256" unit="px"></number-box>
              <text>Tile Height</text><number-box id="fileScene-tileHeight" min="16" max="256" unit="px"></number-box>
              <text>Contrast</text>
              <flex-box id="fileScene-contrast-box">
                <slider-box id="fileScene-contrast-slider" min="1" max="1.5" step="0.05"></slider-box>
                <number-box id="fileScene-contrast" min="1" max="1.5" step="0.05" decimals="4"></number-box>
              </flex-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Ambient Light</detail-summary>
            <detail-grid id="fileScene-ambient-grid">
              <text>Red</text>
              <flex-box id="fileScene-ambient-red-box">
                <slider-box id="fileScene-ambient-red-slider" min="0" max="255" step="5"></slider-box>
                <number-box id="fileScene-ambient-red" min="0" max="255" step="5"></number-box>
              </flex-box>
              <text>Green</text>
              <flex-box id="fileScene-ambient-green-box">
                <slider-box id="fileScene-ambient-green-slider" min="0" max="255" step="5"></slider-box>
                <number-box id="fileScene-ambient-green" min="0" max="255" step="5"></number-box>
              </flex-box>
              <text>Blue</text>
              <flex-box id="fileScene-ambient-blue-box">
                <slider-box id="fileScene-ambient-blue-slider" min="0" max="255" step="5"></slider-box>
                <number-box id="fileScene-ambient-blue" min="0" max="255" step="5"></number-box>
              </flex-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Events</detail-summary>
            <param-list id="fileScene-events" class="inspector-list" filter="scene" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Scripts</detail-summary>
            <param-list id="fileScene-scripts" class="inspector-list" flexible></param-list>
          </detail-box>
          <parameter-pane id="fileScene-parameter-pane"></parameter-pane>
        </page-frame>

        {/*文件 - 界面*/}
        <page-frame value="fileUI">
          <detail-box open>
            <detail-summary>Stage Foreground</detail-summary>
            <detail-grid id="fileUI-foreground-grid">
              <text>Width</text><number-box id="fileUI-width" min="8" max="3840" unit="px"></number-box>
              <text>Height</text><number-box id="fileUI-height" min="8" max="3840" unit="px"></number-box>
            </detail-grid>
          </detail-box>
        </page-frame>

        {/*文件 - 动画*/}
        <page-frame value="fileAnimation">
          <detail-box open>
            <detail-summary>Sprites</detail-summary>
            <param-list id="fileAnimation-sprites" class="inspector-list" flexible></param-list>
          </detail-box>
        </page-frame>

        {/*文件 - 图块组*/}
        <page-frame id="fileTileset" value="fileTileset">
          <box id="palette-head">
            <box id="palette-head-start">
              <item id="palette-scroll" class="toolbar-item" value="scroll"></item>
              <item id="palette-edit" class="toolbar-item" value="edit"></item>
              <item id="palette-flip" class="toolbar-item" value="flip"></item>
            </box>
            <slider-box id="palette-zoom" name="zoom" min="0" max="4"></slider-box>
          </box>
          <box id="palette-body">
            <box id="palette-frame">
              <canvas id="palette-canvas" width="0" height="0"></canvas>
              <box id="palette-screen" tabindex="-1">
                <marquee-area id="palette-marquee"></marquee-area>
              </box>
            </box>
          </box>
          <detail-box id="fileTileset-general-detail" open>
            <detail-summary>Tileset</detail-summary>
            <detail-grid id="fileTileset-general-grid">
              <text>Image</text><custom-box id="fileTileset-image" type="file" filter="image"></custom-box>
              <text>Width</text><number-box id="fileTileset-width" min="1" max="256" unit="tile"></number-box>
              <text>Height</text><number-box id="fileTileset-height" min="1" max="256" unit="tile"></number-box>
              <text>Tile Width</text><number-box id="fileTileset-tileWidth" min="16" max="256" unit="px"></number-box>
              <text>Tile Height</text><number-box id="fileTileset-tileHeight" min="16" max="256" unit="px"></number-box>
              <text>Tile Offset X</text><number-box id="fileTileset-globalOffsetX" min="-256" max="256" unit="px"></number-box>
              <text>Tile Offset Y</text><number-box id="fileTileset-globalOffsetY" min="-256" max="256" unit="px"></number-box>
              <text>Tile Priority</text><number-box id="fileTileset-globalPriority" min="-10" max="10" decimals="4"></number-box>
            </detail-grid>
          </detail-box>
        </page-frame>
        <page-frame value="fileActor">
          <detail-box open>
            <detail-summary>General</detail-summary>
            <detail-grid id="fileActor-general-grid">
              <text>Portrait</text><custom-box id="fileActor-portrait" type="file" filter="image"></custom-box>
              <text>Clip</text><custom-box id="fileActor-clip" type="clip" image="fileActor-portrait"></custom-box>
              <text>Animation</text><custom-box id="fileActor-animationId" type="file" filter="animation"></custom-box>
              <text>Idle Motion</text><select-box id="fileActor-idleMotion"></select-box>
              <text>Move Motion</text><select-box id="fileActor-moveMotion"></select-box>
              <text>Movement Speed</text><number-box id="fileActor-speed" min="0" max="32" decimals="4" unit="t/s"></number-box>
              <text>Collision Size</text><number-box id="fileActor-size" min="0" max="4" step="0.1" decimals="4" unit="t"></number-box>
              <text>Collision Weight</text><number-box id="fileActor-weight" min="0" max="8" step="0.1" decimals="4"></number-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Sprites</detail-summary>
            <param-list id="fileActor-sprites" class="inspector-list" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Attributes</detail-summary>
            <param-list id="fileActor-attributes" class="inspector-list" group="actor" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Skills</detail-summary>
            <param-list id="fileActor-skills" class="inspector-list" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Equipments</detail-summary>
            <param-list id="fileActor-equipments" class="inspector-list" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Events</detail-summary>
            <param-list id="fileActor-events" class="inspector-list" filter="actor" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Scripts</detail-summary>
            <param-list id="fileActor-scripts" class="inspector-list" flexible></param-list>
          </detail-box>
          <parameter-pane id="fileActor-parameter-pane"></parameter-pane>
        </page-frame>

        {/*文件 - 技能*/}
        <page-frame value="fileSkill">
          <detail-box open>
            <detail-summary>General</detail-summary>
            <detail-grid id="fileSkill-general-grid">
              <text>Icon</text><custom-box id="fileSkill-icon" type="file" filter="image"></custom-box>
              <text>Clip</text><custom-box id="fileSkill-clip" type="clip" image="fileSkill-icon"></custom-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Attributes</detail-summary>
            <param-list id="fileSkill-attributes" class="inspector-list" group="skill" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Events</detail-summary>
            <param-list id="fileSkill-events" class="inspector-list" filter="skill" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Scripts</detail-summary>
            <param-list id="fileSkill-scripts" class="inspector-list" flexible></param-list>
          </detail-box>
          <parameter-pane id="fileSkill-parameter-pane"></parameter-pane>
        </page-frame>

        {/*文件 - 触发器*/}
        <page-frame value="fileTrigger">
          <detail-box open>
            <detail-summary>General</detail-summary>
            <detail-grid id="fileTrigger-general-grid">
              <text>Selector</text><select-box id="fileTrigger-selector"></select-box>
              <text>On Hit Walls</text><select-box id="fileTrigger-onHitWalls"></select-box>
              <text>On Hit Actors</text><select-box id="fileTrigger-onHitActors"></select-box>
              <text>Shape</text><select-box id="fileTrigger-shape-type"></select-box>
              <text>Width</text><number-box id="fileTrigger-shape-width" min="0" max="512" decimals="4" unit="tile"></number-box>
              <text>Height</text><number-box id="fileTrigger-shape-height" min="0" max="512" decimals="4" unit="tile"></number-box>
              <text>Anchor</text><number-box id="fileTrigger-shape-anchor" min="-4" max="5" decimals="4"></number-box>
              <text>Radius</text><number-box id="fileTrigger-shape-radius" min="0" max="512" decimals="4" unit="tile"></number-box>
              <text>Central Angle</text><number-box id="fileTrigger-shape-centralAngle" min="0" max="360" decimals="4" unit="deg"></number-box>
              <text>Speed</text><number-box id="fileTrigger-speed" min="0" max="512" decimals="4" unit="t/s"></number-box>
              <text>Hit Mode</text><select-box id="fileTrigger-hitMode"></select-box>
              <text>Hit Interval</text><number-box id="fileTrigger-hitInterval" min="0" max="10000" unit="ms"></number-box>
              <text>Initial Delay</text><number-box id="fileTrigger-initialDelay" min="0" max="10000" unit="ms"></number-box>
              <text>Effective Time</text><number-box id="fileTrigger-effectiveTime" min="0" max="10000" unit="ms"></number-box>
              <text>Duration</text><number-box id="fileTrigger-duration" min="0" max="1000000000" unit="ms"></number-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Animation</detail-summary>
            <detail-grid id="fileTrigger-animation-grid">
              <text>Animation</text><custom-box id="fileTrigger-animationId" type="file" filter="animation"></custom-box>
              <text>Motion</text><select-box id="fileTrigger-motion"></select-box>
              <text>Priority</text><number-box id="fileTrigger-priority" min="-100" max="100"></number-box>
              <text>Offset Y</text><number-box id="fileTrigger-offsetY" min="-100" max="100" unit="px"></number-box>
              <text>Rotatable</text><select-box id="fileTrigger-rotatable"></select-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Events</detail-summary>
            <param-list id="fileTrigger-events" class="inspector-list" filter="trigger" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Scripts</detail-summary>
            <param-list id="fileTrigger-scripts" class="inspector-list" flexible></param-list>
          </detail-box>
          <parameter-pane id="fileTrigger-parameter-pane"></parameter-pane>
        </page-frame>

        {/*文件 - 物品*/}
        <page-frame value="fileItem">
          <detail-box open>
            <detail-summary>General</detail-summary>
            <detail-grid id="fileItem-general-grid">
              <text>Icon</text><custom-box id="fileItem-icon" type="file" filter="image"></custom-box>
              <text>Clip</text><custom-box id="fileItem-clip" type="clip" image="fileItem-icon"></custom-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Attributes</detail-summary>
            <param-list id="fileItem-attributes" class="inspector-list" group="item" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Events</detail-summary>
            <param-list id="fileItem-events" class="inspector-list" filter="item" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Scripts</detail-summary>
            <param-list id="fileItem-scripts" class="inspector-list" flexible></param-list>
          </detail-box>
          <parameter-pane id="fileItem-parameter-pane"></parameter-pane>
        </page-frame>

        {/*文件 - 装备*/}
        <page-frame value="fileEquipment">
          <detail-box open>
            <detail-summary>General</detail-summary>
            <detail-grid id="fileEquipment-general-grid">
              <text>Icon</text><custom-box id="fileEquipment-icon" type="file" filter="image"></custom-box>
              <text>Clip</text><custom-box id="fileEquipment-clip" type="clip" image="fileEquipment-icon"></custom-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Attributes</detail-summary>
            <param-list id="fileEquipment-attributes" class="inspector-list" group="equipment" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Events</detail-summary>
            <param-list id="fileEquipment-events" class="inspector-list" filter="equipment" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Scripts</detail-summary>
            <param-list id="fileEquipment-scripts" class="inspector-list" flexible></param-list>
          </detail-box>
          <parameter-pane id="fileEquipment-parameter-pane"></parameter-pane>
        </page-frame>

        {/*文件 - 状态*/}
        <page-frame value="fileState">
          <detail-box open>
            <detail-summary>General</detail-summary>
            <detail-grid id="fileState-general-grid">
              <text>Icon</text><custom-box id="fileState-icon" type="file" filter="image"></custom-box>
              <text>Clip</text><custom-box id="fileState-clip" type="clip" image="fileState-icon"></custom-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Attributes</detail-summary>
            <param-list id="fileState-attributes" class="inspector-list" group="state" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Events</detail-summary>
            <param-list id="fileState-events" class="inspector-list" filter="state" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Scripts</detail-summary>
            <param-list id="fileState-scripts" class="inspector-list" flexible></param-list>
          </detail-box>
          <parameter-pane id="fileState-parameter-pane"></parameter-pane>
        </page-frame>

        {/*文件 - 事件*/}
        <page-frame value="fileEvent">
          <detail-box open>
            <detail-summary>General</detail-summary>
            <detail-grid id="fileEvent-general-grid">
              <text>Type</text><select-box id="fileEvent-type"></select-box>
            </detail-grid>
          </detail-box>
        </page-frame>

        {/*文件 - 图像*/}
        <page-frame id="fileImage" value="fileImage">
          <detail-box open>
            <detail-summary>File Info</detail-summary>
            <detail-grid id="fileImage-info-grid">
              <text>Name</text><text id="fileImage-name"></text>
              <text>Size</text><text id="fileImage-size"></text>
              <text>Resolution</text><text id="fileImage-resolution"></text>
            </detail-grid>
          </detail-box>
          <detail-box id="fileImage-image-detail" open>
            <detail-summary>Image</detail-summary>
            <box id="fileImage-image-viewer">
              <img id="fileImage-image"/>
            </box>
          </detail-box>
        </page-frame>

        {/*文件 - 音频*/}
        <page-frame id="fileAudio" value="fileAudio">
          <detail-box open>
            <detail-summary>File Info</detail-summary>
            <detail-grid id="fileAudio-info-grid">
              <text>Name</text><text id="fileAudio-name"></text>
              <text>Size</text><text id="fileAudio-size"></text>
              <text>Duration</text><text id="fileAudio-duration"></text>
              <text>Bitrate</text><text id="fileAudio-bitrate"></text>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Mixer</detail-summary>
            <detail-grid id="fileAudio-mixer-grid">
              <text>Volume</text>
              <flex-box id="fileAudio-volume-box">
                <slider-box id="fileAudio-volume" min="0" max="1" step="0.1"></slider-box>
                <text id="fileAudio-volume-info">100%</text>
              </flex-box>
              <text>Pan</text>
              <flex-box id="fileAudio-pan-box">
                <slider-box id="fileAudio-pan" min="-1" max="1" step="0.1"></slider-box>
                <text id="fileAudio-pan-info">0%</text>
              </flex-box>
              <text>Reverb - Dry</text>
              <flex-box id="fileAudio-dry-box">
                <slider-box id="fileAudio-dry" min="0" max="1" step="0.1"></slider-box>
                <text id="fileAudio-dry-info">100%</text>
              </flex-box>
              <text>Reverb - Wet</text>
              <flex-box id="fileAudio-wet-box">
                <slider-box id="fileAudio-wet" min="0" max="1" step="0.1"></slider-box>
                <text id="fileAudio-wet-info">0%</text>
              </flex-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Progress</detail-summary>
            <box id="fileAudio-progress-box">
              <box id="fileAudio-progress">
                <box id="fileAudio-progress-filler"></box>
              </box>
              <box id="fileAudio-progress-pointer"></box>
              <text id="fileAudio-currentTime"></text>
              <text id="fileAudio-pointerTime"></text>
            </box>
          </detail-box>
          <detail-box id="fileAudio-frequency-detail" open>
            <detail-summary>Frequency</detail-summary>
            <canvas id="fileAudio-frequency-canvas" width="0" height="0"></canvas>
          </detail-box>
        </page-frame>

        {/*文件 - 视频*/}
        <page-frame id="fileVideo" value="fileVideo">
          <detail-box open>
            <detail-summary>File Info</detail-summary>
            <detail-grid id="fileVideo-info-grid">
              <text>Name</text><text id="fileVideo-name"></text>
              <text>Size</text><text id="fileVideo-size"></text>
              <text>Duration</text><text id="fileVideo-duration"></text>
              <text>Resolution</text><text id="fileVideo-resolution"></text>
              <text>Bitrate</text><text id="fileVideo-bitrate"></text>
            </detail-grid>
          </detail-box>
          <detail-box id="fileVideo-video-detail" open>
            <detail-summary>Player</detail-summary>
            <video id="fileVideo-video" controls="controls"></video>
          </detail-box>
        </page-frame>

        {/*文件 - 字体*/}
        <page-frame id="fileFont" value="fileFont">
          <detail-box open>
            <detail-summary>File Info</detail-summary>
            <detail-grid id="fileFont-info-grid">
              <text>Name</text><text id="fileFont-name"></text>
              <text>Size</text><text id="fileFont-size"></text>
            </detail-grid>
          </detail-box>
          <detail-box id="fileFont-font-detail" open>
            <detail-summary>Font Preview</detail-summary>
            <detail-grid id="fileFont-font-grid">
              <text-box id="fileFont-content"></text-box>
              <text id="fileFont-12px" class="fileFont-preview"></text>
              <text id="fileFont-18px" class="fileFont-preview"></text>
              <text id="fileFont-24px" class="fileFont-preview"></text>
              <text id="fileFont-36px" class="fileFont-preview"></text>
              <text id="fileFont-48px" class="fileFont-preview"></text>
              <text id="fileFont-60px" class="fileFont-preview"></text>
              <text id="fileFont-72px" class="fileFont-preview"></text>
            </detail-grid>
          </detail-box>
        </page-frame>

        {/*文件 - 脚本*/}
        <page-frame id="fileScript" value="fileScript">
          <detail-box open>
            <detail-summary>File Info</detail-summary>
            <detail-grid id="fileScript-info-grid">
              <text>Name</text><text id="fileScript-name"></text>
              <text>Size</text><text id="fileScript-size"></text>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Overview</detail-summary>
            <box id="fileScript-overview"></box>
          </detail-box>
        </page-frame>

        {/*场景 - 角色*/}
        <page-frame value="sceneActor">
          <detail-box open>
            <detail-summary>General</detail-summary>
            <detail-grid id="sceneActor-general-grid">
              <text>Name</text><text-box id="sceneActor-name"></text-box>
              <text>Actor</text><custom-box id="sceneActor-actorId" type="file" filter="actor"></custom-box>
              <text>Team</text><select-box id="sceneActor-teamId"></select-box>
              <text>X</text><number-box id="sceneActor-x" min="-128" max="640" step="0.1" decimals="4"></number-box>
              <text>Y</text><number-box id="sceneActor-y" min="-128" max="640" step="0.1" decimals="4"></number-box>
              <text>Angle</text><number-box id="sceneActor-angle" min="-360" max="360" step="45" decimals="4" unit="deg"></number-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Conditions</detail-summary>
            <param-list id="sceneActor-conditions" class="inspector-list" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Events</detail-summary>
            <param-list id="sceneActor-events" class="inspector-list" filter="actor" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Scripts</detail-summary>
            <param-list id="sceneActor-scripts" class="inspector-list" flexible></param-list>
          </detail-box>
          <parameter-pane id="sceneActor-parameter-pane"></parameter-pane>
        </page-frame>

        {/*场景 - 区域*/}
        <page-frame value="sceneRegion">
          <detail-box open>
            <detail-summary>General</detail-summary>
            <detail-grid id="sceneRegion-general-grid">
              <text>Name</text><text-box id="sceneRegion-name"></text-box>
              <text>Color</text><color-box id="sceneRegion-color"></color-box>
              <text>X</text><number-box id="sceneRegion-x" min="-128" max="640" step="0.1" decimals="4"></number-box>
              <text>Y</text><number-box id="sceneRegion-y" min="-128" max="640" step="0.1" decimals="4"></number-box>
              <text>Width</text><number-box id="sceneRegion-width" min="0" max="512" decimals="4"></number-box>
              <text>Height</text><number-box id="sceneRegion-height" min="0" max="512" decimals="4"></number-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Conditions</detail-summary>
            <param-list id="sceneRegion-conditions" class="inspector-list" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Events</detail-summary>
            <param-list id="sceneRegion-events" class="inspector-list" filter="region" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Scripts</detail-summary>
            <param-list id="sceneRegion-scripts" class="inspector-list" flexible></param-list>
          </detail-box>
          <parameter-pane id="sceneRegion-parameter-pane"></parameter-pane>
        </page-frame>

        {/*场景 - 光源*/}
        <page-frame value="sceneLight">
          <detail-box open>
            <detail-summary>General</detail-summary>
            <detail-grid id="sceneLight-general-grid">
              <text>Name</text><text-box id="sceneLight-name"></text-box>
              <text>Type</text><select-box id="sceneLight-type"></select-box>
              <text>Blend</text><select-box id="sceneLight-blend"></select-box>
              <text>X</text><number-box id="sceneLight-x" min="-128" max="640" step="0.1" decimals="4"></number-box>
              <text>Y</text><number-box id="sceneLight-y" min="-128" max="640" step="0.1" decimals="4"></number-box>
              <text>Range</text>
              <flex-box id="sceneLight-range-box">
                <slider-box id="sceneLight-range-slider" min="1" max="40" step="1"></slider-box>
                <number-box id="sceneLight-range" min="0" max="128" decimals="4"></number-box>
              </flex-box>
              <text>Intensity</text>
              <flex-box id="sceneLight-intensity-box">
                <slider-box id="sceneLight-intensity-slider" min="0" max="1" step="0.05"></slider-box>
                <number-box id="sceneLight-intensity" min="0" max="1" step="0.05" decimals="4"></number-box>
              </flex-box>
              <text>Mask</text><custom-box id="sceneLight-mask" type="file" filter="image"></custom-box>
              <text>Anchor X</text>
              <flex-box id="sceneLight-anchorX-box">
                <slider-box id="sceneLight-anchorX-slider" min="0" max="1" step="0.1"></slider-box>
                <number-box id="sceneLight-anchorX" min="0" max="1" step="0.1" decimals="4"></number-box>
              </flex-box>
              <text>Anchor Y</text>
              <flex-box id="sceneLight-anchorY-box">
                <slider-box id="sceneLight-anchorY-slider" min="0" max="1" step="0.1"></slider-box>
                <number-box id="sceneLight-anchorY" min="0" max="1" step="0.1" decimals="4"></number-box>
              </flex-box>
              <text>Width</text>
              <flex-box id="sceneLight-width-box">
                <slider-box id="sceneLight-width-slider" min="1" max="40" step="1"></slider-box>
                <number-box id="sceneLight-width" min="0" max="128" step="1" decimals="4"></number-box>
              </flex-box>
              <text>Height</text>
              <flex-box id="sceneLight-height-box">
                <slider-box id="sceneLight-height-slider" min="1" max="40" step="1"></slider-box>
                <number-box id="sceneLight-height" min="0" max="128" step="1" decimals="4"></number-box>
              </flex-box>
              <text>Angle</text>
              <flex-box id="sceneLight-angle-box">
                <slider-box id="sceneLight-angle-slider" min="0" max="360" step="5"></slider-box>
                <number-box id="sceneLight-angle" min="-36000" max="36000" step="5" decimals="4"></number-box>
              </flex-box>
              <text>Red</text>
              <flex-box id="sceneLight-red-box">
                <slider-box id="sceneLight-red-slider" min="0" max="255" step="5"></slider-box>
                <number-box id="sceneLight-red" min="0" max="255" step="5"></number-box>
              </flex-box>
              <text>Green</text>
              <flex-box id="sceneLight-green-box">
                <slider-box id="sceneLight-green-slider" min="0" max="255" step="5"></slider-box>
                <number-box id="sceneLight-green" min="0" max="255" step="5"></number-box>
              </flex-box>
              <text>Blue</text>
              <flex-box id="sceneLight-blue-box">
                <slider-box id="sceneLight-blue-slider" min="0" max="255" step="5"></slider-box>
                <number-box id="sceneLight-blue" min="0" max="255" step="5"></number-box>
              </flex-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Conditions</detail-summary>
            <param-list id="sceneLight-conditions" class="inspector-list" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Events</detail-summary>
            <param-list id="sceneLight-events" class="inspector-list" filter="light" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Scripts</detail-summary>
            <param-list id="sceneLight-scripts" class="inspector-list" flexible></param-list>
          </detail-box>
          <parameter-pane id="sceneLight-parameter-pane"></parameter-pane>
        </page-frame>

        {/*场景 - 动画*/}
        <page-frame value="sceneAnimation">
          <detail-box open>
            <detail-summary>General</detail-summary>
            <detail-grid id="sceneAnimation-general-grid">
              <text>Name</text><text-box id="sceneAnimation-name"></text-box>
              <text>Animation</text><custom-box id="sceneAnimation-animationId" type="file" filter="animation"></custom-box>
              <text>Motion</text><select-box id="sceneAnimation-motion"></select-box>
              <text>X</text><number-box id="sceneAnimation-x" min="-128" max="640" step="0.1" decimals="4" unit="tile"></number-box>
              <text>Y</text><number-box id="sceneAnimation-y" min="-128" max="640" step="0.1" decimals="4" unit="tile"></number-box>
              <text>Angle</text><number-box id="sceneAnimation-angle" min="-360" max="360" step="45" decimals="4" unit="deg"></number-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Conditions</detail-summary>
            <param-list id="sceneAnimation-conditions" class="inspector-list" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Events</detail-summary>
            <param-list id="sceneAnimation-events" class="inspector-list" filter="animation" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Scripts</detail-summary>
            <param-list id="sceneAnimation-scripts" class="inspector-list" flexible></param-list>
          </detail-box>
          <parameter-pane id="sceneAnimation-parameter-pane"></parameter-pane>
        </page-frame>

        {/*场景 - 粒子*/}
        <page-frame value="sceneParticle">
          <detail-box open>
            <detail-summary>General</detail-summary>
            <detail-grid id="sceneParticle-general-grid">
              <text>Name</text><text-box id="sceneParticle-name"></text-box>
              <text>Particle</text><custom-box id="sceneParticle-particleId" type="file" filter="particle"></custom-box>
              <text>X</text><number-box id="sceneParticle-x" min="-128" max="640" step="0.1" decimals="4"></number-box>
              <text>Y</text><number-box id="sceneParticle-y" min="-128" max="640" step="0.1" decimals="4"></number-box>
              <text>Angle</text><number-box id="sceneParticle-angle" min="-360" max="360" step="45" decimals="4" unit="deg"></number-box>
              <text>Scale</text><number-box id="sceneParticle-scale" min="0.1" max="10" step="0.1" decimals="2"></number-box>
              <text>Speed</text><number-box id="sceneParticle-speed" min="0.1" max="10" step="0.1" decimals="2"></number-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Conditions</detail-summary>
            <param-list id="sceneParticle-conditions" class="inspector-list" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Events</detail-summary>
            <param-list id="sceneParticle-events" class="inspector-list" filter="particle" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Scripts</detail-summary>
            <param-list id="sceneParticle-scripts" class="inspector-list" flexible></param-list>
          </detail-box>
          <parameter-pane id="sceneParticle-parameter-pane"></parameter-pane>
        </page-frame>

        {/*场景 - 视差图*/}
        <page-frame value="sceneParallax">
          <detail-box open>
            <detail-summary>General</detail-summary>
            <detail-grid id="sceneParallax-general-grid">
              <text>Name</text><text-box id="sceneParallax-name"></text-box>
              <text>Image</text><custom-box id="sceneParallax-image" type="file" filter="image"></custom-box>
              <text>Layer</text><select-box id="sceneParallax-layer"></select-box>
              <text>Order</text><number-box id="sceneParallax-order" min="0" max="100"></number-box>
              <text>Light Sampling</text><select-box id="sceneParallax-light"></select-box>
              <text>Blend</text><select-box id="sceneParallax-blend"></select-box>
              <text>Opacity</text><number-box id="sceneParallax-opacity" min="0" max="1" step="0.05" decimals="4"></number-box>
              <text>X</text><number-box id="sceneParallax-x" min="-128" max="640" step="0.1" decimals="4" unit="tile"></number-box>
              <text>Y</text><number-box id="sceneParallax-y" min="-128" max="640" step="0.1" decimals="4" unit="tile"></number-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Parallax</detail-summary>
            <detail-grid id="sceneParallax-parallax-grid">
              <text>Scale X</text><number-box id="sceneParallax-scaleX" min="0.2" max="32" step="0.1" decimals="4"></number-box>
              <text>Scale Y</text><number-box id="sceneParallax-scaleY" min="0.2" max="32" step="0.1" decimals="4"></number-box>
              <text>Repeat X</text><number-box id="sceneParallax-repeatX" min="1" max="100"></number-box>
              <text>Repeat Y</text><number-box id="sceneParallax-repeatY" min="1" max="100"></number-box>
              <text>Anchor X</text><number-box id="sceneParallax-anchorX" min="0" max="1" step="0.1" decimals="4"></number-box>
              <text>Anchor Y</text><number-box id="sceneParallax-anchorY" min="0" max="1" step="0.1" decimals="4"></number-box>
              <text>Offset X</text><number-box id="sceneParallax-offsetX" min="-10000" max="10000" unit="px"></number-box>
              <text>Offset Y</text><number-box id="sceneParallax-offsetY" min="-10000" max="10000" unit="px"></number-box>
              <text>Parallax Factor X</text><number-box id="sceneParallax-parallaxFactorX" min="-4" max="4" step="0.1" decimals="4"></number-box>
              <text>Parallax Factor Y</text><number-box id="sceneParallax-parallaxFactorY" min="-4" max="4" step="0.1" decimals="4"></number-box>
              <text>Shift Speed X</text><number-box id="sceneParallax-shiftSpeedX" min="-10000" max="10000" step="5" decimals="4" unit="px/s"></number-box>
              <text>Shift Speed Y</text><number-box id="sceneParallax-shiftSpeedY" min="-10000" max="10000" step="5" decimals="4" unit="px/s"></number-box>
              <text>Tint - Red</text>
              <flex-box id="sceneParallax-tint-0-box">
                <slider-box id="sceneParallax-tint-0-slider" min="-255" max="255" step="15"></slider-box>
                <number-box id="sceneParallax-tint-0" min="-255" max="255" step="5"></number-box>
              </flex-box>
              <text>Tint - Green</text>
              <flex-box id="sceneParallax-tint-1-box">
                <slider-box id="sceneParallax-tint-1-slider" min="-255" max="255" step="15"></slider-box>
                <number-box id="sceneParallax-tint-1" min="-255" max="255" step="5"></number-box>
              </flex-box>
              <text>Tint - Blue</text>
              <flex-box id="sceneParallax-tint-2-box">
                <slider-box id="sceneParallax-tint-2-slider" min="-255" max="255" step="15"></slider-box>
                <number-box id="sceneParallax-tint-2" min="-255" max="255" step="5"></number-box>
              </flex-box>
              <text>Tint - Gray</text>
              <flex-box id="sceneParallax-tint-3-box">
                <slider-box id="sceneParallax-tint-3-slider" min="0" max="255" step="15"></slider-box>
                <number-box id="sceneParallax-tint-3" min="0" max="255" step="5"></number-box>
              </flex-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Conditions</detail-summary>
            <param-list id="sceneParallax-conditions" class="inspector-list" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Events</detail-summary>
            <param-list id="sceneParallax-events" class="inspector-list" filter="parallax" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Scripts</detail-summary>
            <param-list id="sceneParallax-scripts" class="inspector-list" flexible></param-list>
          </detail-box>
          <parameter-pane id="sceneParallax-parameter-pane"></parameter-pane>
        </page-frame>

        {/*场景 - 瓦片地图*/}
        <page-frame value="sceneTilemap">
          <detail-box open>
            <detail-summary>General</detail-summary>
            <detail-grid id="sceneTilemap-general-grid">
              <text>Name</text><text-box id="sceneTilemap-name"></text-box>
              <text>Layer</text><select-box id="sceneTilemap-layer"></select-box>
              <text>Order</text><number-box id="sceneTilemap-order" min="0" max="100"></number-box>
              <text>Light Sampling</text><select-box id="sceneTilemap-light"></select-box>
              <text>Blend</text><select-box id="sceneTilemap-blend"></select-box>
              <text>X</text><number-box id="sceneTilemap-x" min="-128" max="640" step="0.1" decimals="4" unit="tile"></number-box>
              <text>Y</text><number-box id="sceneTilemap-y" min="-128" max="640" step="0.1" decimals="4" unit="tile"></number-box>
              <text>Width</text><number-box id="sceneTilemap-width" min="0" max="512" unit="tile"></number-box>
              <text>Height</text><number-box id="sceneTilemap-height" min="0" max="512" unit="tile"></number-box>
              <text>Anchor X</text><number-box id="sceneTilemap-anchorX" min="0" max="1" step="0.1" decimals="4"></number-box>
              <text>Anchor Y</text><number-box id="sceneTilemap-anchorY" min="0" max="1" step="0.1" decimals="4"></number-box>
              <text>Offset X</text><number-box id="sceneTilemap-offsetX" min="-10000" max="10000" unit="px"></number-box>
              <text>Offset Y</text><number-box id="sceneTilemap-offsetY" min="-10000" max="10000" unit="px"></number-box>
              <text>Parallax Factor X</text><number-box id="sceneTilemap-parallaxFactorX" min="-4" max="4" step="0.1" decimals="4"></number-box>
              <text>Parallax Factor Y</text><number-box id="sceneTilemap-parallaxFactorY" min="-4" max="4" step="0.1" decimals="4"></number-box>
              <text>Opacity</text><number-box id="sceneTilemap-opacity" min="0" max="1" step="0.05" decimals="4"></number-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Conditions</detail-summary>
            <param-list id="sceneTilemap-conditions" class="inspector-list" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Events</detail-summary>
            <param-list id="sceneTilemap-events" class="inspector-list" filter="tilemap" flexible></param-list>
          </detail-box>
          <detail-box open>
            <detail-summary>Scripts</detail-summary>
            <param-list id="sceneTilemap-scripts" class="inspector-list" flexible></param-list>
          </detail-box>
          <parameter-pane id="sceneTilemap-parameter-pane"></parameter-pane>
        </page-frame>

        {/*界面 - 图像*/}
        <page-frame value="uiImage">
          <detail-box id="uiElement-general-group" open>
            <detail-summary>General</detail-summary>
            <detail-grid id="uiElement-general-grid">
              <text>Name</text><text-box id="uiElement-name"></text-box>
            </detail-grid>
          </detail-box>
          <detail-box id="uiElement-transform-group" open>
            <detail-summary>Transform</detail-summary>
            <detail-grid id="uiElement-transform-grid">
              <text>Align</text>
              <flex-box id="uiElement-transform-align-box">
                <button class="uiElement-transform-align" value="left"><text>&#xf036;</text></button>
                <button class="uiElement-transform-align" value="center"><text>&#xf037;</text></button>
                <button class="uiElement-transform-align" value="right"><text>&#xf038;</text></button>
                <button class="uiElement-transform-align rotated" value="top"><text>&#xf036;</text></button>
                <button class="uiElement-transform-align rotated" value="middle"><text>&#xf037;</text></button>
                <button class="uiElement-transform-align rotated" value="bottom"><text>&#xf038;</text></button>
              </flex-box>
              <text>Anchor</text>
              <box id="uiElement-transform-anchor-box" class="uiElement-grid-box with-2-columns">
                <number-box id="uiElement-transform-anchorX" min="-100" max="100" step="0.1" decimals="4"></number-box>
                <number-box id="uiElement-transform-anchorY" min="-100" max="100" step="0.1" decimals="4"></number-box>
              </box>
              <text>X</text>
              <box id="uiElement-transform-x-box" class="uiElement-grid-box with-2-columns">
                <number-box id="uiElement-transform-x" min="-10000" max="10000" decimals="4" unit="px"></number-box>
                <number-box id="uiElement-transform-x2" min="-100" max="100" step="0.1" decimals="4" unit="r"></number-box>
              </box>
              <text>Y</text>
              <box id="uiElement-transform-y-box" class="uiElement-grid-box with-2-columns">
                <number-box id="uiElement-transform-y" min="-10000" max="10000" decimals="4" unit="px"></number-box>
                <number-box id="uiElement-transform-y2" min="-100" max="100" step="0.1" decimals="4" unit="r"></number-box>
              </box>
              <text>Width</text>
              <box id="uiElement-transform-width-box" class="uiElement-grid-box with-2-columns">
                <number-box id="uiElement-transform-width" min="-10000" max="10000" decimals="4" unit="px"></number-box>
                <number-box id="uiElement-transform-width2" min="-100" max="100" step="0.1" decimals="4" unit="r"></number-box>
              </box>
              <text>Height</text>
              <box id="uiElement-transform-height-box" class="uiElement-grid-box with-2-columns">
                <number-box id="uiElement-transform-height" min="-10000" max="10000" decimals="4" unit="px"></number-box>
                <number-box id="uiElement-transform-height2" min="-100" max="100" step="0.1" decimals="4" unit="r"></number-box>
              </box>
              <text>Rotation</text>
              <box id="uiElement-transform-rotation-box" class="uiElement-grid-box with-2-columns">
                <number-box id="uiElement-transform-rotation" min="-36000" max="36000" decimals="4" unit="deg"></number-box>
              </box>
              <text>Scale</text>
              <box id="uiElement-transform-scale-box" class="uiElement-grid-box with-2-columns">
                <number-box id="uiElement-transform-scaleX" min="-100" max="100" step="0.1" decimals="4"></number-box>
                <number-box id="uiElement-transform-scaleY" min="-100" max="100" step="0.1" decimals="4"></number-box>
              </box>
              <text>Skew</text>
              <box id="uiElement-transform-skew-box" class="uiElement-grid-box with-2-columns">
                <number-box id="uiElement-transform-skewX" min="-100" max="100" step="0.1" decimals="4"></number-box>
                <number-box id="uiElement-transform-skewY" min="-100" max="100" step="0.1" decimals="4"></number-box>
              </box>
              <text>Opacity</text>
              <box id="uiElement-transform-opacity-box" class="uiElement-grid-box with-2-columns">
                <number-box id="uiElement-transform-opacity" min="0" max="1" step="0.05" decimals="4"></number-box>
              </box>
            </detail-grid>
          </detail-box>
          <detail-box id="uiElement-events-group" open>
            <detail-summary>Events</detail-summary>
            <param-list id="uiElement-events" class="inspector-list" filter="element" flexible></param-list>
          </detail-box>
          <detail-box id="uiElement-scripts-group" open>
            <detail-summary>Scripts</detail-summary>
            <param-list id="uiElement-scripts" class="inspector-list" flexible></param-list>
          </detail-box>
          <parameter-pane id="uiElement-parameter-pane"></parameter-pane>
          <detail-box open>
            <detail-summary>Image Properties</detail-summary>
            <detail-grid id="uiImage-properties-grid">
              <text>Image</text><custom-box id="uiImage-image" type="file" filter="image"></custom-box>
              <text>Display</text><select-box id="uiImage-display"></select-box>
              <text>Flip</text><select-box id="uiImage-flip"></select-box>
              <text>Blend</text><select-box id="uiImage-blend"></select-box>
              <text>Shift</text>
              <box id="uiImage-shift-box" class="uiElement-grid-box with-2-columns">
                <number-box id="uiImage-shiftX" min="-10000" max="10000" unit="px"></number-box>
                <number-box id="uiImage-shiftY" min="-10000" max="10000" unit="px"></number-box>
              </box>
              <text>Clip</text><custom-box id="uiImage-clip" type="clip" image="uiImage-image"></custom-box>
              <text>Border</text><number-box id="uiImage-border" min="1" max="100" unit="px"></number-box>
              <text>Tint - Red</text>
              <flex-box id="uiImage-tint-0-box">
                <slider-box id="uiImage-tint-0-slider" min="-255" max="255" step="15"></slider-box>
                <number-box id="uiImage-tint-0" min="-255" max="255" step="5"></number-box>
              </flex-box>
              <text>Tint - Green</text>
              <flex-box id="uiImage-tint-1-box">
                <slider-box id="uiImage-tint-1-slider" min="-255" max="255" step="15"></slider-box>
                <number-box id="uiImage-tint-1" min="-255" max="255" step="5"></number-box>
              </flex-box>
              <text>Tint - Blue</text>
              <flex-box id="uiImage-tint-2-box">
                <slider-box id="uiImage-tint-2-slider" min="-255" max="255" step="15"></slider-box>
                <number-box id="uiImage-tint-2" min="-255" max="255" step="5"></number-box>
              </flex-box>
              <text>Tint - Gray</text>
              <flex-box id="uiImage-tint-3-box">
                <slider-box id="uiImage-tint-3-slider" min="0" max="255" step="15"></slider-box>
                <number-box id="uiImage-tint-3" min="0" max="255" step="5"></number-box>
              </flex-box>
            </detail-grid>
          </detail-box>
        </page-frame>

        {/*界面 - 文本*/}
        <page-frame value="uiText">
          <detail-box open>
            <detail-summary>Text Properties</detail-summary>
            <detail-grid id="uiText-properties-grid">
              <text>Direction</text><select-box id="uiText-direction"></select-box>
              <text>Alignment</text>
              <flex-box id="uiText-alignment-box">
                <radio-box name="uiText-horizontalAlign" class="uiText-align" value="left" tabindex="0"><text>&#xf036;</text></radio-box>
                <radio-box name="uiText-horizontalAlign" class="uiText-align" value="center" tabindex="0"><text>&#xf037;</text></radio-box>
                <radio-box name="uiText-horizontalAlign" class="uiText-align" value="right" tabindex="0"><text>&#xf038;</text></radio-box>
                <radio-box name="uiText-verticalAlign" class="uiText-align rotated" value="top" tabindex="0"><text>&#xf036;</text></radio-box>
                <radio-box name="uiText-verticalAlign" class="uiText-align rotated" value="middle" tabindex="0"><text>&#xf037;</text></radio-box>
                <radio-box name="uiText-verticalAlign" class="uiText-align rotated" value="bottom" tabindex="0"><text>&#xf038;</text></radio-box>
              </flex-box>
              <text>Content</text><text-area id="uiText-content"></text-area>
              <text>Size</text>
              <flex-box id="uiText-size-box">
                <slider-box id="uiText-size-slider" min="12" max="52" step="2"></slider-box>
                <number-box id="uiText-size" min="10" max="400" step="1" unit="px"></number-box>
              </flex-box>
              <text>Line Spacing</text>
              <flex-box id="uiText-lineSpacing-box">
                <slider-box id="uiText-lineSpacing-slider" min="0" max="20" step="1"></slider-box>
                <number-box id="uiText-lineSpacing" min="-10" max="100" step="1" unit="px"></number-box>
              </flex-box>
              <text>Letter Spacing</text>
              <flex-box id="uiText-letterSpacing-box">
                <slider-box id="uiText-letterSpacing-slider" min="0" max="20" step="1"></slider-box>
                <number-box id="uiText-letterSpacing" min="-10" max="100" step="1" unit="px"></number-box>
              </flex-box>
              <text>Color</text><color-box id="uiText-color"></color-box>
              <text>Font</text><text-box id="uiText-font"></text-box>
              <text>Typeface</text><select-box id="uiText-typeface"></select-box>
              <text>Effect</text><select-box id="uiText-effect-type"></select-box>
              <text>Shadow X</text><number-box id="uiText-effect-shadowOffsetX" min="-9" max="9" unit="px"></number-box>
              <text>Shadow Y</text><number-box id="uiText-effect-shadowOffsetY" min="-9" max="9" unit="px"></number-box>
              <text>Stroke Width</text><number-box id="uiText-effect-strokeWidth" min="1" max="20" unit="px"></number-box>
              <text>Effect Color</text><color-box id="uiText-effect-color"></color-box>
              <text>Overflow</text><select-box id="uiText-overflow"></select-box>
              <text>Blend</text><select-box id="uiText-blend"></select-box>
            </detail-grid>
          </detail-box>
        </page-frame>

        {/*界面 - 文本框*/}
        <page-frame value="uiTextBox">
          <detail-box open>
            <detail-summary>TextBox Properties</detail-summary>
            <detail-grid id="uiTextBox-properties-grid">
              <text>Type</text><select-box id="uiTextBox-type"></select-box>
              <text>Align</text><select-box id="uiTextBox-align"></select-box>
              <text>Text</text><text-box id="uiTextBox-text"></text-box>
              <text>Max Length</text><number-box id="uiTextBox-maxLength" min="1" max="100"></number-box>
              <text>Number</text><number-box id="uiTextBox-number"></number-box>
              <text>Min</text><number-box id="uiTextBox-min" min="-1000000000" max="1000000000" decimals="10"></number-box>
              <text>Max</text><number-box id="uiTextBox-max" min="-1000000000" max="1000000000" decimals="10"></number-box>
              <text>Decimal Places</text><number-box id="uiTextBox-decimals" min="0" max="10"></number-box>
              <text>Padding</text><number-box id="uiTextBox-padding" min="0" max="100" unit="px"></number-box>
              <text>Size</text><number-box id="uiTextBox-size" min="10" max="400" unit="px"></number-box>
              <text>Font</text><text-box id="uiTextBox-font"></text-box>
              <text>Text Color</text><color-box id="uiTextBox-color"></color-box>
              <text>Selection Color</text><color-box id="uiTextBox-selectionColor"></color-box>
              <text>Selection Bg Color</text><color-box id="uiTextBox-selectionBgColor"></color-box>
            </detail-grid>
          </detail-box>
        </page-frame>

        {/*界面 - 对话框*/}
        <page-frame value="uiDialogBox">
          <detail-box open>
            <detail-summary>DialogBox Properties</detail-summary>
            <detail-grid id="uiDialogBox-properties-grid">
              <text>Content</text><text-area id="uiDialogBox-content"></text-area>
              <text>Print Interval</text><number-box id="uiDialogBox-interval" min="0" max="100" decimals="4" unit="ms"></number-box>
              <text>Size</text>
              <flex-box id="uiDialogBox-size-box">
                <slider-box id="uiDialogBox-size-slider" min="12" max="52" step="2"></slider-box>
                <number-box id="uiDialogBox-size" min="10" max="400" step="1" unit="px"></number-box>
              </flex-box>
              <text>Line Spacing</text>
              <flex-box id="uiDialogBox-lineSpacing-box">
                <slider-box id="uiDialogBox-lineSpacing-slider" min="0" max="20" step="1"></slider-box>
                <number-box id="uiDialogBox-lineSpacing" min="-10" max="100" step="1" unit="px"></number-box>
              </flex-box>
              <text>Letter Spacing</text>
              <flex-box id="uiDialogBox-letterSpacing-box">
                <slider-box id="uiDialogBox-letterSpacing-slider" min="0" max="20" step="1"></slider-box>
                <number-box id="uiDialogBox-letterSpacing" min="-10" max="100" step="1" unit="px"></number-box>
              </flex-box>
              <text>Color</text><color-box id="uiDialogBox-color"></color-box>
              <text>Font</text><text-box id="uiDialogBox-font"></text-box>
              <text>Typeface</text><select-box id="uiDialogBox-typeface"></select-box>
              <text>Effect</text><select-box id="uiDialogBox-effect-type"></select-box>
              <text>Shadow X</text><number-box id="uiDialogBox-effect-shadowOffsetX" min="-9" max="9" unit="px"></number-box>
              <text>Shadow Y</text><number-box id="uiDialogBox-effect-shadowOffsetY" min="-9" max="9" unit="px"></number-box>
              <text>Stroke Width</text><number-box id="uiDialogBox-effect-strokeWidth" min="1" max="20" unit="px"></number-box>
              <text>Effect Color</text><color-box id="uiDialogBox-effect-color"></color-box>
              <text>Blend</text><select-box id="uiDialogBox-blend"></select-box>
            </detail-grid>
          </detail-box>
        </page-frame>

        {/*界面 - 进度条*/}
        <page-frame value="uiProgressBar">
          <detail-box open>
            <detail-summary>ProgressBar Properties</detail-summary>
            <detail-grid id="uiProgressBar-properties-grid">
              <text>Image</text><custom-box id="uiProgressBar-image" type="file" filter="image"></custom-box>
              <text>Display</text><select-box id="uiProgressBar-display"></select-box>
              <text>Clip</text><custom-box id="uiProgressBar-clip" type="clip" image="uiProgressBar-image"></custom-box>
              <text>Type</text><select-box id="uiProgressBar-type"></select-box>
              <text>Center X</text><number-box id="uiProgressBar-centerX" min="0" max="1" step="0.05" decimals="4"></number-box>
              <text>Center Y</text><number-box id="uiProgressBar-centerY" min="0" max="1" step="0.05" decimals="4"></number-box>
              <text>Start Angle</text><number-box id="uiProgressBar-startAngle" min="-360" max="360" step="5" decimals="4" unit="deg"></number-box>
              <text>Central Angle</text><number-box id="uiProgressBar-centralAngle" min="-360" max="360" step="5" decimals="4" unit="deg"></number-box>
              <text>Step</text><number-box id="uiProgressBar-step" min="0" max="100"></number-box>
              <text>Progress</text><number-box id="uiProgressBar-progress" min="0" max="1" step="0.01" decimals="4"></number-box>
              <text>Blend</text><select-box id="uiProgressBar-blend"></select-box>
              <text>Color Mode</text><select-box id="uiProgressBar-colorMode"></select-box>
              <text>Red</text>
              <flex-box id="uiProgressBar-color-0-box">
                <slider-box id="uiProgressBar-color-0-slider" min="0" max="255" step="5"></slider-box>
                <number-box id="uiProgressBar-color-0" min="0" max="255" step="5"></number-box>
              </flex-box>
              <text>Green</text>
              <flex-box id="uiProgressBar-color-1-box">
                <slider-box id="uiProgressBar-color-1-slider" min="0" max="255" step="5"></slider-box>
                <number-box id="uiProgressBar-color-1" min="0" max="255" step="5"></number-box>
              </flex-box>
              <text>Blue</text>
              <flex-box id="uiProgressBar-color-2-box">
                <slider-box id="uiProgressBar-color-2-slider" min="0" max="255" step="5"></slider-box>
                <number-box id="uiProgressBar-color-2" min="0" max="255" step="5"></number-box>
              </flex-box>
              <text>Alpha</text>
              <flex-box id="uiProgressBar-color-3-box">
                <slider-box id="uiProgressBar-color-3-slider" min="0" max="255" step="5"></slider-box>
                <number-box id="uiProgressBar-color-3" min="0" max="255" step="5"></number-box>
              </flex-box>
            </detail-grid>
          </detail-box>
        </page-frame>

        {/*界面 - 视频*/}
        <page-frame value="uiVideo">
          <detail-box open>
            <detail-summary>Video Properties</detail-summary>
            <detail-grid id="uiVideo-properties-grid">
              <text>Video</text><custom-box id="uiVideo-video" type="file" filter="video"></custom-box>
              <text>Loop</text><select-box id="uiVideo-loop"></select-box>
              <text>Flip</text><select-box id="uiVideo-flip"></select-box>
              <text>Blend</text><select-box id="uiVideo-blend"></select-box>
            </detail-grid>
          </detail-box>
        </page-frame>

        {/*界面 - 窗口*/}
        <page-frame value="uiWindow">
          <detail-box open>
            <detail-summary>Window Properties</detail-summary>
            <detail-grid id="uiWindow-properties-grid">
              <text>Layout</text><select-box id="uiWindow-layout"></select-box>
              <text>Scroll X</text><number-box id="uiWindow-scrollX" min="0" max="10000" unit="px"></number-box>
              <text>Scroll Y</text><number-box id="uiWindow-scrollY" min="0" max="10000" unit="px"></number-box>
              <text>Grid Width</text><number-box id="uiWindow-gridWidth" min="0" max="1000" unit="px"></number-box>
              <text>Grid Height</text><number-box id="uiWindow-gridHeight" min="0" max="1000" unit="px"></number-box>
              <text>Grid Gap X</text><number-box id="uiWindow-gridGapX" min="0" max="1000" unit="px"></number-box>
              <text>Grid Gap Y</text><number-box id="uiWindow-gridGapY" min="0" max="1000" unit="px"></number-box>
              <text>Padding X</text><number-box id="uiWindow-paddingX" min="0" max="1000" unit="px"></number-box>
              <text>Padding Y</text><number-box id="uiWindow-paddingY" min="0" max="1000" unit="px"></number-box>
              <text>Overflow</text><select-box id="uiWindow-overflow"></select-box>
            </detail-grid>
          </detail-box>
        </page-frame>

        {/*界面 - 容器*/}
        <page-frame value="uiContainer"></page-frame>

        {/*动画 - 动作*/}
        <page-frame value="animMotion">
          <detail-box open>
            <detail-summary>Motion</detail-summary>
            <detail-grid id="animMotion-general-grid">
              <text>Direction</text><select-box id="animMotion-mode"></select-box>
              <text>Loop</text><check-box id="animMotion-loop" class="standard large"></check-box>
              <text>Loop Start</text><number-box id="animMotion-loopStart" min="0" max="10000"></number-box>
            </detail-grid>
          </detail-box>
        </page-frame>

        {/*动画 - 关节帧*/}
        <page-frame id="animJointFrame" value="animJointFrame">
          <detail-box open>
            <detail-summary>Frame</detail-summary>
            <detail-grid id="animJointFrame-properties-grid">
              <text>Position</text>
              <box id="animJointFrame-position-box" class="uiElement-grid-box with-2-columns">
                <number-box id="animJointFrame-x" min="-10000" max="10000" decimals="4" unit="px"></number-box>
                <number-box id="animJointFrame-y" min="-10000" max="10000" decimals="4" unit="px"></number-box>
              </box>
              <text>Rotation</text>
              <box id="animJointFrame-rotation-box" class="uiElement-grid-box with-2-columns">
                <number-box id="animJointFrame-rotation" min="-36000" max="36000" decimals="4" unit="deg"></number-box>
              </box>
              <text>Scale</text>
              <box id="animJointFrame-scale-box" class="uiElement-grid-box with-2-columns">
                <number-box id="animJointFrame-scaleX" min="-100" max="100" step="0.1" decimals="4"></number-box>
                <number-box id="animJointFrame-scaleY" min="-100" max="100" step="0.1" decimals="4"></number-box>
              </box>
              <text>Opacity</text>
              <box id="animJointFrame-opacity-box" class="uiElement-grid-box with-2-columns">
                <number-box id="animJointFrame-opacity" min="0" max="1" step="0.05" decimals="4"></number-box>
              </box>
            </detail-grid>
          </detail-box>
        </page-frame>

        {/*动画 - 精灵层*/}
        <page-frame value="animSpriteLayer">
          <detail-box open>
            <detail-summary>Sprite Layer</detail-summary>
            <detail-grid id="animSpriteLayer-properties-grid">
              <text>Sprite</text><select-box id="animSpriteLayer-sprite"></select-box>
              <text>Blend</text><select-box id="animSpriteLayer-blend"></select-box>
              <text>Light Sampling</text><select-box id="animSpriteLayer-light"></select-box>
            </detail-grid>
          </detail-box>
        </page-frame>

        {/*动画 - 精灵帧*/}
        <page-frame id="animSpriteFrame" value="animSpriteFrame">
          <detail-box id="animSpriteFrame-properties-detail" open>
            <detail-summary>Frame</detail-summary>
            <detail-grid id="animSpriteFrame-properties-grid">
              <text>Position</text>
              <box id="animSpriteFrame-position-box" class="uiElement-grid-box with-2-columns">
                <number-box id="animSpriteFrame-x" min="-10000" max="10000" decimals="4" unit="px"></number-box>
                <number-box id="animSpriteFrame-y" min="-10000" max="10000" decimals="4" unit="px"></number-box>
              </box>
              <text>Rotation</text>
              <box id="animSpriteFrame-rotation-box" class="uiElement-grid-box with-2-columns">
                <number-box id="animSpriteFrame-rotation" min="-36000" max="36000" decimals="4" unit="deg"></number-box>
              </box>
              <text>Scale</text>
              <box id="animSpriteFrame-scale-box" class="uiElement-grid-box with-2-columns">
                <number-box id="animSpriteFrame-scaleX" min="-100" max="100" step="0.1" decimals="4"></number-box>
                <number-box id="animSpriteFrame-scaleY" min="-100" max="100" step="0.1" decimals="4"></number-box>
              </box>
              <text>Opacity</text>
              <box id="animSpriteFrame-opacity-box" class="uiElement-grid-box with-2-columns">
                <number-box id="animSpriteFrame-opacity" min="0" max="1" step="0.05" decimals="4"></number-box>
              </box>
              <text>Tint - Red</text>
              <flex-box id="animSpriteFrame-tint-0-box">
                <slider-box id="animSpriteFrame-tint-0-slider" min="-255" max="255" step="15"></slider-box>
                <number-box id="animSpriteFrame-tint-0" min="-255" max="255" step="5"></number-box>
              </flex-box>
              <text>Tint - Green</text>
              <flex-box id="animSpriteFrame-tint-1-box">
                <slider-box id="animSpriteFrame-tint-1-slider" min="-255" max="255" step="15"></slider-box>
                <number-box id="animSpriteFrame-tint-1" min="-255" max="255" step="5"></number-box>
              </flex-box>
              <text>Tint - Blue</text>
              <flex-box id="animSpriteFrame-tint-2-box">
                <slider-box id="animSpriteFrame-tint-2-slider" min="-255" max="255" step="15"></slider-box>
                <number-box id="animSpriteFrame-tint-2" min="-255" max="255" step="5"></number-box>
              </flex-box>
              <text>Tint - Gray</text>
              <flex-box id="animSpriteFrame-tint-3-box">
                <slider-box id="animSpriteFrame-tint-3-slider" min="0" max="255" step="15"></slider-box>
                <number-box id="animSpriteFrame-tint-3" min="0" max="255" step="5"></number-box>
              </flex-box>
            </detail-grid>
          </detail-box>
          <detail-box id="animSpriteFrame-sprite-detail" open>
            <detail-summary id="animSpriteFrame-sprite-summary">
              <text id="sprite-label">Sprite</text>
              <box id="sprite-info"></box>
              <slider-box id="sprite-zoom" name="zoom" min="0" max="4"></slider-box>
            </detail-summary>

            <SpriteView />
          </detail-box>
        </page-frame>

        {/*动画 - 粒子层*/}
        <page-frame value="animParticleLayer">
          <detail-box open>
            <detail-summary>Particle Layer</detail-summary>
            <detail-grid id="animParticleLayer-properties-grid">
              <text>Particle</text><custom-box id="animParticleLayer-particleId" type="file" filter="particle"></custom-box>
              <text>Emitter Angle</text><select-box id="animParticleLayer-angle"></select-box>
            </detail-grid>
          </detail-box>
        </page-frame>

        {/*动画 - 粒子帧*/}
        <page-frame id="animParticleFrame" value="animParticleFrame">
          <detail-box open>
            <detail-summary>Frame</detail-summary>
            <detail-grid id="animParticleFrame-properties-grid">
              <text>Position</text>
              <box id="animParticleFrame-position-box" class="uiElement-grid-box with-2-columns">
                <number-box id="animParticleFrame-x" min="-10000" max="10000" decimals="4" unit="px"></number-box>
                <number-box id="animParticleFrame-y" min="-10000" max="10000" decimals="4" unit="px"></number-box>
              </box>
              <text>Rotation</text>
              <box id="animParticleFrame-rotation-box" class="uiElement-grid-box with-2-columns">
                <number-box id="animParticleFrame-rotation" min="-36000" max="36000" decimals="4" unit="deg"></number-box>
              </box>
              <text>Scale</text>
              <box id="animParticleFrame-scale-box" class="uiElement-grid-box with-2-columns">
                <number-box id="animParticleFrame-scaleX" min="-100" max="100" step="0.1" decimals="4"></number-box>
                <number-box id="animParticleFrame-scaleY" min="-100" max="100" step="0.1" decimals="4"></number-box>
              </box>
              <text>Opacity</text>
              <box id="animParticleFrame-opacity-box" class="uiElement-grid-box with-2-columns">
                <number-box id="animParticleFrame-opacity" min="0" max="1" step="0.05" decimals="4"></number-box>
              </box>
              <text>Particle Scale</text><number-box id="animParticleFrame-scale" min="0.1" max="10" step="0.1" decimals="2"></number-box>
              <text>Speed</text><number-box id="animParticleFrame-speed" min="0.1" max="10" step="0.1" decimals="2"></number-box>
            </detail-grid>
          </detail-box>
        </page-frame>

        {/*粒子 - 图层*/}
        <page-frame value="particleLayer">
          <detail-box open>
            <detail-summary>General</detail-summary>
            <detail-grid id="particleLayer-general-grid">
              <text>Name</text><text-box id="particleLayer-name"></text-box>
              <text>Emission Area</text><select-box id="particleLayer-area-type"></select-box>
              <text>X</text><number-box id="particleLayer-area-x" min="-10000" max="10000" unit="px"></number-box>
              <text>Y</text><number-box id="particleLayer-area-y" min="-10000" max="10000" unit="px"></number-box>
              <text>Width</text><number-box id="particleLayer-area-width" min="0" max="10000" unit="px"></number-box>
              <text>Height</text><number-box id="particleLayer-area-height" min="0" max="10000" unit="px"></number-box>
              <text>Radius</text><number-box id="particleLayer-area-radius" min="0" max="10000" unit="px"></number-box>
              <text>Max Quantity</text><number-box id="particleLayer-maximum" min="0" max="1000"></number-box>
              <text>Emission Count</text><number-box id="particleLayer-count" min="0" max="1000000000"></number-box>
              <text>Initial Delay</text><number-box id="particleLayer-delay" min="0" max="1000000000" unit="ms"></number-box>
              <text>Interval</text><number-box id="particleLayer-interval" min="0" max="1000000000" unit="ms"></number-box>
              <text>Lifetime</text><number-box id="particleLayer-lifetime" min="0" max="1000000000" unit="ms"></number-box>
              <text>Lifetime Dev</text><number-box id="particleLayer-lifetimeDev" min="0" max="1000000000" unit="ms"></number-box>
              <text>Fadeout</text><number-box id="particleLayer-fadeout" min="0" max="1000000000" unit="ms"></number-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Anchor</detail-summary>
            <detail-grid id="particleLayer-anchor-grid">
              <text>Anchor X</text>
              <flex-box id="particleLayer-anchor-x-box">
                <number-box id="particleLayer-anchor-x-0" min="-100" max="100" step="0.1" decimals="4"><text class="label">min</text></number-box>
                <number-box id="particleLayer-anchor-x-1" min="-100" max="100" step="0.1" decimals="4"><text class="label">max</text></number-box>
              </flex-box>
              <text>Anchor Y</text>
              <flex-box id="particleLayer-anchor-y-box">
                <number-box id="particleLayer-anchor-y-0" min="-100" max="100" step="0.1" decimals="4"><text class="label">min</text></number-box>
                <number-box id="particleLayer-anchor-y-1" min="-100" max="100" step="0.1" decimals="4"><text class="label">max</text></number-box>
              </flex-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Movement</detail-summary>
            <detail-grid id="particleLayer-movement-grid">
              <text>Movement Angle</text>
              <flex-box id="particleLayer-movement-angle-box">
                <number-box id="particleLayer-movement-angle-0" min="-36000" max="36000" step="15" decimals="4" unit="deg"><text class="label">min</text></number-box>
                <number-box id="particleLayer-movement-angle-1" min="-36000" max="36000" step="15" decimals="4" unit="deg"><text class="label">max</text></number-box>
              </flex-box>
              <text>Movement Speed</text>
              <flex-box id="particleLayer-movement-speed-box">
                <number-box id="particleLayer-movement-speed-0" min="-10000" max="10000" decimals="4"><text class="label">min</text></number-box>
                <number-box id="particleLayer-movement-speed-1" min="-10000" max="10000" decimals="4"><text class="label">max</text></number-box>
              </flex-box>
              <text>Accel Angle</text>
              <flex-box id="particleLayer-movement-accelAngle-box">
                <number-box id="particleLayer-movement-accelAngle-0" min="-36000" max="36000" step="15" decimals="4" unit="deg"><text class="label">min</text></number-box>
                <number-box id="particleLayer-movement-accelAngle-1" min="-36000" max="36000" step="15" decimals="4" unit="deg"><text class="label">max</text></number-box>
              </flex-box>
              <text>Accel</text>
              <flex-box id="particleLayer-movement-accel-box">
                <number-box id="particleLayer-movement-accel-0" min="-10000" max="10000" decimals="4"><text class="label">min</text></number-box>
                <number-box id="particleLayer-movement-accel-1" min="-10000" max="10000" decimals="4"><text class="label">max</text></number-box>
              </flex-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Rotation</detail-summary>
            <detail-grid id="particleLayer-rotation-grid">
              <text>Rotation Angle</text>
              <flex-box id="particleLayer-rotation-angle-box">
                <number-box id="particleLayer-rotation-angle-0" min="-36000" max="36000" step="15" decimals="4" unit="deg"><text class="label">min</text></number-box>
                <number-box id="particleLayer-rotation-angle-1" min="-36000" max="36000" step="15" decimals="4" unit="deg"><text class="label">max</text></number-box>
              </flex-box>
              <text>Angular Velocity</text>
              <flex-box id="particleLayer-rotation-speed-box">
                <number-box id="particleLayer-rotation-speed-0" min="-36000" max="36000" step="15" decimals="4"><text class="label">min</text></number-box>
                <number-box id="particleLayer-rotation-speed-1" min="-36000" max="36000" step="15" decimals="4"><text class="label">max</text></number-box>
              </flex-box>
              <text>Angular Accel</text>
              <flex-box id="particleLayer-rotation-accel-box">
                <number-box id="particleLayer-rotation-accel-0" min="-36000" max="36000" step="15" decimals="4"><text class="label">min</text></number-box>
                <number-box id="particleLayer-rotation-accel-1" min="-36000" max="36000" step="15" decimals="4"><text class="label">max</text></number-box>
              </flex-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Scale</detail-summary>
            <detail-grid id="particleLayer-scale-grid">
              <text>Scale Factor</text>
              <flex-box id="particleLayer-scale-factor-box">
                <number-box id="particleLayer-scale-factor-0" min="-100" max="100" step="0.1" decimals="4"><text class="label">min</text></number-box>
                <number-box id="particleLayer-scale-factor-1" min="-100" max="100" step="0.1" decimals="4"><text class="label">max</text></number-box>
              </flex-box>
              <text>Expansion Speed</text>
              <flex-box id="particleLayer-scale-speed-box">
                <number-box id="particleLayer-scale-speed-0" min="-100" max="100" step="0.1" decimals="4"><text class="label">min</text></number-box>
                <number-box id="particleLayer-scale-speed-1" min="-100" max="100" step="0.1" decimals="4"><text class="label">max</text></number-box>
              </flex-box>
              <text>Expansion Accel</text>
              <flex-box id="particleLayer-scale-accel-box">
                <number-box id="particleLayer-scale-accel-0" min="-100" max="100" step="0.1" decimals="4"><text class="label">min</text></number-box>
                <number-box id="particleLayer-scale-accel-1" min="-100" max="100" step="0.1" decimals="4"><text class="label">max</text></number-box>
              </flex-box>
            </detail-grid>
          </detail-box>
          <detail-box open>
            <detail-summary>Rendering</detail-summary>
            <detail-grid id="particleLayer-rendering-grid">
              <text>Image</text><custom-box id="particleLayer-image" type="file" filter="image"></custom-box>
              <text>Blend</text><select-box id="particleLayer-blend"></select-box>
              <text>Sort</text><select-box id="particleLayer-sort"></select-box>
              <text>Horiz Frames</text><number-box id="particleLayer-hframes" min="1" max="100"></number-box>
              <text>Vert Frames</text><number-box id="particleLayer-vframes" min="1" max="100"></number-box>
              <text>Color Mode</text><select-box id="particleLayer-color-mode"></select-box>
              <text>Color</text>
              <flex-box id="particleLayer-color-rgba-box">
                <number-box id="particleLayer-color-rgba-0" min="0" max="255" step="5"><text class="label red">R</text></number-box>
                <number-box id="particleLayer-color-rgba-1" min="0" max="255" step="5"><text class="label green">G</text></number-box>
                <number-box id="particleLayer-color-rgba-2" min="0" max="255" step="5"><text class="label blue">B</text></number-box>
                <number-box id="particleLayer-color-rgba-3" min="0" max="255" step="5"><text class="label">A</text></number-box>
              </flex-box>
              <text>Color Min</text>
              <flex-box id="particleLayer-color-min-box">
                <number-box id="particleLayer-color-min-0" min="0" max="255" step="5"><text class="label red">R</text></number-box>
                <number-box id="particleLayer-color-min-1" min="0" max="255" step="5"><text class="label green">G</text></number-box>
                <number-box id="particleLayer-color-min-2" min="0" max="255" step="5"><text class="label blue">B</text></number-box>
                <number-box id="particleLayer-color-min-3" min="0" max="255" step="5"><text class="label">A</text></number-box>
              </flex-box>
              <text>Color Max</text>
              <flex-box id="particleLayer-color-max-box">
                <number-box id="particleLayer-color-max-0" min="0" max="255" step="5"><text class="label red">R</text></number-box>
                <number-box id="particleLayer-color-max-1" min="0" max="255" step="5"><text class="label green">G</text></number-box>
                <number-box id="particleLayer-color-max-2" min="0" max="255" step="5"><text class="label blue">B</text></number-box>
                <number-box id="particleLayer-color-max-3" min="0" max="255" step="5"><text class="label">A</text></number-box>
              </flex-box>
              <text>Color Easing</text><select-box id="particleLayer-color-easingId"></select-box>
              <text>Color Start Min</text>
              <flex-box id="particleLayer-color-startMin-box">
                <number-box id="particleLayer-color-startMin-0" min="0" max="255" step="5"><text class="label red">R</text></number-box>
                <number-box id="particleLayer-color-startMin-1" min="0" max="255" step="5"><text class="label green">G</text></number-box>
                <number-box id="particleLayer-color-startMin-2" min="0" max="255" step="5"><text class="label blue">B</text></number-box>
                <number-box id="particleLayer-color-startMin-3" min="0" max="255" step="5"><text class="label">A</text></number-box>
              </flex-box>
              <text>Color Start Max</text>
              <flex-box id="particleLayer-color-startMax-box">
                <number-box id="particleLayer-color-startMax-0" min="0" max="255" step="5"><text class="label red">R</text></number-box>
                <number-box id="particleLayer-color-startMax-1" min="0" max="255" step="5"><text class="label green">G</text></number-box>
                <number-box id="particleLayer-color-startMax-2" min="0" max="255" step="5"><text class="label blue">B</text></number-box>
                <number-box id="particleLayer-color-startMax-3" min="0" max="255" step="5"><text class="label">A</text></number-box>
              </flex-box>
              <text>Color End Min</text>
              <flex-box id="particleLayer-color-endMin-box">
                <number-box id="particleLayer-color-endMin-0" min="0" max="255" step="5"><text class="label red">R</text></number-box>
                <number-box id="particleLayer-color-endMin-1" min="0" max="255" step="5"><text class="label green">G</text></number-box>
                <number-box id="particleLayer-color-endMin-2" min="0" max="255" step="5"><text class="label blue">B</text></number-box>
                <number-box id="particleLayer-color-endMin-3" min="0" max="255" step="5"><text class="label">A</text></number-box>
              </flex-box>
              <text>Color End Max</text>
              <flex-box id="particleLayer-color-endMax-box">
                <number-box id="particleLayer-color-endMax-0" min="0" max="255" step="5"><text class="label red">R</text></number-box>
                <number-box id="particleLayer-color-endMax-1" min="0" max="255" step="5"><text class="label green">G</text></number-box>
                <number-box id="particleLayer-color-endMax-2" min="0" max="255" step="5"><text class="label blue">B</text></number-box>
                <number-box id="particleLayer-color-endMax-3" min="0" max="255" step="5"><text class="label">A</text></number-box>
              </flex-box>
              <text>Tint - Red</text>
              <flex-box id="particleLayer-color-tint-0-box">
                <slider-box id="particleLayer-color-tint-0-slider" min="-255" max="255" step="15"></slider-box>
                <number-box id="particleLayer-color-tint-0" min="-255" max="255" step="5"></number-box>
              </flex-box>
              <text>Tint - Green</text>
              <flex-box id="particleLayer-color-tint-1-box">
                <slider-box id="particleLayer-color-tint-1-slider" min="-255" max="255" step="15"></slider-box>
                <number-box id="particleLayer-color-tint-1" min="-255" max="255" step="5"></number-box>
              </flex-box>
              <text>Tint - Blue</text>
              <flex-box id="particleLayer-color-tint-2-box">
                <slider-box id="particleLayer-color-tint-2-slider" min="-255" max="255" step="15"></slider-box>
                <number-box id="particleLayer-color-tint-2" min="-255" max="255" step="5"></number-box>
              </flex-box>
              <text>Tint - Gray</text>
              <flex-box id="particleLayer-color-tint-3-box">
                <slider-box id="particleLayer-color-tint-3-slider" min="0" max="255" step="15"></slider-box>
                <number-box id="particleLayer-color-tint-3" min="0" max="255" step="5"></number-box>
              </flex-box>
            </detail-grid>
          </detail-box>
        </page-frame>
      </page-manager>
    </page-frame>
  </>
)

export { InspectorView }
