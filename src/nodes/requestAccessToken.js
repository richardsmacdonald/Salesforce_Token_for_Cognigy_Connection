import { createNodeDescriptor } from "@cognigy/extension-tools";
import { postForm } from "../lib/postForm";

// The platform kills any Extension Node after 20 seconds - stay well below it.
const REQUEST_TIMEOUT_MS = 15000;

function trim(value) {
	return typeof value === "string" ? value.trim() : "";
}

function parseBody(raw) {
	if (!raw) {
		return null;
	}

	try {
		return JSON.parse(raw);
	} catch (error) {
		return raw;
	}
}

export const requestAccessToken = createNodeDescriptor({
	type: "requestAccessToken",
	defaultLabel: "Salesforce: Request Access Token",
	summary: "POSTs grant_type, client_id and client_secret as x-www-form-urlencoded to the token endpoint set on the node and stores the access token in the Context.",
	fields: [
		{
			key: "connection",
			label: "Salesforce Connection",
			type: "connection",
			params: {
				required: true,
				connectionType: "salesforceToken"
			}
		},
		{
			key: "tokenUrl",
			label: "Token endpoint URL",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "responseContextKey",
			label: "Context key for the full response",
			type: "cognigyText",
			defaultValue: "sfAuth",
			params: {
				required: true
			}
		},
		{
			key: "tokenContextKey",
			label: "Context key for the access token",
			type: "cognigyText",
			defaultValue: "sfAccessToken"
		}
	],
	function: async ({ cognigy, config }) => {
		const { api } = cognigy;
		const responseKey = trim(config.responseContextKey) || "sfAuth";
		const tokenKey = trim(config.tokenContextKey);
		const connection = config.connection || {};

		const tokenUrl = trim(config.tokenUrl);

		if (!tokenUrl) {
			const message = "No token endpoint URL set on the node.";
			api.log("error", message);
			api.addToContext(responseKey, { success: false, error: message }, "simple");
			return;
		}

		// Body: application/x-www-form-urlencoded, every value taken from the connection.
		const form = new URLSearchParams();
		form.append("grant_type", trim(connection.grant_type));
		form.append("client_id", trim(connection.client_id));
		form.append("client_secret", trim(connection.client_secret));

		const headers = {
			// Hard-coded, exactly as required - the only header sent.
			"Content-Type": "application/x-www-form-urlencoded"
		};

		try {
			const response = await postForm(tokenUrl, headers, form.toString(), REQUEST_TIMEOUT_MS);
			const data = parseBody(response.body);

			if (response.statusCode >= 200 && response.statusCode < 300) {
				api.log("info", "Salesforce token request succeeded (" + response.statusCode + ").");
				api.addToContext(responseKey, { success: true, status: response.statusCode, data }, "simple");

				const token = data && typeof data === "object" ? data.access_token : undefined;

				if (tokenKey && token) {
					api.addToContext(tokenKey, token, "simple");
				}

				return;
			}

			api.log(
				"error",
				"Salesforce token request failed (" + response.statusCode + "): " + response.body.slice(0, 500)
			);
			api.addToContext(responseKey, { success: false, status: response.statusCode, data }, "simple");
		} catch (error) {
			const message = error && error.message ? error.message : String(error);
			api.log("error", "Salesforce token request failed: " + message);
			api.addToContext(responseKey, { success: false, error: message }, "simple");
		}
	}
});
