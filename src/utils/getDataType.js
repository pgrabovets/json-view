/**
 * Get value data type
 * @param {*} data
 */
export default function getDataType(val) {
  if (Array.isArray(val)) return 'array';
  if (val === null) return 'null';
  return typeof val;
}
