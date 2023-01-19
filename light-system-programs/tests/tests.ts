import * as anchor from "@coral-xyz/anchor";
import { SystemProgram, Keypair as SolanaKeypair } from "@solana/web3.js";
const solana = require("@solana/web3.js");
import _ from "lodash";
import { assert } from "chai";
const token = require("@solana/spl-token");
let circomlibjs = require("circomlibjs");

// TODO: add and use  namespaces in SDK
import {
  buildMerkleTree,
  MerkleTree,
  Transaction,
  VerifierZero,
  VerifierOne,
  Keypair,
  Utxo,
  newAccountWithLamports,
  executeUpdateMerkleTreeTransactions,
  executeMerkleTreeUpdateTransactions,
  createMintWrapper,
  getUninsertedLeaves,
  getInsertedLeaves,
  getUnspentUtxo,
  MerkleTreeConfig,
  checkMerkleTreeUpdateStateCreated,
  checkMerkleTreeBatchUpdateSuccess,
  ENCRYPTION_KEYPAIR,
  DEFAULT_PROGRAMS,
  setUpMerkleTree,
  initLookUpTableFromFile,
  hashAndTruncateToCircuit,
  MerkleTreeProgram,
  merkleTreeProgramId,
  MerkleTreeProgramIdl,
  MERKLE_TREE_KEY,
  ADMIN_AUTH_KEYPAIR,
  AUTHORITY,
  MINT,
  REGISTERED_POOL_PDA_SPL,
  REGISTERED_POOL_PDA_SOL,
  KEYPAIR_PRIVKEY,
  REGISTERED_VERIFIER_PDA,
  REGISTERED_VERIFIER_ONE_PDA,
  PRE_INSERTED_LEAVES_INDEX,
  REGISTERED_POOL_PDA_SPL_TOKEN,
  AUTHORITY_ONE,
  TOKEN_AUTHORITY,
  MERKLE_TREE_AUTHORITY_PDA,
  USER_TOKEN_ACCOUNT,
  RECIPIENT_TOKEN_ACCOUNT,
  createTestAccounts,
  userTokenAccount,
  recipientTokenAccount,
  FEE_ASSET,
  VerifierProgramZero,
  verifierProgramZeroProgramId,
  confirmConfig,
  TransactionParameters,
  LightInstance,
  Relayer,
  verifierProgramOneProgramId,
  SolMerkleTree,
} from "../../light-sdk-ts/src/index";

import { BN } from "@coral-xyz/anchor";

var LOOK_UP_TABLE;
var POSEIDON;
var RELAYER_RECIPIENT;

var SHIELDED_TRANSACTION;
var INVALID_SIGNER;
var INVALID_MERKLE_TREE_AUTHORITY_PDA;
var KEYPAIR;
var deposit_utxo1;

