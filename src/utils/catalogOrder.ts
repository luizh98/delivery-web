type CatalogItem = { id: string; name: string; sortOrder: number };

export function sortCatalogItems<T extends CatalogItem>(items: T[]): T[] {
  return [...items].sort((left, right) =>
    left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));
}

export function catalogOrderChanges<T extends CatalogItem>(
  items: T[], id: string, direction: -1 | 1,
): T[] {
  const ordered = sortCatalogItems(items);
  const index = ordered.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= ordered.length) return [];
  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  // Unique positions also resolve older catalogs whose items all have order zero.
  return ordered.flatMap((item, sortOrder) =>
    item.sortOrder === sortOrder ? [] : [{ ...item, sortOrder }]);
}
