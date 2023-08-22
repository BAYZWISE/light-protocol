import { it } from "mocha";
import { Prover } from "../src";
let circomlibjs = require("circomlibjs");
import { IDL } from "./circuits/idl";
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
import { expect } from "chai";

describe("Prover Functionality Tests", () => {
  it("Valid proof test", async () => {
    const poseidon = await circomlibjs.buildPoseidon();
    const hash = poseidon.F.toString(poseidon([123]));

    const circuitsPath: string = "./tests/circuits/build-circuits/";
    const proofInputs: any = {
      x: 123,
      hash: hash,
    };

    const prover = new Prover(IDL, circuitsPath);

    await prover.addProofInputs(proofInputs);

    console.time("Proof generation + Parsing");
    await prover.fullProveAndParse();
    console.timeEnd("Proof generation + Parsing");
  });

  it("Testing invalid proof", async () => {
    const poseidon = await circomlibjs.buildPoseidon();
    const hash = poseidon.F.toString(poseidon([123]));

    const circuitsPath: string = "./tests/circuits/build-circuits/";
    const proofInputs: any = {
      x: 1,
      hash: hash,
    };

    const prover = new Prover(IDL, circuitsPath);

    await prover.addProofInputs(proofInputs);

    console.time("Proof generation + Parsing");
    expect(await prover.fullProveAndParse()).to.Throw();
    console.timeEnd("Proof generation + Parsing");
  });
});