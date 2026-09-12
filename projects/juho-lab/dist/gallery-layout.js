
export function relativeSlot(index, selectedIndex, count) {
  if (count < 1) return 99;
  let slot = (index - selectedIndex + count) % count;
  if (slot > count / 2) slot -= count;
  return slot;
}
