import { encoding } from "../../../const/global";
import strings from "../../../const/strings";
import { EncryptedPatch, Keys, Patch, NamedKey } from "../../../const/types";
import decryptPatch from "./decryptPatch";
import { checkPatchHead, checkPatchSignature } from "./patchValidationUtils";

const decryptAndValidatePatch = async (
  encryptedPatch: EncryptedPatch,
  senderKeys: NamedKey[],
  keys: Keys
): Promise<Patch | undefined> => {
  const decryptedPatch = decryptPatch(encryptedPatch, keys);
  const { patch } = decryptedPatch;

  if (checkPatchSignature(decryptedPatch)) {
    if (
      senderKeys
        .map(({ key }) => key)
        .includes(decryptedPatch.senderKey.toString(encoding))
    ) {
      if (await checkPatchHead(patch)) {
        return patch;
      }
      const { name, email } = patch.author;
      throw strings.log.shared.warning.headMismatch(
        name || strings.common.unknown,
        email || strings.common.unknown
      );
    } else {
      throw strings.log.shared.warning.untrustedPatch;
    }
  } else {
    throw strings.log.shared.warning.invalidPatchSignature;
  }
};

export default decryptAndValidatePatch;
