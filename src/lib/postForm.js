import * as http from "http";
import * as https from "https";

const MAX_BODY_CHARS = 200000;

// Posts a form-urlencoded body. Node core modules only - no extra dependencies.
export function postForm(url, headers, body, timeoutMs) {
	return new Promise((resolve, reject) => {
		let target;

		try {
			target = new URL(url);
		} catch (error) {
			reject(new Error("Invalid URL: " + url));
			return;
		}

		if (target.protocol !== "https:" && target.protocol !== "http:") {
			reject(new Error("Unsupported protocol: " + target.protocol));
			return;
		}

		const transport = target.protocol === "https:" ? https : http;
		const payload = Buffer.from(body, "utf8");

		const request = transport.request(
			{
				method: "POST",
				hostname: target.hostname,
				port: target.port || (target.protocol === "https:" ? 443 : 80),
				path: target.pathname + target.search,
				headers: {
					...headers,
					"Content-Length": payload.length
				}
			},
			(response) => {
				const chunks = [];

				response.on("data", (chunk) => chunks.push(chunk));
				response.on("end", () => {
					const text = Buffer.concat(chunks).toString("utf8");
					resolve({
						statusCode: response.statusCode || 0,
						body: text.length > MAX_BODY_CHARS ? text.slice(0, MAX_BODY_CHARS) : text
					});
				});
			}
		);

		request.setTimeout(timeoutMs, () => {
			request.destroy(new Error("Request timed out after " + timeoutMs + " ms"));
		});

		request.on("error", (error) => reject(error));
		request.write(payload);
		request.end();
	});
}
