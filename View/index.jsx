'use strict'

import './index.css'
import { createElement } from './vhtml/index.js'
import { TitleView } from './title/title.jsx'
import { ToolsView } from './tools/tools.jsx'
import { ComponentsView } from './components/components.jsx'
import { LayoutWorkspaceView } from './layout/workspace.jsx'
import { LayoutContentView } from './layout/content.jsx'
import { PaletteView } from './palette/palette.jsx'
import { SceneView } from './scene/scene.jsx'
import { DataView } from './data/data.jsx'
import { CommandView } from './command/command.jsx'
import { VariableView } from './variable/variable.jsx'
import { AttributeView } from './attribute/attribute.jsx'
import { EnumView } from './enum/enum.jsx'
import { PluginView } from './plugin/plugin.jsx'
import { LogView } from './log/log.jsx'
import { BrowserView } from './browser/browser.jsx'

const BodyView = (
  <>
    <TitleView />
    <ToolsView />
    <ComponentsView />
    <LayoutWorkspaceView />
    <LayoutContentView />
    <PaletteView />
    <SceneView />
    <DataView />
    <CommandView />
    <VariableView />
    <AttributeView />
    <EnumView />
    <PluginView />
    <LogView />
    <BrowserView />
  </>
)

document.body.innerHTML = (BodyView)
