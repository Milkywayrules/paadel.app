import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { serverEnv } from "@paadel/env/server";

let client: S3Client | null = null;

const TRAILING_SLASH = /\/?$/;

function getR2Client(): S3Client {
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

export async function r2SmokeCheck(): Promise<{ key: string }> {
  const prefix = serverEnv.R2_PREFIX.replace(TRAILING_SLASH, "/");
  const key = `${prefix}.smoke/${Date.now()}.txt`;
  const r2 = getR2Client();

  await r2.send(
    new PutObjectCommand({
      Body: "paadel-r2-smoke",
      Bucket: serverEnv.R2_BUCKET_NAME,
      ContentType: "text/plain",
      Key: key,
    })
  );

  await r2.send(
    new HeadObjectCommand({
      Bucket: serverEnv.R2_BUCKET_NAME,
      Key: key,
    })
  );

  return { key };
}
