// walk a list backwards calling inspect_item on each item
export function find_list_backwards(list, inspect_item) {
  for (let i = list.length - 1; i >= 0; i--) {
    const item = list[i];
    const result = inspect_item(item, i);
    if (result !== undefined) {
      return result;
    }
  }
}
