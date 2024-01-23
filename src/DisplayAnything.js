class DisplayAnything {
  static nokey = Symbol("no key");
  /** @type {DisplayAnything[]} */
  children = [];
  /** @type {boolean} */
  isExpanded = false;
  /** @type {string | symbol} */
  key;
  /**
   * The unlisten function.
   * @type {Function | null}
   */
  dispose = null;
  /** @type {number} */
  depth = 0;
  /** @type {DisplayAnything | undefined} */
  parent;
  /** @type {any} */
  value;
  /** @type {HTMLElement | null} */
  el = null;
  /**
   * Create a virtual node object.
   * @param {any} value - The value.
   * @param {string|symbol} [key] - The key.
   * @param {number} [depth] - The depth.
   * @param {DisplayAnything} [parent] - The parent.
   */
  constructor(value, key = DisplayAnything.nokey, depth = 0, parent) {
    this.value = value;
    this.key = key;
    this.depth = depth;
    this.parent = parent;
    this.createSubnode(value);
  }
  /**
   * The type of value as string.
   * @type {string}
   */
  get type() {
    const {value} = this;
    if (Array.isArray(value)) {
      return 'array';
    }
    const t = typeof value;
    if (t === 'string' || t === 'number' || t === 'boolean') {
      return t;
    }
    if (value === null) {
      return 'null';
    }
    if (value === undefined) {
      return 'undefined';
    }
    const proto = Object.getPrototypeOf(value);
    if (!proto) {
      console.log("no proto, happens for Object.create(null)");
      return t;
    }
    if (!proto.constructor) {
      console.log("proto but no constructor");
      return t;
    }
    return proto.constructor.name;
  }
  /**
   * Recursively traverse virtual node.
   * @param {(node: DisplayAnything) => void} callback - The callback.
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
    const containerEl = document.createElement('div');
    containerEl.className = 'display-anything';
    this.traverse((node) => {
      node.el = node.createNodeElement();
      if (node.parent) {
        node.hide();
      }
      containerEl.appendChild(node.el);
    });
    return containerEl;
  }
  show() {
    if (this.el) {
      this.el.style.display = '';
    }
  }
  hide() {
    if (this.el) {
      this.el.style.display = 'none';
    }
  }
  expand() {
    this.traverse((child) => {
      child.show();
      child.isExpanded = true;
      child.setCaretIconDown();
    });
  }
  collapse() {
    this.traverse((child) => {
      child.isExpanded = false;
      if (child.depth > this.depth) {
        child.hide();
      }
      child.setCaretIconRight();
    });
  }
  destroy() {
    this.traverse((node) => {
      node.dispose?.();
    });
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
    line.classList.add('display-anything-line');
    if (this.children.length) {
      line.innerHTML = this.expandTypeAndSize();
      const caretEl = line.querySelector('.display-anything-caret-icon');
      if (caretEl) {
        const handler = () => this.toggleNode();
        caretEl.addEventListener('click', handler);
        this.dispose = () => caretEl.removeEventListener('click', handler);
      }
    } else {
      line.innerHTML = this.notExpandedTemplate();
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
    const icon = this.el?.querySelector('.display-anything-fas');
    icon?.classList.replace('display-anything-caret-right', 'display-anything-caret-down');
  }
  setCaretIconRight() {
    const icon = this.el?.querySelector('.display-anything-fas');  
    icon?.classList.replace('display-anything-caret-down', 'display-anything-caret-right');
  }
  hideNodeChildren() {
    this.children.forEach((child) => {
      child.hide();
      if (child.isExpanded) {
        child.hideNodeChildren();
      }
    });
  }
  showNodeChildren() {
    this.children.forEach((child) => {
      child.show();
      if (child.isExpanded) {
        child.showNodeChildren();
      }
    });
  }
  valueToString() {
    try {
      let {value} = this;
      if (typeof value === 'string') {
        value = JSON.stringify(value);
      }
      return value + "";
    } catch (e) {
      console.error(e);
      return 'valueToString failed';
    }
  }
  /**
   * @returns {string} HTML string.
   */
  notExpandedTemplate() {
    const {key, type, parent} = this;
    if (!parent) {
      return `
        <div class="display-anything-${type}">${this.valueToString()}</div>
      `;
    }
    return `
      <div class="display-anything-empty-icon"></div>
      <div class="display-anything-key">${key}</div>
      <div class="display-anything-separator">:</div>
      <div class="display-anything-${type}">${this.valueToString()}</div>
    `;
  }
  /**
   * @returns {string} HTML string.
   */
  expandTypeAndSize() {
    const {key, type, size} = this;
    if (key === DisplayAnything.nokey) {
      // header of displayed value
      return `
        <div class="display-anything-caret-icon"><i class="display-anything-fas display-anything-caret-right"></i></div>
        <div class="display-anything-type">${type}</div>
        <div class="display-anything-size">${size}</div>
      `;
    }
    // key of an object
    return `
      <div class="display-anything-caret-icon"><i class="display-anything-fas display-anything-caret-right"></i></div>
      <div class="display-anything-key">${key}</div>
      <div class="display-anything-size">${size}</div>
    `;
  }
  /**
   * Create subnode for node.
   * @param {any} data
   */
  createSubnode(data) {
    if (typeof data !== 'object') {
      return;
    }
    if (this.depth > 1) {
      return;
    }
    for (const key in data) {
      const value = data[key];
      const depthInner = this.depth + 1;
      const parent = this;
      // console.log('createSubnode', {depthInner});
      const child = new DisplayAnything(value, key, depthInner, parent);
      this.children.push(child);
    }
  }
}
export {DisplayAnything};
