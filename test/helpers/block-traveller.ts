import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";

/**
 * Advance the state by one block
 */
export async function advanceBlock(): Promise<void> {
  await network.provider.send("evm_mine");
}

/**
 * Advance the block to the passed target block
 * @param targetBlock target block number
 * @dev If target block is lower/equal to current block, it throws an error
 */
export async function advanceBlockTo(targetBlock: BigNumber): Promise<void> {
  const currentBlock = await ethers.provider.getBlockNumber();
  if (targetBlock.lt(currentBlock)) {
    throw Error(`Target·block·#(${targetBlock})·is·lower·than·current·block·#(${currentBlock})`);
  }

  let numberBlocks = targetBlock.sub(currentBlock);

  // hardhat_mine only can move by 256 blocks (256 in hex is 0x100)
  while (numberBlocks.gte(BigNumber.from("256"))) {
    await network.provider.send("hardhat_mine", ["0x100"]);
    numberBlocks = numberBlocks.sub(BigNumber.from("256"));
  }

  if (numberBlocks.eq("1")) {
    await network.provider.send("evm_mine");
  } else if (numberBlocks.eq("15")) {
    // Issue with conversion from hexString of 15 (0x0f instead of 0xF)
    await network.provider.send("hardhat_mine", ["0xF"]);
  } else {
    await network.provider.send("hardhat_mine", [numberBlocks.toHexString()]);
  }
}