const Image = require("@11ty/eleventy-img")
const { S3Client, PutObjectCommand, DeleteObjectsCommand, paginateListObjectsV2 } = require("@aws-sdk/client-s3")
const sharp = require("sharp")
const dotenv = require("dotenv")
const fs = require("fs")
const path = require("path")

dotenv.config({ path: "../.env" })

const INPUT_DIR = "../images"
const OUTPUT_DIR = "images_optimized"
const IMAGE_MANIFEST = {}
const IMAGE_BASE_URL = "https://s3.dalen.ch/"

const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
})

const BUCKET = "dalen"

async function getAllKeysInR2() {
    const allKeys = []

    const paginator = paginateListObjectsV2(
        { client, pageSize: 1000 },
        { Bucket: BUCKET }
    )
    for await (const page of paginator) {
        const keys = page.Contents?.map((item) => item.Key) || []
        allKeys.push(...keys)
    }
    return allKeys
}

async function uploadToR2(filePath, key) {
    const fileContent = fs.readFileSync(filePath)
    await client.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileContent,
    }))
    console.log(`Uploaded ${key} to R2`)
}

async function uploadOptimizedImagesToR2(allKeysInR2) {
    const optimizedDir = path.join(__dirname, OUTPUT_DIR)
    if (!fs.existsSync(optimizedDir)) return
    for (const file of fs.readdirSync(optimizedDir)) {
        const key = file

        // check if processed image already exists in R2 before uploading - there may have been a change in settings, hence the second check for individual files and not just root files
        if (allKeysInR2.includes(key)) {
            console.log(`Skipping ${key} as it already exists in R2`)
            continue
        }
        await uploadToR2(path.join(optimizedDir, file), key)
    }
}

function computeExpectedKeys(processingSettings) {
    const expectedKeys = new Set()
    for (const imageSet of processingSettings) {
        const imagePath = path.join(INPUT_DIR, imageSet.relativePath)
        if (!fs.existsSync(imagePath)) continue
        const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".tiff"])
        for (const file of fs.readdirSync(imagePath).filter(f => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))) {
            const baseName = path.parse(file).name
            for (const format of imageSet.formats) {
                for (const w of imageSet.widths) {
                    expectedKeys.add(`${baseName}-${w}w.${format}`)
                }
            }
            // placeholder
            expectedKeys.add(`${baseName}-20w.jpeg`)
        }
    }
    return expectedKeys
}

async function deleteStaleR2Keys(allKeysInR2, expectedKeys) {
    const keysToDelete = allKeysInR2.filter(key => !expectedKeys.has(key))
    if (keysToDelete.length === 0) {
        console.log("No stale images to delete from R2")
        return
    }
    console.log(`Deleting ${keysToDelete.length} stale image(s) from R2...`)
    for (let i = 0; i < keysToDelete.length; i += 1000) {
        const batch = keysToDelete.slice(i, i + 1000)
        await client.send(new DeleteObjectsCommand({
            Bucket: BUCKET,
            Delete: { Objects: batch.map(key => ({ Key: key })) }
        }))
        for (const key of batch) {
            console.log(`Deleted stale image from R2: ${key}`)
        }
    }
}

async function processImage(src, imageOptions) {

    await Image(src, {
        ...imageOptions,
        outputDir: OUTPUT_DIR,
        urlPath: OUTPUT_DIR,
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
        outputDir: OUTPUT_DIR,
        urlPath: OUTPUT_DIR,
        sharpJpegOptions: {
            quality: 40
        },
        filenameFormat(id, src, width, format) {
            const extension = path.extname(src)
            const name = path.basename(src, extension)
            return `${name}-${width}w.${format}`
        }
    })
    console.log(`Processed ${src}`)
}


async function processImageSet(imageSet, allKeysInR2) {
    const imagePath = path.join(INPUT_DIR, imageSet.relativePath)
    const imagesToBeProcessed = []
    IMAGE_MANIFEST[imageSet.prefix] = {}
    
    const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".tiff"])
    for (const file of fs.readdirSync(imagePath).filter(f => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))) {
        const baseName = path.parse(file).name
        const { width, height } = await sharp(path.join(imagePath, file)).metadata()
        IMAGE_MANIFEST[imageSet.prefix][baseName] = {
            "name": baseName,
            "alt": `${baseName} in Gallery: ${imageSet.prefix}`,
            "width": width,
            "height": height,
            "urls": {},
            "sizes": imageSet.sizes
        }

        for (const format of ["avif", "jpeg"]) {
            IMAGE_MANIFEST[imageSet.prefix][baseName].urls[format] = []
            for (const width of imageSet.widths) {    
                const processedFileName = `${baseName}-${width}w.${format}`

                IMAGE_MANIFEST[imageSet.prefix][baseName].urls[format].push(`${IMAGE_BASE_URL}${processedFileName} ${width}w`)

                if (allKeysInR2.includes(processedFileName)) {
                    console.log(`Skipping ${processedFileName} as it already exists in R2`)
                    continue
                } else {
                    if (!imagesToBeProcessed.includes(file)) imagesToBeProcessed.push(file)
                }
            }
        }
    }
    for (const file of imagesToBeProcessed) {
        await processImage(path.join(imagePath, file), {
            widths: imageSet.widths,
            formats: imageSet.formats,
            sharpAvifOptions: imageSet.sharpAvifOptions,
        })

    }
}

async function run() {
    const processingSettings = require("./processing-settings.json")

    const allKeysInR2 = await getAllKeysInR2()

    for (const imageSet of processingSettings) {
        await processImageSet(imageSet, allKeysInR2)
    }

    const expectedKeys = computeExpectedKeys(processingSettings)
    await deleteStaleR2Keys(allKeysInR2, expectedKeys)

    fs.writeFile("../src/_data/imageManifest.json", JSON.stringify(IMAGE_MANIFEST, null, 2), (err) => {
        if (err) {
            console.error("Error writing image manifest:", err)
        } else {
            console.log("Image manifest written successfully")
        }
    })

    await uploadOptimizedImagesToR2(allKeysInR2)
}

run()
