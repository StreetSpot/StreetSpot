# StreetSpot Agent Integration Guide

StreetSpot helps people discover local vendors, food trucks, pop-up shops, businesses, events, and community spots. Vendors and hosts can use StreetSpot to improve local discovery and engagement.

## Public machine-readable resources

- A2A Agent Card: https://streetspotapp.com/.well-known/agent-card.json
- MCP Server Card: https://streetspotapp.com/.well-known/mcp/server-card.json
- Agent Skills index: https://streetspotapp.com/.well-known/agent-skills/index.json
- API catalog: https://streetspotapp.com/.well-known/api-catalog
- OpenAPI description: https://streetspotapp.com/openapi.json
- Authentication policy: https://streetspotapp.com/auth.md

## Supported agent interfaces

The MCP endpoint exposes a small set of read-only public tools for StreetSpot overview, discovery links, and support guidance. It does not provide private user data, vendor claims, payments, publishing, or operator actions.

The A2A endpoint provides an informational agent interface only. It does not execute external actions or claim access to live analytics, Play Console, ad accounts, newsletter accounts, or payment systems.

## Security

Never include secrets or personal data in tool inputs. Production changes and sensitive operations require separately authenticated workflows and explicit human review. Search suggestions are ideas, not verified search volume or performance metrics.

## Support

https://streetspotapp.com/support
