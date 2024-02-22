const hre = require("hardhat");
require("@nomicfoundation/hardhat-ethers");

async function main() {

    const Lib = await hre.ethers.getContractFactory("StringComparer");
    const lib = await Lib.deploy();
    await lib.waitForDeployment();
    const libOptions = {
        libraries: {
            StringComparer: await lib.getAddress(),
        },
    };

    const cow = await hre.ethers.deployContract("Cow", ["Murka"], libOptions);
    await cow.waitForDeployment();
    const horse = await hre.ethers.deployContract("Horse", ["Yuliy"], libOptions);
    await horse.waitForDeployment();
    const wolf = await hre.ethers.deployContract("Wolf", libOptions);
    await wolf.waitForDeployment();
    const farmer = await hre.ethers.deployContract("Farmer");
    await farmer.waitForDeployment();

    const resCallCow = await farmer.call(await cow.getAddress());
    console.log(resCallCow)

    const resCallHorse = await farmer.call(await horse.getAddress());
    console.log(resCallHorse)

    try {
        await farmer.feed(await wolf.getAddress(), "plant");
    }
    catch (error) {
        console.error("Error during feeding:", error.message);
    }

    const resFeedWolfMeat = await farmer.feed(await wolf.getAddress(), "meat");
    console.log(resFeedWolfMeat)
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});