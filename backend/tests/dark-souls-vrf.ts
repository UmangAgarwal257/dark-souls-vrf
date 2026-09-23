import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { DarkSoulsVrf } from "../target/types/dark_souls_vrf";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";

const DEFAULT_BASE_QUEUE = new PublicKey(
  process.env.VRF_BASE_QUEUE || "Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh",
);
const VRF_PROGRAM_ID = new PublicKey(
  "Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz",
);

function vrfProgramIdentity(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("identity")],
    programId,
  )[0];
}

describe("dark-souls-vrf", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.DarkSoulsVrf as Program<DarkSoulsVrf>;
  const wallet = provider.wallet as anchor.Wallet;

  const PLAYER_SEED = "player";

  const playerPda = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(PLAYER_SEED), wallet.publicKey.toBuffer()],
    program.programId,
  )[0];

  before(async () => {
    console.log("Base Layer Connection:", provider.connection.rpcEndpoint);
    console.log("Player PDA:", playerPda.toString());
    console.log("Program ID:", program.programId.toString());
  });

  it("Initialize player", async () => {
    await program.methods
      .initialize()
      .accountsPartial({
        payer: wallet.publicKey,
        player: playerPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc({ skipPreflight: true, commitment: "confirmed" });

    const player = await program.account.player.fetch(playerPda);
    assert.isAtLeast(player.characterClass, 0);
    assert.isAtMost(player.characterClass, 3);
    console.log("✅ Player initialized successfully");
  });

  it("Generate character", async () => {
    const clientSeed = 42;
    const seedTag = `client_seed=${clientSeed}`;

    let resolveSig!: (sig: string) => void;
    const sigPromise = new Promise<string>((r) => {
      resolveSig = r;
    });
    const callbackSubId = provider.connection.onLogs(
      program.programId,
      (info) => {
        if (
          !info.err &&
          info.logs.some((l) => l.includes("CallbackGenerateCharacter")) &&
          info.logs.some((l) => l.includes(seedTag))
        ) {
          resolveSig(info.signature);
        }
      },
      "confirmed",
    );

    try {
      const tx = await program.methods
        .generateCharacter(clientSeed)
        .accountsPartial({
          payer: wallet.publicKey,
          player: playerPda,
          oracleQueue: DEFAULT_BASE_QUEUE,
          programIdentity: vrfProgramIdentity(program.programId),
          vrfProgram: VRF_PROGRAM_ID,
          slotHashes: anchor.web3.SYSVAR_SLOT_HASHES_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc({ skipPreflight: true, commitment: "confirmed" });

      console.log(`client_seed: ${clientSeed}`);
      console.log("generateCharacter tx:", tx);

      const start = Date.now();
      const sig = await Promise.race([
        sigPromise,
        new Promise<null>((r) => setTimeout(() => r(null), 15_000)),
      ]);

      if (!sig) {
        throw new Error("callbackGenerateCharacter not observed within 15s");
      }
      console.log(
        `callbackGenerateCharacter tx: ${sig} (after ${Date.now() - start}ms)`,
      );

      const player = await program.account.player.fetch(playerPda, "processed");
      const totalStats =
        player.vitality +
        player.strength +
        player.dexterity +
        player.intelligence;

      const classNames = ["Knight", "Sorcerer", "Pyromancer", "Thief"];
      const rarityNames = ["Common", "Rare", "Epic", "Legendary"];

      console.log("🎮 Generated Character:");
      console.log(
        `   Class: ${classNames[player.characterClass]} (${player.characterClass})`,
      );
      console.log(
        `   Rarity: ${rarityNames[player.rarity]} (${player.rarity})`,
      );
      console.log(
        `   Stats: VIT:${player.vitality} STR:${player.strength} DEX:${player.dexterity} INT:${player.intelligence}`,
      );
      console.log(`   Total Stats: ${totalStats}`);

      assert.isAtLeast(player.characterClass, 0);
      assert.isAtMost(player.characterClass, 3);
      assert.isAtLeast(player.rarity, 0);
      assert.isAtMost(player.rarity, 3);
      assert.isAbove(totalStats, 0);
      console.log("✅ Character generation test passed!");
    } finally {
      await provider.connection.removeOnLogsListener(callbackSubId);
    }
  });
});
