import { publicEncrypt } from "crypto";
import { encoding } from "../../../const/global";
import { EncryptedPatch, Keys, Patch, PatchHeader } from "../../../const/types";
import {
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
  const signature = signData(
    Buffer.from(patchString, encoding),
    keys.privateKey
  );
  const header: PatchHeader = {
    key: generateSymmetricKey(),
    iv: generateIv(),
  };
  const headerString = JSON.stringify(header);
  const encryptedHeader = publicEncrypt(
    Buffer.from(destinationKey, encoding),
    Buffer.from(headerString, encoding)
  );
  const data = symmetricEncrypt(
    Buffer.from(patchString, encoding),
    header.key,
    header.iv
  );
  return {
    destinationKey: Buffer.from(destinationKey, encoding),
    senderKey: keys.publicKey,
    data,
    header: encryptedHeader,
    signature,
  };
};

export default encryptPatch;
