import { localEncoding, transmissionEncoding } from "../../../const/global";
import { EncryptedPatch, Keys, Patch, PatchHeader } from "../../../const/types";
import {
  publicEncryptData,
  generateSymmetricKey,
  generateIv,
  symmetricEncrypt,
} from "../generic/encrypt";
import { signData } from "../generic/sign";

const encryptPatch = (
  patch: Patch,
  keys: Keys,
  destinationKey: string
): EncryptedPatch => {
  const patchString = JSON.stringify(patch);
  const signature = signData(patchString, keys.privateKey);
  const header: PatchHeader = {
    key: generateSymmetricKey(),
    iv: generateIv(),
  };
  const encryptedHeader = publicEncryptData(
    JSON.stringify(header),
    destinationKey
  );
  const data = symmetricEncrypt(patchString, header.key, header.iv);
  return {
    destinationKey: Buffer.from(destinationKey, localEncoding).toString(
      transmissionEncoding
    ),
    senderKey: Buffer.from(keys.publicKey, localEncoding).toString(
      transmissionEncoding
    ),
    data,
    header: encryptedHeader,
    signature,
  };
};

export default encryptPatch;
