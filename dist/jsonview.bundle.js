var JsonView = (function (exports) {
  'use strict';

  var input_json;
  var input_json_name;
  var tree_root;
  var occurence = 0;

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function expandedTemplate() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var key = params.key,
        size = params.size;
    return "\n    <div class=\"jsonview-line\">\n      <div class=\"jsonview-caret-icon\"><i class=\"fas fa-caret-right\"></i></div>\n      <div class=\"jsonview-json-key\">".concat(key, "</div>\n      <div class=\"jsonview-json-size\">").concat(size, "</div>\n    </div>\n  ");
  }

  function notExpandedTemplate() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var key = params.key,
        type = params.type,
        value = params.value;
    if (params.type === "string" && params.value.includes("-----BEGIN CERTIFICATE-----")) {
      value = "<pre style='font-family: 'Courier', sans-serif;' class='jsonview-json-value jsonview-json-".concat(type,"' >",value, "</pre>");
    }
    return "\n    <div class=\"jsonview-line\">\n      <div class=\"jsonview-empty-icon\"></div>\n      <div class=\"jsonview-json-key\">".concat(key, "</div>\n      <div class=\"jsonview-json-separator \">:</div>\n      <div class=\"jsonview-json-value jsonview-json-").concat(type, "\">").concat(value, "</div>\n    </div>\n  ");
  }

  function hideNodeChildren(node) {
    node.children.forEach(function (child) {
      child.el.classList.add('jsonview-hide');

      if (child.isExpanded) {
        hideNodeChildren(child);
      }
    });
  }

  function showNodeChildren(node) {
    node.children.forEach(function (child) {
      child.el.classList.remove('jsonview-hide');

      if (child.isExpanded) {
        showNodeChildren(child);
      }
    });
  }

  function setCaretIconDown(node) {
    if (node.children.length > 0) {
      var icon = node.el.querySelector('.fas');

      if (icon) {
        icon.classList.replace('fa-caret-right', 'fa-caret-down');
      }
    }
  }

  function setCaretIconRight(node) {
    if (node.children.length > 0) {
      var icon = node.el.querySelector('.fas');

      if (icon) {
        icon.classList.replace('fa-caret-down', 'fa-caret-right');
      }
    }
  }

  function toggleNode(node) {
    if (node.isExpanded) {
      node.isExpanded = false;
      setCaretIconRight(node);
      hideNodeChildren(node);
    } else {
      node.isExpanded = true;
      setCaretIconDown(node);
      showNodeChildren(node);
    }
  }

  function createContainerElement() {
    var el = document.createElement('div');
    el.className = 'jsonview-json-container';
    return el;
  }

  function createNodeElement(node) {
    var el = document.createElement('div');

    var getSizeString = function getSizeString(node) {
      var len = node.children.length;
      if (node.type === 'array' || node.type === 'object'){
        return "(".concat(len, ")");
      }
      return null;
    };

    if (node.children.length > 0) {
      el.innerHTML = expandedTemplate({
        key: node.key,
        size: getSizeString(node)
      });
      var caretEl = el.querySelector('.jsonview-caret-icon');
      caretEl.addEventListener('click', function () {
        toggleNode(node);
      });
    } else {
      var element_delimiter;
      switch (node.type) {
        case "object":
          element_delimiter = ["{", "}"];
          break;
        case "array":
          element_delimiter = ["[", "]"];
          break;
      }

      var node_value = node.value;
      if (node.type === "object" || node.type === "array"){
        var empty_object = '<span>'.concat(element_delimiter[0], '<span class="font-italic">', " empty ", '</span>', element_delimiter[1], '</span>');
        node_value = empty_object;
      }

      el.innerHTML = notExpandedTemplate({
        key: node.key,
        value: node_value,
        type: _typeof(node.value)
      });
    }

    var lineEl = el.children[0];

    if (node.parent !== null) {
      lineEl.classList.add('jsonview-hide');
    }

    lineEl.style = 'margin-left: ' + node.depth * 18 + 'px;';
    return lineEl;
  }

  function getDataType(val) {
    var type = _typeof(val);

    if (Array.isArray(val)) type = 'array';
    if (val === null) type = 'null';
    return type;
  }

  function traverseTree(node, callback) {
    callback(node);

    if (node.children.length > 0) {
      node.children.forEach(function (child) {
        traverseTree(child, callback);
      });
    }
  }

  function createNode() {
    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      key: opt.key || null,
      parent: opt.parent || null,
      value: opt.hasOwnProperty('value') ? opt.value : null,
      isExpanded: opt.isExpanded || false,
      type: opt.type || null,
      children: opt.children || [],
      el: opt.el || null,
      depth: opt.depth || 0
    };
  }

  function createSubnode(data, node) {
    if (_typeof(data) === 'object') {
      for (var key in data) {
        var child = createNode({
          value: data[key],
          key: key,
          depth: node.depth + 1,
          type: getDataType(data[key]),
          parent: node
        });
        node.children.push(child);
        createSubnode(data[key], child);
      }
    }
  }

  function createTree(jsonData, name) {
    input_json_name = name;
    input_json = jsonData;
    var data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    var rootNode = createNode({
      value: data,
      key: name,
      type: getDataType(data)
    });
    createSubnode(data, rootNode);
    return rootNode;
  }

  function renderJSON(jsonData, targetElement) {
    var parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    var tree = createTree(parsedData);
    render(tree, targetElement);
    return tree;
  }

  function render(tree, targetElement) {
    tree_root = targetElement;
    var containerEl = createContainerElement();
    traverseTree(tree, function (node) {
      node.el = createNodeElement(node);
      containerEl.appendChild(node.el);
    });
    targetElement.appendChild(containerEl);
  }

  function expandChildren(node) {
    traverseTree(node, function (child) {
      child.el.classList.remove('jsonview-hide');
      child.isExpanded = true;
      setCaretIconDown(child);
    });
  }

  function collapseChildren(node) {
    traverseTree(node, function (child) {
      child.isExpanded = false;
      if (child.depth > node.depth) {
        child.el.classList.add('jsonview-hide');
      }
      setCaretIconRight(child);
    });
  }

  function allowOverflow() {
    const tree = document.getElementsByClassName("jsonview-json-value jsonview-json-string");

    if (tree.length > 0){
      for (var i = 0; i < tree.length; i++) {
        tree[i].addEventListener("mouseover", function () {
          this.style.overflow = "auto";
        });
        tree[i].addEventListener("mouseleave", function () {
          this.style.overflow = "";
        });
      }
    }
  }

  function getLeaf(object, leaf, max_occurence){
    if(object !== null && object.hasOwnProperty(leaf)) {
        occurence++;
        if (max_occurence === occurence){
          return object[leaf];
        }
    }
    for(var i=0; i <Object.keys(object).length; i++){
        var node = object[Object.keys(object)[i]];
        if(node !== null && typeof node === "object"){
            var o = getLeaf(object[Object.keys(object)[i]], leaf, max_occurence);
            if(o !== false){
                return o;
            }
        }
    }

    return false;
}

