"use strict"

// ******************************** 正则表达式属性 ********************************

interface RegExpConstructor_ext {
  number: IRegExp
}

interface IRegExpConstructor extends RegExpConstructor, RegExpConstructor_ext {}

interface IRegExp extends RegExp {}

const IRegExp = <IRegExpConstructor>RegExp

// 静态属性 - 数字表达式
IRegExp.number = <IRegExp>/^-?\d+(?:\.\d+)?$/

export { IRegExp }
