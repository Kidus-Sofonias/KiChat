const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testS3() {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: "test.txt",
      Body: "Hello, this is a test file.",
      ContentType: "text/plain",
    };

    const command = new PutObjectCommand(params);
    const data = await s3Client.send(command);
    console.log("Test file uploaded successfully:", data);
    console.log(
      `File URL: https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/test.txt`
    );
  } catch (error) {
    console.error("S3 Test Upload Error:", error.message);
  }
}

testS3();
