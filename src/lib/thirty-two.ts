// this is taken from https://github.com/chrisumbel/thirty-two - cannot get the types with the published lib

var byteTable = [
  0xff, 0xff, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
  0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15,
  0x16, 0x17, 0x18, 0x19, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x01, 0x02,
  0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
  0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0xff, 0xff, 0xff,
  0xff, 0xff,
];

const decode = function (encoded: string | Buffer): Buffer {
  if (!Buffer.isBuffer(encoded) && typeof encoded !== "string") {
    throw new TypeError(
      "base32.decode only takes Buffer or string as parameter"
    );
  }
  var shiftIndex = 0;
  var plainDigit = 0;
  var plainChar;
  var plainPos = 0;
  if (!Buffer.isBuffer(encoded)) {
    encoded = Buffer.from(encoded);
  }
  var decoded = Buffer.alloc(Math.ceil((encoded.length * 5) / 8));
  for (var i = 0; i < encoded.length; i++) {
    if (encoded[i] === 0x3d) {
      break;
    }
    var encodedByte = encoded[i] - 0x30;
    if (encodedByte < byteTable.length) {
      plainDigit = byteTable[encodedByte];
      if (shiftIndex <= 3) {
        shiftIndex = (shiftIndex + 5) % 8;
        if (shiftIndex === 0) {
          plainChar |= plainDigit;
          decoded[plainPos] = plainChar;
          plainPos++;
          plainChar = 0;
        } else {
          plainChar |= 0xff & (plainDigit << (8 - shiftIndex));
        }
      } else {
        shiftIndex = (shiftIndex + 5) % 8;
        plainChar |= 0xff & (plainDigit >>> shiftIndex);
        decoded[plainPos] = plainChar;
        plainPos++;
        plainChar = 0xff & (plainDigit << (8 - shiftIndex));
      }
    } else {
      throw new Error("Invalid input - it is not base32 encoded string");
    }
  }
  return decoded.slice(0, plainPos);
};

export default decode;
