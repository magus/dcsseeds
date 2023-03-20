// walk a list backwards calling inspect_item on each item
export function find_list_backwards(list, inspect_item) {
  return iterate_backward(list, list.length - 1, inspect_item);
}

export function iterate_backward(list, start_index, inspect_item) {
  for (let i = start_index; i >= 0; i--) {
    const item = list[i];
    const result = inspect_item(item, i);
    if (result !== undefined) {
      return result;
    }
  }
}

export function iterate_forward(list, start_index, inspect_item) {
  for (let i = start_index; i < list.length; i++) {
    const item = list[i];
    const result = inspect_item(item, i);
    if (result !== undefined) {
      return result;
    }
  }
}
