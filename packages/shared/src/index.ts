import { z } from "zod";

export const IceServerSchema = z.object({
  urls: z.union([z.string(), z.array(z.string())]),
  username: z.string().optional(),
  credential: z.string().optional(),
});
export type IceServer = z.infer<typeof IceServerSchema>;

// Signaling messages
export const CreateSessionRequest = z.object({ type: z.literal("create_session") });
export type CreateSessionRequest = z.infer<typeof CreateSessionRequest>;

export const CreateSessionResponse = z.object({
  type: z.literal("create_session_ok"),
  sessionId: z.string(),
  pin: z.string(),
  iceServers: z.array(IceServerSchema),
  ownerPeerId: z.string(),
});
export type CreateSessionResponse = z.infer<typeof CreateSessionResponse>;

export const JoinByPinRequest = z.object({
  type: z.literal("join_by_pin"),
  pin: z.string(),
});
export type JoinByPinRequest = z.infer<typeof JoinByPinRequest>;

export const JoinByPinResponse = z.object({
  type: z.literal("join_by_pin_ok"),
  sessionId: z.string(),
  ownerPeerId: z.string(),
  iceServers: z.array(IceServerSchema),
  yourPeerId: z.string(),
});
export type JoinByPinResponse = z.infer<typeof JoinByPinResponse>;

export const ErrorMessage = z.object({
  type: z.literal("error"),
  code: z.string(),
  message: z.string(),
});
export type ErrorMessage = z.infer<typeof ErrorMessage>;

export const SdpOffer = z.object({
  type: z.literal("sdp_offer"),
  sessionId: z.string(),
  fromPeerId: z.string(),
  toPeerId: z.string(),
  sdp: z.string(),
});
export type SdpOffer = z.infer<typeof SdpOffer>;

export const SdpAnswer = z.object({
  type: z.literal("sdp_answer"),
  sessionId: z.string(),
  fromPeerId: z.string(),
  toPeerId: z.string(),
  sdp: z.string(),
});
export type SdpAnswer = z.infer<typeof SdpAnswer>;

export const IceCandidate = z.object({
  type: z.literal("ice_candidate"),
  sessionId: z.string(),
  fromPeerId: z.string(),
  toPeerId: z.string(),
  candidate: z.any(),
});
export type IceCandidate = z.infer<typeof IceCandidate>;

export const Presence = z.object({
  type: z.literal("presence"),
  sessionId: z.string(),
  peers: z.array(z.string()),
});
export type Presence = z.infer<typeof Presence>;

export const Attach = z.object({
  type: z.literal("attach"),
  sessionId: z.string(),
  peerId: z.string(),
});
export type Attach = z.infer<typeof Attach>;

export const SignalingEnvelope = z.union([
  CreateSessionRequest,
  CreateSessionResponse,
  JoinByPinRequest,
  JoinByPinResponse,
  ErrorMessage,
  SdpOffer,
  SdpAnswer,
  IceCandidate,
  Presence,
  Attach,
]);
export type SignalingEnvelope = z.infer<typeof SignalingEnvelope>;

// DataChannel messages
export const ClipboardPush = z.object({
  type: z.literal("clipboard_push"),
  id: z.string(),
  ts: z.number(),
  from: z.string(),
  payload: z.object({ text: z.string() }),
});
export type ClipboardPush = z.infer<typeof ClipboardPush>;

export const Ack = z.object({
  type: z.literal("ack"),
  id: z.string(),
});
export type Ack = z.infer<typeof Ack>;

export const DataEnvelope = z.union([ClipboardPush, Ack]);
export type DataEnvelope = z.infer<typeof DataEnvelope>;

export const makeId = () => Math.random().toString(36).slice(2);

export const now = () => Date.now();

// Control messages
export const EndSession = z.object({
  type: z.literal("end_session"),
  sessionId: z.string(),
  peerId: z.string(),
});
export type EndSession = z.infer<typeof EndSession>;

// Utils
export { WsQueue } from './wsQueue';
export { PendingRelay } from './pendingRelay';
