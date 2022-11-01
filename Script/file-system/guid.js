// ******************************** 全局唯一标识符 ********************************

// GUID含有字母或首位是零可以大幅提升查询效率
// 因此需要避免纯数字的GUID出现
class GUID {
  static regExpForChecking = /[a-f]/

  // 生成32位GUID(8个字符)
  static generate32bit() {
    const n = Math.random() * 0x100000000
    const s = Math.floor(n).toString(16)
    return s.length === 8 ? s : s.padStart(8, '0')
  }

  // 生成64位GUID(16个字符)
  static generate64bit() {
    let id
    do {id = this.generate32bit() + this.generate32bit()}
    while (!this.regExpForChecking.test(id))
    return id
  }
}
