import {getDataType} from './getDataType.js';
import {listen} from './listen.js';
const classes = {
    HIDDEN: 'hidden',
    CARET_ICON: 'caret-icon',
    CARET_RIGHT: 'fa-caret-right',
    CARET_DOWN: 'fa-caret-down',
    ICON: 'fas'
}
/**
 * @typedef {object} VirtualNode
 * @property {VirtualNode[]} children - The children.
 * @property {boolean} isExpanded - Whether node is expanded.
 * @property {string} key - The key.
 * @property {Function | null} dispose - The unlisten function.
 * @property {number} depth - The depth.
 * @property {VirtualNode | null} parent - The parent.
 * @property {any} value - The value.
 * @property {'array'|'object'} type - The type.
 * @property {HTMLElement} el - The HTML element.
 */
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
 * @param {object} [params]
 * @param {string} [params.key] - The key.
 * @param {string} [params.value] - The value.
 * @param {string} [params.type] - The type.
 * @returns {string} HTML string.
 */
function notExpandedTemplate(params = {}) {
  const {key, type} = params;
  let {value} = params;
  if (type === 'string') {
    value = JSON.stringify(value);
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
  let el = document.createElement('div');
  /**
   * 
   * @param {VirtualNode} node 
   * @returns 
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
    el.innerHTML = notExpandedTemplate({
      key: node.key,
      value: node.value,
      type: node.value === '{}' ? 'object' : typeof node.value
    })
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
 * Recursively traverse Tree object.
 * @param {VirtualNode} node - The virtual node.
 * @param {Function} callback - The callback.
 */
function traverse(node, callback) {
  callback(node);
  if (node.children.length > 0) {
    node.children.forEach((child) => {
      traverse(child, callback);
    });
  }
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
  return {
    key: opt.key || null,
    parent: opt.parent || null,
    value: value,
    isExpanded: opt.isExpanded || false,
    type: opt.type || null,
    children: opt.children || [],
    el: opt.el || null,
    depth: opt.depth || 0,
    dispose: null
  }
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
/**
 * Render tree into DOM container
 * @param {object} tree
 * @returns {HTMLElement} The HTML element.
 */
function render(tree) {
  const containerEl = createContainerElement();
  traverse(tree, function(node) {
    node.el = createNodeElement(node);
    containerEl.appendChild(node.el);
  });
  return containerEl;
}
/**
 * @param {VirtualNode} node 
 */
function expand(node) {
  traverse(node, function(child) {
    child.el.classList.remove(classes.HIDDEN);
    child.isExpanded = true;
    setCaretIconDown(child);
  });
}
/**
 * @param {VirtualNode} node 
 */
function collapse(node) {
  traverse(node, function(child) {
    child.isExpanded = false;
    if (child.depth > node.depth) {
      child.el.classList.add(classes.HIDDEN);
    }
    setCaretIconRight(child);
  });
}
/**
 * @param {VirtualNode} tree 
 */
function destroy(tree) {
  traverse(tree, (node) => {
    if (node.dispose) {
      node.dispose(); 
    }
  })
  tree.el.parentNode.remove();
}
export {
  toggleNode,
  render,
  createVirtualTree,
  expand,
  collapse,
  traverse,
  destroy
};
