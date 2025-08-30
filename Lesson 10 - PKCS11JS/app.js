var pkcs11js = require("pkcs11js");
var pkcs11 = new pkcs11js.PKCS11();

const HSM_PKCS11_LIB_FILE =
  "C:\\Program Files\\SafeNet\\Protect Toolkit C SDK\\bin\\sw\\cryptoki.dll";
const HSM_PKCS11_LIB_NAME = "SafeNet";
const HSM_LOGIN_PIN = "147258";

// NOTE: USE x64 LIBRARY
pkcs11.load(HSM_PKCS11_LIB_FILE, HSM_PKCS11_LIB_NAME);
pkcs11.C_Initialize();

function hsmGetMechanism(slot) {
  var mechs = pkcs11.C_GetMechanismList(slot);
  var mech_info = pkcs11.C_GetMechanismInfo(slot, mechs[0]);
  console.log(mech_info);
}

function hsmCreateAesKey(session, label, id, valueLen) {
  var template = [
    { type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_SECRET_KEY },
    { type: pkcs11js.CKA_TOKEN, value: false },
    { type: pkcs11js.CKA_LABEL, value: label },
    { type: pkcs11js.CKA_ID, value: id },
    { type: pkcs11js.CKA_VALUE_LEN, value: valueLen },
    { type: pkcs11js.CKA_ENCRYPT, value: true },
    { type: pkcs11js.CKA_DECRYPT, value: true },
  ];
  return pkcs11.C_GenerateKey(
    session,
    { mechanism: pkcs11js.CKM_AES_KEY_GEN },
    template
  );
}

function hsmCreateDesKey(session, label, id, valueLen) {
  var template = [
    { type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_SECRET_KEY },
    { type: pkcs11js.CKA_TOKEN, value: false },
    { type: pkcs11js.CKA_LABEL, value: label },
    { type: pkcs11js.CKA_ID, value: id },
    { type: pkcs11js.CKA_VALUE_LEN, value: valueLen },
    { type: pkcs11js.CKA_ENCRYPT, value: true },
    { type: pkcs11js.CKA_DECRYPT, value: true },
  ];
  return pkcs11.C_GenerateKey(
    session,
    { mechanism: pkcs11js.CKM_DES_KEY_GEN },
    template
  );
}

function hsmCreateRsaKey(session, label, id, size) {
  var publicKeyTemplate = [
    { type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_PUBLIC_KEY },
    { type: pkcs11js.CKA_TOKEN, value: true },
    { type: pkcs11js.CKA_LABEL, value: label },
    { type: pkcs11js.CKA_ID, value: id },
    { type: pkcs11js.CKA_PUBLIC_EXPONENT, value: new Buffer.from([1, 0, 1]) },
    { type: pkcs11js.CKA_MODULUS_BITS, value: size },
    { type: pkcs11js.CKA_VERIFY, value: true },
    { type: pkcs11js.CKA_ENCRYPT, value: true },
  ];
  var privateKeyTemplate = [
    { type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_PRIVATE_KEY },
    { type: pkcs11js.CKA_TOKEN, value: true },
    { type: pkcs11js.CKA_LABEL, value: label },
    { type: pkcs11js.CKA_ID, value: id },
    { type: pkcs11js.CKA_LABEL, value: "My RSA Private Key" },
    { type: pkcs11js.CKA_SIGN, value: true },
    { type: pkcs11js.CKA_DECRYPT, value: true },
  ];
  return pkcs11.C_GenerateKeyPair(
    session,
    { mechanism: pkcs11js.CKM_RSA_PKCS_KEY_PAIR_GEN },
    publicKeyTemplate,
    privateKeyTemplate
  );
}

function hsmCreateEC(session, label, id) {
  var publicKeyTemplate = [
    { type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_PUBLIC_KEY },
    { type: pkcs11js.CKA_TOKEN, value: false },
    { type: pkcs11js.CKA_LABEL, value: label },
    { type: pkcs11js.CKA_ID, value: id },
    {
      type: pkcs11js.CKA_EC_PARAMS,
      value: new Buffer("06082A8648CE3D030107", "hex"),
    }, // secp256r1
  ];
  var privateKeyTemplate = [
    { type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_PRIVATE_KEY },
    { type: pkcs11js.CKA_TOKEN, value: false },
    { type: pkcs11js.CKA_LABEL, value: label },
    { type: pkcs11js.CKA_ID, value: id },
    { type: pkcs11js.CKA_DERIVE, value: true },
  ];
  return pkcs11.C_GenerateKeyPair(
    session,
    { mechanism: pkcs11js.CKM_EC_KEY_PAIR_GEN },
    publicKeyTemplate,
    privateKeyTemplate
  );
}

