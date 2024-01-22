import * as jsonview from '../src/index.js';
import {DisplayAnything} from '../src/DisplayAnything.js';
Object.assign(window, jsonview);
async function main() {
  const resp = await fetch('example.json');
  const json = await resp.json();
  const tree = new DisplayAnything(json);
  const elem = tree.render();
  document.querySelector('.root').append(elem);
  tree.expand();
  const test = new DisplayAnything("test");
  test.destroy();
  Object.assign(window, {json, tree, elem, test});
}
main();
const parent = document.querySelector('.root-window');
const treeObj = new DisplayAnything({
  numbers: [1, 2, 3],
  innerObject: {a: 1, b: 2}
});
/**
 * @param {string} desc 
 * @param {*} data 
 */
function example(desc, data) {
  const tree = new DisplayAnything(data);
  const e = tree.render();
  const hr = document.createElement('hr');
  document.body.append(desc, e, hr);
}
//example('window display'      , window                     );
example('number display'      , 123                        );
example('string display'      , 'some text'                );
example('date display'        , new Date()                 );
example('simple array display', [1, 2, 3]                  );
example('Float32Array display', new Float32Array([1, 2, 3]));
/**
 * @param {Element|null} parent 
 * @param {*} data 
 */
function exampleParentData(parent, data) {
  const tree = new DisplayAnything(data);
  const e = tree.render();
  if (!parent) {
    throw new Error("exampleParentData> missing parent");
  }
  parent.append(e);
  return tree;
}
const a = exampleParentData(document.querySelector('#td-a'), 123);
const b = exampleParentData(document.querySelector('#td-b'), true);
const c = exampleParentData(document.querySelector('#td-c'), "test str");
const d = exampleParentData(document.querySelector('#td-d'), {a: {b: {c: {d: 1234}}}});
const e = exampleParentData(document.querySelector('#td-e'), {key: "string"});
const f = exampleParentData(document.querySelector('#td-f'), {string: "test"});
const g = exampleParentData(document.querySelector('#td-g'), {}); // todo not exandable
window.a = a;
window.b = b;
window.c = c;
window.d = d;
window.e = e;
window.f = f;
window.g = g;