var pkcs11js = require("pkcs11js");
var pkcs11 = new pkcs11js.PKCS11();

// NOTE: USE x64 LIBRARY
pkcs11.load("D:\\SoftHSM2\\lib\\softhsm2-x64.dll", "OpenSC");
pkcs11.C_Initialize();

try {
  var module_info = pkcs11.C_GetInfo();

  var slots = pkcs11.C_GetSlotList(true);
  var slot = slots[0];

  var slot_info = pkcs11.C_GetSlotInfo(slot);
  var token_info = pkcs11.C_GetTokenInfo(slot);

  var mechs = pkcs11.C_GetMechanismList(slot);
  var mech_info = pkcs11.C_GetMechanismInfo(slot, mechs[0]);

  var session = pkcs11.C_OpenSession(
    slot,
    pkcs11js.CKF_RW_SESSION | pkcs11js.CKF_SERIAL_SESSION
  );

  var info = pkcs11.C_GetSessionInfo(session);
  pkcs11.C_Login(session, 1, "147258");

  var publicKeyTemplate = [
    { type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_PUBLIC_KEY },
    { type: pkcs11js.CKA_TOKEN, value: true },
    { type: pkcs11js.CKA_LABEL, value: "My RSA Public Key" },
    { type: pkcs11js.CKA_PUBLIC_EXPONENT, value: new Buffer.from([1, 0, 1]) },
    { type: pkcs11js.CKA_MODULUS_BITS, value: 2048 },
    { type: pkcs11js.CKA_VERIFY, value: true },
    { type: pkcs11js.CKA_ENCRYPT, value: true },
  ];
  var privateKeyTemplate = [
    { type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_PRIVATE_KEY },
    { type: pkcs11js.CKA_TOKEN, value: true },
    { type: pkcs11js.CKA_LABEL, value: "My RSA Private Key" },
    { type: pkcs11js.CKA_SIGN, value: true },
    { type: pkcs11js.CKA_DECRYPT, value: true },
  ];
  var keys = pkcs11.C_GenerateKeyPair(
    session,
    { mechanism: pkcs11js.CKM_RSA_PKCS_KEY_PAIR_GEN },
    publicKeyTemplate,
    privateKeyTemplate
  );

  console.log("key generated");

  // var cbc_param = pkcs11.C_GenerateRandom(new Buffer.from(16));

  pkcs11.C_EncryptInit(
    session,
    {
      mechanism: pkcs11js.CKM_RSA_PKCS,
      // parameter: cbc_param,
    },
    keys.publicKey
  );

  console.log("encrypt initialized");

  var enc = new Buffer(0);
  enc = Buffer.concat([
    enc,
    pkcs11.C_EncryptUpdate(
      session,
      new Buffer("Incoming data 1"),
      new Buffer(16)
    ),
  ]);

  console.log("message added");

  enc = Buffer.concat([
    enc,
    pkcs11.C_EncryptFinal(session, new Buffer.from(16)),
  ]);

  console.log(enc.toString("hex"));

  pkcs11.C_Logout(session);
  pkcs11.C_CloseSession(session);

  pkcs11.C_Finalize;
} catch (err) {
  console.error(err);
}
