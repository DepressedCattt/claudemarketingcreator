/**
 * Category Registry — lookup helpers for scoped animation knowledge.
 *
 * Usage:
 *   import { getCategory, getSubCategory, getCategoryForComp } from "@data/categories";
 *   const saas = getCategory("saas");
 *   const textAnim = getSubCategory("saas", "text-animation");
 *   const cat = getCategoryForComp("saas-explainer-v2"); // → saas category
 */

import saasData from "./saas.json";
import type {
  Category,
  SubCategory,
  CategoryRegistry,
  SpringRange,
} from "./schema";

const saas = saasData as unknown as Category;

export const CATEGORY_REGISTRY: CategoryRegistry = {
  version: "1.0.0",
  categories: [saas],
};

/** Get a category by ID */
export function getCategory(id: string): Category | undefined {
  return CATEGORY_REGISTRY.categories.find((c) => c.id === id);
}

/** Get a subcategory within a category */
export function getSubCategory(
  categoryId: string,
  subCategoryId: string,
): SubCategory | undefined {
  const cat = getCategory(categoryId);
  return cat?.subcategories.find((sc) => sc.id === subCategoryId);
}

/** Find which category a composition belongs to (by comp ID) */
export function getCategoryForComp(compId: string): Category | undefined {
  return CATEGORY_REGISTRY.categories.find((cat) =>
    cat.subcategories.some((sc) => sc.compositions.includes(compId)),
  );
}

/** Get all subcategories a composition uses */
export function getSubCategoriesForComp(compId: string): SubCategory[] {
  const cat = getCategoryForComp(compId);
  if (!cat) return [];
  return cat.subcategories.filter((sc) => sc.compositions.includes(compId));
}

/** Get all composition IDs within a category */
export function getCompositionsForCategory(categoryId: string): string[] {
  const cat = getCategory(categoryId);
  if (!cat) return [];
  const ids = new Set<string>();
  for (const sc of cat.subcategories) {
    for (const id of sc.compositions) ids.add(id);
  }
  return Array.from(ids);
}

/** Get all technique IDs for a subcategory */
export function getTechniquesForSubCategory(
  categoryId: string,
  subCategoryId: string,
): string[] {
  const sc = getSubCategory(categoryId, subCategoryId);
  return sc?.techniques ?? [];
}

/** Get all techniques across an entire category (deduplicated) */
export function getTechniquesForCategory(categoryId: string): string[] {
  const cat = getCategory(categoryId);
  if (!cat) return [];
  const techs = new Set<string>();
  for (const sc of cat.subcategories) {
    for (const t of sc.techniques) techs.add(t);
  }
  return Array.from(techs);
}

/**
 * Pick a spring config from a subcategory's parameter ranges.
 * Returns the midpoint of each range as a usable config.
 */
export function pickSpringFromSubCategory(
  categoryId: string,
  subCategoryId: string,
  preset = "text",
): { stiffness: number; damping: number; mass: number } | undefined {
  const sc = getSubCategory(categoryId, subCategoryId);
  if (!sc) return undefined;
  const range: SpringRange | undefined = sc.parameterRanges.springs[preset];
  if (!range) return undefined;
  return {
    stiffness: Math.round((range.stiffness[0] + range.stiffness[1]) / 2),
    damping: Math.round((range.damping[0] + range.damping[1]) / 2),
    mass: +((range.mass[0] + range.mass[1]) / 2).toFixed(2),
  };
}

/** List all available category IDs */
export function listCategories(): string[] {
  return CATEGORY_REGISTRY.categories.map((c) => c.id);
}

export type { Category, SubCategory, SpringRange, CategoryRegistry };
