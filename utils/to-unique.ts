export function toUnique(array: any[], key: string) {
  const onlyUniqueIds = new Set(array.map((el) => el[key]));

  return Array
    .from(onlyUniqueIds)
    .map((id) => array.find((el) => el[key] === id));
}
