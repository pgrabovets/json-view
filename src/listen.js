/**
 * @param {*} node - The node.
 * @param {*} event - The event.
 * @param {*} handler - The handler.
 * @returns {Function} Call to unlisten.
 */
function listen(node, event, handler) {
  node.addEventListener(event, handler);
  return () => node.removeEventListener(event, handler);
}
export {listen};
