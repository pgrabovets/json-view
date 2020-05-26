# json-view
This is a javascript library for displaying json data into a DOM. [link to demo](http://pgrabovets.github.io/json-view/)

### How to use
include jsonview.css and jsonview.js
```html
 <link rel="stylesheet" type="text/css" href="jsonview.bundle.css">
 <script src="jsonview.bundle.js"></script>
```
get json data and render tree into DOM
```javascript
// get json data
const data = '{"name": "json-view","version": "1.0.0"}';

// create json tree object
const tree = JsonView.createTree(data);

// render tree into dom element
JsonView.render(tree, document.querySelector('.tree'));

// or you can render json data without creating tree
const tree = JsonView.renderJSON(data, document.querySelector('.tree'));

```
control methods
```javascript
// expand tree
JsonView.expandChildren(tree);

// collapse tree
JsonView.collapseChildren(tree);

// treverse tree object
JsonView.traverseTree(tree, function(node) {
  console.log(node);
});
```

### Example
```html
<!DOCTYPE html>
<html>
<head>
  <title>JSON VIEW</title>
  <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
  <link rel="stylesheet" type="text/css" href="jsonview.bundle.css">
</head>
<body>
  <div class="root"></div>

  <script type="text/javascript" src="jsonview.bundle.js"></script>
  <script type="text/javascript">
    fetch('example2.json')
    .then((res)=> {
      return res.text();
    })
    .then((data) => {
      const tree = JsonView.createTree(data);
      JsonView.render(tree, document.querySelector('.root'));
      JsonView.expandChildren(tree);
    })
    .catch((err) => {
      console.log(err);
    })
  </script>
</body>
</html>

```

### For development install dependencies and run scripts
```
$ npm install
$ npm run dev
$ npm run watch
$ npm start
open http://localhost:3000/
```
