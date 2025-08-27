var pkcs11js = require("pkcs11js");
var pkcs11 = new pkcs11js.PKCS11();

// NOTE: USE x64 LIBRARY
pkcs11.load("D:\\PKCS11 Library\\OpenSC\\opensc_pkcs11_64.dll");
pkcs11.C_Initialize();

try {
  var module_info = pkcs11.C_GetInfo();
  console.log(module_info.manufacturerID);

  var slots = pkcs11.C_GetSlotList(true);
  var slot = slots[0];

  var slot_info = pkcs11.C_GetSlotInfo(slot);
  console.log(slot_info.slotDescription);

  var token_info = pkcs11.C_GetTokenInfo(slot);
  console.log(token_info.label);

  var mechs = pkcs11.C_GetMechanismList(slot);
  var mech_info = pkcs11.C_GetMechanismInfo(slot, mechs[0]);

  var session = pkcs11.C_OpenSession(
    slot,
    pkcs11js.CKF_RW_SESSION | pkcs11js.CKF_SERIAL_SESSION
  );

  var info = pkcs11.C_GetSessionInfo(session);
  pkcs11.C_Login(session, 1, "648219");

  var sessionInfo = pkcs11.C_GetSessionInfo(session);
  console.log(sessionInfo.slotID);
  console.log(sessionInfo.state);

  pkcs11.C_Logout(session);
  pkcs11.C_CloseSession(session);
} catch (err) {
  console.error(err);
}
