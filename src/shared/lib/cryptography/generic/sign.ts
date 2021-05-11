import {
  localEncoding,
  signingAlgorithm,
  transmissionEncoding,
} from "../../../const/global";

const crypto = require("crypto");

export const signData = (data: string, privateKey: string): string => {
  const signer = crypto.createSign(signingAlgorithm);
  signer.update(data);
  return signer.sign(privateKey, transmissionEncoding);
};

export const validateSignature = (
  data: string,
  publicKey: string,
  signature: string
): boolean => {
  const verifier = crypto.createVerify(signingAlgorithm);
  verifier.update(data);
  return verifier.verify(
    Buffer.from(publicKey, localEncoding),
    Buffer.from(signature, transmissionEncoding)
  );
};
