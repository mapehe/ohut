import { localEncoding, transmissionEncoding } from "../../../const/global";
import { DecryptedPatch, EncryptedPatch, Keys } from "../../../const/types";
import { parsePatchHeader, parsePatch } from "../../parsers";
import { privateDecryptData, symmetricDecrypt } from "../generic/encrypt";

const decryptPatch = (
  encryptedPatch: EncryptedPatch,
  keys: Keys
): DecryptedPatch => {
  const header = parsePatchHeader(
    privateDecryptData(encryptedPatch.header, keys.privateKey)
  );
  const decryptedData = symmetricDecrypt(
    encryptedPatch.data,
    header.key,
    header.iv
  );
  return {
    encryptedHeader: encryptedPatch.header,
    patch: parsePatch(decryptedData),
    signature: encryptedPatch.signature,
    senderKey: Buffer.from(
      encryptedPatch.senderKey,
      transmissionEncoding
    ).toString(localEncoding),
  };
};

export default decryptPatch;
