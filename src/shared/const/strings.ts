import { defaultDebounceRate, defaultRefreshRate } from './global'

const strings = {
  cmd: {
    init: {
      command: 'init',
      desc: 'Initialize an ohut configuration.'
    },
    watch: {
      command: 'watch <server> [keys...]',
      desc:
        'Watch a git repository for patch updates. Send and receive updates from authors specified by trusted keys [keys...] using a saved relay server <server>.',
      boolean: {
        allKeys: {
          name: 'all',
          alias: 'a',
          describe: 'Use all trusted keys when emitting and receiving patches.'
        },
        passive: {
          name: 'passive',
          alias: 'p',
          describe: 'Only receive patches.'
        }
      },
      option: {
        refreshRate: {
          name: 'refresh-rate',
          alias: 'r',
          describe: 'Refresh rate when watching for new events.',
          default: defaultRefreshRate
        },
        password: {
          name: 'password',
          alias: 'P',
          describe: 'Server password.',
          default: ''
        },
        debounceRate: {
          name: 'debounce-rate',
          alias: 'd',
          describe:
            'Local file system event debounce rate. If the time interval between two local events is less than --debounce-rate they will be handled as a single event.',
          default: defaultDebounceRate
        },
        tmpFile: {
          name: 'tmp-file',
          alias: 't',
          describe: 'A temporary file used by ohut for storing patches.'
        }
      }
    },
    server: {
      command: 'server <command>',
      desc: 'Modify saved servers.',
      subcommand: {
        add: {
          command: 'add <name> <url>',
          desc: 'Add <url> to the saved servers as <name>.'
        },
        ls: {
          command: 'ls',
          desc: 'List your saved servers.'
        },
        mv: {
          command: 'mv <name> <updatedName>',
          desc: 'Rename a server <name> to <updatedName>.'
        },
        rm: {
          command: 'rm <name>',
          desc: 'Remove <name> from the saved servers.'
        }
      }
    },
    key: {
      command: 'key <command>',
      desc: 'Modify trusted keys.',
      subcommand: {
        trust: {
          command: 'trust [file]',
          desc:
            'Add a trusted key. Default to console input, read from file [file] instead if given.',
          boolean: {
            force: {
              name: 'force',
              alias: 'f',
              default: false
            }
          }
        },
        ls: {
          command: 'ls',
          desc: 'List your trusted keys.'
        },
        mv: {
          command: 'mv <name> <updatedName>',
          desc: 'Rename a trusted key <name> to <updatedName>.'
        },
        untrust: {
          command: 'untrust <keyName>',
          desc: 'Remove <keyName> from the trusted keys.'
        },
        print: {
          command: 'print',
          desc: 'Print your public key.'
        }
      }
    }
  },
  log: {
    cmd: {
      init: {
        info: {
          configCreated: (configDir: string) =>
            `A new configuration created to ${configDir}`
        },
        prompt: {
          email: 'Creating a key pair. Provide your email: ',
          confirmOverwrite: (configDir: string) =>
            `${configDir} exists. If you overwrite your private key will be lost forever. Overwrite (N/y)? `
        }
      },
      watch: {
        info: {
          applyPatch: (authorName: string, authorEmail: string) =>
            `Applying an updated patch from ${authorName} <${authorEmail}>.`,
          connectingTo: (host: string) =>
            `Establishing a connection to ${host}...`,
          generatingSessionPublicKey: (keyName: string) =>
            `Generating a session public key for ${keyName}...`,
          sessionEstablished: (keyName: string) => `Connected to ${keyName}.`
        },
        error: {
          notInGitRepo:
            'ERROR: ohut watch can only be ran at the root of a git repository.',
          noTrustedKeys: 'ERROR: No trusted keys provided.',
          invalidTrustedKeyName: (keyName: string) =>
            `ERROR: No such trusted key ${keyName}.`,
          noSuchServer: (serverName: string) =>
            `ERROR: No such server ${serverName}.`
        }
      },
      server: {
        subcommand: {
          add: {
            error: {
              duplicateName: 'A server with that name already exists.'
            }
          },
          mv: {
            error: {
              noSuchServer: (server: string) =>
                `ERROR: No such server ${server}.`,
              duplicateName: (server: string) =>
                `A server with name ${server} already exists.`
            }
          },
          rm: {
            prompt: {
              verify: (server: string) =>
                `Are you sure you want to remove ${server} from servers? (N/y) `
            },
            error: {
              noSuchServer: (server: string) =>
                `ERROR: No such server ${server}.`
            }
          }
        }
      },
      key: {
        subcommand: {
          trust: {
            info: {
              fileSuccess: (file: string, name: string) =>
                `Added ${file} to trusted keys as ${name}.`,
              consoleSuccess: (name: string) =>
                `Key added to trusted keys as ${name}.`
            },
            prompt: {
              fileVerify: (file: string) =>
                `Are you sure the key ${file} is from someone you trust? (N/y) `,
              pastePublicKey: 'Paste a public key:',
              consoleVerify:
                'Are you sure this key is from someone you trust? (N/y) ',
              dstFileNameFile: (file: string) =>
                `Provide a name for key ${file}: `,
              dstFileNameConsole: () => `Provide a name for the key: `,
              overwrite:
                'A key with that name already exists. Overwrite (N/y)? '
            },
            error: {
              invalidKeyFile: (file: string) =>
                `ERROR: Invalid key file ${file}.`,
              ownKeyError:
                'ERROR: That\'s your own public key. Adding your own public key to trusted keys may lead to unexpected behavior, run with "trust --force" to add anyway.',
              invalidKeyConsole: 'ERROR: Invalid key.',
              duplicateKey: (name: string) =>
                `You have already added that key as ${name}.`
            }
          },
          mv: {
            error: {
              noSuchKey: (keyName: string) =>
                `ERROR: No such trusted key ${keyName}.`,
              duplicateName: (keyName: string) =>
                `A key with the name ${keyName} already exists.`
            }
          },
          untrust: {
            prompt: {
              verify: (key: string) =>
                `Are you sure you want to remove ${key} from trusted keys? (N/y) `
            },
            error: {
              noSuchKey: (key: string) => `ERROR: No such key ${key}.`
            }
          }
        }
      }
    },
    shared: {
      info: {
        usingForce: 'Using --force, I sure hope you know what you are doing.'
      },
      warning: {
        untrustedPatch:
          'WARNING: Ignoring a patch from a sender whose patches you are not watching.',
        patchParseFailure: 'WARNING: Failed to parse patch data.',
        configParseFailure: 'WARNING: Failed to parse config data.',
        headerParseFailure: 'WARNING: Failed to parse header.',
        corruptedRequest: 'WARNING: Ignoring a corrupted request',
        headMismatch: (name: string, email: string) =>
          `WARNING: Ignoring a patch from ${name} <${email}> because they are in a different commit than you.`
      },
      error: {
        missingOrInvalidConfiguration: `ERROR: Missing or invalid configuration. Run "ohut init" to reinitailize.`,
        configWriteFailed: `ERROR: Failed to update config.`,
        unknownCommand: 'ERROR: Unknown command.'
      }
    }
  },
  common: {
    aborted: 'Aborted',
    unknown: 'unknown'
  }
}
export default strings
