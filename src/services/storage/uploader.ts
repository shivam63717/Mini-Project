
/**
 * Pluggable uploader: local, S3, Cloudinary
 */
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v2 as cloudinary } from 'cloudinary';

export type StorageDriver = 'local' | 's3' | 'cloudinary';

interface UploadResult {
  url: string;
  key?: string;
  provider: StorageDriver;
  size?: number;
  meta?: Record<string, unknown>;
}

const s3 = process.env.S3_BUCKET
  ? new S3Client({
      region: process.env.S3_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
          }
        : undefined
    })
  : null;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api