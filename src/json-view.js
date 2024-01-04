import {getDataType} from './getDataType.js';
import {VirtualNode} from './VirtualNode.js';
const classes = {
    HIDDEN: 'hidden',
    CARET_ICON: 'caret-icon',
    CARET_RIGHT: 'fa-caret-right',
    CARET_DOWN: 'fa-caret-down',
    ICON: 'fas'
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
  createVirtualTree,
  expandedTemplate,
  classes
};
