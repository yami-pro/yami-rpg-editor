'use strict'

// ******************************** 主页面对象 ********************************

const Home = {
  // methods
  initialize: null,
  parseRecentProjects: null,
  removeRecentProject: null,
  readFileList: null,
  // events
  windowLocalize: null,
  startClick: null,
  recentClick: null,
  recentPointerup: null,
}

// 初始化
Home.initialize = function () {
  // 侦听事件
  window.on('localize', this.windowLocalize)
  $('#home-start-list').on('click', this.startClick)
  $('#home-recent-list').on('click', this.recentClick)
  $('#home-recent-list').on('pointerup', this.recentPointerup)
}

// 解析最近的项目
Home.parseRecentProjects = function () {
  const nodes = $('.home-recent-item')
  const items = Editor.config.recent
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i].clear()
    const item = items[i]
    if (!item) {
      node.hide()
      continue
    } else {
      node.show()
    }

    // 创建标题栏
    const eBar = document.createElement('box')
    eBar.addClass('home-recent-bar')
    node.appendChild(eBar)

    // 创建标题文本
    const eTitle = document.createElement('text')
    eTitle.addClass('home-recent-title')
    eBar.appendChild(eTitle)

    // 创建日期文本
    const eDate = document.createElement('text')
    const date = new Date(item.date)
    const Y = date.getFullYear()
    const M = date.getMonth() + 1
    const D = date.getDate()
    const h = date.getHours()
    const m = date.getMinutes()
    const m2 = m.toString().padStart(2, '0')
    eDate.addClass('home-recent-date')
    eDate.textContent = `${Y}/${M}/${D} ${h}:${m2}`
    eBar.appendChild(eDate)

    // 创建路径文本
    const ePath = document.createElement('text')
    const path = item.path
    ePath.addClass('home-recent-path')
    ePath.textContent = Path.normalize(path)
    node.appendChild(ePath)

    // 创建统计列表
    const eStat = document.createElement('box')
    eStat.addClass('home-recent-stat')
    node.appendChild(eStat)

    // 检查文件是否存在
    const dirname = Path.dirname(path)
    new Promise((resolve, reject) => {
      if (FS.existsSync(path)) {
        const dPath = `${dirname}/data/config.json`
        resolve(FSP.readFile(dPath, 'utf8'))
      } else {
        reject(new URIError())
      }
    }).then(data => {
      // 设置标题文本
      const {window} = JSON.parse(data)
      eTitle.textContent = window.title
      return this.readFileList(dirname)
    }).then(list => {
      const counts = {
        folder: 0,
        data: 0,
        script: 0,
        image: 0,
        media: 0,
        other: 0,
        total: 0,
      }
      const sizes = {
        folder: 0,
        data: 0,
        script: 0,
        image: 0,
        media: 0,
        other: 0,
        total: 0,
      }
      const length = list.length
      for (let i = 0; i < length; i++) {
        const {type, size} = list[i]
        counts[type] += 1
        sizes[type] += size
      }
      counts.total =
        counts.data
      + counts.script
      + counts.image
      + counts.media
      + counts.other
      sizes.total =
        sizes.data
      + sizes.script
      + sizes.image
      + sizes.media
      + sizes.other
      const get = Local.createGetter('stats')
      for (const {type, name} of [
        {type: 'data',   name: get('data')},
        {type: 'script', name: get('script')},
        {type: 'image',  name: get('image')},
        {type: 'media',  name: get('media')},
        {type: 'other',  name: get('other')},
        {type: 'total',  name: get('total')},
      ]) {
        const count = counts[type]
        const size = File.parseFileSize(sizes[type])

        // 创建统计文本
        const eText1 = document.createElement('text')
        const eText2 = document.createElement('text')
        const eText3 = document.createElement('text')
        eText1.addClass('home-recent-data')
        eText2.addClass('home-recent-data')
        eText3.addClass('home-recent-data')
        eText1.textContent = name
        eText2.textContent = size
        eText3.textContent = `(${count})`
        eStat.appendChild(eText1)
        eStat.appendChild(eText2)
        eStat.appendChild(eText3)
      }
      node.show()
    }).catch(error => {
      node.addClass('disabled')
      if (error instanceof URIError) {
        eTitle.textContent = 'Project does not exist'
      } else {
        eTitle.textContent = 'Failed to load data'
      }
    })
  }
}

