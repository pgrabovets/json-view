import {createContainerElement} from "./createContainerElement.js";
import {expandedTemplate, notExpandedTemplate, classes} from "./json-view.js";
import {listen} from './listen.js';
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
   * Recursively traverse virtual node.
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
      node.el = node.createNodeElement();
      containerEl.appendChild(node.el);
    });
    return containerEl;
  }
  expand() {
    this.traverse(function(child) {
      child.el.classList.remove(classes.HIDDEN);
      child.isExpanded = true;
      child.setCaretIconDown();
    });
  }
  collapse() {
    this.traverse((child) => {
      child.isExpanded = false;
      if (child.depth > this.depth) {
        child.el.classList.add(classes.HIDDEN);
      }
      child.setCaretIconRight();
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
  /**
   * @type {string | null}
   */
  get sizeString() {
    const len = this.children.length;
    if (this.type === 'array') {
      return `[${len}]`;
    }
    if (this.value instanceof Object && this.value !== null) {
      return `{${Object.keys(this.value).length}}`;
    }
    return null;
  }
  /**
   * Create node html element.
   * @returns {HTMLElement} - New HTMLElement.
   */
  createNodeElement() {
    const node = this; // todo rewrite
    const el = document.createElement('div');
    if (node.children.length > 0) {
      el.innerHTML = expandedTemplate({
        key: node.key,
        size: node.sizeString,
      })
      const caretEl = el.querySelector('.' + classes.CARET_ICON);
      node.dispose = listen(caretEl, 'click', () => node.toggleNode());
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
  toggleNode() {
    if (this.isExpanded) {
      this.isExpanded = false;
      this.setCaretIconRight();
      this.hideNodeChildren();
    } else {
      this.isExpanded = true;
      this.setCaretIconDown();
      this.showNodeChildren();
    }
  }
  setCaretIconDown() {
    if (this.children.length > 0) {
      const icon = this.el.querySelector('.' + classes.ICON);
      if (icon) {
        icon.classList.replace(classes.CARET_RIGHT, classes.CARET_DOWN);
      }
    }
  }
  setCaretIconRight() {
    if (this.children.length > 0) {
      const icon = this.el.querySelector('.' + classes.ICON);
      if (icon) {
        icon.classList.replace(classes.CARET_DOWN, classes.CARET_RIGHT);
      }
    }
  }
  hideNodeChildren() {
    this.children.forEach((child) => {
      child.el.classList.add(classes.HIDDEN);
      if (child.isExpanded) {
        child.hideNodeChildren();
      }
    });
  }
  showNodeChildren() {
    this.children.forEach((child) => {
      child.el.classList.remove(classes.HIDDEN);
      if (child.isExpanded) {
        child.showNodeChildren();
      }
    });
  }
}
export {VirtualNode};
