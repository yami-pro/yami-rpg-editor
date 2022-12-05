'use strict'

// ******************************** 正则表达式属性 ********************************

interface IRegExp extends RegExp {
  number: IRegExp
}

const regExpObject = <Object>RegExp
const IRegExp = <IRegExp>regExpObject

// 静态属性 - 数字表达式
IRegExp.number = <IRegExp>/^-?\d+(?:\.\d+)?$/

export { IRegExp }
