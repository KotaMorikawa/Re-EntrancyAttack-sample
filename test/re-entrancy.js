const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Attack", function () {
  it("Should empty the balance of the Good Contract", async function () {
    const goodContract = await ethers.deployContract("GoodContract");
    await goodContract.waitForDeployment();

    const badContract = await ethers.deployContract("BadContract", [
      goodContract.target,
    ]);
    await badContract.waitForDeployment();

    const [_, innocentUser, attacker] = await ethers.getSigners();

    const firstDeposit = ethers.parseEther("10");

    const goodTxn = await goodContract
      .connect(innocentUser)
      .addBalance({ value: firstDeposit });
    await goodTxn.wait();

    let goodContractBalance = await ethers.provider.getBalance(
      goodContract.target
    );
    expect(goodContractBalance).to.equal(firstDeposit);

    const atackTxn = await badContract
      .connect(attacker)
      .attack({ value: ethers.parseEther("1") });

    await atackTxn.wait();

    goodContractBalance = await ethers.provider.getBalance(goodContract.target);
    expect(goodContractBalance).to.equal(BigInt("0"));

    const badContractBalance = await ethers.provider.getBalance(
      badContract.target
    );
    expect(badContractBalance).to.equal(ethers.parseEther("11"));
  });
});
