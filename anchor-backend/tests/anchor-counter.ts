import * as anchor from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor"
import { expect } from "chai"
import { SolanaMultisig } from "../target/types/solana_multisig"
import { PublicKey } from '@solana/web3.js'


describe("multisig", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Multisig as Program<SolanaMultisig>;

  const multisigAccount = anchor.web3.Keypair.generate();
  const signer1 = anchor.web3.Keypair.generate();
  const signer2 = anchor.web3.Keypair.generate();
  const threshold = 2; // Requires two signatures



  it("Initializes a multisig account", async () => {
    // Assuming initialize function takes a list of signers and a threshold
    
    const tx = await program.methods
      .initialize([signer1.publicKey, signer2.publicKey], threshold)
      .accounts({
        multisigAccount: multisigAccount.publicKey,
      })
      .signers([multisigAccount])
      .rpc();

    const account = await program.account.multisig.fetch(multisigAccount.publicKey);
    expect(account.threshold).to.equal(threshold);
    expect(account.owners.length).to.equal(2);

    const owner1 = new PublicKey(signer1.publicKey.toBase58());
    const owner2 = new PublicKey(signer2.publicKey.toBase58());


    expect(account.owners[0]).to.equal(signer1.publicKey);
    expect(account.owners[1]).to.equal(signer2.publicKey);


  });

  it("Adds a transaction to the multisig account", async () => {
    // Assuming addTransaction is a method that adds a dummy transaction
    // For simplicity, the transaction data is arbitrary and not executing a real instruction
    const dummyTransactionData = new Uint8Array([0, 1, 2, 3]);
    await program.methods
      .addTransaction(dummyTransactionData)
      .accounts({
        multisigAccount: multisigAccount.publicKey,
      })
      .rpc();

    const account = await program.account.multisig.fetch(multisigAccount.publicKey);
    expect(account.transactions.length).to.equal(1);
    // Further checks can include validating the transaction data
  });

  it("Signs and executes a transaction", async () => {
    // This test will need to simulate or mock signing by the required threshold of signers
    // then attempt to execute the transaction. This might require more complex setup,
    // including possibly modifying the program for testability or using a different approach to simulate
    // the signing and execution process.
  });

  // Additional tests can be written to cover other scenarios and edge cases,
  // such as attempting to execute a transaction without enough signatures,
  // or adding and removing signers.
});