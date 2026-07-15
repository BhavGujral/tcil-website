const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'minio',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});

const BUCKETS = {
    TENDERS: 'tcil-tenders',
    CAREERS: 'tcil-careers',
    MEDIA: 'tcil-media',
    REPORTS: 'tcil-reports',
    SERVICES: 'tcil-services',
    BANNERS: 'tcil-banners',
};

const initializeBuckets = async () => {
    try {
        for (const bucketName of Object.values(BUCKETS)) {
            const exists = await minioClient.bucketExists(bucketName);
            if (!exists) {
                await minioClient.makeBucket(bucketName, 'us-east-1');
                console.log(`✅ Created MinIO bucket: ${bucketName}`);
            } else {
                console.log(`✅ MinIO bucket exists: ${bucketName}`);
            }
        }

        const publicPolicy = (bucket) => JSON.stringify({
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Principal: { AWS: ['*'] },
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${bucket}/*`],
                },
            ],
        });

        await minioClient.setBucketPolicy(BUCKETS.MEDIA, publicPolicy(BUCKETS.MEDIA));
        await minioClient.setBucketPolicy(BUCKETS.BANNERS, publicPolicy(BUCKETS.BANNERS));
        await minioClient.setBucketPolicy(BUCKETS.SERVICES, publicPolicy(BUCKETS.SERVICES));

        console.log('✅ MinIO buckets initialized successfully');
    } catch (error) {
        console.error('❌ MinIO initialization error:', error);
    }
};

// Route through the Node backend proxy to eliminate signature mismatches
const getPresignedUrl = async (bucket, objectKey, expiry = 900) => {
    return `http://localhost:4000/api/media/stream-file?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(objectKey)}`;
};

const uploadFile = async (bucket, objectKey, fileBuffer, contentType) => {
    try {
        await minioClient.putObject(bucket, objectKey, fileBuffer, {
            'Content-Type': contentType,
        });
        return objectKey;
    } catch (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }
};

const deleteFile = async (bucket, objectKey) => {
    try {
        await minioClient.removeObject(bucket, objectKey);
        return true;
    } catch (error) {
        throw new Error(`Failed to delete file: ${error.message}`);
    }
};

module.exports = {
    minioClient,
    BUCKETS,
    initializeBuckets,
    getPresignedUrl,
    uploadFile,
    deleteFile,
};  