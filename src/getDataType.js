/**
 * Get value data type
 * @param {*} val - The value.
 */
function getDataType(val) {
  if (Array.isArray(val)) {
    return 'array';
  }
  if (val === null) {
    return 'null';
  }
  return typeof val;
}
export {getDataType};
