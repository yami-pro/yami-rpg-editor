'use strict'

import { createElement } from './vhtml/index.js'

const WorkspacePageManager = () => (
  <page-manager id="workspace-page-manager">

    {/*主页面*/}
    <page-frame value="home">
      <box id="home-content">
        <box id="home-start-list">
          <item id="home-start-label" class="home-list-label">Start</item>
          <item id="home-start-new" class="home-start-item" value="new">New Project</item>
          <item id="home-start-open" class="home-start-item" value="open">Open Project</item>
        </box>
        <box id="home-recent-list" tabindex="-1">
          <item id="home-recent-label" class="home-list-label">Recent</item>
          <item class="home-recent-item" value="0"></item>
          <item class="home-recent-item" value="1"></item>
          <item class="home-recent-item" value="2"></item>
        </box>
      </box>
    </page-frame>

    {/*其他页面*/}
    <page-frame value="directory"></page-frame>
    <page-frame value="scene"></page-frame>
    <page-frame value="ui"></page-frame>
    <page-frame value="animation"></page-frame>
    <page-frame value="particle"></page-frame>
  </page-manager>
)

export { WorkspacePageManager }
