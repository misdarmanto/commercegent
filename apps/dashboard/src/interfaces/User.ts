import { IRoot } from "./Root";

export interface IUser extends IRoot {
  userId: number;
  userName: string;
  userPassword: string;
  userWhatsAppNumber: string;
  userPhoto: string;
  userRole: "user" | "admin" | "superAdmin";
  userGender: "pria" | "wanita";
  userCoin: number;
  userFcmId: string;
  userPartnerCode: string;
}
