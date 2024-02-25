process.env.ANCHOR_PROVIDER_URL = "https://api.devnet.solana.com";

const anchor = require('@project-serum/anchor');
const { Keypair, PublicKey } = require('@solana/web3.js');

// The provided secret key
const secretKey = new Uint8Array([133,124,217,5,46,0,89,202,153,201,10,131,55,131,46,175,143,166,184,186,158,38,108,149,168,105,120,120,57,63,208,52,161,44,251,220,2,189,178,99,141,27,35,168,107,178,43,86,228,59,22,17,157,115,211,162,92,164,74,228,184,179,114,12]);
const walletKeypair = Keypair.fromSecretKey(secretKey);
const wallet = new anchor.Wallet(walletKeypair);

const publicKeyBase58 = walletKeypair.publicKey.toBase58();

console.log("test",publicKeyBase58)


// Directly use the provided IDL
const idl = {
  "version": "0.1.0",
  "name": "solsticio_space",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "baseAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "requestClaim",
      "accounts": [
        {
          "name": "baseAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "coords",
          "type": {
            "array": [
              "u8",
              2
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "BaseAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalClaims",
            "type": "u32"
          },
          {
            "name": "claims",
            "type": {
              "vec": {
                "defined": "Claim"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Claim",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "coords",
            "type": {
              "array": [
                "u8",
                2
              ]
            }
          },
          {
            "name": "result",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "metadata": {
    "address": "12NEHqQRyQ1nGcm12jbiFkbGLKFtWiZwAY6fhQ6dAiH7"
  }
}

async function main() {
  const provider = new anchor.AnchorProvider(
    new anchor.web3.Connection(process.env.ANCHOR_PROVIDER_URL, "processed"),
    wallet,
    { commitment: "processed" },
  );
  anchor.setProvider(provider);

  const programId = new PublicKey("12NEHqQRyQ1nGcm12jbiFkbGLKFtWiZwAY6fhQ6dAiH7");
  const program = new anchor.Program(idl, programId, provider);

  // You need to generate a new keypair for the baseAccount if it's a new account being initialized
  const baseAccount = Keypair.generate();

  console.log("baseAccount Public Key:", baseAccount.publicKey.toBase58());


  try {
    // Create the baseAccount on-chain before you can initialize it
    const tx = await program.rpc.initialize({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [baseAccount],
    });

    console.log("Successfully called initialize function!", tx);
  } catch (error) {
    console.error("Error calling initialize function:", error);
  }
}

main();
