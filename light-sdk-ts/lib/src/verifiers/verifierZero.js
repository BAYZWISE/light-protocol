"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifierZero = void 0;
const anchor = __importStar(require("@project-serum/anchor"));
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("../constants");
const spl_token_1 = require("@solana/spl-token");
const constants_2 = require("../constants");
// TODO: Explore alternative architecture in which verifiers inherit/extend or include
// the Transaction class not the other way around like it is right now
class VerifierZero {
  constructor() {
    this.verifierProgram = constants_2.verifierProgramZero;
    // Does not work within sdk
    // TODO: bundle files in npm package
    this.wtnsGenPath = "./build-circuits/transactionMasp2_js/transactionMasp2";
    this.zkeyPath = `./build-circuits/transactionMasp2`;
    this.calculateWtns = require("../../build-circuits/transactionMasp2_js/witness_calculator.js");
    this.registeredVerifierPda = constants_2.REGISTERED_VERIFIER_PDA;
  }
  parsePublicInputsFromArray(transaction) {
    // console.log("here");
    console.log("this ", transaction);
    console.log("publicInputsBytes; ", transaction.publicInputsBytes.length);
    if (transaction.publicInputsBytes.length == 9) {
      return {
        root: transaction.publicInputsBytes[0],
        publicAmount: transaction.publicInputsBytes[1],
        extDataHash: transaction.publicInputsBytes[2],
        feeAmount: transaction.publicInputsBytes[3],
        mintPubkey: transaction.publicInputsBytes[4],
        nullifiers: [
          transaction.publicInputsBytes[5],
          transaction.publicInputsBytes[6],
        ],
        leaves: [
          [transaction.publicInputsBytes[7], transaction.publicInputsBytes[8]],
        ],
      };
    } else {
      throw `publicInputsBytes.length invalid ${transaction.publicInputsBytes.length} != 9`;
    }
  }
  // TODO: serializeTransaction for relayer
  sendTransaction(insert = true) {
    return __awaiter(this, void 0, void 0, function* () {
      // await this.getPdaAddresses();
      try {
        this.recipientBalancePriorTx = (yield (0, spl_token_1.getAccount)(
          this.provider.connection,
          this.recipient,
          spl_token_1.TOKEN_PROGRAM_ID
        )).amount;
      } catch (e) {
        // covers the case of the recipient being a native sol address not a spl token address
        try {
          this.recipientBalancePriorTx =
            yield this.provider.connection.getBalance(this.recipient);
        } catch (e) {}
      }
      this.recipientFeeBalancePriorTx =
        yield this.provider.connection.getBalance(this.recipientFee);
      // console.log("recipientBalancePriorTx: ", this.recipientBalancePriorTx);
      // console.log("recipientFeeBalancePriorTx: ", this.recipientFeeBalancePriorTx);
      // console.log("sender_fee: ", this.senderFee);
      this.senderFeeBalancePriorTx = yield this.provider.connection.getBalance(
        this.senderFee
      );
      this.relayerRecipientAccountBalancePriorLastTx =
        yield this.provider.connection.getBalance(this.relayerRecipient);
      // ain derived pda pubkey (Dz5VbR8yVXNg9DsSujFL9mE7U9zTkxBy9NPgH24CEocJ, 254)',
      // 'Program log: Passed-in pda pubkey 7youSP8CcfuvSWxGyJf1JVwaHux6k2Wq15dFPAJUTJvS',
      // 'Program log: Instruction data seed  [32, 221, 13, 181, 197, 157, 122, 91, 137, 50, 220, 253, 86, 14, 185, 235, 248, 65, 247, 142, 135, 232, 230, 228, 140, 194, 44, 128, 82, 67, 8, 147]',
      // "Program log: panicked at 'called `Result::unwrap()` on an `Err` value: InvalidInstructionData', programs/merkle_tree_program/src/verifier_invoked_instructions/insert_nullifier.rs:36:10",
      // 'Program JA5cjkRJ1euVi9xLWsCJVzsRzEkT8vcC4rqw9sVAo5d6 consumed 1196752 of 1196752 compute units',
      // 'Program failed to complete: SBF program panicked',
      // console.log("signingAddress:     ", this.relayerPubkey)
      // console.log("systemProgram:      ", SystemProgram.programId)
      // console.log("programMerkleTree:  ", this.merkleTreeProgram.programId)
      // console.log("rent:               ", DEFAULT_PROGRAMS.rent)
      // console.log("merkleTree:         ", this.merkleTreePubkey)
      // console.log("preInsertedLeavesInd", this.preInsertedLeavesIndex)
      // console.log("authority:          ", this.signerAuthorityPubkey)
      // console.log("tokenProgram:       ", TOKEN_PROGRAM_ID)
      // console.log("sender:             ", this.sender)
      // console.log("recipient:          ", this.recipient)
      console.log("senderFee:          ", this.senderFee);
      console.log(
        "senderFee account: ",
        yield this.provider.connection.getAccountInfo(
          this.senderFee,
          "confirmed"
        )
      );
      // console.log("recipientFee:       ", this.recipientFee)
      // console.log("relayerRecipient:   ", this.relayerRecipient)
      // console.log("escrow:             ", this.escrow)
      // console.log("tokenAuthority:     ", this.tokenAuthority)
      // console.log("registeredVerifierPd",this.registeredVerifierPda)
      // console.log("encryptedOutputs len ", this.encryptedOutputs.length);
      // console.log("this.encryptedOutputs[0], ", this.encryptedOutputs);
      console.log(
        "this.leavesPdaPubkeys ",
        this.leavesPdaPubkeys[0].toBase58()
      );
      console.log(
        "this.signerAuthorityPubkey ",
        this.signerAuthorityPubkey.toBase58()
      );
      console.log(
        "this.encryptedUtxos.slice(0,190) ",
        this.encryptedUtxos.slice(0, 190)
      );
      const ix = yield this.verifier.verifierProgram.methods
        .shieldedTransferInputs(
          Buffer.from(this.proofBytes),
          Buffer.from(this.publicInputs.publicAmount),
          this.publicInputs.nullifiers,
          this.publicInputs.leaves[0],
          Buffer.from(this.publicInputs.feeAmount),
          new anchor.BN(this.rootIndex.toString()),
          new anchor.BN(this.relayerFee.toString()),
          Buffer.from(this.encryptedUtxos.slice(0, 190)) // remaining bytes can be used once tx sizes increase
        )
        .accounts({
          signingAddress: this.relayerPubkey,
          systemProgram: web3_js_1.SystemProgram.programId,
          programMerkleTree: this.merkleTreeProgram.programId,
          rent: constants_1.DEFAULT_PROGRAMS.rent,
          merkleTree: this.merkleTreePubkey,
          preInsertedLeavesIndex: this.preInsertedLeavesIndex,
          authority: this.signerAuthorityPubkey,
          tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
          sender: this.sender,
          recipient: this.recipient,
          senderFee: this.senderFee,
          recipientFee: this.recipientFee,
          relayerRecipient: this.relayerRecipient,
          escrow: this.escrow,
          tokenAuthority: this.tokenAuthority,
          registeredVerifierPda: this.verifier.registeredVerifierPda,
        })
        .remainingAccounts([
          {
            isSigner: false,
            isWritable: true,
            pubkey: this.nullifierPdaPubkeys[0],
          },
          {
            isSigner: false,
            isWritable: true,
            pubkey: this.nullifierPdaPubkeys[1],
          },
          {
            isSigner: false,
            isWritable: true,
            pubkey: this.leavesPdaPubkeys[0],
          },
        ])
        .signers([this.payer])
        .instruction();
      console.log("this.payer: ", this.payer);
      let recentBlockhash = (yield this.provider.connection.getRecentBlockhash(
        "confirmed"
      )).blockhash;
      let txMsg = new web3_js_1.TransactionMessage({
        payerKey: this.payer.publicKey,
        instructions: [
          web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({
            units: 1400000,
          }),
          ix,
        ],
        recentBlockhash: recentBlockhash,
      });
      let lookupTableAccount = yield this.provider.connection.getAccountInfo(
        this.lookupTable,
        "confirmed"
      );
      let unpackedLookupTableAccount =
        web3_js_1.AddressLookupTableAccount.deserialize(
          lookupTableAccount.data
        );
      let compiledTx = txMsg.compileToV0Message([
        { state: unpackedLookupTableAccount },
      ]);
      compiledTx.addressTableLookups[0].accountKey = this.lookupTable;
      let transaction = new web3_js_1.VersionedTransaction(compiledTx);
      let retries = 3;
      let res;
      while (retries > 0) {
        transaction.sign([this.payer]);
        recentBlockhash = (yield this.provider.connection.getRecentBlockhash(
          "confirmed"
        )).blockhash;
        transaction.message.recentBlockhash = recentBlockhash;
        let serializedTx = transaction.serialize();
        try {
          console.log("serializedTx: ");
          res = yield (0, web3_js_1.sendAndConfirmRawTransaction)(
            this.provider.connection,
            serializedTx,
            {
              commitment: "confirmed",
              preflightCommitment: "confirmed",
            }
          );
          retries = 0;
        } catch (e) {
          retries--;
          if (retries == 0 || e.logs != undefined) {
            console.log(e);
            return e;
          }
        }
      }
      // storing utxos
      // this.outputUtxos.map((utxo) => {
      //   if (utxo.amounts[1] != 0 && utxo.assets[1] != this.feeAsset) {
      //       this.utxos.push(utxo)
      //   }
      //   if (utxo.amounts[0] != 0 && utxo.assets[0].toString() == this.feeAsset.toString()) {
      //     this.feeUtxos.push(utxo)
      //   }
      // })
      // this.inIndices = null;
      // // inserting output utxos into merkle tree
      // if (insert != "NOINSERT") {
      //   for (var i = 0; i<this.outputUtxos.length; i++) {
      //     this.merkleTree.update(this.merkleTreeLeavesIndex, this.outputUtxos[i].getCommitment())
      //     this.merkleTreeLeavesIndex++;
      //   }
      // }
      return res;
    });
  }
}
exports.VerifierZero = VerifierZero;