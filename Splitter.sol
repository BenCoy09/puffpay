// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// PuffPay: pay many people in one transaction.
contract PuffSplitter {
    event Split(address indexed from, uint256 total, uint256 count, string memo);

    function split(address payable[] calldata to, uint256[] calldata amt, string calldata memo) external payable {
        require(to.length > 0 && to.length == amt.length && to.length <= 50, "bad input");
        uint256 sum;
        for (uint256 i; i < to.length; i++) sum += amt[i];
        require(sum == msg.value, "sum mismatch");
        for (uint256 i; i < to.length; i++) {
            (bool ok, ) = to[i].call{value: amt[i]}("");
            require(ok, "send failed");
        }
        emit Split(msg.sender, sum, to.length, memo);
    }
}
