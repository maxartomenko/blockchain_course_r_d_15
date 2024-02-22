const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const hre = require("hardhat");

describe("Horse and farmer", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployHorseFixture() {
    const Lib = await hre.ethers.getContractFactory("StringComparer");
    const lib = await Lib.deploy();
    await lib.waitForDeployment();
    const libOptions = {
      libraries: {
        StringComparer: await lib.getAddress(),
      },
    };

    const horseName = "Plotva"
    const horse = await hre.ethers.deployContract("Horse", [horseName], libOptions);
    await horse.waitForDeployment();

    return { horse, horseName };
  }

  async function deployFarmerFixture() {
    const Farmer = await hre.ethers.getContractFactory("Farmer");
    const farmer = await Farmer.deploy();

    return { farmer };
  }

  describe("Horse", function () {
    it("Horse has the correct name.", async function () {
      const { horse, horseName } = await loadFixture(deployHorseFixture);
      expect(await horse.getName()).to.equal(horseName);
    });

    it("Horse can sleep.", async function () {
      const { horse, horseName } = await loadFixture(deployHorseFixture);
      await expect(horse.sleep());
    });

    it("Horse can eat ”plant”.", async function () {
      const { horse, horseName } = await loadFixture(deployHorseFixture);
      await expect(horse.eat("plant"));
    });

    it("Horse cannot eat ”meat”, ”not-food”, ”plastic”.", async function () {
      const { horse, horseName } = await loadFixture(deployHorseFixture);

      for (const food of ["meat", "not-food", "plastic"]) {
        await expect(horse.eat(food)).to.be.revertedWith("Can only eat plant food");
      }
    });
  });

  describe("Farmer", function () {
    it("Farmer can call Horse, Horse responds correctly.", async function () {
      const { horse  } = await loadFixture(deployHorseFixture);
      const { farmer } = await loadFixture(deployFarmerFixture);
      expect(await farmer.call(horse)).to.equal("Igogo");
    });

    it("Farmer can feed Horse with plant.", async function () {
      const { horse } = await loadFixture(deployHorseFixture);
      const { farmer } = await loadFixture(deployFarmerFixture);
      await expect(farmer.feed(horse, "plant"));
    });

    it("Farmer cannot feed Horse with anything else.", async function () {
      const { horse } = await loadFixture(deployHorseFixture);
      const { farmer } = await loadFixture(deployFarmerFixture);

      for (const food of ["meat", "not-food", "plastic"]) {
        await expect(farmer.feed(horse, food)).to.be.revertedWith("Can only eat plant food");
      }
    });
  });
});
