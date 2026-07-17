import { Router, Request, Response } from "express";
import authMiddleware, { AuthRequest } from "../../middleware/auth";
import axios from "axios";

const treatment_recommender_router = Router();

treatment_recommender_router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
    const { disease } = req.body;

    if (!disease) {
        res.status(400).json({ error: "disease is required" });
        return;
    }

    try {
        const ai_response = await axios.post(`${process.env.FASTAPI_URL}/treatment/`, {
            disease
        });
        res.json(ai_response.data);

    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            res.status(error.response.status).json({
                error: error.response.data?.detail || "Failed to process treatment recommendation request"
            });
            return;
        }

        console.error("treatment recommender error", error);
        res.status(500).json({ error: "Failed to process" });
    }
});

export default treatment_recommender_router;