function hsmFindObjects(session) {
  pkcs11.C_FindObjectsInit(session, [
    { type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_DATA },
  ]);
  var hObject = pkcs11.C_FindObjects(session);
  while (hObject) {
    var attrs = pkcs11.C_GetAttributeValue(session, hObject, [
      { type: pkcs11js.CKA_CLASS },
      { type: pkcs11js.CKA_TOKEN },
      { type: pkcs11js.CKA_LABEL },
    ]);
    // Output info for objects from token only
    if (attrs[1].value[0]) {
      console.log(`Object #${hObject}: ${attrs[2].value.toString()}`);
    }
    hObject = pkcs11.C_FindObjects(session);
  }
  return pkcs11.C_FindObjectsFinal(session);
}

function hsmCreateGenericSecretKey(session, label, id, valueLen) {
  var template = [
    { type: pkcs11js.CKA_CLASS, value: pkcs11js.GENERIC_SECRET },
    { type: pkcs11js.CKA_TOKEN, value: false },
    { type: pkcs11js.CKA_LABEL, value: label },
    { type: pkcs11js.CKA_ID, value: id },
    { type: pkcs11js.CKA_VALUE_LEN, value: valueLen },
    { type: pkcs11js.CKA_ENCRYPT, value: true },
    { type: pkcs11js.CKA_DECRYPT, value: true },
    { type: pkcs11js.CKA_SIGN, value: true },
    { type: pkcs11js.CKA_VERIFY, value: true },
  ];
  return pkcs11.C_GenerateKey(
    session,
    { mechanism: pkcs11js.GENERIC_SECRET },
    template
  );
}

function hsmCreateObject(session, label) {
  var nObject = pkcs11.C_CreateObject(session, [
    { type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_DATA },
    { type: pkcs11js.CKA_TOKEN, value: false },
    { type: pkcs11js.CKA_PRIVATE, value: false },
    { type: pkcs11js.CKA_LABEL, value: label },
  ]);
}

function hsmSign(session, keys, message, mechanism) {
  pkcs11.C_SignInit(session, mechanism, keys.privateKey);
  pkcs11.C_SignUpdate(session, message);
  return pkcs11.C_SignFinal(session, Buffer(256));
}

function hsmVerify(session, keys, sign, message, mechanism) {
  pkcs11.C_VerifyInit(session, mechanism, keys.publicKey);
  pkcs11.C_VerifyUpdate(session, message);
  return pkcs11.C_VerifyFinal(session, sign);
}

function hsmEncrypt(session, key, message, mechanism) {
  pkcs11.C_EncryptInit(session, mechanism, key);

  var enc = new Buffer(0);
  enc = Buffer.concat([
    enc,
    pkcs11.C_EncryptUpdate(session, message, new Buffer(16)),
  ]);

  enc = Buffer.concat([enc, pkcs11.C_EncryptFinal(session, new Buffer(16))]);
  return enc;
}

function hsmDecrypt(session, key, encrypted, mechanism) {
  pkcs11.C_DecryptInit(session, mechanism, key);

  var dec = new Buffer(0);
  dec = Buffer.concat([
    dec,
    pkcs11.C_DecryptUpdate(session, encrypted, new Buffer(32)),
  ]);
  dec = Buffer.concat([dec, pkcs11.C_DecryptFinal(session, new Buffer(16))]);
  return dec;
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

try {
  // Initialize
  var slots = pkcs11.C_GetSlotList(true);
  var slot = slots[0];
  var session = pkcs11.C_OpenSession(
    slot,
    pkcs11js.CKF_RW_SESSION | pkcs11js.CKF_SERIAL_SESSION
  );
  pkcs11.C_Login(session, 1, HSM_LOGIN_PIN);

  // Write ur codes below

  pkcs11.C_Logout(session);
  pkcs11.C_CloseSession(session);
  pkcs11.C_Finalize;
} catch (err) {
  console.error(err);
}
