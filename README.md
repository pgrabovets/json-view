# DisplayAnything.js

Work in 

This is a javascript library for displaying anything in a DOM. [link to demo](http://pgrabovets.github.io/json-view/)

### Installation
```javascript
  npm install display-anything;
```

### How to use
include jsonview.js from dist directory in your html page
```html
 <script src="jsonview.js"></script>
```
or you can use import
```javascript
  import jsonview from '@pgrabovets/json-view';
```

get json data and render tree into DOM
```javascript
// get json data
const data = '{"name": "json-view","version": "1.0.0"}';

// create json tree object
const tree = jsonview.create(data);

// render tree into dom element
jsonview.render(tree, document.querySelector('.tree'));

// you can render json data without creating tree
const tree = jsonview.renderJSON(data, document.querySelector('.tree'));
```

control methods
```javascript
// expand tree
jsonview.expand(tree);

// collapse tree
jsonview.collapse(tree);

// traverse tree object
jsonview.traverse(tree, function(node) {
  console.log(node);
});

// function toggles between show or hide
jsonview.toggleNode(tree);

// destory and unmount json tree from the dom
jsonview.destroy(tree);
```

# Example

https://github.com/kungfooman/DisplayAnything.js/blob/main/demo/demo.js

# Development

```sh
# Package doesn't require a build step, ESM ftw!
cd /var/www/html
git clone https://github.com/kungfooman/DisplayAnything.js
open http://127.0.0.1/DisplayAnything.js
```

As link: http://127.0.0.1/DisplayAnything.js