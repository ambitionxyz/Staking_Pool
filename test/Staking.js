const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
describe("Staking", function () {
  const deployStakingFixture = async () => {
    let defaulBalance = 1000000;
    // ethers.utils.parseEther("1000000");
    let address0 = "0x0000000000000000000000000000000000000000";
    let [account1, account2, acount3] = await ethers.getSigners();
    let stakingRewards;
    let rewardsToken;
    let stakingToken;

    const StakingToken = await ethers.getContractFactory("StakingToken");
    stakingToken = await StakingToken.deploy();
    await stakingToken.deployed();

    const RewardsToken = await ethers.getContractFactory("RewardsToken");
    rewardsToken = await RewardsToken.deploy();
    await rewardsToken.deployed();

    const StakingRewards = await ethers.getContractFactory("Staking");
    stakingRewards = await StakingRewards.deploy(
      stakingToken.address,
      rewardsToken.address,
      defaulBalance
    );
    await stakingToken.deployed();

    //chuyen rewardsToken sang contract
    await rewardsToken
      .connect(account1)
      .transfer(
        stakingRewards.address,
        rewardsToken.balanceOf(account1.address)
      );

    //chuyen tien sang acc2
    await stakingToken.transfer(
      account2.address,
      stakingToken.balanceOf(account1.address)
    );

    //approval token cho contract su dung
    await stakingToken
      .connect(account2)
      .approve(
        stakingRewards.address,
        stakingToken.balanceOf(account2.address)
      );

    return {
      stakingToken,
      stakingRewards,
      rewardsToken,
      account1,
      account2,
      acount3,
      address0,
      defaulBalance,
    };
  };

  describe("stake", function () {
    it("amount > 0", async () => {
      const { stakingRewards, account2 } = await loadFixture(
        deployStakingFixture
      );
      await expect(
        stakingRewards.connect(account2).stake(ethers.constants.Zero)
      ).to.be.revertedWith("amount = 0");
    });
    it("stake correctly", async () => {
      const { stakingToken, stakingRewards, account2 } = await loadFixture(
        deployStakingFixture
      );
      const balanceAccount2 = await stakingToken.balanceOf(account2.address);
      await stakingRewards.connect(account2).stake(balanceAccount2);
      expect(await stakingRewards.balanceOf(account2.address)).to.be.equal(
        balanceAccount2
      );
    });
  });
  describe("withdraw", () => {
    it("amount > 0", async () => {
      const {
        stakingToken,
        stakingRewards,
        rewardsToken,
        account1,
        account2,
        acount3,
        defaulBalance,
        address0,
      } = await loadFixture(deployStakingFixture);
      await stakingRewards.connect(account2).stake(defaulBalance);

      await expect(
        stakingRewards.connect(account2).withdraw(0)
      ).to.be.revertedWith("amount = 0");
    });

    it("withdraw correctly", async () => {
      const { stakingToken, stakingRewards, account2, defaulBalance } =
        await loadFixture(deployStakingFixture);
      await stakingRewards.connect(account2).stake(defaulBalance);
      await expect(
        stakingRewards.connect(account2).withdraw(100)
      ).to.changeTokenBalances(
        stakingToken,
        [stakingRewards, account2],
        [-100, 100]
      );
    });
  });
  describe("getReward", () => {
    it("getReward ", async () => {
      const { stakingRewards, rewardsToken, account2 } = await loadFixture(
        deployStakingFixture
      );
      await stakingRewards.connect(account2).stake(1000);
      await stakingRewards.connect(account2).getReward();
      await expect(
        stakingRewards.connect(account2).getReward()
      ).to.changeTokenBalances(
        rewardsToken,
        [stakingRewards, account2],
        [-1000, 1000]
      );
    });
  });
});
