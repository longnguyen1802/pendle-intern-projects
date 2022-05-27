import { expect } from "chai";
import { utils } from "ethers";
import { ethers, waffle } from "hardhat";
import { deploy, evm_revert, evm_snapshot } from "./helpers/hardhat-helpers";
import { ERC20 } from "../typechain";

describe("ERC20 Test", () => {
    let [admin] = waffle.provider.getWallets();

    let globalSnapshotId;
    let snapshotId;
    let erc20: ERC20;
    
    before(async () => {
        globalSnapshotId = await evm_snapshot();
        erc20 = await deploy<ERC20>("ERC20", [1000]);
        snapshotId = await evm_snapshot();
    });

    const revertSnapshot = async () => {
        await evm_revert(snapshotId);
        snapshotId = await evm_snapshot();
    }

    beforeEach(async () => {
        await revertSnapshot();
    })

    it("totalSupply is correct", async () => {
        const total = await erc20.getTotalSupply();
        expect(total).to.be.eq(1000);
    });

    it("approval works", async () => {
        await erc20.approve("0x0264C3e4FA4E1eb38123A39776Ea3485179eFaC9", 200);
        const allowance = await erc20.allowance(admin.address, "0x0264C3e4FA4E1eb38123A39776Ea3485179eFaC9");
        expect(allowance).to.be.eq(200);  
    });

    it("balanceOf works", async () => {
        const testWallet = "0x0264C3e4FA4E1eb38123A39776Ea3485179eFaC9";
        await erc20.transfer(testWallet, 200);
        const testWalletBalance = await erc20.balanceOf(testWallet);
        expect(testWalletBalance).to.be.eq(200);
    });

    it("transferFrom works", async () => {
        const testWallet = "0x0264C3e4FA4E1eb38123A39776Ea3485179eFaC9";
        await erc20.approve(testWallet, 200);
        await erc20.transferFrom(admin.address, testWallet, 200);
        const testWalletBalance = await erc20.balanceOf(testWallet);
        expect(testWalletBalance).to.be.eq(200);
    });

    //this test is meant to fail, not sure what is the right way to write a test like this
    it("transferring more than approved", async () => {
        const testWallet = "0x0264C3e4FA4E1eb38123A39776Ea3485179eFaC9";
        await erc20.approve(testWallet, 200);
        await erc20.transferFrom(admin.address, testWallet, 400);
        const testWalletBalance = await erc20.balanceOf(testWallet);
        expect(testWalletBalance).to.be.eq(0);
    });

    it("mint works", async () => {
        const testWallet = "0x0264C3e4FA4E1eb38123A39776Ea3485179eFaC9";
        await erc20.mint(testWallet, 200);
        const testWalletBalance = await erc20.balanceOf(testWallet);
        const newTotalBalance = await erc20.getTotalSupply();
        expect(testWalletBalance).to.be.eq(200);
        expect(newTotalBalance).to.be.eq(1200);
    })

    it("burn works", async () => {
        const testWallet = "0x0264C3e4FA4E1eb38123A39776Ea3485179eFaC9";
        await erc20.transfer(testWallet, 200);
        await erc20.burn(testWallet, 100);
        const testWalletBalance = await erc20.balanceOf(testWallet);
        const newTotalBalance = await erc20.getTotalSupply();
        expect(testWalletBalance).to.be.eq(100);
        expect(newTotalBalance).to.be.eq(900);
    })
    
})