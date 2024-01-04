/**
 * Get value data type as string.
 * @param {string} val - The type of value as string.
 */
function getDataType(val) {
  if (Array.isArray(val)) {
    return 'array';
  }
  const t = typeof val;
  if (t === 'string' || t === 'number' || t === 'boolean') {
    return t;
  }
  if (val === null) {
    return 'null';
  }
  if (val === undefined) {
    return 'undefined';
  }
  const proto = Object.getPrototypeOf(val);
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
export {getDataType};
