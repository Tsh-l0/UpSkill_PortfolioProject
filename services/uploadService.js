const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs").promises;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class UploadService {
  constructor() {
    this.isCloudinaryConfigured = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    this.uploadDir = path.join(process.cwd(), "uploads");
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, "avatars"), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, "projects"), {
        recursive: true,
      });
      await fs.mkdir(path.join(this.uploadDir, "temp"), { recursive: true });
    } catch (error) {
      console.error("Error creating upload directories:", error);
    }
  }

  // Multer configuration for memory storage
  getMulterConfig(options = {}) {
    const { fileFilter = this.defaultFileFilter, limits = this.defaultLimits } =
      options;

    return multer({
      storage: multer.memoryStorage(),
      fileFilter,
      limits,
    });
  }

  // Default file filter for images
  defaultFileFilter(req, file, cb) {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  }

  // Default file size limits
  get defaultLimits() {
    return {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 1,
    };
  }

  // Upload to Cloudinary
  async uploadToCloudinary(buffer, options = {}) {
    if (!this.isCloudinaryConfigured) {
      throw new Error("Cloudinary not configured");
    }

    const {
      folder = "upskill",
      transformation = [],
      resourceType = "image",
      format,
    } = options;

    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder,
        resource_type: resourceType,
        transformation,
      };

      if (format) uploadOptions.format = format;

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  // Upload avatar
  async uploadAvatar(buffer, userId) {
    try {
      if (this.isCloudinaryConfigured) {
        const result = await this.uploadToCloudinary(buffer, {
          folder: "upskill/avatars",
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto" },
            { format: "jpg" },
          ],
          public_id: `avatar_${userId}_${Date.now()}`,
        });

        return {
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
          cloudinary: true,
        };
      } else {
        // Local storage fallback
        const filename = `avatar_${userId}_${Date.now()}.jpg`;
        const filepath = path.join(this.uploadDir, "avatars", filename);

        await fs.writeFile(filepath, buffer);

        return {
          success: true,
          url: `/uploads/avatars/${filename}`,
          filepath,
          cloudinary: false,
        };
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      throw new Error("Failed to upload avatar");
    }
  }

  // Upload project images
  async uploadProjectImages(files, projectId) {
    try {
      const uploadPromises = files.map(async (file, index) => {
        if (this.isCloudinaryConfigured) {
          return await this.uploadToCloudinary(file.buffer, {
            folder: "upskill/projects",
            transformation: [
              { width: 800, height: 600, crop: "limit" },
              { quality: "auto" },
            ],
            public_id: `project_${projectId}_${index}_${Date.now()}`,
          });
        } else {
          // Local storage fallback
          const filename = `project_${projectId}_${index}_${Date.now()}.jpg`;
          const filepath = path.join(this.uploadDir, "projects", filename);

          await fs.writeFile(filepath, file.buffer);

          return {
            secure_url: `/uploads/projects/${filename}`,
            public_id: filename,
            filepath,
          };
        }
      });

      const results = await Promise.all(uploadPromises);

      return {
        success: true,
        images: results.map((result) => ({
          url: result.secure_url,
          publicId: result.public_id,
        })),
      };
    } catch (error) {
      console.error("Project images upload error:", error);
      throw new Error("Failed to upload project images");
    }
  }

  // Delete from Cloudinary
  async deleteFromCloudinary(publicId) {
    if (!this.isCloudinaryConfigured) {
      return { success: false, error: "Cloudinary not configured" };
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return { success: true, result };
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      return { success: false, error: error.message };
    }
  }

  // Delete local file
  async deleteLocalFile(filepath) {
    try {
      await fs.unlink(filepath);
      return { success: true };
    } catch (error) {
      console.error("Local file delete error:", error);
      return { success: false, error: error.message };
    }
  }

  // Generate image variants for responsive display
  async generateImageVariants(buffer, baseName) {
    if (!this.isCloudinaryConfigured) {
      // Local storage - just save original
      const filepath = path.join(this.uploadDir, "temp", `${baseName}.jpg`);
      await fs.writeFile(filepath, buffer);
      return {
        original: `/uploads/temp/${baseName}.jpg`,
        thumbnail: `/uploads/temp/${baseName}.jpg`,
        medium: `/uploads/temp/${baseName}.jpg`,
      };
    }

    // Cloudinary - generate multiple sizes
    const variants = {
      thumbnail: { width: 150, height: 150, crop: "fill" },
      medium: { width: 400, height: 300, crop: "limit" },
      large: { width: 800, height: 600, crop: "limit" },
    };

    const uploadPromises = Object.entries(variants).map(
      async ([size, transformation]) => {
        const result = await this.uploadToCloudinary(buffer, {
          folder: "upskill/variants",
          transformation: [transformation, { quality: "auto" }],
          public_id: `${baseName}_${size}`,
        });

        return [size, result.secure_url];
      }
    );

    const results = await Promise.all(uploadPromises);
    return Object.fromEntries(results);
  }

  // Validate file
  validateFile(file, options = {}) {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB
      allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
    } = options;

    const errors = [];

    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / 1024 / 1024}MB`);
    }

    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`File type must be one of: ${allowedTypes.join(", ")}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Get upload middleware
  getUploadMiddleware(fieldName, options = {}) {
    const upload = this.getMulterConfig(options);

    return (req, res, next) => {
      upload.single(fieldName)(req, res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
              return res.status(400).json({
                success: false,
                error: "File too large",
              });
            }
          }

          return res.status(400).json({
            success: false,
            error: err.message,
          });
        }

        next();
      });
    };
  }
}

module.exports = new UploadService();
