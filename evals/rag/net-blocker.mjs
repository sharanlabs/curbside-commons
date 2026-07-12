/**
 * E2 — runtime network denial preload (pre-reg §3 / §7.5).
 *
 * Loaded via `node --import` before any application code: it replaces
 * `globalThis.fetch`, `http.request`/`http.get`, `https.request`/`https.get`,
 * and `net.Socket.prototype.connect` with throwing stubs. Any attempted
 * network touch — DNS, TCP, HTTP, a model download — crashes the process
 * loudly. The E2 scoring run and the offline-inference proof both execute
 * under this preload, which is what "network-denied clean run" means in the
 * results doc (command + exit code recorded there).
 *
 * Plain: we start the program with its network hands tied behind its back —
 * if it ever tries to reach the internet it falls over instantly, so a clean
 * finish PROVES it never did.
 */
import http from "node:http";
import https from "node:https";
import net from "node:net";

const deny = (what) => {
  throw new Error(`NET-BLOCKED (E2 network-denied run): attempted ${what}`);
};

globalThis.fetch = async (input) => deny(`fetch ${typeof input === "string" ? input : input?.url ?? "?"}`);
http.request = () => deny("http.request");
http.get = () => deny("http.get");
https.request = () => deny("https.request");
https.get = () => deny("https.get");
net.Socket.prototype.connect = function blocked() {
  deny("net.Socket.connect");
};

process.stderr.write("[net-blocker] network APIs disabled for this process\n");
