var checkSimilarity= function (bytecode1, bytecode2) {
    var fingerprint1 = createFingerprint(bytecode1);
    var fingerprint2 = createFingerprint(bytecode2);
    var distance = levenshtein(fingerprint1, fingerprint2);
    console.log("Distance: " + distance);
    var maxLen = Math.max(bytecode1.length, bytecode2.length);
    var score = (1- distance/maxLen) *100;
    console.log(score);
    return score;

}

var checkFingerprintSimilarity= function (fingerprint1, fingerprint2) {
    var distance = levenshtein(fingerprint1, fingerprint2);
    //console.log("Distance: " + distance);
    var maxLen = Math.max(bytecode1.length, bytecode2.length);
    var score = (1- distance/maxLen) *100;
    //console.log(score);
    return score;
}

var createFingerprint = function (bytecode) {
    var cleanedBytecode = removeHardcodedValues(bytecode);
    //console.log(cleanedBytecode);
    var segmentedBytecode = segmentBytecode(cleanedBytecode);
    //console.log(segmentedBytecode);
    var hashedSegments = hashSegments(segmentedBytecode);
    //console.log(hashedSegments);
    var fingerprint = concatenateSegments(hashedSegments);
    //console.log(fingerprint);
    return fingerprint;

}

var concatenateSegments = function(segments) {
    var joinedSegments = ""
    for(const segment of segments) {
        joinedSegments += segment;
    }
    return joinedSegments;
}


var hashSegments = function(segmentedBytecode) {
    var hashedSegments = []
    for (const segment of segmentedBytecode) {
        var hash = ssdeep.digest(segment);
        hashedSegments.push(hash);
    }

    return hashedSegments;

}

const STOP = '0x00';
const JUMP = '0x56';
const JUMPI = '0x57';
const RETURN = '0xF3';
const REVERT = '0xFD';
const TERMINAL_VALUES = [STOP, JUMP, JUMPI, RETURN, REVERT];
var segmentBytecode = function (bytecode) {
    var startOfSegment = 0;
    var endOfSegment = 0;
    var segmentedBytecode = [];
    // For every two characters (opcode)
    for (var startOfOpcode = 0; startOfOpcode < bytecode.length; startOfOpcode+=2) {
        var endOfOpcode = startOfOpcode + 2;
        endOfSegment = endOfOpcode;
        var opcode = '0x' + bytecode.slice(startOfOpcode, endOfOpcode);
        // Segment if at terminal value
        if (TERMINAL_VALUES.includes(opcode)) {
            var segment = bytecode.slice(startOfSegment, endOfSegment);
            startOfSegment = endOfSegment;
            segmentedBytecode.push(segment);
        }
    }
    // Get last segment
    if (startOfSegment < bytecode.length) {
        var segment = bytecode.slice(startOfSegment, bytecode.length);
        segmentedBytecode.push(segment);
    }
    return segmentedBytecode
}

const PUSH1 = 96;
const PUSH32 = 127;
var removeHardcodedValues = function (bytecode) {
    var cleanedBytecode = bytecode
    // For every two characters (opcode)
    for (var startOfOpcode = 0; startOfOpcode < bytecode.length; startOfOpcode+=2) {
        var endOfOpcode = startOfOpcode+2;
        var opcode = bytecode.slice(startOfOpcode, endOfOpcode);
        // If opcode is push
        var opcodeValue = parseInt('0x' + opcode);
        if (opcodeValue >= PUSH1 && opcodeValue <= PUSH32) {
            // Set value to underscores
            var valueLength = (opcodeValue - PUSH1 + 1) *2;
            var startOfValue = endOfOpcode;
            var endOfValue = startOfValue + valueLength;
            var cleanedBytecode = cleanedBytecode.slice(0, startOfValue);
            cleanedBytecode += '_'.repeat(valueLength);
            cleanedBytecode += bytecode.slice(endOfValue, bytecode.length);
        }
    }
    return cleanedBytecode;
}

