import { ICategory } from "./Category";

/** Varian produk (API create / update / detail — harga bisa string dari JSON) */
export interface IProductVariant {
  productVariantId?: number;
  productVariantProductId?: number;
  productVariantName: string;
  productVariantImage?: string;
  productVariantPrice: number | string;
  productVariantSellPrice?: number | string;
  productVariantDiscount?: number;
  productVariantTotalSale?: number;
  productVariantStock?: number;
  productVariantWeight?: number;
}

/** Response GET `/products/detail/:id` (field `variants` dari API) */
export interface IProductDetail {
  productId: number;
  productName: string;
  productDescription?: string;
  productCategoryId?: string | number;
  productSubCategoryId?: string | number;
  productCode?: string;
  productIsHighlight?: boolean;
  productIsVisible?: boolean;
  productBarcode?: string;
  productUnit?: string;
  category?: ICategory;
  /** Nama field di response API terbaru */
  variants?: IProductVariant[];
  /** Alias jika backend mengirim nama ini */
  productVariants?: IProductVariant[];
  /** Legacy */
  productImages?: string[];
  productPrice?: number;
  productDiscount?: number;
  productSellPrice?: number;
  productStock?: number;
  productWeight?: number;
  productTotalSale?: number;
}

/** Digunakan di form & halaman detail */
export type IProduct = IProductDetail;

export interface IListProduct {
  productId: number;
  productName: string;
  productDescription?: string;
  /** Legacy / ringkasan untuk daftar */
  productImages?: string[];
  productPrice?: number;
  productDiscount?: number;
  productSellPrice?: number;
  productCategoryId?: number;
  productSubCategoryId?: number;
  productTotalSale?: number;
  productCode?: string;
  productStock?: number;
  productWeight?: number;
  productIsHighlight?: boolean;
  category?: ICategory;
  productBarcode?: string;
  productUnit?: string;
  productIsVisible?: boolean;
  variant?: IProductVariant;
}

export interface IProductCreate {
  productName: string;
  productDescription?: string;
  productCategoryId: number;
  productSubCategoryId: number;
  productCode: string;
  productBarcode: string;
  productUnit: string;
  productIsVisible: boolean;
  productVariants: Array<{
    productVariantName: string;
    productVariantImage: string;
    productVariantPrice: number;
    productVariantStock: number;
    productVariantDiscount: number;
    productVariantWeight: number;
  }>;
}

export interface IProductUpdate {
  productId: number;
  productName: string;
  productDescription?: string;
  productCategoryId: number;
  productSubCategoryId: number;
  productCode: string;
  productBarcode: string;
  productUnit: string;
  productIsVisible: boolean;
  productVariants: Array<{
    productVariantId?: number;
    productVariantName: string;
    productVariantImage?: string;
    productVariantPrice: number;
    productVariantStock: number;
    productVariantDiscount: number;
    productVariantWeight?: number;
  }>;
}

export interface IProductUpload {
  fileId: number;
  fileName: string;
  filePath: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  message?: string | null;
}
