/** 视频元素脚本 */
export default class VideoElementScript extends Flow implements Script<VideoElement> {
  onStart(element: VideoElement): void {
    console.log('onStart')
  }

  onEnded(element: VideoElement): void {
    console.log('onEnded')
  }
}