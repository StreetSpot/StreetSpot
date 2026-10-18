# auth.md — StreetSpot Agent Registration and Authentication

StreetSpot is a local discovery platform for vendors, pop-up retailers, businesses, events, and community places.

## Agent audience

This document is for software agents seeking to discover StreetSpot's public information and documented integration capabilities.

## Registration and credentials

StreetSpot does not currently provide a public self-service OAuth client-registration endpoint or issue general-purpose agent API credentials. Do not attempt to register accounts or obtain credentials through undocumented endpoints. Public discovery resources and the read-only MCP tools documented by the server card are available without account credentials. Operator-only workflows and user data remain access-controlled.

## Supported authentication methods

- Public discovery and read-only MCP tools: no credentials required; no private user data is exposed.
- StreetSpot operator console: interactive human sign-in only. The console password and session cookie are not an API credential and must not be reused by agents.
- OAuth/OIDC agent authorization: not currently offered. No OAuth authorization server, token endpoint, or JWKS is advertised.

## Safe use

Do not submit secrets, personal data, payment credentials, or private event details to public tools. Vendor claims, account changes, payments, publishing, and production operations require supported authenticated workflows and human review.

For help, use https://streetspotapp.com/support or email support@streetspotapp.com.