// Included explicitly due to udf constraints
// https://github.com/cloudtracer/ssdeep.js/blob/master/ssdeep.js
    var ssdeep = {};
    var isBrowser = false;
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = ssdeep;
    } else {//for browser
        this.ssdeep = ssdeep;
        isBrowser = true;
    }

    var HASH_PRIME = 16777619;
    var HASH_INIT = 671226215;
    var ROLLING_WINDOW = 7;
    var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    //refer http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array (str) {
      var out = [], p = 0;
      for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 128) {
          out[p++] = c;
        } else if (c < 2048) {
          out[p++] = (c >> 6) | 192;
          out[p++] = (c & 63) | 128;
        } else if (
            ((c & 0xFC00) == 0xD800) && (i + 1) < str.length &&
            ((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
          // Surrogate Pair
          c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
          out[p++] = (c >> 18) | 240;
          out[p++] = ((c >> 12) & 63) | 128;
          out[p++] = ((c >> 6) & 63) | 128;
          out[p++] = (c & 63) | 128;
        } else {
          out[p++] = (c >> 12) | 224;
          out[p++] = ((c >> 6) & 63) | 128;
          out[p++] = (c & 63) | 128;
        }
      }
      return out;
    }

    /*
    * Add integers, wrapping at 2^32. This uses 16-bit operations internally
    * to work around bugs in some JS interpreters.
    */
    function safe_add (x, y) {
      var lsw = (x & 0xFFFF) + (y & 0xFFFF)
      var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
      return (msw << 16) | (lsw & 0xFFFF)
    }

    /*
      1000 0000
      1000 0000
      0000 0001
    */

    function safe_multiply(x, y) {
  		/*
  			a = a00 + a16
  			b = b00 + b16
  			a*b = (a00 + a16)(b00 + b16)
  				= a00b00 + a00b16 + a16b00 + a16b16
  			a16b16 overflows the 32bits
  		 */
     var xlsw = (x & 0xFFFF)
     var xmsw = (x >> 16) +(xlsw >> 16);
     var ylsw = (y & 0xFFFF)
     var ymsw = (y >> 16) +(ylsw >> 16);
  		var a16 = xmsw
  		var a00 = xlsw
  		var b16 = ymsw
  		var b00 = ylsw
  		var c16, c00
  		c00 = a00 * b00
  		c16 = c00 >>> 16

  		c16 += a16 * b00
  		c16 &= 0xFFFF		// Not required but improves performance
  		c16 += a00 * b16

  		xlsw = c00 & 0xFFFF
  		xmsw= c16 & 0xFFFF

  		return (xmsw << 16) | (xlsw & 0xFFFF)
  	}

    /*
    * Bitwise rotate a 32-bit number to the left.
    */
    function bit_rol (num, cnt) {
      return (num << cnt) | (num >>> (32 - cnt))
    }

    //FNV-1 hash
    function fnv (h, c) {
      return (safe_multiply(h,HASH_PRIME) ^ c)>>>0;
    }

    //Based on https://github.com/hiddentao/fast-levenshtein
    function levenshtein (str1, str2) {
        // base cases
        if (str1 === str2) return 0;
        if (str1.length === 0) return str2.length;
        if (str2.length === 0) return str1.length;

        // two rows
        var prevRow  = new Array(str2.length + 1),
            curCol, nextCol, i, j, tmp;

        // initialise previous row
        for (i=0; i<prevRow.length; ++i) {
            prevRow[i] = i;
        }

        // calculate current row distance from previous row
        for (i=0; i<str1.length; ++i) {
            nextCol = i + 1;

            for (j=0; j<str2.length; ++j) {
                curCol = nextCol;

                // substution
                nextCol = prevRow[j] + ( (str1.charAt(i) === str2.charAt(j)) ? 0 : 1 );
                // insertion
                tmp = curCol + 1;
                if (nextCol > tmp) {
                    nextCol = tmp;
                }
                // deletion
                tmp = prevRow[j + 1] + 1;
                if (nextCol > tmp) {
                    nextCol = tmp;
                }

                // copy current col value into previous (in preparation for next iteration)
                prevRow[j] = curCol;
            }

            // copy last col value into previous (in preparation for next iteration)
            prevRow[j] = nextCol;
        }
        return nextCol;
    }

    function RollHash () {
      this.rolling_window = new Array(ROLLING_WINDOW);
      this.h1 =  0
      this.h2 = 0
      this.h3 = 0
      this.n = 0
    }
    RollHash.prototype.update = function (c) {
      this.h2 = safe_add(this.h2, -this.h1);
      var mut = (ROLLING_WINDOW * c);
      this.h2 = safe_add(this.h2, mut) >>>0;
      this.h1 = safe_add(this.h1, c);

      var val = (this.rolling_window[this.n % ROLLING_WINDOW] || 0);
      this.h1 = safe_add(this.h1, -val) >>>0;
      this.rolling_window[this.n % ROLLING_WINDOW] = c;
      this.n++;

      this.h3 = this.h3 << 5;
      this.h3 = (this.h3 ^ c) >>>0;
    };
    RollHash.prototype.sum = function () {
      return (this.h1 + this.h2 + this.h3) >>>0;
    };

    function piecewiseHash (bytes, triggerValue) {
        var signatures = ['','', ''];
        var h1 = HASH_INIT;
        var h2 = HASH_INIT;
        var rh = new RollHash();
        //console.log(triggerValue)
        for (var i = 0, len = bytes.length; i < len; i++) {
            var thisByte = bytes[i];

            h1 = fnv(h1, thisByte);
            h2 = fnv(h2, thisByte);

            rh.update(thisByte);

            if (i === (len - 1) || rh.sum() % triggerValue === (triggerValue - 1)) {
                signatures[0] += B64.charAt(h1&63);
                signatures[2] = triggerValue;
                h1 = HASH_INIT;
            }
            if (i === (len - 1) || rh.sum() % (triggerValue * 2) === (triggerValue * 2 - 1) ) {
                signatures[1] += B64.charAt(h2&63);
                signatures[2] = triggerValue;
                h2 = HASH_INIT;
            }
        }
        return signatures;
    }

    function digest (bytes) {
        var minb = 3;
        var bi = Math.ceil(Math.log(bytes.length/(64*minb))/Math.log(2));
        bi = Math.max(3, bi);

        var signatures = piecewiseHash(bytes, minb << bi);
        while (bi>0 && signatures[0].length < 32){
            signatures = piecewiseHash(bytes, minb << --bi);
        }
        return signatures[2] + ':' + signatures[0] + ':' + signatures[1];
    }

    function matchScore (s1, s2) {
        var e = levenshtein(s1, s2);
        var r = 1 - e/Math.max(s1.length ,s2.length);
        return r * 100;
    }

    ssdeep.digest = function (data) {
        if (typeof data === 'string') {
            data = isBrowser?toUTF8Array(data):new Buffer(data).toJSON().data;
        }
        return digest(data);
    };

    ssdeep.similarity = function (d1, d2) {
        var b1 = B64.indexOf(d1.charAt(0));
        var b2 = B64.indexOf(d2.charAt(0));
        if (b1 > b2) return arguments.callee(d2, d1);

        if (Math.abs(b1-b2) > 1) {
            return 0;
        } else if (b1 === b2) {
            return matchScore(d1.split(':')[1], d2.split(':')[1]);
        } else {
            return matchScore(d1.split(':')[2], d2.split(':')[1]);
        }
    };

