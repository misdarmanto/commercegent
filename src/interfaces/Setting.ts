export interface ISetting {
  settingId: number;
  whatsappNumber?: string | null;
}

export interface ISettingCreateRequest {
  whatsappNumber: string;
}
