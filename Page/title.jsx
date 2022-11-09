'use strict'

import { createElement } from './vhtml/index.js'

const Title = () => (
  <box id="title">
    <box id="menu">
      <item id="menu-file" class="menu-item" value="file">File</item>
      <item id="menu-edit" class="menu-item" value="edit">Edit</item>
      <item id="menu-view" class="menu-item" value="view">View</item>
      <item id="menu-window" class="menu-item" value="window">Window</item>
      <item id="menu-help" class="menu-item" value="help">Help</item>
    </box>
    <tab-bar id="title-tabBar"></tab-bar>
    <box id="title-buttons">
      <box id="title-play">&#xf04b;</box>
      <minimize id="title-minimize"></minimize>
      <maximize id="title-maximize"></maximize>
      <close id="title-close"></close>
    </box>
  </box>
)

export { Title }
