"use strict"

import {
  FileItem,
  FolderItem
} from "../../yami"

// ******************************** 按钮扩展 ********************************

interface Node_ext {
  versionId: number
  range: Uint32Array
  count: number
  file: FolderItem | FileItem
}

export { Node_ext }