//createFingerprint("0x608060405234801561001057600080fd5b50610343806100206000396000f300608060405260043610610041576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063a9059cbb14610046575b600080fd5b34801561005257600080fd5b50610091600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506100ab565b604051808215151515815260200191505060405180910390f35b60008060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205473__SafeMath______________________________63b67d77c59091846040518363ffffffff167c0100000000000000000000000000000000000");
// Very similar (one line different)
//checkSimilarity(
//"608060405234801561001057600080fd5b5060c78061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80636057361d146037578063b05784b8146062575b600080fd5b606060048036036020811015604b57600080fd5b8101908080359060200190929190505050607e565b005b60686088565b6040518082815260200191505060405180910390f35b8060008190555050565b6000805490509056fea264697066735822122078fcdd186f07e48f2aee328c99bd40f9d5f25425a57536fb1cda58aaa09ecec264736f6c63430006010033",
//"608060405234801561001057600080fd5b5060cb8061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80636057361d146037578063b05784b8146062575b600080fd5b606060048036036020811015604b57600080fd5b8101908080359060200190929190505050607e565b005b6068608c565b6040518082815260200191505060405180910390f35b806000540160008190555050565b6000805490509056fea26469706673582212205f0f8902dc826a4f8d4a553276bd6e8291f37bbd40988876f44c0d62bcfa9de264736f6c63430006010033"
//);
// Dissimilar (different contracts)
//checkSimilarity(
//"608060405234801561001057600080fd5b5060c78061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80636057361d146037578063b05784b8146062575b600080fd5b606060048036036020811015604b57600080fd5b8101908080359060200190929190505050607e565b005b60686088565b6040518082815260200191505060405180910390f35b8060008190555050565b6000805490509056fea264697066735822122078fcdd186f07e48f2aee328c99bd40f9d5f25425a57536fb1cda58aaa09ecec264736f6c63430006010033",
//"608060405234801561001057600080fd5b50604051610e27380380610e278339818101604052602081101561003357600080fd5b810190808051604051939291908464010000000082111561005357600080fd5b8382019150602082018581111561006957600080fd5b825186602082028301116401000000008211171561008657600080fd5b8083526020830192505050908051906020019060200280838360005b838110156100bd5780820151818401526020810190506100a2565b50505050905001604052505050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060018060008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000018190555060008090505b81518110156101f8576002604051806040016040528084848151811061019a57fe5b6020026020010151815260200160008152509080600181540180825580915050600190039060005260206000209060020201600090919091909150600082015181600001556020820151816001015550508080600101915050610178565b5050610c1e806102096000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c8063609ff1bd1161005b578063609ff1bd146101925780639e7b8d61146101b0578063a3ec138d146101f4578063e2ba53f01461029157610088565b80630121b93f1461008d578063013cf08b146100bb5780632e4176cf146101045780635c19a95c1461014e575b600080fd5b6100b9600480360360208110156100a357600080fd5b81019080803590602001909291905050506102af565b005b6100e7600480360360208110156100d157600080fd5b810190808035906020019092919050505061044c565b604051808381526020018281526020019250505060405180910390f35b61010c61047d565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6101906004803603602081101561016457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506104a2565b005b61019a6108be565b6040518082815260200191505060405180910390f35b6101f2600480360360208110156101c657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610935565b005b6102366004803603602081101561020a57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610b36565b60405180858152602001841515151581526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200194505050505060405180910390f35b610299610b93565b6040518082815260200191505060405180910390f35b6000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905060008160000154141561036d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f486173206e6f20726967687420746f20766f746500000000000000000000000081525060200191505060405180910390fd5b8060010160009054906101000a900460ff16156103f2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600e8152602001807f416c726561647920766f7465642e00000000000000000000000000000000000081525060200191505060405180910390fd5b60018160010160006101000a81548160ff02191690831515021790555081816002018190555080600001546002838154811061042a57fe5b9060005260206000209060020201600101600082825401925050819055505050565b6002818154811061045957fe5b90600052602060002090600202016000915090508060000154908060010154905082565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090508060010160009054906101000a900460ff161561056a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f596f7520616c726561647920766f7465642e000000000000000000000000000081525060200191505060405180910390fd5b3373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561060c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f53656c662d64656c65676174696f6e20697320646973616c6c6f7765642e000081525060200191505060405180910390fd5b5b600073ffffffffffffffffffffffffffffffffffffffff16600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16146107af57600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1691503373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156107aa576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260198152602001807f466f756e64206c6f6f7020696e2064656c65676174696f6e2e0000000000000081525060200191505060405180910390fd5b61060d565b60018160010160006101000a81548160ff021916908315150217905550818160010160016101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090508060010160009054906101000a900460ff16156108a2578160000154600282600201548154811061087f57fe5b9060005260206000209060020201600101600082825401925050819055506108b9565b816000015481600001600082825401925050819055505b505050565b6000806000905060008090505b6002805490508110156109305781600282815481106108e657fe5b9060005260206000209060020201600101541115610923576002818154811061090b57fe5b90600052602060002090600202016001015491508092505b80806001019150506108cb565b505090565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146109da576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526028815260200180610bc16028913960400191505060405180910390fd5b600160008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900460ff1615610a9d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260188152602001807f54686520766f74657220616c726561647920766f7465642e000000000000000081525060200191505060405180910390fd5b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000015414610aec57600080fd5b60018060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000018190555050565b60016020528060005260406000206000915090508060000154908060010160009054906101000a900460ff16908060010160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff16908060020154905084565b60006002610b9f6108be565b81548110610ba957fe5b90600052602060002090600202016000015490509056fe4f6e6c79206368616972706572736f6e2063616e206769766520726967687420746f20766f74652ea264697066735822122058766ff2967b30f7c3cda5eaff3f0ee81b91e91abde708241920de181187750864736f6c63430006010033"
//);