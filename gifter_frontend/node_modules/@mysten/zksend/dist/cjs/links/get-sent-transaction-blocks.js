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
var get_sent_transaction_blocks_exports = {};
__export(get_sent_transaction_blocks_exports, {
  getSentTransactionBlocksWithLinks: () => getSentTransactionBlocksWithLinks
});
module.exports = __toCommonJS(get_sent_transaction_blocks_exports);
var import_client = require("@mysten/sui.js/client");
var import_utils = require("@mysten/sui.js/utils");
var import_claim = require("./claim.js");
var import_zk_bag = require("./zk-bag.js");
async function getSentTransactionBlocksWithLinks({
  address,
  cursor,
  limit = 10,
  network = "mainnet",
  contract = import_zk_bag.MAINNET_CONTRACT_IDS,
  client = new import_client.SuiClient({ url: (0, import_client.getFullnodeUrl)(network) }),
  loadClaimedAssets = false,
  ...linkOptions
}) {
  const packageId = (0, import_utils.normalizeSuiAddress)(contract.packageId);
  const page = await client.queryTransactionBlocks({
    filter: {
      FromAddress: address
    },
    order: "descending",
    cursor,
    limit,
    options: {
      showInput: true,
      showObjectChanges: true,
      showBalanceChanges: true
    }
  });
  const data = await Promise.all(
    page.data.map(async (block) => {
      const transactionBlock = block.transaction?.data.transaction;
      if (transactionBlock?.kind !== "ProgrammableTransaction") {
        throw new Error("Invalid transaction block");
      }
      const newLinks = await Promise.all(
        transactionBlock.transactions.filter(
          (tx) => "MoveCall" in tx ? tx.MoveCall.package === packageId && tx.MoveCall.module === "zk_bag" && tx.MoveCall.function === "new" : false
        ).map(async (tx) => {
          if (!("MoveCall" in tx)) {
            throw new Error("Expected MoveCall");
          }
          const addressArg = tx.MoveCall.arguments?.[1];
          if (!addressArg || typeof addressArg !== "object" || !("Input" in addressArg)) {
            throw new Error("Invalid address argument");
          }
          const input = transactionBlock.inputs[addressArg.Input];
          if (input.type !== "pure") {
            throw new Error("Expected Address input to be a Pure value");
          }
          const address2 = (0, import_utils.normalizeSuiAddress)(input.value);
          const link = new import_claim.ZkSendLink({
            network,
            address: address2,
            contract,
            isContractLink: true,
            ...linkOptions
          });
          await link.loadAssets({
            transactionBlock: block,
            loadClaimedAssets
          });
          return link;
        })
      );
      const regeneratedLinks = await Promise.all(
        transactionBlock.transactions.filter(
          (tx) => "MoveCall" in tx ? tx.MoveCall.package === packageId && tx.MoveCall.module === "zk_bag" && tx.MoveCall.function === "update_receiver" : false
        ).map(async (tx) => {
          if (!("MoveCall" in tx)) {
            throw new Error("Expected MoveCall");
          }
          const addressArg = tx.MoveCall.arguments?.[2];
          if (!addressArg || typeof addressArg !== "object" || !("Input" in addressArg)) {
            throw new Error("Invalid address argument");
          }
          const input = transactionBlock.inputs[addressArg.Input];
          if (input.type !== "pure") {
            throw new Error("Expected Address input to be a Pure value");
          }
          const address2 = (0, import_utils.normalizeSuiAddress)(input.value);
          const link = new import_claim.ZkSendLink({
            network,
            address: address2,
            contract,
            isContractLink: true,
            ...linkOptions
          });
          await link.loadAssets({ loadClaimedAssets });
          return link;
        })
      );
      return {
        transactionBlock: block,
        links: [...newLinks, ...regeneratedLinks]
      };
    })
  );
  return {
    data,
    nextCursor: page.nextCursor,
    hasNextPage: page.hasNextPage
  };
}
//# sourceMappingURL=get-sent-transaction-blocks.js.map
