'use strict'

import './index.css'
import { createElement } from './vhtml/index.js'
import { TitleView } from './title.jsx'
import { ToolsView } from './tools.jsx'
import { ComponentsView } from './components.jsx'
import { LayoutWorkspaceView } from './layout/index.jsx'
import { LayoutContentView } from './layout/content.jsx'
import { PaletteView } from './palette.jsx'
import { SceneView } from './scene.jsx'
import { DataView } from './data.jsx'
import { CommandView } from './command.jsx'
import { VariableView } from './variable.jsx'
import { AttributeView } from './attribute.jsx'
import { EnumView } from './enum.jsx'
import { PluginView } from './plugin.jsx'
import { LogView } from './log.jsx'
import { BrowserView } from './browser.jsx'

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
