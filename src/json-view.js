import {getDataType} from './getDataType.js';
import {listen} from './listen.js';
const classes = {
    HIDDEN: 'hidden',
    CARET_ICON: 'caret-icon',
    CARET_RIGHT: 'fa-caret-right',
    CARET_DOWN: 'fa-caret-down',
    ICON: 'fas'
}
class VirtualNode {
  /** @type {VirtualNode[]} */
  children = [];
  /** @type {boolean} */
  isExpanded;
  /** @type {string} */
  key;
  /**
   * The unlisten function.
   * @type {Function | null}
   */
  dispose;
  /** @type {number} */
  depth;
  /** @type {VirtualNode | null} */
  parent;
  /** @type {any} */
  value;
  /** @type {'array'|'object'} */
  type;
  /** @type {HTMLElement} */
  el;
  /**
   * Recursively traverse Tree object.
   * @param {VirtualNode} node - The virtual node.
   * @param {(node: VirtualNode) => void} callback - The callback.
   */
  traverse(callback) {
    callback(this);
    this.children.forEach((child) => {
      child.traverse(callback);
    });
  }
  /**
   * Render tree into DOM container.
   * @returns {HTMLElement} The HTML element.
   */
  render() {
    const containerEl = createContainerElement();
    this.traverse(function(node) {
      node.el = createNodeElement(node);
      containerEl.appendChild(node.el);
    });
    return containerEl;
  }
  expand() {
    this.traverse(function(child) {
      child.el.classList.remove(classes.HIDDEN);
      child.isExpanded = true;
      setCaretIconDown(child);
    });
  }
  collapse() {
    this.traverse((child) => {
      child.isExpanded = false;
      if (child.depth > this.depth) {
        child.el.classList.add(classes.HIDDEN);
      }
      setCaretIconRight(child);
    });
  }
  destroy() {
    this.traverse((node) => {
      if (node.dispose) {
        node.dispose(); 
      }
    })
    this.el.parentNode.remove();
  }
}
/**
 * @param {object} [params] - The input data.
 * @param {string} [params.key] - The key.
 * @param {number} [params.size] - The size.
 * @returns {string} HTML string.
 */
function expandedTemplate(params = {}) {
  const {key, size} = params;
  return `
    <div class="line">
      <div class="caret-icon"><i class="fas fa-caret-right"></i></div>
      <div class="json-key">${key}</div>
      <div class="json-size">${size}</div>
    </div>
  `;
}
/**
 * @param {VirtualNode} node - The virtual node.
 * @returns {string} HTML string.
 */
function notExpandedTemplate(node) {
  const {key, type} = node;
  let {value} = node;
  if (type === 'string') {
    value = JSON.stringify(value);
  }
  if (!node.parent) {
    return `
      <div class="line">
        <div class="json-${type}">${value}</div>
      </div>
    `;
  }
  return `
    <div class="line">
      <div class="empty-icon"></div>
      <div class="json-key">${key}</div>
      <div class="json-separator">:</div>
      <div class="json-value json-${type}">${value}</div>
    </div>
  `;
}
function createContainerElement() {
  const el = document.createElement('div');
  el.className = 'json-container';
  return el;
}
/**
 * @param {VirtualNode} node - The virtual node.
 */
function hideNodeChildren(node) {
  node.children.forEach((child) => {
    child.el.classList.add(classes.HIDDEN);
    if (child.isExpanded) {
      hideNodeChildren(child);
    }
  });
}
/**
 * @param {VirtualNode} node - The virtual node.
 */
function showNodeChildren(node) {
  node.children.forEach((child) => {
    child.el.classList.remove(classes.HIDDEN);
    if (child.isExpanded) {
      showNodeChildren(child);
    }
  });
}
/**
 * @param {VirtualNode} node - The virtual node.
 */
function setCaretIconDown(node) {
  if (node.children.length > 0) {
    const icon = node.el.querySelector('.' + classes.ICON);
    if (icon) {
      icon.classList.replace(classes.CARET_RIGHT, classes.CARET_DOWN);
    }
  }
}
/**
 * @param {VirtualNode} node - The virtual node.
 */
function setCaretIconRight(node) {
  if (node.children.length > 0) {
    const icon = node.el.querySelector('.' + classes.ICON);
    if (icon) {
      icon.classList.replace(classes.CARET_DOWN, classes.CARET_RIGHT);
    }
  }
}
/**
 * @param {VirtualNode} node - The virtual node.
 */
function toggleNode(node) {
  if (node.isExpanded) {
    node.isExpanded = false;
    setCaretIconRight(node);
    hideNodeChildren(node);
  } else {
    node.isExpanded = true;
    setCaretIconDown(node);
    showNodeChildren(node);
  }
}
/**
 * Create node html element.
 * @param {VirtualNode} node - The virtual node.
 * @returns {HTMLElement} - New HTMLElement.
 */
function createNodeElement(node) {
  const el = document.createElement('div');
  /**
   * @param {VirtualNode} node 
   * @returns {string | null}
   */
  const getSizeString = (node) => {
    const len = node.children.length;
    if (node.type === 'array') {
      return `[${len}]`;
    }
    if (node.value instanceof Object && node.value !== null) {
      return `{${Object.keys(node.value).length}}`;
    }
    return null;
  }
  if (node.children.length > 0) {
    el.innerHTML = expandedTemplate({
      key: node.key,
      size: getSizeString(node),
    })
    const caretEl = el.querySelector('.' + classes.CARET_ICON);
    node.dispose = listen(caretEl, 'click', () => toggleNode(node));
  } else {
    el.innerHTML = notExpandedTemplate(node);
  }
  const lineEl = el.children[0];
  if (!(lineEl instanceof HTMLElement)) {
    throw new Error('lineEl not an instance of HTMLElement');
  }
  if (node.parent !== null) {
    lineEl.classList.add(classes.HIDDEN);
  }
  lineEl.style.marginLeft = node.depth * 18 + 'px';
  return lineEl;
}
/**
 * Create a virtual node object.
 * @param {object} opt - The options.
 * @returns {VirtualNode} - The virtual node.
 */
function createNode(opt = {}) {
  const isEmptyObject = (value) => {
    return (
      getDataType(value) === 'object' &&
      Object.keys(value).length === 0
    )
  }
  let value = opt.hasOwnProperty('value') ? opt.value : null;
  if (isEmptyObject(value)) {
    value = "{}";
  }
  const node = new VirtualNode();
  Object.assign(node, {
    key: opt.key || null,
    parent: opt.parent || null,
    value: value,
    isExpanded: opt.isExpanded || false,
    type: opt.type || null,
    children: opt.children || [],
    el: opt.el || null,
    depth: opt.depth || 0,
    dispose: null
  });
  return node;
}
/**
 * Create subnode for node
 * @param {object} data
 * @param {VirtualNode} node
 */
function createSubnode(data, node, depth = 0) {
  if (typeof data !== 'object') {
    return;
  }
  if (depth > 1) {
    return;
  }
  for (const key in data) {
    const child = createNode({
      value: data[key],
      key,
      depth: node.depth + 1,
      type: getDataType(data[key]),
      parent: node,
    });
    node.children.push(child);
    createSubnode(data[key], child, depth + 1);
  }
}
/**
 * @param {object | string | number | boolean} value - The value.
 * @returns {VirtualNode} The virtual node.
 */
function createVirtualTree(value) {
  const rootNode = createNode({
    value,
    key: getDataType(value),
    type: getDataType(value),
  });
  createSubnode(value, rootNode);
  return rootNode;
}
export {
  toggleNode,
  createVirtualTree,
};
