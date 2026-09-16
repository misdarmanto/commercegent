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
