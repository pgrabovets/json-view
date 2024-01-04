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
 * @param {object | string | number | boolean} value - The value.
 * @returns {VirtualNode} The virtual node.
 */
function createVirtualTree(value) {
  const rootNode = createNode({
    value,
    key: getDataType(value),
    type: getDataType(value),
  });
  rootNode.createSubnode(value);
  return rootNode;
}
export {
  classes,
  createVirtualTree,
  createNode
};
