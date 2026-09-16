import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "./httpClient";
import type { ISetting, ISettingCreateRequest } from "../interfaces/Setting";
import type { IAddress } from "../interfaces/Address";

/* ===================== Banner ===================== */

export interface BannerItem {
  bannerId: number;
  bannerImage: string;
  bannerOrder: number;
}

export const bannerKeys = {
  all: ["banners"] as const,
  lists: () => [...bannerKeys.all, "list"] as const,
};

export function useBanners() {
  return useQuery({
    queryKey: bannerKeys.lists(),
    queryFn: async () => {
      const { data } = await httpClient.get("/banners");
      const items = (data.data?.items ?? []) as BannerItem[];
      return [...items].sort((a, b) => a.bannerOrder - b.bannerOrder);
    },
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { bannerImage: string; bannerOrder: number }) =>
      httpClient.post("/banners", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
    },
  });
}

export function useRemoveBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bannerId: number) => httpClient.delete(`/banners/${bannerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
    },
  });
}

/* ===================== Local shipping ===================== */

export interface LocalShippingListItem {
  localShippingId: number;
  localShippingCompanyName: string;
  localShippingProvinceId: string;
  localShippingKabupatenId?: string;
  localShippingKabupatenName?: string;
  localShippingPricePerKg: number;
  localShippingDuration: string;
  deleted: boolean;
}

export const localShippingKeys = {
  all: ["local-shippings"] as const,
  lists: () => [...localShippingKeys.all, "list"] as const,
};

export function useLocalShippings() {
  return useQuery({
    queryKey: localShippingKeys.lists(),
    queryFn: async () => {
      const { data } = await httpClient.get("/local-shippings");
      const items = (data.data?.items ?? []) as LocalShippingListItem[];
      return items.filter((r) => !r.deleted);
    },
  });
}

export function useCreateLocalShipping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      localShippingCompanyName: string;
      localShippingProvinceName: string;
      localShippingProvinceId: string;
      localShippingKabupatenName?: string;
      localShippingKabupatenId?: string;
      localShippingPricePerKg: number;
      localShippingDuration: string;
    }) => httpClient.post("/local-shippings", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: localShippingKeys.lists() });
    },
  });
}

export function useRemoveLocalShipping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (localShippingId: number) =>
      httpClient.delete(`/local-shippings/${localShippingId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: localShippingKeys.lists() });
    },
  });
}

/* ===================== General settings (whatsapp + otp) ===================== */

export const settingKeys = {
  all: ["settings"] as const,
  detail: () => [...settingKeys.all, "detail"] as const,
};

export function useSettings() {
  return useQuery({
    queryKey: settingKeys.detail(),
    queryFn: async () => {
      const { data } = await httpClient.get("/settings");
      return data.data as ISetting;
    },
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ISettingCreateRequest) =>
      httpClient.post("/settings", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.detail() });
    },
  });
}

export function useRequestOtp() {
  return useMutation({
    mutationFn: (payload: { whatsappNumber: string; otpType: string }) =>
      httpClient.post("/otp/request", payload),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (payload: { whatsappNumber: string; otpCode: string }) =>
      httpClient.post("/otp/verify", payload),
  });
}

/* ===================== Admin address ===================== */

export const adminAddressKeys = {
  all: ["admin-address"] as const,
  detail: () => [...adminAddressKeys.all, "detail"] as const,
};

export function useAdminAddress() {
  return useQuery({
    queryKey: adminAddressKeys.detail(),
    queryFn: async () => {
      const { data } = await httpClient.get("/addresses/admins");
      return data.data as IAddress | undefined;
    },
  });
}

export function useSaveAdminAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<IAddress, "addressId" | "addressUserId">) =>
      httpClient.post("/addresses/admins", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAddressKeys.detail() });
    },
  });
}
