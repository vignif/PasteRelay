# PasteRelay Signaling Server

WebSocket server for session creation, PIN mapping, and SDP/ICE relay.

Env:
- PORT (default 8080)
- PIN_LENGTH (default 6)
- SESSION_TTL_SECONDS (default 3600)
- ICE_SERVERS (JSON, default includes Google STUN)
- TURN_* (optional)