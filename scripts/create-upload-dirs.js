const fs = require("fs")
const path = require("path")

// Define the directories to create
const directories = [
  path.join(process.cwd(), "public", "uploads"),
  path.join(process.cwd(), "public", "uploads", "thumbnails"),
]

// Create each directory if it doesn't exist
directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`)
    fs.mkdirSync(dir, { recursive: true })
  } else {
    console.log(`Directory already exists: ${dir}`)
  }
})

console.log("Upload directories created successfully!")
