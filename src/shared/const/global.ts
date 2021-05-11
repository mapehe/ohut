import { Config } from "./types";

const home = require("os").homedir();

// Configuration
export const configDir = `${home}/.ohut`;
export const keysDir = `${home}/.ohut/keys`;
export const privateKey = `${home}/.ohut/keys/key`;
export const publicKey = `${home}/.ohut/keys/key.pkcs8`;
export const trustedKeysDir = `${home}/.ohut/trusted_keys`;
export const configFile = `${home}/.ohut/config.json`;
export const defaultConfig: Config = {
  servers: [],
};
export const configPadding = 4;
export const readlineTimeout = 100;
export const loadingSpinnerInterval = 100;

// Cryptography
export const symmetricAlgorithm = "aes-256-cbc";
export const signingAlgorithm = "RSA-SHA512";
export const localEncoding = "utf8";
export const transmissionEncoding = "base64";
export const symmetricKeyBytes = 32;
export const ivBytes = 16;
export const publicKeyLineCount = 11;

// Default args
export const defaultRefreshRate = 200;
export const defaultDebounceRate = 2000;