// TODO: remove deprecated function calls
describe("verifier_program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.AnchorProvider.local(
    "http://127.0.0.1:8899",
    confirmConfig
  ); //anchor.getProvider();
  const merkleTreeProgram: anchor.Program<MerkleTreeProgramIdl> =
    new anchor.Program(MerkleTreeProgram, merkleTreeProgramId);

  it("init pubkeys ", async () => {
    await createTestAccounts(provider.connection);
    LOOK_UP_TABLE = await initLookUpTableFromFile(provider);
    POSEIDON = await circomlibjs.buildPoseidonOpt();

    KEYPAIR = new Keypair({
      poseidon: POSEIDON,
      seed: KEYPAIR_PRIVKEY.toString(),
    });
    RELAYER_RECIPIENT = new anchor.web3.Account().publicKey;
    console.log("USER_TOKEN_ACCOUNT ", USER_TOKEN_ACCOUNT.publicKey.toBase58());
    console.log(
      "RECIPIENT_TOKEN_ACCOUNT ",
      RECIPIENT_TOKEN_ACCOUNT.publicKey.toBase58()
    );

    console.log("MERKLE_TREE_KEY ", MERKLE_TREE_KEY.toBase58());
    console.log("REGISTERED_VERIFIER_PDA ", REGISTERED_VERIFIER_PDA.toBase58());
    console.log(
      "REGISTERED_VERIFIER_ONE_PDA ",
      REGISTERED_VERIFIER_ONE_PDA.toBase58()
    );
    console.log("AUTHORITY ", AUTHORITY.toBase58());
    console.log("AUTHORITY_ONE ", AUTHORITY_ONE.toBase58());
    console.log(
      "PRE_INSERTED_LEAVES_INDEX ",
      PRE_INSERTED_LEAVES_INDEX.toBase58()
    );
    console.log("TOKEN_AUTHORITY ", TOKEN_AUTHORITY.toBase58());
    console.log("REGISTERED_POOL_PDA_SPL ", REGISTERED_POOL_PDA_SPL.toBase58());
    console.log(
      "REGISTERED_POOL_PDA_SPL_TOKEN ",
      REGISTERED_POOL_PDA_SPL_TOKEN.toBase58()
    );
    console.log("REGISTERED_POOL_PDA_SOL ", REGISTERED_POOL_PDA_SOL.toBase58());
    console.log(
      "MERKLE_TREE_AUTHORITY_PDA ",
      MERKLE_TREE_AUTHORITY_PDA.toBase58()
    );
  });

  it("Initialize Merkle Tree", async () => {
    await setUpMerkleTree(provider);
  });

  it.skip("Initialize Merkle Tree Test", async () => {
    const verifierProgramZero = new anchor.Program(
      VerifierProgramZero,
      verifierProgramZeroProgramId
    );
    // const verifierProgramOne = new anchor.Program(VerifierProgramOne, verifierProgramOneProgramId);

    // Security Claims
    // Init authority pda
    // - can only be inited by a hardcoded pubkey
    // Update authority pda
    // - can only be invoked by current authority
    //
    var merkleTreeAccountInfoInit = await provider.connection.getAccountInfo(
      MERKLE_TREE_KEY
    );
    console.log("merkleTreeAccountInfoInit ", merkleTreeAccountInfoInit);
    INVALID_SIGNER = new anchor.web3.Account();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        INVALID_SIGNER.publicKey,
        1_000_000_000_000
      ),
      "confirmed"
    );

    INVALID_MERKLE_TREE_AUTHORITY_PDA = solana.PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("MERKLE_TREE_AUTHORITY_INV")],
      merkleTreeProgram.programId
    )[0];
    let merkleTreeConfig = new MerkleTreeConfig({
      merkleTreePubkey: MERKLE_TREE_KEY,
      payer: ADMIN_AUTH_KEYPAIR,
      connection: provider.connection,
    });
    await merkleTreeConfig.getMerkleTreeAuthorityPda();

    let error;

    merkleTreeConfig.merkleTreeAuthorityPda = INVALID_MERKLE_TREE_AUTHORITY_PDA;
    try {
      await merkleTreeConfig.initMerkleTreeAuthority();
    } catch (e) {
      error = e;
    }
    await merkleTreeConfig.getMerkleTreeAuthorityPda();
    console.log(error);

    assert.isTrue(
      error.logs.includes(
        "Program log: AnchorError caused by account: merkle_tree_authority_pda. Error Code: ConstraintSeeds. Error Number: 2006. Error Message: A seeds constraint was violated."
      )
    );
    error = undefined;

    // init merkle tree with invalid signer
    try {
      await merkleTreeConfig.initMerkleTreeAuthority(INVALID_SIGNER);
      console.log("Registering AUTHORITY success");
    } catch (e) {
      error = e;
    }
    assert.equal(error.error.errorMessage, "InvalidAuthority");
    error = undefined;

    // initing real mt authority
    await merkleTreeConfig.initMerkleTreeAuthority();
    await merkleTreeConfig.initializeNewMerkleTree();

    let newAuthority = new anchor.web3.Account();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        newAuthority.publicKey,
        1_000_000_000_000
      ),
      "confirmed"
    );

    // update merkle tree with invalid signer
    merkleTreeConfig.payer = INVALID_SIGNER;
    try {
      await merkleTreeConfig.updateMerkleTreeAuthority(
        newAuthority.publicKey,
        true
      );
      console.log("Registering AUTHORITY success");
    } catch (e) {
      error = e;
    }
    assert.equal(error.error.errorMessage, "InvalidAuthority");
    error = undefined;
    merkleTreeConfig.payer = ADMIN_AUTH_KEYPAIR;

    // update merkle tree with INVALID_MERKLE_TREE_AUTHORITY_PDA
    merkleTreeConfig.merkleTreeAuthorityPda = INVALID_MERKLE_TREE_AUTHORITY_PDA;
    try {
      await merkleTreeConfig.updateMerkleTreeAuthority(
        newAuthority.publicKey,
        true
      );
      console.log("Registering AUTHORITY success");
    } catch (e) {
      error = e;
    }
    await merkleTreeConfig.getMerkleTreeAuthorityPda();
    assert.equal(
      error.error.errorMessage,
      "The program expected this account to be already initialized"
    );
    error = undefined;

    await merkleTreeConfig.updateMerkleTreeAuthority(newAuthority.publicKey);
    merkleTreeConfig.payer = newAuthority;
    await merkleTreeConfig.updateMerkleTreeAuthority(
      ADMIN_AUTH_KEYPAIR.publicKey
    );
    merkleTreeConfig.payer = ADMIN_AUTH_KEYPAIR;

    // invalid signer
    merkleTreeConfig.payer = INVALID_SIGNER;
    try {
      await merkleTreeConfig.registerVerifier(verifierProgramZero.programId);
    } catch (e) {
      error = e;
    }
    console.log(error);

    assert.equal(error.error.errorMessage, "InvalidAuthority");
    error = undefined;
    merkleTreeConfig.payer = ADMIN_AUTH_KEYPAIR;

    // invalid pda
    let tmp = merkleTreeConfig.registeredVerifierPdas[0].registeredVerifierPda;
    merkleTreeConfig.registeredVerifierPdas[0].registeredVerifierPda =
      INVALID_SIGNER.publicKey;
    try {
      await merkleTreeConfig.registerVerifier(verifierProgramZero.programId);
    } catch (e) {
      error = e;
    }
    console.log(error);

    assert.equal(error.error.origin, "registered_verifier_pda");
    merkleTreeConfig.registeredVerifierPdas[0].registeredVerifierPda = tmp;
    error = undefined;

    // update merkle tree with invalid signer
    merkleTreeConfig.payer = INVALID_SIGNER;
    try {
      await merkleTreeConfig.enableNfts(true);
    } catch (e) {
      error = e;
    }
    assert.equal(error.error.errorMessage, "InvalidAuthority");
    error = undefined;
    merkleTreeConfig.payer = ADMIN_AUTH_KEYPAIR;

    // update merkle tree with INVALID_MERKLE_TREE_AUTHORITY_PDA
    merkleTreeConfig.merkleTreeAuthorityPda = INVALID_MERKLE_TREE_AUTHORITY_PDA;
    try {
      await merkleTreeConfig.enableNfts(true);
    } catch (e) {
      error = e;
    }
    await merkleTreeConfig.getMerkleTreeAuthorityPda();
    assert.equal(
      error.error.errorMessage,
      "The program expected this account to be already initialized"
    );
    error = undefined;

    await merkleTreeConfig.enableNfts(true);

    let merkleTreeAuthority =
      await merkleTreeProgram.account.merkleTreeAuthority.fetch(
        merkleTreeConfig.merkleTreeAuthorityPda
      );
    assert.equal(merkleTreeAuthority.enableNfts, true);
    await merkleTreeConfig.enableNfts(false);
    merkleTreeAuthority =
      await merkleTreeProgram.account.merkleTreeAuthority.fetch(
        merkleTreeConfig.merkleTreeAuthorityPda
      );
    assert.equal(merkleTreeAuthority.enableNfts, false);

    // update lock duration with invalid signer
    console.log("here");

    merkleTreeConfig.payer = INVALID_SIGNER;
    try {
      await merkleTreeConfig.updateLockDuration(123);
    } catch (e) {
      error = e;
    }

    assert.equal(error.error.errorMessage, "InvalidAuthority");
    error = undefined;
    merkleTreeConfig.payer = ADMIN_AUTH_KEYPAIR;

    // update merkle tree with INVALID_MERKLE_TREE_AUTHORITY_PDA
    merkleTreeConfig.merkleTreeAuthorityPda = INVALID_MERKLE_TREE_AUTHORITY_PDA;
    try {
      await merkleTreeConfig.updateLockDuration(123);
    } catch (e) {
      error = e;
    }

    await merkleTreeConfig.getMerkleTreeAuthorityPda();
    assert.equal(
      error.error.errorMessage,
      "The program expected this account to be already initialized"
    );
    error = undefined;

    await merkleTreeConfig.updateLockDuration(123);

    await merkleTreeConfig.updateLockDuration(10);

    // update merkle tree with invalid signer
    merkleTreeConfig.payer = INVALID_SIGNER;
    try {
      await merkleTreeConfig.enablePermissionlessSplTokens(true);
    } catch (e) {
      error = e;
    }

    assert.equal(error.error.errorMessage, "InvalidAuthority");
    error = undefined;
    merkleTreeConfig.payer = ADMIN_AUTH_KEYPAIR;

    // update merkle tree with INVALID_MERKLE_TREE_AUTHORITY_PDA
    merkleTreeConfig.merkleTreeAuthorityPda = INVALID_MERKLE_TREE_AUTHORITY_PDA;
    try {
      await merkleTreeConfig.enablePermissionlessSplTokens(true);
    } catch (e) {
      error = e;
    }
    await merkleTreeConfig.getMerkleTreeAuthorityPda();

    assert.equal(
      error.error.errorMessage,
      "The program expected this account to be already initialized"
    );
    error = undefined;

    await merkleTreeConfig.enablePermissionlessSplTokens(true);

    merkleTreeAuthority =
      await merkleTreeProgram.account.merkleTreeAuthority.fetch(
        merkleTreeConfig.merkleTreeAuthorityPda
      );
    assert.equal(merkleTreeAuthority.enablePermissionlessSplTokens, true);
    await merkleTreeConfig.enablePermissionlessSplTokens(false);
    merkleTreeAuthority =
      await merkleTreeProgram.account.merkleTreeAuthority.fetch(
        merkleTreeConfig.merkleTreeAuthorityPda
      );
    assert.equal(merkleTreeAuthority.enablePermissionlessSplTokens, false);

    // update merkle tree with invalid signer
    merkleTreeConfig.payer = INVALID_SIGNER;
    try {
      await merkleTreeConfig.registerPoolType(new Uint8Array(32).fill(0));
    } catch (e) {
      error = e;
    }

    assert.equal(error.error.errorMessage, "InvalidAuthority");
    error = undefined;
    merkleTreeConfig.payer = ADMIN_AUTH_KEYPAIR;

    // update merkle tree with INVALID_MERKLE_TREE_AUTHORITY_PDA
    merkleTreeConfig.merkleTreeAuthorityPda = INVALID_MERKLE_TREE_AUTHORITY_PDA;
    try {
      await merkleTreeConfig.registerPoolType(new Uint8Array(32).fill(0));
    } catch (e) {
      error = e;
    }
    await merkleTreeConfig.getMerkleTreeAuthorityPda();

    assert.equal(
      error.error.errorMessage,
      "The program expected this account to be already initialized"
    );
    error = undefined;

    await merkleTreeConfig.registerPoolType(new Uint8Array(32).fill(0));

    let registeredPoolTypePdaAccount =
      await merkleTreeProgram.account.registeredPoolType.fetch(
        merkleTreeConfig.poolTypes[0].poolPda
      );

    assert.equal(
      registeredPoolTypePdaAccount.poolType.toString(),
      new Uint8Array(32).fill(0).toString()
    );

    // update merkle tree with invalid signer
    merkleTreeConfig.payer = INVALID_SIGNER;
    try {
      await merkleTreeConfig.registerSolPool(new Uint8Array(32).fill(0));
    } catch (e) {
      error = e;
    }
    console.log(error);

    assert.equal(error.error.errorMessage, "InvalidAuthority");
    error = undefined;
    merkleTreeConfig.payer = ADMIN_AUTH_KEYPAIR;

    // update merkle tree with INVALID_MERKLE_TREE_AUTHORITY_PDA
    merkleTreeConfig.merkleTreeAuthorityPda = INVALID_MERKLE_TREE_AUTHORITY_PDA;
    try {
      await merkleTreeConfig.registerSolPool(new Uint8Array(32).fill(0));
    } catch (e) {
      error = e;
    }
    await merkleTreeConfig.getMerkleTreeAuthorityPda();
    console.log("error ", error);

    assert.equal(
      error.error.errorMessage,
      "The program expected this account to be already initialized"
    );
    error = undefined;

    // valid
    await merkleTreeConfig.registerSolPool(new Uint8Array(32).fill(0));

    let registeredSolPdaAccount =
      await merkleTreeProgram.account.registeredAssetPool.fetch(
        merkleTreeConfig.poolPdas[0].pda
      );

    assert.equal(
      registeredSolPdaAccount.poolType.toString(),
      new Uint8Array(32).fill(0).toString()
    );
    assert.equal(registeredSolPdaAccount.index, 0);
    assert.equal(
      registeredSolPdaAccount.assetPoolPubkey.toBase58(),
      merkleTreeConfig.poolPdas[0].pda.toBase58()
    );

    let mint = await createMintWrapper({
      authorityKeypair: ADMIN_AUTH_KEYPAIR,
      connection: provider.connection,
    });

    // update merkle tree with invalid signer
    merkleTreeConfig.payer = INVALID_SIGNER;
    try {
      await merkleTreeConfig.registerSplPool(new Uint8Array(32).fill(0), mint);
    } catch (e) {
      error = e;
    }
    console.log(error);

    assert.equal(error.error.errorMessage, "InvalidAuthority");
    error = undefined;
    merkleTreeConfig.payer = ADMIN_AUTH_KEYPAIR;

    // update merkle tree with INVALID_MERKLE_TREE_AUTHORITY_PDA
    merkleTreeConfig.merkleTreeAuthorityPda = INVALID_MERKLE_TREE_AUTHORITY_PDA;
    try {
      await merkleTreeConfig.registerSplPool(new Uint8Array(32).fill(0), mint);
    } catch (e) {
      error = e;
    }
    await merkleTreeConfig.getMerkleTreeAuthorityPda();
    console.log("error ", error);

    assert.equal(
      error.error.errorMessage,
      "The program expected this account to be already initialized"
    );
    error = undefined;

    // valid
    await merkleTreeConfig.registerSplPool(new Uint8Array(32).fill(0), mint);
    console.log(merkleTreeConfig.poolPdas);

    let registeredSplPdaAccount =
      await merkleTreeProgram.account.registeredAssetPool.fetch(
        merkleTreeConfig.poolPdas[0].pda
      );
    registeredSplPdaAccount =
      await merkleTreeProgram.account.registeredAssetPool.fetch(
        merkleTreeConfig.poolPdas[merkleTreeConfig.poolPdas.length - 1].pda
      );

    console.log(registeredSplPdaAccount);

    assert.equal(
      registeredSplPdaAccount.poolType.toString(),
      new Uint8Array(32).fill(0).toString()
    );
    assert.equal(registeredSplPdaAccount.index.toString(), "1");
    assert.equal(
      registeredSplPdaAccount.assetPoolPubkey.toBase58(),
      merkleTreeConfig.poolPdas[
        merkleTreeConfig.poolPdas.length - 1
      ].token.toBase58()
    );

    let merkleTreeAuthority1 =
      await merkleTreeProgram.account.merkleTreeAuthority.fetch(
        merkleTreeConfig.merkleTreeAuthorityPda
      );
    console.log(merkleTreeAuthority1);
    assert.equal(merkleTreeAuthority1.registeredAssetIndex.toString(), "2");
    // let nftMint = await createMintWrapper({authorityKeypair: ADMIN_AUTH_KEYPAIR, nft: true, connection: provider.connection})

    // var userTokenAccount = (await newAccountWithTokens({
    //   connection: provider.connection,
    //   MINT: nftMint,
    //   ADMIN_AUTH_KEYPAIR,
    //   userAccount: new anchor.web3.Account(),
    //   amount: 1
    // }))
  });

  it.skip("Deposit 10 utxo", async () => {
    if (LOOK_UP_TABLE === undefined) {
      throw "undefined LOOK_UP_TABLE";
    }
    const lightInstance: LightInstance = {
      solMerkleTree: new SolMerkleTree({pubkey: MERKLE_TREE_KEY, poseidon: POSEIDON}),
      lookUpTable: LOOK_UP_TABLE,
      provider,
    };

    let balance = await provider.connection.getBalance(
      Transaction.getSignerAuthorityPda(
        merkleTreeProgram.programId,
        verifierProgramOneProgramId
      ),
      "confirmed"
    );
    if (balance === 0) {
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(
          Transaction.getSignerAuthorityPda(
            merkleTreeProgram.programId,
            verifierProgramOneProgramId
          ),
          1_000_000_000
        ),
        "confirmed"
      );
    }

    for (var i = 0; i < 1; i++) {
      console.log("Deposit with 10 utxos ", i);

      let depositAmount = 10_000 + Math.floor(Math.random() * 1_000_000_000);
      let depositFeeAmount = 10_000 + Math.floor(Math.random() * 1_000_000_000);

      await token.approve(
        provider.connection,
        ADMIN_AUTH_KEYPAIR,
        userTokenAccount,
        AUTHORITY_ONE, //delegate
        USER_TOKEN_ACCOUNT, // owner
        depositAmount * 2,
        [USER_TOKEN_ACCOUNT]
      );

      let tx = new Transaction({
        instance: lightInstance,
        payer: ADMIN_AUTH_KEYPAIR,
        shuffleEnabled: false,
      });

      let deposit_utxo1 = new Utxo({
        poseidon: POSEIDON,
        assets: [FEE_ASSET, MINT],
        amounts: [
          new anchor.BN(depositFeeAmount),
          new anchor.BN(depositAmount),
        ],
        keypair: KEYPAIR,
      });

      let txParams = new TransactionParameters({
        outputUtxos: [deposit_utxo1],
        merkleTreePubkey: MERKLE_TREE_KEY,
        sender: userTokenAccount,
        senderFee: ADMIN_AUTH_KEYPAIR.publicKey,
        verifier: new VerifierOne(),
      });
      await tx.compileAndProve(txParams);

      console.log("testTransaction Doesn't work");
      // await testTransaction({transaction: SHIELDED_TRANSACTION, deposit: true, enabledSignerTest: false, provider, signer: ADMIN_AUTH_KEYPAIR, REGISTERED_VERIFIER_ONE_PDA, REGISTERED_VERIFIER_PDA});

      try {
        let res = await tx.sendAndConfirmTransaction();
        console.log(res);
      } catch (e) {
        console.log(e);
      }
      try {
        await tx.checkBalances();
      } catch (e) {
        console.log(e);
      }
    }
  });

  it("Deposit", async () => {
    if (LOOK_UP_TABLE === undefined) {
      throw "undefined LOOK_UP_TABLE";
    }

    let depositAmount =
      10_000 + (Math.floor(Math.random() * 1_000_000_000) % 1_100_000_000);
    let depositFeeAmount =
      10_000 + (Math.floor(Math.random() * 1_000_000_000) % 1_100_000_000);
    try {
      await token.approve(
        provider.connection,
        ADMIN_AUTH_KEYPAIR,
        userTokenAccount,
        AUTHORITY, //delegate
        USER_TOKEN_ACCOUNT, // owner
        depositAmount * 2,
        [USER_TOKEN_ACCOUNT]
      );
    } catch (error) {
      console.log(error);
    }

    for (var i = 0; i < 1; i++) {
      console.log("Deposit ", i);

      let lightInstance: LightInstance = {
        solMerkleTree: new SolMerkleTree({pubkey: MERKLE_TREE_KEY, poseidon: POSEIDON}),
        lookUpTable: LOOK_UP_TABLE,
        provider,
      };

      let tx = new Transaction({
        instance: lightInstance,
        payer: ADMIN_AUTH_KEYPAIR,
        shuffleEnabled: false,
      });

      deposit_utxo1 = new Utxo({
        poseidon: POSEIDON,
        assets: [FEE_ASSET, MINT],
        amounts: [
          new anchor.BN(depositFeeAmount),
          new anchor.BN(depositAmount),
        ],
        keypair: KEYPAIR,
      });

      let txParams = new TransactionParameters({
        outputUtxos: [deposit_utxo1],
        merkleTreePubkey: MERKLE_TREE_KEY,
        sender: userTokenAccount,
        senderFee: ADMIN_AUTH_KEYPAIR.publicKey,
        verifier: new VerifierZero(),
      });
      await tx.compileAndProve(txParams);

      // await testTransaction({transaction: SHIELDED_TRANSACTION, provider, signer: ADMIN_AUTH_KEYPAIR, REGISTERED_VERIFIER_ONE_PDA, REGISTERED_VERIFIER_PDA});

      try {
        let res = await tx.sendAndConfirmTransaction();
        console.log(res);
      } catch (e) {
        console.log(e);
        console.log("AUTHORITY: ", AUTHORITY.toBase58());
      }
      try {
        await tx.checkBalances();
      } catch (e) {
        console.log(e);
      }
    }
  });

  it("Update Merkle Tree after Deposit", async () => {
    // fetch uninserted utxos from chain
    let leavesPdas = await SolMerkleTree.getUninsertedLeaves(MERKLE_TREE_KEY);

    let poseidon = await circomlibjs.buildPoseidonOpt();
    // build tree from chain
    let mtPrior = await SolMerkleTree.build({
      pubkey: MERKLE_TREE_KEY,
      poseidon,
    });

    await executeUpdateMerkleTreeTransactions({
      connection: provider.connection,
      signer: ADMIN_AUTH_KEYPAIR,
      merkleTreeProgram: merkleTreeProgram,
      leavesPdas: leavesPdas,
      merkleTree: mtPrior,
      merkle_tree_pubkey: MERKLE_TREE_KEY,
      provider,
    });
    let mtAfter = await merkleTreeProgram.account.merkleTree.fetch(
      MERKLE_TREE_KEY
    );

    let merkleTree = (await SolMerkleTree.build({
      pubkey: MERKLE_TREE_KEY,
      poseidon,
    })).merkleTree;
    //check correct insert
    assert.equal(
      new anchor.BN(
        mtAfter.roots[mtAfter.currentRootIndex],
        undefined,
        "le"
      ).toString(),
      merkleTree.root()
    );
  });

  it.skip("Update Merkle Tree Test", async () => {
    // Security Claims
    // CreateUpdateState
    // 1 leaves can only be inserted in the correct index order
    // 2 leaves cannot be inserted twice
    // 3 leaves are queued for a specific tree and can only be inserted in that tree
    // 4 lock is taken and cannot be taken again before expiry
    // 5 Merkle tree is registered
    //
    // Update
    // 6 signer is consistent
    // 7 is locked by update state account
    // 8 merkle tree is consistent
    //
    // Last Tx
    // 9 same leaves as in first tx are marked as inserted
    // 10 is in correct state
    // 11 is locked by update state account
    // 12 merkle tree is consistent
    // 13 signer is consistent

    const signer = ADMIN_AUTH_KEYPAIR;

    let mtFetched = await merkleTreeProgram.account.merkleTree.fetch(
      MERKLE_TREE_KEY
    );
    let error;

    // fetch uninserted utxos from chain
    let leavesPdas = await getUninsertedLeaves({
      merkleTreeProgram,
      merkleTreeIndex: mtFetched.nextIndex,
      connection: provider.connection,
    });

    let poseidon = await circomlibjs.buildPoseidonOpt();
    // build tree from chain
    let merkleTreeWithdrawal = await buildMerkleTree({
      connection: provider.connection,
      config: { x: 1 }, // rnd filler
      merkleTreePubkey: MERKLE_TREE_KEY,
      poseidonHash: poseidon,
    });

    let merkleTreeUpdateState = solana.PublicKey.findProgramAddressSync(
      [
        Buffer.from(new Uint8Array(signer.publicKey.toBytes())),
        anchor.utils.bytes.utf8.encode("storage"),
      ],
      merkleTreeProgram.programId
    )[0];
    let merkle_tree_pubkey = MERKLE_TREE_KEY;
    let connection = provider.connection;

    if (leavesPdas.length > 1) {
      // test leaves with higher starting index than merkle tree next index
      leavesPdas.reverse();
      try {
        const tx1 = await merkleTreeProgram.methods
          .initializeMerkleTreeUpdateState()
          .accounts({
            authority: signer.publicKey,
            merkleTreeUpdateState: merkleTreeUpdateState,
            systemProgram: DEFAULT_PROGRAMS.systemProgram,
            rent: DEFAULT_PROGRAMS.rent,
            merkleTree: merkle_tree_pubkey,
          })
          .remainingAccounts(leavesPdas)
          .preInstructions([
            solana.ComputeBudgetProgram.setComputeUnitLimit({
              units: 1_400_000,
            }),
          ])
          .signers([signer])
          .rpc(confirmConfig);
        console.log("success 0");
      } catch (e) {
        error = e;
      }
      assert(error.error.errorCode.code == "FirstLeavesPdaIncorrectIndex");

      leavesPdas.reverse();
      assert((await connection.getAccountInfo(merkleTreeUpdateState)) == null);

      console.log("Test property: 1");
      // Test property: 1
      // try with one leavespda of higher index
      try {
        const tx1 = await merkleTreeProgram.methods
          .initializeMerkleTreeUpdateState()
          .accounts({
            authority: signer.publicKey,
            merkleTreeUpdateState: merkleTreeUpdateState,
            systemProgram: SystemProgram.programId,
            rent: DEFAULT_PROGRAMS.rent,
            merkleTree: merkle_tree_pubkey,
          })
          .remainingAccounts(leavesPdas[1])
          .preInstructions([
            solana.ComputeBudgetProgram.setComputeUnitLimit({
              units: 1_400_000,
            }),
          ])
          .signers([signer])
          .rpc(confirmConfig);
        console.log("success 1");
      } catch (e) {
        console.log(e);
        error = e;
      }
      assert(error.error.errorCode.code == "FirstLeavesPdaIncorrectIndex");

      assert((await connection.getAccountInfo(merkleTreeUpdateState)) == null);
    } else {
      console.log("pdas.length <=" + 1 + " skipping some tests");
    }

    // Test property: 3
    // try with different Merkle tree than leaves are queued for
    // index might be broken it is wasn't set to mut didn't update
    let merkleTreeConfig = new MerkleTreeConfig({
      merkleTreePubkey: MERKLE_TREE_KEY,
      payer: ADMIN_AUTH_KEYPAIR,
      connection: provider.connection,
    });
    let different_merkle_tree = solana.PublicKey.findProgramAddressSync(
      [
        merkleTreeProgram.programId.toBuffer(),
        new anchor.BN(1).toArray("le", 8),
      ],
      merkleTreeProgram.programId
    )[0];
    if ((await connection.getAccountInfo(different_merkle_tree)) == null) {
      await merkleTreeConfig.initializeNewMerkleTree(different_merkle_tree);
      console.log("created new merkle tree");
    }

    try {
      const tx1 = await merkleTreeProgram.methods
        .initializeMerkleTreeUpdateState()
        .accounts({
          authority: signer.publicKey,
          merkleTreeUpdateState: merkleTreeUpdateState,
          systemProgram: SystemProgram.programId,
          rent: DEFAULT_PROGRAMS.rent,
          merkleTree: different_merkle_tree,
        })
        .remainingAccounts(leavesPdas)
        .preInstructions([
          solana.ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
        ])
        .signers([signer])
        .rpc(confirmConfig);
      console.log("success 3");
    } catch (e) {
      console.log(e);
      error = e;
    }
    assert(error.error.errorCode.code == "LeavesOfWrongTree");
    assert((await connection.getAccountInfo(merkleTreeUpdateState)) == null);
    error = undefined;

    // correct
    try {
      const tx1 = await merkleTreeProgram.methods
        .initializeMerkleTreeUpdateState()
        .accounts({
          authority: signer.publicKey,
          merkleTreeUpdateState: merkleTreeUpdateState,
          systemProgram: SystemProgram.programId,
          rent: DEFAULT_PROGRAMS.rent,
          merkleTree: merkle_tree_pubkey,
        })
        .remainingAccounts([leavesPdas[0]])
        .preInstructions([
          solana.ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
        ])
        .signers([signer])
        .rpc(confirmConfig);
    } catch (e) {
      error = e;
      console.log(error);
    }
    // should not be an error
    assert(error === undefined);
    console.log("created update state ", merkleTreeUpdateState.toBase58());

    assert((await connection.getAccountInfo(merkleTreeUpdateState)) != null);

    await checkMerkleTreeUpdateStateCreated({
      connection: connection,
      merkleTreeUpdateState,
      MerkleTree: merkle_tree_pubkey,
      relayer: signer.publicKey,
      leavesPdas: [leavesPdas[0]],
      current_instruction_index: 1,
      merkleTreeProgram,
    });
    console.log("executeMerkleTreeUpdateTransactions 10");

    await executeMerkleTreeUpdateTransactions({
      signer,
      merkleTreeProgram,
      merkle_tree_pubkey,
      provider,
      merkleTreeUpdateState,
      numberOfTransactions: 10,
    });
    console.log("checkMerkleTreeUpdateStateCreated 22");

    await checkMerkleTreeUpdateStateCreated({
      connection: connection,
      merkleTreeUpdateState,
      MerkleTree: merkle_tree_pubkey,
      relayer: signer.publicKey,
      leavesPdas: [leavesPdas[0]],
      current_instruction_index: 22, // 22 becaue one tx executes two instructions, it started out in ix index 1 and increments at the end of a tx
      merkleTreeProgram,
    });

    // Test property: 6
    // trying to use merkleTreeUpdateState with different signer

    let maliciousSigner = await newAccountWithLamports(provider.connection);
    console.log("maliciousSigner: ", maliciousSigner.publicKey.toBase58());

    let maliciousMerkleTreeUpdateState =
      solana.PublicKey.findProgramAddressSync(
        [
          Buffer.from(new Uint8Array(maliciousSigner.publicKey.toBytes())),
          anchor.utils.bytes.utf8.encode("storage"),
        ],
        merkleTreeProgram.programId
      )[0];
    let s = false;
    error = await executeMerkleTreeUpdateTransactions({
      signer: maliciousSigner,
      merkleTreeProgram,
      merkle_tree_pubkey,
      provider,
      merkleTreeUpdateState,
      numberOfTransactions: 1,
    });
    console.log(error);

    assert(
      error.logs.includes(
        "Program log: AnchorError caused by account: authority. Error Code: InvalidAuthority. Error Number: 6016. Error Message: InvalidAuthority."
      )
    );

    // Test property: 4
    // try to take lock
    try {
      const tx1 = await merkleTreeProgram.methods
        .initializeMerkleTreeUpdateState()
        .accounts({
          authority: maliciousSigner.publicKey,
          merkleTreeUpdateState: maliciousMerkleTreeUpdateState,
          systemProgram: SystemProgram.programId,
          rent: DEFAULT_PROGRAMS.rent,
          merkleTree: merkle_tree_pubkey,
        })
        .remainingAccounts([leavesPdas[0]])
        .signers([maliciousSigner])
        .rpc(confirmConfig);
    } catch (e) {
      error = e;
      console.log(e);
    }
    assert(error.error.errorCode.code == "ContractStillLocked");

    // Test property: 10
    // try insert root before completing update transaction
    try {
      await merkleTreeProgram.methods
        .insertRootMerkleTree(new anchor.BN(254))
        .accounts({
          authority: signer.publicKey,
          merkleTreeUpdateState: merkleTreeUpdateState,
          merkleTree: merkle_tree_pubkey,
        })
        .signers([signer])
        .rpc(confirmConfig);
    } catch (e) {
      error = e;
    }
    assert(error.error.errorCode.code == "MerkleTreeUpdateNotInRootInsert");

    // sending additional tx to finish the merkle tree update
    await executeMerkleTreeUpdateTransactions({
      signer,
      merkleTreeProgram,
      merkle_tree_pubkey,
      provider,
      merkleTreeUpdateState,
      numberOfTransactions: 50,
    });

    await checkMerkleTreeUpdateStateCreated({
      connection: connection,
      merkleTreeUpdateState,
      MerkleTree: merkle_tree_pubkey,
      relayer: signer.publicKey,
      leavesPdas: [leavesPdas[0]],
      current_instruction_index: 56,
      merkleTreeProgram,
    });

    // Test property: 11
    // final tx to insert root different UNREGISTERED_MERKLE_TREE
    try {
      console.log("final tx to insert root into different_merkle_tree");
      await merkleTreeProgram.methods
        .insertRootMerkleTree(new anchor.BN(254))
        .accounts({
          authority: signer.publicKey,
          merkleTreeUpdateState: merkleTreeUpdateState,
          merkleTree: different_merkle_tree,
        })
        .signers([signer])
        .rpc(confirmConfig);
    } catch (e) {
      error = e;
    }
    assert(error.error.errorCode.code == "ContractStillLocked");

    // Test property: 13
    // final tx to insert root different signer
    try {
      await merkleTreeProgram.methods
        .insertRootMerkleTree(new anchor.BN(254))
        .accounts({
          authority: maliciousSigner.publicKey,
          merkleTreeUpdateState: merkleTreeUpdateState,
          merkleTree: merkle_tree_pubkey,
        })
        .signers([maliciousSigner])
        .rpc(confirmConfig);
    } catch (e) {
      error = e;
    }
    assert(error.error.errorCode.code == "InvalidAuthority");

    var merkleTreeAccountPrior =
      await merkleTreeProgram.account.merkleTree.fetch(merkle_tree_pubkey);

    let merkleTree = await buildMerkleTree({
      connection: provider.connection,
      config: { x: 1 }, // rnd filler
      merkleTreePubkey: MERKLE_TREE_KEY,
      poseidonHash: poseidon,
    });

    // insert correctly
    await merkleTreeProgram.methods
      .insertRootMerkleTree(new anchor.BN(254))
      .accounts({
        authority: signer.publicKey,
        merkleTreeUpdateState: merkleTreeUpdateState,
        merkleTree: merkle_tree_pubkey,
      })
      .signers([signer])
      .rpc(confirmConfig);
    console.log("merkleTreeUpdateState ", merkleTreeUpdateState);
    console.log("merkleTreeAccountPrior ", merkleTreeAccountPrior);
    console.log("leavesPdas[0] ", leavesPdas[0]);
    console.log("merkleTree ", merkleTree);
    console.log("merkle_tree_pubkey ", merkle_tree_pubkey);

    await checkMerkleTreeBatchUpdateSuccess({
      connection: provider.connection,
      merkleTreeUpdateState: merkleTreeUpdateState,
      merkleTreeAccountPrior,
      numberOfLeaves: 2,
      leavesPdas: [leavesPdas[0]],
      merkleTree: merkleTree,
      merkle_tree_pubkey: merkle_tree_pubkey,
      merkleTreeProgram,
    });

    console.log("Test property: 2");

    // Test property: 2
    // try to reinsert leavesPdas[0]
    try {
      const tx1 = await merkleTreeProgram.methods
        .initializeMerkleTreeUpdateState()
        .accounts({
          authority: signer.publicKey,
          merkleTreeUpdateState: merkleTreeUpdateState,
          systemProgram: SystemProgram.programId,
          rent: DEFAULT_PROGRAMS.rent,
          merkleTree: merkle_tree_pubkey,
        })
        .remainingAccounts([leavesPdas[0]])
        .preInstructions([
          solana.ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
        ])
        .signers([signer])
        .rpc(confirmConfig);
    } catch (e) {
      error = e;
    }
    assert(error.error.errorCode.code == "LeafAlreadyInserted");
  });

  // only works at the first try because the tests takes utxo in pos 0
  it("Withdraw", async () => {
    const poseidon = await circomlibjs.buildPoseidonOpt();
    let merkleTree = await SolMerkleTree.build({pubkey: MERKLE_TREE_KEY, poseidon})
    let leavesPdas = await SolMerkleTree.getInsertedLeaves(MERKLE_TREE_KEY);

    let decryptedUtxo1 = await getUnspentUtxo(
      leavesPdas,
      provider,
      ENCRYPTION_KEYPAIR,
      KEYPAIR,
      FEE_ASSET,
      MINT,
      POSEIDON,
      merkleTreeProgram
    );
    decryptedUtxo1.getCommitment();
    
    const origin = new anchor.web3.Account();
    var tokenRecipient = recipientTokenAccount;
    
    let lightInstance: LightInstance = {
      solMerkleTree: merkleTree,
      lookUpTable: LOOK_UP_TABLE,
      provider,
    };
    let relayer = new Relayer(
      ADMIN_AUTH_KEYPAIR.publicKey,
      lightInstance.lookUpTable,
      SolanaKeypair.generate().publicKey,
      new BN(100000)
    );

    let tx = new Transaction({
      instance: lightInstance,
      relayer,
      payer: ADMIN_AUTH_KEYPAIR,
      shuffleEnabled: false,
    });

    let txParams = new TransactionParameters({
      inputUtxos: [decryptedUtxo1],
      merkleTreePubkey: MERKLE_TREE_KEY,
      recipient: tokenRecipient,
      recipientFee: origin.publicKey,
      verifier: new VerifierZero(),
    });

    await tx.compileAndProve(txParams);

    // await testTransaction({transaction: SHIELDED_TRANSACTION, deposit: false,provider, signer: ADMIN_AUTH_KEYPAIR, REGISTERED_VERIFIER_ONE_PDA, REGISTERED_VERIFIER_PDA});

    // TODO: add check in client to avoid rent exemption issue
    // add enough funds such that rent exemption is ensured
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        relayer.accounts.relayerRecipient,
        1_000_000
      ),
      "confirmed"
    );
    try {
      let res = await tx.sendAndConfirmTransaction();
      console.log(res);
    } catch (e) {
      console.log(e);
      console.log("AUTHORITY: ", AUTHORITY.toBase58());
    }
    await tx.checkBalances();
  });

  // doesn't work program runs out of memory
  it.skip("Withdraw 10 utxos", async () => {
    POSEIDON = await circomlibjs.buildPoseidonOpt();

    let mtFetched = await merkleTreeProgram.account.merkleTree.fetch(
      MERKLE_TREE_KEY
    );
    let merkleTree = await buildMerkleTree({
      connection: provider.connection,
      config: { x: 1 }, // rnd filler
      merkleTreePubkey: MERKLE_TREE_KEY,
      poseidonHash: POSEIDON,
    });

    // get inserted leaves
    let leavesPdas = await getInsertedLeaves({
      merkleTreeProgram,
      merkleTreeIndex: mtFetched.nextIndex,
      connection: provider.connection,
    });
    let decryptedUtxo1 = await getUnspentUtxo(
      leavesPdas,
      provider,
      ENCRYPTION_KEYPAIR,
      KEYPAIR,
      FEE_ASSET,
      hashAndTruncateToCircuit(MINT.toBytes()),
      POSEIDON,
      merkleTreeProgram
    );

    const origin = new anchor.web3.Account();

    var tokenRecipient = recipientTokenAccount;

    SHIELDED_TRANSACTION = new Transaction({
      payer: ADMIN_AUTH_KEYPAIR,
      encryptionKeypair: ENCRYPTION_KEYPAIR,

      // four static config fields
      merkleTree,
      provider,
      lookupTable: LOOK_UP_TABLE,

      relayerRecipient: ADMIN_AUTH_KEYPAIR.publicKey,
      shuffleEnabled: false,
      poseidon: POSEIDON,
      verifier: new VerifierOne(),
    });

    let outputUtxos = [];

    let inputUtxos = [];
    inputUtxos.push(decryptedUtxo1);
    inputUtxos.push(new Utxo({ poseidon: POSEIDON }));
    inputUtxos.push(new Utxo({ poseidon: POSEIDON }));
    inputUtxos.push(new Utxo({ poseidon: POSEIDON }));

    await SHIELDED_TRANSACTION.compileTransaction({
      inputUtxos: inputUtxos,
      outputUtxos: outputUtxos,
      action: "WITHDRAWAL",
      assetPubkeys: [new BN(0), hashAndTruncateToCircuit(MINT.toBytes())],
      mintPubkey: hashAndTruncateToCircuit(MINT.toBytes()),
      recipientFee: origin.publicKey,
      recipient: tokenRecipient,
      merkleTreeAssetPubkey: REGISTERED_POOL_PDA_SPL_TOKEN,
      relayerFee: new anchor.BN("10000"),
      config: { in: 10, out: 2 },
    });

    await SHIELDED_TRANSACTION.getProof();

    // await testTransaction({transaction: SHIELDED_TRANSACTION, deposit: false, enabledSignerTest: false, provider, signer: ADMIN_AUTH_KEYPAIR, REGISTERED_VERIFIER_ONE_PDA, REGISTERED_VERIFIER_PDA});

    try {
      let res = await SHIELDED_TRANSACTION.sendAndConfirmTransaction();
      console.log(res);
    } catch (e) {
      console.log(e);
      console.log("AUTHORITY: ", AUTHORITY.toBase58());
    }
    await SHIELDED_TRANSACTION.checkBalances();
  });
});