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
  dispose;
  /** @type {number} */
  depth = 0;
  /** @type {VirtualNode | null} */
  parent = null;
  /** @type {any} */
  value;
  /** @type {'array'|'object'} */
  type;
  /** @type {HTMLElement} */
  el;
  /**
   * Create a virtual node object.
   * @param {object} [opt] - The options.
   * @param {any} [opt.value] - The value.
   * @param {string} [opt.key] - The key.
   */
  constructor(opt = {}) {
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
    Object.assign(this, {
      key: opt.key || null,
      parent: opt.parent || null,
      value: value,
      //isExpanded: opt.isExpanded || false,
      type: opt.type || null,
      //children: opt.children || [],
      //el: opt.el || null,
      depth: opt.depth || 0,
      //dispose: null
    });
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
   * @returns {HTMLElement} - New HTMLElement.
   */
  createNodeElement() {
    const node = this; // todo rewrite
    const el = document.createElement('div');
    if (node.children.length > 0) {
      el.innerHTML = node.expandedTemplate();
      const caretEl = el.querySelector('.' + classes.CARET_ICON);
      node.dispose = listen(caretEl, 'click', () => node.toggleNode());
    } else {
      el.innerHTML = node.notExpandedTemplate();
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
  /**
   * @returns {string} HTML string.
   */
  expandedTemplate() {
    const {key, size} = this;
    return `
      <div class="line">
        <div class="caret-icon"><i class="fas fa-caret-right"></i></div>
        <div class="json-key">${key}</div>
        <div class="json-size">${size}</div>
      </div>
    `;
  }
  /**
   * Create subnode for node.
   * @param {any} data
   * @param {number} [depth]
   */
  createSubnode(data, depth = 0) {
    const node = this;
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
        depth: node.depth + 1,
        type: getDataType(value),
        parent: node,
      });
      node.children.push(child);
      child.createSubnode(value, depth + 1);
    }
  }
}
export {VirtualNode};
