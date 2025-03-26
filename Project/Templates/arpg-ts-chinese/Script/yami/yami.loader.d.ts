/** 全局变量 */
interface Window {
  decrypt(buffer: ArrayBuffer): ArrayBuffer
}

interface Blob {
  url: string
}

/** 文件描述器 */
type FileDescriptor = {
  type: string
  path?: string
  guid?: string
  sync?: boolean
}