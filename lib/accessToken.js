import crypto from "crypto";

function secret() {
  const s = process.env.ADMIN_PASSWORD; // reuse an existing server-only secret; no new env var needed
  if (!s) throw new Error("ADMIN_PASSWORD is not set (also used to sign access tokens).");
  return s;
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}
function fromBase64url(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

// kind: 'paid' | 'free'. isBonus: whether this token grants the bonus item instead of the main item.
// watermark: text to stamp across the content (e.g. the buyer's email) — makes leaked copies traceable.
// ttlMinutes: how long the token itself is valid for (not the underlying file link, which is short-lived separately).
export function createAccessToken({ slug, kind, isBonus = false, watermark = "", ttlMinutes }) {
  const payload = {
    slug,
    kind,
    bonus: isBonus,
    watermark,
    exp: ttlMinutes ? Date.now() + ttlMinutes * 60 * 1000 : null // null = no expiry
  };
  const payloadStr = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret()).update(payloadStr).digest("base64url");
  return `${payloadStr}.${signature}`;
}

export function verifyAccessToken(token) {
  const [payloadStr, signature] = String(token).split(".");
  if (!payloadStr || !signature) return null;

  const expected = crypto.createHmac("sha256", secret()).update(payloadStr).digest("base64url");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  const payload = JSON.parse(fromBase64url(payloadStr));
  if (payload.exp && Date.now() > payload.exp) return null;
  return payload; // { slug, kind, bonus, exp }
}
