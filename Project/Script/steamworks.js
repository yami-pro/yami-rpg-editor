'use strict'

// ******************************** 创意工坊 ********************************

const Workshop = new class WorkshopManager {
  // APP_ID = 1964480
  // list = $('#workshop-list')
  // steamworks = require('steamworks.js')
  // client = this.steamworks.init(this.APP_ID)
  // workshop = this.client.workshop
  // accountId = this.client.localplayer.getSteamId().accountId

  // 初始化
  initialize() {
    WorkshopItem.initialize()

    // 侦听事件
    $('#workshop-upload').on('click', this.uploadClick)
  }

  // 打开窗口
  open() {
    Window.open('workshop')
    this.updateContents()
  }

  // 更新内容
  async updateContents() {
    // const pUserItems = this.getUserItems()
    // const pSubscribedItems = this.getSubscribedItems()
    // const pAllItems = this.getAllItems()
    const list = this.list.reload()
    {
      const li = document.createElement('common-item')
      list.appendElement(li)
      const userItems = await this.getUserItems()
      this.loadItems(userItems)
      li.dataValue = 'sort-user-items'
      li.textContent = `User Items (${userItems.length})`
      li.addClass('workshop-item-sort')
    }
    {
      const li = document.createElement('common-item')
      list.appendElement(li)
      const subscribedItems = await this.getSubscribedItems()
      this.loadItems(subscribedItems)
      li.dataValue = 'sort-subscribed-items'
      li.textContent = `Subscribed Items (${subscribedItems.length})`
      li.addClass('workshop-item-sort')
    }
    // {
    //   const li = document.createElement('common-item')
    //   list.appendElement(li)
    //   const allItems = await this.getAllItems()
    //   this.loadItems(allItems)
    //   li.dataValue = 'sort-all-items'
    //   li.textContent = `All Items (${allItems.length})`
    //   li.addClass('workshop-item-sort')
    // }
    list.update()
  }

  // 加载项目
  loadItems(items) {
    for (const item of items) {
      const li = document.createElement('common-item')
      li.dataValue = item
      // 创建预览图像
      const preview = document.createElement('img')
      preview.addClass('workshop-item-preview')
      if (item.previewUrl) {
        preview.src = item.previewUrl
      }
      li.appendChild(preview)
      // 创建标题
      const title = document.createElement('text')
      title.textContent = item.title || 'unnamed'
      title.addClass('workshop-item-title')
      li.appendChild(title)
      // 创建描述
      const desc = document.createElement('text')
      desc.textContent = item.description
      desc.addClass('workshop-item-desc')
      li.appendChild(desc)
      // 添加列表项
      this.list.appendElement(li)
    }
  }

  // 创建项目
  async createItem() {
    const item = await this.workshop.createItem()
    this.updateItem(item.itemId)
    // return item
  }

  // 获取项目
  async getItem(id) {
    const item = await this.workshop.getItem(id)
    return item
  }

  // 更新项目
  async updateItem(id) {
    await this.workshop.updateItem(id, {
      title: 'Test Mod',
      description: 'are you ok ?',
      changeNote: 'change note',
      previewPath: File.route('Assets/角色/头像/Chest-1.d095eb446178fd84.png'),
      contentPath: File.route('Assets/角色/头像/Chest-1.d095eb446178fd84.png'),
      tags: ['tag1', 'tag2'],
      visibility: this.workshop.UgcItemVisibility.Public,
    })
  }

  // 获取全部用户项目
  async getUserItems() {
    const {APP_ID, accountId, workshop} = this
    const result = await workshop.getUserItems(1, accountId, workshop.UserListType.Published, workshop.UGCType.Items, workshop.UserListOrder.TitleAsc, {creator: APP_ID, consumer: APP_ID})
    return result.items
  }

  // 获取全部已订阅项目
  async getSubscribedItems() {
    const {workshop} = this
    const ids = workshop.getSubscribedItems()
    const result = await workshop.getItems(ids)
    return result.items
  }

  // 获取全部公开项目
  async getAllItems() {
    const {APP_ID, workshop} = this
    const result = await workshop.getAllItems(1, workshop.UGCQueryType.RankedByVote, workshop.UGCType.Items, APP_ID, APP_ID, {cachedResponseMaxAge: 0})
    return result.items
  }

  uploadClick(event) {
    WorkshopItem.open()
  }
}

// ******************************** 创意工坊项目 ********************************

const WorkshopItem = new class WorkshopItemManager {
  // 初始化
  initialize() {
    // 创建类型项目
    $('#workshop-item-type').loadItems([
      {name: 'Current Project', value:'project'},
      {name: 'HTML5 Application', value:'application'},
    ])

    // 设置类型关联元素
    $('#workshop-item-type').enableHiddenMode().relate([
      {case: 'application', targets: [
        $('#workshop-item-content'),
      ]},
    ])
  }

  // 打开窗口
  open() {
    Window.open('workshop-item')
    const defPath = Path.normalize(Editor.config.dialogs.deploy)
    $('#workshop-item-content').write(defPath)
  }
}