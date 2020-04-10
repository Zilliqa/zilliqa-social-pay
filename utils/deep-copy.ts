export function deepCopy(el: object | any[]) {
  return JSON.parse(JSON.stringify(el));
}
