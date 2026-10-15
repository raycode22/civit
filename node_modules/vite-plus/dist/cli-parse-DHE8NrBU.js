import { n as errorMsg, o as printHeader } from "./terminal-MKGAuy-p.js";
//#region src/utils/cli-parse.ts
function unwrapCliParseOutcome(outcome) {
	if (outcome.status === "exit") process.exit(outcome.code);
	if (outcome.status === "error") {
		printHeader();
		errorMsg(outcome.error.message.replace(/^error:\s*/, ""));
		process.exit(1);
	}
	return outcome.value;
}
//#endregion
export { unwrapCliParseOutcome as t };
