const graphene = require("graphene-pk11");
var Module = graphene.Module;

// NOTE: USE x64 LIBRARY
var mod = Module.load("D:\\SoftHSM2\\lib\\softhsm2-x64.dll", "OpenSC");
mod.initialize();

try {
  // region GET MECHANISMS
  // try {
  //   var slots = mod.getSlots(true);
  //   if (slots.length > 0) {
  //     for (var i = 0; i < slots.length; i++) {
  //       var slot = slots.items(i);
  //       console.log("Slot #" + slot.handle);
  //       console.log("\tDescription:", slot.slotDescription);
  //       console.log("\tSerial:", slot.getToken().serialNumber);
  //       console.log(
  //         "\tPassword(min/max): %d/%d",
  //         slot.getToken().minPinLen,
  //         slot.getToken().maxPinLen
  //       );
  //       console.log(
  //         "\tIs hardware:",
  //         !!(slot.flags & graphene.SlotFlag.HW_SLOT)
  //       );
  //       console.log(
  //         "\tIs removable:",
  //         !!(slot.flags & graphene.SlotFlag.REMOVABLE_DEVICE)
  //       );
  //       console.log(
  //         "\tIs initialized:",
  //         !!(slot.flags & graphene.SlotFlag.TOKEN_PRESENT)
  //       );
  //       console.log("\n\nMechanisms:");
  //       console.log("Name                       h/s/v/e/d/w/u");
  //       console.log("========================================");
  //       function b(v) {
  //         return v ? "+" : "-";
  //       }

  //       function s(v) {
  //         v = v.toString();
  //         for (var i_1 = v.length; i_1 < 27; i_1++) {
  //           v += " ";
  //         }
  //         return v;
  //       }

  //       var mechs = slot.getMechanisms();
  //       for (var j = 0; j < mechs.length; j++) {
  //         var mech = mechs.items(j);
  //         console.log(
  //           s(mech.name) +
  //             b(mech.flags & graphene.MechanismFlag.DIGEST) +
  //             "/" +
  //             b(mech.flags & graphene.MechanismFlag.SIGN) +
  //             "/" +
  //             b(mech.flags & graphene.MechanismFlag.VERIFY) +
  //             "/" +
  //             b(mech.flags & graphene.MechanismFlag.ENCRYPT) +
  //             "/" +
  //             b(mech.flags & graphene.MechanismFlag.DECRYPT) +
  //             "/" +
  //             b(mech.flags & graphene.MechanismFlag.WRAP) +
  //             "/" +
  //             b(mech.flags & graphene.MechanismFlag.UNWRAP)
  //         );
  //       }
  //     }
  //   }
  // } catch (err) {
  //   console.error(err);
  // }

  // region HASHING
  // try {
  //   var slot = mod.getSlots(0);
  //   if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
  //     var session = slot.open();
  //     var digest = session.createDigest("sha1");

  //     // digest.update -> to input plain text buffer and can be concat to the next update
  //     digest.update("YANUAR");
  //     var hash = digest.final();
  //     console.log("Hash SHA1:", hash.toString("hex"));
  //     session.close();
  //   } else {
  //     console.error("Slot is not initialized");
  //   }
  // } catch (err) {
  //   console.error(err);
  // }

  // region GENERATING KEY
  // try {
  //   var slot = mod.getSlots(0);
  //   if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
  //     var session = slot.open();
  //     session.login("147258");

  //     var k = session.generateKey(graphene.KeyGenMechanism.AES, {
  //       class: graphene.ObjectClass.SECRET_KEY,
  //       token: false,
  //       valueLen: 256 / 8,
  //       keyType: graphene.KeyType.AES,
  //       label: "My AES secret key",
  //       private: true,
  //     });

  //     console.log("Key.handle:", k.handle); // Key.handle: 2
  //     console.log("Key.type:", graphene.KeyType[k.type]); // Key.type: AES

  //     session.logout();
  //     session.close();
  //   } else {
  //     console.error("Slot is not initialized");
  //   }
  // } catch (err) {
  //   console.error(err);
  // }

  // region SIGN / VERIFY
  // try {
  //   var slot = mod.getSlots(0);
  //   if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
  //     var session = slot.open(
  //       graphene.SessionFlag.RW_SESSION | graphene.SessionFlag.SERIAL_SESSION
  //     );
  //     session.login("147258");

  //     // generate RSA key pair
  //     var keys = session.generateKeyPair(
  //       graphene.KeyGenMechanism.RSA,
  //       {
  //         //public
  //         keyType: graphene.KeyType.RSA,
  //         modulusBits: 1024,
  //         publicExponent: Buffer.from([3]),
  //         token: true,
  //         verify: true,
  //         encrypt: true,
  //         wrap: true,
  //         label: "testPub",
  //       },
  //       {
  //         //private
  //         keyType: graphene.KeyType.RSA,
  //         token: true,
  //         sign: true,
  //         decrypt: true,
  //         unwrap: true,
  //         label: "testPriv",
  //       }
  //     );

  //     // sign content
  //     for (let i = 1; i <= 5; i++) {
  //       console.time();
  //       var sign = session.createSign("SHA512_RSA_PKCS", keys.privateKey);
  //       sign.update(
  //         "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit semper vel class aptent taciti sociosqu ad litora torquent per conubia nostra inceptos himenaeos orci varius natoque penatibus et magnis dis parturient montes nascetur ridiculus12"
  //       );
  //       var signature = sign.final();
  //       console.timeEnd();
  //       // console.log("Signature RSA-SHA1:", signature.toString("hex")); // Signature RSA-SHA1: 6102a66dc0d97fadb5...
  //     }

  //     // verify content
  //     for (let i = 1; i <= 5; i++) {
  //       console.time();
  //       var verify = session.createVerify("SHA512_RSA_PKCS", keys.publicKey);
  //       verify.update(
  //         "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit semper vel class aptent taciti sociosqu ad litora torquent per conubia nostra inceptos himenaeos orci varius natoque penatibus et magnis dis parturient montes nascetur ridiculus12"
  //       );
  //       var verify_result = verify.final(signature);
  //       console.timeEnd();
  //       console.log("Signature RSA-SHA1 verify:", verify_result); // Signature RSA-SHA1 verify: true
  //     }

  //     session.logout();
  //     session.close();
  //   } else {
  //     console.error("Slot is not initialized");
  //   }
  // } catch (err) {
  //   console.error(err);
  // }

  mod.finalize();
} catch (err) {
  console.error(err);
}
