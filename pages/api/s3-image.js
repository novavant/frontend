// pages/api/s3-image.js
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.NEXT_PUBLIC_R2_ACCOUNT_ID;
const R2_ACCESS_KEY = process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.NEXT_PUBLIC_R2_BUCKET_NAME;

// Validate configuration
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY || !R2_SECRET_KEY || !R2_BUCKET) {
  console.warn('R2 config missing. Check NEXT_PUBLIC_R2_* env vars.');
}

// Cloudflare R2 Client
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

export default async function handler(req, res) {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ error: 'Missing key parameter' });
  }

  // Normalize object key
  let objectKey = String(key);

  try {
    objectKey = decodeURIComponent(objectKey);
  } catch (e) {
    // ignore decode errors
  }

  // Remove URL scheme and host if present
  objectKey = objectKey.replace(/^https?:\/\/[^/]+\//i, '');

  // Remove query string and fragments
  objectKey = objectKey.split(/[?#]/, 1)[0];

  // Trim leading slashes
  objectKey = objectKey.replace(/^\/+/, '');

  // Remove bucket name if included in path
  if (objectKey.startsWith(`${R2_BUCKET}/`)) {
    objectKey = objectKey.substring(R2_BUCKET.length + 1);
  }

  // Validate configuration
  const missing = [];
  if (!R2_ACCOUNT_ID) missing.push('NEXT_PUBLIC_R2_ACCOUNT_ID');
  if (!R2_ACCESS_KEY) missing.push('NEXT_PUBLIC_R2_ACCESS_KEY_ID');
  if (!R2_SECRET_KEY) missing.push('NEXT_PUBLIC_R2_SECRET_ACCESS_KEY');
  if (!R2_BUCKET) missing.push('NEXT_PUBLIC_R2_BUCKET_NAME');

  if (missing.length) {
    console.error('R2 config missing:', missing.join(', '));
    return res.status(500).json({
      error: `R2 configuration missing: ${missing.join(', ')}`
    });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: objectKey,
    });

    // Generate presigned URL (valid for 60 seconds)
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    // Optional: Redirect to signed URL
    const redirect = String(req.query.redirect || '').toLowerCase();
    if (redirect === '1' || redirect === 'true') {
      res.setHeader('Location', url);
      return res.status(302).end();
    }

    return res.status(200).json({ url });
  } catch (err) {
    console.error('R2 signed URL error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate signed URL'
    });
  }
}