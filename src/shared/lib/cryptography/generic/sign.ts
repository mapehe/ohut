import { signingAlgorithm } from "../../../const/global";

const crypto = require("crypto");

export const signData = (data: Buffer, privateKey: Buffer): Buffer => {
  const signer = crypto.createSign(signingAlgorithm);
  signer.update(data);
  return signer.sign(privateKey);
};

export const validateSignature = (
  data: Buffer,
  publicKey: Buffer,
  signature: Buffer
): boolean => {
  const verifier = crypto.createVerify(signingAlgorithm);
  verifier.update(data);
  return verifier.verify(publicKey, signature);
};
