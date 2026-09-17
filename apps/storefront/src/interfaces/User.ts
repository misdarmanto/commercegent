export interface IRegisterPayload {
  userName: string;
  userWhatsAppNumber: string;
  userPassword: string;
  userGender: "pria" | "wanita";
}

export interface ILoginPayload {
  userWhatsAppNumber: string;
  userPassword: string;
}

export type UserRole = "user" | "courier" | "office" | "admin" | "superAdmin";

export interface IUserProfile {
  userId: number;
  userName: string;
  userWhatsAppNumber: string;
  userCoin: number;
  userRole: UserRole;
  userPartnerCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IUpdateProfilePayload {
  userName?: string;
  userPassword?: string;
}
