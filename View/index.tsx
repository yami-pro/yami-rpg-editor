'use strict'

import './index.css'
import { createElement } from './vhtml/index'
import { TitleView } from './title/title'
import { ToolsView } from './tools/tools'
import { ComponentsView } from './components/components'
import { LayoutWorkspaceView } from './layout/workspace'
import { LayoutContentView } from './layout/content'
import { PaletteView } from './palette/palette'
import { SceneView } from './scene/scene'
import { DataView } from './data/data'
import { CommandView } from './command/command'
import { VariableView } from './variable/variable'
import { AttributeView } from './attribute/attribute'
import { EnumView } from './enum/enum'
import { PluginView } from './plugin/plugin'
import { LogView } from './log/log'
import { BrowserView } from './browser/browser'

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
