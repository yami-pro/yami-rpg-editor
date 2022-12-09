"use strict"

// ******************************** 正则表达式属性 ********************************

interface IRegExp extends RegExp {
  number: IRegExp
}

const RegExp_as_obj = <Object>RegExp
const IRegExp = <IRegExp>RegExp_as_obj

// 静态属性 - 数字表达式
IRegExp.number = <IRegExp>/^-?\d+(?:\.\d+)?$/

export { IRegExp }
