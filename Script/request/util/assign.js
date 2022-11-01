// This exists so I'm only saving it once.
"use strict"

import { hasOwn } from "./hasOwn.js"

export default Object.assign || function(target, source) {
	for (var key in source) {
		if (hasOwn.call(source, key)) target[key] = source[key]
	}
}
