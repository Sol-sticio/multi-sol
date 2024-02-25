import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import { SolsticioSpace } from "../target/types/solsticio_space"; // Adjust the import to match your actual program IDL name

describe("solana-vrf-example", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolsticioSpace as Program<SolsticioSpace>;

  const baseAccount = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    await program.methods
      .initialize()
      .accounts({
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([baseAccount])
      .rpc();

    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    expect(account.totalClaims).to.equal(0);
    expect(account.claims.length).to.equal(0);
  });

  it("Request claim successfully", async () => {
    // Coordinates and URI for the claim
    const uri = "https://example.com/uri";
    const coords = [0, 0]; // Example coordinates

    await program.methods
      .requestClaim(uri, coords)
      .accounts({
        baseAccount: baseAccount.publicKey,
      })
      .rpc();

    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    expect(account.totalClaims).to.equal(1);
    expect(account.claims.length).to.equal(1);
    expect(account.claims[0].uri).to.equal(uri);
    expect(account.claims[0].coords).to.eql(coords);
    expect(account.claims[0].result).to.be.oneOf([true, false]); // Since result is based on randomness
  });

});
