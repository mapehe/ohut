import { Config } from "./types";

const home = require("os").homedir();

export const encoding = "utf8";

// Configuration
export const configDir = `${home}/.ohut`;
export const keysDir = `${configDir}/keys`;
export const privateKey = `${keysDir}/key`;
export const publicKey = `${keysDir}/key.pub`;
export const trustedKeysDir = `${configDir}/trusted_keys`;
export const configFile = `${configDir}/config.json`;
export const defaultConfig: Config = {
  servers: [],
};
export const configPadding = 4;
export const readlineTimeout = 100;
export const loadingSpinnerInterval = 100;

// Cryptography
export const symmetricAlgorithm = "aes-256-cbc";
export const signingAlgorithm = "RSA-SHA512";
export const hashAlgorithm = "sha256";
export const symmetricKeyBytes = 32;
export const ivBytes = 16;
export const keyType = "rsa";
export const keyOptions = {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
};
export const publicKeyLineCount = 14;

// Default args
export const defaultRefreshRate = 200;
export const defaultDebounceRate = 2000;
