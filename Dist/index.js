"use strict";
(() => {
  // Script/preact/constants.js
  var EMPTY_OBJ = {};
  var EMPTY_ARR = [];
  var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;

  // Script/preact/util.js
  function assign(obj, props) {
    for (let i in props)
      obj[i] = props[i];
    return obj;
  }
  function removeNode(node) {
    let parentNode = node.parentNode;
    if (parentNode)
      parentNode.removeChild(node);
  }
  var slice = EMPTY_ARR.slice;

  // Script/preact/diff/catch-error.js
  function _catchError(error, vnode, oldVNode, errorInfo) {
    let component, ctor, handled;
    for (; vnode = vnode._parent; ) {
      if ((component = vnode._component) && !component._processingException) {
        try {
          ctor = component.constructor;
          if (ctor && ctor.getDerivedStateFromError != null) {
            component.setState(ctor.getDerivedStateFromError(error));
            handled = component._dirty;
          }
          if (component.componentDidCatch != null) {
            component.componentDidCatch(error, errorInfo || {});
            handled = component._dirty;
          }
          if (handled) {
            return component._pendingError = component;
          }
        } catch (e) {
          error = e;
        }
      }
    }
    throw error;
  }

  // Script/preact/options.js
  var options = {
    _catchError
  };
  var options_default = options;

  // Script/preact/create-element.js
  var vnodeId = 0;
  function createElement(type, props, children) {
    let normalizedProps = {}, key, ref, i;
    for (i in props) {
      if (i == "key")
        key = props[i];
      else if (i == "ref")
        ref = props[i];
      else
        normalizedProps[i] = props[i];
    }
    if (arguments.length > 2) {
      normalizedProps.children = arguments.length > 3 ? slice.call(arguments, 2) : children;
    }
    if (typeof type == "function" && type.defaultProps != null) {
      for (i in type.defaultProps) {
        if (normalizedProps[i] === void 0) {
          normalizedProps[i] = type.defaultProps[i];
        }
      }
    }
    return createVNode(type, normalizedProps, key, ref, null);
  }
  function createVNode(type, props, key, ref, original) {
    const vnode = {
      type,
      props,
      key,
      ref,
      _children: null,
      _parent: null,
      _depth: 0,
      _dom: null,
      _nextDom: void 0,
      _component: null,
      _hydrating: null,
      constructor: void 0,
      _original: original == null ? ++vnodeId : original
    };
    if (original == null && options_default.vnode != null)
      options_default.vnode(vnode);
    return vnode;
  }
  function Fragment(props) {
    return props.children;
  }

  // Script/preact/component.js
  function Component(props, context) {
    this.props = props;
    this.context = context;
  }
  Component.prototype.setState = function(update, callback) {
    let s;
    if (this._nextState != null && this._nextState !== this.state) {
      s = this._nextState;
    } else {
      s = this._nextState = assign({}, this.state);
    }
    if (typeof update == "function") {
      update = update(assign({}, s), this.props);
    }
    if (update) {
      assign(s, update);
    }
    if (update == null)
      return;
    if (this._vnode) {
      if (callback) {
        this._stateCallbacks.push(callback);
      }
      enqueueRender(this);
    }
  };
  Component.prototype.forceUpdate = function(callback) {
    if (this._vnode) {
      this._force = true;
      if (callback)
        this._renderCallbacks.push(callback);
      enqueueRender(this);
    }
  };
  Component.prototype.render = Fragment;
  function getDomSibling(vnode, childIndex) {
    if (childIndex == null) {
      return vnode._parent ? getDomSibling(vnode._parent, vnode._parent._children.indexOf(vnode) + 1) : null;
    }
    let sibling;
    for (; childIndex < vnode._children.length; childIndex++) {
      sibling = vnode._children[childIndex];
      if (sibling != null && sibling._dom != null) {
        return sibling._dom;
      }
    }
    return typeof vnode.type == "function" ? getDomSibling(vnode) : null;
  }
  function renderComponent(component) {
    let vnode = component._vnode, oldDom = vnode._dom, parentDom = component._parentDom;
    if (parentDom) {
      let commitQueue = [];
      const oldVNode = assign({}, vnode);
      oldVNode._original = vnode._original + 1;
      diff(
        parentDom,
        vnode,
        oldVNode,
        component._globalContext,
        parentDom.ownerSVGElement !== void 0,
        vnode._hydrating != null ? [oldDom] : null,
        commitQueue,
        oldDom == null ? getDomSibling(vnode) : oldDom,
        vnode._hydrating
      );
      commitRoot(commitQueue, vnode);
      if (vnode._dom != oldDom) {
        updateParentDomPointers(vnode);
      }
    }
  }
  function updateParentDomPointers(vnode) {
    if ((vnode = vnode._parent) != null && vnode._component != null) {
      vnode._dom = vnode._component.base = null;
      for (let i = 0; i < vnode._children.length; i++) {
        let child = vnode._children[i];
        if (child != null && child._dom != null) {
          vnode._dom = vnode._component.base = child._dom;
          break;
        }
      }
      return updateParentDomPointers(vnode);
    }
  }
  var rerenderQueue = [];
  var prevDebounce;
  function enqueueRender(c) {
    if (!c._dirty && (c._dirty = true) && rerenderQueue.push(c) && !process._rerenderCount++ || prevDebounce !== options_default.debounceRendering) {
      prevDebounce = options_default.debounceRendering;
      (prevDebounce || setTimeout)(process);
    }
  }
  function process() {
    let queue;
    while (process._rerenderCount = rerenderQueue.length) {
      queue = rerenderQueue.sort((a, b) => a._vnode._depth - b._vnode._depth);
      rerenderQueue = [];
      queue.some((c) => {
        if (c._dirty)
          renderComponent(c);
      });
    }
  }
  process._rerenderCount = 0;

  // Script/preact/diff/children.js
  function diffChildren(parentDom, renderResult, newParentVNode, oldParentVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating) {
    let i, j, oldVNode, childVNode, newDom, firstChildDom, refs;
    let oldChildren = oldParentVNode && oldParentVNode._children || EMPTY_ARR;
    let oldChildrenLength = oldChildren.length;
    newParentVNode._children = [];
    for (i = 0; i < renderResult.length; i++) {
      childVNode = renderResult[i];
      if (childVNode == null || typeof childVNode == "boolean") {
        childVNode = newParentVNode._children[i] = null;
      } else if (typeof childVNode == "string" || typeof childVNode == "number" || typeof childVNode == "bigint") {
        childVNode = newParentVNode._children[i] = createVNode(
          null,
          childVNode,
          null,
          null,
          childVNode
        );
      } else if (Array.isArray(childVNode)) {
        childVNode = newParentVNode._children[i] = createVNode(
          Fragment,
          { children: childVNode },
          null,
          null,
          null
        );
      } else if (childVNode._depth > 0) {
        childVNode = newParentVNode._children[i] = createVNode(
          childVNode.type,
          childVNode.props,
          childVNode.key,
          childVNode.ref ? childVNode.ref : null,
          childVNode._original
        );
      } else {
        childVNode = newParentVNode._children[i] = childVNode;
      }
      if (childVNode == null) {
        continue;
      }
      childVNode._parent = newParentVNode;
      childVNode._depth = newParentVNode._depth + 1;
      oldVNode = oldChildren[i];
      if (oldVNode === null || oldVNode && childVNode.key == oldVNode.key && childVNode.type === oldVNode.type) {
        oldChildren[i] = void 0;
      } else {
        for (j = 0; j < oldChildrenLength; j++) {
          oldVNode = oldChildren[j];
          if (oldVNode && childVNode.key == oldVNode.key && childVNode.type === oldVNode.type) {
            oldChildren[j] = void 0;
            break;
          }
          oldVNode = null;
        }
      }
      oldVNode = oldVNode || EMPTY_OBJ;
      diff(
        parentDom,
        childVNode,
        oldVNode,
        globalContext,
        isSvg,
        excessDomChildren,
        commitQueue,
        oldDom,
        isHydrating
      );
      newDom = childVNode._dom;
      if ((j = childVNode.ref) && oldVNode.ref != j) {
        if (!refs)
          refs = [];
        if (oldVNode.ref)
          refs.push(oldVNode.ref, null, childVNode);
        refs.push(j, childVNode._component || newDom, childVNode);
      }
      if (newDom != null) {
        if (firstChildDom == null) {
          firstChildDom = newDom;
        }
        if (typeof childVNode.type == "function" && childVNode._children === oldVNode._children) {
          childVNode._nextDom = oldDom = reorderChildren(
            childVNode,
            oldDom,
            parentDom
          );
        } else {
          oldDom = placeChild(
            parentDom,
            childVNode,
            oldVNode,
            oldChildren,
            newDom,
            oldDom
          );
        }
        if (typeof newParentVNode.type == "function") {
          newParentVNode._nextDom = oldDom;
        }
      } else if (oldDom && oldVNode._dom == oldDom && oldDom.parentNode != parentDom) {
        oldDom = getDomSibling(oldVNode);
      }
    }
    newParentVNode._dom = firstChildDom;
    for (i = oldChildrenLength; i--; ) {
      if (oldChildren[i] != null) {
        unmount(oldChildren[i], oldChildren[i]);
      }
    }
    if (refs) {
      for (i = 0; i < refs.length; i++) {
        applyRef(refs[i], refs[++i], refs[++i]);
      }
    }
  }
  function reorderChildren(childVNode, oldDom, parentDom) {
    let c = childVNode._children;
    let tmp = 0;
    for (; c && tmp < c.length; tmp++) {
      let vnode = c[tmp];
      if (vnode) {
        vnode._parent = childVNode;
        if (typeof vnode.type == "function") {
          oldDom = reorderChildren(vnode, oldDom, parentDom);
        } else {
          oldDom = placeChild(parentDom, vnode, vnode, c, vnode._dom, oldDom);
        }
      }
    }
    return oldDom;
  }
  function placeChild(parentDom, childVNode, oldVNode, oldChildren, newDom, oldDom) {
    let nextDom;
    if (childVNode._nextDom !== void 0) {
      nextDom = childVNode._nextDom;
      childVNode._nextDom = void 0;
    } else if (oldVNode == null || newDom != oldDom || newDom.parentNode == null) {
      outer:
        if (oldDom == null || oldDom.parentNode !== parentDom) {
          parentDom.appendChild(newDom);
          nextDom = null;
        } else {
          for (let sibDom = oldDom, j = 0; (sibDom = sibDom.nextSibling) && j < oldChildren.length; j += 2) {
            if (sibDom == newDom) {
              break outer;
            }
          }
          parentDom.insertBefore(newDom, oldDom);
          nextDom = oldDom;
        }
    }
    if (nextDom !== void 0) {
      oldDom = nextDom;
    } else {
      oldDom = newDom.nextSibling;
    }
    return oldDom;
  }

  // Script/preact/diff/props.js
  function diffProps(dom, newProps, oldProps, isSvg, hydrate2) {
    let i;
    for (i in oldProps) {
      if (i !== "children" && i !== "key" && !(i in newProps)) {
        setProperty(dom, i, null, oldProps[i], isSvg);
      }
    }
    for (i in newProps) {
      if ((!hydrate2 || typeof newProps[i] == "function") && i !== "children" && i !== "key" && i !== "value" && i !== "checked" && oldProps[i] !== newProps[i]) {
        setProperty(dom, i, newProps[i], oldProps[i], isSvg);
      }
    }
  }
  function setStyle(style, key, value) {
    if (key[0] === "-") {
      style.setProperty(key, value);
    } else if (value == null) {
      style[key] = "";
    } else if (typeof value != "number" || IS_NON_DIMENSIONAL.test(key)) {
      style[key] = value;
    } else {
      style[key] = value + "px";
    }
  }
  function setProperty(dom, name, value, oldValue, isSvg) {
    let useCapture;
    o:
      if (name === "style") {
        if (typeof value == "string") {
          dom.style.cssText = value;
        } else {
          if (typeof oldValue == "string") {
            dom.style.cssText = oldValue = "";
          }
          if (oldValue) {
            for (name in oldValue) {
              if (!(value && name in value)) {
                setStyle(dom.style, name, "");
              }
            }
          }
          if (value) {
            for (name in value) {
              if (!oldValue || value[name] !== oldValue[name]) {
                setStyle(dom.style, name, value[name]);
              }
            }
          }
        }
      } else if (name[0] === "o" && name[1] === "n") {
        useCapture = name !== (name = name.replace(/Capture$/, ""));
        if (name.toLowerCase() in dom)
          name = name.toLowerCase().slice(2);
        else
          name = name.slice(2);
        if (!dom._listeners)
          dom._listeners = {};
        dom._listeners[name + useCapture] = value;
        if (value) {
          if (!oldValue) {
            const handler = useCapture ? eventProxyCapture : eventProxy;
            dom.addEventListener(name, handler, useCapture);
          }
        } else {
          const handler = useCapture ? eventProxyCapture : eventProxy;
          dom.removeEventListener(name, handler, useCapture);
        }
      } else if (name !== "dangerouslySetInnerHTML") {
        if (isSvg) {
          name = name.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
        } else if (name !== "href" && name !== "list" && name !== "form" && name !== "tabIndex" && name !== "download" && name in dom) {
          try {
            dom[name] = value == null ? "" : value;
            break o;
          } catch (e) {
          }
        }
        if (typeof value === "function") {
        } else if (value != null && (value !== false || name.indexOf("-") != -1)) {
          dom.setAttribute(name, value);
        } else {
          dom.removeAttribute(name);
        }
      }
  }
  function eventProxy(e) {
    this._listeners[e.type + false](options_default.event ? options_default.event(e) : e);
  }
  function eventProxyCapture(e) {
    this._listeners[e.type + true](options_default.event ? options_default.event(e) : e);
  }

  // Script/preact/diff/index.js
  function diff(parentDom, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating) {
    let tmp, newType = newVNode.type;
    if (newVNode.constructor !== void 0)
      return null;
    if (oldVNode._hydrating != null) {
      isHydrating = oldVNode._hydrating;
      oldDom = newVNode._dom = oldVNode._dom;
      newVNode._hydrating = null;
      excessDomChildren = [oldDom];
    }
    if (tmp = options_default._diff)
      tmp(newVNode);
    try {
      outer:
        if (typeof newType == "function") {
          let c, isNew, oldProps, oldState, snapshot, clearProcessingException;
          let newProps = newVNode.props;
          tmp = newType.contextType;
          let provider = tmp && globalContext[tmp._id];
          let componentContext = tmp ? provider ? provider.props.value : tmp._defaultValue : globalContext;
          if (oldVNode._component) {
            c = newVNode._component = oldVNode._component;
            clearProcessingException = c._processingException = c._pendingError;
          } else {
            if ("prototype" in newType && newType.prototype.render) {
              newVNode._component = c = new newType(newProps, componentContext);
            } else {
              newVNode._component = c = new Component(newProps, componentContext);
              c.constructor = newType;
              c.render = doRender;
            }
            if (provider)
              provider.sub(c);
            c.props = newProps;
            if (!c.state)
              c.state = {};
            c.context = componentContext;
            c._globalContext = globalContext;
            isNew = c._dirty = true;
            c._renderCallbacks = [];
            c._stateCallbacks = [];
          }
          if (c._nextState == null) {
            c._nextState = c.state;
          }
          if (newType.getDerivedStateFromProps != null) {
            if (c._nextState == c.state) {
              c._nextState = assign({}, c._nextState);
            }
            assign(
              c._nextState,
              newType.getDerivedStateFromProps(newProps, c._nextState)
            );
          }
          oldProps = c.props;
          oldState = c.state;
          if (isNew) {
            if (newType.getDerivedStateFromProps == null && c.componentWillMount != null) {
              c.componentWillMount();
            }
            if (c.componentDidMount != null) {
              c._renderCallbacks.push(c.componentDidMount);
            }
          } else {
            if (newType.getDerivedStateFromProps == null && newProps !== oldProps && c.componentWillReceiveProps != null) {
              c.componentWillReceiveProps(newProps, componentContext);
            }
            if (!c._force && c.shouldComponentUpdate != null && c.shouldComponentUpdate(
              newProps,
              c._nextState,
              componentContext
            ) === false || newVNode._original === oldVNode._original) {
              c.props = newProps;
              c.state = c._nextState;
              if (newVNode._original !== oldVNode._original)
                c._dirty = false;
              c._vnode = newVNode;
              newVNode._dom = oldVNode._dom;
              newVNode._children = oldVNode._children;
              newVNode._children.forEach((vnode) => {
                if (vnode)
                  vnode._parent = newVNode;
              });
              for (let i = 0; i < c._stateCallbacks.length; i++) {
                c._renderCallbacks.push(c._stateCallbacks[i]);
              }
              c._stateCallbacks = [];
              if (c._renderCallbacks.length) {
                commitQueue.push(c);
              }
              break outer;
            }
            if (c.componentWillUpdate != null) {
              c.componentWillUpdate(newProps, c._nextState, componentContext);
            }
            if (c.componentDidUpdate != null) {
              c._renderCallbacks.push(() => {
                c.componentDidUpdate(oldProps, oldState, snapshot);
              });
            }
          }
          c.context = componentContext;
          c.props = newProps;
          c._vnode = newVNode;
          c._parentDom = parentDom;
          let renderHook = options_default._render, count = 0;
          if ("prototype" in newType && newType.prototype.render) {
            c.state = c._nextState;
            c._dirty = false;
            if (renderHook)
              renderHook(newVNode);
            tmp = c.render(c.props, c.state, c.context);
            for (let i = 0; i < c._stateCallbacks.length; i++) {
              c._renderCallbacks.push(c._stateCallbacks[i]);
            }
            c._stateCallbacks = [];
          } else {
            do {
              c._dirty = false;
              if (renderHook)
                renderHook(newVNode);
              tmp = c.render(c.props, c.state, c.context);
              c.state = c._nextState;
            } while (c._dirty && ++count < 25);
          }
          c.state = c._nextState;
          if (c.getChildContext != null) {
            globalContext = assign(assign({}, globalContext), c.getChildContext());
          }
          if (!isNew && c.getSnapshotBeforeUpdate != null) {
            snapshot = c.getSnapshotBeforeUpdate(oldProps, oldState);
          }
          let isTopLevelFragment = tmp != null && tmp.type === Fragment && tmp.key == null;
          let renderResult = isTopLevelFragment ? tmp.props.children : tmp;
          diffChildren(
            parentDom,
            Array.isArray(renderResult) ? renderResult : [renderResult],
            newVNode,
            oldVNode,
            globalContext,
            isSvg,
            excessDomChildren,
            commitQueue,
            oldDom,
            isHydrating
          );
          c.base = newVNode._dom;
          newVNode._hydrating = null;
          if (c._renderCallbacks.length) {
            commitQueue.push(c);
          }
          if (clearProcessingException) {
            c._pendingError = c._processingException = null;
          }
          c._force = false;
        } else if (excessDomChildren == null && newVNode._original === oldVNode._original) {
          newVNode._children = oldVNode._children;
          newVNode._dom = oldVNode._dom;
        } else {
          newVNode._dom = diffElementNodes(
            oldVNode._dom,
            newVNode,
            oldVNode,
            globalContext,
            isSvg,
            excessDomChildren,
            commitQueue,
            isHydrating
          );
        }
      if (tmp = options_default.diffed)
        tmp(newVNode);
    } catch (e) {
      newVNode._original = null;
      if (isHydrating || excessDomChildren != null) {
        newVNode._dom = oldDom;
        newVNode._hydrating = !!isHydrating;
        excessDomChildren[excessDomChildren.indexOf(oldDom)] = null;
      }
      options_default._catchError(e, newVNode, oldVNode);
    }
  }
  function commitRoot(commitQueue, root) {
    if (options_default._commit)
      options_default._commit(root, commitQueue);
    commitQueue.some((c) => {
      try {
        commitQueue = c._renderCallbacks;
        c._renderCallbacks = [];
        commitQueue.some((cb) => {
          cb.call(c);
        });
      } catch (e) {
        options_default._catchError(e, c._vnode);
      }
    });
  }
  function diffElementNodes(dom, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, isHydrating) {
    let oldProps = oldVNode.props;
    let newProps = newVNode.props;
    let nodeType = newVNode.type;
    let i = 0;
    if (nodeType === "svg")
      isSvg = true;
    if (excessDomChildren != null) {
      for (; i < excessDomChildren.length; i++) {
        const child = excessDomChildren[i];
        if (child && "setAttribute" in child === !!nodeType && (nodeType ? child.localName === nodeType : child.nodeType === 3)) {
          dom = child;
          excessDomChildren[i] = null;
          break;
        }
      }
    }
    if (dom == null) {
      if (nodeType === null) {
        return document.createTextNode(newProps);
      }
      if (isSvg) {
        dom = document.createElementNS(
          "http://www.w3.org/2000/svg",
          nodeType
        );
      } else {
        dom = document.createElement(
          nodeType,
          newProps.is && newProps
        );
      }
      excessDomChildren = null;
      isHydrating = false;
    }
    if (nodeType === null) {
      if (oldProps !== newProps && (!isHydrating || dom.data !== newProps)) {
        dom.data = newProps;
      }
    } else {
      excessDomChildren = excessDomChildren && slice.call(dom.childNodes);
      oldProps = oldVNode.props || EMPTY_OBJ;
      let oldHtml = oldProps.dangerouslySetInnerHTML;
      let newHtml = newProps.dangerouslySetInnerHTML;
      if (!isHydrating) {
        if (excessDomChildren != null) {
          oldProps = {};
          for (i = 0; i < dom.attributes.length; i++) {
            oldProps[dom.attributes[i].name] = dom.attributes[i].value;
          }
        }
        if (newHtml || oldHtml) {
          if (!newHtml || (!oldHtml || newHtml.__html != oldHtml.__html) && newHtml.__html !== dom.innerHTML) {
            dom.innerHTML = newHtml && newHtml.__html || "";
          }
        }
      }
      diffProps(dom, newProps, oldProps, isSvg, isHydrating);
      if (newHtml) {
        newVNode._children = [];
      } else {
        i = newVNode.props.children;
        diffChildren(
          dom,
          Array.isArray(i) ? i : [i],
          newVNode,
          oldVNode,
          globalContext,
          isSvg && nodeType !== "foreignObject",
          excessDomChildren,
          commitQueue,
          excessDomChildren ? excessDomChildren[0] : oldVNode._children && getDomSibling(oldVNode, 0),
          isHydrating
        );
        if (excessDomChildren != null) {
          for (i = excessDomChildren.length; i--; ) {
            if (excessDomChildren[i] != null)
              removeNode(excessDomChildren[i]);
          }
        }
      }
      if (!isHydrating) {
        if ("value" in newProps && (i = newProps.value) !== void 0 && (i !== dom.value || nodeType === "progress" && !i || nodeType === "option" && i !== oldProps.value)) {
          setProperty(dom, "value", i, oldProps.value, false);
        }
        if ("checked" in newProps && (i = newProps.checked) !== void 0 && i !== dom.checked) {
          setProperty(dom, "checked", i, oldProps.checked, false);
        }
      }
    }
    return dom;
  }
  function applyRef(ref, value, vnode) {
    try {
      if (typeof ref == "function")
        ref(value);
      else
        ref.current = value;
    } catch (e) {
      options_default._catchError(e, vnode);
    }
  }
  function unmount(vnode, parentVNode, skipRemove) {
    let r;
    if (options_default.unmount)
      options_default.unmount(vnode);
    if (r = vnode.ref) {
      if (!r.current || r.current === vnode._dom) {
        applyRef(r, null, parentVNode);
      }
    }
    if ((r = vnode._component) != null) {
      if (r.componentWillUnmount) {
        try {
          r.componentWillUnmount();
        } catch (e) {
          options_default._catchError(e, parentVNode);
        }
      }
      r.base = r._parentDom = null;
      vnode._component = void 0;
    }
    if (r = vnode._children) {
      for (let i = 0; i < r.length; i++) {
        if (r[i]) {
          unmount(
            r[i],
            parentVNode,
            skipRemove || typeof vnode.type !== "function"
          );
        }
      }
    }
    if (!skipRemove && vnode._dom != null) {
      removeNode(vnode._dom);
    }
    vnode._parent = vnode._dom = vnode._nextDom = void 0;
  }
  function doRender(props, state, context) {
    return this.constructor(props, context);
  }

  // Script/preact/render.js
  function render(vnode, parentDom, replaceNode) {
    if (options_default._root)
      options_default._root(vnode, parentDom);
    let isHydrating = typeof replaceNode === "function";
    let oldVNode = isHydrating ? null : replaceNode && replaceNode._children || parentDom._children;
    vnode = (!isHydrating && replaceNode || parentDom)._children = createElement(Fragment, null, [vnode]);
    let commitQueue = [];
    diff(
      parentDom,
      vnode,
      oldVNode || EMPTY_OBJ,
      EMPTY_OBJ,
      parentDom.ownerSVGElement !== void 0,
      !isHydrating && replaceNode ? [replaceNode] : oldVNode ? null : parentDom.firstChild ? slice.call(parentDom.childNodes) : null,
      commitQueue,
      !isHydrating && replaceNode ? replaceNode : oldVNode ? oldVNode._dom : parentDom.firstChild,
      isHydrating
    );
    commitRoot(commitQueue, vnode);
  }

  // Script/index.jsx
  function Body() {
    return /* @__PURE__ */ createElement("body", null, /* @__PURE__ */ createElement("box", {
      id: "title"
    }, /* @__PURE__ */ createElement("box", {
      id: "menu"
    }, /* @__PURE__ */ createElement("item", {
      id: "menu-file",
      class: "menu-item",
      value: "file"
    }, "File"), /* @__PURE__ */ createElement("item", {
      id: "menu-edit",
      class: "menu-item",
      value: "edit"
    }, "Edit"), /* @__PURE__ */ createElement("item", {
      id: "menu-view",
      class: "menu-item",
      value: "view"
    }, "View"), /* @__PURE__ */ createElement("item", {
      id: "menu-window",
      class: "menu-item",
      value: "window"
    }, "Window"), /* @__PURE__ */ createElement("item", {
      id: "menu-help",
      class: "menu-item",
      value: "help"
    }, "Help")), /* @__PURE__ */ createElement("tab-bar", {
      id: "title-tabBar"
    }), /* @__PURE__ */ createElement("box", {
      id: "title-buttons"
    }, /* @__PURE__ */ createElement("box", {
      id: "title-play"
    }, "\uF04B"), /* @__PURE__ */ createElement("minimize", {
      id: "title-minimize"
    }), /* @__PURE__ */ createElement("maximize", {
      id: "title-maximize"
    }), /* @__PURE__ */ createElement("close", {
      id: "title-close"
    }))), /* @__PURE__ */ createElement("box", {
      id: "window-ambient"
    }), /* @__PURE__ */ createElement("box", {
      id: "tooltip"
    }), /* @__PURE__ */ createElement("box", {
      id: "cursor-region"
    }), /* @__PURE__ */ createElement("page-manager", {
      id: "workspace-page-manager"
    }, /* @__PURE__ */ createElement("page-frame", {
      value: "home"
    }, /* @__PURE__ */ createElement("box", {
      id: "home-content"
    }, /* @__PURE__ */ createElement("box", {
      id: "home-start-list"
    }, /* @__PURE__ */ createElement("item", {
      id: "home-start-label",
      class: "home-list-label"
    }, "Start"), /* @__PURE__ */ createElement("item", {
      id: "home-start-new",
      class: "home-start-item",
      value: "new"
    }, "New Project"), /* @__PURE__ */ createElement("item", {
      id: "home-start-open",
      class: "home-start-item",
      value: "open"
    }, "Open Project")), /* @__PURE__ */ createElement("box", {
      id: "home-recent-list",
      tabindex: "-1"
    }, /* @__PURE__ */ createElement("item", {
      id: "home-recent-label",
      class: "home-list-label"
    }, "Recent"), /* @__PURE__ */ createElement("item", {
      class: "home-recent-item",
      value: "0"
    }), /* @__PURE__ */ createElement("item", {
      class: "home-recent-item",
      value: "1"
    }), /* @__PURE__ */ createElement("item", {
      class: "home-recent-item",
      value: "2"
    })))), /* @__PURE__ */ createElement("page-frame", {
      value: "directory"
    }), /* @__PURE__ */ createElement("page-frame", {
      value: "scene"
    }), /* @__PURE__ */ createElement("page-frame", {
      value: "ui"
    }), /* @__PURE__ */ createElement("page-frame", {
      value: "animation"
    }), /* @__PURE__ */ createElement("page-frame", {
      value: "particle"
    })), /* @__PURE__ */ createElement("box", {
      id: "layout-content"
    }, /* @__PURE__ */ createElement("nav-bar", {
      id: "layout-nav"
    }, /* @__PURE__ */ createElement("nav-item", {
      value: "project"
    }, /* @__PURE__ */ createElement("nav-icon", null, "\uF07B"), /* @__PURE__ */ createElement("nav-text", {
      id: "nav-project"
    }, "Project")), /* @__PURE__ */ createElement("nav-item", {
      value: "scene"
    }, /* @__PURE__ */ createElement("nav-icon", null, "\uF26C"), /* @__PURE__ */ createElement("nav-text", {
      id: "nav-scene"
    }, "Scene")), /* @__PURE__ */ createElement("nav-item", {
      value: "scene-object"
    }, /* @__PURE__ */ createElement("nav-icon", null, "\uF1B2"), /* @__PURE__ */ createElement("nav-text", {
      id: "nav-scene-object"
    }, "Object")), /* @__PURE__ */ createElement("nav-item", {
      value: "ui"
    }, /* @__PURE__ */ createElement("nav-icon", null, "\uF26C"), /* @__PURE__ */ createElement("nav-text", {
      id: "nav-ui"
    }, "UI")), /* @__PURE__ */ createElement("nav-item", {
      value: "ui-element"
    }, /* @__PURE__ */ createElement("nav-icon", null, "\uF1B2"), /* @__PURE__ */ createElement("nav-text", {
      id: "nav-ui-element"
    }, "Element")), /* @__PURE__ */ createElement("nav-item", {
      value: "animation"
    }, /* @__PURE__ */ createElement("nav-icon", null, "\uF26C"), /* @__PURE__ */ createElement("nav-text", {
      id: "nav-animation"
    }, "Animation")), /* @__PURE__ */ createElement("nav-item", {
      value: "animation-motion"
    }, /* @__PURE__ */ createElement("nav-icon", null, "\uF1B2"), /* @__PURE__ */ createElement("nav-text", {
      id: "nav-animation-motion"
    }, "Motion")), /* @__PURE__ */ createElement("nav-item", {
      value: "animation-timeline"
    }, /* @__PURE__ */ createElement("nav-icon", null, "\uF017"), /* @__PURE__ */ createElement("nav-text", {
      id: "nav-animation-timeline"
    }, "Timeline")), /* @__PURE__ */ createElement("nav-item", {
      value: "animation-easing"
    }, /* @__PURE__ */ createElement("nav-icon", null, "\uF201"), /* @__PURE__ */ createElement("nav-text", {
      id: "nav-animation-easing"
    }, "Easing")), /* @__PURE__ */ createElement("nav-item", {
      value: "particle"
    }, /* @__PURE__ */ createElement("nav-icon", null, "\uF26C"), /* @__PURE__ */ createElement("nav-text", {
      id: "nav-particle"
    }, "Particle")), /* @__PURE__ */ createElement("nav-item", {
      value: "particle-layer"
    }, /* @__PURE__ */ createElement("nav-icon", null, "\uF1B2"), /* @__PURE__ */ createElement("nav-text", {
      id: "nav-particle-layer"
    }, "Layer")), /* @__PURE__ */ createElement("nav-item", {
      value: "inspector"
    }, /* @__PURE__ */ createElement("nav-icon", null, "\uF05A"), /* @__PURE__ */ createElement("nav-text", {
      id: "nav-inspector"
    }, "Inspector"))), /* @__PURE__ */ createElement("page-manager", {
      id: "layout-page-manager"
    }, /* @__PURE__ */ createElement("page-frame", {
      id: "project",
      value: "project"
    }, /* @__PURE__ */ createElement("file-browser", {
      id: "project-browser"
    })), /* @__PURE__ */ createElement("page-frame", {
      id: "scene",
      value: "scene"
    }, /* @__PURE__ */ createElement("box", {
      id: "scene-head"
    }, /* @__PURE__ */ createElement("box", {
      id: "scene-head-start"
    }, /* @__PURE__ */ createElement("item", {
      id: "scene-switch-grid",
      class: "toolbar-item",
      value: "grid"
    }), /* @__PURE__ */ createElement("item", {
      id: "scene-switch-light",
      class: "toolbar-item",
      value: "light"
    }), /* @__PURE__ */ createElement("item", {
      id: "scene-switch-animation",
      class: "toolbar-item",
      value: "animation"
    }), /* @__PURE__ */ createElement("item", {
      id: "scene-switch-settings",
      class: "toolbar-item",
      value: "settings"
    })), /* @__PURE__ */ createElement("box", {
      id: "scene-head-center"
    }, /* @__PURE__ */ createElement("box", {
      id: "scene-layer"
    }, /* @__PURE__ */ createElement("item", {
      id: "scene-layer-object",
      class: "toolbar-item",
      value: "object"
    }), /* @__PURE__ */ createElement("item", {
      id: "scene-layer-tilemap-1",
      class: "toolbar-item hidden",
      value: "1"
    }), /* @__PURE__ */ createElement("item", {
      id: "scene-layer-tilemap-2",
      class: "toolbar-item hidden",
      value: "2"
    }), /* @__PURE__ */ createElement("item", {
      id: "scene-layer-tilemap-3",
      class: "toolbar-item hidden",
      value: "3"
    }), /* @__PURE__ */ createElement("item", {
      id: "scene-layer-tilemap-4",
      class: "toolbar-item hidden",
      value: "4"
    }), /* @__PURE__ */ createElement("item", {
      id: "scene-layer-tilemap-5",
      class: "toolbar-item hidden",
      value: "5"
    }), /* @__PURE__ */ createElement("item", {
      id: "scene-layer-tilemap-6",
      class: "toolbar-item hidden",
      value: "6"
    }), /* @__PURE__ */ createElement("item", {
      id: "scene-layer-terrain",
      class: "toolbar-item",
      value: "terrain"
    })), /* @__PURE__ */ createElement("box", {
      id: "scene-brush"
    }, /* @__PURE__ */ createElement("item", {
      id: "scene-brush-eraser",
      class: "toolbar-item",
      value: "eraser"
    }), /* @__PURE__ */ createElement("item", {
      id: "scene-brush-pencil",
      class: "toolbar-item",
      value: "pencil"
    }), /* @__PURE__ */ createElement("item", {
      id: "scene-brush-rect",
      class: "toolbar-item",
      value: "rect"
    }), /* @__PURE__ */ createElement("item", {
      id: "scene-brush-oval",
      class: "toolbar-item",
      value: "oval"
    }), /* @__PURE__ */ createElement("item", {
      id: "scene-brush-fill",
      class: "toolbar-item",
      value: "fill"
    }))), /* @__PURE__ */ createElement("box", {
      id: "scene-head-end"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "scene-zoom",
      name: "zoom",
      min: "0",
      max: "4",
      "active-wheel": true
    }))), /* @__PURE__ */ createElement("box", {
      id: "scene-body"
    }, /* @__PURE__ */ createElement("box", {
      id: "scene-screen",
      tabindex: "-1"
    }, /* @__PURE__ */ createElement("marquee-area", {
      id: "scene-marquee"
    })), /* @__PURE__ */ createElement("text", {
      id: "scene-info"
    }))), /* @__PURE__ */ createElement("page-frame", {
      id: "scene-object",
      value: "scene-object"
    }, /* @__PURE__ */ createElement("box", {
      id: "scene-list-head"
    }, /* @__PURE__ */ createElement("text-box", {
      id: "scene-searcher",
      name: "search"
    })), /* @__PURE__ */ createElement("node-list", {
      id: "scene-list",
      padded: true
    })), /* @__PURE__ */ createElement("page-frame", {
      id: "ui",
      value: "ui"
    }, /* @__PURE__ */ createElement("box", {
      id: "ui-head"
    }, /* @__PURE__ */ createElement("box", {
      id: "ui-head-start"
    }, /* @__PURE__ */ createElement("item", {
      id: "ui-switch-settings",
      class: "toolbar-item",
      value: "settings"
    })), /* @__PURE__ */ createElement("box", {
      id: "ui-head-center"
    }, /* @__PURE__ */ createElement("item", {
      id: "ui-element-image",
      class: "toolbar-item",
      value: "image"
    }), /* @__PURE__ */ createElement("item", {
      id: "ui-element-text",
      class: "toolbar-item",
      value: "text"
    }), /* @__PURE__ */ createElement("item", {
      id: "ui-element-textbox",
      class: "toolbar-item",
      value: "textbox"
    }), /* @__PURE__ */ createElement("item", {
      id: "ui-element-dialogbox",
      class: "toolbar-item",
      value: "dialogbox"
    }), /* @__PURE__ */ createElement("item", {
      id: "ui-element-progressbar",
      class: "toolbar-item",
      value: "progressbar"
    }), /* @__PURE__ */ createElement("item", {
      id: "ui-element-video",
      class: "toolbar-item",
      value: "video"
    }), /* @__PURE__ */ createElement("item", {
      id: "ui-element-window",
      class: "toolbar-item",
      value: "window"
    }), /* @__PURE__ */ createElement("item", {
      id: "ui-element-container",
      class: "toolbar-item",
      value: "container"
    })), /* @__PURE__ */ createElement("box", {
      id: "ui-head-end"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "ui-zoom",
      name: "zoom",
      min: "0",
      max: "4",
      "active-wheel": true
    }))), /* @__PURE__ */ createElement("box", {
      id: "ui-body"
    }, /* @__PURE__ */ createElement("box", {
      id: "ui-screen",
      tabindex: "-1"
    }, /* @__PURE__ */ createElement("marquee-area", {
      id: "ui-marquee"
    })))), /* @__PURE__ */ createElement("page-frame", {
      id: "ui-element",
      value: "ui-element"
    }, /* @__PURE__ */ createElement("box", {
      id: "ui-list-head"
    }, /* @__PURE__ */ createElement("text-box", {
      id: "ui-searcher",
      name: "search"
    })), /* @__PURE__ */ createElement("node-list", {
      id: "ui-list",
      padded: true
    })), /* @__PURE__ */ createElement("page-frame", {
      id: "animation",
      value: "animation"
    }, /* @__PURE__ */ createElement("box", {
      id: "animation-head"
    }, /* @__PURE__ */ createElement("box", {
      id: "animation-head-start"
    }, /* @__PURE__ */ createElement("item", {
      id: "animation-switch-mark",
      class: "toolbar-item",
      value: "mark"
    }), /* @__PURE__ */ createElement("item", {
      id: "animation-switch-onionskin",
      class: "toolbar-item",
      value: "onionskin"
    }), /* @__PURE__ */ createElement("item", {
      id: "animation-switch-mirror",
      class: "toolbar-item",
      value: "mirror"
    }), /* @__PURE__ */ createElement("item", {
      id: "animation-switch-settings",
      class: "toolbar-item",
      value: "settings"
    })), /* @__PURE__ */ createElement("box", {
      id: "animation-head-center"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "animation-speed",
      min: "0",
      max: "4",
      step: "0.05",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "speed:"))), /* @__PURE__ */ createElement("box", {
      id: "animation-head-end"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "animation-zoom",
      name: "zoom",
      min: "0",
      max: "4",
      "active-wheel": true
    }))), /* @__PURE__ */ createElement("box", {
      id: "animation-body"
    }, /* @__PURE__ */ createElement("box", {
      id: "animation-screen",
      tabindex: "-1"
    }, /* @__PURE__ */ createElement("marquee-area", {
      id: "animation-marquee"
    })))), /* @__PURE__ */ createElement("page-frame", {
      id: "animation-motion",
      value: "animation-motion"
    }, /* @__PURE__ */ createElement("box", {
      id: "animation-list-head"
    }, /* @__PURE__ */ createElement("text-box", {
      id: "animation-searcher",
      name: "search"
    })), /* @__PURE__ */ createElement("node-list", {
      id: "animation-list",
      padded: true
    })), /* @__PURE__ */ createElement("page-frame", {
      id: "animation-timeline",
      value: "animation-timeline"
    }, /* @__PURE__ */ createElement("box", {
      id: "animation-timeline-head"
    }, /* @__PURE__ */ createElement("box", {
      id: "animation-timeline-toolbar"
    }, /* @__PURE__ */ createElement("item", {
      id: "animation-timeline-previousKey",
      class: "toolbar-item",
      value: "previousKey"
    }), /* @__PURE__ */ createElement("item", {
      id: "animation-timeline-previous",
      class: "toolbar-item",
      value: "previous"
    }), /* @__PURE__ */ createElement("item", {
      id: "animation-timeline-play",
      class: "toolbar-item",
      value: "play"
    }), /* @__PURE__ */ createElement("item", {
      id: "animation-timeline-next",
      class: "toolbar-item",
      value: "next"
    }), /* @__PURE__ */ createElement("item", {
      id: "animation-timeline-nextKey",
      class: "toolbar-item",
      value: "nextKey"
    }), /* @__PURE__ */ createElement("item", {
      id: "animation-timeline-loop",
      class: "toolbar-item",
      value: "loop"
    })), /* @__PURE__ */ createElement("box", {
      id: "animation-timeline-ruler-outer"
    }, /* @__PURE__ */ createElement("box", {
      id: "animation-timeline-ruler-inner"
    }))), /* @__PURE__ */ createElement("node-list", {
      id: "animation-layer-list"
    }), /* @__PURE__ */ createElement("box", {
      id: "animation-timeline-list-outer",
      tabindex: "0"
    }, /* @__PURE__ */ createElement("box", {
      id: "animation-timeline-list-inner"
    }), /* @__PURE__ */ createElement("box", {
      id: "animation-timeline-cursor"
    }), /* @__PURE__ */ createElement("box", {
      id: "animation-timeline-marquee"
    }), /* @__PURE__ */ createElement("box", {
      id: "animation-timeline-marquee-shift"
    })), /* @__PURE__ */ createElement("box", {
      id: "animation-timeline-pointer-area-outer"
    }, /* @__PURE__ */ createElement("box", {
      id: "animation-timeline-pointer-area-inner"
    }, /* @__PURE__ */ createElement("box", {
      id: "animation-timeline-pointer"
    })))), /* @__PURE__ */ createElement("page-frame", {
      id: "animation-easing",
      value: "animation-easing"
    }, /* @__PURE__ */ createElement("box", {
      id: "animation-easing-head"
    }, /* @__PURE__ */ createElement("item", {
      id: "animation-easing-settings",
      class: "toolbar-item",
      value: "bezier"
    }), /* @__PURE__ */ createElement("select-box", {
      id: "animation-easing-id"
    })), /* @__PURE__ */ createElement("canvas", {
      id: "animation-easing-canvas",
      width: "0",
      height: "0"
    })), /* @__PURE__ */ createElement("page-frame", {
      id: "particle",
      value: "particle"
    }, /* @__PURE__ */ createElement("box", {
      id: "particle-head"
    }, /* @__PURE__ */ createElement("box", {
      id: "particle-head-start"
    }, /* @__PURE__ */ createElement("item", {
      id: "particle-view-wireframe",
      class: "toolbar-item",
      value: "wireframe"
    }), /* @__PURE__ */ createElement("item", {
      id: "particle-view-anchor",
      class: "toolbar-item",
      value: "anchor"
    })), /* @__PURE__ */ createElement("box", {
      id: "particle-head-center"
    }, /* @__PURE__ */ createElement("box", {
      id: "particle-control"
    }, /* @__PURE__ */ createElement("item", {
      id: "particle-control-restart",
      class: "toolbar-item",
      value: "restart"
    }), /* @__PURE__ */ createElement("item", {
      id: "particle-control-pause",
      class: "toolbar-item",
      value: "pause"
    })), /* @__PURE__ */ createElement("number-box", {
      id: "particle-speed",
      min: "0",
      max: "4",
      step: "0.05",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "speed:")), /* @__PURE__ */ createElement("number-box", {
      id: "particle-duration",
      min: "0",
      max: "60000",
      unit: "ms"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "duration:"))), /* @__PURE__ */ createElement("box", {
      id: "particle-head-end"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "particle-zoom",
      name: "zoom",
      min: "0",
      max: "4",
      "active-wheel": true
    }))), /* @__PURE__ */ createElement("box", {
      id: "particle-body"
    }, /* @__PURE__ */ createElement("box", {
      id: "particle-screen",
      tabindex: "-1"
    }, /* @__PURE__ */ createElement("marquee-area", {
      id: "particle-marquee"
    })), /* @__PURE__ */ createElement("text", {
      id: "particle-info"
    }))), /* @__PURE__ */ createElement("page-frame", {
      id: "particle-layer",
      value: "particle-layer"
    }, /* @__PURE__ */ createElement("node-list", {
      id: "particle-list",
      padded: true
    })), /* @__PURE__ */ createElement("page-frame", {
      id: "inspector",
      value: "inspector"
    }, /* @__PURE__ */ createElement("page-manager", {
      id: "inspector-page-manager",
      tabindex: "-1"
    }, /* @__PURE__ */ createElement("page-frame", {
      value: "fileScene"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scene"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileScene-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Width"), /* @__PURE__ */ createElement("number-box", {
      id: "fileScene-width",
      min: "0",
      max: "512",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Height"), /* @__PURE__ */ createElement("number-box", {
      id: "fileScene-height",
      min: "0",
      max: "512",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Tile Width"), /* @__PURE__ */ createElement("number-box", {
      id: "fileScene-tileWidth",
      min: "16",
      max: "256",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Tile Height"), /* @__PURE__ */ createElement("number-box", {
      id: "fileScene-tileHeight",
      min: "16",
      max: "256",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Contrast"), /* @__PURE__ */ createElement("flex-box", {
      id: "fileScene-contrast-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "fileScene-contrast-slider",
      min: "1",
      max: "1.5",
      step: "0.05"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "fileScene-contrast",
      min: "1",
      max: "1.5",
      step: "0.05",
      decimals: "4"
    })))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Ambient Light"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileScene-ambient-grid"
    }, /* @__PURE__ */ createElement("text", null, "Red"), /* @__PURE__ */ createElement("flex-box", {
      id: "fileScene-ambient-red-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "fileScene-ambient-red-slider",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "fileScene-ambient-red",
      min: "0",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Green"), /* @__PURE__ */ createElement("flex-box", {
      id: "fileScene-ambient-green-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "fileScene-ambient-green-slider",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "fileScene-ambient-green",
      min: "0",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Blue"), /* @__PURE__ */ createElement("flex-box", {
      id: "fileScene-ambient-blue-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "fileScene-ambient-blue-slider",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "fileScene-ambient-blue",
      min: "0",
      max: "255",
      step: "5"
    })))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Events"), /* @__PURE__ */ createElement("param-list", {
      id: "fileScene-events",
      class: "inspector-list",
      filter: "scene",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scripts"), /* @__PURE__ */ createElement("param-list", {
      id: "fileScene-scripts",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "fileScene-parameter-pane"
    })), /* @__PURE__ */ createElement("page-frame", {
      value: "fileUI"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Stage Foreground"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileUI-foreground-grid"
    }, /* @__PURE__ */ createElement("text", null, "Width"), /* @__PURE__ */ createElement("number-box", {
      id: "fileUI-width",
      min: "8",
      max: "3840",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Height"), /* @__PURE__ */ createElement("number-box", {
      id: "fileUI-height",
      min: "8",
      max: "3840",
      unit: "px"
    })))), /* @__PURE__ */ createElement("page-frame", {
      value: "fileAnimation"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileAnimation-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Direction"), /* @__PURE__ */ createElement("select-box", {
      id: "fileAnimation-mode"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Sprites"), /* @__PURE__ */ createElement("param-list", {
      id: "fileAnimation-sprites",
      class: "inspector-list",
      flexible: true
    }))), /* @__PURE__ */ createElement("page-frame", {
      id: "fileTileset",
      value: "fileTileset"
    }, /* @__PURE__ */ createElement("box", {
      id: "palette-head"
    }, /* @__PURE__ */ createElement("box", {
      id: "palette-head-start"
    }, /* @__PURE__ */ createElement("item", {
      id: "palette-scroll",
      class: "toolbar-item",
      value: "scroll"
    }), /* @__PURE__ */ createElement("item", {
      id: "palette-edit",
      class: "toolbar-item",
      value: "edit"
    }), /* @__PURE__ */ createElement("item", {
      id: "palette-flip",
      class: "toolbar-item",
      value: "flip"
    })), /* @__PURE__ */ createElement("slider-box", {
      id: "palette-zoom",
      name: "zoom",
      min: "0",
      max: "4"
    })), /* @__PURE__ */ createElement("box", {
      id: "palette-body"
    }, /* @__PURE__ */ createElement("box", {
      id: "palette-frame"
    }, /* @__PURE__ */ createElement("canvas", {
      id: "palette-canvas",
      width: "0",
      height: "0"
    }), /* @__PURE__ */ createElement("box", {
      id: "palette-screen",
      tabindex: "-1"
    }, /* @__PURE__ */ createElement("marquee-area", {
      id: "palette-marquee"
    })))), /* @__PURE__ */ createElement("detail-box", {
      id: "fileTileset-general-detail",
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Tileset"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileTileset-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Image"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileTileset-image",
      type: "file",
      filter: "image"
    }), /* @__PURE__ */ createElement("text", null, "Width"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTileset-width",
      min: "1",
      max: "256",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Height"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTileset-height",
      min: "1",
      max: "256",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Tile Width"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTileset-tileWidth",
      min: "16",
      max: "256",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Tile Height"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTileset-tileHeight",
      min: "16",
      max: "256",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Tile Offset X"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTileset-globalOffsetX",
      min: "-256",
      max: "256",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Tile Offset Y"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTileset-globalOffsetY",
      min: "-256",
      max: "256",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Tile Priority"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTileset-globalPriority",
      min: "-10",
      max: "10",
      decimals: "4"
    })))), /* @__PURE__ */ createElement("page-frame", {
      value: "fileActor"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileActor-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Portrait"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileActor-portrait",
      type: "file",
      filter: "image"
    }), /* @__PURE__ */ createElement("text", null, "Animation"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileActor-animationId",
      type: "file",
      filter: "animation"
    }), /* @__PURE__ */ createElement("text", null, "Idle Motion"), /* @__PURE__ */ createElement("select-box", {
      id: "fileActor-idleMotion"
    }), /* @__PURE__ */ createElement("text", null, "Move Motion"), /* @__PURE__ */ createElement("select-box", {
      id: "fileActor-moveMotion"
    }), /* @__PURE__ */ createElement("text", null, "Movement Speed"), /* @__PURE__ */ createElement("number-box", {
      id: "fileActor-speed",
      min: "0",
      max: "32",
      decimals: "4",
      unit: "t/s"
    }), /* @__PURE__ */ createElement("text", null, "Collision Size"), /* @__PURE__ */ createElement("number-box", {
      id: "fileActor-size",
      min: "0",
      max: "4",
      step: "0.1",
      decimals: "4",
      unit: "t"
    }), /* @__PURE__ */ createElement("text", null, "Collision Weight"), /* @__PURE__ */ createElement("number-box", {
      id: "fileActor-weight",
      min: "0",
      max: "8",
      step: "0.1",
      decimals: "4"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Sprites"), /* @__PURE__ */ createElement("param-list", {
      id: "fileActor-sprites",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Attributes"), /* @__PURE__ */ createElement("param-list", {
      id: "fileActor-attributes",
      class: "inspector-list",
      group: "actor",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Skills"), /* @__PURE__ */ createElement("param-list", {
      id: "fileActor-skills",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Equipments"), /* @__PURE__ */ createElement("param-list", {
      id: "fileActor-equipments",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Events"), /* @__PURE__ */ createElement("param-list", {
      id: "fileActor-events",
      class: "inspector-list",
      filter: "actor",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scripts"), /* @__PURE__ */ createElement("param-list", {
      id: "fileActor-scripts",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "fileActor-parameter-pane"
    })), /* @__PURE__ */ createElement("page-frame", {
      value: "fileSkill"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileSkill-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Icon"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileSkill-icon",
      type: "file",
      filter: "image"
    }), /* @__PURE__ */ createElement("text", null, "Clip"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileSkill-clip",
      type: "clip",
      image: "fileSkill-icon"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Attributes"), /* @__PURE__ */ createElement("param-list", {
      id: "fileSkill-attributes",
      class: "inspector-list",
      group: "skill",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Events"), /* @__PURE__ */ createElement("param-list", {
      id: "fileSkill-events",
      class: "inspector-list",
      filter: "skill",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scripts"), /* @__PURE__ */ createElement("param-list", {
      id: "fileSkill-scripts",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "fileSkill-parameter-pane"
    })), /* @__PURE__ */ createElement("page-frame", {
      value: "fileTrigger"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileTrigger-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Selector"), /* @__PURE__ */ createElement("select-box", {
      id: "fileTrigger-selector"
    }), /* @__PURE__ */ createElement("text", null, "On Hit Walls"), /* @__PURE__ */ createElement("select-box", {
      id: "fileTrigger-onHitWalls"
    }), /* @__PURE__ */ createElement("text", null, "On Hit Actors"), /* @__PURE__ */ createElement("select-box", {
      id: "fileTrigger-onHitActors"
    }), /* @__PURE__ */ createElement("text", null, "Shape"), /* @__PURE__ */ createElement("select-box", {
      id: "fileTrigger-shape-type"
    }), /* @__PURE__ */ createElement("text", null, "Width"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTrigger-shape-width",
      min: "0",
      max: "512",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Height"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTrigger-shape-height",
      min: "0",
      max: "512",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Radius"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTrigger-shape-radius",
      min: "0",
      max: "512",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Central Angle"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTrigger-shape-centralAngle",
      min: "0",
      max: "360",
      decimals: "4",
      unit: "deg"
    }), /* @__PURE__ */ createElement("text", null, "Speed"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTrigger-speed",
      min: "0",
      max: "512",
      decimals: "4",
      unit: "t/s"
    }), /* @__PURE__ */ createElement("text", null, "Hit Mode"), /* @__PURE__ */ createElement("select-box", {
      id: "fileTrigger-hitMode"
    }), /* @__PURE__ */ createElement("text", null, "Hit Interval"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTrigger-hitInterval",
      min: "0",
      max: "10000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Initial Delay"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTrigger-initialDelay",
      min: "0",
      max: "10000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Effective Time"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTrigger-effectiveTime",
      min: "0",
      max: "10000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTrigger-duration",
      min: "0",
      max: "1000000000",
      unit: "ms"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Animation"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileTrigger-animation-grid"
    }, /* @__PURE__ */ createElement("text", null, "Animation"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileTrigger-animationId",
      type: "file",
      filter: "animation"
    }), /* @__PURE__ */ createElement("text", null, "Motion"), /* @__PURE__ */ createElement("select-box", {
      id: "fileTrigger-motion"
    }), /* @__PURE__ */ createElement("text", null, "Priority"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTrigger-priority",
      min: "-100",
      max: "100"
    }), /* @__PURE__ */ createElement("text", null, "Offset Y"), /* @__PURE__ */ createElement("number-box", {
      id: "fileTrigger-offsetY",
      min: "-100",
      max: "100",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Rotatable"), /* @__PURE__ */ createElement("select-box", {
      id: "fileTrigger-rotatable"
    }), /* @__PURE__ */ createElement("text", null, "Mappable"), /* @__PURE__ */ createElement("select-box", {
      id: "fileTrigger-mappable"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Events"), /* @__PURE__ */ createElement("param-list", {
      id: "fileTrigger-events",
      class: "inspector-list",
      filter: "trigger",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scripts"), /* @__PURE__ */ createElement("param-list", {
      id: "fileTrigger-scripts",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "fileTrigger-parameter-pane"
    })), /* @__PURE__ */ createElement("page-frame", {
      value: "fileItem"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileItem-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Icon"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileItem-icon",
      type: "file",
      filter: "image"
    }), /* @__PURE__ */ createElement("text", null, "Clip"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileItem-clip",
      type: "clip",
      image: "fileItem-icon"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Attributes"), /* @__PURE__ */ createElement("param-list", {
      id: "fileItem-attributes",
      class: "inspector-list",
      group: "item",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Events"), /* @__PURE__ */ createElement("param-list", {
      id: "fileItem-events",
      class: "inspector-list",
      filter: "item",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scripts"), /* @__PURE__ */ createElement("param-list", {
      id: "fileItem-scripts",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "fileItem-parameter-pane"
    })), /* @__PURE__ */ createElement("page-frame", {
      value: "fileEquipment"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileEquipment-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Icon"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileEquipment-icon",
      type: "file",
      filter: "image"
    }), /* @__PURE__ */ createElement("text", null, "Clip"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileEquipment-clip",
      type: "clip",
      image: "fileEquipment-icon"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Attributes"), /* @__PURE__ */ createElement("param-list", {
      id: "fileEquipment-attributes",
      class: "inspector-list",
      group: "equipment",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Events"), /* @__PURE__ */ createElement("param-list", {
      id: "fileEquipment-events",
      class: "inspector-list",
      filter: "equipment",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scripts"), /* @__PURE__ */ createElement("param-list", {
      id: "fileEquipment-scripts",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "fileEquipment-parameter-pane"
    })), /* @__PURE__ */ createElement("page-frame", {
      value: "fileState"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileState-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Icon"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileState-icon",
      type: "file",
      filter: "image"
    }), /* @__PURE__ */ createElement("text", null, "Clip"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileState-clip",
      type: "clip",
      image: "fileState-icon"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Attributes"), /* @__PURE__ */ createElement("param-list", {
      id: "fileState-attributes",
      class: "inspector-list",
      group: "state",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Events"), /* @__PURE__ */ createElement("param-list", {
      id: "fileState-events",
      class: "inspector-list",
      filter: "state",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scripts"), /* @__PURE__ */ createElement("param-list", {
      id: "fileState-scripts",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "fileState-parameter-pane"
    })), /* @__PURE__ */ createElement("page-frame", {
      value: "fileEvent"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileEvent-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "fileEvent-type"
    })))), /* @__PURE__ */ createElement("page-frame", {
      id: "fileImage",
      value: "fileImage"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "File Info"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileImage-info-grid"
    }, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text", {
      id: "fileImage-name"
    }), /* @__PURE__ */ createElement("text", null, "Size"), /* @__PURE__ */ createElement("text", {
      id: "fileImage-size"
    }), /* @__PURE__ */ createElement("text", null, "Resolution"), /* @__PURE__ */ createElement("text", {
      id: "fileImage-resolution"
    }))), /* @__PURE__ */ createElement("detail-box", {
      id: "fileImage-image-detail",
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Image"), /* @__PURE__ */ createElement("box", {
      id: "fileImage-image-viewer"
    }, /* @__PURE__ */ createElement("img", {
      id: "fileImage-image"
    })))), /* @__PURE__ */ createElement("page-frame", {
      id: "fileAudio",
      value: "fileAudio"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "File Info"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileAudio-info-grid"
    }, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text", {
      id: "fileAudio-name"
    }), /* @__PURE__ */ createElement("text", null, "Size"), /* @__PURE__ */ createElement("text", {
      id: "fileAudio-size"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("text", {
      id: "fileAudio-duration"
    }), /* @__PURE__ */ createElement("text", null, "Bitrate"), /* @__PURE__ */ createElement("text", {
      id: "fileAudio-bitrate"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Mixer"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileAudio-mixer-grid"
    }, /* @__PURE__ */ createElement("text", null, "Volume"), /* @__PURE__ */ createElement("flex-box", {
      id: "fileAudio-volume-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "fileAudio-volume",
      min: "0",
      max: "1",
      step: "0.1"
    }), /* @__PURE__ */ createElement("text", {
      id: "fileAudio-volume-info"
    }, "100%")), /* @__PURE__ */ createElement("text", null, "Pan"), /* @__PURE__ */ createElement("flex-box", {
      id: "fileAudio-pan-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "fileAudio-pan",
      min: "-1",
      max: "1",
      step: "0.1"
    }), /* @__PURE__ */ createElement("text", {
      id: "fileAudio-pan-info"
    }, "0%")), /* @__PURE__ */ createElement("text", null, "Reverb - Dry"), /* @__PURE__ */ createElement("flex-box", {
      id: "fileAudio-dry-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "fileAudio-dry",
      min: "0",
      max: "1",
      step: "0.1"
    }), /* @__PURE__ */ createElement("text", {
      id: "fileAudio-dry-info"
    }, "100%")), /* @__PURE__ */ createElement("text", null, "Reverb - Wet"), /* @__PURE__ */ createElement("flex-box", {
      id: "fileAudio-wet-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "fileAudio-wet",
      min: "0",
      max: "1",
      step: "0.1"
    }), /* @__PURE__ */ createElement("text", {
      id: "fileAudio-wet-info"
    }, "0%")))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Progress"), /* @__PURE__ */ createElement("box", {
      id: "fileAudio-progress-box"
    }, /* @__PURE__ */ createElement("box", {
      id: "fileAudio-progress"
    }, /* @__PURE__ */ createElement("box", {
      id: "fileAudio-progress-filler"
    })), /* @__PURE__ */ createElement("box", {
      id: "fileAudio-progress-pointer"
    }), /* @__PURE__ */ createElement("text", {
      id: "fileAudio-currentTime"
    }), /* @__PURE__ */ createElement("text", {
      id: "fileAudio-pointerTime"
    }))), /* @__PURE__ */ createElement("detail-box", {
      id: "fileAudio-frequency-detail",
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Frequency"), /* @__PURE__ */ createElement("canvas", {
      id: "fileAudio-frequency-canvas",
      width: "0",
      height: "0"
    }))), /* @__PURE__ */ createElement("page-frame", {
      id: "fileVideo",
      value: "fileVideo"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "File Info"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileVideo-info-grid"
    }, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text", {
      id: "fileVideo-name"
    }), /* @__PURE__ */ createElement("text", null, "Size"), /* @__PURE__ */ createElement("text", {
      id: "fileVideo-size"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("text", {
      id: "fileVideo-duration"
    }), /* @__PURE__ */ createElement("text", null, "Resolution"), /* @__PURE__ */ createElement("text", {
      id: "fileVideo-resolution"
    }), /* @__PURE__ */ createElement("text", null, "Bitrate"), /* @__PURE__ */ createElement("text", {
      id: "fileVideo-bitrate"
    }))), /* @__PURE__ */ createElement("detail-box", {
      id: "fileVideo-video-detail",
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Player"), /* @__PURE__ */ createElement("video", {
      id: "fileVideo-video",
      controls: "controls"
    }))), /* @__PURE__ */ createElement("page-frame", {
      id: "fileFont",
      value: "fileFont"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "File Info"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileFont-info-grid"
    }, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text", {
      id: "fileFont-name"
    }), /* @__PURE__ */ createElement("text", null, "Size"), /* @__PURE__ */ createElement("text", {
      id: "fileFont-size"
    }))), /* @__PURE__ */ createElement("detail-box", {
      id: "fileFont-font-detail",
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Font Preview"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileFont-font-grid"
    }, /* @__PURE__ */ createElement("text-box", {
      id: "fileFont-content"
    }), /* @__PURE__ */ createElement("text", {
      id: "fileFont-12px",
      class: "fileFont-preview"
    }), /* @__PURE__ */ createElement("text", {
      id: "fileFont-18px",
      class: "fileFont-preview"
    }), /* @__PURE__ */ createElement("text", {
      id: "fileFont-24px",
      class: "fileFont-preview"
    }), /* @__PURE__ */ createElement("text", {
      id: "fileFont-36px",
      class: "fileFont-preview"
    }), /* @__PURE__ */ createElement("text", {
      id: "fileFont-48px",
      class: "fileFont-preview"
    }), /* @__PURE__ */ createElement("text", {
      id: "fileFont-60px",
      class: "fileFont-preview"
    }), /* @__PURE__ */ createElement("text", {
      id: "fileFont-72px",
      class: "fileFont-preview"
    })))), /* @__PURE__ */ createElement("page-frame", {
      id: "fileScript",
      value: "fileScript"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "File Info"), /* @__PURE__ */ createElement("detail-grid", {
      id: "fileScript-info-grid"
    }, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text", {
      id: "fileScript-name"
    }), /* @__PURE__ */ createElement("text", null, "Size"), /* @__PURE__ */ createElement("text", {
      id: "fileScript-size"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Overview"), /* @__PURE__ */ createElement("box", {
      id: "fileScript-overview"
    }))), /* @__PURE__ */ createElement("page-frame", {
      value: "sceneActor"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "sceneActor-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text-box", {
      id: "sceneActor-name"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "sceneActor-actorId",
      type: "file",
      filter: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Team"), /* @__PURE__ */ createElement("select-box", {
      id: "sceneActor-teamId"
    }), /* @__PURE__ */ createElement("text", null, "X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneActor-x",
      min: "-128",
      max: "640",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneActor-y",
      min: "-128",
      max: "640",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Angle"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneActor-angle",
      min: "-360",
      max: "360",
      step: "45",
      decimals: "4",
      unit: "deg"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Conditions"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneActor-conditions",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Events"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneActor-events",
      class: "inspector-list",
      filter: "actor",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scripts"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneActor-scripts",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "sceneActor-parameter-pane"
    })), /* @__PURE__ */ createElement("page-frame", {
      value: "sceneRegion"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "sceneRegion-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text-box", {
      id: "sceneRegion-name"
    }), /* @__PURE__ */ createElement("text", null, "Color"), /* @__PURE__ */ createElement("color-box", {
      id: "sceneRegion-color"
    }), /* @__PURE__ */ createElement("text", null, "X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneRegion-x",
      min: "-128",
      max: "640",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneRegion-y",
      min: "-128",
      max: "640",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Width"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneRegion-width",
      min: "0",
      max: "512",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Height"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneRegion-height",
      min: "0",
      max: "512",
      decimals: "4"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Conditions"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneRegion-conditions",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Events"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneRegion-events",
      class: "inspector-list",
      filter: "region",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scripts"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneRegion-scripts",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "sceneRegion-parameter-pane"
    })), /* @__PURE__ */ createElement("page-frame", {
      value: "sceneLight"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "sceneLight-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text-box", {
      id: "sceneLight-name"
    }), /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "sceneLight-type"
    }), /* @__PURE__ */ createElement("text", null, "Blend"), /* @__PURE__ */ createElement("select-box", {
      id: "sceneLight-blend"
    }), /* @__PURE__ */ createElement("text", null, "X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneLight-x",
      min: "-128",
      max: "640",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneLight-y",
      min: "-128",
      max: "640",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Range"), /* @__PURE__ */ createElement("flex-box", {
      id: "sceneLight-range-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "sceneLight-range-slider",
      min: "1",
      max: "40",
      step: "1"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "sceneLight-range",
      min: "0",
      max: "128",
      decimals: "4"
    })), /* @__PURE__ */ createElement("text", null, "Intensity"), /* @__PURE__ */ createElement("flex-box", {
      id: "sceneLight-intensity-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "sceneLight-intensity-slider",
      min: "0",
      max: "1",
      step: "0.05"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "sceneLight-intensity",
      min: "0",
      max: "1",
      step: "0.05",
      decimals: "4"
    })), /* @__PURE__ */ createElement("text", null, "Mask"), /* @__PURE__ */ createElement("custom-box", {
      id: "sceneLight-mask",
      type: "file",
      filter: "image"
    }), /* @__PURE__ */ createElement("text", null, "Anchor X"), /* @__PURE__ */ createElement("flex-box", {
      id: "sceneLight-anchorX-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "sceneLight-anchorX-slider",
      min: "0",
      max: "1",
      step: "0.1"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "sceneLight-anchorX",
      min: "0",
      max: "1",
      step: "0.1",
      decimals: "4"
    })), /* @__PURE__ */ createElement("text", null, "Anchor Y"), /* @__PURE__ */ createElement("flex-box", {
      id: "sceneLight-anchorY-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "sceneLight-anchorY-slider",
      min: "0",
      max: "1",
      step: "0.1"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "sceneLight-anchorY",
      min: "0",
      max: "1",
      step: "0.1",
      decimals: "4"
    })), /* @__PURE__ */ createElement("text", null, "Width"), /* @__PURE__ */ createElement("flex-box", {
      id: "sceneLight-width-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "sceneLight-width-slider",
      min: "1",
      max: "40",
      step: "1"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "sceneLight-width",
      min: "0",
      max: "128",
      step: "1",
      decimals: "4"
    })), /* @__PURE__ */ createElement("text", null, "Height"), /* @__PURE__ */ createElement("flex-box", {
      id: "sceneLight-height-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "sceneLight-height-slider",
      min: "1",
      max: "40",
      step: "1"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "sceneLight-height",
      min: "0",
      max: "128",
      step: "1",
      decimals: "4"
    })), /* @__PURE__ */ createElement("text", null, "Angle"), /* @__PURE__ */ createElement("flex-box", {
      id: "sceneLight-angle-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "sceneLight-angle-slider",
      min: "0",
      max: "360",
      step: "5"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "sceneLight-angle",
      min: "-36000",
      max: "36000",
      step: "5",
      decimals: "4"
    })), /* @__PURE__ */ createElement("text", null, "Red"), /* @__PURE__ */ createElement("flex-box", {
      id: "sceneLight-red-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "sceneLight-red-slider",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "sceneLight-red",
      min: "0",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Green"), /* @__PURE__ */ createElement("flex-box", {
      id: "sceneLight-green-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "sceneLight-green-slider",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "sceneLight-green",
      min: "0",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Blue"), /* @__PURE__ */ createElement("flex-box", {
      id: "sceneLight-blue-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "sceneLight-blue-slider",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "sceneLight-blue",
      min: "0",
      max: "255",
      step: "5"
    })))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Conditions"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneLight-conditions",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Events"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneLight-events",
      class: "inspector-list",
      filter: "light",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scripts"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneLight-scripts",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "sceneLight-parameter-pane"
    })), /* @__PURE__ */ createElement("page-frame", {
      value: "sceneAnimation"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "sceneAnimation-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text-box", {
      id: "sceneAnimation-name"
    }), /* @__PURE__ */ createElement("text", null, "Animation"), /* @__PURE__ */ createElement("custom-box", {
      id: "sceneAnimation-animationId",
      type: "file",
      filter: "animation"
    }), /* @__PURE__ */ createElement("text", null, "Motion"), /* @__PURE__ */ createElement("select-box", {
      id: "sceneAnimation-motion"
    }), /* @__PURE__ */ createElement("text", null, "Mirror"), /* @__PURE__ */ createElement("select-box", {
      id: "sceneAnimation-mirror"
    }), /* @__PURE__ */ createElement("text", null, "X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneAnimation-x",
      min: "-128",
      max: "640",
      step: "0.1",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneAnimation-y",
      min: "-128",
      max: "640",
      step: "0.1",
      decimals: "4",
      unit: "tile"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Conditions"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneAnimation-conditions",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Events"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneAnimation-events",
      class: "inspector-list",
      filter: "animation",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scripts"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneAnimation-scripts",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "sceneAnimation-parameter-pane"
    })), /* @__PURE__ */ createElement("page-frame", {
      value: "sceneParticle"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "sceneParticle-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text-box", {
      id: "sceneParticle-name"
    }), /* @__PURE__ */ createElement("text", null, "Particle"), /* @__PURE__ */ createElement("custom-box", {
      id: "sceneParticle-particleId",
      type: "file",
      filter: "particle"
    }), /* @__PURE__ */ createElement("text", null, "X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParticle-x",
      min: "-128",
      max: "640",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParticle-y",
      min: "-128",
      max: "640",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Angle"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParticle-angle",
      min: "-360",
      max: "360",
      step: "45",
      decimals: "4",
      unit: "deg"
    }), /* @__PURE__ */ createElement("text", null, "Scale"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParticle-scale",
      min: "0.1",
      max: "10",
      step: "0.1",
      decimals: "2"
    }), /* @__PURE__ */ createElement("text", null, "Speed"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParticle-speed",
      min: "0.1",
      max: "10",
      step: "0.1",
      decimals: "2"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Conditions"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneParticle-conditions",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Events"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneParticle-events",
      class: "inspector-list",
      filter: "particle",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scripts"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneParticle-scripts",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "sceneParticle-parameter-pane"
    })), /* @__PURE__ */ createElement("page-frame", {
      value: "sceneParallax"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "sceneParallax-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text-box", {
      id: "sceneParallax-name"
    }), /* @__PURE__ */ createElement("text", null, "Image"), /* @__PURE__ */ createElement("custom-box", {
      id: "sceneParallax-image",
      type: "file",
      filter: "image"
    }), /* @__PURE__ */ createElement("text", null, "Layer"), /* @__PURE__ */ createElement("select-box", {
      id: "sceneParallax-layer"
    }), /* @__PURE__ */ createElement("text", null, "Order"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-order",
      min: "0",
      max: "100"
    }), /* @__PURE__ */ createElement("text", null, "Light Sampling"), /* @__PURE__ */ createElement("select-box", {
      id: "sceneParallax-light"
    }), /* @__PURE__ */ createElement("text", null, "Blend"), /* @__PURE__ */ createElement("select-box", {
      id: "sceneParallax-blend"
    }), /* @__PURE__ */ createElement("text", null, "Opacity"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-opacity",
      min: "0",
      max: "1",
      step: "0.05",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-x",
      min: "-128",
      max: "640",
      step: "0.1",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-y",
      min: "-128",
      max: "640",
      step: "0.1",
      decimals: "4",
      unit: "tile"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Parallax"), /* @__PURE__ */ createElement("detail-grid", {
      id: "sceneParallax-parallax-grid"
    }, /* @__PURE__ */ createElement("text", null, "Scale X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-scaleX",
      min: "0.2",
      max: "32",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Scale Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-scaleY",
      min: "0.2",
      max: "32",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Repeat X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-repeatX",
      min: "1",
      max: "100"
    }), /* @__PURE__ */ createElement("text", null, "Repeat Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-repeatY",
      min: "1",
      max: "100"
    }), /* @__PURE__ */ createElement("text", null, "Anchor X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-anchorX",
      min: "0",
      max: "1",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Anchor Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-anchorY",
      min: "0",
      max: "1",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Offset X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-offsetX",
      min: "-10000",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Offset Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-offsetY",
      min: "-10000",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Parallax Factor X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-parallaxFactorX",
      min: "-4",
      max: "4",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Parallax Factor Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-parallaxFactorY",
      min: "-4",
      max: "4",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Shift Speed X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-shiftSpeedX",
      min: "-10000",
      max: "10000",
      step: "5",
      decimals: "4",
      unit: "px/s"
    }), /* @__PURE__ */ createElement("text", null, "Shift Speed Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-shiftSpeedY",
      min: "-10000",
      max: "10000",
      step: "5",
      decimals: "4",
      unit: "px/s"
    }), /* @__PURE__ */ createElement("text", null, "Tint - Red"), /* @__PURE__ */ createElement("flex-box", {
      id: "sceneParallax-tint-0-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "sceneParallax-tint-0-slider",
      min: "-255",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-tint-0",
      min: "-255",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Tint - Green"), /* @__PURE__ */ createElement("flex-box", {
      id: "sceneParallax-tint-1-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "sceneParallax-tint-1-slider",
      min: "-255",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-tint-1",
      min: "-255",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Tint - Blue"), /* @__PURE__ */ createElement("flex-box", {
      id: "sceneParallax-tint-2-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "sceneParallax-tint-2-slider",
      min: "-255",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-tint-2",
      min: "-255",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Tint - Gray"), /* @__PURE__ */ createElement("flex-box", {
      id: "sceneParallax-tint-3-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "sceneParallax-tint-3-slider",
      min: "0",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "sceneParallax-tint-3",
      min: "0",
      max: "255",
      step: "5"
    })))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Conditions"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneParallax-conditions",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Events"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneParallax-events",
      class: "inspector-list",
      filter: "parallax",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scripts"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneParallax-scripts",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "sceneParallax-parameter-pane"
    })), /* @__PURE__ */ createElement("page-frame", {
      value: "sceneTilemap"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "sceneTilemap-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text-box", {
      id: "sceneTilemap-name"
    }), /* @__PURE__ */ createElement("text", null, "Layer"), /* @__PURE__ */ createElement("select-box", {
      id: "sceneTilemap-layer"
    }), /* @__PURE__ */ createElement("text", null, "Order"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneTilemap-order",
      min: "0",
      max: "100"
    }), /* @__PURE__ */ createElement("text", null, "Light Sampling"), /* @__PURE__ */ createElement("select-box", {
      id: "sceneTilemap-light"
    }), /* @__PURE__ */ createElement("text", null, "Blend"), /* @__PURE__ */ createElement("select-box", {
      id: "sceneTilemap-blend"
    }), /* @__PURE__ */ createElement("text", null, "X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneTilemap-x",
      min: "-128",
      max: "640",
      step: "0.1",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneTilemap-y",
      min: "-128",
      max: "640",
      step: "0.1",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Width"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneTilemap-width",
      min: "0",
      max: "512",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Height"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneTilemap-height",
      min: "0",
      max: "512",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Anchor X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneTilemap-anchorX",
      min: "0",
      max: "1",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Anchor Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneTilemap-anchorY",
      min: "0",
      max: "1",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Offset X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneTilemap-offsetX",
      min: "-10000",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Offset Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneTilemap-offsetY",
      min: "-10000",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Parallax Factor X"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneTilemap-parallaxFactorX",
      min: "-4",
      max: "4",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Parallax Factor Y"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneTilemap-parallaxFactorY",
      min: "-4",
      max: "4",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Opacity"), /* @__PURE__ */ createElement("number-box", {
      id: "sceneTilemap-opacity",
      min: "0",
      max: "1",
      step: "0.05",
      decimals: "4"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Conditions"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneTilemap-conditions",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Events"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneTilemap-events",
      class: "inspector-list",
      filter: "tilemap",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scripts"), /* @__PURE__ */ createElement("param-list", {
      id: "sceneTilemap-scripts",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "sceneTilemap-parameter-pane"
    })), /* @__PURE__ */ createElement("page-frame", {
      value: "uiImage"
    }, /* @__PURE__ */ createElement("detail-box", {
      id: "uiElement-general-group",
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "uiElement-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text-box", {
      id: "uiElement-name"
    }))), /* @__PURE__ */ createElement("detail-box", {
      id: "uiElement-transform-group",
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Transform"), /* @__PURE__ */ createElement("detail-grid", {
      id: "uiElement-transform-grid"
    }, /* @__PURE__ */ createElement("text", null, "Align"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiElement-transform-align-box"
    }, /* @__PURE__ */ createElement("button", {
      class: "uiElement-transform-align",
      value: "left"
    }, /* @__PURE__ */ createElement("text", null, "\uF036")), /* @__PURE__ */ createElement("button", {
      class: "uiElement-transform-align",
      value: "center"
    }, /* @__PURE__ */ createElement("text", null, "\uF037")), /* @__PURE__ */ createElement("button", {
      class: "uiElement-transform-align",
      value: "right"
    }, /* @__PURE__ */ createElement("text", null, "\uF038")), /* @__PURE__ */ createElement("button", {
      class: "uiElement-transform-align rotated",
      value: "top"
    }, /* @__PURE__ */ createElement("text", null, "\uF036")), /* @__PURE__ */ createElement("button", {
      class: "uiElement-transform-align rotated",
      value: "middle"
    }, /* @__PURE__ */ createElement("text", null, "\uF037")), /* @__PURE__ */ createElement("button", {
      class: "uiElement-transform-align rotated",
      value: "bottom"
    }, /* @__PURE__ */ createElement("text", null, "\uF038"))), /* @__PURE__ */ createElement("text", null, "Anchor"), /* @__PURE__ */ createElement("box", {
      id: "uiElement-transform-anchor-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-anchorX",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-anchorY",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    })), /* @__PURE__ */ createElement("text", null, "X"), /* @__PURE__ */ createElement("box", {
      id: "uiElement-transform-x-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-x",
      min: "-10000",
      max: "10000",
      decimals: "4",
      unit: "px"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-x2",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4",
      unit: "r"
    })), /* @__PURE__ */ createElement("text", null, "Y"), /* @__PURE__ */ createElement("box", {
      id: "uiElement-transform-y-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-y",
      min: "-10000",
      max: "10000",
      decimals: "4",
      unit: "px"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-y2",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4",
      unit: "r"
    })), /* @__PURE__ */ createElement("text", null, "Width"), /* @__PURE__ */ createElement("box", {
      id: "uiElement-transform-width-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-width",
      min: "-10000",
      max: "10000",
      decimals: "4",
      unit: "px"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-width2",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4",
      unit: "r"
    })), /* @__PURE__ */ createElement("text", null, "Height"), /* @__PURE__ */ createElement("box", {
      id: "uiElement-transform-height-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-height",
      min: "-10000",
      max: "10000",
      decimals: "4",
      unit: "px"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-height2",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4",
      unit: "r"
    })), /* @__PURE__ */ createElement("text", null, "Rotation"), /* @__PURE__ */ createElement("box", {
      id: "uiElement-transform-rotation-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-rotation",
      min: "-36000",
      max: "36000",
      decimals: "4",
      unit: "deg"
    })), /* @__PURE__ */ createElement("text", null, "Scale"), /* @__PURE__ */ createElement("box", {
      id: "uiElement-transform-scale-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-scaleX",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-scaleY",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    })), /* @__PURE__ */ createElement("text", null, "Skew"), /* @__PURE__ */ createElement("box", {
      id: "uiElement-transform-skew-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-skewX",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-skewY",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    })), /* @__PURE__ */ createElement("text", null, "Opacity"), /* @__PURE__ */ createElement("box", {
      id: "uiElement-transform-opacity-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "uiElement-transform-opacity",
      min: "0",
      max: "1",
      step: "0.05",
      decimals: "4"
    })))), /* @__PURE__ */ createElement("detail-box", {
      id: "uiElement-events-group",
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Events"), /* @__PURE__ */ createElement("param-list", {
      id: "uiElement-events",
      class: "inspector-list",
      filter: "element",
      flexible: true
    })), /* @__PURE__ */ createElement("detail-box", {
      id: "uiElement-scripts-group",
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scripts"), /* @__PURE__ */ createElement("param-list", {
      id: "uiElement-scripts",
      class: "inspector-list",
      flexible: true
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "uiElement-parameter-pane"
    }), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Image Properties"), /* @__PURE__ */ createElement("detail-grid", {
      id: "uiImage-properties-grid"
    }, /* @__PURE__ */ createElement("text", null, "Image"), /* @__PURE__ */ createElement("custom-box", {
      id: "uiImage-image",
      type: "file",
      filter: "image"
    }), /* @__PURE__ */ createElement("text", null, "Display"), /* @__PURE__ */ createElement("select-box", {
      id: "uiImage-display"
    }), /* @__PURE__ */ createElement("text", null, "Flip"), /* @__PURE__ */ createElement("select-box", {
      id: "uiImage-flip"
    }), /* @__PURE__ */ createElement("text", null, "Blend"), /* @__PURE__ */ createElement("select-box", {
      id: "uiImage-blend"
    }), /* @__PURE__ */ createElement("text", null, "Shift"), /* @__PURE__ */ createElement("box", {
      id: "uiImage-shift-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "uiImage-shiftX",
      min: "-10000",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiImage-shiftY",
      min: "-10000",
      max: "10000",
      unit: "px"
    })), /* @__PURE__ */ createElement("text", null, "Clip"), /* @__PURE__ */ createElement("custom-box", {
      id: "uiImage-clip",
      type: "clip",
      image: "uiImage-image"
    }), /* @__PURE__ */ createElement("text", null, "Border"), /* @__PURE__ */ createElement("number-box", {
      id: "uiImage-border",
      min: "1",
      max: "100",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Tint - Red"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiImage-tint-0-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "uiImage-tint-0-slider",
      min: "-255",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiImage-tint-0",
      min: "-255",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Tint - Green"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiImage-tint-1-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "uiImage-tint-1-slider",
      min: "-255",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiImage-tint-1",
      min: "-255",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Tint - Blue"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiImage-tint-2-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "uiImage-tint-2-slider",
      min: "-255",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiImage-tint-2",
      min: "-255",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Tint - Gray"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiImage-tint-3-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "uiImage-tint-3-slider",
      min: "0",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiImage-tint-3",
      min: "0",
      max: "255",
      step: "5"
    }))))), /* @__PURE__ */ createElement("page-frame", {
      value: "uiText"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Text Properties"), /* @__PURE__ */ createElement("detail-grid", {
      id: "uiText-properties-grid"
    }, /* @__PURE__ */ createElement("text", null, "Direction"), /* @__PURE__ */ createElement("select-box", {
      id: "uiText-direction"
    }), /* @__PURE__ */ createElement("text", null, "Alignment"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiText-alignment-box"
    }, /* @__PURE__ */ createElement("radio-box", {
      name: "uiText-horizontalAlign",
      class: "uiText-align",
      value: "left",
      tabindex: "0"
    }, /* @__PURE__ */ createElement("text", null, "\uF036")), /* @__PURE__ */ createElement("radio-box", {
      name: "uiText-horizontalAlign",
      class: "uiText-align",
      value: "center",
      tabindex: "0"
    }, /* @__PURE__ */ createElement("text", null, "\uF037")), /* @__PURE__ */ createElement("radio-box", {
      name: "uiText-horizontalAlign",
      class: "uiText-align",
      value: "right",
      tabindex: "0"
    }, /* @__PURE__ */ createElement("text", null, "\uF038")), /* @__PURE__ */ createElement("radio-box", {
      name: "uiText-verticalAlign",
      class: "uiText-align rotated",
      value: "top",
      tabindex: "0"
    }, /* @__PURE__ */ createElement("text", null, "\uF036")), /* @__PURE__ */ createElement("radio-box", {
      name: "uiText-verticalAlign",
      class: "uiText-align rotated",
      value: "middle",
      tabindex: "0"
    }, /* @__PURE__ */ createElement("text", null, "\uF037")), /* @__PURE__ */ createElement("radio-box", {
      name: "uiText-verticalAlign",
      class: "uiText-align rotated",
      value: "bottom",
      tabindex: "0"
    }, /* @__PURE__ */ createElement("text", null, "\uF038"))), /* @__PURE__ */ createElement("text", null, "Content"), /* @__PURE__ */ createElement("text-area", {
      id: "uiText-content"
    }), /* @__PURE__ */ createElement("text", null, "Size"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiText-size-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "uiText-size-slider",
      min: "12",
      max: "52",
      step: "2"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiText-size",
      min: "10",
      max: "400",
      step: "1",
      unit: "px"
    })), /* @__PURE__ */ createElement("text", null, "Line Spacing"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiText-lineSpacing-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "uiText-lineSpacing-slider",
      min: "0",
      max: "20",
      step: "1"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiText-lineSpacing",
      min: "-10",
      max: "100",
      step: "1",
      unit: "px"
    })), /* @__PURE__ */ createElement("text", null, "Letter Spacing"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiText-letterSpacing-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "uiText-letterSpacing-slider",
      min: "0",
      max: "20",
      step: "1"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiText-letterSpacing",
      min: "-10",
      max: "100",
      step: "1",
      unit: "px"
    })), /* @__PURE__ */ createElement("text", null, "Color"), /* @__PURE__ */ createElement("color-box", {
      id: "uiText-color"
    }), /* @__PURE__ */ createElement("text", null, "Font"), /* @__PURE__ */ createElement("text-box", {
      id: "uiText-font"
    }), /* @__PURE__ */ createElement("text", null, "Typeface"), /* @__PURE__ */ createElement("select-box", {
      id: "uiText-typeface"
    }), /* @__PURE__ */ createElement("text", null, "Effect"), /* @__PURE__ */ createElement("select-box", {
      id: "uiText-effect-type"
    }), /* @__PURE__ */ createElement("text", null, "Shadow X"), /* @__PURE__ */ createElement("number-box", {
      id: "uiText-effect-shadowOffsetX",
      min: "-9",
      max: "9",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Shadow Y"), /* @__PURE__ */ createElement("number-box", {
      id: "uiText-effect-shadowOffsetY",
      min: "-9",
      max: "9",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Stroke Width"), /* @__PURE__ */ createElement("number-box", {
      id: "uiText-effect-strokeWidth",
      min: "1",
      max: "20",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Effect Color"), /* @__PURE__ */ createElement("color-box", {
      id: "uiText-effect-color"
    }), /* @__PURE__ */ createElement("text", null, "Overflow"), /* @__PURE__ */ createElement("select-box", {
      id: "uiText-overflow"
    }), /* @__PURE__ */ createElement("text", null, "Blend"), /* @__PURE__ */ createElement("select-box", {
      id: "uiText-blend"
    })))), /* @__PURE__ */ createElement("page-frame", {
      value: "uiTextBox"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "TextBox Properties"), /* @__PURE__ */ createElement("detail-grid", {
      id: "uiTextBox-properties-grid"
    }, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "uiTextBox-type"
    }), /* @__PURE__ */ createElement("text", null, "Align"), /* @__PURE__ */ createElement("select-box", {
      id: "uiTextBox-align"
    }), /* @__PURE__ */ createElement("text", null, "Text"), /* @__PURE__ */ createElement("text-box", {
      id: "uiTextBox-text"
    }), /* @__PURE__ */ createElement("text", null, "Max Length"), /* @__PURE__ */ createElement("number-box", {
      id: "uiTextBox-maxLength",
      min: "1",
      max: "100"
    }), /* @__PURE__ */ createElement("text", null, "Number"), /* @__PURE__ */ createElement("number-box", {
      id: "uiTextBox-number"
    }), /* @__PURE__ */ createElement("text", null, "Min"), /* @__PURE__ */ createElement("number-box", {
      id: "uiTextBox-min",
      min: "-1000000000",
      max: "1000000000",
      decimals: "10"
    }), /* @__PURE__ */ createElement("text", null, "Max"), /* @__PURE__ */ createElement("number-box", {
      id: "uiTextBox-max",
      min: "-1000000000",
      max: "1000000000",
      decimals: "10"
    }), /* @__PURE__ */ createElement("text", null, "Decimal Places"), /* @__PURE__ */ createElement("number-box", {
      id: "uiTextBox-decimals",
      min: "0",
      max: "10"
    }), /* @__PURE__ */ createElement("text", null, "Padding"), /* @__PURE__ */ createElement("number-box", {
      id: "uiTextBox-padding",
      min: "0",
      max: "100",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Size"), /* @__PURE__ */ createElement("number-box", {
      id: "uiTextBox-size",
      min: "10",
      max: "400",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Font"), /* @__PURE__ */ createElement("text-box", {
      id: "uiTextBox-font"
    }), /* @__PURE__ */ createElement("text", null, "Text Color"), /* @__PURE__ */ createElement("color-box", {
      id: "uiTextBox-color"
    }), /* @__PURE__ */ createElement("text", null, "Selection Color"), /* @__PURE__ */ createElement("color-box", {
      id: "uiTextBox-selectionColor"
    }), /* @__PURE__ */ createElement("text", null, "Selection Bg Color"), /* @__PURE__ */ createElement("color-box", {
      id: "uiTextBox-selectionBgColor"
    })))), /* @__PURE__ */ createElement("page-frame", {
      value: "uiDialogBox"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "DialogBox Properties"), /* @__PURE__ */ createElement("detail-grid", {
      id: "uiDialogBox-properties-grid"
    }, /* @__PURE__ */ createElement("text", null, "Content"), /* @__PURE__ */ createElement("text-area", {
      id: "uiDialogBox-content"
    }), /* @__PURE__ */ createElement("text", null, "Print Interval"), /* @__PURE__ */ createElement("number-box", {
      id: "uiDialogBox-interval",
      min: "0",
      max: "100",
      decimals: "4",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Size"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiDialogBox-size-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "uiDialogBox-size-slider",
      min: "12",
      max: "52",
      step: "2"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiDialogBox-size",
      min: "10",
      max: "400",
      step: "1",
      unit: "px"
    })), /* @__PURE__ */ createElement("text", null, "Line Spacing"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiDialogBox-lineSpacing-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "uiDialogBox-lineSpacing-slider",
      min: "0",
      max: "20",
      step: "1"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiDialogBox-lineSpacing",
      min: "-10",
      max: "100",
      step: "1",
      unit: "px"
    })), /* @__PURE__ */ createElement("text", null, "Letter Spacing"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiDialogBox-letterSpacing-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "uiDialogBox-letterSpacing-slider",
      min: "0",
      max: "20",
      step: "1"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiDialogBox-letterSpacing",
      min: "-10",
      max: "100",
      step: "1",
      unit: "px"
    })), /* @__PURE__ */ createElement("text", null, "Color"), /* @__PURE__ */ createElement("color-box", {
      id: "uiDialogBox-color"
    }), /* @__PURE__ */ createElement("text", null, "Font"), /* @__PURE__ */ createElement("text-box", {
      id: "uiDialogBox-font"
    }), /* @__PURE__ */ createElement("text", null, "Typeface"), /* @__PURE__ */ createElement("select-box", {
      id: "uiDialogBox-typeface"
    }), /* @__PURE__ */ createElement("text", null, "Effect"), /* @__PURE__ */ createElement("select-box", {
      id: "uiDialogBox-effect-type"
    }), /* @__PURE__ */ createElement("text", null, "Shadow X"), /* @__PURE__ */ createElement("number-box", {
      id: "uiDialogBox-effect-shadowOffsetX",
      min: "-9",
      max: "9",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Shadow Y"), /* @__PURE__ */ createElement("number-box", {
      id: "uiDialogBox-effect-shadowOffsetY",
      min: "-9",
      max: "9",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Stroke Width"), /* @__PURE__ */ createElement("number-box", {
      id: "uiDialogBox-effect-strokeWidth",
      min: "1",
      max: "20",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Effect Color"), /* @__PURE__ */ createElement("color-box", {
      id: "uiDialogBox-effect-color"
    }), /* @__PURE__ */ createElement("text", null, "Blend"), /* @__PURE__ */ createElement("select-box", {
      id: "uiDialogBox-blend"
    })))), /* @__PURE__ */ createElement("page-frame", {
      value: "uiProgressBar"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "ProgressBar Properties"), /* @__PURE__ */ createElement("detail-grid", {
      id: "uiProgressBar-properties-grid"
    }, /* @__PURE__ */ createElement("text", null, "Image"), /* @__PURE__ */ createElement("custom-box", {
      id: "uiProgressBar-image",
      type: "file",
      filter: "image"
    }), /* @__PURE__ */ createElement("text", null, "Display"), /* @__PURE__ */ createElement("select-box", {
      id: "uiProgressBar-display"
    }), /* @__PURE__ */ createElement("text", null, "Clip"), /* @__PURE__ */ createElement("custom-box", {
      id: "uiProgressBar-clip",
      type: "clip",
      image: "uiProgressBar-image"
    }), /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "uiProgressBar-type"
    }), /* @__PURE__ */ createElement("text", null, "Center X"), /* @__PURE__ */ createElement("number-box", {
      id: "uiProgressBar-centerX",
      min: "0",
      max: "1",
      step: "0.05",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Center Y"), /* @__PURE__ */ createElement("number-box", {
      id: "uiProgressBar-centerY",
      min: "0",
      max: "1",
      step: "0.05",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Start Angle"), /* @__PURE__ */ createElement("number-box", {
      id: "uiProgressBar-startAngle",
      min: "-360",
      max: "360",
      step: "5",
      decimals: "4",
      unit: "deg"
    }), /* @__PURE__ */ createElement("text", null, "Central Angle"), /* @__PURE__ */ createElement("number-box", {
      id: "uiProgressBar-centralAngle",
      min: "-360",
      max: "360",
      step: "5",
      decimals: "4",
      unit: "deg"
    }), /* @__PURE__ */ createElement("text", null, "Step"), /* @__PURE__ */ createElement("number-box", {
      id: "uiProgressBar-step",
      min: "0",
      max: "100"
    }), /* @__PURE__ */ createElement("text", null, "Progress"), /* @__PURE__ */ createElement("number-box", {
      id: "uiProgressBar-progress",
      min: "0",
      max: "1",
      step: "0.01",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Blend"), /* @__PURE__ */ createElement("select-box", {
      id: "uiProgressBar-blend"
    }), /* @__PURE__ */ createElement("text", null, "Color Mode"), /* @__PURE__ */ createElement("select-box", {
      id: "uiProgressBar-colorMode"
    }), /* @__PURE__ */ createElement("text", null, "Red"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiProgressBar-color-0-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "uiProgressBar-color-0-slider",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiProgressBar-color-0",
      min: "0",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Green"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiProgressBar-color-1-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "uiProgressBar-color-1-slider",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiProgressBar-color-1",
      min: "0",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Blue"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiProgressBar-color-2-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "uiProgressBar-color-2-slider",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiProgressBar-color-2",
      min: "0",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Alpha"), /* @__PURE__ */ createElement("flex-box", {
      id: "uiProgressBar-color-3-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "uiProgressBar-color-3-slider",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "uiProgressBar-color-3",
      min: "0",
      max: "255",
      step: "5"
    }))))), /* @__PURE__ */ createElement("page-frame", {
      value: "uiVideo"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Video Properties"), /* @__PURE__ */ createElement("detail-grid", {
      id: "uiVideo-properties-grid"
    }, /* @__PURE__ */ createElement("text", null, "Video"), /* @__PURE__ */ createElement("custom-box", {
      id: "uiVideo-video",
      type: "file",
      filter: "video"
    }), /* @__PURE__ */ createElement("text", null, "Loop"), /* @__PURE__ */ createElement("select-box", {
      id: "uiVideo-loop"
    }), /* @__PURE__ */ createElement("text", null, "Flip"), /* @__PURE__ */ createElement("select-box", {
      id: "uiVideo-flip"
    }), /* @__PURE__ */ createElement("text", null, "Blend"), /* @__PURE__ */ createElement("select-box", {
      id: "uiVideo-blend"
    })))), /* @__PURE__ */ createElement("page-frame", {
      value: "uiWindow"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Window Properties"), /* @__PURE__ */ createElement("detail-grid", {
      id: "uiWindow-properties-grid"
    }, /* @__PURE__ */ createElement("text", null, "Layout"), /* @__PURE__ */ createElement("select-box", {
      id: "uiWindow-layout"
    }), /* @__PURE__ */ createElement("text", null, "Scroll X"), /* @__PURE__ */ createElement("number-box", {
      id: "uiWindow-scrollX",
      min: "0",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Scroll Y"), /* @__PURE__ */ createElement("number-box", {
      id: "uiWindow-scrollY",
      min: "0",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Grid Width"), /* @__PURE__ */ createElement("number-box", {
      id: "uiWindow-gridWidth",
      min: "0",
      max: "1000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Grid Height"), /* @__PURE__ */ createElement("number-box", {
      id: "uiWindow-gridHeight",
      min: "0",
      max: "1000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Grid Gap X"), /* @__PURE__ */ createElement("number-box", {
      id: "uiWindow-gridGapX",
      min: "0",
      max: "1000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Grid Gap Y"), /* @__PURE__ */ createElement("number-box", {
      id: "uiWindow-gridGapY",
      min: "0",
      max: "1000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Padding X"), /* @__PURE__ */ createElement("number-box", {
      id: "uiWindow-paddingX",
      min: "0",
      max: "1000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Padding Y"), /* @__PURE__ */ createElement("number-box", {
      id: "uiWindow-paddingY",
      min: "0",
      max: "1000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Overflow"), /* @__PURE__ */ createElement("select-box", {
      id: "uiWindow-overflow"
    })))), /* @__PURE__ */ createElement("page-frame", {
      value: "uiContainer"
    }), /* @__PURE__ */ createElement("page-frame", {
      value: "animMotion"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Motion"), /* @__PURE__ */ createElement("detail-grid", {
      id: "animMotion-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Loop"), /* @__PURE__ */ createElement("check-box", {
      id: "animMotion-loop",
      class: "standard large"
    }), /* @__PURE__ */ createElement("text", null, "Loop Start"), /* @__PURE__ */ createElement("number-box", {
      id: "animMotion-loopStart",
      min: "0",
      max: "10000"
    })))), /* @__PURE__ */ createElement("page-frame", {
      id: "animJointFrame",
      value: "animJointFrame"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Frame"), /* @__PURE__ */ createElement("detail-grid", {
      id: "animJointFrame-properties-grid"
    }, /* @__PURE__ */ createElement("text", null, "Position"), /* @__PURE__ */ createElement("box", {
      id: "animJointFrame-position-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "animJointFrame-x",
      min: "-10000",
      max: "10000",
      decimals: "4",
      unit: "px"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "animJointFrame-y",
      min: "-10000",
      max: "10000",
      decimals: "4",
      unit: "px"
    })), /* @__PURE__ */ createElement("text", null, "Rotation"), /* @__PURE__ */ createElement("box", {
      id: "animJointFrame-rotation-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "animJointFrame-rotation",
      min: "-36000",
      max: "36000",
      decimals: "4",
      unit: "deg"
    })), /* @__PURE__ */ createElement("text", null, "Scale"), /* @__PURE__ */ createElement("box", {
      id: "animJointFrame-scale-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "animJointFrame-scaleX",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "animJointFrame-scaleY",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    })), /* @__PURE__ */ createElement("text", null, "Opacity"), /* @__PURE__ */ createElement("box", {
      id: "animJointFrame-opacity-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "animJointFrame-opacity",
      min: "0",
      max: "1",
      step: "0.05",
      decimals: "4"
    }))))), /* @__PURE__ */ createElement("page-frame", {
      value: "animSpriteLayer"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Sprite Layer"), /* @__PURE__ */ createElement("detail-grid", {
      id: "animSpriteLayer-properties-grid"
    }, /* @__PURE__ */ createElement("text", null, "Sprite"), /* @__PURE__ */ createElement("select-box", {
      id: "animSpriteLayer-sprite"
    }), /* @__PURE__ */ createElement("text", null, "Blend"), /* @__PURE__ */ createElement("select-box", {
      id: "animSpriteLayer-blend"
    }), /* @__PURE__ */ createElement("text", null, "Light Sampling"), /* @__PURE__ */ createElement("select-box", {
      id: "animSpriteLayer-light"
    })))), /* @__PURE__ */ createElement("page-frame", {
      id: "animSpriteFrame",
      value: "animSpriteFrame"
    }, /* @__PURE__ */ createElement("detail-box", {
      id: "animSpriteFrame-properties-detail",
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Frame"), /* @__PURE__ */ createElement("detail-grid", {
      id: "animSpriteFrame-properties-grid"
    }, /* @__PURE__ */ createElement("text", null, "Position"), /* @__PURE__ */ createElement("box", {
      id: "animSpriteFrame-position-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "animSpriteFrame-x",
      min: "-10000",
      max: "10000",
      decimals: "4",
      unit: "px"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "animSpriteFrame-y",
      min: "-10000",
      max: "10000",
      decimals: "4",
      unit: "px"
    })), /* @__PURE__ */ createElement("text", null, "Rotation"), /* @__PURE__ */ createElement("box", {
      id: "animSpriteFrame-rotation-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "animSpriteFrame-rotation",
      min: "-36000",
      max: "36000",
      decimals: "4",
      unit: "deg"
    })), /* @__PURE__ */ createElement("text", null, "Scale"), /* @__PURE__ */ createElement("box", {
      id: "animSpriteFrame-scale-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "animSpriteFrame-scaleX",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "animSpriteFrame-scaleY",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    })), /* @__PURE__ */ createElement("text", null, "Opacity"), /* @__PURE__ */ createElement("box", {
      id: "animSpriteFrame-opacity-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "animSpriteFrame-opacity",
      min: "0",
      max: "1",
      step: "0.05",
      decimals: "4"
    })), /* @__PURE__ */ createElement("text", null, "Tint - Red"), /* @__PURE__ */ createElement("flex-box", {
      id: "animSpriteFrame-tint-0-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "animSpriteFrame-tint-0-slider",
      min: "-255",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "animSpriteFrame-tint-0",
      min: "-255",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Tint - Green"), /* @__PURE__ */ createElement("flex-box", {
      id: "animSpriteFrame-tint-1-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "animSpriteFrame-tint-1-slider",
      min: "-255",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "animSpriteFrame-tint-1",
      min: "-255",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Tint - Blue"), /* @__PURE__ */ createElement("flex-box", {
      id: "animSpriteFrame-tint-2-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "animSpriteFrame-tint-2-slider",
      min: "-255",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "animSpriteFrame-tint-2",
      min: "-255",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Tint - Gray"), /* @__PURE__ */ createElement("flex-box", {
      id: "animSpriteFrame-tint-3-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "animSpriteFrame-tint-3-slider",
      min: "0",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "animSpriteFrame-tint-3",
      min: "0",
      max: "255",
      step: "5"
    })))), /* @__PURE__ */ createElement("detail-box", {
      id: "animSpriteFrame-sprite-detail",
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", {
      id: "animSpriteFrame-sprite-summary"
    }, /* @__PURE__ */ createElement("text", {
      id: "sprite-label"
    }, "Sprite"), /* @__PURE__ */ createElement("box", {
      id: "sprite-info"
    }), /* @__PURE__ */ createElement("slider-box", {
      id: "sprite-zoom",
      name: "zoom",
      min: "0",
      max: "4"
    })), /* @__PURE__ */ createElement("box", {
      id: "sprite-body"
    }, /* @__PURE__ */ createElement("box", {
      id: "sprite-frame"
    }, /* @__PURE__ */ createElement("canvas", {
      id: "sprite-canvas",
      width: "0",
      height: "0"
    }), /* @__PURE__ */ createElement("box", {
      id: "sprite-screen",
      tabindex: "-1"
    }, /* @__PURE__ */ createElement("marquee-area", {
      id: "sprite-marquee"
    })))))), /* @__PURE__ */ createElement("page-frame", {
      value: "animParticleLayer"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Particle Layer"), /* @__PURE__ */ createElement("detail-grid", {
      id: "animParticleLayer-properties-grid"
    }, /* @__PURE__ */ createElement("text", null, "Particle"), /* @__PURE__ */ createElement("custom-box", {
      id: "animParticleLayer-particleId",
      type: "file",
      filter: "particle"
    }), /* @__PURE__ */ createElement("text", null, "Emitter Angle"), /* @__PURE__ */ createElement("select-box", {
      id: "animParticleLayer-angle"
    })))), /* @__PURE__ */ createElement("page-frame", {
      id: "animParticleFrame",
      value: "animParticleFrame"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Frame"), /* @__PURE__ */ createElement("detail-grid", {
      id: "animParticleFrame-properties-grid"
    }, /* @__PURE__ */ createElement("text", null, "Position"), /* @__PURE__ */ createElement("box", {
      id: "animParticleFrame-position-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "animParticleFrame-x",
      min: "-10000",
      max: "10000",
      decimals: "4",
      unit: "px"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "animParticleFrame-y",
      min: "-10000",
      max: "10000",
      decimals: "4",
      unit: "px"
    })), /* @__PURE__ */ createElement("text", null, "Rotation"), /* @__PURE__ */ createElement("box", {
      id: "animParticleFrame-rotation-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "animParticleFrame-rotation",
      min: "-36000",
      max: "36000",
      decimals: "4",
      unit: "deg"
    })), /* @__PURE__ */ createElement("text", null, "Scale"), /* @__PURE__ */ createElement("box", {
      id: "animParticleFrame-scale-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "animParticleFrame-scaleX",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "animParticleFrame-scaleY",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    })), /* @__PURE__ */ createElement("text", null, "Opacity"), /* @__PURE__ */ createElement("box", {
      id: "animParticleFrame-opacity-box",
      class: "uiElement-grid-box with-2-columns"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "animParticleFrame-opacity",
      min: "0",
      max: "1",
      step: "0.05",
      decimals: "4"
    })), /* @__PURE__ */ createElement("text", null, "Particle Scale"), /* @__PURE__ */ createElement("number-box", {
      id: "animParticleFrame-scale",
      min: "0.1",
      max: "10",
      step: "0.1",
      decimals: "2"
    }), /* @__PURE__ */ createElement("text", null, "Speed"), /* @__PURE__ */ createElement("number-box", {
      id: "animParticleFrame-speed",
      min: "0.1",
      max: "10",
      step: "0.1",
      decimals: "2"
    })))), /* @__PURE__ */ createElement("page-frame", {
      value: "particleLayer"
    }, /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "General"), /* @__PURE__ */ createElement("detail-grid", {
      id: "particleLayer-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text-box", {
      id: "particleLayer-name"
    }), /* @__PURE__ */ createElement("text", null, "Emission Area"), /* @__PURE__ */ createElement("select-box", {
      id: "particleLayer-area-type"
    }), /* @__PURE__ */ createElement("text", null, "Width"), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-area-width",
      min: "0",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Height"), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-area-height",
      min: "0",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Radius"), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-area-radius",
      min: "0",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Max Quantity"), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-maximum",
      min: "0",
      max: "1000"
    }), /* @__PURE__ */ createElement("text", null, "Emission Count"), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-count",
      min: "0",
      max: "1000000000"
    }), /* @__PURE__ */ createElement("text", null, "Initial Delay"), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-delay",
      min: "0",
      max: "1000000000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Interval"), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-interval",
      min: "0",
      max: "1000000000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Lifetime"), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-lifetime",
      min: "0",
      max: "1000000000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Lifetime Dev"), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-lifetimeDev",
      min: "0",
      max: "1000000000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Fadeout"), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-fadeout",
      min: "0",
      max: "1000000000",
      unit: "ms"
    }))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Anchor"), /* @__PURE__ */ createElement("detail-grid", {
      id: "particleLayer-anchor-grid"
    }, /* @__PURE__ */ createElement("text", null, "Anchor X"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-anchor-x-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-anchor-x-0",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "min")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-anchor-x-1",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "max"))), /* @__PURE__ */ createElement("text", null, "Anchor Y"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-anchor-y-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-anchor-y-0",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "min")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-anchor-y-1",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "max"))))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Movement"), /* @__PURE__ */ createElement("detail-grid", {
      id: "particleLayer-movement-grid"
    }, /* @__PURE__ */ createElement("text", null, "Movement Angle"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-movement-angle-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-movement-angle-0",
      min: "-36000",
      max: "36000",
      step: "15",
      decimals: "4",
      unit: "deg"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "min")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-movement-angle-1",
      min: "-36000",
      max: "36000",
      step: "15",
      decimals: "4",
      unit: "deg"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "max"))), /* @__PURE__ */ createElement("text", null, "Movement Speed"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-movement-speed-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-movement-speed-0",
      min: "-10000",
      max: "10000",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "min")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-movement-speed-1",
      min: "-10000",
      max: "10000",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "max"))), /* @__PURE__ */ createElement("text", null, "Accel Angle"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-movement-accelAngle-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-movement-accelAngle-0",
      min: "-36000",
      max: "36000",
      step: "15",
      decimals: "4",
      unit: "deg"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "min")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-movement-accelAngle-1",
      min: "-36000",
      max: "36000",
      step: "15",
      decimals: "4",
      unit: "deg"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "max"))), /* @__PURE__ */ createElement("text", null, "Accel"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-movement-accel-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-movement-accel-0",
      min: "-10000",
      max: "10000",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "min")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-movement-accel-1",
      min: "-10000",
      max: "10000",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "max"))))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Rotation"), /* @__PURE__ */ createElement("detail-grid", {
      id: "particleLayer-rotation-grid"
    }, /* @__PURE__ */ createElement("text", null, "Rotation Angle"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-rotation-angle-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-rotation-angle-0",
      min: "-36000",
      max: "36000",
      step: "15",
      decimals: "4",
      unit: "deg"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "min")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-rotation-angle-1",
      min: "-36000",
      max: "36000",
      step: "15",
      decimals: "4",
      unit: "deg"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "max"))), /* @__PURE__ */ createElement("text", null, "Angular Velocity"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-rotation-speed-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-rotation-speed-0",
      min: "-36000",
      max: "36000",
      step: "15",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "min")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-rotation-speed-1",
      min: "-36000",
      max: "36000",
      step: "15",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "max"))), /* @__PURE__ */ createElement("text", null, "Angular Accel"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-rotation-accel-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-rotation-accel-0",
      min: "-36000",
      max: "36000",
      step: "15",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "min")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-rotation-accel-1",
      min: "-36000",
      max: "36000",
      step: "15",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "max"))))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Scale"), /* @__PURE__ */ createElement("detail-grid", {
      id: "particleLayer-scale-grid"
    }, /* @__PURE__ */ createElement("text", null, "Scale Factor"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-scale-factor-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-scale-factor-0",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "min")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-scale-factor-1",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "max"))), /* @__PURE__ */ createElement("text", null, "Expansion Speed"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-scale-speed-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-scale-speed-0",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "min")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-scale-speed-1",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "max"))), /* @__PURE__ */ createElement("text", null, "Expansion Accel"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-scale-accel-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-scale-accel-0",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "min")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-scale-accel-1",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "max"))))), /* @__PURE__ */ createElement("detail-box", {
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Rendering"), /* @__PURE__ */ createElement("detail-grid", {
      id: "particleLayer-rendering-grid"
    }, /* @__PURE__ */ createElement("text", null, "Image"), /* @__PURE__ */ createElement("custom-box", {
      id: "particleLayer-image",
      type: "file",
      filter: "image"
    }), /* @__PURE__ */ createElement("text", null, "Blend"), /* @__PURE__ */ createElement("select-box", {
      id: "particleLayer-blend"
    }), /* @__PURE__ */ createElement("text", null, "Sort"), /* @__PURE__ */ createElement("select-box", {
      id: "particleLayer-sort"
    }), /* @__PURE__ */ createElement("text", null, "Horiz Frames"), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-hframes",
      min: "1",
      max: "100"
    }), /* @__PURE__ */ createElement("text", null, "Vert Frames"), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-vframes",
      min: "1",
      max: "100"
    }), /* @__PURE__ */ createElement("text", null, "Color Mode"), /* @__PURE__ */ createElement("select-box", {
      id: "particleLayer-color-mode"
    }), /* @__PURE__ */ createElement("text", null, "Color"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-color-rgba-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-rgba-0",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label red"
    }, "R")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-rgba-1",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label green"
    }, "G")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-rgba-2",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label blue"
    }, "B")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-rgba-3",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "A"))), /* @__PURE__ */ createElement("text", null, "Color Min"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-color-min-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-min-0",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label red"
    }, "R")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-min-1",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label green"
    }, "G")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-min-2",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label blue"
    }, "B")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-min-3",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "A"))), /* @__PURE__ */ createElement("text", null, "Color Max"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-color-max-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-max-0",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label red"
    }, "R")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-max-1",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label green"
    }, "G")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-max-2",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label blue"
    }, "B")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-max-3",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "A"))), /* @__PURE__ */ createElement("text", null, "Color Easing"), /* @__PURE__ */ createElement("select-box", {
      id: "particleLayer-color-easingId"
    }), /* @__PURE__ */ createElement("text", null, "Color Start Min"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-color-startMin-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-startMin-0",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label red"
    }, "R")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-startMin-1",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label green"
    }, "G")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-startMin-2",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label blue"
    }, "B")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-startMin-3",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "A"))), /* @__PURE__ */ createElement("text", null, "Color Start Max"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-color-startMax-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-startMax-0",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label red"
    }, "R")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-startMax-1",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label green"
    }, "G")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-startMax-2",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label blue"
    }, "B")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-startMax-3",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "A"))), /* @__PURE__ */ createElement("text", null, "Color End Min"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-color-endMin-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-endMin-0",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label red"
    }, "R")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-endMin-1",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label green"
    }, "G")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-endMin-2",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label blue"
    }, "B")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-endMin-3",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "A"))), /* @__PURE__ */ createElement("text", null, "Color End Max"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-color-endMax-box"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-endMax-0",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label red"
    }, "R")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-endMax-1",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label green"
    }, "G")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-endMax-2",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label blue"
    }, "B")), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-endMax-3",
      min: "0",
      max: "255",
      step: "5"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "A"))), /* @__PURE__ */ createElement("text", null, "Tint - Red"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-color-tint-0-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "particleLayer-color-tint-0-slider",
      min: "-255",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-tint-0",
      min: "-255",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Tint - Green"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-color-tint-1-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "particleLayer-color-tint-1-slider",
      min: "-255",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-tint-1",
      min: "-255",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Tint - Blue"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-color-tint-2-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "particleLayer-color-tint-2-slider",
      min: "-255",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-tint-2",
      min: "-255",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("text", null, "Tint - Gray"), /* @__PURE__ */ createElement("flex-box", {
      id: "particleLayer-color-tint-3-box"
    }, /* @__PURE__ */ createElement("slider-box", {
      id: "particleLayer-color-tint-3-slider",
      min: "0",
      max: "255",
      step: "15"
    }), /* @__PURE__ */ createElement("number-box", {
      id: "particleLayer-color-tint-3",
      min: "0",
      max: "255",
      step: "5"
    }))))))))), /* @__PURE__ */ createElement("window-frame", {
      id: "autoTile"
    }, /* @__PURE__ */ createElement("title-bar", null, "Auto Tile", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("field-set", {
      id: "autoTile-general-fieldset"
    }, /* @__PURE__ */ createElement("legend", null, "General"), /* @__PURE__ */ createElement("grid-box", {
      id: "autoTile-general-grid"
    }, /* @__PURE__ */ createElement("text", null, "Image"), /* @__PURE__ */ createElement("custom-box", {
      id: "autoTile-image",
      type: "file",
      filter: "image"
    }), /* @__PURE__ */ createElement("text", null, "Offset X"), /* @__PURE__ */ createElement("number-box", {
      id: "autoTile-x",
      min: "0",
      max: "255"
    }), /* @__PURE__ */ createElement("text", null, "Offset Y"), /* @__PURE__ */ createElement("number-box", {
      id: "autoTile-y",
      min: "0",
      max: "255"
    }))), /* @__PURE__ */ createElement("field-set", {
      id: "autoTile-templates-fieldset",
      class: "input pad"
    }, /* @__PURE__ */ createElement("legend", null, "Templates"), /* @__PURE__ */ createElement("node-list", {
      id: "autoTile-templates",
      padded: true
    })), /* @__PURE__ */ createElement("field-set", {
      id: "autoTile-nodes-fieldset",
      class: "input pad"
    }, /* @__PURE__ */ createElement("legend", null, "Tiles"), /* @__PURE__ */ createElement("common-list", {
      id: "autoTile-nodes"
    })), /* @__PURE__ */ createElement("field-set", {
      id: "autoTile-canvas-fieldset"
    }, /* @__PURE__ */ createElement("legend", null, "View"), /* @__PURE__ */ createElement("canvas", {
      id: "autoTile-canvas",
      width: "128",
      height: "128"
    })), /* @__PURE__ */ createElement("field-set", {
      id: "autoTile-rule-fieldset"
    }, /* @__PURE__ */ createElement("legend", null, "Neighbors"), /* @__PURE__ */ createElement("grid-box", {
      id: "autoTile-rule-grid"
    }, /* @__PURE__ */ createElement("switch-item", {
      id: "autoTile-rule-1",
      class: "autoTile-switch autoTile-neighbor",
      length: "3"
    }), /* @__PURE__ */ createElement("switch-item", {
      id: "autoTile-rule-2",
      class: "autoTile-switch autoTile-neighbor",
      length: "3"
    }), /* @__PURE__ */ createElement("switch-item", {
      id: "autoTile-rule-3",
      class: "autoTile-switch autoTile-neighbor",
      length: "3"
    }), /* @__PURE__ */ createElement("switch-item", {
      id: "autoTile-rule-0",
      class: "autoTile-switch autoTile-neighbor",
      length: "3"
    }), /* @__PURE__ */ createElement("empty", null), /* @__PURE__ */ createElement("switch-item", {
      id: "autoTile-rule-4",
      class: "autoTile-switch autoTile-neighbor",
      length: "3"
    }), /* @__PURE__ */ createElement("switch-item", {
      id: "autoTile-rule-7",
      class: "autoTile-switch autoTile-neighbor",
      length: "3"
    }), /* @__PURE__ */ createElement("switch-item", {
      id: "autoTile-rule-6",
      class: "autoTile-switch autoTile-neighbor",
      length: "3"
    }), /* @__PURE__ */ createElement("switch-item", {
      id: "autoTile-rule-5",
      class: "autoTile-switch autoTile-neighbor",
      length: "3"
    }))), /* @__PURE__ */ createElement("field-set", {
      id: "autoTile-frames-fieldset",
      class: "input pad"
    }, /* @__PURE__ */ createElement("legend", null, "Frames"), /* @__PURE__ */ createElement("common-list", {
      id: "autoTile-frames"
    })), /* @__PURE__ */ createElement("button", {
      id: "autoTile-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "autoTile-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "autoTile-generateFrames"
    }, /* @__PURE__ */ createElement("title-bar", null, "Generate Frames", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Stride X"), /* @__PURE__ */ createElement("number-box", {
      id: "autoTile-generateFrames-strideX",
      min: "-128",
      max: "128"
    }), /* @__PURE__ */ createElement("text", null, "Stride Y"), /* @__PURE__ */ createElement("number-box", {
      id: "autoTile-generateFrames-strideY",
      min: "-128",
      max: "128"
    }), /* @__PURE__ */ createElement("text", null, "Count"), /* @__PURE__ */ createElement("number-box", {
      id: "autoTile-generateFrames-count",
      min: "1",
      max: "255"
    })), /* @__PURE__ */ createElement("button", {
      id: "autoTile-generateFrames-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "autoTile-generateFrames-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "autoTile-frameIndex"
    }, /* @__PURE__ */ createElement("title-bar", null, "Tile Index", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("box", {
      id: "autoTile-frameIndex-screen"
    }, /* @__PURE__ */ createElement("box", {
      id: "autoTile-frameIndex-image-clip"
    }, /* @__PURE__ */ createElement("img", {
      id: "autoTile-frameIndex-image"
    }), /* @__PURE__ */ createElement("box", {
      id: "autoTile-frameIndex-mask"
    })), /* @__PURE__ */ createElement("marquee-area", {
      id: "autoTile-frameIndex-marquee"
    }), /* @__PURE__ */ createElement("text", {
      id: "autoTile-frameIndex-info"
    })))), /* @__PURE__ */ createElement("window-frame", {
      id: "autoTile-selectNode"
    }, /* @__PURE__ */ createElement("title-bar", null, "Tile Node", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("canvas", {
      id: "autoTile-selectNode-canvas",
      width: "0",
      height: "0"
    }), /* @__PURE__ */ createElement("box", {
      id: "autoTile-selectNode-screen"
    }, /* @__PURE__ */ createElement("marquee-area", {
      id: "autoTile-selectNode-marquee"
    })))), /* @__PURE__ */ createElement("window-frame", {
      id: "scene-shift"
    }, /* @__PURE__ */ createElement("title-bar", null, "Shift", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Shift X"), /* @__PURE__ */ createElement("number-box", {
      id: "scene-shift-x",
      min: "-512",
      max: "512"
    }), /* @__PURE__ */ createElement("text", null, "Shift Y"), /* @__PURE__ */ createElement("number-box", {
      id: "scene-shift-y",
      min: "-512",
      max: "512"
    })), /* @__PURE__ */ createElement("button", {
      id: "scene-shift-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "scene-shift-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "object-folder"
    }, /* @__PURE__ */ createElement("title-bar", null, "Default Object Folders", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Tilemap"), /* @__PURE__ */ createElement("text-box", {
      id: "object-folder-tilemap"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("text-box", {
      id: "object-folder-actor"
    }), /* @__PURE__ */ createElement("text", null, "Region"), /* @__PURE__ */ createElement("text-box", {
      id: "object-folder-region"
    }), /* @__PURE__ */ createElement("text", null, "Light"), /* @__PURE__ */ createElement("text-box", {
      id: "object-folder-light"
    }), /* @__PURE__ */ createElement("text", null, "Animation"), /* @__PURE__ */ createElement("text-box", {
      id: "object-folder-animation"
    }), /* @__PURE__ */ createElement("text", null, "Particle"), /* @__PURE__ */ createElement("text-box", {
      id: "object-folder-particle"
    }), /* @__PURE__ */ createElement("text", null, "Parallax"), /* @__PURE__ */ createElement("text-box", {
      id: "object-folder-parallax"
    })), /* @__PURE__ */ createElement("button", {
      id: "object-folder-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "object-folder-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "confirmation"
    }, /* @__PURE__ */ createElement("title-bar", null, /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("text", {
      id: "confirmation-message"
    }), /* @__PURE__ */ createElement("box", {
      id: "confirmation-button-frame"
    }, /* @__PURE__ */ createElement("button", {
      id: "confirmation-button-0"
    }), /* @__PURE__ */ createElement("button", {
      id: "confirmation-button-1"
    }), /* @__PURE__ */ createElement("button", {
      id: "confirmation-button-2"
    })))), /* @__PURE__ */ createElement("window-frame", {
      id: "newProject"
    }, /* @__PURE__ */ createElement("title-bar", null, "New Project", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Folder"), /* @__PURE__ */ createElement("text-box", {
      id: "newProject-folder"
    }), /* @__PURE__ */ createElement("text", null, "Location"), /* @__PURE__ */ createElement("flex-box", {
      id: "newProject-location-box"
    }, /* @__PURE__ */ createElement("text-box", {
      id: "newProject-location"
    }), /* @__PURE__ */ createElement("button", {
      id: "newProject-choose"
    }, "\u2026"))), /* @__PURE__ */ createElement("text", {
      id: "newProject-warning"
    }), /* @__PURE__ */ createElement("button", {
      id: "newProject-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "newProject-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "deployment"
    }, /* @__PURE__ */ createElement("title-bar", null, "Deployment", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Platform"), /* @__PURE__ */ createElement("select-box", {
      id: "deployment-platform"
    }), /* @__PURE__ */ createElement("text", null, "Folder"), /* @__PURE__ */ createElement("text-box", {
      id: "deployment-folder"
    }), /* @__PURE__ */ createElement("text", null, "Output Location"), /* @__PURE__ */ createElement("flex-box", {
      id: "deployment-location-box"
    }, /* @__PURE__ */ createElement("text-box", {
      id: "deployment-location"
    }), /* @__PURE__ */ createElement("button", {
      id: "deployment-choose"
    }, "\u2026"))), /* @__PURE__ */ createElement("text", {
      id: "deployment-warning"
    }), /* @__PURE__ */ createElement("button", {
      id: "deployment-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "deployment-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "copyProgress"
    }, /* @__PURE__ */ createElement("title-bar", null, "New Project", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("flex-box", {
      id: "copyProgress-flex"
    }, /* @__PURE__ */ createElement("text", null, "Copying Files..."), /* @__PURE__ */ createElement("box", {
      id: "copyProgress-box"
    }, /* @__PURE__ */ createElement("box", {
      id: "copyProgress-bar"
    })), /* @__PURE__ */ createElement("text", {
      id: "copyProgress-info"
    })))), /* @__PURE__ */ createElement("window-frame", {
      id: "project-settings"
    }, /* @__PURE__ */ createElement("title-bar", null, "Project Settings", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("box", {
      id: "project-page"
    }, /* @__PURE__ */ createElement("box", {
      id: "project-grid-box"
    }, /* @__PURE__ */ createElement("text", {
      id: "config-window-summary",
      class: "project-summary"
    }, "Window"), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Title"), /* @__PURE__ */ createElement("text-box", {
      id: "config-window-title"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Width"), /* @__PURE__ */ createElement("number-box", {
      id: "config-window-width",
      min: "240",
      max: "3840",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Height"), /* @__PURE__ */ createElement("number-box", {
      id: "config-window-height",
      min: "240",
      max: "3840",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Display"), /* @__PURE__ */ createElement("select-box", {
      id: "config-window-display"
    }), /* @__PURE__ */ createElement("text", {
      id: "config-resolution-summary",
      class: "project-summary"
    }, "Virtual Resolution"), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Width"), /* @__PURE__ */ createElement("number-box", {
      id: "config-resolution-width",
      min: "240",
      max: "3840",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Height"), /* @__PURE__ */ createElement("number-box", {
      id: "config-resolution-height",
      min: "240",
      max: "3840",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      id: "config-scene-summary",
      class: "project-summary"
    }, "Scene"), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Padding"), /* @__PURE__ */ createElement("number-box", {
      id: "config-scene-padding",
      min: "0",
      max: "3840",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Animation Interval"), /* @__PURE__ */ createElement("number-box", {
      id: "config-scene-animationInterval",
      min: "0",
      max: "1000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", {
      id: "config-tileArea-summary",
      class: "project-summary"
    }, "Tile Rendering Area"), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Expansion Top"), /* @__PURE__ */ createElement("number-box", {
      id: "config-tileArea-expansionTop",
      min: "0",
      max: "400",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Expansion Left"), /* @__PURE__ */ createElement("number-box", {
      id: "config-tileArea-expansionLeft",
      min: "0",
      max: "400",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Expansion Right"), /* @__PURE__ */ createElement("number-box", {
      id: "config-tileArea-expansionRight",
      min: "0",
      max: "400",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Expansion Bottom"), /* @__PURE__ */ createElement("number-box", {
      id: "config-tileArea-expansionBottom",
      min: "0",
      max: "400",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      id: "config-animationArea-summary",
      class: "project-summary"
    }, "Animation Rendering Area"), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Expansion Top"), /* @__PURE__ */ createElement("number-box", {
      id: "config-animationArea-expansionTop",
      min: "0",
      max: "800",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Expansion Left"), /* @__PURE__ */ createElement("number-box", {
      id: "config-animationArea-expansionLeft",
      min: "0",
      max: "800",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Expansion Right"), /* @__PURE__ */ createElement("number-box", {
      id: "config-animationArea-expansionRight",
      min: "0",
      max: "800",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Expansion Bottom"), /* @__PURE__ */ createElement("number-box", {
      id: "config-animationArea-expansionBottom",
      min: "0",
      max: "800",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      id: "config-lightArea-summary",
      class: "project-summary"
    }, "Light Rendering Area"), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Expansion Top"), /* @__PURE__ */ createElement("number-box", {
      id: "config-lightArea-expansionTop",
      min: "0",
      max: "400",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Expansion Left"), /* @__PURE__ */ createElement("number-box", {
      id: "config-lightArea-expansionLeft",
      min: "0",
      max: "400",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Expansion Right"), /* @__PURE__ */ createElement("number-box", {
      id: "config-lightArea-expansionRight",
      min: "0",
      max: "400",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Expansion Bottom"), /* @__PURE__ */ createElement("number-box", {
      id: "config-lightArea-expansionBottom",
      min: "0",
      max: "400",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", {
      id: "config-collision-summary",
      class: "project-summary"
    }, "Collision System"), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Actor Collision"), /* @__PURE__ */ createElement("select-box", {
      id: "config-collision-actor-enabled"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Scene Collision"), /* @__PURE__ */ createElement("select-box", {
      id: "config-collision-scene-enabled"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Scene Collision Size"), /* @__PURE__ */ createElement("number-box", {
      id: "config-collision-scene-size",
      min: "0.5",
      max: "1",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", {
      id: "config-font-summary",
      class: "project-summary"
    }, "Font"), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Imports"), /* @__PURE__ */ createElement("param-list", {
      id: "config-font-imports",
      flexible: true
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Default"), /* @__PURE__ */ createElement("text-box", {
      id: "config-font-default"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Pixelated"), /* @__PURE__ */ createElement("select-box", {
      id: "config-font-pixelated"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Threshold"), /* @__PURE__ */ createElement("number-box", {
      id: "config-font-threshold",
      min: "1",
      max: "255",
      unit: "alpha"
    }), /* @__PURE__ */ createElement("text", {
      id: "config-event-summary",
      class: "project-summary"
    }, "Special Events"), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Startup"), /* @__PURE__ */ createElement("custom-box", {
      id: "config-event-startup",
      type: "file",
      filter: "event"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Load Game"), /* @__PURE__ */ createElement("custom-box", {
      id: "config-event-loadGame",
      type: "file",
      filter: "event"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Init Scene"), /* @__PURE__ */ createElement("custom-box", {
      id: "config-event-initScene",
      type: "file",
      filter: "event"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Show Text"), /* @__PURE__ */ createElement("custom-box", {
      id: "config-event-showText",
      type: "file",
      filter: "event"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Show Choices"), /* @__PURE__ */ createElement("custom-box", {
      id: "config-event-showChoices",
      type: "file",
      filter: "event"
    }), /* @__PURE__ */ createElement("text", {
      id: "config-actor-summary",
      class: "project-summary"
    }, "Actor"), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Player Team"), /* @__PURE__ */ createElement("select-box", {
      id: "config-actor-playerTeam"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Player Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "config-actor-playerActor",
      type: "file",
      filter: "actor"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Party Member 1"), /* @__PURE__ */ createElement("custom-box", {
      id: "config-actor-partyMembers-0",
      type: "file",
      filter: "actor"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Party Member 2"), /* @__PURE__ */ createElement("custom-box", {
      id: "config-actor-partyMembers-1",
      type: "file",
      filter: "actor"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Party Member 3"), /* @__PURE__ */ createElement("custom-box", {
      id: "config-actor-partyMembers-2",
      type: "file",
      filter: "actor"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Party Member 4"), /* @__PURE__ */ createElement("custom-box", {
      id: "config-actor-partyMembers-3",
      type: "file",
      filter: "actor"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Party Bag Mode"), /* @__PURE__ */ createElement("select-box", {
      id: "config-actor-partyBagMode"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Temporary Attributes"), /* @__PURE__ */ createElement("param-list", {
      id: "config-actor-tempAttributes",
      group: "actor",
      flexible: true
    }), /* @__PURE__ */ createElement("text", {
      id: "config-animation-summary",
      class: "project-summary"
    }, "Animation"), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Frame Rate"), /* @__PURE__ */ createElement("number-box", {
      id: "config-animation-frameRate",
      min: "1",
      max: "240",
      unit: "fps"
    }), /* @__PURE__ */ createElement("text", {
      id: "config-script-summary",
      class: "project-summary"
    }, "Script"), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Default Scripting Language"), /* @__PURE__ */ createElement("select-box", {
      id: "config-script-language"
    }), /* @__PURE__ */ createElement("text", {
      class: "project-label"
    }, "Output Directory"), /* @__PURE__ */ createElement("text-box", {
      id: "config-script-outDir"
    }))), /* @__PURE__ */ createElement("button", {
      id: "project-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "project-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "easing"
    }, /* @__PURE__ */ createElement("title-bar", null, "Easing", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("field-set", {
      id: "easing-list-fieldset",
      class: "input pad"
    }, /* @__PURE__ */ createElement("legend", null, "List"), /* @__PURE__ */ createElement("node-list", {
      id: "easing-list",
      padded: true
    })), /* @__PURE__ */ createElement("field-set", {
      id: "easing-points-fieldset"
    }, /* @__PURE__ */ createElement("legend", null, "Points"), /* @__PURE__ */ createElement("grid-box", {
      id: "easing-points-grid"
    }, /* @__PURE__ */ createElement("text", null, "Mode"), /* @__PURE__ */ createElement("select-box", {
      id: "easing-mode"
    }), /* @__PURE__ */ createElement("text", null, "Point 1"), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-0-x",
      min: "0",
      max: "1",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "X")), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-0-y",
      min: "-5",
      max: "5",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "Y")), /* @__PURE__ */ createElement("text", null, "Point 2"), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-1-x",
      min: "0",
      max: "1",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "X")), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-1-y",
      min: "-5",
      max: "5",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "Y")), /* @__PURE__ */ createElement("text", null, "Point 3"), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-2-x",
      min: "0",
      max: "1",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "X")), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-2-y",
      min: "-5",
      max: "5",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "Y")), /* @__PURE__ */ createElement("text", null, "Point 4"), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-3-x",
      min: "0",
      max: "1",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "X")), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-3-y",
      min: "-5",
      max: "5",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "Y")), /* @__PURE__ */ createElement("text", null, "Point 5"), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-4-x",
      min: "0",
      max: "1",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "X")), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-4-y",
      min: "-5",
      max: "5",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "Y")), /* @__PURE__ */ createElement("text", null, "Point 6"), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-5-x",
      min: "0",
      max: "1",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "X")), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-5-y",
      min: "-5",
      max: "5",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "Y")), /* @__PURE__ */ createElement("text", null, "Point 7"), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-6-x",
      min: "0",
      max: "1",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "X")), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-6-y",
      min: "-5",
      max: "5",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "Y")), /* @__PURE__ */ createElement("text", null, "Point 8"), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-7-x",
      min: "0",
      max: "1",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "X")), /* @__PURE__ */ createElement("number-box", {
      id: "easing-points-7-y",
      min: "-5",
      max: "5",
      step: "0.01",
      decimals: "2"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "Y")))), /* @__PURE__ */ createElement("field-set", {
      id: "easing-curve-fieldset"
    }, /* @__PURE__ */ createElement("legend", null, "Curve"), /* @__PURE__ */ createElement("canvas", {
      id: "easing-curve-canvas",
      width: "0",
      height: "0",
      tabindex: "-1"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "easing-scale",
      value: "1"
    }, "100%"), /* @__PURE__ */ createElement("radio-box", {
      name: "easing-scale",
      value: "0.5"
    }, "50%")), /* @__PURE__ */ createElement("field-set", {
      id: "easing-preview-fieldset"
    }, /* @__PURE__ */ createElement("legend", null, "Preview"), /* @__PURE__ */ createElement("canvas", {
      id: "easing-preview-canvas",
      width: "0",
      height: "0"
    }), /* @__PURE__ */ createElement("grid-box", {
      id: "easing-preview-grid"
    }, /* @__PURE__ */ createElement("text", null, "Reverse"), /* @__PURE__ */ createElement("select-box", {
      id: "easing-preview-reverse"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-box", {
      id: "easing-preview-duration",
      min: "1",
      max: "60000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("number-box", {
      id: "easing-preview-delay",
      min: "0",
      max: "5000",
      unit: "ms"
    }))), /* @__PURE__ */ createElement("button", {
      id: "easing-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "easing-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "team"
    }, /* @__PURE__ */ createElement("title-bar", null, "Team", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("field-set", {
      id: "team-list-fieldset",
      class: "input pad"
    }, /* @__PURE__ */ createElement("node-list", {
      id: "team-list"
    })), /* @__PURE__ */ createElement("button", {
      id: "team-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "team-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "object-attribute"
    }, /* @__PURE__ */ createElement("title-bar", null, "Attribute", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Key"), /* @__PURE__ */ createElement("select-box", {
      id: "object-attribute-key"
    }), /* @__PURE__ */ createElement("text", null, "Boolean"), /* @__PURE__ */ createElement("select-box", {
      id: "object-attribute-boolean-value"
    }), /* @__PURE__ */ createElement("text", null, "Number"), /* @__PURE__ */ createElement("number-box", {
      id: "object-attribute-number-value",
      min: "-1000000000",
      max: "1000000000",
      decimals: "6"
    }), /* @__PURE__ */ createElement("text", null, "String"), /* @__PURE__ */ createElement("text-area", {
      id: "object-attribute-string-value"
    }), /* @__PURE__ */ createElement("text", null, "Option"), /* @__PURE__ */ createElement("select-box", {
      id: "object-attribute-enum-value"
    })), /* @__PURE__ */ createElement("button", {
      id: "object-attribute-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "object-attribute-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "condition"
    }, /* @__PURE__ */ createElement("title-bar", null, "Condition", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Condition Type"), /* @__PURE__ */ createElement("select-box", {
      id: "condition-type"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "condition-key",
      type: "global-variable",
      filter: "all"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "condition-boolean-operation"
    }), /* @__PURE__ */ createElement("text", null, "Boolean"), /* @__PURE__ */ createElement("select-box", {
      id: "condition-boolean-value"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "condition-number-operation"
    }), /* @__PURE__ */ createElement("text", null, "Number"), /* @__PURE__ */ createElement("number-box", {
      id: "condition-number-value",
      min: "-1000000000",
      max: "1000000000",
      decimals: "10"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "condition-string-operation"
    }), /* @__PURE__ */ createElement("text", null, "String"), /* @__PURE__ */ createElement("text-area", {
      id: "condition-string-value"
    })), /* @__PURE__ */ createElement("button", {
      id: "condition-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "condition-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "fileAnimation-sprite"
    }, /* @__PURE__ */ createElement("title-bar", null, "Sprite", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text-box", {
      id: "fileAnimation-sprite-name"
    }), /* @__PURE__ */ createElement("text", null, "Image"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileAnimation-sprite-image",
      type: "file",
      filter: "image"
    }), /* @__PURE__ */ createElement("text", null, "Horiz Frames"), /* @__PURE__ */ createElement("number-box", {
      id: "fileAnimation-sprite-hframes",
      min: "1",
      max: "256"
    }), /* @__PURE__ */ createElement("text", null, "Vert Frames"), /* @__PURE__ */ createElement("number-box", {
      id: "fileAnimation-sprite-vframes",
      min: "1",
      max: "256"
    })), /* @__PURE__ */ createElement("button", {
      id: "fileAnimation-sprite-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "fileAnimation-sprite-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "fileActor-sprite"
    }, /* @__PURE__ */ createElement("title-bar", null, "Sprite", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("select-box", {
      id: "fileActor-sprite-id"
    }), /* @__PURE__ */ createElement("text", null, "Image"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileActor-sprite-image",
      type: "file",
      filter: "image"
    })), /* @__PURE__ */ createElement("button", {
      id: "fileActor-sprite-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "fileActor-sprite-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "fileActor-skill"
    }, /* @__PURE__ */ createElement("title-bar", null, "Skill", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Skill"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileActor-skill-id",
      type: "file",
      filter: "skill"
    }), /* @__PURE__ */ createElement("text", null, "Shortcut Key"), /* @__PURE__ */ createElement("select-box", {
      id: "fileActor-skill-key"
    })), /* @__PURE__ */ createElement("button", {
      id: "fileActor-skill-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "fileActor-skill-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "fileActor-equipment"
    }, /* @__PURE__ */ createElement("title-bar", null, "Equipment", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Equipment"), /* @__PURE__ */ createElement("custom-box", {
      id: "fileActor-equipment-id",
      type: "file",
      filter: "equipment"
    }), /* @__PURE__ */ createElement("text", null, "Slot"), /* @__PURE__ */ createElement("select-box", {
      id: "fileActor-equipment-slot"
    })), /* @__PURE__ */ createElement("button", {
      id: "fileActor-equipment-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "fileActor-equipment-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "variable",
      mode: "center"
    }, /* @__PURE__ */ createElement("title-bar", null, "Variable", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("field-set", {
      id: "variable-list-fieldset",
      class: "input pad"
    }, /* @__PURE__ */ createElement("legend", null, "List"), /* @__PURE__ */ createElement("node-list", {
      id: "variable-list",
      padded: true
    })), /* @__PURE__ */ createElement("field-set", {
      id: "variable-properties-fieldset"
    }, /* @__PURE__ */ createElement("legend", null, "Properties"), /* @__PURE__ */ createElement("flex-box", {
      id: "variable-properties-flex"
    }, /* @__PURE__ */ createElement("flex-item", null, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text-box", {
      id: "variable-name"
    })), /* @__PURE__ */ createElement("flex-item", null, /* @__PURE__ */ createElement("text", null, "Sort"), /* @__PURE__ */ createElement("radio-box", {
      id: "variable-sort-normal",
      name: "variable-sort",
      class: "standard",
      value: "0"
    }, /* @__PURE__ */ createElement("text", {
      id: "variable-sort-normal-label"
    }, "Normal")), /* @__PURE__ */ createElement("radio-box", {
      id: "variable-sort-shared",
      name: "variable-sort",
      class: "standard",
      value: "1"
    }, /* @__PURE__ */ createElement("text", {
      id: "variable-sort-shared-label"
    }, "Shared")), /* @__PURE__ */ createElement("radio-box", {
      id: "variable-sort-temporary",
      name: "variable-sort",
      class: "standard",
      value: "2"
    }, /* @__PURE__ */ createElement("text", {
      id: "variable-sort-temporary-label"
    }, "Temporary"))), /* @__PURE__ */ createElement("flex-item", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("radio-box", {
      id: "variable-type-boolean",
      name: "variable-type",
      class: "standard",
      value: "boolean"
    }, /* @__PURE__ */ createElement("text", {
      id: "variable-type-boolean-label"
    }, "Boolean")), /* @__PURE__ */ createElement("radio-box", {
      id: "variable-type-number",
      name: "variable-type",
      class: "standard",
      value: "number"
    }, /* @__PURE__ */ createElement("text", {
      id: "variable-type-number-label"
    }, "Number")), /* @__PURE__ */ createElement("radio-box", {
      id: "variable-type-string",
      name: "variable-type",
      class: "standard",
      value: "string"
    }, /* @__PURE__ */ createElement("text", {
      id: "variable-type-string-label"
    }, "String")), /* @__PURE__ */ createElement("radio-box", {
      id: "variable-type-object",
      name: "variable-type",
      class: "standard",
      value: "object"
    }, /* @__PURE__ */ createElement("text", {
      id: "variable-type-object-label"
    }, "Object"))), /* @__PURE__ */ createElement("flex-item", {
      id: "variable-value-box"
    }, /* @__PURE__ */ createElement("text", null, "Value"), /* @__PURE__ */ createElement("page-manager", {
      id: "variable-value-manager"
    }, /* @__PURE__ */ createElement("page-frame", {
      value: "boolean"
    }, /* @__PURE__ */ createElement("radio-box", {
      name: "variable-value-boolean",
      class: "standard",
      value: "false"
    }, "False"), /* @__PURE__ */ createElement("radio-box", {
      name: "variable-value-boolean",
      class: "standard",
      value: "true"
    }, "True")), /* @__PURE__ */ createElement("page-frame", {
      value: "number"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "variable-value-number",
      min: "-1000000000",
      max: "1000000000",
      decimals: "10"
    })), /* @__PURE__ */ createElement("page-frame", {
      value: "string"
    }, /* @__PURE__ */ createElement("text-area", {
      id: "variable-value-string"
    })))), /* @__PURE__ */ createElement("flex-item", null, /* @__PURE__ */ createElement("text", null, "Note"), /* @__PURE__ */ createElement("text-area", {
      id: "variable-note"
    })))), /* @__PURE__ */ createElement("text-box", {
      id: "variable-searcher",
      name: "search"
    }), /* @__PURE__ */ createElement("button", {
      id: "variable-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "variable-cancel",
      name: "cancel"
    }, "Cancel"), /* @__PURE__ */ createElement("button", {
      id: "variable-apply",
      name: "apply"
    }, "Apply"))), /* @__PURE__ */ createElement("window-frame", {
      id: "attribute"
    }, /* @__PURE__ */ createElement("title-bar", null, "Attribute", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("field-set", {
      id: "attribute-list-fieldset",
      class: "input pad"
    }, /* @__PURE__ */ createElement("legend", null, "List"), /* @__PURE__ */ createElement("node-list", {
      id: "attribute-list",
      padded: true
    })), /* @__PURE__ */ createElement("field-set", {
      id: "attribute-properties-fieldset"
    }, /* @__PURE__ */ createElement("legend", null, "Properties"), /* @__PURE__ */ createElement("flex-box", {
      id: "attribute-properties-flex"
    }, /* @__PURE__ */ createElement("flex-item", null, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text-box", {
      id: "attribute-name"
    })), /* @__PURE__ */ createElement("flex-item", null, /* @__PURE__ */ createElement("text", null, "Key"), /* @__PURE__ */ createElement("text-box", {
      id: "attribute-key"
    })), /* @__PURE__ */ createElement("flex-item", {
      id: "attribute-type-box"
    }, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("radio-box", {
      id: "attribute-type-boolean",
      name: "attribute-type",
      class: "standard",
      value: "boolean"
    }, /* @__PURE__ */ createElement("text", {
      id: "attribute-type-boolean-label"
    }, "Boolean")), /* @__PURE__ */ createElement("radio-box", {
      id: "attribute-type-number",
      name: "attribute-type",
      class: "standard",
      value: "number"
    }, /* @__PURE__ */ createElement("text", {
      id: "attribute-type-number-label"
    }, "Number")), /* @__PURE__ */ createElement("radio-box", {
      id: "attribute-type-string",
      name: "attribute-type",
      class: "standard",
      value: "string"
    }, /* @__PURE__ */ createElement("text", {
      id: "attribute-type-string-label"
    }, "String")), /* @__PURE__ */ createElement("radio-box", {
      id: "attribute-type-enum",
      name: "attribute-type",
      class: "standard",
      value: "enum"
    }, /* @__PURE__ */ createElement("text", {
      id: "attribute-type-enum-label"
    }, "String(Enum)"))), /* @__PURE__ */ createElement("flex-item", {
      id: "attribute-enum-box"
    }, /* @__PURE__ */ createElement("text", null, "Options"), /* @__PURE__ */ createElement("custom-box", {
      id: "attribute-enum",
      type: "enum-group"
    })), /* @__PURE__ */ createElement("flex-item", null, /* @__PURE__ */ createElement("text", null, "Note"), /* @__PURE__ */ createElement("text-area", {
      id: "attribute-note"
    })))), /* @__PURE__ */ createElement("text-box", {
      id: "attribute-searcher",
      name: "search"
    }), /* @__PURE__ */ createElement("button", {
      id: "attribute-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "attribute-cancel",
      name: "cancel"
    }, "Cancel"), /* @__PURE__ */ createElement("button", {
      id: "attribute-apply",
      name: "apply"
    }, "Apply"))), /* @__PURE__ */ createElement("window-frame", {
      id: "enum",
      mode: "center"
    }, /* @__PURE__ */ createElement("title-bar", null, "Enumeration", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("field-set", {
      id: "enum-list-fieldset",
      class: "input pad"
    }, /* @__PURE__ */ createElement("legend", null, "List"), /* @__PURE__ */ createElement("node-list", {
      id: "enum-list",
      padded: true
    })), /* @__PURE__ */ createElement("field-set", {
      id: "enum-properties-fieldset"
    }, /* @__PURE__ */ createElement("legend", null, "Properties"), /* @__PURE__ */ createElement("flex-box", {
      id: "enum-properties-flex"
    }, /* @__PURE__ */ createElement("flex-item", null, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text-box", {
      id: "enum-name"
    })), /* @__PURE__ */ createElement("flex-item", null, /* @__PURE__ */ createElement("text", null, "Value"), /* @__PURE__ */ createElement("text-box", {
      id: "enum-value"
    })), /* @__PURE__ */ createElement("flex-item", {
      id: "enum-spacing-box"
    }), /* @__PURE__ */ createElement("flex-item", null, /* @__PURE__ */ createElement("text", null, "Note"), /* @__PURE__ */ createElement("text-area", {
      id: "enum-note"
    })))), /* @__PURE__ */ createElement("text-box", {
      id: "enum-searcher",
      name: "search"
    }), /* @__PURE__ */ createElement("button", {
      id: "enum-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "enum-cancel",
      name: "cancel"
    }, "Cancel"), /* @__PURE__ */ createElement("button", {
      id: "enum-apply",
      name: "apply"
    }, "Apply"))), /* @__PURE__ */ createElement("window-frame", {
      id: "presetObject",
      mode: "center"
    }, /* @__PURE__ */ createElement("title-bar", null, "Object", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("text-box", {
      id: "presetObject-searcher",
      name: "search"
    }), /* @__PURE__ */ createElement("node-list", {
      id: "presetObject-list"
    }), /* @__PURE__ */ createElement("button", {
      id: "presetObject-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "presetObject-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "presetElement",
      mode: "center"
    }, /* @__PURE__ */ createElement("title-bar", null, "Element", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("custom-box", {
      id: "presetElement-uiId",
      type: "file",
      filter: "ui"
    }), /* @__PURE__ */ createElement("node-list", {
      id: "presetElement-list"
    }), /* @__PURE__ */ createElement("button", {
      id: "presetElement-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "presetElement-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "plugin"
    }, /* @__PURE__ */ createElement("title-bar", null, "Plugin", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("field-set", {
      id: "plugin-list-fieldset",
      class: "input pad"
    }, /* @__PURE__ */ createElement("legend", null, "List"), /* @__PURE__ */ createElement("node-list", {
      id: "plugin-list",
      padded: true
    })), /* @__PURE__ */ createElement("box", {
      id: "plugin-inspector"
    }, /* @__PURE__ */ createElement("detail-box", {
      id: "plugin-overview-detail",
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Overview"), /* @__PURE__ */ createElement("box", {
      id: "plugin-overview"
    })), /* @__PURE__ */ createElement("parameter-pane", {
      id: "plugin-parameter-pane"
    }, /* @__PURE__ */ createElement("detail-box", {
      id: "plugin-parameter-detail",
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Parameters"), /* @__PURE__ */ createElement("detail-grid", {
      id: "plugin-parameter-grid"
    })))), /* @__PURE__ */ createElement("button", {
      id: "plugin-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "plugin-cancel",
      name: "cancel"
    }, "Cancel"), /* @__PURE__ */ createElement("button", {
      id: "plugin-apply",
      name: "apply"
    }, "Apply"))), /* @__PURE__ */ createElement("window-frame", {
      id: "command"
    }, /* @__PURE__ */ createElement("title-bar", null, "Custom Command", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("field-set", {
      id: "command-list-fieldset",
      class: "input pad"
    }, /* @__PURE__ */ createElement("legend", null, "List"), /* @__PURE__ */ createElement("node-list", {
      id: "command-list",
      padded: true
    })), /* @__PURE__ */ createElement("box", {
      id: "command-inspector"
    }, /* @__PURE__ */ createElement("detail-box", {
      id: "command-overview-detail",
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Overview"), /* @__PURE__ */ createElement("box", {
      id: "command-overview"
    })), /* @__PURE__ */ createElement("detail-box", {
      id: "command-settings-detail",
      open: true
    }, /* @__PURE__ */ createElement("detail-summary", null, "Settings"), /* @__PURE__ */ createElement("detail-grid", {
      id: "command-settings-grid"
    }, /* @__PURE__ */ createElement("text", null, "Alias"), /* @__PURE__ */ createElement("text-box", {
      id: "command-alias"
    }), /* @__PURE__ */ createElement("text", null, "Keywords"), /* @__PURE__ */ createElement("text-box", {
      id: "command-keywords"
    })))), /* @__PURE__ */ createElement("button", {
      id: "command-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "command-cancel",
      name: "cancel"
    }, "Cancel"), /* @__PURE__ */ createElement("button", {
      id: "command-apply",
      name: "apply"
    }, "Apply"))), /* @__PURE__ */ createElement("window-frame", {
      id: "log"
    }, /* @__PURE__ */ createElement("title-bar", null, "Log", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("common-list", {
      id: "log-list"
    }))), /* @__PURE__ */ createElement("box", {
      id: "error-message"
    }), /* @__PURE__ */ createElement("window-frame", {
      id: "about"
    }, /* @__PURE__ */ createElement("title-bar", null, "Yami RPG Editor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Author"), /* @__PURE__ */ createElement("text", null, "Yami Sama"), /* @__PURE__ */ createElement("text", null, "Editor"), /* @__PURE__ */ createElement("text", {
      id: "editor-version"
    }), /* @__PURE__ */ createElement("text", null, "Electron"), /* @__PURE__ */ createElement("text", {
      id: "electron-version"
    }), /* @__PURE__ */ createElement("text", null, "Chromium"), /* @__PURE__ */ createElement("text", {
      id: "chrome-version"
    }), /* @__PURE__ */ createElement("text", null, "Node.js"), /* @__PURE__ */ createElement("text", {
      id: "node-version"
    }), /* @__PURE__ */ createElement("text", null, "V8"), /* @__PURE__ */ createElement("text", {
      id: "v8-version"
    }), /* @__PURE__ */ createElement("text", null, "OS"), /* @__PURE__ */ createElement("text", {
      id: "os-version"
    })))), /* @__PURE__ */ createElement("window-frame", {
      id: "selector",
      mode: "center"
    }, /* @__PURE__ */ createElement("title-bar", null, "Select File", /* @__PURE__ */ createElement("maximize", null), /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("file-browser", {
      id: "selector-browser"
    }), /* @__PURE__ */ createElement("button", {
      id: "selector-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "selector-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "imageClip"
    }, /* @__PURE__ */ createElement("title-bar", null, "Image Clip", /* @__PURE__ */ createElement("maximize", null), /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("box", {
      id: "imageClip-screen",
      tabindex: "-1"
    }, /* @__PURE__ */ createElement("img", {
      id: "imageClip-image"
    }), /* @__PURE__ */ createElement("marquee-area", {
      id: "imageClip-marquee"
    })), /* @__PURE__ */ createElement("flex-box", {
      id: "imageClip-flex"
    }, /* @__PURE__ */ createElement("number-box", {
      id: "imageClip-x",
      min: "0",
      max: "10000"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "X:")), /* @__PURE__ */ createElement("number-box", {
      id: "imageClip-y",
      min: "0",
      max: "10000"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "Y:")), /* @__PURE__ */ createElement("number-box", {
      id: "imageClip-width",
      min: "0",
      max: "2000"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "W:")), /* @__PURE__ */ createElement("number-box", {
      id: "imageClip-height",
      min: "0",
      max: "2000"
    }, /* @__PURE__ */ createElement("text", {
      class: "label"
    }, "H:"))), /* @__PURE__ */ createElement("button", {
      id: "imageClip-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "imageClip-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "color"
    }, /* @__PURE__ */ createElement("title-bar", null, "Color Picker", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("canvas", {
      id: "color-palette-canvas",
      width: "256",
      height: "194"
    }), /* @__PURE__ */ createElement("box", {
      id: "color-palette-frame"
    }, /* @__PURE__ */ createElement("box", {
      id: "color-palette-cursor"
    })), /* @__PURE__ */ createElement("grid-box", {
      id: "color-index-grid"
    }, /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "0"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "1"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "2"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "3"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "4"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "5"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "6"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "7"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "8"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "9"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "10"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "11"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "12"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "13"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "14"
    }), /* @__PURE__ */ createElement("radio-box", {
      name: "color-index",
      value: "15"
    })), /* @__PURE__ */ createElement("canvas", {
      id: "color-pillar-canvas",
      width: "20",
      height: "256"
    }), /* @__PURE__ */ createElement("box", {
      id: "color-pillar-frame"
    }, /* @__PURE__ */ createElement("box", {
      id: "color-pillar-cursor"
    })), /* @__PURE__ */ createElement("box", {
      id: "color-viewer-frame"
    }, /* @__PURE__ */ createElement("box", {
      id: "color-viewer"
    })), /* @__PURE__ */ createElement("grid-box", {
      id: "color-rgba-grid"
    }, /* @__PURE__ */ createElement("text", null, "#"), /* @__PURE__ */ createElement("text-box", {
      id: "color-hex"
    }), /* @__PURE__ */ createElement("text", null, "R"), /* @__PURE__ */ createElement("number-box", {
      id: "color-r",
      min: "0",
      max: "255"
    }), /* @__PURE__ */ createElement("text", null, "G"), /* @__PURE__ */ createElement("number-box", {
      id: "color-g",
      min: "0",
      max: "255"
    }), /* @__PURE__ */ createElement("text", null, "B"), /* @__PURE__ */ createElement("number-box", {
      id: "color-b",
      min: "0",
      max: "255"
    }), /* @__PURE__ */ createElement("text", null, "A"), /* @__PURE__ */ createElement("number-box", {
      id: "color-a",
      min: "0",
      max: "255"
    })), /* @__PURE__ */ createElement("button", {
      id: "color-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "color-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "font"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Font", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Font Family"), /* @__PURE__ */ createElement("text-box", {
      id: "font-font"
    })), /* @__PURE__ */ createElement("button", {
      id: "font-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "font-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "fontSize"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Font Size", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Size"), /* @__PURE__ */ createElement("number-box", {
      id: "fontSize-size",
      min: "10",
      max: "400",
      unit: "px"
    })), /* @__PURE__ */ createElement("button", {
      id: "fontSize-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "fontSize-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "textPosition"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Text Position", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Axis"), /* @__PURE__ */ createElement("select-box", {
      id: "textPosition-axis"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "textPosition-operation"
    }), /* @__PURE__ */ createElement("text", null, "Value"), /* @__PURE__ */ createElement("number-box", {
      id: "textPosition-value",
      min: "-1000",
      max: "1000",
      unit: "px"
    })), /* @__PURE__ */ createElement("button", {
      id: "textPosition-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "textPosition-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "textEffect"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Text Effect", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Effect"), /* @__PURE__ */ createElement("select-box", {
      id: "textEffect-type"
    }), /* @__PURE__ */ createElement("text", null, "Shadow X"), /* @__PURE__ */ createElement("number-box", {
      id: "textEffect-shadowOffsetX",
      min: "-9",
      max: "9",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Shadow Y"), /* @__PURE__ */ createElement("number-box", {
      id: "textEffect-shadowOffsetY",
      min: "-9",
      max: "9",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Stroke Width"), /* @__PURE__ */ createElement("number-box", {
      id: "textEffect-strokeWidth",
      min: "1",
      max: "20",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Effect Color"), /* @__PURE__ */ createElement("color-box", {
      id: "textEffect-color"
    })), /* @__PURE__ */ createElement("button", {
      id: "textEffect-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "textEffect-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "localVariable"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Local Variable", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Local Variable"), /* @__PURE__ */ createElement("text-box", {
      id: "localVariable-key"
    })), /* @__PURE__ */ createElement("button", {
      id: "localVariable-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "localVariable-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "zoom"
    }, /* @__PURE__ */ createElement("title-bar", null, "Zoom", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Zoom Factor"), /* @__PURE__ */ createElement("number-box", {
      id: "zoom-factor",
      min: "0.6666",
      max: "2",
      decimals: "4"
    })), /* @__PURE__ */ createElement("button", {
      id: "zoom-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "zoom-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "rename"
    }, /* @__PURE__ */ createElement("title-bar", null, "Rename", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Name"), /* @__PURE__ */ createElement("text-box", {
      id: "rename-name"
    })), /* @__PURE__ */ createElement("button", {
      id: "rename-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "rename-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setKey"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Key", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Key"), /* @__PURE__ */ createElement("text-box", {
      id: "setKey-key"
    })), /* @__PURE__ */ createElement("button", {
      id: "setKey-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setKey-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setQuantity"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Quantity", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Quantity"), /* @__PURE__ */ createElement("number-box", {
      id: "setQuantity-quantity",
      min: "1"
    })), /* @__PURE__ */ createElement("button", {
      id: "setQuantity-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setQuantity-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "event",
      class: "opaque"
    }, /* @__PURE__ */ createElement("title-bar", {
      id: "event-title"
    }, "Event", /* @__PURE__ */ createElement("maximize", null), /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("field-set", {
      id: "event-commands-fieldset",
      class: "input pad"
    }, /* @__PURE__ */ createElement("box", {
      id: "event-commands-gutter-background"
    }), /* @__PURE__ */ createElement("command-list", {
      id: "event-commands"
    }), /* @__PURE__ */ createElement("box", {
      id: "event-commands-gutter-outer"
    }, /* @__PURE__ */ createElement("box", {
      id: "event-commands-gutter-inner"
    }))), /* @__PURE__ */ createElement("select-box", {
      id: "event-type"
    }), /* @__PURE__ */ createElement("button", {
      id: "event-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "event-cancel",
      name: "cancel"
    }, "Cancel"), /* @__PURE__ */ createElement("button", {
      id: "event-apply",
      name: "apply"
    }, "Apply"))), /* @__PURE__ */ createElement("window-frame", {
      id: "command-widget"
    }, /* @__PURE__ */ createElement("text-box", {
      id: "command-searcher"
    })), /* @__PURE__ */ createElement("node-list", {
      id: "command-suggestions",
      class: "hidden"
    }), /* @__PURE__ */ createElement("node-list", {
      id: "text-suggestions",
      class: "hidden"
    }), /* @__PURE__ */ createElement("window-frame", {
      id: "variableGetter"
    }, /* @__PURE__ */ createElement("title-bar", null, "Variable", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "variableGetter-type"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "variableGetter-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Skill"), /* @__PURE__ */ createElement("custom-box", {
      id: "variableGetter-skill",
      type: "skill"
    }), /* @__PURE__ */ createElement("text", null, "State"), /* @__PURE__ */ createElement("custom-box", {
      id: "variableGetter-state",
      type: "state"
    }), /* @__PURE__ */ createElement("text", null, "Equipment"), /* @__PURE__ */ createElement("custom-box", {
      id: "variableGetter-equipment",
      type: "equipment"
    }), /* @__PURE__ */ createElement("text", null, "Item"), /* @__PURE__ */ createElement("custom-box", {
      id: "variableGetter-item",
      type: "item"
    }), /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "variableGetter-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Key"), /* @__PURE__ */ createElement("text-box", {
      id: "variableGetter-common-key"
    }), /* @__PURE__ */ createElement("text", null, "Key"), /* @__PURE__ */ createElement("select-box", {
      id: "variableGetter-preset-key"
    }), /* @__PURE__ */ createElement("text", null, "Key"), /* @__PURE__ */ createElement("custom-box", {
      id: "variableGetter-global-key",
      type: "global-variable"
    })), /* @__PURE__ */ createElement("button", {
      id: "variableGetter-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "variableGetter-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "actorGetter"
    }, /* @__PURE__ */ createElement("title-bar", null, "Actor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "actorGetter-type"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("select-box", {
      id: "actorGetter-memberId"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "actorGetter-actorId",
      type: "file",
      filter: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Data ID"), /* @__PURE__ */ createElement("custom-box", {
      id: "actorGetter-presetId",
      type: "preset-object",
      filter: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "actorGetter-variable",
      type: "variable",
      filter: "object"
    })), /* @__PURE__ */ createElement("button", {
      id: "actorGetter-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "actorGetter-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "skillGetter"
    }, /* @__PURE__ */ createElement("title-bar", null, "Actor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "skillGetter-type"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "skillGetter-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Shortcut Key"), /* @__PURE__ */ createElement("select-box", {
      id: "skillGetter-key"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "skillGetter-variable",
      type: "variable",
      filter: "object"
    })), /* @__PURE__ */ createElement("button", {
      id: "skillGetter-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "skillGetter-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "stateGetter"
    }, /* @__PURE__ */ createElement("title-bar", null, "Actor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "stateGetter-type"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "stateGetter-variable",
      type: "variable",
      filter: "object"
    })), /* @__PURE__ */ createElement("button", {
      id: "stateGetter-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "stateGetter-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "equipmentGetter"
    }, /* @__PURE__ */ createElement("title-bar", null, "Actor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "equipmentGetter-type"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "equipmentGetter-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Slot"), /* @__PURE__ */ createElement("select-box", {
      id: "equipmentGetter-slot"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "equipmentGetter-variable",
      type: "variable",
      filter: "object"
    })), /* @__PURE__ */ createElement("button", {
      id: "equipmentGetter-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "equipmentGetter-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "itemGetter"
    }, /* @__PURE__ */ createElement("title-bar", null, "Actor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "itemGetter-type"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "itemGetter-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Shortcut Key"), /* @__PURE__ */ createElement("select-box", {
      id: "itemGetter-key"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "itemGetter-variable",
      type: "variable",
      filter: "object"
    })), /* @__PURE__ */ createElement("button", {
      id: "itemGetter-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "itemGetter-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "positionGetter"
    }, /* @__PURE__ */ createElement("title-bar", null, "Position", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "positionGetter-type"
    }), /* @__PURE__ */ createElement("text", null, "X"), /* @__PURE__ */ createElement("number-var", {
      id: "positionGetter-common-x",
      min: "-512",
      max: "512",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Y"), /* @__PURE__ */ createElement("number-var", {
      id: "positionGetter-common-y",
      min: "-512",
      max: "512",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "positionGetter-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Trigger"), /* @__PURE__ */ createElement("custom-box", {
      id: "positionGetter-trigger",
      type: "trigger"
    }), /* @__PURE__ */ createElement("text", null, "Light"), /* @__PURE__ */ createElement("custom-box", {
      id: "positionGetter-light",
      type: "light"
    }), /* @__PURE__ */ createElement("text", null, "Region"), /* @__PURE__ */ createElement("custom-box", {
      id: "positionGetter-regionId",
      type: "preset-object",
      filter: "region"
    })), /* @__PURE__ */ createElement("button", {
      id: "positionGetter-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "positionGetter-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "angleGetter"
    }, /* @__PURE__ */ createElement("title-bar", null, "Angle", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "angleGetter-type"
    }), /* @__PURE__ */ createElement("text", null, "Position"), /* @__PURE__ */ createElement("custom-box", {
      id: "angleGetter-position-position",
      type: "position"
    }), /* @__PURE__ */ createElement("text", null, "Degrees"), /* @__PURE__ */ createElement("number-var", {
      id: "angleGetter-common-degrees",
      min: "-36000",
      max: "36000",
      decimals: "4",
      unit: "deg"
    })), /* @__PURE__ */ createElement("button", {
      id: "angleGetter-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "angleGetter-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "triggerGetter"
    }, /* @__PURE__ */ createElement("title-bar", null, "Trigger", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "triggerGetter-type"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "triggerGetter-variable",
      type: "variable",
      filter: "object"
    })), /* @__PURE__ */ createElement("button", {
      id: "triggerGetter-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "triggerGetter-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "lightGetter"
    }, /* @__PURE__ */ createElement("title-bar", null, "Light", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "lightGetter-type"
    }), /* @__PURE__ */ createElement("text", null, "Light"), /* @__PURE__ */ createElement("custom-box", {
      id: "lightGetter-presetId",
      type: "preset-object",
      filter: "light"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "lightGetter-variable",
      type: "variable",
      filter: "object"
    })), /* @__PURE__ */ createElement("button", {
      id: "lightGetter-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "lightGetter-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "elementGetter"
    }, /* @__PURE__ */ createElement("title-bar", null, "Element", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "elementGetter-type"
    }), /* @__PURE__ */ createElement("text", null, "Ancestor"), /* @__PURE__ */ createElement("custom-box", {
      id: "elementGetter-ancestor",
      type: "ancestor-element"
    }), /* @__PURE__ */ createElement("text", null, "Data ID"), /* @__PURE__ */ createElement("custom-box", {
      id: "elementGetter-presetId",
      type: "preset-element"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "elementGetter-variable",
      type: "variable",
      filter: "object"
    })), /* @__PURE__ */ createElement("button", {
      id: "elementGetter-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "elementGetter-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "ancestorGetter"
    }, /* @__PURE__ */ createElement("title-bar", null, "Element", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "ancestorGetter-type"
    }), /* @__PURE__ */ createElement("text", null, "Data ID"), /* @__PURE__ */ createElement("custom-box", {
      id: "ancestorGetter-presetId",
      type: "preset-element"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "ancestorGetter-variable",
      type: "variable",
      filter: "object"
    })), /* @__PURE__ */ createElement("button", {
      id: "ancestorGetter-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "ancestorGetter-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "arrayList",
      mode: "center"
    }, /* @__PURE__ */ createElement("title-bar", null, "Array", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("param-list", {
      id: "arrayList-list"
    }), /* @__PURE__ */ createElement("button", {
      id: "arrayList-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "arrayList-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "arrayList-number"
    }, /* @__PURE__ */ createElement("title-bar", null, "Number", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("number-box", {
      id: "arrayList-number-value",
      min: "-1000000000",
      max: "1000000000",
      decimals: "10"
    }), /* @__PURE__ */ createElement("button", {
      id: "arrayList-number-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "arrayList-number-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "arrayList-string"
    }, /* @__PURE__ */ createElement("title-bar", null, "String", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("text-area", {
      id: "arrayList-string-value"
    }), /* @__PURE__ */ createElement("button", {
      id: "arrayList-string-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "arrayList-string-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "showText"
    }, /* @__PURE__ */ createElement("title-bar", null, "Show Text", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("custom-box", {
      id: "showText-target",
      type: "actor"
    }), /* @__PURE__ */ createElement("text-box", {
      id: "showText-parameters"
    }), /* @__PURE__ */ createElement("text-area", {
      id: "showText-content",
      menu: "tag-variable"
    }), /* @__PURE__ */ createElement("button", {
      id: "showText-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "showText-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "showChoices"
    }, /* @__PURE__ */ createElement("title-bar", null, "Show Choices", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Choice 1"), /* @__PURE__ */ createElement("text-box", {
      id: "showChoices-choices-0"
    }), /* @__PURE__ */ createElement("text", null, "Choice 2"), /* @__PURE__ */ createElement("text-box", {
      id: "showChoices-choices-1"
    }), /* @__PURE__ */ createElement("text", null, "Choice 3"), /* @__PURE__ */ createElement("text-box", {
      id: "showChoices-choices-2"
    }), /* @__PURE__ */ createElement("text", null, "Choice 4"), /* @__PURE__ */ createElement("text-box", {
      id: "showChoices-choices-3"
    }), /* @__PURE__ */ createElement("text", null, "Parameters"), /* @__PURE__ */ createElement("text-box", {
      id: "showChoices-parameters"
    })), /* @__PURE__ */ createElement("button", {
      id: "showChoices-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "showChoices-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setBoolean"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Boolean", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "setBoolean-variable",
      type: "variable",
      filter: "writable-boolean"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "setBoolean-operation"
    }), /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "setBoolean-operand-type"
    }), /* @__PURE__ */ createElement("text", null, "Constant"), /* @__PURE__ */ createElement("select-box", {
      id: "setBoolean-constant-value"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "setBoolean-common-variable",
      type: "variable",
      filter: "all"
    }), /* @__PURE__ */ createElement("text", null, "Index"), /* @__PURE__ */ createElement("number-var", {
      id: "setBoolean-list-index",
      min: "0",
      max: "1000000000"
    }), /* @__PURE__ */ createElement("text", null, "Param Name"), /* @__PURE__ */ createElement("string-var", {
      id: "setBoolean-parameter-key"
    })), /* @__PURE__ */ createElement("button", {
      id: "setBoolean-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setBoolean-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setNumber"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Number", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "setNumber-variable",
      type: "variable",
      filter: "writable-number"
    }), /* @__PURE__ */ createElement("text", null, "Expression"), /* @__PURE__ */ createElement("param-list", {
      id: "setNumber-operands"
    })), /* @__PURE__ */ createElement("button", {
      id: "setNumber-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setNumber-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setNumber-operand"
    }, /* @__PURE__ */ createElement("title-bar", null, "Number Operand", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "setNumber-operation"
    }), /* @__PURE__ */ createElement("select-box", {
      id: "setNumber-operand-operation"
    }), /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "setNumber-operand-type"
    }), /* @__PURE__ */ createElement("text", null, "Constant"), /* @__PURE__ */ createElement("number-box", {
      id: "setNumber-operand-constant-value",
      min: "-1000000000",
      max: "1000000000",
      decimals: "10"
    }), /* @__PURE__ */ createElement("text", null, "Math Method"), /* @__PURE__ */ createElement("select-box", {
      id: "setNumber-operand-math-method"
    }), /* @__PURE__ */ createElement("text", null, "String Method"), /* @__PURE__ */ createElement("select-box", {
      id: "setNumber-operand-string-method"
    }), /* @__PURE__ */ createElement("text", null, "Property"), /* @__PURE__ */ createElement("select-box", {
      id: "setNumber-operand-object-property"
    }), /* @__PURE__ */ createElement("text", null, "Property"), /* @__PURE__ */ createElement("select-box", {
      id: "setNumber-operand-element-property"
    }), /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "setNumber-operand-element-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "setNumber-operand-common-variable",
      type: "variable",
      filter: "all"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "setNumber-operand-common-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Skill"), /* @__PURE__ */ createElement("custom-box", {
      id: "setNumber-operand-common-skill",
      type: "skill"
    }), /* @__PURE__ */ createElement("text", null, "State"), /* @__PURE__ */ createElement("custom-box", {
      id: "setNumber-operand-common-state",
      type: "state"
    }), /* @__PURE__ */ createElement("text", null, "Equipment"), /* @__PURE__ */ createElement("custom-box", {
      id: "setNumber-operand-common-equipment",
      type: "equipment"
    }), /* @__PURE__ */ createElement("text", null, "Item"), /* @__PURE__ */ createElement("custom-box", {
      id: "setNumber-operand-common-item",
      type: "item"
    }), /* @__PURE__ */ createElement("text", null, "Trigger"), /* @__PURE__ */ createElement("custom-box", {
      id: "setNumber-operand-common-trigger",
      type: "trigger"
    }), /* @__PURE__ */ createElement("text", null, "Item"), /* @__PURE__ */ createElement("custom-box", {
      id: "setNumber-operand-object-itemId",
      type: "file",
      filter: "item"
    }), /* @__PURE__ */ createElement("text", null, "Equipment"), /* @__PURE__ */ createElement("custom-box", {
      id: "setNumber-operand-object-equipmentId",
      type: "file",
      filter: "equipment"
    }), /* @__PURE__ */ createElement("text", null, "Search String"), /* @__PURE__ */ createElement("string-var", {
      id: "setNumber-operand-string-search"
    }), /* @__PURE__ */ createElement("text", null, "Decimal Places"), /* @__PURE__ */ createElement("number-box", {
      id: "setNumber-operand-math-decimals",
      min: "0",
      max: "10"
    }), /* @__PURE__ */ createElement("text", null, "Min"), /* @__PURE__ */ createElement("number-var", {
      id: "setNumber-operand-math-min",
      min: "-1000000000",
      max: "1000000000"
    }), /* @__PURE__ */ createElement("text", null, "Max"), /* @__PURE__ */ createElement("number-var", {
      id: "setNumber-operand-math-max",
      min: "-1000000000",
      max: "1000000000"
    }), /* @__PURE__ */ createElement("text", null, "Start Position"), /* @__PURE__ */ createElement("custom-box", {
      id: "setNumber-operand-math-startPosition",
      type: "position"
    }), /* @__PURE__ */ createElement("text", null, "End Position"), /* @__PURE__ */ createElement("custom-box", {
      id: "setNumber-operand-math-endPosition",
      type: "position"
    }), /* @__PURE__ */ createElement("text", null, "Key"), /* @__PURE__ */ createElement("string-var", {
      id: "setNumber-operand-cooldown-key"
    }), /* @__PURE__ */ createElement("text", null, "Index"), /* @__PURE__ */ createElement("number-var", {
      id: "setNumber-operand-list-index",
      min: "0",
      max: "1000000000"
    }), /* @__PURE__ */ createElement("text", null, "Param Name"), /* @__PURE__ */ createElement("string-var", {
      id: "setNumber-operand-parameter-key"
    }), /* @__PURE__ */ createElement("text", null, "Data"), /* @__PURE__ */ createElement("select-box", {
      id: "setNumber-operand-other-data"
    })), /* @__PURE__ */ createElement("button", {
      id: "setNumber-operand-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setNumber-operand-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setString"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set String", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "setString-variable",
      type: "variable",
      filter: "writable-string"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "setString-operation"
    }), /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "setString-operand-type"
    }), /* @__PURE__ */ createElement("text", null, "Constant"), /* @__PURE__ */ createElement("text-area", {
      id: "setString-operand-constant-value"
    }), /* @__PURE__ */ createElement("text", null, "String Method"), /* @__PURE__ */ createElement("select-box", {
      id: "setString-operand-string-method"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "setString-operand-common-variable",
      type: "variable",
      filter: "all"
    }), /* @__PURE__ */ createElement("text", null, "Index"), /* @__PURE__ */ createElement("number-var", {
      id: "setString-operand-string-char-index",
      min: "0",
      max: "1000000000"
    }), /* @__PURE__ */ createElement("text", null, "Begin Index"), /* @__PURE__ */ createElement("number-var", {
      id: "setString-operand-string-slice-begin",
      min: "-1000000000",
      max: "1000000000"
    }), /* @__PURE__ */ createElement("text", null, "End Index"), /* @__PURE__ */ createElement("number-var", {
      id: "setString-operand-string-slice-end",
      min: "-1000000000",
      max: "1000000000"
    }), /* @__PURE__ */ createElement("text", null, "Target Length"), /* @__PURE__ */ createElement("number-box", {
      id: "setString-operand-string-pad-start-length",
      min: "2",
      max: "10"
    }), /* @__PURE__ */ createElement("text", null, "Pad String"), /* @__PURE__ */ createElement("text-box", {
      id: "setString-operand-string-pad-start-pad"
    }), /* @__PURE__ */ createElement("text", null, "Substring"), /* @__PURE__ */ createElement("string-var", {
      id: "setString-operand-string-replace-pattern"
    }), /* @__PURE__ */ createElement("text", null, "Replacement"), /* @__PURE__ */ createElement("string-var", {
      id: "setString-operand-string-replace-replacement"
    }), /* @__PURE__ */ createElement("text", null, "Enum String"), /* @__PURE__ */ createElement("custom-box", {
      id: "setString-operand-enum-stringId",
      type: "enum-string"
    }), /* @__PURE__ */ createElement("text", null, "Property"), /* @__PURE__ */ createElement("select-box", {
      id: "setString-operand-object-property"
    }), /* @__PURE__ */ createElement("text", null, "Property"), /* @__PURE__ */ createElement("select-box", {
      id: "setString-operand-element-property"
    }), /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "setString-operand-element-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "setString-operand-common-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Skill"), /* @__PURE__ */ createElement("custom-box", {
      id: "setString-operand-common-skill",
      type: "skill"
    }), /* @__PURE__ */ createElement("text", null, "State"), /* @__PURE__ */ createElement("custom-box", {
      id: "setString-operand-common-state",
      type: "state"
    }), /* @__PURE__ */ createElement("text", null, "Equipment"), /* @__PURE__ */ createElement("custom-box", {
      id: "setString-operand-common-equipment",
      type: "equipment"
    }), /* @__PURE__ */ createElement("text", null, "Item"), /* @__PURE__ */ createElement("custom-box", {
      id: "setString-operand-common-item",
      type: "item"
    }), /* @__PURE__ */ createElement("text", null, "File"), /* @__PURE__ */ createElement("custom-box", {
      id: "setString-operand-object-fileId",
      type: "file"
    }), /* @__PURE__ */ createElement("text", null, "Index"), /* @__PURE__ */ createElement("number-var", {
      id: "setString-operand-list-index",
      min: "0",
      max: "1000000000"
    }), /* @__PURE__ */ createElement("text", null, "Param Name"), /* @__PURE__ */ createElement("string-var", {
      id: "setString-operand-parameter-key"
    }), /* @__PURE__ */ createElement("text", null, "Data"), /* @__PURE__ */ createElement("select-box", {
      id: "setString-operand-other-data"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "setString-operand-parse-timestamp-variable",
      type: "variable",
      filter: "number"
    }), /* @__PURE__ */ createElement("text", null, "Date Format"), /* @__PURE__ */ createElement("text-box", {
      id: "setString-operand-parse-timestamp-format"
    }), /* @__PURE__ */ createElement("text", null, "Image Width"), /* @__PURE__ */ createElement("number-box", {
      id: "setString-operand-screenshot-width",
      min: "64",
      max: "3840",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Image Height"), /* @__PURE__ */ createElement("number-box", {
      id: "setString-operand-screenshot-height",
      min: "64",
      max: "3840",
      unit: "px"
    })), /* @__PURE__ */ createElement("button", {
      id: "setString-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setString-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setObject"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Object", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "setObject-variable",
      type: "variable",
      filter: "object"
    }), /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "setObject-operand-type"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "setObject-operand-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Skill"), /* @__PURE__ */ createElement("custom-box", {
      id: "setObject-operand-skill",
      type: "skill"
    }), /* @__PURE__ */ createElement("text", null, "State"), /* @__PURE__ */ createElement("custom-box", {
      id: "setObject-operand-state",
      type: "state"
    }), /* @__PURE__ */ createElement("text", null, "Equipment"), /* @__PURE__ */ createElement("custom-box", {
      id: "setObject-operand-equipment",
      type: "equipment"
    }), /* @__PURE__ */ createElement("text", null, "Item"), /* @__PURE__ */ createElement("custom-box", {
      id: "setObject-operand-item",
      type: "item"
    }), /* @__PURE__ */ createElement("text", null, "Trigger"), /* @__PURE__ */ createElement("custom-box", {
      id: "setObject-operand-trigger",
      type: "trigger"
    }), /* @__PURE__ */ createElement("text", null, "Light"), /* @__PURE__ */ createElement("custom-box", {
      id: "setObject-operand-light",
      type: "light"
    }), /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "setObject-operand-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "setObject-operand-variable",
      type: "variable",
      filter: "object"
    }), /* @__PURE__ */ createElement("text", null, "Index"), /* @__PURE__ */ createElement("number-var", {
      id: "setObject-operand-list-index",
      min: "0",
      max: "1000000000"
    })), /* @__PURE__ */ createElement("button", {
      id: "setObject-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setObject-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setList"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set List", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "setList-variable",
      type: "variable",
      filter: "object"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "setList-operation"
    }), /* @__PURE__ */ createElement("text", null, "Numbers"), /* @__PURE__ */ createElement("custom-box", {
      id: "setList-numbers",
      type: "array",
      filter: "number"
    }), /* @__PURE__ */ createElement("text", null, "Strings"), /* @__PURE__ */ createElement("custom-box", {
      id: "setList-strings",
      type: "array",
      filter: "string"
    }), /* @__PURE__ */ createElement("text", null, "Index"), /* @__PURE__ */ createElement("number-var", {
      id: "setList-index",
      min: "0",
      max: "1000000000"
    }), /* @__PURE__ */ createElement("text", null, "Boolean"), /* @__PURE__ */ createElement("select-box", {
      id: "setList-boolean"
    }), /* @__PURE__ */ createElement("text", null, "Number"), /* @__PURE__ */ createElement("number-box", {
      id: "setList-number",
      min: "-1000000000",
      max: "1000000000",
      decimals: "10"
    }), /* @__PURE__ */ createElement("text", null, "String"), /* @__PURE__ */ createElement("text-area", {
      id: "setList-string"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "setList-operand",
      type: "variable",
      filter: "all"
    }), /* @__PURE__ */ createElement("text", null, "Separator"), /* @__PURE__ */ createElement("string-var", {
      id: "setList-separator"
    })), /* @__PURE__ */ createElement("button", {
      id: "setList-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setList-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "deleteVariable"
    }, /* @__PURE__ */ createElement("title-bar", null, "Delete Variable", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "deleteVariable-variable",
      type: "variable",
      filter: "deletable"
    })), /* @__PURE__ */ createElement("button", {
      id: "deleteVariable-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "deleteVariable-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "if"
    }, /* @__PURE__ */ createElement("title-bar", null, "If", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Branches"), /* @__PURE__ */ createElement("param-list", {
      id: "if-branches"
    })), /* @__PURE__ */ createElement("check-box", {
      id: "if-else",
      class: "standard"
    }, /* @__PURE__ */ createElement("text", {
      id: "if-else-label"
    }, "Else")), /* @__PURE__ */ createElement("button", {
      id: "if-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "if-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "if-branch"
    }, /* @__PURE__ */ createElement("title-bar", null, "Branch", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Mode"), /* @__PURE__ */ createElement("select-box", {
      id: "if-branch-mode"
    }), /* @__PURE__ */ createElement("text", null, "Conditions"), /* @__PURE__ */ createElement("param-list", {
      id: "if-branch-conditions"
    })), /* @__PURE__ */ createElement("button", {
      id: "if-branch-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "if-branch-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "if-condition"
    }, /* @__PURE__ */ createElement("title-bar", null, "Condition", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Condition Type"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-type"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "if-condition-common-variable",
      type: "variable",
      filter: "all"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-boolean-operation"
    }), /* @__PURE__ */ createElement("text", null, "Operand Type"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-boolean-operand-type"
    }), /* @__PURE__ */ createElement("text", null, "Constant"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-boolean-constant-value"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-number-operation"
    }), /* @__PURE__ */ createElement("text", null, "Operand Type"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-number-operand-type"
    }), /* @__PURE__ */ createElement("text", null, "Constant"), /* @__PURE__ */ createElement("number-box", {
      id: "if-condition-number-constant-value",
      min: "-1000000000",
      max: "1000000000",
      decimals: "10"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-string-operation"
    }), /* @__PURE__ */ createElement("text", null, "Operand Type"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-string-operand-type"
    }), /* @__PURE__ */ createElement("text", null, "Constant"), /* @__PURE__ */ createElement("text-area", {
      id: "if-condition-string-constant-value"
    }), /* @__PURE__ */ createElement("text", null, "Enum String"), /* @__PURE__ */ createElement("custom-box", {
      id: "if-condition-string-enum-stringId",
      type: "enum-string"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-object-operation"
    }), /* @__PURE__ */ createElement("text", null, "Operand Type"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-object-operand-type"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-list-operation"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "if-condition-operand-variable",
      type: "variable",
      filter: "all"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "if-condition-common-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Skill"), /* @__PURE__ */ createElement("custom-box", {
      id: "if-condition-common-skill",
      type: "skill"
    }), /* @__PURE__ */ createElement("text", null, "State"), /* @__PURE__ */ createElement("custom-box", {
      id: "if-condition-common-state",
      type: "state"
    }), /* @__PURE__ */ createElement("text", null, "Equipment"), /* @__PURE__ */ createElement("custom-box", {
      id: "if-condition-common-equipment",
      type: "equipment"
    }), /* @__PURE__ */ createElement("text", null, "Item"), /* @__PURE__ */ createElement("custom-box", {
      id: "if-condition-common-item",
      type: "item"
    }), /* @__PURE__ */ createElement("text", null, "Trigger"), /* @__PURE__ */ createElement("custom-box", {
      id: "if-condition-common-trigger",
      type: "trigger"
    }), /* @__PURE__ */ createElement("text", null, "Light"), /* @__PURE__ */ createElement("custom-box", {
      id: "if-condition-common-light",
      type: "light"
    }), /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "if-condition-common-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-actor-operation"
    }), /* @__PURE__ */ createElement("text", null, "Item"), /* @__PURE__ */ createElement("custom-box", {
      id: "if-condition-actor-itemId",
      type: "file",
      filter: "item"
    }), /* @__PURE__ */ createElement("text", null, "Equipment"), /* @__PURE__ */ createElement("custom-box", {
      id: "if-condition-actor-equipmentId",
      type: "file",
      filter: "equipment"
    }), /* @__PURE__ */ createElement("text", null, "Quantity"), /* @__PURE__ */ createElement("number-box", {
      id: "if-condition-actor-quantity",
      min: "1",
      max: "10000"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-element-operation"
    }), /* @__PURE__ */ createElement("text", null, "KeyCode"), /* @__PURE__ */ createElement("keyboard-box", {
      id: "if-condition-keyboard-keycode"
    }), /* @__PURE__ */ createElement("text", null, "State"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-keyboard-state"
    }), /* @__PURE__ */ createElement("text", null, "Button"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-mouse-button"
    }), /* @__PURE__ */ createElement("text", null, "State"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-mouse-state"
    }), /* @__PURE__ */ createElement("text", null, "Other"), /* @__PURE__ */ createElement("select-box", {
      id: "if-condition-other-key"
    })), /* @__PURE__ */ createElement("button", {
      id: "if-condition-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "if-condition-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "switch"
    }, /* @__PURE__ */ createElement("title-bar", null, "Switch", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "switch-variable",
      type: "variable",
      filter: "all"
    }), /* @__PURE__ */ createElement("text", null, "Branches"), /* @__PURE__ */ createElement("param-list", {
      id: "switch-branches"
    })), /* @__PURE__ */ createElement("check-box", {
      id: "switch-default",
      class: "standard"
    }, /* @__PURE__ */ createElement("text", {
      id: "switch-default-label"
    }, "Default")), /* @__PURE__ */ createElement("button", {
      id: "switch-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "switch-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "switch-branch"
    }, /* @__PURE__ */ createElement("title-bar", null, "Branch", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Cases"), /* @__PURE__ */ createElement("param-list", {
      id: "switch-branch-conditions"
    })), /* @__PURE__ */ createElement("button", {
      id: "switch-branch-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "switch-branch-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "switch-condition"
    }, /* @__PURE__ */ createElement("title-bar", null, "Condition", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Condition Type"), /* @__PURE__ */ createElement("select-box", {
      id: "switch-condition-type"
    }), /* @__PURE__ */ createElement("text", null, "Boolean"), /* @__PURE__ */ createElement("select-box", {
      id: "switch-condition-boolean-value"
    }), /* @__PURE__ */ createElement("text", null, "Number"), /* @__PURE__ */ createElement("number-box", {
      id: "switch-condition-number-value",
      min: "-1000000000",
      max: "1000000000",
      decimals: "10"
    }), /* @__PURE__ */ createElement("text", null, "String"), /* @__PURE__ */ createElement("text-area", {
      id: "switch-condition-string-value"
    }), /* @__PURE__ */ createElement("text", null, "Enum String"), /* @__PURE__ */ createElement("custom-box", {
      id: "switch-condition-enum-stringId",
      type: "enum-string"
    }), /* @__PURE__ */ createElement("text", null, "Key"), /* @__PURE__ */ createElement("keyboard-box", {
      id: "switch-condition-keyboard-keycode"
    }), /* @__PURE__ */ createElement("text", null, "Button"), /* @__PURE__ */ createElement("select-box", {
      id: "switch-condition-mouse-button"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "switch-condition-variable-variable",
      type: "variable",
      filter: "all"
    })), /* @__PURE__ */ createElement("button", {
      id: "switch-condition-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "switch-condition-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "loop"
    }, /* @__PURE__ */ createElement("title-bar", null, "Loop", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Mode"), /* @__PURE__ */ createElement("select-box", {
      id: "loop-mode"
    }), /* @__PURE__ */ createElement("text", null, "Conditions"), /* @__PURE__ */ createElement("param-list", {
      id: "loop-conditions"
    })), /* @__PURE__ */ createElement("button", {
      id: "loop-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "loop-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "forEach"
    }, /* @__PURE__ */ createElement("title-bar", null, "For Each", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Data"), /* @__PURE__ */ createElement("select-box", {
      id: "forEach-data"
    }), /* @__PURE__ */ createElement("text", null, "List Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "forEach-list",
      type: "variable",
      filter: "object"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "forEach-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Parent Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "forEach-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Save to Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "forEach-variable",
      type: "variable",
      filter: "object"
    }), /* @__PURE__ */ createElement("text", null, "File Name"), /* @__PURE__ */ createElement("custom-box", {
      id: "forEach-filename",
      type: "variable",
      filter: "string"
    })), /* @__PURE__ */ createElement("button", {
      id: "forEach-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "forEach-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "callEvent"
    }, /* @__PURE__ */ createElement("title-bar", null, "Call Event", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "callEvent-type"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "callEvent-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Skill"), /* @__PURE__ */ createElement("custom-box", {
      id: "callEvent-skill",
      type: "skill"
    }), /* @__PURE__ */ createElement("text", null, "State"), /* @__PURE__ */ createElement("custom-box", {
      id: "callEvent-state",
      type: "state"
    }), /* @__PURE__ */ createElement("text", null, "Equipment"), /* @__PURE__ */ createElement("custom-box", {
      id: "callEvent-equipment",
      type: "equipment"
    }), /* @__PURE__ */ createElement("text", null, "Item"), /* @__PURE__ */ createElement("custom-box", {
      id: "callEvent-item",
      type: "item"
    }), /* @__PURE__ */ createElement("text", null, "Light"), /* @__PURE__ */ createElement("custom-box", {
      id: "callEvent-light",
      type: "light"
    }), /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "callEvent-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Event"), /* @__PURE__ */ createElement("custom-box", {
      id: "callEvent-eventId",
      type: "file",
      filter: "event"
    }), /* @__PURE__ */ createElement("text", null, "Event"), /* @__PURE__ */ createElement("select-box", {
      id: "callEvent-eventType"
    })), /* @__PURE__ */ createElement("button", {
      id: "callEvent-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "callEvent-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setEvent"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Event", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "setEvent-operation"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "setEvent-variable",
      type: "variable",
      filter: "object"
    }), /* @__PURE__ */ createElement("text", null, "Event"), /* @__PURE__ */ createElement("custom-box", {
      id: "setEvent-eventId",
      type: "file",
      filter: "event"
    }), /* @__PURE__ */ createElement("text", null, "Choice"), /* @__PURE__ */ createElement("select-box", {
      id: "setEvent-choiceIndex"
    })), /* @__PURE__ */ createElement("button", {
      id: "setEvent-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setEvent-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "comment"
    }, /* @__PURE__ */ createElement("title-bar", null, "Comment", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("text-area", {
      id: "comment-comment"
    }), /* @__PURE__ */ createElement("button", {
      id: "comment-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "comment-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "label"
    }, /* @__PURE__ */ createElement("title-bar", null, "Label", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Label Name"), /* @__PURE__ */ createElement("text-box", {
      id: "label-name"
    })), /* @__PURE__ */ createElement("button", {
      id: "label-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "label-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "jumpTo"
    }, /* @__PURE__ */ createElement("title-bar", null, "Jump to", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "jumpTo-operation"
    }), /* @__PURE__ */ createElement("text", null, "Label Name"), /* @__PURE__ */ createElement("text-box", {
      id: "jumpTo-label"
    })), /* @__PURE__ */ createElement("button", {
      id: "jumpTo-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "jumpTo-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "wait"
    }, /* @__PURE__ */ createElement("title-bar", null, "Wait", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-var", {
      id: "wait-duration",
      min: "1",
      max: "3600000",
      unit: "ms"
    })), /* @__PURE__ */ createElement("button", {
      id: "wait-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "wait-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "createElement"
    }, /* @__PURE__ */ createElement("title-bar", null, "Create Element", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "createElement-operation"
    }), /* @__PURE__ */ createElement("text", null, "Parent"), /* @__PURE__ */ createElement("custom-box", {
      id: "createElement-parent",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "UI Elements"), /* @__PURE__ */ createElement("custom-box", {
      id: "createElement-uiId",
      type: "file",
      filter: "ui"
    }), /* @__PURE__ */ createElement("text", null, "UI Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "createElement-presetId",
      type: "preset-element"
    })), /* @__PURE__ */ createElement("button", {
      id: "createElement-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "createElement-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setImage"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Image", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "setImage-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Properties"), /* @__PURE__ */ createElement("param-list", {
      id: "setImage-properties"
    })), /* @__PURE__ */ createElement("button", {
      id: "setImage-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setImage-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setImage-property"
    }, /* @__PURE__ */ createElement("title-bar", null, "Image Property", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Property"), /* @__PURE__ */ createElement("select-box", {
      id: "setImage-property-key"
    }), /* @__PURE__ */ createElement("text", null, "Image"), /* @__PURE__ */ createElement("custom-box", {
      id: "setImage-property-image",
      type: "file",
      filter: "image"
    }), /* @__PURE__ */ createElement("text", null, "Display"), /* @__PURE__ */ createElement("select-box", {
      id: "setImage-property-display"
    }), /* @__PURE__ */ createElement("text", null, "Flip"), /* @__PURE__ */ createElement("select-box", {
      id: "setImage-property-flip"
    }), /* @__PURE__ */ createElement("text", null, "Blend"), /* @__PURE__ */ createElement("select-box", {
      id: "setImage-property-blend"
    }), /* @__PURE__ */ createElement("text", null, "Shift X"), /* @__PURE__ */ createElement("number-var", {
      id: "setImage-property-shiftX",
      min: "-10000",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Shift Y"), /* @__PURE__ */ createElement("number-var", {
      id: "setImage-property-shiftY",
      min: "-10000",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Clip - X"), /* @__PURE__ */ createElement("number-var", {
      id: "setImage-property-clip-0",
      min: "0",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Clip - Y"), /* @__PURE__ */ createElement("number-var", {
      id: "setImage-property-clip-1",
      min: "0",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Clip - Width"), /* @__PURE__ */ createElement("number-var", {
      id: "setImage-property-clip-2",
      min: "0",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Clip - Height"), /* @__PURE__ */ createElement("number-var", {
      id: "setImage-property-clip-3",
      min: "0",
      max: "10000",
      unit: "px"
    })), /* @__PURE__ */ createElement("button", {
      id: "setImage-property-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setImage-property-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "loadImage"
    }, /* @__PURE__ */ createElement("title-bar", null, "Load Image", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "loadImage-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "loadImage-type"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "loadImage-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Skill"), /* @__PURE__ */ createElement("custom-box", {
      id: "loadImage-skill",
      type: "skill"
    }), /* @__PURE__ */ createElement("text", null, "State"), /* @__PURE__ */ createElement("custom-box", {
      id: "loadImage-state",
      type: "state"
    }), /* @__PURE__ */ createElement("text", null, "Equipment"), /* @__PURE__ */ createElement("custom-box", {
      id: "loadImage-equipment",
      type: "equipment"
    }), /* @__PURE__ */ createElement("text", null, "Item"), /* @__PURE__ */ createElement("custom-box", {
      id: "loadImage-item",
      type: "item"
    }), /* @__PURE__ */ createElement("text", null, "Variable"), /* @__PURE__ */ createElement("custom-box", {
      id: "loadImage-variable",
      type: "variable",
      filter: "string"
    })), /* @__PURE__ */ createElement("button", {
      id: "loadImage-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "loadImage-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "tintImage"
    }, /* @__PURE__ */ createElement("title-bar", null, "Tint Image", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", {
      id: "tintImage-grid-box"
    }, /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "tintImage-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Mode"), /* @__PURE__ */ createElement("select-box", {
      id: "tintImage-mode"
    }), /* @__PURE__ */ createElement("text", null, "Tint - Red"), /* @__PURE__ */ createElement("number-box", {
      id: "tintImage-tint-0",
      min: "-255",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("text", null, "Tint - Green"), /* @__PURE__ */ createElement("number-box", {
      id: "tintImage-tint-1",
      min: "-255",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("text", null, "Tint - Blue"), /* @__PURE__ */ createElement("number-box", {
      id: "tintImage-tint-2",
      min: "-255",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("text", null, "Tint - Gray"), /* @__PURE__ */ createElement("number-box", {
      id: "tintImage-tint-3",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("text", null, "Easing"), /* @__PURE__ */ createElement("select-box", {
      id: "tintImage-easingId"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-box", {
      id: "tintImage-duration",
      min: "0",
      max: "3600000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "tintImage-wait"
    })), /* @__PURE__ */ createElement("filter-box", {
      id: "tintImage-filter",
      width: "96",
      height: "208"
    }), /* @__PURE__ */ createElement("button", {
      id: "tintImage-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "tintImage-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setText"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Text", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "setText-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Properties"), /* @__PURE__ */ createElement("param-list", {
      id: "setText-properties"
    })), /* @__PURE__ */ createElement("button", {
      id: "setText-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setText-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setText-property"
    }, /* @__PURE__ */ createElement("title-bar", null, "Text Property", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Property"), /* @__PURE__ */ createElement("select-box", {
      id: "setText-property-key"
    }), /* @__PURE__ */ createElement("text", null, "Content"), /* @__PURE__ */ createElement("text-area", {
      id: "setText-property-content",
      menu: "tag-variable"
    }), /* @__PURE__ */ createElement("text", null, "Size"), /* @__PURE__ */ createElement("number-box", {
      id: "setText-property-size",
      min: "10",
      max: "400",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Line Spacing"), /* @__PURE__ */ createElement("number-box", {
      id: "setText-property-lineSpacing",
      min: "-10",
      max: "100",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Letter Spacing"), /* @__PURE__ */ createElement("number-box", {
      id: "setText-property-letterSpacing",
      min: "-10",
      max: "100",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Color"), /* @__PURE__ */ createElement("color-box", {
      id: "setText-property-color"
    }), /* @__PURE__ */ createElement("text", null, "Font"), /* @__PURE__ */ createElement("text-box", {
      id: "setText-property-font"
    }), /* @__PURE__ */ createElement("text", null, "Effect"), /* @__PURE__ */ createElement("select-box", {
      id: "setText-property-effect-type"
    }), /* @__PURE__ */ createElement("text", null, "Shadow X"), /* @__PURE__ */ createElement("number-box", {
      id: "setText-property-effect-shadowOffsetX",
      min: "-9",
      max: "9",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Shadow Y"), /* @__PURE__ */ createElement("number-box", {
      id: "setText-property-effect-shadowOffsetY",
      min: "-9",
      max: "9",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Stroke Width"), /* @__PURE__ */ createElement("number-box", {
      id: "setText-property-effect-strokeWidth",
      min: "1",
      max: "20",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Effect Color"), /* @__PURE__ */ createElement("color-box", {
      id: "setText-property-effect-color"
    }), /* @__PURE__ */ createElement("text", null, "Blend"), /* @__PURE__ */ createElement("select-box", {
      id: "setText-property-blend"
    })), /* @__PURE__ */ createElement("button", {
      id: "setText-property-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setText-property-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setTextBox"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Text Box", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "setTextBox-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Properties"), /* @__PURE__ */ createElement("param-list", {
      id: "setTextBox-properties"
    })), /* @__PURE__ */ createElement("button", {
      id: "setTextBox-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setTextBox-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setTextBox-property"
    }, /* @__PURE__ */ createElement("title-bar", null, "Text Property", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Property"), /* @__PURE__ */ createElement("select-box", {
      id: "setTextBox-property-key"
    }), /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "setTextBox-property-type"
    }), /* @__PURE__ */ createElement("text", null, "Text"), /* @__PURE__ */ createElement("string-var", {
      id: "setTextBox-property-text"
    }), /* @__PURE__ */ createElement("text", null, "Number"), /* @__PURE__ */ createElement("number-var", {
      id: "setTextBox-property-number",
      min: "-1000000000",
      max: "1000000000",
      decimals: "10"
    }), /* @__PURE__ */ createElement("text", null, "Min"), /* @__PURE__ */ createElement("number-var", {
      id: "setTextBox-property-min",
      min: "-1000000000",
      max: "1000000000",
      decimals: "10"
    }), /* @__PURE__ */ createElement("text", null, "Max"), /* @__PURE__ */ createElement("number-var", {
      id: "setTextBox-property-max",
      min: "-1000000000",
      max: "1000000000",
      decimals: "10"
    }), /* @__PURE__ */ createElement("text", null, "Decimal Places"), /* @__PURE__ */ createElement("number-box", {
      id: "setTextBox-property-decimals",
      min: "0",
      max: "10"
    }), /* @__PURE__ */ createElement("text", null, "Color"), /* @__PURE__ */ createElement("color-box", {
      id: "setTextBox-property-color"
    })), /* @__PURE__ */ createElement("button", {
      id: "setTextBox-property-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setTextBox-property-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setDialogBox"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Dialog Box", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "setDialogBox-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Properties"), /* @__PURE__ */ createElement("param-list", {
      id: "setDialogBox-properties"
    })), /* @__PURE__ */ createElement("button", {
      id: "setDialogBox-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setDialogBox-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setDialogBox-property"
    }, /* @__PURE__ */ createElement("title-bar", null, "Dialog Box Property", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Property"), /* @__PURE__ */ createElement("select-box", {
      id: "setDialogBox-property-key"
    }), /* @__PURE__ */ createElement("text", null, "Content"), /* @__PURE__ */ createElement("text-area", {
      id: "setDialogBox-property-content",
      menu: "tag-variable"
    }), /* @__PURE__ */ createElement("text", null, "Interval"), /* @__PURE__ */ createElement("number-box", {
      id: "setDialogBox-property-interval",
      min: "0",
      max: "100",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Size"), /* @__PURE__ */ createElement("number-box", {
      id: "setDialogBox-property-size",
      min: "10",
      max: "400",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Line Spacing"), /* @__PURE__ */ createElement("number-box", {
      id: "setDialogBox-property-lineSpacing",
      min: "-10",
      max: "100",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Letter Spacing"), /* @__PURE__ */ createElement("number-box", {
      id: "setDialogBox-property-letterSpacing",
      min: "-10",
      max: "100",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Color"), /* @__PURE__ */ createElement("color-box", {
      id: "setDialogBox-property-color"
    }), /* @__PURE__ */ createElement("text", null, "Font"), /* @__PURE__ */ createElement("text-box", {
      id: "setDialogBox-property-font"
    }), /* @__PURE__ */ createElement("text", null, "Effect"), /* @__PURE__ */ createElement("select-box", {
      id: "setDialogBox-property-effect-type"
    }), /* @__PURE__ */ createElement("text", null, "Shadow X"), /* @__PURE__ */ createElement("number-box", {
      id: "setDialogBox-property-effect-shadowOffsetX",
      min: "-9",
      max: "9",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Shadow Y"), /* @__PURE__ */ createElement("number-box", {
      id: "setDialogBox-property-effect-shadowOffsetY",
      min: "-9",
      max: "9",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Stroke Width"), /* @__PURE__ */ createElement("number-box", {
      id: "setDialogBox-property-effect-strokeWidth",
      min: "1",
      max: "20",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Effect Color"), /* @__PURE__ */ createElement("color-box", {
      id: "setDialogBox-property-effect-color"
    }), /* @__PURE__ */ createElement("text", null, "Blend"), /* @__PURE__ */ createElement("select-box", {
      id: "setDialogBox-property-blend"
    })), /* @__PURE__ */ createElement("button", {
      id: "setDialogBox-property-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setDialogBox-property-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "controlDialog"
    }, /* @__PURE__ */ createElement("title-bar", null, "Control Dialog", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "controlDialog-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "controlDialog-operation"
    })), /* @__PURE__ */ createElement("button", {
      id: "controlDialog-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "controlDialog-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setProgressBar"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Progress Bar", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "setProgressBar-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Properties"), /* @__PURE__ */ createElement("param-list", {
      id: "setProgressBar-properties"
    })), /* @__PURE__ */ createElement("button", {
      id: "setProgressBar-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setProgressBar-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setProgressBar-property"
    }, /* @__PURE__ */ createElement("title-bar", null, "Image Property", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Property"), /* @__PURE__ */ createElement("select-box", {
      id: "setProgressBar-property-key"
    }), /* @__PURE__ */ createElement("text", null, "Image"), /* @__PURE__ */ createElement("custom-box", {
      id: "setProgressBar-property-image",
      type: "file",
      filter: "image"
    }), /* @__PURE__ */ createElement("text", null, "Display"), /* @__PURE__ */ createElement("select-box", {
      id: "setProgressBar-property-display"
    }), /* @__PURE__ */ createElement("text", null, "Blend"), /* @__PURE__ */ createElement("select-box", {
      id: "setProgressBar-property-blend"
    }), /* @__PURE__ */ createElement("text", null, "Progress"), /* @__PURE__ */ createElement("number-var", {
      id: "setProgressBar-property-progress",
      min: "0",
      max: "1",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Clip - X"), /* @__PURE__ */ createElement("number-var", {
      id: "setProgressBar-property-clip-0",
      min: "0",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Clip - Y"), /* @__PURE__ */ createElement("number-var", {
      id: "setProgressBar-property-clip-1",
      min: "0",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Clip - Width"), /* @__PURE__ */ createElement("number-var", {
      id: "setProgressBar-property-clip-2",
      min: "0",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Clip - Height"), /* @__PURE__ */ createElement("number-var", {
      id: "setProgressBar-property-clip-3",
      min: "0",
      max: "10000",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Color - Red"), /* @__PURE__ */ createElement("number-var", {
      id: "setProgressBar-property-color-0",
      min: "0",
      max: "255"
    }), /* @__PURE__ */ createElement("text", null, "Color - Green"), /* @__PURE__ */ createElement("number-var", {
      id: "setProgressBar-property-color-1",
      min: "0",
      max: "255"
    }), /* @__PURE__ */ createElement("text", null, "Color - Blue"), /* @__PURE__ */ createElement("number-var", {
      id: "setProgressBar-property-color-2",
      min: "0",
      max: "255"
    }), /* @__PURE__ */ createElement("text", null, "Color - Alpha"), /* @__PURE__ */ createElement("number-var", {
      id: "setProgressBar-property-color-3",
      min: "0",
      max: "255"
    })), /* @__PURE__ */ createElement("button", {
      id: "setProgressBar-property-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setProgressBar-property-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "waitForVideo"
    }, /* @__PURE__ */ createElement("title-bar", null, "Wait For Video", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "waitForVideo-element",
      type: "element"
    })), /* @__PURE__ */ createElement("button", {
      id: "waitForVideo-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "waitForVideo-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setElement"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Element", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "setElement-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "setElement-operation"
    })), /* @__PURE__ */ createElement("button", {
      id: "setElement-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setElement-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "nestElement"
    }, /* @__PURE__ */ createElement("title-bar", null, "Nest Element", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Parent Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "nestElement-parent",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Child Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "nestElement-child",
      type: "element"
    })), /* @__PURE__ */ createElement("button", {
      id: "nestElement-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "nestElement-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "moveElement"
    }, /* @__PURE__ */ createElement("title-bar", null, "Move Element", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "moveElement-element",
      type: "element"
    }), /* @__PURE__ */ createElement("text", null, "Properties"), /* @__PURE__ */ createElement("param-list", {
      id: "moveElement-properties"
    }), /* @__PURE__ */ createElement("text", null, "Easing"), /* @__PURE__ */ createElement("select-box", {
      id: "moveElement-easingId"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-box", {
      id: "moveElement-duration",
      min: "0",
      max: "3600000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "moveElement-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "moveElement-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "moveElement-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "moveElement-property"
    }, /* @__PURE__ */ createElement("title-bar", null, "Transform Property", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Property"), /* @__PURE__ */ createElement("select-box", {
      id: "moveElement-property-key"
    }), /* @__PURE__ */ createElement("text", null, "Anchor X"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-anchorX",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Anchor Y"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-anchorY",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "X"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-x",
      min: "-10000",
      max: "10000",
      decimals: "4",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "X2"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-x2",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4",
      unit: "r"
    }), /* @__PURE__ */ createElement("text", null, "Y"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-y",
      min: "-10000",
      max: "10000",
      decimals: "4",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Y2"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-y2",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4",
      unit: "r"
    }), /* @__PURE__ */ createElement("text", null, "Width"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-width",
      min: "-10000",
      max: "10000",
      decimals: "4",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Width2"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-width2",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4",
      unit: "r"
    }), /* @__PURE__ */ createElement("text", null, "Height"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-height",
      min: "-10000",
      max: "10000",
      decimals: "4",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Height2"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-height2",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4",
      unit: "r"
    }), /* @__PURE__ */ createElement("text", null, "Rotation"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-rotation",
      min: "-36000",
      max: "36000",
      decimals: "4",
      unit: "deg"
    }), /* @__PURE__ */ createElement("text", null, "Scale X"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-scaleX",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Scale Y"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-scaleY",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Skew X"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-skewX",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Skew Y"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-skewY",
      min: "-100",
      max: "100",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Opacity"), /* @__PURE__ */ createElement("number-var", {
      id: "moveElement-property-opacity",
      min: "0",
      max: "1",
      step: "0.05",
      decimals: "4"
    })), /* @__PURE__ */ createElement("button", {
      id: "moveElement-property-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "moveElement-property-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "deleteElement"
    }, /* @__PURE__ */ createElement("title-bar", null, "Delete Element", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "deleteElement-operation"
    }), /* @__PURE__ */ createElement("text", null, "Element"), /* @__PURE__ */ createElement("custom-box", {
      id: "deleteElement-element",
      type: "element"
    })), /* @__PURE__ */ createElement("button", {
      id: "deleteElement-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "deleteElement-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "createLight"
    }, /* @__PURE__ */ createElement("title-bar", null, "Create Light", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Light"), /* @__PURE__ */ createElement("custom-box", {
      id: "createLight-presetId",
      type: "preset-object",
      filter: "light"
    }), /* @__PURE__ */ createElement("text", null, "Position"), /* @__PURE__ */ createElement("custom-box", {
      id: "createLight-position",
      type: "position"
    })), /* @__PURE__ */ createElement("button", {
      id: "createLight-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "createLight-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "moveLight"
    }, /* @__PURE__ */ createElement("title-bar", null, "Move Light", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Light"), /* @__PURE__ */ createElement("custom-box", {
      id: "moveLight-light",
      type: "light"
    }), /* @__PURE__ */ createElement("text", null, "Properties"), /* @__PURE__ */ createElement("param-list", {
      id: "moveLight-properties"
    }), /* @__PURE__ */ createElement("text", null, "Easing"), /* @__PURE__ */ createElement("select-box", {
      id: "moveLight-easingId"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-box", {
      id: "moveLight-duration",
      min: "0",
      max: "3600000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "moveLight-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "moveLight-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "moveLight-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "moveLight-property"
    }, /* @__PURE__ */ createElement("title-bar", null, "Point Light Property", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Property"), /* @__PURE__ */ createElement("select-box", {
      id: "moveLight-property-key"
    }), /* @__PURE__ */ createElement("text", null, "X"), /* @__PURE__ */ createElement("number-var", {
      id: "moveLight-property-x",
      min: "0",
      max: "512",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Y"), /* @__PURE__ */ createElement("number-var", {
      id: "moveLight-property-y",
      min: "0",
      max: "512",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Range"), /* @__PURE__ */ createElement("number-var", {
      id: "moveLight-property-range",
      min: "0",
      max: "128",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Intensity"), /* @__PURE__ */ createElement("number-var", {
      id: "moveLight-property-intensity",
      min: "0",
      max: "1",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Anchor X"), /* @__PURE__ */ createElement("number-var", {
      id: "moveLight-property-anchorX",
      min: "0",
      max: "1",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Anchor Y"), /* @__PURE__ */ createElement("number-var", {
      id: "moveLight-property-anchorY",
      min: "0",
      max: "1",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Width"), /* @__PURE__ */ createElement("number-var", {
      id: "moveLight-property-width",
      min: "0",
      max: "128",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Height"), /* @__PURE__ */ createElement("number-var", {
      id: "moveLight-property-height",
      min: "0",
      max: "128",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Angle"), /* @__PURE__ */ createElement("number-var", {
      id: "moveLight-property-angle",
      min: "-36000",
      max: "36000",
      step: "5",
      decimals: "4",
      unit: "deg"
    }), /* @__PURE__ */ createElement("text", null, "Red"), /* @__PURE__ */ createElement("number-var", {
      id: "moveLight-property-red",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("text", null, "Green"), /* @__PURE__ */ createElement("number-var", {
      id: "moveLight-property-green",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("text", null, "Blue"), /* @__PURE__ */ createElement("number-var", {
      id: "moveLight-property-blue",
      min: "0",
      max: "255",
      step: "5"
    })), /* @__PURE__ */ createElement("button", {
      id: "moveLight-property-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "moveLight-property-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "deleteLight"
    }, /* @__PURE__ */ createElement("title-bar", null, "Delete Light", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Light"), /* @__PURE__ */ createElement("custom-box", {
      id: "deleteLight-light",
      type: "light"
    })), /* @__PURE__ */ createElement("button", {
      id: "deleteLight-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "deleteLight-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setState"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set State", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "State"), /* @__PURE__ */ createElement("custom-box", {
      id: "setState-state",
      type: "state"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "setState-operation"
    }), /* @__PURE__ */ createElement("text", null, "Time"), /* @__PURE__ */ createElement("number-var", {
      id: "setState-time",
      min: "0",
      max: "36000000",
      unit: "ms"
    })), /* @__PURE__ */ createElement("button", {
      id: "setState-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setState-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "playAnimation"
    }, /* @__PURE__ */ createElement("title-bar", null, "Play Animation", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Mode"), /* @__PURE__ */ createElement("select-box", {
      id: "playAnimation-mode"
    }), /* @__PURE__ */ createElement("text", null, "Position"), /* @__PURE__ */ createElement("custom-box", {
      id: "playAnimation-position",
      type: "position"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "playAnimation-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Animation"), /* @__PURE__ */ createElement("custom-box", {
      id: "playAnimation-animationId",
      type: "file",
      filter: "animation"
    }), /* @__PURE__ */ createElement("text", null, "Motion"), /* @__PURE__ */ createElement("select-box", {
      id: "playAnimation-motion"
    }), /* @__PURE__ */ createElement("text", null, "Priority"), /* @__PURE__ */ createElement("number-box", {
      id: "playAnimation-priority",
      min: "-100",
      max: "100"
    }), /* @__PURE__ */ createElement("text", null, "Offset Y"), /* @__PURE__ */ createElement("number-box", {
      id: "playAnimation-offsetY",
      min: "-100",
      max: "100",
      unit: "px"
    }), /* @__PURE__ */ createElement("text", null, "Rotation"), /* @__PURE__ */ createElement("number-var", {
      id: "playAnimation-rotation",
      min: "-360",
      max: "360",
      decimals: "4",
      unit: "deg"
    }), /* @__PURE__ */ createElement("text", null, "Mappable"), /* @__PURE__ */ createElement("select-box", {
      id: "playAnimation-mappable"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "playAnimation-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "playAnimation-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "playAnimation-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "playAudio"
    }, /* @__PURE__ */ createElement("title-bar", null, "Play Audio", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "playAudio-type"
    }), /* @__PURE__ */ createElement("text", null, "Audio"), /* @__PURE__ */ createElement("custom-box", {
      id: "playAudio-audio",
      type: "file",
      filter: "audio"
    }), /* @__PURE__ */ createElement("text", null, "Volume"), /* @__PURE__ */ createElement("number-box", {
      id: "playAudio-volume",
      min: "0",
      max: "1",
      step: "0.1",
      decimals: "4"
    })), /* @__PURE__ */ createElement("button", {
      id: "playAudio-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "playAudio-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "stopAudio"
    }, /* @__PURE__ */ createElement("title-bar", null, "Stop Audio", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "stopAudio-type"
    })), /* @__PURE__ */ createElement("button", {
      id: "stopAudio-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "stopAudio-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setVolume"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Volume", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "setVolume-type"
    }), /* @__PURE__ */ createElement("text", null, "Volume"), /* @__PURE__ */ createElement("number-var", {
      id: "setVolume-volume",
      min: "0",
      max: "1",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Easing"), /* @__PURE__ */ createElement("select-box", {
      id: "setVolume-easingId"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-box", {
      id: "setVolume-duration",
      min: "0",
      max: "3600000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "setVolume-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "setVolume-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setVolume-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setPan"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Pan", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "setPan-type"
    }), /* @__PURE__ */ createElement("text", null, "Pan"), /* @__PURE__ */ createElement("number-var", {
      id: "setPan-pan",
      min: "-1",
      max: "1",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Easing"), /* @__PURE__ */ createElement("select-box", {
      id: "setPan-easingId"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-box", {
      id: "setPan-duration",
      min: "0",
      max: "3600000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "setPan-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "setPan-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setPan-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setReverb"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Reverb", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "setReverb-type"
    }), /* @__PURE__ */ createElement("text", null, "Dry"), /* @__PURE__ */ createElement("number-var", {
      id: "setReverb-dry",
      min: "0",
      max: "1",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Wet"), /* @__PURE__ */ createElement("number-var", {
      id: "setReverb-wet",
      min: "0",
      max: "1",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Easing"), /* @__PURE__ */ createElement("select-box", {
      id: "setReverb-easingId"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-box", {
      id: "setReverb-duration",
      min: "0",
      max: "3600000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "setReverb-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "setReverb-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setReverb-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setLoop"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Loop", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "setLoop-type"
    }), /* @__PURE__ */ createElement("text", null, "Loop"), /* @__PURE__ */ createElement("select-box", {
      id: "setLoop-loop"
    })), /* @__PURE__ */ createElement("button", {
      id: "setLoop-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setLoop-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "saveAudio"
    }, /* @__PURE__ */ createElement("title-bar", null, "Save Audio", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "saveAudio-type"
    })), /* @__PURE__ */ createElement("button", {
      id: "saveAudio-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "saveAudio-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "restoreAudio"
    }, /* @__PURE__ */ createElement("title-bar", null, "Restore Audio", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "restoreAudio-type"
    })), /* @__PURE__ */ createElement("button", {
      id: "restoreAudio-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "restoreAudio-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "createActor"
    }, /* @__PURE__ */ createElement("title-bar", null, "Create Actor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "createActor-actorId",
      type: "file",
      filter: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Team"), /* @__PURE__ */ createElement("select-box", {
      id: "createActor-teamId"
    }), /* @__PURE__ */ createElement("text", null, "Position"), /* @__PURE__ */ createElement("custom-box", {
      id: "createActor-position",
      type: "position"
    }), /* @__PURE__ */ createElement("text", null, "Angle"), /* @__PURE__ */ createElement("number-var", {
      id: "createActor-angle",
      min: "-360",
      max: "360",
      decimals: "4",
      unit: "deg"
    })), /* @__PURE__ */ createElement("button", {
      id: "createActor-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "createActor-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "moveActor"
    }, /* @__PURE__ */ createElement("title-bar", null, "Move Actor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "moveActor-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Mode"), /* @__PURE__ */ createElement("select-box", {
      id: "moveActor-mode"
    }), /* @__PURE__ */ createElement("text", null, "Angle"), /* @__PURE__ */ createElement("number-var", {
      id: "moveActor-angle",
      min: "-360",
      max: "360",
      decimals: "4",
      unit: "deg"
    }), /* @__PURE__ */ createElement("text", null, "Destination"), /* @__PURE__ */ createElement("custom-box", {
      id: "moveActor-destination",
      type: "position"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "moveActor-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "moveActor-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "moveActor-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "followActor"
    }, /* @__PURE__ */ createElement("title-bar", null, "Follow Actor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "followActor-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Target"), /* @__PURE__ */ createElement("custom-box", {
      id: "followActor-target",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Mode"), /* @__PURE__ */ createElement("select-box", {
      id: "followActor-mode"
    }), /* @__PURE__ */ createElement("text", null, "Min Distance"), /* @__PURE__ */ createElement("number-box", {
      id: "followActor-minDist",
      min: "0",
      max: "16",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Max Distance"), /* @__PURE__ */ createElement("number-box", {
      id: "followActor-maxDist",
      min: "0",
      max: "20",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Offset Ratio"), /* @__PURE__ */ createElement("number-box", {
      id: "followActor-offset",
      min: "-0.8",
      max: "0.8",
      decimals: "4",
      unit: "r"
    }), /* @__PURE__ */ createElement("text", null, "Vert Distance"), /* @__PURE__ */ createElement("number-box", {
      id: "followActor-vertDist",
      min: "0",
      max: "4",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Navigate"), /* @__PURE__ */ createElement("select-box", {
      id: "followActor-navigate"
    }), /* @__PURE__ */ createElement("text", null, "Once"), /* @__PURE__ */ createElement("select-box", {
      id: "followActor-once"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "followActor-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "followActor-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "followActor-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "translateActor"
    }, /* @__PURE__ */ createElement("title-bar", null, "Translate Actor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "translateActor-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Angle"), /* @__PURE__ */ createElement("custom-box", {
      id: "translateActor-angle",
      type: "angle"
    }), /* @__PURE__ */ createElement("text", null, "Distance"), /* @__PURE__ */ createElement("number-var", {
      id: "translateActor-distance",
      min: "0",
      max: "512",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Easing"), /* @__PURE__ */ createElement("select-box", {
      id: "translateActor-easingId"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-var", {
      id: "translateActor-duration",
      min: "0",
      max: "3600000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "translateActor-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "translateActor-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "translateActor-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "changeThreat"
    }, /* @__PURE__ */ createElement("title-bar", null, "Change Threat", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "changeThreat-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Target"), /* @__PURE__ */ createElement("custom-box", {
      id: "changeThreat-target",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "changeThreat-operation"
    }), /* @__PURE__ */ createElement("text", null, "Threat"), /* @__PURE__ */ createElement("number-var", {
      id: "changeThreat-threat",
      min: "0",
      max: "1000000000",
      decimals: "4"
    })), /* @__PURE__ */ createElement("button", {
      id: "changeThreat-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "changeThreat-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setWeight"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Weight", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "setWeight-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Weight"), /* @__PURE__ */ createElement("number-var", {
      id: "setWeight-weight",
      min: "0",
      max: "8",
      step: "0.1",
      decimals: "4"
    })), /* @__PURE__ */ createElement("button", {
      id: "setWeight-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setWeight-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setMovementSpeed"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Movement Speed", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "setMovementSpeed-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Property"), /* @__PURE__ */ createElement("select-box", {
      id: "setMovementSpeed-property"
    }), /* @__PURE__ */ createElement("text", null, "Base Speed"), /* @__PURE__ */ createElement("number-var", {
      id: "setMovementSpeed-base",
      min: "0",
      max: "32",
      decimals: "4",
      unit: "t/s"
    }), /* @__PURE__ */ createElement("text", null, "Speed Factor"), /* @__PURE__ */ createElement("number-var", {
      id: "setMovementSpeed-factor",
      min: "0",
      max: "4",
      decimals: "4"
    })), /* @__PURE__ */ createElement("button", {
      id: "setMovementSpeed-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setMovementSpeed-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setAngle"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Angle", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "setAngle-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Angle"), /* @__PURE__ */ createElement("custom-box", {
      id: "setAngle-angle",
      type: "angle"
    }), /* @__PURE__ */ createElement("text", null, "Easing"), /* @__PURE__ */ createElement("select-box", {
      id: "setAngle-easingId"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-var", {
      id: "setAngle-duration",
      min: "0",
      max: "3600000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "setAngle-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "setAngle-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setAngle-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "fixAngle"
    }, /* @__PURE__ */ createElement("title-bar", null, "Fix Angle", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "fixAngle-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "State"), /* @__PURE__ */ createElement("select-box", {
      id: "fixAngle-fixed"
    })), /* @__PURE__ */ createElement("button", {
      id: "fixAngle-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "fixAngle-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setActive"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Active", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "setActive-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "State"), /* @__PURE__ */ createElement("select-box", {
      id: "setActive-active"
    })), /* @__PURE__ */ createElement("button", {
      id: "setActive-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setActive-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "deleteActor"
    }, /* @__PURE__ */ createElement("title-bar", null, "Delete Actor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "deleteActor-actor",
      type: "actor"
    })), /* @__PURE__ */ createElement("button", {
      id: "deleteActor-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "deleteActor-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "changeActorTeam"
    }, /* @__PURE__ */ createElement("title-bar", null, "Change Actor Team", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "changeActorTeam-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Team"), /* @__PURE__ */ createElement("select-box", {
      id: "changeActorTeam-teamId"
    })), /* @__PURE__ */ createElement("button", {
      id: "changeActorTeam-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "changeActorTeam-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "changeActorState"
    }, /* @__PURE__ */ createElement("title-bar", null, "Change Actor State", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "changeActorState-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "changeActorState-operation"
    }), /* @__PURE__ */ createElement("text", null, "State"), /* @__PURE__ */ createElement("custom-box", {
      id: "changeActorState-stateId",
      type: "file",
      filter: "state"
    }), /* @__PURE__ */ createElement("text", null, "State"), /* @__PURE__ */ createElement("custom-box", {
      id: "changeActorState-state",
      type: "state"
    })), /* @__PURE__ */ createElement("button", {
      id: "changeActorState-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "changeActorState-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "changeActorEquipment"
    }, /* @__PURE__ */ createElement("title-bar", null, "Change Actor Equipment", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "changeActorEquipment-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "changeActorEquipment-operation"
    }), /* @__PURE__ */ createElement("text", null, "Shortcut Key"), /* @__PURE__ */ createElement("select-box", {
      id: "changeActorEquipment-slot"
    }), /* @__PURE__ */ createElement("text", null, "Equipment"), /* @__PURE__ */ createElement("custom-box", {
      id: "changeActorEquipment-equipment",
      type: "equipment"
    })), /* @__PURE__ */ createElement("button", {
      id: "changeActorEquipment-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "changeActorEquipment-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "changeActorSkill"
    }, /* @__PURE__ */ createElement("title-bar", null, "Change Actor Skill", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "changeActorSkill-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "changeActorSkill-operation"
    }), /* @__PURE__ */ createElement("text", null, "Skill"), /* @__PURE__ */ createElement("custom-box", {
      id: "changeActorSkill-skillId",
      type: "file",
      filter: "skill"
    }), /* @__PURE__ */ createElement("text", null, "Skill"), /* @__PURE__ */ createElement("custom-box", {
      id: "changeActorSkill-skill",
      type: "skill"
    })), /* @__PURE__ */ createElement("button", {
      id: "changeActorSkill-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "changeActorSkill-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "changeActorSprite"
    }, /* @__PURE__ */ createElement("title-bar", null, "Change Actor Sprite", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "changeActorSprite-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Animation"), /* @__PURE__ */ createElement("custom-box", {
      id: "changeActorSprite-animationId",
      type: "file",
      filter: "animation"
    }), /* @__PURE__ */ createElement("text", null, "Sprite Name"), /* @__PURE__ */ createElement("select-box", {
      id: "changeActorSprite-spriteId"
    }), /* @__PURE__ */ createElement("text", null, "Sprite"), /* @__PURE__ */ createElement("custom-box", {
      id: "changeActorSprite-image",
      type: "file",
      filter: "image"
    })), /* @__PURE__ */ createElement("button", {
      id: "changeActorSprite-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "changeActorSprite-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "remapActorMotion"
    }, /* @__PURE__ */ createElement("title-bar", null, "Remap Actor Motion", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "remapActorMotion-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "remapActorMotion-type"
    }), /* @__PURE__ */ createElement("text", null, "Motion"), /* @__PURE__ */ createElement("custom-box", {
      id: "remapActorMotion-motion",
      type: "enum-string"
    })), /* @__PURE__ */ createElement("button", {
      id: "remapActorMotion-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "remapActorMotion-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "playActorAnimation"
    }, /* @__PURE__ */ createElement("title-bar", null, "Play Actor Animation", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "playActorAnimation-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Motion"), /* @__PURE__ */ createElement("custom-box", {
      id: "playActorAnimation-motion",
      type: "enum-string"
    }), /* @__PURE__ */ createElement("text", null, "Playback Speed"), /* @__PURE__ */ createElement("number-var", {
      id: "playActorAnimation-speed",
      min: "0",
      max: "4",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "playActorAnimation-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "playActorAnimation-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "playActorAnimation-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "stopActorAnimation"
    }, /* @__PURE__ */ createElement("title-bar", null, "Play Actor Animation", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "stopActorAnimation-actor",
      type: "actor"
    })), /* @__PURE__ */ createElement("button", {
      id: "stopActorAnimation-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "stopActorAnimation-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "createGlobalActor"
    }, /* @__PURE__ */ createElement("title-bar", null, "Create Global Actor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "createGlobalActor-actorId",
      type: "file",
      filter: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Team"), /* @__PURE__ */ createElement("select-box", {
      id: "createGlobalActor-teamId"
    })), /* @__PURE__ */ createElement("button", {
      id: "createGlobalActor-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "createGlobalActor-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "placeGlobalActor"
    }, /* @__PURE__ */ createElement("title-bar", null, "Place Global Actor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "placeGlobalActor-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Position"), /* @__PURE__ */ createElement("custom-box", {
      id: "placeGlobalActor-position",
      type: "position"
    })), /* @__PURE__ */ createElement("button", {
      id: "placeGlobalActor-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "placeGlobalActor-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "deleteGlobalActor"
    }, /* @__PURE__ */ createElement("title-bar", null, "Delete Global Actor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "deleteGlobalActor-actorId",
      type: "file",
      filter: "actor"
    })), /* @__PURE__ */ createElement("button", {
      id: "deleteGlobalActor-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "deleteGlobalActor-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "getTarget"
    }, /* @__PURE__ */ createElement("title-bar", null, "Get Target", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "getTarget-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Selector"), /* @__PURE__ */ createElement("select-box", {
      id: "getTarget-selector"
    }), /* @__PURE__ */ createElement("text", null, "Condition"), /* @__PURE__ */ createElement("select-box", {
      id: "getTarget-condition"
    }), /* @__PURE__ */ createElement("text", null, "Attribute"), /* @__PURE__ */ createElement("select-box", {
      id: "getTarget-attribute"
    }), /* @__PURE__ */ createElement("text", null, "Attribute 2"), /* @__PURE__ */ createElement("select-box", {
      id: "getTarget-divisor"
    })), /* @__PURE__ */ createElement("button", {
      id: "getTarget-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "getTarget-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "detectTargets"
    }, /* @__PURE__ */ createElement("title-bar", null, "Detect Targets", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "detectTargets-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Distance"), /* @__PURE__ */ createElement("number-box", {
      id: "detectTargets-distance",
      min: "0",
      max: "512",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Selector"), /* @__PURE__ */ createElement("select-box", {
      id: "detectTargets-selector"
    }), /* @__PURE__ */ createElement("text", null, "In Sight"), /* @__PURE__ */ createElement("select-box", {
      id: "detectTargets-inSight"
    })), /* @__PURE__ */ createElement("button", {
      id: "detectTargets-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "detectTargets-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "discardTargets"
    }, /* @__PURE__ */ createElement("title-bar", null, "Discard Targets", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "discardTargets-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Distance"), /* @__PURE__ */ createElement("number-box", {
      id: "discardTargets-distance",
      min: "0",
      max: "512",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Selector"), /* @__PURE__ */ createElement("select-box", {
      id: "discardTargets-selector"
    })), /* @__PURE__ */ createElement("button", {
      id: "discardTargets-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "discardTargets-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "resetTargets"
    }, /* @__PURE__ */ createElement("title-bar", null, "Reset Targets", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "resetTargets-actor",
      type: "actor"
    })), /* @__PURE__ */ createElement("button", {
      id: "resetTargets-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "resetTargets-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "castSkill"
    }, /* @__PURE__ */ createElement("title-bar", null, "Cast Skill", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "castSkill-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Mode"), /* @__PURE__ */ createElement("select-box", {
      id: "castSkill-mode"
    }), /* @__PURE__ */ createElement("text", null, "Shortcut Key"), /* @__PURE__ */ createElement("select-box", {
      id: "castSkill-key"
    }), /* @__PURE__ */ createElement("text", null, "Skill"), /* @__PURE__ */ createElement("custom-box", {
      id: "castSkill-skillId",
      type: "file",
      filter: "skill"
    }), /* @__PURE__ */ createElement("text", null, "Skill"), /* @__PURE__ */ createElement("custom-box", {
      id: "castSkill-skill",
      type: "skill"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "castSkill-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "castSkill-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "castSkill-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setSkill"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Skill", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Skill"), /* @__PURE__ */ createElement("custom-box", {
      id: "setSkill-skill",
      type: "skill"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "setSkill-operation"
    }), /* @__PURE__ */ createElement("text", null, "Cooldown"), /* @__PURE__ */ createElement("number-var", {
      id: "setSkill-cooldown",
      min: "1",
      max: "3600000",
      unit: "ms"
    })), /* @__PURE__ */ createElement("button", {
      id: "setSkill-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setSkill-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "createTrigger"
    }, /* @__PURE__ */ createElement("title-bar", null, "Create Trigger", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Trigger"), /* @__PURE__ */ createElement("custom-box", {
      id: "createTrigger-triggerId",
      type: "file",
      filter: "trigger"
    }), /* @__PURE__ */ createElement("text", null, "Caster"), /* @__PURE__ */ createElement("custom-box", {
      id: "createTrigger-caster",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Origin"), /* @__PURE__ */ createElement("custom-box", {
      id: "createTrigger-origin",
      type: "position"
    }), /* @__PURE__ */ createElement("text", null, "Angle"), /* @__PURE__ */ createElement("custom-box", {
      id: "createTrigger-angle",
      type: "angle"
    }), /* @__PURE__ */ createElement("text", null, "Distance"), /* @__PURE__ */ createElement("number-var", {
      id: "createTrigger-distance",
      min: "-512",
      max: "512",
      decimals: "4",
      unit: "tile"
    }), /* @__PURE__ */ createElement("text", null, "Global Speed"), /* @__PURE__ */ createElement("number-var", {
      id: "createTrigger-timeScale",
      min: "0",
      max: "4",
      step: "0.1",
      decimals: "4"
    })), /* @__PURE__ */ createElement("button", {
      id: "createTrigger-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "createTrigger-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setTriggerSpeed"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Trigger Speed", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Trigger"), /* @__PURE__ */ createElement("custom-box", {
      id: "setTriggerSpeed-trigger",
      type: "trigger"
    }), /* @__PURE__ */ createElement("text", null, "Speed"), /* @__PURE__ */ createElement("number-var", {
      id: "setTriggerSpeed-speed",
      min: "0",
      max: "512",
      decimals: "4",
      unit: "t/s"
    })), /* @__PURE__ */ createElement("button", {
      id: "setTriggerSpeed-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setTriggerSpeed-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setTriggerAngle"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Trigger Angle", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Trigger"), /* @__PURE__ */ createElement("custom-box", {
      id: "setTriggerAngle-trigger",
      type: "trigger"
    }), /* @__PURE__ */ createElement("text", null, "Angle"), /* @__PURE__ */ createElement("custom-box", {
      id: "setTriggerAngle-angle",
      type: "angle"
    })), /* @__PURE__ */ createElement("button", {
      id: "setTriggerAngle-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setTriggerAngle-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setBag"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Bag", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "setBag-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "setBag-operation"
    }), /* @__PURE__ */ createElement("text", null, "Money"), /* @__PURE__ */ createElement("number-var", {
      id: "setBag-money",
      min: "1",
      max: "100000000"
    }), /* @__PURE__ */ createElement("text", null, "Item"), /* @__PURE__ */ createElement("file-var", {
      id: "setBag-itemId",
      type: "file",
      filter: "item"
    }), /* @__PURE__ */ createElement("text", null, "Quantity"), /* @__PURE__ */ createElement("number-var", {
      id: "setBag-quantity",
      min: "1",
      max: "10000"
    }), /* @__PURE__ */ createElement("text", null, "Equipment"), /* @__PURE__ */ createElement("file-var", {
      id: "setBag-equipmentId",
      type: "file",
      filter: "equipment"
    }), /* @__PURE__ */ createElement("text", null, "Equipment"), /* @__PURE__ */ createElement("custom-box", {
      id: "setBag-equipment",
      type: "equipment"
    }), /* @__PURE__ */ createElement("text", null, "Index A"), /* @__PURE__ */ createElement("number-var", {
      id: "setBag-index1",
      min: "0",
      max: "10000"
    }), /* @__PURE__ */ createElement("text", null, "Index B"), /* @__PURE__ */ createElement("number-var", {
      id: "setBag-index2",
      min: "0",
      max: "10000"
    }), /* @__PURE__ */ createElement("text", null, "Global Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "setBag-refActor",
      type: "actor"
    })), /* @__PURE__ */ createElement("button", {
      id: "setBag-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setBag-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "useItem"
    }, /* @__PURE__ */ createElement("title-bar", null, "Use Item", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "useItem-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Mode"), /* @__PURE__ */ createElement("select-box", {
      id: "useItem-mode"
    }), /* @__PURE__ */ createElement("text", null, "Shortcut Key"), /* @__PURE__ */ createElement("select-box", {
      id: "useItem-key"
    }), /* @__PURE__ */ createElement("text", null, "Item"), /* @__PURE__ */ createElement("custom-box", {
      id: "useItem-itemId",
      type: "file",
      filter: "item"
    }), /* @__PURE__ */ createElement("text", null, "Item"), /* @__PURE__ */ createElement("custom-box", {
      id: "useItem-item",
      type: "item"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "useItem-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "useItem-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "useItem-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setItem"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Item", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Item"), /* @__PURE__ */ createElement("custom-box", {
      id: "setItem-item",
      type: "item"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "setItem-operation"
    }), /* @__PURE__ */ createElement("text", null, "Quantity"), /* @__PURE__ */ createElement("number-var", {
      id: "setItem-quantity",
      min: "1",
      max: "10000"
    })), /* @__PURE__ */ createElement("button", {
      id: "setItem-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setItem-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setCooldown"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Cooldown", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "setCooldown-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "setCooldown-operation"
    }), /* @__PURE__ */ createElement("text", null, "Cooldown Key"), /* @__PURE__ */ createElement("select-var", {
      id: "setCooldown-key"
    }), /* @__PURE__ */ createElement("text", null, "Cooldown Time"), /* @__PURE__ */ createElement("number-var", {
      id: "setCooldown-cooldown",
      min: "1",
      max: "3600000",
      unit: "ms"
    })), /* @__PURE__ */ createElement("button", {
      id: "setCooldown-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setCooldown-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setShortcut"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Shortcut", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "setShortcut-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "setShortcut-operation"
    }), /* @__PURE__ */ createElement("text", null, "Item"), /* @__PURE__ */ createElement("custom-box", {
      id: "setShortcut-item",
      type: "item"
    }), /* @__PURE__ */ createElement("text", null, "Skill"), /* @__PURE__ */ createElement("custom-box", {
      id: "setShortcut-skill",
      type: "skill"
    }), /* @__PURE__ */ createElement("text", null, "Shortcut Key"), /* @__PURE__ */ createElement("select-box", {
      id: "setShortcut-key"
    })), /* @__PURE__ */ createElement("button", {
      id: "setShortcut-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setShortcut-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "activateScene"
    }, /* @__PURE__ */ createElement("title-bar", null, "Activate Scene", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Scene"), /* @__PURE__ */ createElement("select-box", {
      id: "activateScene-pointer"
    })), /* @__PURE__ */ createElement("button", {
      id: "activateScene-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "activateScene-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "loadScene"
    }, /* @__PURE__ */ createElement("title-bar", null, "Load Scene", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Type"), /* @__PURE__ */ createElement("select-box", {
      id: "loadScene-type"
    }), /* @__PURE__ */ createElement("text", null, "Scene"), /* @__PURE__ */ createElement("custom-box", {
      id: "loadScene-sceneId",
      type: "file",
      filter: "scene"
    })), /* @__PURE__ */ createElement("button", {
      id: "loadScene-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "loadScene-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "moveCamera"
    }, /* @__PURE__ */ createElement("title-bar", null, "Move Camera", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Mode"), /* @__PURE__ */ createElement("select-box", {
      id: "moveCamera-mode"
    }), /* @__PURE__ */ createElement("text", null, "Position"), /* @__PURE__ */ createElement("custom-box", {
      id: "moveCamera-position",
      type: "position"
    }), /* @__PURE__ */ createElement("text", null, "Actor"), /* @__PURE__ */ createElement("custom-box", {
      id: "moveCamera-actor",
      type: "actor"
    }), /* @__PURE__ */ createElement("text", null, "Easing"), /* @__PURE__ */ createElement("select-box", {
      id: "moveCamera-easingId"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-box", {
      id: "moveCamera-duration",
      min: "0",
      max: "3600000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "moveCamera-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "moveCamera-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "moveCamera-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setZoomFactor"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Zoom Factor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Zoom Factor"), /* @__PURE__ */ createElement("number-var", {
      id: "setZoomFactor-zoom",
      min: "1",
      max: "8",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Easing"), /* @__PURE__ */ createElement("select-box", {
      id: "setZoomFactor-easingId"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-var", {
      id: "setZoomFactor-duration",
      min: "0",
      max: "3600000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "setZoomFactor-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "setZoomFactor-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setZoomFactor-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setAmbientLight"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Ambient Light", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Red"), /* @__PURE__ */ createElement("number-var", {
      id: "setAmbientLight-red",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("text", null, "Green"), /* @__PURE__ */ createElement("number-var", {
      id: "setAmbientLight-green",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("text", null, "Blue"), /* @__PURE__ */ createElement("number-var", {
      id: "setAmbientLight-blue",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("text", null, "Easing"), /* @__PURE__ */ createElement("select-box", {
      id: "setAmbientLight-easingId"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-var", {
      id: "setAmbientLight-duration",
      min: "0",
      max: "3600000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "setAmbientLight-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "setAmbientLight-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setAmbientLight-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "tintScreen"
    }, /* @__PURE__ */ createElement("title-bar", null, "Tint Screen", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", {
      id: "tintScreen-grid-box"
    }, /* @__PURE__ */ createElement("text", null, "Tint - Red"), /* @__PURE__ */ createElement("number-box", {
      id: "tintScreen-tint-0",
      min: "-255",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("text", null, "Tint - Green"), /* @__PURE__ */ createElement("number-box", {
      id: "tintScreen-tint-1",
      min: "-255",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("text", null, "Tint - Blue"), /* @__PURE__ */ createElement("number-box", {
      id: "tintScreen-tint-2",
      min: "-255",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("text", null, "Tint - Gray"), /* @__PURE__ */ createElement("number-box", {
      id: "tintScreen-tint-3",
      min: "0",
      max: "255",
      step: "5"
    }), /* @__PURE__ */ createElement("text", null, "Easing"), /* @__PURE__ */ createElement("select-box", {
      id: "tintScreen-easingId"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-box", {
      id: "tintScreen-duration",
      min: "0",
      max: "3600000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "tintScreen-wait"
    })), /* @__PURE__ */ createElement("filter-box", {
      id: "tintScreen-filter",
      width: "96",
      height: "160"
    }), /* @__PURE__ */ createElement("button", {
      id: "tintScreen-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "tintScreen-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setGameSpeed"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Game Speed", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Speed"), /* @__PURE__ */ createElement("number-var", {
      id: "setGameSpeed-speed",
      min: "0",
      max: "10",
      step: "0.1",
      decimals: "4"
    }), /* @__PURE__ */ createElement("text", null, "Easing"), /* @__PURE__ */ createElement("select-box", {
      id: "setGameSpeed-easingId"
    }), /* @__PURE__ */ createElement("text", null, "Duration"), /* @__PURE__ */ createElement("number-var", {
      id: "setGameSpeed-duration",
      min: "0",
      max: "3600000",
      unit: "ms"
    }), /* @__PURE__ */ createElement("text", null, "Wait"), /* @__PURE__ */ createElement("select-box", {
      id: "setGameSpeed-wait"
    })), /* @__PURE__ */ createElement("button", {
      id: "setGameSpeed-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setGameSpeed-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setCursor"
    }, /* @__PURE__ */ createElement("title-bar", null, "Set Cursor", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Image"), /* @__PURE__ */ createElement("custom-box", {
      id: "setCursor-image",
      type: "file",
      filter: "image"
    })), /* @__PURE__ */ createElement("button", {
      id: "setCursor-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setCursor-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "setTeamRelation"
    }, /* @__PURE__ */ createElement("title-bar", null, "Change Team Relation", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Team A"), /* @__PURE__ */ createElement("select-box", {
      id: "setTeamRelation-teamId1"
    }), /* @__PURE__ */ createElement("text", null, "Team B"), /* @__PURE__ */ createElement("select-box", {
      id: "setTeamRelation-teamId2"
    }), /* @__PURE__ */ createElement("text", null, "Relation"), /* @__PURE__ */ createElement("select-box", {
      id: "setTeamRelation-relation"
    })), /* @__PURE__ */ createElement("button", {
      id: "setTeamRelation-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "setTeamRelation-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "switchCollisionSystem"
    }, /* @__PURE__ */ createElement("title-bar", null, "Switch Collision System", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "switchCollisionSystem-operation"
    })), /* @__PURE__ */ createElement("button", {
      id: "switchCollisionSystem-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "switchCollisionSystem-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "gameData"
    }, /* @__PURE__ */ createElement("title-bar", null, "Game Data", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("grid-box", null, /* @__PURE__ */ createElement("text", null, "Operation"), /* @__PURE__ */ createElement("select-box", {
      id: "gameData-operation"
    }), /* @__PURE__ */ createElement("text", null, "File Name"), /* @__PURE__ */ createElement("string-var", {
      id: "gameData-filename"
    }), /* @__PURE__ */ createElement("text", null, "Variables"), /* @__PURE__ */ createElement("text-box", {
      id: "gameData-variables"
    })), /* @__PURE__ */ createElement("button", {
      id: "gameData-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "gameData-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "script"
    }, /* @__PURE__ */ createElement("title-bar", null, "Run Script", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("text-area", {
      id: "script-script"
    }), /* @__PURE__ */ createElement("button", {
      id: "script-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "script-cancel",
      name: "cancel"
    }, "Cancel"))), /* @__PURE__ */ createElement("window-frame", {
      id: "scriptCommand"
    }, /* @__PURE__ */ createElement("title-bar", null, "Custom Command", /* @__PURE__ */ createElement("close", null)), /* @__PURE__ */ createElement("content-frame", null, /* @__PURE__ */ createElement("parameter-pane", {
      id: "scriptCommand-parameter-pane"
    }, /* @__PURE__ */ createElement("detail-box", {
      id: "scriptCommand-parameter-detail",
      open: true
    }, /* @__PURE__ */ createElement("detail-grid", {
      id: "scriptCommand-parameter-grid"
    }))), /* @__PURE__ */ createElement("button", {
      id: "scriptCommand-confirm",
      name: "confirm"
    }, "Confirm"), /* @__PURE__ */ createElement("button", {
      id: "scriptCommand-cancel",
      name: "cancel"
    }, "Cancel"))));
  }
  render(/* @__PURE__ */ createElement(Body, null), document.body);
})();
