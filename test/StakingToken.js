const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
describe("StakingToken", function () {
  const deployStakingTokenFixture = async () => {
    let [owner, account1, account2, acount3] = await ethers.getSigners();

    const StakingToken = await ethers.getContractFactory("StakingToken");
    let stakingToken = await StakingToken.deploy();

    return { StakingToken, stakingToken, owner, account1, account2, acount3 };
  };

  it("withdraw", async () => {
    const { StakingToken, stakingToken, owner, account1, account2, acount3 } =
      await loadFixture(deployStakingTokenFixture);

    // await expect(
    //   stakingToken.transfer(account2.address, 1)
    // ).to.changeTokenBalance(stakingToken, account2, 1);

    await expect(
      stakingToken.transfer(account2.address, 1)
    ).to.changeTokenBalances(stakingToken, [owner, account2], [-1, 1]);
  });
});
