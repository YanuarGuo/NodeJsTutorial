const fs = require("fs");
const forge = require("node-forge");
const graphene = require("graphene-pk11");
const { token } = require("morgan");

const HSM_PKCS11_LIB_FILE = "D:\\SoftHSM2\\lib\\softhsm2-x64.dll";
const HSM_PKCS11_LIB_NAME = "SoftHSM";
const HSM_LOGIN_PIN = "147258";

const UNSAFE_USE_LOCAL_OAEP = false;
const USE_SAFENET = false;

function hsmCreateAesKey(session, label, id, valueLen) {
  return session.generateKey(graphene.KeyGenMechanism.AES, {
    token: true,
    valueLen,
    keyType: graphene.KeyType.AES,
    extractable: true,
    wrap: true,
    encrypt: true,
    label,
    id,
  });
}

function hsmCreateRsaKey(session, label, id) {
  return session.generateKeyPair(
    graphene.KeyGenMechanism.RSA,
    {
      keyType: graphene.KeyType.RSA,
      modulusBits: 4096,
      publicExponent: Buffer.from([0x01, 0x00, 0x01]),
      token: true,
      label,
      id,
    },
    {
      keyType: graphene.KeyType.RSA,
      extractable: true,
      token: true,
      label,
      id,
    }
  );
}

function hsmWrapRsaKey(session, aesKey, rsaKey) {
  return session.wrapKey(
    !USE_SAFENET ? graphene.MechanismEnum.AES_KEY_WRAP_PAD : "AES_KWP",
    aesKey,
    rsaKey.privateKey
  );
}

function hsmWrapAesKey(session, rsaPublicKey, aesKey) {
  const objectTemplate = {
    class: graphene.ObjectClass.PUBLIC_KEY,
    keyType: graphene.KeyType.RSA,
    modulus: Buffer.from(rsaPublicKey.n.toByteArray()),
    publicExponent: Buffer.from(rsaPublicKey.e.toByteArray()),
    wrap: true,
    encrypt: true,
  };

  const publicKey = session.create(objectTemplate).toType();

  const wrappingAlgorithm = {
    name: "RSA_PKCS_OAEP",
    params: new graphene.RsaOaepParams(
      graphene.MechanismEnum.SHA256,
      graphene.RsaMgf.MGF1_SHA256
    ),
  };

  try {
    return session.wrapKey(wrappingAlgorithm, publicKey, aesKey);
  } catch (err) {
    if (!UNSAFE_USE_LOCAL_OAEP) {
      console.error(
        `Error wrapping key using RSA_PKCS_OAEP (The HSM may not support OAEP with SHA256): ${err}`
      );
      throw err;
    }

    return undefined;
  }
}

function hsmSign(session, keys, message, mechanism) {
  var sign = session.createSign(mechanism, keys.privateKey);
  sign.update(message);
  return (signature = sign.final());
}

function hsmVerify(session, keys, sign, message, mechanism) {
  var verify = session.createVerify(mechanism, keys.publicKey);
  verify.update(message);
  return (isVerified = verify.final(sign));
}

function hsmEncrypt(session, key, mechanism, message) {
  var cipher = session.createCipher(mechanism, key);
  cipher.update(message);
  return (enciphered = cipher.final());
}

function hsmDecrypt(session, key, mechanism, encrypted) {
  var decipher = session.createDecipher(mechanism, key);
  decipher.update(encrypted);
  return (deciphered = decipher.final().toString("hex"));
}

function hsmGetMechanism(slot) {
  console.log("Slot #" + slot.handle.toString("hex"));
  console.log("\tDescription:", slot.slotDescription);
  console.log("\tSerial:", slot.getToken().serialNumber);
  console.log(
    "\tPassword(min/max): %d/%d",
    slot.getToken().minPinLen,
    slot.getToken().maxPinLen
  );
  console.log("\tIs hardware:", !!(slot.flags & graphene.SlotFlag.HW_SLOT));
  console.log(
    "\tIs removable:",
    !!(slot.flags & graphene.SlotFlag.REMOVABLE_DEVICE)
  );
  console.log(
    "\tIs initialized:",
    !!(slot.flags & graphene.SlotFlag.TOKEN_PRESENT)
  );
  console.log("\n\nMechanisms:");
  console.log("Name                       h/s/v/e/d/w/u");
  console.log("========================================");
  function b(v) {
    return v ? "+" : "-";
  }

  function s(v) {
    v = v.toString();
    for (var i_1 = v.length; i_1 < 27; i_1++) {
      v += " ";
    }
    return v;
  }

  var mechs = slot.getMechanisms();
  for (var j = 0; j < mechs.length; j++) {
    var mech = mechs.items(j);
    console.log(
      s(mech.name) +
        b(mech.flags & graphene.MechanismFlag.DIGEST) +
        "/" +
        b(mech.flags & graphene.MechanismFlag.SIGN) +
        "/" +
        b(mech.flags & graphene.MechanismFlag.VERIFY) +
        "/" +
        b(mech.flags & graphene.MechanismFlag.ENCRYPT) +
        "/" +
        b(mech.flags & graphene.MechanismFlag.DECRYPT) +
        "/" +
        b(mech.flags & graphene.MechanismFlag.WRAP) +
        "/" +
        b(mech.flags & graphene.MechanismFlag.UNWRAP)
    );
  }
}

function genHexString(len) {
  const hex = "0123456789ABCDEF";
  let output = "";
  for (let i = 0; i < len; ++i) {
    output += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return output;
}

function hexToAsc(hexString) {
  var hex = hexString.toString();
  var str = "";
  for (var i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

// Initialize
const mod = graphene.Module.load(HSM_PKCS11_LIB_FILE, HSM_PKCS11_LIB_NAME);
mod.initialize();
const slot = mod.getSlots(0);

if (!(slot.flags & graphene.SlotFlag.TOKEN_PRESENT)) {
  console.error("Slot is not initialized");
  mod.finalize();
  throw new Error();
}
const session = slot.open(
  graphene.SessionFlag.RW_SESSION | graphene.SessionFlag.SERIAL_SESSION
);
session.login(HSM_LOGIN_PIN);

// hsmGetMechanism(slot);

// const labelRsa = `LabelRSA_${Date.now()}`;
const labelAes = `LabelAES_${Date.now()}`;
const id = genHexString(20);
// const message =
//   "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit semper vel class aptent taciti sociosqu ad litora torquent per conubia nostra inceptos himenaeos orci varius natoque penatibus et magnis dis parturient montes nascetur ridiculus12";
const message = "yanuarrr";
var mechanism = {
  name: "AES_CBC_PAD",
  params: Buffer.from([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]),
};

const aesKey = hsmCreateAesKey(session, labelAes, id, 16);
// const rsaKey = hsmCreateRsaKey(session, labelRsa, id);
// const sign = hsmSign(session, rsaKey, message, mechanism);
// const verify = hsmVerify(session, rsaKey, sign, message, mechanism);
const encrypt = hsmEncrypt(session, aesKey, mechanism, message);
const decrypt = hsmDecrypt(session, aesKey, mechanism, encrypt);

console.log(encrypt.toString("hex"));
console.log(hexToAsc(decrypt));

// console.log("Sign: \n" + sign.toString("hex"));
// console.log("Verify: " + verify);

session.destroy(aesKey);
session.logout();
session.close();
mod.finalize();
