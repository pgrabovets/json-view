import {createContainerElement} from "./createContainerElement.js";
import {classes               } from "./json-view.js";
import {listen                } from './listen.js';
import {getDataType           } from './getDataType.js';
/*
  Object.assign(node, {
    value: value,
    type: opt.type || null,
    el: opt.el || null,
    dispose: null
  });
*/
class VirtualNode {
  /** @type {VirtualNode[]} */
  children = [];
  /** @type {boolean} */
  isExpanded = false;
  /** @type {string | null} */
  key = null;
  /**
   * The unlisten function.
   * @type {Function | null}
   */
  dispose = null;
  /** @type {number} */
  depth = 0;
  /** @type {VirtualNode | null} */
  parent = null;
  /** @type {any} */
  value;
  /** @type {HTMLElement | null} */
  el = null;
  /**
   * Create a virtual node object.
   * @param {object} [opt] - The options.
   * @param {any} [opt.value] - The value.
   * @param {string} [opt.key] - The key.
   * @param {number} [opt.depth] - The depth.
   * @param {VirtualNode} [opt.parent] - The parent.
   */
  constructor(opt = {}) {
    Object.assign(this, opt);
  }
  get type() {
    return getDataType(this.value);
  }
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
      child.el?.classList.remove(classes.HIDDEN);
      child.isExpanded = true;
      child.setCaretIconDown();
    });
  }
  collapse() {
    this.traverse((child) => {
      child.isExpanded = false;
      if (child.depth > this.depth) {
        child.el?.classList.add(classes.HIDDEN);
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
    this.el?.parentElement?.remove();
  }
  /**
   * @type {string | null}
   */
  get size() {
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
   * @returns {HTMLDivElement} - New HTMLDivElement.
   */
  createNodeElement() {
    const line = document.createElement('div');
    line.classList.add('line');
    if (this.children.length) {
      line.innerHTML = this.expandTypeAndSize();
      const caretEl = line.querySelector('.' + classes.CARET_ICON);
      this.dispose = listen(caretEl, 'click', () => this.toggleNode());
    } else {
      line.innerHTML = this.notExpandedTemplate();
    }
    if (this.parent) {
      line.classList.add(classes.HIDDEN);
    }
    line.style.marginLeft = this.depth * 18 + 'px';
    return line;
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
  /**
   * @returns {string} HTML string.
   */
  notExpandedTemplate() {
    const {key, type, parent} = this;
    let {value} = this;
    if (type === 'string') {
      value = JSON.stringify(value);
    }
    if (!parent) {
      return `
        <div class="json-${type}">${value}</div>
      `;
    }
    return `
      <div class="empty-icon"></div>
      <div class="json-key">${key}</div>
      <div class="json-separator">:</div>
      <div class="json-value json-${type}">${value}</div>
    `;
  }
  /**
   * @returns {string} HTML string.
   */
  expandTypeAndSize() {
    const {key, type, size} = this;
    if (key === null) {
      return `
        <div class="caret-icon"><i class="fas fa-caret-right"></i></div>
        <div class="json-type">${type}</div>
        <div class="json-size">${size}</div>
      `;
    }
    return `
      <div class="caret-icon"><i class="fas fa-caret-right"></i></div>
      <div class="json-key">${key}</div>
      <div class="json-size">${size}</div>
    `;
  }
  /**
   * Create subnode for node.
   * @param {any} data
   * @param {number} [depth]
   */
  createSubnode(data, depth = 0) {
    if (typeof data !== 'object') {
      return;
    }
    if (depth > 1) {
      return;
    }
    for (const key in data) {
      const value = data[key];
      const child = new VirtualNode({
        value,
        key,
        depth: this.depth + 1,
        parent: this,
      });
      this.children.push(child);
      child.createSubnode(value, depth + 1);
    }
  }
}
export {VirtualNode};
