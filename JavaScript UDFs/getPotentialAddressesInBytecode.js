var getPotentialAddresses = function (bytecode) {
    var potentialAddresses = []
    // For every two characters (opcode)
    for (var startOfOpcode = 0; startOfOpcode < bytecode.length; startOfOpcode+=2) {
        var endOfOpcode = startOfOpcode+2;
        var opcode = bytecode.slice(startOfOpcode, endOfOpcode);
        // If opcode is push 20
        if (opcode === '73') {
            // Grab potential addr (40 chars)
            var potentialAddress = "0x" + bytecode.slice(endOfOpcode, endOfOpcode+40);
            potentialAddresses.push(potentialAddress);
        }
    }
    //console.log(potentialAddress);
    return potentialAddresses;
}

//getPotentialAddresses("0x608060405234801561001057600080fd5b50610343806100206000396000f300608060405260043610610041576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063a9059cbb14610046575b600080fd5b34801561005257600080fd5b50610091600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506100ab565b604051808215151515815260200191505060405180910390f35b60008060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205473__SafeMath______________________________63b67d77c59091846040518363ffffffff167c0100000000000000000000000000000000000")