function countOccurences(el, key_name) {
    var counter = 0;
    var root_tree = el.parentNode.parentNode;
    for (var j = 0; j < root_tree.children.length; j++){
      // We count the number of time this key name exists above what we clicked on
      if (root_tree.children.length > 0) {
        var text_element = root_tree.children[j].children[1];
        if (text_element.innerText === key_name){
          counter++;
        }
        // We stop if we encounter what we clicked on
        if (text_element === el){
          break;
        }
      }
    }
    return counter;
}

  function allowClickToClipboard() {

    // Copy the whole object corresponding to the object the user clicked on
    var objects = document.getElementsByClassName("jsonview-caret-icon");
    if (objects.length > 0) {
      for (var i = 0; i < objects.length; i++) {

        // Each node in the JSON
        objects[i].parentNode.children[1].addEventListener("click", function () {
          var object_clicked;

          // If it corresponds to the root of our json
          if (this.innerText === input_json_name) {
            object_clicked = input_json;
          } else {
            // The key of the object the user clicked on
            var key_name = this.innerText;

            // We need to count the number of time this key appears because otherwise
            // we might the wrong key with this name.
            // We use this in order to know when we can skip the keys that have this name in our json
            var counter = countOccurences(this, key_name);

            // We use recursion in order to find the object we are looking for
            // (cautions: this script is backward compatible with old js.
            //  Please take that in mind when coding - Emile D)
            occurence = 0; // reset the counter of getLeaf
            object_clicked = getLeaf(input_json, key_name, counter);
          }

          var el = this;
          var old_el_color = el.style.color;
          if (object_clicked !== false){
            navigator.clipboard.writeText(JSON.stringify(object_clicked));

            // We succeeded, we show it to the user
            el.style.color = "#00FF00";
            setTimeout(function () {
              el.style.color = old_el_color;
            }, 1000);

          }else{
            // If an error occured, we change the color to red
            el.style.color = "#FF0000";
            var old_val = el.innerText;
            el.innerText = "Error";
            setTimeout(function () {
              el.style.color = old_el_color;
              el.innerText = old_val;
            }, 1000);
          }
        });
      }
    }

    // Copy the value of a specific line
    const lines = document.querySelectorAll(".jsonview-line > .jsonview-empty-icon");
    if (lines.length > 0) {
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].parentNode;

        // When the user clicks on a line
        line.addEventListener("click", function (){
          var node_value = this.children[3];

          // Sometimes we have a <pre></pre> element
          var value = node_value.innerText;
          if (node_value.children.length > 0) {
            value = node_value.children[0].innerText;
          }

          // Save to clipboard
          navigator.clipboard.writeText(value);

          // Give feedback to the user
          var el_key = this.children[1];
          var el_value = this.children[3];

          var old_el_key_color = el_key.style.color;
          el_key.style.color = "#00FF00";
          var old_el_value_color = el_value.style.color;
          el_value.style.color = "#00FF00";
          setTimeout(function () {
            el_key.style.color = old_el_key_color;
            el_value.style.color = old_el_value_color;
          }, 1000);
        });
      }
    }
  }

  function setDescription(message) {
    var text = document.createElement("p");
    text.className = "jsonview-info-text";
    text.innerText = message;
    tree_root.prepend(text);
  }

  exports.collapseChildren = collapseChildren;
  exports.createTree = createTree;
  exports.expandChildren = expandChildren;
  exports.render = render;
  exports.renderJSON = renderJSON;
  exports.traverseTree = traverseTree;

  // Added by EDU
  exports.allowOverflow = allowOverflow;
  exports.allowClickToClipboard = allowClickToClipboard;
  exports.setDescription = setDescription;

  return exports;

}({}));