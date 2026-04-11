import type { IProductVariant } from "../interfaces/Product";

export function parseVariantPrice(
  value: number | string | undefined | null,
): number {
  if (value == null || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Urut varian dari harga dasar terendah (untuk tampilan & carousel konsisten). */
export function sortVariantsByLowestPrice(
  variants: IProductVariant[],
): IProductVariant[] {
  return [...variants].sort(
    (a, b) =>
      parseVariantPrice(a.productVariantPrice) -
      parseVariantPrice(b.productVariantPrice),
  );
}

export function getVariantsFromProduct(res: {
  variants?: IProductVariant[];
  productVariants?: IProductVariant[];
}): IProductVariant[] {
  if (res.productVariants?.length) return res.productVariants;
  if (res.variants?.length) return res.variants;
  return [];
}
