/// <reference types="bn.js" />
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import VerifierProgramTwo from "../idls/verifier_program_two";
import VerifierProgramOne from "../idls/verifier_program_one";
import VerifierProgramZero from "../idls/verifier_program_zero";
import MerkleTreeProgram from "../idls/merkle_tree_program";
import { ConfirmOptions, Keypair, PublicKey } from "@solana/web3.js";
import { BigNumber } from "ethers";
export declare const ASSET_1_ORG: anchor.web3.Account;
export declare const ASSET_1: anchor.BN;
export declare const FIELD_SIZE: anchor.BN;
export declare const FIELD_SIZE_ETHERS: BigNumber;
export declare const MERKLE_TREE_SIGNER_AUTHORITY: any;
export declare const TYPE_PUBKEY: {
  array: (string | number)[];
};
export declare const TYPE_SEED: {
  defined: string;
};
export declare const TYPE_INIT_DATA: {
  array: (string | number)[];
};
export declare const merkleTreeProgramId: anchor.web3.PublicKey;
export declare const verifierProgramZeroProgramId: anchor.web3.PublicKey;
export declare const verifierProgramOneProgramId: anchor.web3.PublicKey;
export declare const verifierProgramTwoProgramId: anchor.web3.PublicKey;
export declare const merkleTreeProgram: Program<MerkleTreeProgram>;
export declare const verifierProgramZero: Program<VerifierProgramZero>;
export declare const verifierProgramOne: Program<VerifierProgramOne>;
export declare const verifierProgramTwo: Program<VerifierProgramTwo>;
export declare const confirmConfig: ConfirmOptions;
export declare const DEFAULT_ZERO =
  "14522046728041339886521211779101644712859239303505368468566383402165481390632";
export declare const PRIVATE_KEY: number[];
export declare const MERKLE_TREE_INIT_AUTHORITY: number[];
export declare const MINT_PRIVATE_KEY: Uint8Array;
export declare const MINT: any;
export declare const ADMIN_AUTH_KEY: PublicKey;
export declare const ADMIN_AUTH_KEYPAIR: Keypair;
export declare const AUTHORITY_SEED: Uint8Array;
export declare const DEFAULT_PROGRAMS: {
  systemProgram: any;
  tokenProgram: anchor.web3.PublicKey;
  associatedTokenProgram: anchor.web3.PublicKey;
  rent: any;
  clock: any;
};
export declare const userTokenAccount: any;
export declare const recipientTokenAccount: any;
export declare const ENCRYPTION_KEYPAIR: {
  PublicKey: Uint8Array;
  secretKey: Uint8Array;
};
export declare const USER_TOKEN_ACCOUNT: any;
export declare const RECIPIENT_TOKEN_ACCOUNT: any;
export declare const MERKLE_TREE_KEY: any;
export declare const REGISTERED_VERIFIER_PDA: any;
export declare const REGISTERED_VERIFIER_ONE_PDA: any;
export declare const REGISTERED_VERIFIER_TWO_PDA: any;
export declare const AUTHORITY: any;
export declare const AUTHORITY_ONE: any;
export declare const PRE_INSERTED_LEAVES_INDEX: any;
export declare const TOKEN_AUTHORITY: any;
export declare const REGISTERED_POOL_PDA_SPL: any;
export declare const REGISTERED_POOL_PDA_SPL_TOKEN: any;
export declare const REGISTERED_POOL_PDA_SOL: any;
export declare const POOL_TYPE: Uint8Array;
export declare const MERKLE_TREE_AUTHORITY_PDA: any;
export declare var KEYPAIR_PRIVKEY: anchor.BN;
export declare const MINT_CIRCUIT: anchor.BN;
export declare const FEE_ASSET: anchor.BN;