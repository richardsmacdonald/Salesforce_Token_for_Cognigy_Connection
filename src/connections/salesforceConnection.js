// Connection = the encrypted key/value store you fill in inside Cognigy.AI.
// Every key below becomes a field on the connection form.
export const salesforceConnection = {
	type: "salesforceToken",
	label: "Salesforce Token",
	fields: [
		{ fieldName: "client_id" },
		{ fieldName: "client_secret" },
		{ fieldName: "grant_type" }
	]
};
