import * as jsonview from '../src/index.js';
Object.assign(window, jsonview);
async function main() {
  const resp = await fetch('example.json');
  const json = await resp.json();
  const tree = jsonview.createVirtualTree(json);
  const elem = jsonview.render(tree);
  document.querySelector('.root').append(elem);
  jsonview.expand(tree);
  Object.assign(window, {json, tree, elem});
}
main();
const parent = document.querySelector('.root-window');
const treeObj = jsonview.createVirtualTree({
  numbers: [1, 2, 3],
  innerObject: {a: 1, b: 2}
});
function example(desc, data) {
  const tree = jsonview.createVirtualTree(data);
  const e = jsonview.render(tree);
  const hr = document.createElement('hr');
  document.body.append(desc, e, hr);
}
example('window display', window);
example('number display', 123);
example('string display', 'some text');
example('date display', new Date());
example('simple array display', [1, 2, 3]);
example('Float32Array display', new Float32Array([1, 2, 3]));
function exampleParentData(parent, data) {
  const tree = jsonview.createVirtualTree(data);
  const e = jsonview.render(tree);
  parent.append(e);
}
exampleParentData(document.querySelector('#td-a'), 123);
exampleParentData(document.querySelector('#td-b'), true);
exampleParentData(document.querySelector('#td-c'), "test str");
exampleParentData(document.querySelector('#td-d'), {a: {b: {c: {d: 1234}}}});
exampleParentData(document.querySelector('#td-e'), {key: "string"});
exampleParentData(document.querySelector('#td-f'), {string: "test"});
