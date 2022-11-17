'use strict'

import { createElement } from './vhtml/index.js'

const TitleView = ()=>(
  <>
    {/*标题栏*/}
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


    {/*新建项目窗口*/}
    <window-frame id="newProject">
      <title-bar>New Project<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Folder</text><text-box id="newProject-folder"></text-box>
          <text>Location</text>
          <flex-box id="newProject-location-box">
            <text-box id="newProject-location"></text-box>
            <button id="newProject-choose">…</button>
          </flex-box>
        </grid-box>
        <text id="newProject-warning"></text>
        <button id="newProject-confirm" name="confirm">Confirm</button>
        <button id="newProject-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*部署项目窗口*/}
    <window-frame id="deployment">
      <title-bar>Deployment<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Platform</text><select-box id="deployment-platform"></select-box>
          <text>Folder</text><text-box id="deployment-folder"></text-box>
          <text>Output Location</text>
          <flex-box id="deployment-location-box">
            <text-box id="deployment-location"></text-box>
            <button id="deployment-choose">…</button>
          </flex-box>
        </grid-box>
        <text id="deployment-warning"></text>
        <button id="deployment-confirm" name="confirm">Confirm</button>
        <button id="deployment-cancel" name="cancel">Cancel</button>
      </content-frame>
    </window-frame>


    {/*复制进度窗口*/}
    <window-frame id="copyProgress">
      <title-bar>New Project<close></close></title-bar>
      <content-frame>
        <flex-box id="copyProgress-flex">
          <text>Copying Files...</text>
          <box id="copyProgress-box">
            <box id="copyProgress-bar"></box>
          </box>
          <text id="copyProgress-info"></text>
        </flex-box>
      </content-frame>
    </window-frame>


    {/*关于窗口*/}
    <window-frame id="about">
      <title-bar>Yami RPG Editor<close></close></title-bar>
      <content-frame>
        <grid-box>
          <text>Author</text><text>Yami Sama</text>
          <text>Editor</text><text id="editor-version"></text>
          <text>Electron</text><text id="electron-version"></text>
          <text>Chromium</text><text id="chrome-version"></text>
          <text>Node.js</text><text id="node-version"></text>
          <text>V8</text><text id="v8-version"></text>
          <text>OS</text><text id="os-version"></text>
        </grid-box>
      </content-frame>
    </window-frame>
  </>
)

export { TitleView }
