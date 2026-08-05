# Optional CDN publishing

Publishing is for reports the user explicitly wants to share by URL. Local rendering works without this setup.

## Environment

The scripts use S3-compatible storage such as Cloudflare R2 and only Node built-ins.

| Variable | Purpose | Secret |
|---|---|---|
| `R2_ENDPOINT` | S3 API endpoint | No |
| `R2_BUCKET` | Bucket name | No |
| `R2_PUBLIC_URL` | Public base URL for the bucket | No |
| `R2_ACCESS_KEY_ID` | S3 access key | Yes |
| `R2_SECRET_ACCESS_KEY` | S3 secret | Yes |
| `R2_REGION` | Signing region; defaults to `auto` | No |

Keep credentials in the agent or shell environment, never in the report or repository.

## Optional report settings

The source may contain non-secret target overrides:

```jsonc
"publish": {
  "endpoint": "https://account.r2.cloudflarestorage.com",
  "bucket": "artifacts",
  "publicBase": "https://cdn.example.com",
  "region": "auto",
  "keyPrefix": "reports"
}
```

Environment values supply any omitted target. Credentials always come from the environment. The `publish` block is removed from embedded report data.

## Publish a report and its media

Relative paths in `userflows` and `before-after` `image` fields and `recording` `video` or `poster` fields are resolved from the source JSON directory.

```bash
node scripts/publish.mjs /path/to/report.json /path/to/report.html --key launch-readiness
```

The script:

1. validates the source;
2. uploads relative media under `reports/launch-readiness/assets/`;
3. rewrites a cloned source to public URLs;
4. renders and uploads the HTML last;
5. checks every uploaded URL returns `200`;
6. prints the public report URL.

If configuration, credentials, a media file, upload, or verification is missing, it exits non-zero. It does not silently pretend the report is shareable.

## Upload or verify one artifact

```bash
node scripts/upload-artifact.mjs /path/to/file --key reports/name/file
node scripts/upload-artifact.mjs --verify https://cdn.example.com/reports/name/file
```
