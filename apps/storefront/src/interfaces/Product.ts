export interface IProductVariant {
  productVariantId: number;
  productVariantName: string;
  productVariantImage: string | null;
  productVariantPrice: number;
  productVariantSellPrice: number;
  productVariantDiscount: number;
  productVariantTotalSale?: number;
  productVariantStock: number;
  productVariantWeight: number;
}

export interface ICategory {
  categoryId: number;
  categoryReference: string | null;
  categoryName: string;
  categoryIcon: string | null;
  categoryType: "parent" | "child";
}

export interface IProduct {
  productId: number;
  productName: string;
  productDescription: string | null;
  productCategoryId: number;
  productSubCategoryId: number;
  productCode: string;
  productIsHighlight: boolean;
  productIsVisible: boolean;
  productBarcode: string | null;
  productUnit: string | null;
  category?: ICategory;
}

/** Product list row: cheapest variant flattened onto the row. */
export interface IProductListItem extends IProduct {
  variant: IProductVariant | null;
  productIsHasVariant: boolean;
  productTotalStock: number;
}

/** Product detail: every variant included. */
export interface IProductDetail extends IProduct {
  variants: IProductVariant[];
}

export interface IPaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
