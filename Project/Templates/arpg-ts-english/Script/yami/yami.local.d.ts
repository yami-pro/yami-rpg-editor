/** 本地化文件 */
type LocalizationFile = {
  list: LocalizationTextList
}

/** 本地化文本列表 */
type LocalizationTextList = Array<LocalizationTextFolder | LocalizationTextItem>

/** 本地化文本文件夹 */
type LocalizationTextFolder = {
  class: 'folder'
  name: string
  expanded: boolean
  children: Array<LocalizationTextFolder | LocalizationTextItem>
}

/** 本地化文本对象 */
type LocalizationTextItem = {
  id: string
  name: string
  contents: HashMap<string | (() => string)> //*
}

/** 本地化文本映射表 */
type LocalizationTextMap = HashMap<LocalizationTextItem>