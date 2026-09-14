export function titleHash(title: string): number {
  let hash = 0;
  for (const character of title) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash;
}

export function houseVisual(title: string) {
  const hash = titleHash(title);
  return {
    height: 70 + hash % 21,
    colorIndex: hash % 5,
  };
}
