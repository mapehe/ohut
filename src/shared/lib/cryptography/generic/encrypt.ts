import {
  localEncoding,
  transmissionEncoding,
  symmetricAlgorithm,
  symmetricKeyBytes,
  ivBytes,
} from "../../../const/global";

const crypto = require("crypto");

export const generateSymmetricKey = (): Buffer =>
  crypto.randomBytes(symmetricKeyBytes);
export const generateIv = (): Buffer => crypto.randomBytes(ivBytes);

export const publicEncryptData = (data: string, publicKey: string): string => {
  const buffer = Buffer.from(data, localEncoding);
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString(transmissionEncoding);
};

export const privateDecryptData = (
  data: string,
  privateKey: string
): string => {
  const buffer = Buffer.from(data, transmissionEncoding);
  const decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString(localEncoding);
};

export const symmetricEncrypt = (
  data: string,
  key: Buffer,
  iv: Buffer
): string => {
  const cipher = crypto.createCipheriv(symmetricAlgorithm, key, iv);
  let encrypted = cipher.update(data, localEncoding, transmissionEncoding);
  encrypted += cipher.final(transmissionEncoding);
  return encrypted;
};

export const symmetricDecrypt = (
  data: string,
  key: Buffer,
  iv: Buffer
): string => {
  const decipher = crypto.createDecipheriv(symmetricAlgorithm, key, iv);
  let decrypted = decipher.update(data, transmissionEncoding, localEncoding);
  decrypted += decipher.final(localEncoding);
  return decrypted;
};
