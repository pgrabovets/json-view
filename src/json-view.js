import {VirtualNode} from './VirtualNode.js';
const classes = {
  HIDDEN: 'hidden',
  CARET_ICON: 'caret-icon',
  CARET_RIGHT: 'fa-caret-right',
  CARET_DOWN: 'fa-caret-down',
  ICON: 'fas'
}
/**
 * @param {object | string | number | boolean} value - The value.
 * @returns {VirtualNode} The virtual node.
 */
function createVirtualTree(value) {
  const rootNode = new VirtualNode({value});
  rootNode.createSubnode(value);
  return rootNode;
}
export {
  classes,
  createVirtualTree
};