// 移除最近的项目
Home.removeRecentProject = function (index) {
  const nodes = $('.home-recent-item')
  const items = Editor.config.recent
  const item = items[index]
  const node = nodes[index]
  if (item && node) {
    items.remove(item)
    node.clear()
    const end = nodes.length - 1
    for (let i = index; i < end; i++) {
      const sNode = nodes[i + 1]
      const dNode = nodes[i]
      const array = Array.from(sNode.childNodes)
      for (const node of array) {
        dNode.appendChild(node)
      }
    }
    nodes[items.length].hide()
  }
}

// 读取文件列表
Home.readFileList = function IIFE() {
  const extnameToTypeMap = {
    // 数据类型
    '.actor': 'data',
    '.skill': 'data',
    '.trigger': 'data',
    '.item': 'data',
    '.equip': 'data',
    '.state': 'data',
    '.event': 'data',
    '.scene': 'data',
    '.tile': 'data',
    '.ui': 'data',
    '.anim': 'data',
    '.particle': 'data',
    '.json': 'data',
    // 脚本类型
    '.js': 'script',
    '.ts': 'script',
    // 图像类型
    '.png': 'image',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.cur': 'image',
    '.webp': 'image',
    // 媒体类型
    '.mp3': 'media',
    '.m4a': 'media',
    '.ogg': 'media',
    '.wav': 'media',
    '.flac': 'media',
    '.mp4': 'media',
    '.mkv': 'media',
    '.webm': 'media',
    // 其他类型
    '.ttf': 'other',
    '.otf': 'other',
    '.woff': 'other',
    '.woff2': 'other',
  }
  const options = {withFileTypes: true}
  const read = (path, list) => {
    return FSP.readdir(
      path,
      options,
    ).then(
      async files => {
        if (path) {
          path += '/'
        }
        const promises = []
        for (const file of files) {
          const name = file.name
          const newPath = `${path}${name}`
          if (file.isDirectory()) {
            list.push({
              type: 'folder',
              size: 0,
            })
            promises.push(read(
              newPath, list,
            ))
          } else {
            const extname = Path.extname(name)
            const type = extnameToTypeMap[extname] ?? 'other'
            const item = {
              type: type,
              size: 0,
            }
            list.push(item)
            promises.push(FSP.stat(newPath).then(
              stats => {
                item.size = stats.size
            }))
          }
        }
        if (promises.length !== 0) {
          await Promise.all(promises)
        }
        return list
      }
    )
  }
  return function (path) {
    return read(path, [])
  }
}()

// 窗口 - 本地化事件
Home.windowLocalize = function (event) {
  if (Layout.manager.index === 'home') {
    Home.parseRecentProjects()
  }
}

// 开始列表 - 鼠标点击事件
Home.startClick = function (event) {
  const element = event.target
  if (element.hasClass('home-start-item')) {
    switch (element.getAttribute('value')) {
      case 'new':
        Title.newProject()
        break
      case 'open':
        Title.openProject()
        break
    }
  }
}

// 最近列表 - 鼠标点击事件
Home.recentClick = function (event) {
  const element = event.target
  if (element.hasClass('home-recent-item') &&
    !element.hasClass('disabled')) {
    const index = element.getAttribute('value')
    const items = Editor.config.recent
    const item = items[parseInt(index)]
    if (item) Editor.open(item.path)
  }
}

// 最近列表 - 指针弹起事件
Home.recentPointerup = function (event) {
  switch (event.button) {
    case 2: {
      const element = event.target
      if (element.hasClass('home-recent-item') &&
        element.childNodes.length !== 0 &&
        document.activeElement === element.parentNode) {
        element.addClass('hover')
        const index = parseInt(element.getAttribute('value'))
        const enabled = !element.hasClass('disabled')
        const get = Local.createGetter('menuRecent')
        Menu.popup({
          x: event.clientX,
          y: event.clientY,
          close: () => {
            element.removeClass('hover')
          },
        }, [{
          label: get('openProject'),
          enabled: enabled,
          click: () => {
            const items = Editor.config.recent
            const item = items[index]
            if (item) {
              Editor.open(item.path)
            }
          },
        }, {
          label: get('showInExplorer'),
          enabled: enabled,
          click: () => {
            const items = Editor.config.recent
            const item = items[index]
            if (item) {
              File.showInExplorer(item.path)
            }
          },
        }, {
          label: get('removeFromList'),
          click: () => {
            Home.removeRecentProject(index)
          },
        }])
      }
      break
    }
  }
}
