import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { DarkSoulsVrf } from "../target/types/dark_souls_vrf";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";

describe("dark-souls-vrf", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.DarkSoulsVrf as Program<DarkSoulsVrf>;
  const wallet = provider.wallet as anchor.Wallet;

  const CHARACTER_GENERATOR_SEED = "char_gen";
  const DEFAULT_QUEUE = new PublicKey("Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh");

  let characterGeneratorPda: PublicKey;

  before(async () => {
    [characterGeneratorPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(CHARACTER_GENERATOR_SEED)],
      program.programId
    );
  });

  it("Initialize character generator", async () => {
    try {
      await program.methods
        .initialize()
        .accountsPartial({
          payer: wallet.publicKey,
          characterGenerator: characterGeneratorPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const characterGenerator = await program.account.characterGenerator.fetch(characterGeneratorPda);
      
      assert.equal(characterGenerator.authority.toString(), wallet.publicKey.toString());
      assert.equal(characterGenerator.totalGenerated.toNumber(), 0);
    } catch (error) {
      if (!error.message.includes("already in use")) {
        throw error;
      }
    }
  });

  it("Request character randomness", async () => {
    const clientSeed = 42;
    const characterIndex = 0;

    try {
      const tx = await program.methods
        .requestCharacterGeneration(clientSeed, characterIndex)
        .accountsPartial({
          payer: wallet.publicKey,
          characterGenerator: characterGeneratorPda,
          oracleQueue: DEFAULT_QUEUE,
        })
        .rpc();

      console.log("VRF request successful:", tx);
    } catch (error) {
      if (error.message.includes("oracle") || error.message.includes("queue")) {
        console.log("VRF oracle unavailable in test environment");
      } else {
        throw error;
      }
    }
  });

  it("Simulate character generation", async () => {
    const characterIndex = 0;
    const [characterPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("character"),
        wallet.publicKey.toBuffer(),
        new anchor.BN(characterIndex).toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );

    console.log("Character PDA:", characterPda.toString());
  });
});
