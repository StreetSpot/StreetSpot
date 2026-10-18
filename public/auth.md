# auth.md — StreetSpot Agent Registration and Authentication

StreetSpot is a local discovery platform for vendors, pop-up retailers, businesses, events, and community places. This document is for software agents seeking to discover StreetSpot's public information and understand the supported registration and authentication methods.

## Agent registration and provisioning

- **Agent registration endpoint:** Not currently available. StreetSpot does not offer public machine registration or dynamic client registration.
- **Credential provisioning endpoint:** Not currently available. Do not probe undocumented endpoints or attempt to create accounts through this document.
- **Manual registration request:** Human operators can contact support@streetspotapp.com to ask about future integration access. A support request does not automatically create an account or issue credentials.
- **Supported agent method today:** Public, read-only discovery tools at https://streetspotapp.com/api/mcp and informational requests at https://streetspotapp.com/api/agents/a2a. These methods require no credentials and expose no private user data.

## Supported authentication methods and credential use

1. **Public read-only tools:** No credentials required. Use only for public platform information, official links, and general support routing.
2. **Operator console:** Interactive human sign-in at https://streetspotapp.com/agents/login. Its password and browser session cookie are for human operators only, are not API credentials, and must never be reused by agents.
3. **OAuth 2.0 / OpenID Connect:** Not currently offered. StreetSpot does not advertise an authorization server, authorization endpoint, token endpoint, JWKS, or public OAuth client-registration endpoint. Do not infer or fabricate issuer URLs.

## Safe use

Do not submit secrets, personal data, payment credentials, or private event details to public tools. Vendor claims, account changes, payments, publishing, and production operations require separately supported authenticated workflows and human review. Do not represent informational responses as verified analytics, live search volume, account access, or completed actions.

## Machine-readable agent_auth declaration

```yaml
agent_auth:
  skill: streetspot-discovery
  register_uri: mailto:support@streetspotapp.com
  registration_methods:
    - type: manual-support-request
      description: Request future integration access from StreetSpot support. This is a human-reviewed request, not an automated account or credential-issuance endpoint.
  credential_use: Public discovery tools require no credentials. No general-purpose agent credentials are currently issued.
```

For help, use https://streetspotapp.com/support or email support@streetspotapp.com.
