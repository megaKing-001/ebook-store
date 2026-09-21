import crypto from "crypto";

function secret() {
  const s = process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD is not set (also used to sign access tokens).");
  return s;
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}
function fromBase64url(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function createAccessToken({ slug, kind, isBonus = false, moduleId = null, watermark = "", ttlMinutes }) {
  const payload = {
    slug,
    kind,
    bonus: isBonus,
    moduleId,
    watermark,
    exp: ttlMinutes ? Date.now() + ttlMinutes * 60 * 1000 : null
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
  return payload;
}
