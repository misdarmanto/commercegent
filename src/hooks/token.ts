import { CONFIGS } from "../configs";
import { jwtDecode } from "jwt-decode";
import { IJwtPayload } from "../interfaces/Auth";

export const useToken = () => {
  const TOKEN_KEY = CONFIGS.localStorageKey;

  const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const getDecodeJwtToken = () => {
    const token = getToken();

    if (token) {
      const resultToken: any = jwtDecode(token);
      const userToken: IJwtPayload = resultToken;
      return userToken;
    }
    return null;
  };

  const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  };

  const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
  };

  return {
    getToken,
    getDecodeJwtToken,
    setToken,
    removeToken,
  };
};
