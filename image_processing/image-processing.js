const Image = require("@11ty/eleventy-img")
const { S3Client, HeadObjectCommand, PutObjectTaggingCommand } = require("@aws-sdk/client-s3")
const dotenv = require("dotenv")
const fs = require("fs")
const path = require("path")

dotenv.config()

const inputDir = "../images"
const outputDir = "images_optimized"

const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
})

const BUCKET = "dalen"

async function existsInR2(key) {
    try {
        await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }))
        return true
    } catch (err) {
        if (err.name === "NotFound") return false
        throw err
    }
}

function constructImageName(img) {
    return `${img.name}-${img.width}w.${img.format}`
}

async function uploadToR2(filePath, key) {
    const fileContent = fs.readFileSync(filePath)
    await client.send(new PutObjectTaggingCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileContent,
    }))
    console.log(`Uploaded ${key} to R2`)
}

async function processImage(file) {
    const src = path.join(inputDir, file)

    await Image(src, {
        widths: [400, 1200, 1600],
        formats: ["avif", "jpeg"],
        outputDir,
        urlPath: outputDir,
        sharpAvifOptions: {
            quality: 70
        },
        filenameFormat(id, src, width, format) {
            const extension = path.extname(src)
            const name = path.basename(src, extension)
            return `${name}-${width}w.${format}`
        }
    })

    // placeholder
    await Image(src, {
        widths: [20],
        formats: ["jpeg"],
        outputDir,
        urlPath: outputDir,
        sharpJpegOptions: {
            quality: 40
        },
        filenameFormat(id, src, width, format) {
            const extension = path.extname(src)
            const name = path.basename(src, extension)
            return `${name}-placeholder.${format}`
        }
    })
    console.log(`Processed ${file}`)
}

async function run() {
    const widths = [400, 1200, 1600]
    const files = fs.readdirSync(inputDir)

    for (const f of files) {

    }

    for (const f of files) {
        if (!f.match(/\.(jpg|jpeg|png)$/)) continue
        await processImage(f)
    }
}

// run()
