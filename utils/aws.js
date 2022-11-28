const aws = require('aws-sdk');
const fs = require('fs');

const spacesEndpoint = new aws.Endpoint('fra1.digitaloceanspaces.com');
const s3 = new aws.S3({
    accessKeyId: "DO0022PT2CUN8JQYC6WF",
    secretAccessKey: "bF7R57Z0WddakVmdjrGowIFgR6pKdcF6S8B7bxm4iHU",
    endpoint: spacesEndpoint
});

const uploadFileToS3 = async (file, path) => {
    const blob = await fs.readFileSync(file.path);
    const uploadedFile = await s3.upload({
        Bucket: "bvm-marketplace",
        Key: path + "/" + file.filename,
        Body: blob,
        ACL: 'public-read'
    }).promise();
    console.log(uploadedFile);
    return uploadedFile.key;
}

module.exports = {
    uploadFileToS3,
};
