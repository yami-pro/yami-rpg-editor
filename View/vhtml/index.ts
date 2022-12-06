'use strict'

import emptyTags from "./empty-tags";

type mapVar = {[index: string]: any}
type nameVar = (...args: any[]) => any | string

// escape an attribute
let esc = (str: any) => String(str).replace(/[&<>"']/g, s=>`&${map[s]};`);
let map: mapVar = {'&':'amp','<':'lt','>':'gt','"':'quot',"'":'apos'};
let setInnerHTMLAttr = 'dangerouslySetInnerHTML';
let DOMAttributeNames: mapVar = {
	className: 'class',
	htmlFor: 'for'
};

let sanitized: mapVar = {};

/** Hyperscript reviver that constructs a sanitized HTML string. */
function createElement(name: nameVar, attrs: mapVar) {
	let stack=[], s = '';
	attrs = attrs || {};
	for (let i=arguments.length; i-- > 2; ) {
		stack.push(arguments[i]);
	}

	// Sortof component support!
	if (typeof name==='function') {
		attrs.children = stack.reverse();
		return name(attrs);
		// return name(attrs, stack.reverse());
	}

	if (name) {
		s += '<' + name;
		if (attrs) for (let i in attrs) {
			if (attrs[i]!==false && attrs[i]!=null && i !== setInnerHTMLAttr) {
				s += ` ${DOMAttributeNames[i] ? DOMAttributeNames[i] : esc(i)}="${esc(attrs[i])}"`;
			}
		}
		s += '>';
	}

	if (emptyTags.indexOf(name) === -1) {
		if (attrs[setInnerHTMLAttr]) {
			s += attrs[setInnerHTMLAttr].__html;
		}
		else while (stack.length) {
			let child = stack.pop();
			if (child) {
				if (child.pop) {
					for (let i=child.length; i--; ) stack.push(child[i]);
				}
				else {
					s += sanitized[child]===true ? child : esc(child);
				}
			}
		}
		s += name ? `</${name}>` : '';
	}

	sanitized[s] = true;
	return s;
}

export { createElement }
