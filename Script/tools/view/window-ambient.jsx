'use strict'

import { createElement } from '../../vhtml/index.js'
import { styles } from '../../goober/index.js'

/* --------------------------------
 * 窗口环境
 * --------------------------------
 */
const ambient = () =>
  styles({
    display: 'none',
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    '&.open': {
      display: 'block',
    }
  });

const WindowAmbient = ()=>(
  <>
  {/*窗口环境*/}
  <box id="window-ambient" class={ ambient() }></box>
  </>
)

export { WindowAmbient }
