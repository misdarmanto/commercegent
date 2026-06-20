export interface IJwtPayload {
  userId: number;
  userRole: "user" | "admin" | "superAdmin";
}
