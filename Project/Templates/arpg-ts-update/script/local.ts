/** ******************************** 本地化语言管理器 ******************************** */

let Local = new class LocalizationManager {
  /** 激活的语言 */
  public active: string = ''
  /** 选择的语言 */
  public language: string = ''
  /** 文本映射表 */
  public textMap: LocalizationTextMap = {}
   /** 语言重映射表 */
  private langRemap: HashMap<string> = {
    'zh-HK': 'zh-TW',
    'zh-SG': 'zh-TW',
  }
  /** 引用标签的正则表达式 */
  private refRegexp: RegExp = /<ref:([0-9a-f]{16})>/g

  /** 初始化 */
  public initialize(): void {
    this.createTextMap()
    this.compileTextContents()
    this.setLanguage(Data.globalData.language)
  }

  /** 创建本地化映射表 */
  private createTextMap(): void {
    const map = this.textMap
    const set = (items: LocalizationTextList) => {
      for (const item of items) {
        if ('children' in item) {
          set(item.children)
        } else {
          map[item.id] = item
        }
      }
    }
    set(Data.localization.list)
  }

  /** 编译文本内容 */
  private compileTextContents(): void {
    const regexp = /<global:([0-9a-f]{16})>/g
    const compile = (content: string) => {
      const slices: Array<AttributeValue | undefined> = []
      const setters: Array<CallbackFunction> = []
      let li = 0
      let match
      while (match = regexp.exec(content)) {
        const mi = match.index
        if (mi > li) {
          slices.push(content.slice(li, mi))
        }
        const index = slices.length
        const key = match[1]
        const getter = () => Variable.get(key)
        const setter = () => {slices[index] = getter()}
        setters.push(setter)
        slices.push('')
        li = regexp.lastIndex
      }
      // 无匹配标签的情况
      if (li === 0) {
        return content
      }
      // 找到标签的情况
      if (content.length > li) {
        slices.push(content.slice(li))
      }
      return () => {
        for (const setter of setters) {
          setter()
        }
        return slices.join('')
      }
    }
    const languages = Data.config.localization.languages.map(lang => lang.name)
    for (const {contents} of Object.values(this.textMap) as Array<LocalizationTextItem>) {
      for (const language of languages) {
        contents[language] = compile(contents[language] as string)
      }
    }
  }

  /**
   * 设置语言
   * @param 本地化语言代码
   */
  public setLanguage(language: string): void {
    if (this.language !== language) {
      const languages = Data.config.localization.languages
      let active = language
      if (active === 'auto') {
        active = this.getLanguage()
      }
      let settings = languages.find(lang => lang.name === active)
      if (!settings) settings = languages[0] ?? {name: active, font: '', scale: 1}
      try {
        this.active = settings.name
        this.language = language
        this.updateAllTexts()
        window.dispatchEvent(new Event('localize'))
        Printer.setLanguageFont(settings.font)
        Printer.setSizeScale(settings.scale)
        Printer.setWordWrap(['zh-CN', 'zh-TW', 'ja', 'ko'].includes(active) ? 'break' : 'keep')
      } catch (error) {
        console.error(error)
      }
    }
  }

  /**
   * 获取合适的语言
   * @returns 本地化语言代码
   */
  private getLanguage(): string {
    const languages = Data.config.localization.languages.map(lang => lang.name)
    let nLanguage = navigator.language
    // 重映射本地语言
    const mappedLang = this.langRemap[nLanguage]
    if (mappedLang) nLanguage = mappedLang
    let language = languages[0] ?? nLanguage
    let matchedWeight = 0
    const sKeys = nLanguage.split('-')
    for (const key of languages) {
      const dKeys = key.split('-')
      if (sKeys[0] === dKeys[0]) {
        let weight = 0
        for (let sKey of sKeys) {
          if (dKeys.includes(sKey)) {
            weight++
          }
        }
        if (matchedWeight < weight) {
          matchedWeight = weight
          language = key
        }
      }
    }
    return language
  }

  /**
   * 获取本地化文本
   * @param id 本地化文本ID
   * @returns 当前语言包的本地化文本
   */
  private get(id: string): string {
    const content = this.textMap[id]?.contents[this.active]
    return typeof content === 'function' ? content() : content!
  }

  /**
   * 替换文本内容
   * @param text 原始文本内容
   * @returns 替换本地化文本后的内容
   */
  public replace(text: string): string {
    return text.replace(this.refRegexp, (match, refId) => {
      const ref = this.get(refId)
      return ref !== undefined ? ref : match
    })
  }

  /** 更新所有文本 */
  private updateAllTexts(): void {
    const update = (elements: Array<UIElement>) => {
      for (const element of elements) {
        element.updateTextContent?.()
        update(element.children)
      }
    }
    if (UI.root instanceof UIElement) {
      update(UI.root.children)
    }
  }
}