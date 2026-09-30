# WellnessCafe video sessions

## Product decision

WellnessCafe provides the session room inside its signed-in experience, with LiveKit Cloud currently carrying the real-time media. Clients and practitioners do not need to join a Google Meet or Zoom URL. The room interface, scheduling, authorization, and identity controls are in WellnessCafe; the media transport itself is a managed third-party service, not WellnessCafe-owned infrastructure. The practitioner-provided URL remains an interim external handoff.

## Release and investment decision (2026-09-27)

The user supplied an existing LiveKit Cloud project and requested its use. Native rooms are enabled against the free Build plan; do not upgrade it or provision Compute Engine or other paid media hosting without explicit direction. LiveKit documents that Build-plan media quotas are hard caps, so new requests fail at the limit instead of creating overage charges. Verify the actual project plan and current usage in its dashboard before broad rollout. Google Cloud Functions may incur separate usage charges. Revisit capacity, media ownership, agreements, and long-term release investment at the second-run/version-upgrade gate.

## Recommended implementation

- Build a first-party room at a WellnessCafe route tied to one appointment. The room should include a pre-join device check, waiting state, clear participant identity, microphone/camera controls, connection state, and a reliable leave/return path.
- Current deployment: use LiveKit Cloud's managed WebRTC transport on the existing free Build plan. The product, account controls, appointment rules, tokens, room lifecycle, and user experience remain WellnessCafe-owned; the underlying media service is managed by LiveKit. Evaluate self-hosting only if later product, privacy, budget, and operations needs justify owning that infrastructure.
- Mint short-lived, appointment-scoped join tokens server-side only after checking that the signed-in user is the client or practitioner on that appointment and that the appointment is in its join window. Keep service credentials out of the browser. Do not put names, check-in text, or clinical details in room names or infrastructure logs.
- Use a first-party video subdomain and TLS. Configure public WebRTC network ports and TURN/TLS for restrictive networks. Firebase callable functions can authorize room entry and create access tokens; they do not carry real-time media.
- Do not record by default. Any later recording, transcription, or AI participation needs separate explicit consent, retention controls, access auditing, and a compliance review before production use.

## Delivery gates

1. Confirm a WellnessCafe-controlled DNS name for the video service and a cloud budget/owner for always-on media infrastructure.
2. Stand up development and staging SFU environments, TURN connectivity, TLS, health monitoring, and secret rotation.
3. Implement room-token and appointment authorization functions, participant lifecycle webhooks, rate limits, and audit events.
4. Build and test the first-party pre-join, in-room, reconnect, and post-call experience on desktop and mobile.
5. Verify two-account joins, unauthorized/expired tokens, dropped-network recovery, camera/microphone permissions, privacy, and regional connectivity before enabling production.

Self-hosting a WebRTC SFU is operationally different from deploying a static Firebase app: it needs reachable public networking, UDP/TURN configuration, TLS, capacity monitoring, and infrastructure that can handle live media. Start with one region close to the first expected users, then expand based on measured demand and latency.

## Implementation checkpoint (2026-09-27)

The application slice is deployed and enabled, but still needs a real two-account verification:

- A callable issues a five-minute token only to the client or practitioner on a confirmed appointment with an active connection, during the appointment join window. The opaque room and participant IDs contain no names or check-in content; the token can publish camera and microphone and subscribe to the room.
- `/sessions/:appointmentId/video` is a signed-in, first-party room with explicit camera/microphone choices, a join action, remote/local media surfaces, leave controls, and truthful connection errors. It does not record.
- Practitioners can select the native room format when `VITE_WELLNESSCAFE_VIDEO_ENABLED=true`; the scheduling callable separately requires `WELLNESSCAFE_VIDEO_ENABLED=true`. Both are enabled for the current release. The browser cannot supply or override the server URL or signing secrets.

The current configuration is deployed, but a production call has not yet been verified with separate client and practitioner accounts. The LiveKit Cloud project supplies the media endpoint/TLS; this is not self-hosted media infrastructure. Test permissions, appointment join window, network recovery, quota behavior, and whether the user's account remains on the free Build plan before broad rollout. Do not upgrade or create paid resources without explicit direction. Existing external meeting links remain available as fallback.
