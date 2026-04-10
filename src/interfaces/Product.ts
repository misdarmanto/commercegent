import { ICategory } from "./Category";

export interface IProduct {
  productId: number;
  productName: string;
  productDescription: string;
  productImages: string[];
  productPrice: number;
  productDiscount: number;
  productSellPrice?: number;
  productCategoryId?: number;
  productSubCategoryId?: number;
  productTotalSale: number;
  productCode: string;
  productStock: number;
  productWeight: number;
  productIsHighlight: boolean;
  category: ICategory;
  productBarcode: string;
  productUnit: string;
  productIsVisible: boolean;
}

export interface IProductCreate {
  productName: string;
  productDescription: string;
  productImages: string[];
  productPrice: number;
  productCategoryId?: number;
  productSubCategoryId?: number;
  productCode: string;
  productStock: number;
  productDiscount?: number;
  productWeight?: number;
  productBarcode: string;
  productUnit?: string;
  productIsVisible?: boolean;
}

export interface IProductUpdate {
  productId: number;
  productName?: string;
  productDescription?: string;
  productImages?: string[];
  productPrice?: number;
  productCategoryId?: number;
  productSubCategoryId?: number;
  productCode?: string;
  productStock?: number;
  productDiscount?: number;
  productWeight?: number;
  productBarcode?: string;
  productUnit?: string;
  productIsVisible?: boolean;
}

export interface IProductUpload {
  fileId: number;
  fileName: string;
  filePath: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  message?: string | null;
}
