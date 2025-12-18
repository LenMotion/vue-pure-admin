import JSEncrypt from "jsencrypt";

/**
 * 使用 RSA 公钥加密密码
 * @param password 原始密码
 * @returns 加密后的密码
 */
export function encryptPassword(password: string): string {
  const publicKey = import.meta.env.VITE_PUBLIC_KEY;

  if (!publicKey) {
    console.warn("VITE_PUBLIC_KEY 未配置，密码将不会被加密");
    return password;
  }

  try {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    const encrypted = encrypt.encrypt(password);

    if (!encrypted) {
      console.error("密码加密失败");
      return password;
    }

    return encrypted;
  } catch (error) {
    console.error("密码加密过程中发生错误:", error);
    return password;
  }
}
