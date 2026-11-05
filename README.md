# Salesforce Token Extension for Cognigy.AI

Adds one Extension Node that requests an OAuth access token from Salesforce.

## What the node sends

- Method: POST
- URL: the `tokenUrl` field of the node
- Header `Content-Type: application/x-www-form-urlencoded` (fixed in the code — no other headers are sent)
- Body, x-www-form-urlencoded: `grant_type`, `client_id`, `client_secret` — all from the connection

## Connection "Salesforce Token"

| Field           | Description                                     |
| --------------- | ----------------------------------------------- |
| `client_id`     | The OAuth client id issued by CXOne             |
| `client_secret` | The matching client secret                      |
| `grant_type`    | OAuth grant type, typically `password`          |

## Node "Salesforce: Request Access Token"

| Field                | Default            | Description                                       |
| -------------------- | ------------------ | ------------------------------------------------- |
| `connection`         | –                  | The connection to use                             |
| `tokenUrl`           | –                  | The full token endpoint URL of your CXOne tenant   |
| `responseContextKey` | `sfAuth`           | Context key holding `{ success, status, data }`   |
| `tokenContextKey`    | `sfAccessToken`    | Context key holding the `access_token` string     |

A successful run stores:

    context.sfAuth = { success: true, status: 200, data: { access_token: "...", ... } }
    context.sfAccessToken = "..."

A failed run never throws; it stores the reason:

    context.sfAuth = { success: false, status: 401, data: { ... } }
    context.sfAuth = { success: false, error: "Request timed out after 15000 ms" }

## Build

    npm install
    npm run build

Then pack the compiled package as a gzipped tarball named `salesforce-token-extension.tar.gz`, with these items at the root of the archive:

    build/
    package.json
    package-lock.json
    README.md
    icon.png        (optional, 64x64 pixels)

Pack only the ones that exist — this skips any missing file instead of failing:

    tar -czf salesforce-token-extension.tar.gz $(ls -d build package.json package-lock.json README.md icon.png 2>/dev/null)

Upload the `.tar.gz` to Cognigy.AI as it is — Cognigy unpacks it itself.

## Notes

- Extension Nodes time out after 20 seconds; the HTTP request aborts after 15 seconds.
- The node makes one external call, well inside the 10-call limit per execution.
- Credentials live only in the connection; the token endpoint lives on the node.
- The only header sent is the form Content-Type — client authentication travels in the body.
