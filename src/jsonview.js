(function() {
'use strict';

function isString(s) {
  return (typeof s === 'string' || s instanceof String);
}


/**
 * Create html element
 * @param {String} type html element 
 * @param {Object} config
 */
function  createElement(type, config) {
  const htmlElement = document.createElement(type);

  if (config === undefined) {
    return htmlElement;
  }

  if (config.className) {
    htmlElement.className = config.className;
  }

  if (config.content) {
    htmlElement.textContent = config.content;
  }

  if (config.HTMLcontent) {
    htmlElement.innerHTML = config.HTMLcontent;
  }

  if (config.children) {
    config.children.forEach((el) => {
      if (el !== null) {
        htmlElement.appendChild(el);
      }
    });
  }

  return htmlElement; 
}


/**
 * @param {Object} node
 * @return {HTMLElement}
 */
function createExpandedElement(node, options) {
  const iElem = createElement('i');

  if (node.expanded) {
    iElem.className = 'fas fa-caret-down';
  } else {
    iElem.className = 'fas fa-caret-right';
  }

  const caretElem = createElement('div', {
    className: 'caret-icon',
    children: [iElem],
  });

  const handleClick = node.toggle.bind(node);
  caretElem.addEventListener('click', handleClick);

  let config = { className: 'json-index' };
  config[options.useHTML ? 'HTMLcontent' : 'content'] = node.key;
  const indexElem = createElement('div', config);

  const typeElem = createElement('div', {
    className: 'json-type',
    content: node.type,
  });

  config = { className: 'json-key' };
  config[options.useHTML ? 'HTMLcontent' : 'content'] = node.key;
  const keyElem = createElement('div', config);

  const sizeElem = createElement('div', {
    className: 'json-size'
  });

  if (node.type === 'array') {
    sizeElem.innerText = '[' + node.children.length + ']';
  } else if (node.type === 'object') {
    sizeElem.innerText = '{' + node.children.length + '}';
  }

  if (options.hideSizeElem===true) sizeElem.innerText = '';

  let lineChildren;
  if (node.key === null) {
    lineChildren = [caretElem, typeElem, sizeElem]
  } else if (node.parent.type === 'array') {
    lineChildren = [caretElem, indexElem, sizeElem]
  } else if (node.key === '__HIDDEN__' && options.useHiddenKeys===true) {
    lineChildren = [caretElem, sizeElem]
  } else {
    lineChildren = [caretElem, keyElem, sizeElem]
  }

  const lineElem = createElement('div', {
    className: 'line',
    children: lineChildren
  });

  if (node.depth > 0) {
    lineElem.style = 'margin-left: ' + node.depth * 24 + 'px;';
  }

  return lineElem;
}


/**
 * @param {Object} node
 * @return {HTMLElement}
 */
function createNotExpandedElement(node, options) {
  const caretElem = createElement('div', {
    className: 'empty-icon',
  });


  let config = { className: 'json-key' };
  config[options.useHTML ? 'HTMLcontent' : 'content'] = node.key;
  const keyElem = createElement('div',config);

  const separatorElement = createElement('div', {
    className: 'json-separator',
    content: ':'
  });

  const valueType = ' json-' + typeof node.value;
  config = { className: 'json-value' + valueType };
  config[options.useHTML ? 'HTMLcontent' : 'content'] = String(node.value);
  const valueElement = createElement('div', config);

  let children = [caretElem];
  if (node.key !== '__HIDDEN__' && options.useHiddenKeys===true) children.push(keyElem, separatorElement);
  children.push(valueElement);

  const lineElem = createElement('div', {
    className: 'line',
    children
  });

  if (node.depth > 0) {
    lineElem.style = 'margin-left: ' + node.depth * 24 + 'px;';
  }

  return lineElem;
}


/**
 * create tree node
 * @return {Object}
 */
function createNode(options) {
  return {
    key: null,
    parent: null,
    value: null,
    expanded: options.startExpanded,
    type: null,
    children: null,
    elem: null,
    depth: 0,

    setCaretIconRight() {
      const icon = this.elem.querySelector('.fas');
      icon.classList.replace('fa-caret-down', 'fa-caret-right');
    },

    setCaretIconDown() {
      const icon = this.elem.querySelector('.fas');
      icon.classList.replace('fa-caret-right', 'fa-caret-down');
    },

    hideChildren() {
      if (this.children !== null) {
        this.children.forEach((item) => {
          item.elem.classList.add('hide');
          if (item.expanded) {
            item.hideChildren();
          }
        });
      }
    },

    showChildren() {
      if (this.children !== null) {
        this.children.forEach((item) => {
          item.elem.classList.remove('hide');
          if (item.expanded) {
            item.showChildren();
          }
        });
      }
    },

    toggle: function() {
      if (this.expanded) {
        this.expanded = false;
        this.hideChildren();
        this.setCaretIconRight();
      } else {
        this.expanded = true;
        this.showChildren();
        this.setCaretIconDown();
      }
    }
  }
}


/**
 * Return object length
 * @param {Object} obj
 * @return {number}
 */
function getLength(obj) {
  let length = 0;
  for (let key in obj) {
    length += 1;
  };
  return length;
}


/**
 * Return variable type
 * @param {*} val
 */
function getType(val) {
  let type = typeof val;
  if (Array.isArray(val)) {
    type = 'array';
  } else if (val === null) {
    type = 'null';
  }
  return type;
}


/**
 * Recursively traverse json object
 * @param {Object} obj parsed json object
 * @param {Object} parent of object tree
 */
function traverseObject(obj, parent, options) {
  for (let key in obj) {
    const child = createNode(options);
    child.parent = parent;
    child.key = key;
    child.type = getType(obj[key]);
    child.depth = parent.depth + 1;

    if (obj[key].__TITLE__ && options.useTitles===true) {
      child.key = obj[key].__TITLE__;
      delete obj[key].__TITLE__;
    } 

    if (typeof obj[key] === 'object') {
      child.children = [];
      parent.children.push(child);
      traverseObject(obj[key], child, options);
      child.elem = createExpandedElement(child, options);

    } else {
      child.value = obj[key];
      child.elem = createNotExpandedElement(child, options);
      parent.children.push(child);
    }
  }
}


/**
 * Create root of a tree
 * @param {Object} obj Json object
 * @return {Object}
 */
function createTree(obj, options) {
  const tree = createNode(options);
  tree.type = getType(obj);
  tree.children = [];
  tree.expanded = true;

  traverseObject(obj, tree, options);
  tree.elem = createExpandedElement(tree, options);

  if (options.hideRoot && tree.children.length===1) {
    Object.assign(tree, tree.children[0]);
  }

  return tree;
}


/**
 * Recursively traverse Tree object
 * @param {Object} node
 * @param {Callback} callback
 */
function traverseTree(node, callback, options) {
  callback(node, options);
  if (node.children !== null) {
    node.children.forEach((item) => {
      traverseTree(item, callback, options);
    });
  }
}


/**
 * Render Tree object
 * @param {Object} tree
 * @param {String} targetElem
 */
function render(tree, targetElem, options) {
  let rootElem;
  if (targetElem) {
    rootElem = document.querySelector(targetElem);
  } else {
    rootElem = document.body;
  }

  traverseTree(tree, (node) => {
    if (!node.expanded) {
      node.hideChildren();
    }
    rootElem.appendChild(node.elem);
  }, options);
}


/* Export jsonView object */
window.jsonView = {
  /**
   * Render JSON into DOM container
   * @param {String} jsonData
   * @param {String} targetElem
   */
  format: function(jsonData, targetElem, options) {
    let parsedData = jsonData;
    if (isString(jsonData)) parsedData = JSON.parse(jsonData);

    if (!options) options={};
    options.startExpanded = !!options.startExpanded; // if true starts with the json expanded
    options.hideRoot = !!options.hideRoot; // if true hides the json root 
    options.hideSizeElem = !!options.hideSizeElem; // if true hides sizeElem
    options.useTitles = !!options.useTitles; // if true and object has a key '__TITLE__' use that instead of node.key
    options.useHiddenKeys = !!options.useHiddenKeys; // if true hides object keys that equal '__HIDDEN__' (show only the value)
    options.useHTML = !!options.useHTML; // if true assume json data is HTML

    const tree = createTree(parsedData, options);
    render(tree, targetElem, options);
  }
}

})();
