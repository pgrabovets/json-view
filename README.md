# json-view
This is a javascript library for displaying json data into a DOM. [link to demo](http://pgrabovets.github.io/json-view/)

### How to use
include jsonview.css and jsonview.js
```html
 <link rel="stylesheet" type="text/css" href="jsonview.css">
 <script src="jsonview.js"></script>
```
call the function with arguments
```javascript
//get json data
var data = '{"name": "json-view","version": "1.0.0"}';

//get target html element
var target = '.root';

jsonView.format(data, target);
```

### Example
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" type="text/css" href="jsonview.css">
  <script src="jsonview.js"></script>
</head>
<body>
  <div class="root"></div>

  <script type="text/javascript">
    fetch('example.json')
    .then((res)=> {
      return res.text();
    })
    .then((data) => {
      jsonView.format(data, '.root');
    })
    .catch((err) => {
      console.log(err);
    })
  </script>
</body>
</html>
```

### For development install dependencies
```
$ npm install
$ npm start
open http://localhost:3000/
```
