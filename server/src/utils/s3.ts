import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export const deleteFromS3 = async (fileUrlOrKey: string) => {
  try {
    if (!fileUrlOrKey) return;

    let key = fileUrlOrKey;

    // If it's a full URL, extract the key
    if (fileUrlOrKey.startsWith("http")) {
      const urlFn = new URL(fileUrlOrKey);
      // Pathname includes the leading slash, so we remove it
      key = urlFn.pathname.substring(1);
      // Handle cases where the key might be URL encoded
      key = decodeURIComponent(key);
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: key,
    });

    await s3.send(command);
    console.log(`Successfully deleted ${key} from S3`);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
  }
};
