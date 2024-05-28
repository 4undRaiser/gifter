"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var zk_bag_exports = {};
__export(zk_bag_exports, {
  MAINNET_CONTRACT_IDS: () => MAINNET_CONTRACT_IDS,
  ZkBag: () => ZkBag
});
module.exports = __toCommonJS(zk_bag_exports);
var _package, _module;
const MAINNET_CONTRACT_IDS = {
  packageId: "0x5bb7d0bb3240011336ca9015f553b2646302a4f05f821160344e9ec5a988f740",
  bagStoreId: "0x65b215a3f2a951c94313a89c43f0adbd2fd9ea78a0badf81e27d1c9868a8b6fe",
  bagStoreTableId: "0x616db54ca564660cd58e36a4548be68b289371ef2611485c62c374a60960084e"
};
class ZkBag {
  constructor(packageAddress, ids) {
    __privateAdd(this, _package, void 0);
    __privateAdd(this, _module, "zk_bag");
    __privateSet(this, _package, packageAddress);
    this.ids = ids;
  }
  new(txb, {
    arguments: [store, receiver]
  }) {
    txb.moveCall({
      target: `${__privateGet(this, _package)}::${__privateGet(this, _module)}::new`,
      arguments: [
        txb.object(store),
        typeof receiver === "string" ? txb.pure.address(receiver) : receiver
      ]
    });
  }
  add(txb, {
    arguments: [store, receiver, item],
    typeArguments
  }) {
    return txb.moveCall({
      target: `${__privateGet(this, _package)}::${__privateGet(this, _module)}::add`,
      arguments: [
        txb.object(store),
        typeof receiver === "string" ? txb.pure.address(receiver) : receiver,
        txb.object(item)
      ],
      typeArguments
    });
  }
  init_claim(txb, {
    arguments: [store]
  }) {
    const [bag, claimProof] = txb.moveCall({
      target: `${__privateGet(this, _package)}::${__privateGet(this, _module)}::init_claim`,
      arguments: [txb.object(store)]
    });
    return [bag, claimProof];
  }
  reclaim(txb, {
    arguments: [store, receiver]
  }) {
    const [bag, claimProof] = txb.moveCall({
      target: `${__privateGet(this, _package)}::${__privateGet(this, _module)}::reclaim`,
      arguments: [
        txb.object(store),
        typeof receiver === "string" ? txb.pure.address(receiver) : receiver
      ]
    });
    return [bag, claimProof];
  }
  claim(txb, {
    arguments: [bag, claim, id],
    typeArguments
  }) {
    return txb.moveCall({
      target: `${__privateGet(this, _package)}::${__privateGet(this, _module)}::claim`,
      arguments: [txb.object(bag), txb.object(claim), typeof id === "string" ? txb.object(id) : id],
      typeArguments
    });
  }
  finalize(txb, {
    arguments: [bag, claim]
  }) {
    txb.moveCall({
      target: `${__privateGet(this, _package)}::${__privateGet(this, _module)}::finalize`,
      arguments: [txb.object(bag), txb.object(claim)]
    });
  }
  update_receiver(txb, {
    arguments: [bag, from, to]
  }) {
    txb.moveCall({
      target: `${__privateGet(this, _package)}::${__privateGet(this, _module)}::update_receiver`,
      arguments: [
        txb.object(bag),
        typeof from === "string" ? txb.pure.address(from) : from,
        typeof to === "string" ? txb.pure.address(to) : to
      ]
    });
  }
}
_package = new WeakMap();
_module = new WeakMap();
//# sourceMappingURL=zk-bag.js.map
