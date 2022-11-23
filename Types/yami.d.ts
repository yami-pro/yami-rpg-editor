
interface HTMLElement {
  read(): void
  write(value: any): void
  clear(): void
  enable(): void
  disable(): void
  hasClass(className: string): void
  addClass(className: string): void
  removeClass(className: string): void
  seek(tagName: string, count: number): void
  css(): void
  rect(): void
  hide(): void
  show(): void
  hideChildNodes(): void
  showChildNodes(): void
  getFocus(mode: any): void
  setTooltip: (tip: any) => void
  addScrollbars(): void
  addSetScrollMethod(): void
  hasScrollBar(): void
  isInContent(event: any): void
  dispatchChangeEvent: (index: number) => void
  dispatchResizeEvent: () => void
  dispatchUpdateEvent: () => void
  listenDraggingScrollbarEvent: (pointerdown: (event: any) => void, options: any) => void
}
