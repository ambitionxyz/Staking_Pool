const { expect } = require("chai");
const { ethers } = require("hardhat");

// //use default BigNumber
// chai.use(require("chai-bignumber")());

// //use custom BigNumber
// chai.use(require("chai-bignumber")(BigNumber));

describe("StakingRewards", () => {
  let [account1, account2, account3] = [];
  let stakingRewards;
  let rewardsToken;
  let stakingToken;
  beforeEach(async () => {
    [account1, account2, account3] = await ethers.getSigners();

    const StakingToken = await ethers.getContractFactory("StakingToken");
    stakingToken = await StakingToken.deploy();
    await stakingToken.deployed();

    const RewardsToken = await ethers.getContractFactory("RewardsToken");
    rewardsToken = await RewardsToken.deploy();
    await rewardsToken.deployed();

    const StakingRewards = await ethers.getContractFactory("StakingRewards");
    stakingRewards = await StakingRewards.deploy(
      stakingToken.address,
      rewardsToken.address
    );

    await stakingToken.deployed();

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
    //chuyen rewardsToken sang contract
    await rewardsToken
      .connect(account1)
      .transfer(
        stakingRewards.address,
        rewardsToken.balanceOf(account1.address)
      );
  });
  //////////////////////////////////////

  describe("setRewardsDuration", () => {
    it("sender is owner", async () => {
      const setRewardsDurationTx = await stakingRewards
        .connect(account3)
        .setRewardsDuration(1000);
      await expect(setRewardsDurationTx).to.be.revertedWith("not authorized");
    });

    it("finishAt < block.timestamp", async () => {
      console.log("duration: " + (await stakingRewards.duration()));
      // await network.provider.send("evm_increaseTime", []);

      // const setRewardsDurationTx = await stakingRewards.setRewardsDuration(
      //   1000
      // );

      // const currentBlock = await ethers.provider.getBlockNumber();
      // const blockTimestamp = (await ethers.provider.getBlock(currentBlock))
      //   .timestamp;
      // console.log(blockTimestamp);
      // expect(setRewardsDurationTx).to.be.reverted;
    });

    it("setDuration correctly", async () => {
      await stakingRewards.connect(account1).setRewardsDuration(1000);
      expect(await stakingRewards.duration()).to.be.equal(1000);
    });
  });

  ////

  describe("notifyRewardAmount", () => {
    beforeEach(async () => {
      await stakingRewards.connect(account1).setRewardsDuration(1000);
      stakingToken
        .connect(account2)
        .approve(
          stakingRewards.address,
          stakingToken.balanceOf(account2.address)
        );
    });
    it("sender is owner", async () => {
      await expect(
        stakingRewards
          .connect(account2)
          .notifyRewardAmount(rewardsToken.balanceOf(stakingRewards.address))
      ).to.be.reverted;
    });

    it("reward rate = 0", async () => {
      await stakingRewards.notifyRewardAmount(
        rewardsToken.balanceOf(stakingRewards.address)
      );
      expect(await stakingRewards.rewardRate()).to.be.reverted;
    });
    it("reward amount > balance", async () => {
      //  rewardRate * duration <= rewardsToken.balanceOf(address(this)),
      const rewardRate = await stakingRewards.rewardRate();
      // console.log("reward rate = " + rewardRate);
      const duration = await stakingRewards.duration();
      // console.log("duration = " + duration);
      const balanceOfContract = await rewardsToken.balanceOf(
        stakingRewards.address
      );
      // console.log("balance of contract = " + balanceOfContract);
      expect(
        rewardRate.mul(ethers.BigNumber.from(duration))
      ).to.be.lessThanOrEqual(balanceOfContract);
    });

    it("notifyRewardAmount correctly", async () => {});
  });
  ////stake
  describe("stake", () => {
    beforeEach(async () => {
      await stakingRewards.connect(account1).setRewardsDuration(1000);
      stakingToken
        .connect(account2)
        .approve(
          stakingRewards.address,
          stakingToken.balanceOf(account2.address)
        );

      await stakingRewards.notifyRewardAmount(
        rewardsToken.balanceOf(stakingRewards.address)
      );
    });

    it("amount > 0", async () => {
      await expect(
        stakingRewards.connect(account2).stake(ethers.constants.Zero)
      ).to.be.revertedWith("amount = 0");
    });
    it("stake correctly", async () => {
      const balanceAccount2 = await stakingToken.balanceOf(account2.address);
      await stakingRewards.connect(account2).stake(balanceAccount2);
      expect(await stakingRewards.balanceOf(account2.address)).to.be.equal(
        balanceAccount2
      );
    });
  });

  ///
  describe("withdraw", () => {
    beforeEach(async () => {
      await stakingRewards.connect(account1).setRewardsDuration(1000);
      stakingToken
        .connect(account2)
        .approve(
          stakingRewards.address,
          stakingToken.balanceOf(account2.address)
        );

      await stakingRewards.notifyRewardAmount(
        rewardsToken.balanceOf(stakingRewards.address)
      );
      const balanceAccount2 = await stakingToken.balanceOf(account2.address);
      await stakingRewards.connect(account2).stake(balanceAccount2);
    });

    it("amount > 0", async () => {
      await expect(
        stakingRewards.connect(account2).withdraw(ethers.constants.Zero)
      ).to.be.revertedWith("amount = 0");
    });

    it("withdraw correctly", async () => {
      const withdrawTx = await stakingRewards.connect(account2).withdraw(100);
      expect(withdrawTx).to.be.emit(stakingRewards, "WithdrawCorect");
    });
  });

  // describe("earned", () => {
  //   it("")
  // });
});
