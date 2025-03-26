interface Flow {
  /**
   * 显示文本(异步)
   * @param content 文本内容
   */
  showText(content: string): Promise<void>
  /**
   * 显示文本(异步)
   * @param target 目标角色
   * @param content 文本内容
   */
  showText(target: Actor, content: string): Promise<void>
  /**
   * 显示文本(异步)
   * @param parameters 参数
   * @param content 文本内容
   */
  showText(parameters: string, content: string): Promise<void>
  /**
   * 显示文本(异步)
   * @param target 目标角色
   * @param parameters 参数
   * @param content 文本内容
   */
  showText(target: Actor, parameters: string, content: string): Promise<void>
  /**
   * 显示选项(异步)
   * @param choices [选项内容, 回调函数, ...]交替类型列表
   */
  showChoices(...contentCallbackAlternating: Array<string | FlowChoiceFunction>): Promise<void>
  /**
   * 显示选项(异步)
   * @param parameters 选项参数
   * @param choices [选项内容, 回调函数, ...]交替类型列表
   */
  showChoices(parameters: string, ...contentCallbackAlternating: Array<string | FlowChoiceFunction>): Promise<void>
}

/** 流程控制选项 */
type FlowChoiceFunction = () => void | Promise<void>