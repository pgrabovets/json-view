export function element(name) {
  return document.createElement(name);
}

export function append(target, node) {
  target.appendChild(node);
}

export function listen(node, event, handler) {
  node.addEventListener(event, handler);
  return () => node.removeEventListener(event, handler);
}

export function detach(node) {
  node.parentNode.removeChild(node);
}
