import { createExtension } from "@cognigy/extension-tools";
import { salesforceConnection } from "./connections/salesforceConnection";
import { requestAccessToken } from "./nodes/requestAccessToken";

export default createExtension({
	nodes: [requestAccessToken],
	connections: [salesforceConnection]
});
