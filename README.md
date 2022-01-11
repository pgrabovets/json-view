# json-view
This is a javascript library for displaying json data into a DOM. [link to demo](http://pgrabovets.github.io/json-view/)

### How to use
include jsonview.js from dist directory in your html page
```html
 <script src="jsonview.js"></script>
```
or you can use import
```javascript
  import jsonview from 'json-view';
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

// treverse tree object
jsonview.traverse(tree, function(node) {
  console.log(node);
});

// destory and unmount json tree from the dom
jsonview.destroy(tree);
```

### Example
```html
<!DOCTYPE html>
<html>
<head>
  <title>JSON VIEW</title>
  <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
</head>
<body>
  <div class="root"></div>

  <script type="text/javascript" src="jsonview.js"></script>
  <script type="text/javascript">
    fetch('example2.json')
    .then((res)=> {
      return res.text();
    })
    .then((data) => {
      const tree = jsonview.create(data);
      jsonview.render(tree, document.querySelector('.root'));
      jsonview.expand(tree);
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

$ npm run serve
$ npm run build

open http://localhost:3000/
```
