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
var list_created_links_exports = {};
__export(list_created_links_exports, {
  listCreatedLinks: () => listCreatedLinks
});
module.exports = __toCommonJS(list_created_links_exports);
var import_bcs = require("@mysten/sui.js/bcs");
var import_graphql = require("@mysten/sui.js/graphql");
var import__ = require("@mysten/sui.js/graphql/schemas/2024.4");
var import_utils = require("@mysten/sui.js/utils");
var import_claim = require("./claim.js");
var import_zk_bag = require("./zk-bag.js");
const ListCreatedLinksQuery = (0, import__.graphql)(`
	query listCreatedLinks($address: SuiAddress!, $function: String!, $cursor: String) {
		transactionBlocks(
			last: 10
			before: $cursor
			filter: { signAddress: $address, function: $function, kind: PROGRAMMABLE_TX }
		) {
			pageInfo {
				startCursor
				hasPreviousPage
			}
			nodes {
				effects {
					timestamp
				}
				digest
				kind {
					__typename
					... on ProgrammableTransactionBlock {
						inputs(first: 10) {
							nodes {
								__typename
								... on Pure {
									bytes
								}
							}
						}
						transactions(first: 10) {
							nodes {
								__typename
								... on MoveCallTransaction {
									module
									functionName
									package
									arguments {
										__typename
										... on Input {
											ix
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
`);
async function listCreatedLinks({
  address,
  cursor,
  network,
  contract = import_zk_bag.MAINNET_CONTRACT_IDS,
  fetch: fetchFn,
  ...linkOptions
}) {
  const gqlClient = new import_graphql.SuiGraphQLClient({
    url: network === "testnet" ? "https://sui-testnet.mystenlabs.com/graphql" : "https://sui-mainnet.mystenlabs.com/graphql",
    fetch: fetchFn
  });
  const packageId = (0, import_utils.normalizeSuiAddress)(contract.packageId);
  const page = await gqlClient.query({
    query: ListCreatedLinksQuery,
    variables: {
      address,
      cursor,
      function: `${packageId}::zk_bag::new`
    }
  });
  const transactionBlocks = page.data?.transactionBlocks;
  if (!transactionBlocks || page.errors?.length) {
    throw new Error("Failed to load created links");
  }
  const links = (await Promise.all(
    transactionBlocks.nodes.map(async (node) => {
      if (node.kind?.__typename !== "ProgrammableTransactionBlock") {
        throw new Error("Invalid transaction block");
      }
      const fn = node.kind.transactions.nodes.find(
        (fn2) => fn2.__typename === "MoveCallTransaction" && fn2.package === packageId && fn2.module === "zk_bag" && fn2.functionName === "new"
      );
      if (fn?.__typename !== "MoveCallTransaction") {
        return null;
      }
      const addressArg = fn.arguments[1];
      if (addressArg.__typename !== "Input") {
        throw new Error("Invalid address argument");
      }
      const input = node.kind.inputs.nodes[addressArg.ix];
      if (input.__typename !== "Pure") {
        throw new Error("Expected Address input to be a Pure value");
      }
      const address2 = import_bcs.bcs.Address.parse((0, import_utils.fromB64)(input.bytes));
      const link = new import_claim.ZkSendLink({
        network,
        address: address2,
        contract,
        isContractLink: true,
        ...linkOptions
      });
      await link.loadAssets();
      return {
        link,
        claimed: !!link.claimed,
        assets: link.assets,
        digest: node.digest,
        createdAt: node.effects?.timestamp
      };
    })
  )).reverse();
  return {
    cursor: transactionBlocks.pageInfo.startCursor,
    hasNextPage: transactionBlocks.pageInfo.hasPreviousPage,
    links: links.filter((link) => link !== null)
  };
}
//# sourceMappingURL=list-created-links.js.map
