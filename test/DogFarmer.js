const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const hre = require("hardhat");

describe("Dog and farmer", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployDogFixture() {
    const Lib = await hre.ethers.getContractFactory("StringComparer");
    const lib = await Lib.deploy();
    await lib.waitForDeployment();
    const libOptions = {
      libraries: {
        StringComparer: await lib.getAddress(),
      },
    };

    const dogName = "Sharik"
    const dog = await hre.ethers.deployContract("Dog", [dogName], libOptions);
    await dog.waitForDeployment();

    return { dog, dogName };
  }

  async function deployFarmerFixture() {
    const Farmer = await hre.ethers.getContractFactory("Farmer");
    const farmer = await Farmer.deploy();

    return { farmer };
  }

  describe("Dog", function () {
    it("Dog has the correct name.", async function () {
      const { dog, dogName } = await loadFixture(deployDogFixture);
      expect(await dog.getName()).to.equal(dogName);
    });

    it("Dog can sleep.", async function () {
      const { dog } = await loadFixture(deployDogFixture);
      await expect(dog.sleep());
    });

    it("Dog can eat ”plant”.", async function () {
      const { dog } = await loadFixture(deployDogFixture);
      await expect(dog.eat("plant"));
    });

    it("Dog can eat ”meat”.", async function () {
      const { dog } = await loadFixture(deployDogFixture);
      await expect(dog.eat("meat"));
    });

    it("Dog cannot eat ”chocolate”.", async function () {
      const { dog } = await loadFixture(deployDogFixture);
      await expect(dog.eat("chocolate")).to.be.revertedWith("Chocolate is bad for dogs!");
    });

    it("Dog cannot eat ”not-food”, ”plastic”.", async function () {
      const { dog } = await loadFixture(deployDogFixture);

      for (const food of ["not-food", "plastic"]) {
        await expect(dog.eat(food)).to.be.revertedWith("Food is not allowed");
      }
    });
  });

  describe("Farmer", function () {
    it("Farmer can call Dog, Dog responds correctly.", async function () {
      const { dog  } = await loadFixture(deployDogFixture);
      const { farmer } = await loadFixture(deployFarmerFixture);
      expect(await farmer.call(dog)).to.equal("Woof");
    });

    it("Farmer can feed Dog with ”meat”,”plant”.", async function () {
      const { dog } = await loadFixture(deployDogFixture);
      const { farmer } = await loadFixture(deployFarmerFixture);
      await expect(farmer.feed(dog, "meat"));
      await expect(farmer.feed(dog, "plant"));
    });

    it("Farmer cannot feed Dog with ”not-food”, ”plastic” and anything else.", async function () {
      const { dog } = await loadFixture(deployDogFixture);
      const { farmer } = await loadFixture(deployFarmerFixture);

      for (const food of ["not-food", "plastic"]) {
        await expect(farmer.feed(dog, food)).to.be.revertedWith("Food is not allowed");
      }
    });
  });
});
