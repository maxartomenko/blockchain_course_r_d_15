pragma solidity ^0.8.24;

library StringComparer {
    function compare(string memory str1, string memory str2) public pure returns (bool) {
        return keccak256(abi.encodePacked(str1)) == keccak256(abi.encodePacked(str2));
    }
}

interface Living {
    function eat(string memory food) external returns (string memory);
}

contract HasName {
    string internal _name;

    constructor(string memory name) {
        _name = name;
    }

    function getName() view public returns (string memory) {
        return _name;
    }
}

abstract contract Animal is Living {
    function eat(string memory food) pure virtual public returns (string memory) {
        return string.concat(
            "Animal eats ", food
        );
    }

    function sleep() pure virtual public returns (string memory) {
        return "Z-z-z-z-z....";
    }

    function speak() pure virtual public returns (string memory) {
        return "...";
    }
}

abstract contract Herbivore is Animal, HasName {

    string constant PLANT = "plant";

    modifier eatOnlyPlant(string memory food) {
        require(StringComparer.compare(food, PLANT), "Can only eat plant food");
        _;
    }

    function eat(string memory food) pure virtual override public eatOnlyPlant(food) returns (string memory) {
        return super.eat(food);
    }

}

contract Cow is Herbivore {
    constructor(string memory name) HasName(name) {
    }

    function speak() pure override public returns (string memory) {
        return "Mooo";
    }
}

contract Horse is Herbivore {
    constructor(string memory name) HasName(name) {
    }

    function speak() pure override public returns (string memory) {
        return "Igogo";
    }
}

contract Farmer {
    function feed(address animal, string memory food) pure public returns (string memory) {
        return Animal(animal).eat(food);
    }

    function call(address animal) pure public returns (string memory){
        return Animal(animal).speak();
    }
}

abstract contract Predator is Animal {

    string constant MEAT = "meat";

    function eat(string memory food) pure virtual override public returns (string memory) {
        require(StringComparer.compare(food, MEAT), "Only meat is allowed for predators");
        return super.eat(food);
    }

}

contract Wolf is Predator {

    function speak() pure override public returns (string memory) {
        return "Awoo";
    }
}

contract Dog is Animal, HasName {

    constructor(string memory name) HasName(name) {
    }

    function eat(string memory food) pure virtual override public returns (string memory) {
        require(!StringComparer.compare(food, "chocolate"), "Chocolate is bad for dogs!");
        require(StringComparer.compare(food, "meat") || StringComparer.compare(food, "plant"), "Food is not allowed");
        return super.eat(food);
    }

    function speak() pure override public returns (string memory) {
        return "Woof";
    }
}
