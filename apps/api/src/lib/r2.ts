import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { defaultR2PrefixForAppEnv } from "@paadel/env/features";
import { serverEnv } from "@paadel/env/server";

let client: S3Client | null = null;

const TRAILING_SLASH = /\/?$/;

function getR2Client(): S3Client | null {
  if (
    !(
      serverEnv.R2_ACCOUNT_ID &&
      serverEnv.R2_ACCESS_KEY_ID &&
      serverEnv.R2_SECRET_ACCESS_KEY
    )
  ) {
    return null;
  }

  client ??= new S3Client({
    credentials: {
      accessKeyId: serverEnv.R2_ACCESS_KEY_ID,
      secretAccessKey: serverEnv.R2_SECRET_ACCESS_KEY,
    },
    endpoint: `https://${serverEnv.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    region: "auto",
  });

  return client;
}

export async function r2SmokeCheck(): Promise<{
  ok: boolean;
  key?: string;
  reason?: string;
}> {
  const bucket = serverEnv.R2_BUCKET_NAME;
  const prefix =
    serverEnv.R2_PREFIX ?? defaultR2PrefixForAppEnv(serverEnv.APP_ENV);

  if (!bucket) {
    return { ok: false, reason: "R2_BUCKET_NAME not configured" };
  }

  const r2 = getR2Client();
  if (!r2) {
    return { ok: false, reason: "R2 credentials not configured" };
  }

  const key = `${prefix.replace(TRAILING_SLASH, "/")}.smoke/${Date.now()}.txt`;

  await r2.send(
    new PutObjectCommand({
      Body: "paadel-r2-smoke",
      Bucket: bucket,
      ContentType: "text/plain",
      Key: key,
    })
  );

  await r2.send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  return { key, ok: true };
}
