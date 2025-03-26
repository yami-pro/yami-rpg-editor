// ******************************** 更新管理器 ********************************

const Updater = {
    // methods
    updateProject: null,
    updateConfig: null,
    updateLocalEvents: null,
    updateGlobalEvents: null,
    updateGlobalEvent: null,
    updateActors: null,
    updateSkills: null,
    updateTriggers: null,
    updateItems: null,
    updateEquipments: null,
    updateStates: null,
    updateScenes: null,
    updateTilesets: null,
    updateElements: null,
    updateAnimations: null,
    updateParticles: null,
    updateTeams: null,
    createLocalization: null,
    backupProject: null,
    updateToLatest: null,
    updateIncrementalChanges: null,
    getTsVersionWarning: null,
  }
  
  // 更新项目数据
  Updater.updateProject = function (verNum) {
    // 更新到1.0.122版本
    // 添加openEvents属性
    if (verNum < Editor.getVersionNumber('1.0.122')) {
      if (!Editor.project.openEvents) {
        Editor.project.openEvents = []
      }
      if (!Editor.project.uiPrefabs) {
        Editor.project.uiPrefabs = []
      }
    }
  }
  
  // 更新配置数据
  Updater.updateConfig = function (verNum) {
    // 更新到1.0.14版本
    // 修改font属性为text属性
    // 添加text.wordWrap属性
    // 更新到1.0.45版本
    // 添加collision.trigger属性
    // 更新到1.0.54版本
    // 添加localization.languages属性
    // 添加localization.default属性
    if (verNum < Editor.getVersionNumber('1.0.54')) {
      const sConfig = Data.config
      const dConfig = {}
      for (const key of Object.keys(sConfig)) {
        if (key === 'font') {
          dConfig.text = {
            importedFonts: sConfig.font.imports,
            fontFamily: sConfig.font.default,
            wordWrap: 'break',
          }
        } else {
          switch (key) {
            case 'collision':
              if (!sConfig[key].trigger) {
                sConfig[key].trigger = {
                  collideWithActorShape: false,
                }
              }
              break
          }
          dConfig[key] = sConfig[key]
          switch (key) {
            case 'script':
              // 在script属性后添加localization属性
              if (!sConfig.localization) {
                dConfig.localization = {
                  languages: ['en', 'zh-CN'],
                  default: 'auto',
                }
              }
              break
          }
        }
      }
      Data.config = dConfig
      File.planToSave(Data.manifest.project.config)
    }
    // 更新到1.0.52版本
    // 删除text.pixelated属性
    // 删除text.threshold属性
    if (verNum < Editor.getVersionNumber('1.0.52')) {
      delete Data.config.text.pixelated
      delete Data.config.text.threshold
      File.planToSave(Data.manifest.project.config)
    }
    // 更新到1.0.68版本
    // 删除collision.actor.ignoreTeamMember属性
    if (verNum < Editor.getVersionNumber('1.0.68')) {
      delete Data.config.collision.actor.ignoreTeamMember
      File.planToSave(Data.manifest.project.config)
    }
    // 更新到1.0.102版本
    // 添加resolution.sceneScale属性
    // 添加resolution.uiScale属性
    // 添加resolution.highDefinition属性
    if (verNum < Editor.getVersionNumber('1.0.102')) {
      Data.config.resolution.sceneScale = 1
      Data.config.resolution.uiScale = 1
      Data.config.text.highDefinition = false
      File.planToSave(Data.manifest.project.config)
    }
    // 更新到1.0.115版本
    // 删除text.wordWrap属性
    // 修改localization.languages属性为对象
    // 添加language.name|font|scale属性
    if (verNum < Editor.getVersionNumber('1.0.115')) {
      delete Data.config.text.wordWrap
      const {languages} = Data.config.localization
      for (let i = 0; i < languages.length; i++) {
        if (typeof languages[i] === 'string') {
          languages[i] = {
            name: languages[i],
            font: '',
            scale: 1,
          }
        }
      }
      File.planToSave(Data.manifest.project.config)
    }
    // 更新到1.0.122版本
    // 添加deployed属性
    // 修改window.display的值: 'window'->'windowed'
    // 添加axis.up|down|left|right属性
    // 删除actor.playerTeam|playerActor|partyMembers|partyInventory属性
    // 添加webgl.desynchronized属性
    // 删除script.language|outDir属性
    // 添加script.autoCompile属性
    // 添加save.location|subdirectory属性
    // 删除event属性，修改对应的事件类型
    if (verNum < Editor.getVersionNumber('1.0.122')) {
      const {config, events} = Data
      if (config.deployed === undefined) {
        config.deployed = false
      }
      if (config.window.display === 'window') {
        config.window.display = 'windowed'
      }
      if (!config.virtualAxis) {
        config.virtualAxis = {
          up: 'KeyW',
          down: 'KeyS',
          left: 'KeyA',
          right: 'KeyD',
        }
      }
      delete config.actor.playerTeam
      delete config.actor.playerActor
      delete config.actor.partyMembers
      delete config.actor.partyInventory
      if (config.webgl === undefined) {
        config.webgl = {desynchronized: false}
      }
      delete config.script.language
      delete config.script.outDir
      config.script.autoCompile = true
      config.save = {
        location: 'local',
        subdir: config.gameId,
      }
      if (config.event) {
        const {startup, loadGame, initScene, showText, showChoices} = config.event
        if (events[startup]) {
          events[startup].type = 'startup'
        }
        if (events[loadGame]) {
          events[loadGame].type = 'loadsave'
        }
        if (events[initScene]) {
          events[initScene].type = 'createscene'
        }
        if (events[showText]) {
          events[showText].type ='showtext'
        }
        if (events[showChoices]) {
          events[showChoices].type ='showchoices'
        }
        delete config.event
      }
      File.planToSave(Data.manifest.project.config)
    }
    // 更新到1.0.127版本
    // 添加webgl.textureMagFilter属性
    // 添加webgl.textureMinFilter属性
    // 添加preload属性
    if (verNum < Editor.getVersionNumber('1.0.127')) {
      const {config} = Data
      if (config.webgl.textureMagFilter === undefined) {
        config.webgl = {
          desynchronized: config.webgl.desynchronized,
          textureMagFilter: 'nearest',
          textureMinFilter: 'linear',
        }
      }
      if (config.preload === undefined) {
        config.preload = 'never'
      }
      File.planToSave(Data.manifest.project.config)
    }
  }
  
  // 更新本地事件数据
  Updater.updateLocalEvents = function (verNum) {
    // 更新到1.0.122版本：添加enabled属性
    if (verNum < Editor.getVersionNumber('1.0.122')) {
      const listMap = EventEditor.getAllLocalEvents()
      for (const [guid, events] of Object.entries(listMap)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        for (const event of events) {
          const {commands} = event
          delete event.commands
          event.enabled = true
          event.commands = commands
        }
        File.planToSave(meta, guid)
      }
    }
  }
  
  // 更新全局事件数据
  Updater.updateGlobalEvents = function (verNum) {
    // 更新到1.0.105版本：添加priority属性
    // 更新到1.0.122版本：添加namespace|return|description|parameters属性
    if (verNum < Editor.getVersionNumber('1.0.122')) {
      const events = Data.events
      const keys = Object.keys(Inspector.fileEvent.create('global'))
      for (const [guid, sEvent] of Object.entries(events)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        const dEvent = Inspector.fileEvent.create('global')
        for (const key of keys) {
          if (key in sEvent) {
            dEvent[key] = sEvent[key]
            continue
          }
          switch (key) {
            case 'namespace':
              dEvent[key] = false
              continue
          }
        }
        events[guid] = dEvent
        File.planToSave(meta)
      }
    }
  }
  
  // 更新单个全局事件数据
  Updater.updateGlobalEvent = function (meta) {
    // 更新到1.0.105版本：添加priority属性
    // 更新到1.0.122版本：添加namespace|return|description|parameters属性
    const guid = meta.guid
    const sEvent = Data.events[guid]
    if ('namespace' in sEvent || 'priority' in sEvent) return
    const dEvent = Inspector.fileEvent.create('global')
    for (const key of Object.keys(dEvent)) {
      if (key in sEvent) {
        dEvent[key] = sEvent[key]
        continue
      }
      switch (key) {
        case 'namespace':
          dEvent[key] = false
          continue
      }
    }
    Data.events[guid] = dEvent
    File.planToSave(meta)
  }
  
  // 更新角色数据
  Updater.updateActors = function (verNum) {
    // 更新到1.0.13版本：添加scale属性
    // 更新到1.0.28版本：添加priority属性
    // 更新到1.0.45版本：添加shape属性
    // 更新到1.0.105版本：添加inventory属性
    // 更新到1.0.122版本：添加immovable|inherit属性
    if (verNum < Editor.getVersionNumber('1.0.122')) {
      const actors = Data.actors
      const keys = Object.keys(Inspector.fileActor.create())
      for (const [guid, sActor] of Object.entries(actors)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        const dActor = Inspector.fileActor.create()
        for (const key of keys) {
          if (key in sActor) {
            dActor[key] = sActor[key]
            continue
          }
          switch (key) {
            case 'immovable':
              dActor[key] = false
              continue
          }
        }
        actors[guid] = dActor
        File.planToSave(meta)
      }
    }
  }
  
  // 更新技能数据
  Updater.updateSkills = function (verNum) {
    // 更新到1.0.122版本：添加inherit属性
    if (verNum < Editor.getVersionNumber('1.0.122')) {
      const skills = Data.skills
      const keys = Object.keys(Inspector.fileSkill.create())
      for (const [guid, sSkill] of Object.entries(skills)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        const dSkill = Inspector.fileSkill.create()
        for (const key of keys) {
          if (key in sSkill) {
            dSkill[key] = sSkill[key]
          }
        }
        skills[guid] = dSkill
        File.planToSave(meta)
      }
    }
  }
  
  // 更新触发器数据
  Updater.updateTriggers = function (verNum) {
    // 更新到1.0.122版本：添加inherit属性
    if (verNum < Editor.getVersionNumber('1.0.122')) {
      const triggers = Data.triggers
      const keys = Object.keys(Inspector.fileTrigger.create())
      for (const [guid, sTrigger] of Object.entries(triggers)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        const dTrigger = Inspector.fileTrigger.create()
        for (const key of keys) {
          if (key in sTrigger) {
            dTrigger[key] = sTrigger[key]
          }
        }
        triggers[guid] = dTrigger
        File.planToSave(meta)
      }
    }
  }
  
  // 更新物品数据
  Updater.updateItems = function (verNum) {
    // 更新到1.0.122版本：添加inherit属性
    if (verNum < Editor.getVersionNumber('1.0.122')) {
      const items = Data.items
      const keys = Object.keys(Inspector.fileItem.create())
      for (const [guid, sItem] of Object.entries(items)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        const dItem = Inspector.fileItem.create()
        for (const key of keys) {
          if (key in sItem) {
            dItem[key] = sItem[key]
          }
        }
        items[guid] = dItem
        File.planToSave(meta)
      }
    }
  }
  
  // 更新装备数据
  Updater.updateEquipments = function (verNum) {
    // 更新到1.0.122版本：添加inherit属性
    if (verNum < Editor.getVersionNumber('1.0.122')) {
      const equipments = Data.equipments
      const keys = Object.keys(Inspector.fileEquipment.create())
      for (const [guid, sEquipment] of Object.entries(equipments)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        const dEquipment = Inspector.fileEquipment.create()
        for (const key of keys) {
          if (key in sEquipment) {
            dEquipment[key] = sEquipment[key]
          }
        }
        equipments[guid] = dEquipment
        File.planToSave(meta)
      }
    }
  }
  
  // 更新状态数据
  Updater.updateStates = function (verNum) {
    // 更新到1.0.122版本：添加inherit属性
    if (verNum < Editor.getVersionNumber('1.0.122')) {
      const states = Data.states
      const keys = Object.keys(Inspector.fileState.create())
      for (const [guid, sState] of Object.entries(states)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        const dState = Inspector.fileState.create()
        for (const key of keys) {
          if (key in sState) {
            dState[key] = sState[key]
          }
        }
        states[guid] = dState
        File.planToSave(meta)
      }
    }
  }
  
  // 更新场景数据
  Updater.updateScenes = function (verNum) {
    // 替换场景对象
    const replaceSceneObject = replacer => {
      // 遍历对象列表中的所有对象
      const forEachObject = (objects, replacer, meta) => {
        const length = objects.length
        for (let i = 0; i < length; i++) {
          const object = objects[i]
          // 如果替换器函数返回对象，则替换原对象
          const replacement = replacer(object)
          if (replacement instanceof Object) {
            objects[i] = replacement
            // 计划保存场景文件
            File.planToSave(meta)
          }
          // 遍历下一级目录的对象
          if (object.children instanceof Array) {
            forEachObject(object.children, replacer, meta)
          }
        }
      }
      // 遍历所有场景
      for (const [guid, scene] of Object.entries(Data.scenes)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        forEachObject(scene.objects, replacer, meta)
      }
    }
    // 更新到1.0.116版本
    // 删除scene.contrast属性
    // 添加scene.ambient.direct属性
    if (verNum < Editor.getVersionNumber('1.0.116')) {
      for (const [guid, scene] of Object.entries(Data.scenes)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        delete scene.contrast
        scene.ambient.direct = 0
        File.planToSave(meta)
      }
    }
    // 更新到1.0.116版本：添加light.direct属性
    if (verNum < Editor.getVersionNumber('1.0.116')) {
      const keys = Object.keys(Inspector.sceneLight.create())
      replaceSceneObject(object => {
        if (object.class === 'light') {
          const sLight = object
          const dLight = Inspector.sceneLight.create()
          for (const key of keys) {
            if (key in sLight) {
              dLight[key] = sLight[key]
            }
          }
          return dLight
        }
      })
    }
    // 更新到1.0.122版本：添加actor.type属性
    if (verNum < Editor.getVersionNumber('1.0.122')) {
      const keys = Object.keys(Inspector.sceneActor.create())
      replaceSceneObject(object => {
        if (object.class === 'actor') {
          const sActor = object
          const dActor = Inspector.sceneActor.create()
          for (const key of keys) {
            if (key in sActor) {
              dActor[key] = sActor[key]
            }
          }
          return dActor
        }
      })
    }
  }
  
  // 更新图块组数据
  Updater.updateTilesets = function (verNum) {
    // 更新到1.0.60版本：添加terrains属性
    if (verNum < Editor.getVersionNumber('1.0.60')) {
      const tilesets = Data.tilesets
      for (const [guid, tileset] of Object.entries(tilesets)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        const length = tileset.width * tileset.height
        tileset.terrains = new Array(length).fill(0)
        File.planToSave(meta)
      }
    }
    // 更新到1.0.85版本：添加tags属性
    if (verNum < Editor.getVersionNumber('1.0.85')) {
      const tilesets = Data.tilesets
      for (const [guid, tileset] of Object.entries(tilesets)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        const length = tileset.width * tileset.height
        tileset.tags = new Array(length).fill(0)
        File.planToSave(meta)
      }
    }
  }
  
  // 更新元素数据
  Updater.updateElements = function (verNum) {
    // 替换界面元素
    const replaceUIElement = replacer => {
      // 遍历元素列表中的所有元素
      const forEachElement = (nodes, replacer, meta) => {
        const length = nodes.length
        for (let i = 0; i < length; i++) {
          const node = nodes[i]
          // 如果替换器函数返回对象，则替换原对象
          const replacement = replacer(node)
          if (replacement instanceof Object) {
            nodes[i] = replacement
            // 计划保存界面文件
            File.planToSave(meta)
          }
          // 遍历下一级目录的对象
          if (node.children instanceof Array) {
            forEachElement(node.children, replacer, meta)
          }
        }
      }
      // 遍历所有界面
      for (const [guid, ui] of Object.entries(Data.ui)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        forEachElement(ui.nodes, replacer, meta)
      }
    }
    // 更新到1.0.40版本
    // 添加button.normalClip属性
    // 添加button.hoverClip属性
    // 添加button.activeClip属性
    // 添加button.imageOpacity属性
    if (verNum < Editor.getVersionNumber('1.0.40')) {
      const keys = Object.keys(Inspector.uiButton.create())
      replaceUIElement(sNode => {
        if (sNode.class === 'button') {
          const dNode = Inspector.uiButton.create()
          for (const key of keys) {
            if (key in sNode) {
              dNode[key] = sNode[key]
              continue
            }
            switch (key) {
              case 'normalClip':
              case 'hoverClip':
              case 'activeClip':
                dNode[key] = sNode.clip.slice()
                continue
              case 'textPadding':
                dNode[key] = sNode.padding
                continue
            }
          }
          return dNode
        }
      })
    }
    // 更新到1.0.61版本
    // 添加element.pointerEvents属性
    if (verNum < Editor.getVersionNumber('1.0.61')) {
      const keysMap = {}
      replaceUIElement(sNode => {
        let keys = keysMap[sNode.class]
        if (keys === undefined) {
          const type = UI.inspectorTypeMap[sNode.class]
          const node = Inspector[type].create()
          keys = keysMap[sNode.class] = Object.keys(node)
        }
        const dNode = {}
        for (const key of keys) {
          if (key in sNode) {
            dNode[key] = sNode[key]
            continue
          }
          switch (key) {
            case 'pointerEvents':
              dNode[key] = 'enabled'
              continue
          }
        }
        return dNode
      })
    }
    // 更新到1.0.118版本
    // 添加video.playbackRate属性
    if (verNum < Editor.getVersionNumber('1.0.118')) {
      const keys = Object.keys(Inspector.uiVideo.create())
      replaceUIElement(sNode => {
        if (sNode.class === 'video') {
          const dNode = Inspector.uiVideo.create()
          for (const key of keys) {
            if (key in sNode) {
              dNode[key] = sNode[key]
            }
          }
          return dNode
        }
      })
    }
  }
  
  // 更新动画数据
  Updater.updateAnimations = function (verNum) {
    // 更新到1.0.37版本：添加精灵帧anchorX, anchorY, pivotX, pivotY属性
    if (verNum < Editor.getVersionNumber('1.0.37')) {
      const keys = Object.keys(Inspector.animSpriteFrame.create())
      // 更新图层中的精灵帧
      const update = layers => {
        for (const layer of layers) {
          switch (layer.class) {
            case 'joint':
              update(layer.children)
              continue
            case 'sprite': {
              const frames = layer.frames
              const length = frames.length
              for (let i = 0; i < length; i++) {
                const sFrame = frames[i]
                const dFrame = Inspector.animSpriteFrame.create()
                // 默认锚点和轴点有可能被修改，还是重新设置一下
                dFrame.anchorX = 0.5
                dFrame.anchorY = 0.5
                dFrame.pivotX = 0
                dFrame.pivotY = 0
                for (const key of keys) {
                  if (key in sFrame) {
                    dFrame[key] = sFrame[key]
                  }
                }
                frames[i] = dFrame
              }
              continue
            }
          }
        }
      }
      for (const [guid, animation] of Object.entries(Data.animations)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        for (const motion of animation.motions) {
          for (const dirCase of motion.dirCases) {
            update(dirCase.layers)
          }
        }
        File.planToSave(meta)
      }
    }
  }
  
  // 更新粒子数据
  Updater.updateParticles = function (verNum) {
    // 更新到1.0.95版本：[min, max]参数换算成[std, dev]
    if (verNum < Editor.getVersionNumber('1.0.95')) {
      // 转换[min, max]到[std, dev]
      const convert = array => {
        const min = array[0]
        const max = array[1]
        const std = Math.roundTo((min + max) / 2, 4)
        const dev = Math.roundTo(Math.abs(std - min), 4)
        array[0] = std
        array[1] = dev
      }
      for (const [guid, particle] of Object.entries(Data.particles)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        for (const layer of particle.layers) {
          convert(layer.anchor.x)
          convert(layer.anchor.y)
          convert(layer.anchor.speedX)
          convert(layer.anchor.speedY)
          convert(layer.movement.angle)
          convert(layer.movement.speed)
          convert(layer.movement.accelAngle)
          convert(layer.movement.accel)
          convert(layer.rotation.angle)
          convert(layer.rotation.speed)
          convert(layer.rotation.accel)
          convert(layer.hRotation.radius)
          convert(layer.hRotation.expansionSpeed)
          convert(layer.hRotation.expansionAccel)
          convert(layer.hRotation.angle)
          convert(layer.hRotation.angularSpeed)
          convert(layer.hRotation.angularAccel)
          convert(layer.scale.factor)
          convert(layer.scale.speed)
          convert(layer.scale.accel)
        }
        File.planToSave(meta)
      }
    }
    // 更新到1.0.122版本
    // 删除hframes|vframes属性
    // 添加sprite属性
    if (verNum < Editor.getVersionNumber('1.0.122')) {
      const keys = Object.keys(Inspector.particleLayer.create())
      for (const [guid, particle] of Object.entries(Data.particles)) {
        const meta = Data.manifest.guidMap[guid]
        if (meta === undefined) {
          throw new Error(`Missing metadata: ${guid}`)
        }
        const layers = particle.layers
        for (let i = 0; i < layers.length; i++) {
          const sLayer = layers[i]
          const dLayer = Inspector.particleLayer.create()
          for (const key of keys) {
            if (key in sLayer) {
              dLayer[key] = sLayer[key]
              continue
            }
            switch (key) {
              case 'sprite':
                if (typeof sLayer.hframes === 'number') {
                  dLayer[key].hframes = sLayer.hframes
                }
                if (typeof sLayer.vframes === 'number') {
                  dLayer[key].vframes = sLayer.vframes
                }
                continue
            }
          }
          layers[i] = dLayer
        }
        File.planToSave(meta)
      }
    }
  }
  
  // 更新队伍数据
  Updater.updateTeams = function (verNum) {
    // 更新到1.0.68版本：添加collisions属性
    if (verNum < Editor.getVersionNumber('1.0.68')) {
      Data.teams.collisions = Codec.encodeTeamData(
        Codec.decodeTeamData(
          Data.teams.relations,
          Data.teams.list.length
        ).fill(1)
      )
      File.planToSave(Data.manifest.project.teams)
    }
  }
  
  // 创建本地化数据
  Updater.createLocalization = async function (verNum) {
    if (verNum < Editor.getVersionNumber('1.0.54')) {
      const path = File.route('Data/localization.json')
      const json = JSON.stringify({list: []}, null, 2)
      await FSP.writeFile(path, json)
    }
  }
  
  // 备份项目
  Updater.backupProject = function () {
    const projectPath = File.root
    const folderName = Path.basename(projectPath)
    const backupPath = Path.resolve(projectPath, `../${folderName}.bak`)
    FS.cpSync(projectPath, backupPath, {recursive: true})
  }
  
  // 更新到最新版本(TypeScript)
  Updater.updateToLatest = function (version) {
    // 从1.0.122版本开始增量替换文件
    const verNum = Editor.getVersionNumber(version)
    if (verNum >= Editor.getVersionNumber('1.0.122')) {
      return Updater.updateIncrementalChanges(version)
    }
  
    // 1.0.122以下版本直接覆盖全部文件
    const dstProjectDir = Path.dirname(Editor.config.project)
    const srcProjectDir = Path.resolve(__dirname, 'Templates/arpg-ts-update')
    const srcScriptDir = Path.resolve(__dirname, 'Templates/arpg-ts-update/script')
    const srcPluginDir = Path.resolve(__dirname, 'Templates/arpg-ts-update/plugins')
    const dstScriptDir = Path.resolve(dstProjectDir, 'Script')
  
    // 删除JS文件
    const deleteScripts = [
      'util.js',
      'file.js',
      'codec.js',
      'webgl.js',
      'audio.js',
      'printer.js',
      'variable.js',
      'animation.js',
      'data.js',
      'local.js',
      'stage.js',
      'camera.js',
      'scene.js',
      'actor.js',
      'trigger.js',
      'filter.js',
      'controller.js',
      'ui.js',
      'time.js',
      'event.js',
      'command.js',
      'main.js',
    ]
    for (const fileName of deleteScripts) {
      const path = Path.resolve(dstScriptDir, fileName)
      try {
        if (FS.statSync(path).isFile()) {
          FS.unlinkSync(path)
        }
      } catch (error) {}
    }
  
    // 复制TS文件
    FS.cpSync(srcScriptDir, dstScriptDir, {recursive: true})
  
    // 替换插件文件
    const jsExtname = /\.js$/
    const guidRegExp = /(?<=\.)[0-9a-f]{16}(?=\.\w+$)/
    const files = FS.readdirSync(srcPluginDir, {withFileTypes: true})
    for (const file of files) {
      const guid = guidRegExp.exec(file.name)?.[0]
      const meta = Data.manifest.guidMap[guid]
      if (meta) {
        // 如果当前项目版本小于插件项目版本，则更新
        const sPath = Path.resolve(srcPluginDir, file.name)
        const jsPath = File.route(meta.path)
        const tsPath = File.route(meta.path.replace(jsExtname, '.ts'))
        FS.copyFileSync(sPath, jsPath)
        FS.renameSync(jsPath, tsPath)
      }
    }
  
    // 替换主页文件
    const sIndexPath = Path.resolve(srcProjectDir, 'index.html')
    const dIndexPath = Path.resolve(dstProjectDir, 'index.html')
    FS.copyFileSync(sIndexPath, dIndexPath)
  
    // 复制tsconfig文件
    const sTsconfigPath = Path.resolve(srcProjectDir, 'tsconfig.json')
    const dTsconfigPath = Path.resolve(dstProjectDir, 'tsconfig.json')
    FS.copyFileSync(sTsconfigPath, dTsconfigPath)
  
    // 打开更新日志窗口
    UpdateLog.open()
  }
  
  // 更新增量改动
  Updater.updateIncrementalChanges = function (version) {
    const verNum = Editor.getVersionNumber(version)
    const dstProjectDir = Path.dirname(Editor.config.project)
    const srcProjectDir = Path.resolve(__dirname, 'Templates/arpg-ts-update')
    const srcScriptDir = Path.resolve(__dirname, 'Templates/arpg-ts-update/script')
    const srcPluginDir = Path.resolve(__dirname, 'Templates/arpg-ts-update/plugins')
    const dstScriptDir = Path.resolve(dstProjectDir, 'Script')
    const bakFolderDir = Path.resolve(dstProjectDir, `${version}.bak`)
    const messages = []
    const copyedFiles = {}
    let isBackupFolderCreated = false
  
    // 更新程序集合
    const updater = new class Updater {
      showMessage() {
        if (messages.length !== 0) {
          UpdateLog.open(messages)
        }
      }
  
      logVersion(version) {
        messages.push({title: `Update ${version}`})
      }
  
      logMessage(...contents) {
        messages.push({major: contents.join('\n')})
      }
  
      logReplace(dstPath) {
        const path = Path.relative(dstProjectDir, dstPath)
        const message = `write: ${path}`
        messages.push({minor: this.capitalize(message)})
        console.log(message)
      }
  
      capitalize(message) {
        return message.charAt(0).toUpperCase() + message.slice(1)
      }
  
      makeBakupFolder() {
        if (!isBackupFolderCreated) {
          isBackupFolderCreated = true
          FS.mkdirSync(bakFolderDir, {recursive: true})
          const folderName = Path.basename(bakFolderDir)
          const message = `backup: ${folderName}`
          messages.push({minor: this.capitalize(message)})
          console.log(message)
        }
      }
  
      // 复制文件
      copyFile(srcPath, dstPath) {
        if (copyedFiles[dstPath]) {
          return
        }
        copyedFiles[dstPath] = true
        try {
          if (FS.statSync(dstPath).isFile()) {
            this.makeBakupFolder()
            const dstName = Path.basename(dstPath)
            const bakPath = Path.resolve(bakFolderDir, dstName)
            FS.copyFileSync(dstPath, bakPath)
            FS.copyFileSync(srcPath, dstPath)
            this.logReplace(dstPath)
          }
        } catch (error) {
          console.error(error)
        }
      }
  
      // 复制文件
      copyFiles(...fileNames) {
        for (const fileName of fileNames) {
          const srcFilePath = Path.resolve(srcProjectDir, fileName)
          const dstFilePath = Path.resolve(dstProjectDir, fileName)
          this.copyFile(srcFilePath, dstFilePath)
        }
      }
  
      // 复制脚本文件
      copyScripts(...fileNames) {
        for (const fileName of fileNames) {
          const srcScriptPath = Path.resolve(srcScriptDir, fileName)
          const dstScriptPath = Path.resolve(dstScriptDir, fileName)
          this.copyFile(srcScriptPath, dstScriptPath)
        }
      }
  
      // 复制插件文件
      copyPlugins(...filters) {
        const guidRegExp = /(?<=\.)[0-9a-f]{16}(?=\.\w+$)/
        const files = FS.readdirSync(srcPluginDir, {withFileTypes: true})
        for (const file of files) {
          const guid = guidRegExp.exec(file.name)?.[0]
          if (filters.length === 0 || filters.includes(guid)) {
            const meta = Data.manifest.guidMap[guid]
            if (meta) {
              // 如果当前项目版本小于插件项目版本，则更新
              const sPath = Path.resolve(srcPluginDir, file.name)
              const dPath = File.route(meta.path)
              this.copyFile(sPath, dPath)
            }
          }
        }
      }
  
      '1.0.122'() {
        this.logMessage('Rewrite the game script in TypeScript and replace all built-in script and plugin files.')
      }
  
      '1.0.123'(update) {
        this.logMessage('Fix the bug where the scene terrain was not applied.')
        if (!update) return
        this.copyScripts('scene.ts', 'actor.ts')
      }
  
      '1.0.124'(update) {
        this.logMessage('Add some event types to the global event script.')
        if (!update) return
        this.copyScripts('event.ts', 'yami/yami.script.d.ts')
      }
  
      '1.0.125'(update) {
        this.logMessage('Fix a bug where a "touch event" was not mapped to a "mouse event".')
        if (!update) return
        this.copyScripts('util.ts', 'input.ts')
      }
  
      '1.0.126'(update) {
        this.logMessage('Fix the incorrect behavior of the “mouse leave element” event in a special case.')
        if (!update) return
        this.copyScripts('ui.ts')
      }
  
      '1.0.127'(update) {
        this.logMessage(
          'Prioritize the loading order of plugin scripts.',
          'Add project settings options: Preload, Texture Sampling Mode.',
          'Add touch events to the global event script.',
          'Fix the bug where two immovable circular actors may move when they collide.',
        )
        if (!update) return
        this.copyScripts(
          'actor.ts',
          'audio.ts',
          'input.ts',
          'loader.ts',
          'animation.ts',
          'event.ts',
          'util.ts',
          'main.ts',
          'stage.ts',
          'printer.ts',
          'data.ts',
          'command.ts',
          'scene.ts',
          'webgl.ts',
          'yami/yami.data.d.ts',
          'yami/yami.actor.d.ts',
          'yami/yami.event.d.ts',
          'yami/yami.script.d.ts',
          'yami/yami.webgl.d.ts',
        )
        this.copyPlugins(
          '78ad4052c278d184',
          'ad08a4def6200207',
          'bc72195fc998f0af',
        )
      }
  
      '1.0.128'(update) {
        this.logMessage('Secret!')
        if (!update) return
        this.copyScripts(
          'audio.ts',
          'loader.ts',
          'data.ts',
          'yami/yami.data.d.ts',
        )
      }
  
      '1.0.129'(update) {
        this.logMessage(
          'The objects read in the event will undergo a validity check, and destroyed objects will no longer be retrieved.',
          'Add "destroyed" property to element objects in code.',
        )
        if (!update) return
        this.copyScripts('ui.ts', 'command.ts')
      }
  
      '1.0.130'(update) {
        this.logMessage(
          'Extends the "Block" command with a new asynchronous execution option.',
          'A warning is issued to the user for “Independent” commands running in the background for over 1 minute.',
          'Delayed the camera update timing within the current frame, allowing it to lock onto the target more quickly.',
          'Optimized the tilemap loading process. When preloading images, loading is no longer required, enabling seamless map transitions.',
        )
        if (!update) return
        this.copyFiles('tsconfig.json')
        this.copyScripts('scene.ts', 'camera.ts', 'animation.ts', 'event.ts', 'command.ts', 'main.ts')
      }
    }
  
    const verLatest = Editor.getVersionNumber(Editor.latestProjectVersion)
    const currentMinorVer = verNum % 10000
    const latestMinorVer = verLatest % 10000
    const initialMinorVer = 122
    for (let minorVer = latestMinorVer; minorVer >= initialMinorVer; minorVer--) {
      const version = `1.0.${minorVer}`
      const handler = updater[version]
      if (handler) {
        updater.logVersion(version)
        handler.call(updater, currentMinorVer < minorVer)
      }
    }
    updater.showMessage()
  }
  
  // 获取TS版本更新警告
  Updater.getTSVersionWarning = function () {
    if ('zh-CN|zh-TW'.includes(Local.language)) {
      return {
        message: `当前项目版本: 1.0.121\n将升级到版本: ${Editor.latestProjectVersion}\n本次为破坏性更新，替换项目中的JS为TS脚本，一部分变量命名发生了变化。\n这可能导致用户导入的插件和指令脚本失效报错。\n建议在更新前手动备份项目文件夹，点击更新后也会在项目的父级目录下生成备份。\n如果你有旧项目需要升级，请按照Steam更新公告中的步骤来修复因更新造成的错误。\n如果想继续用上一个版本，打开Steam->库->应用->属性->测试版，选择JS版本分支。\n对于造成的不便十分抱歉，今后TS版本将是长期稳定版本，不再大幅修改。`,
        confirm: '立即更新',
        cancel: '不想升级',
      }
    } else {
      return {
        "message": `Current project version: 1.0.121\nUpgrading to version: ${Editor.latestProjectVersion}\nThis is a breaking update, replacing JS scripts in the project with TS scripts, causing some variable names to change.\nThis may result in imported plugins and command scripts failing or reporting errors.\nIt is recommended to manually back up the project folder before updating. A backup will also be created in the parent directory of the project after clicking update.\nIf you have an old project that needs upgrading, please follow the steps in the Steam update announcement to fix errors caused by the update.\nIf you wish to continue using the previous version, go to Steam -> Library -> Application -> Properties -> Betas and select the JS version branch.\nWe sincerely apologize for the inconvenience. The TS version will be the long-term stable version, with no major modifications.`,
        "confirm": 'Update Now',
        "cancel": 'Cancel',
      }
    }
  }