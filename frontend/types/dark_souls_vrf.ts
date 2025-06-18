/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/dark_souls_vrf.json`.
 */
export type DarkSoulsVrf = {
  "address": "3yFrLcHmwCpNjeSR4sFNVd1K3BTzwVc3Nz13ToeHnRfs",
  "metadata": {
    "name": "darkSoulsVrf",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "callbackGenerateCharacter",
      "discriminator": [
        189,
        241,
        11,
        143,
        19,
        22,
        126,
        239
      ],
      "accounts": [
        {
          "name": "vrfProgramIdentity",
          "signer": true
        },
        {
          "name": "player",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "randomness",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "generateCharacter",
      "discriminator": [
        20,
        98,
        39,
        214,
        60,
        33,
        112,
        158
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "player"
        },
        {
          "name": "oracleQueue",
          "writable": true
        },
        {
          "name": "programIdentity"
        },
        {
          "name": "vrfProgram"
        },
        {
          "name": "slotHashes"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "clientSeed",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "player",
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "player",
      "discriminator": [
        205,
        222,
        112,
        7,
        165,
        155,
        206,
        218
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "characterAlreadyExists",
      "msg": "Character already exists"
    }
  ],
  "types": [
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "characterClass",
            "type": "u8"
          },
          {
            "name": "vitality",
            "type": "u8"
          },
          {
            "name": "strength",
            "type": "u8"
          },
          {
            "name": "dexterity",
            "type": "u8"
          },
          {
            "name": "intelligence",
            "type": "u8"
          },
          {
            "name": "rarity",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
