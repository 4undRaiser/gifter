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
var _id, _origin, _name, _close, _request;
import { parse, safeParse } from "valibot";
import { withResolvers } from "../../utils/withResolvers.js";
import { StashedRequest, StashedResponse } from "./events.js";
const DEFAULT_STASHED_ORIGIN = "https://getstashed.com";
class StashedPopup {
  constructor({ origin = DEFAULT_STASHED_ORIGIN, name }) {
    __privateAdd(this, _id, void 0);
    __privateAdd(this, _origin, void 0);
    __privateAdd(this, _name, void 0);
    __privateAdd(this, _close, void 0);
    __privateSet(this, _id, crypto.randomUUID());
    __privateSet(this, _origin, origin);
    __privateSet(this, _name, name);
  }
  async createRequest(request) {
    const popup = window.open("about:blank", "_blank");
    if (!popup) {
      throw new Error("Failed to open new window");
    }
    const { promise, resolve, reject } = withResolvers();
    let interval = null;
    function cleanup() {
      if (interval) {
        clearInterval(interval);
      }
      window.removeEventListener("message", listener);
    }
    const listener = (event) => {
      if (event.origin !== __privateGet(this, _origin)) {
        return;
      }
      const { success, output } = safeParse(StashedResponse, event.data);
      if (!success || output.id !== __privateGet(this, _id))
        return;
      cleanup();
      if (output.payload.type === "reject") {
        reject(new Error("User rejected the request"));
      } else if (output.payload.type === "resolve") {
        resolve(output.payload.data);
      }
    };
    __privateSet(this, _close, () => {
      cleanup();
      popup?.close();
    });
    window.addEventListener("message", listener);
    const { type, ...data } = request;
    popup?.location.assign(
      `${__privateGet(this, _origin)}/dapp/${type}?${new URLSearchParams({
        id: __privateGet(this, _id),
        origin: window.origin,
        name: __privateGet(this, _name)
      })}${data ? `#${new URLSearchParams(data)}` : ""}`
    );
    interval = setInterval(() => {
      try {
        if (popup?.closed) {
          cleanup();
          reject(new Error("User closed the Stashed window"));
        }
      } catch {
      }
    }, 1e3);
    return promise;
  }
  close() {
    var _a;
    (_a = __privateGet(this, _close)) == null ? void 0 : _a.call(this);
  }
}
_id = new WeakMap();
_origin = new WeakMap();
_name = new WeakMap();
_close = new WeakMap();
const _StashedHost = class {
  constructor(request) {
    __privateAdd(this, _request, void 0);
    if (typeof window === "undefined" || !window.opener) {
      throw new Error(
        "StashedHost can only be used in a window opened through `window.open`. `window.opener` is not available."
      );
    }
    __privateSet(this, _request, request);
  }
  static fromUrl(url = window.location.href) {
    const parsed = new URL(url);
    const urlHashData = parsed.hash ? Object.fromEntries(
      [...new URLSearchParams(parsed.hash.slice(1))].map(([key, value]) => [
        key,
        value.replace(/ /g, "+")
      ])
    ) : {};
    const request = parse(StashedRequest, {
      id: parsed.searchParams.get("id"),
      origin: parsed.searchParams.get("origin"),
      name: parsed.searchParams.get("name"),
      payload: {
        type: parsed.pathname.split("/").pop(),
        ...urlHashData
      }
    });
    return new _StashedHost(request);
  }
  getRequestData() {
    return __privateGet(this, _request);
  }
  sendMessage(payload) {
    window.opener.postMessage(
      {
        id: __privateGet(this, _request).id,
        source: "zksend-channel",
        payload
      },
      __privateGet(this, _request).origin
    );
  }
  close(payload) {
    if (payload) {
      this.sendMessage(payload);
    }
    window.close();
  }
};
let StashedHost = _StashedHost;
_request = new WeakMap();
export {
  DEFAULT_STASHED_ORIGIN,
  StashedHost,
  StashedPopup,
  StashedRequest,
  StashedResponse
};
//# sourceMappingURL=index.js.map
