/** HTML音频播放器 */
interface HTMLAudioPlayer extends HTMLAudioElement {
  guid: string
}

/** HTML音频播放器(版本2) */
interface HTMLAudioPlayer2 extends HTMLAudioElement {
  guid: string
  timestamp: number
  source: MediaElementAudioSourceNode
  update: (timestamp: number) => void
  onStop(): void
}

/** 音频存档数据 */
type AudioSaveData = {
  guid: string
  offset: number
}

/** 音频类型 */
type AudioType = 'bgm' | 'bgs' | 'cv' | 'se'