import { Router, Response } from "express";
import authMiddleware, { AuthRequest } from "../../middleware/auth";
import axios from "axios";
import multer from "multer"; //handles the incoming multipart/form-data upload from the client 
import FormData from "form-data";

const disease_classifier_router = Router();

// Store the uploaded file in memory (as a Buffer) rather than on disk —
// we're just relaying it straight to FastAPI, not persisting it locally.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max 
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
            return;
        }
        cb(null, true);
    },
});

disease_classifier_router.post(
    "/",
    authMiddleware,
    upload.single("image"),
    async (req: AuthRequest, res: Response) => {
        if (!req.file) {
            res.status(400).json({ error: "image file is required" });
            return;
        }

        try {
            // Rebuild a multipart/form-data payload to forward to FastAPI,
            // since the file only exists in memory as a Buffer at this point.
            const formData = new FormData();
            formData.append("file", req.file.buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            });

            const ai_response = await axios.post(
                `${process.env.FASTAPI_URL}/disease/`,
                formData,
                {
                    headers: formData.getHeaders(),
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity,
                }
            );

            res.json(ai_response.data);

        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                res.status(error.response.status).json({
                    error: error.response.data?.detail || "Failed to classify disease from image"
                });
                return;
            }

            console.error("disease classifier error", error);
            res.status(500).json({ error: "Failed to process" });
        }
    }
);

// Handle multer-specific errors (file too large, wrong type, etc.)

disease_classifier_router.use((error: any, req: AuthRequest, res: Response, next: any) => {
    if (error instanceof multer.MulterError) {
        res.status(400).json({ error: error.message });
        return;
    }
    if (error) {
        res.status(400).json({ error: error.message || "Invalid upload" });
        return;
    }
    next();
});

export default disease_classifier_router;

//cb stands for callback — it's a function you call to 
// tell multer "I'm done deciding, here's the result,
// " since multer's fileFilter runs asynchronously-style
//  (even though it's not using async/await here).