---
title: "Decoding JWTs Safely: Decoding Is Not Signature Verification"
description: "Learn what a JWT decoder can reveal, what it cannot prove, and how to validate tokens safely in an application."
pubDate: 2026-08-26
tags: ["jwt", "security", "developer-tools"]
draft: false
---

A JSON Web Token commonly contains three dot-separated segments: header, payload, and signature. The first two are Base64URL-encoded JSON. Anyone who has the token can decode them. That readability is a feature, not proof that the claims are trustworthy.

The [JWT Decoder](/tools/jwt-decoder/) splits the token, decodes the header and payload, and displays fields such as `sub`, `iss`, `aud`, `iat`, and `exp`. It does not have a trusted secret or public key, so it does not verify the signature.

Consider a payload containing `{"role":"admin"}`. A person can create that text and encode it into a token-shaped string. A decoder will display the claim correctly because decoding asks only “what bytes are here?” Verification asks “did a trusted issuer sign these exact bytes with an allowed algorithm?”

## A harmless decoding example

Paste this deliberately unsigned example into the decoder:

```text
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJkZW1vIiwicm9sZSI6InJlYWRlciJ9.
```

The header is `{"alg":"none","typ":"JWT"}` and the payload is `{"sub":"demo","role":"reader"}`. The signature segment is empty. These readable values provide no authorization evidence. An application expecting a signed token must reject this example. Use it only to check decoding, never as an authentication credential.

## Safe validation requires more

- Pin the expected signing algorithm; never accept an algorithm just because the token header requests it.
- Select trusted key material for the expected issuer.
- Verify the cryptographic signature before trusting claims.
- Validate issuer, audience, expiry, not-before time, and any application-specific requirements.
- Handle key rotation, clock skew, token revocation policy, and replay risk in the application.

Do not paste active production credentials into websites unnecessarily. This decoder processes the entered token in the browser, but tokens can still appear in screenshots, clipboard history, extensions, logs, or shoulder surfing. Use a redacted or expired sample whenever possible.

For authorization, use a maintained JWT library in the server or trusted client that owns the security decision. Primary references: [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519) and the [OWASP JWT cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html).
