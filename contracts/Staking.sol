//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract Staking {
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardsToken;

    address public owner;

    // thoi han phan thuong
    uint public duration;
    // Timestamp of when the rewards finish
    uint public finishAt;
    // Minimum of last updated time and reward finish time
    uint public updatedAt;
    // tien thuong moi s
    uint public rewardRate;
    // Sum of (reward rate * dt * 1e18 / total supply)
    // sử dụng để lưu trữ giá trị thưởng đã được cập nhật cho mỗi đơn vị token (tức là giá trị thưởng mà mỗi token đang giữ).
    uint public rewardPerTokenStored;
    // User address => lưu trữ số tiền thưởng đã được trả cho mỗi token được stake của từng người dùng trong quá khứ
    mapping(address => uint) public userRewardPerTokenPaid;
    // User address => rewards to be claimed phan thuong kiem dược
    mapping(address => uint) public rewards;
    // Total staked
    uint public totalSupply;
    // User address => staked amount
    mapping(address => uint) public balanceOf;

    constructor(address _stakingToken, address _rewardToken, uint _amount) {
        owner = msg.sender;
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardToken);
        duration = 1000;
        rewardRate = _amount / duration;
        updatedAt = block.timestamp;
        finishAt = block.timestamp + duration;
    }

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();
        // if (_account != address(0)) {
        rewards[_account] = earned(_account);
        userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        // }
        _;
    }

    function stake(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount = 0");
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        balanceOf[msg.sender] += _amount;
        totalSupply += _amount;
    }

    function withdraw(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount = 0");
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        stakingToken.transfer(msg.sender, _amount);
    }

    function lastTimeRewardApplicable() public view returns (uint) {
        return _min(block.timestamp, finishAt);
    }

    //tính toán số tiền phần thưởng (reward) mỗi token đã được thêm vào
    function rewardPerToken() public view returns (uint) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (rewardRate * (lastTimeRewardApplicable() - updatedAt) * 1e18) /
            totalSupply;
    }

    //xem tien thuong
    function earned(address _account) public view returns (uint) {
        // rewardPerToken tính từ thời điểm xem  + đã lưu từ trước
        return
            ((balanceOf[_account] *
                ((rewardPerToken() - userRewardPerTokenPaid[_account]))) /
                1e18) + rewards[_account];
    }

    function getReward() external updateReward(msg.sender) {
        uint reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.transfer(msg.sender, reward);
        }
    }

    function _min(uint x, uint y) private pure returns (uint) {
        return x <= y ? x : y;
    }
}
