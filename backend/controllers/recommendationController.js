import Job from "../models/Job.js";
import User from "../models/User.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ─────────────────────────────────────────────────────
// 📌 USER: Get AI-powered job recommendations
// GET /api/recommendations
// ─────────────────────────────────────────────────────
export const getRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Get user profile
        const user = await User.findById(userId).select(
            "name skills experience location jobType preferredLocation openToRemote degree branch"
        );

        if (!user || !user.skills || user.skills.length === 0) {
            return res.status(200).json({
                recommendations: [],
                message: "Please add skills to your profile to get recommendations.",
            });
        }

        // 2. Get all jobs (limit to recent 50 for performance)
        const jobs = await Job.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .select("title company location type experience salary skills description")
            .lean();

        if (jobs.length === 0) {
            return res.status(200).json({
                recommendations: [],
                message: "No jobs available at the moment.",
            });
        }

        // 3. Build prompt for Gemini
        const userProfile = {
            skills: user.skills,
            experience: user.experience || "fresher",
            preferredLocation: user.preferredLocation || user.location || "any",
            jobType: user.jobType || "any",
            degree: user.degree || "",
            branch: user.branch || "",
            openToRemote: user.openToRemote,
        };

        const jobList = jobs.map((j, i) => ({
            index: i,
            id: j._id.toString(),
            title: j.title,
            company: j.company,
            location: j.location,
            type: j.type,
            experience: j.experience || "Not specified",
            skills: j.skills,
            salary: j.salary || "Not disclosed",
        }));

        const prompt = `You are a job recommendation engine for a placement platform.

Given this student profile:
${JSON.stringify(userProfile)}

And these available jobs:
${JSON.stringify(jobList)}

Recommend the TOP 5 best matching jobs for this student. For each recommendation, provide:
- "jobIndex": the index number from the job list
- "matchScore": a percentage (0-100) showing how well the job matches
- "reason": a brief 1-2 sentence explanation of why this job is a good match

Return ONLY a JSON array in this exact format (no markdown, no explanation):
[{"jobIndex": 0, "matchScore": 95, "reason": "Strong skill match in React and Node.js with matching location preference."}]

Rules:
- Match based on skills overlap, location preference, experience level, and job type
- Give higher scores for more skill matches
- Consider remote preference
- Return at most 5 results, sorted by matchScore descending`;

        // 4. Call Gemini API
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: "AI API key not configured" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // 5. Parse AI response
        let recommendations = [];
        try {
            // Extract JSON from response (handle markdown wrapping)
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                recommendations = JSON.parse(jsonMatch[0]);
            }
        } catch (parseErr) {
            console.error("Failed to parse AI response:", parseErr.message);
            return res.status(200).json({
                recommendations: [],
                message: "AI couldn't generate recommendations right now.",
            });
        }

        // 6. Map AI results back to full job data
        const enrichedRecommendations = recommendations
            .filter((r) => r.jobIndex >= 0 && r.jobIndex < jobs.length)
            .slice(0, 5)
            .map((r) => ({
                job: jobs[r.jobIndex],
                matchScore: r.matchScore,
                reason: r.reason,
            }));

        res.json({ recommendations: enrichedRecommendations });
    } catch (err) {
        console.error("Recommendation error:", err.message);
        res.status(500).json({ message: "Failed to get recommendations" });
    }
};
