import { GoogleGenerativeAI } from "@google/generative-ai";

const STORAGE_KEY = "gemini_api_key";
const MODEL_KEY = "gemini_preferred_model";

// ─── Model fallback chain (ordered by speed/cost then reliability) ───
const MODEL_CHAIN = [
    "gemini-2.5-flash",        // Best balance of speed/reliability
    "gemini-2.5-flash-8b",     // Fastest/cheapest
    "gemini-2.5-pro",          // Most capable
    "gemini-2.5-flash",        // Latest experimental
    "gemini-pro",              // Legacy fallback
    "gemini-2.5-pro",          // Legacy fallback 2
];

// ─── API Key Management ───
export const getApiKey = () => localStorage.getItem(STORAGE_KEY);
export const setApiKey = (key) => {
    localStorage.setItem(STORAGE_KEY, key);
    localStorage.removeItem(MODEL_KEY); // reset model on new key
};
export const removeApiKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MODEL_KEY);
};
export const hasApiKey = () => !!localStorage.getItem(STORAGE_KEY);

// ─── Get Gemini Model for a specific model name ───
const getModel = (modelName) => {
    const key = getApiKey();
    if (!key) throw new Error("Gemini API key not set");
    const genAI = new GoogleGenerativeAI(key);
    return genAI.getGenerativeModel({ model: modelName });
};

// ─── Get the preferred model (or first in chain) ───
const getPreferredModel = () => {
    const stored = localStorage.getItem(MODEL_KEY);
    return MODEL_CHAIN.includes(stored) ? stored : MODEL_CHAIN[0];
};

// ─── Parse JSON from AI response ───
const parseJSON = (text) => {
    // Try direct parse first
    try {
        return JSON.parse(text);
    } catch (_) {
        // empty
    }
    // Extract from markdown code block
    const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (match) {
        return JSON.parse(match[1].trim());
    }
    // Try to find JSON object/array
    const objMatch = text.match(/(\{[\s\S]*\})/);
    if (objMatch) {
        return JSON.parse(objMatch[1]);
    }
    throw new Error("Could not parse AI response as JSON");
};

// ─── Sleep utility ───
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Extract retry delay from error message ───
const extractRetryDelay = (errorMsg) => {
    // Try to find "retryDelay":"43s" or "retry in 43.837s" patterns
    const match = errorMsg.match(/retry(?:Delay)?["\s:]+(\d+(?:\.\d+)?)\s*s/i);
    if (match) return Math.ceil(parseFloat(match[1])) * 1000;
    return null;
};

// ─── Try a single model once ───
const tryModel = async (modelName, prompt) => {
    const model = getModel(modelName);
    const result = await model.generateContent(prompt);
    return result.response.text();
};

// ─── Generic AI call with retry + model fallback ───
export const askAI = async (prompt, jsonMode = false) => {
    let lastError = null;
    let allRateLimited = true;
    let anyAvailable = false;
    let retryDelayMs = 0;

    // ── Pass 1: Try all models quickly ──
    for (const modelName of MODEL_CHAIN) {
        try {
            console.log(`[AI] Trying ${modelName}...`);
            const text = await tryModel(modelName, prompt);

            // Success — remember this model
            console.log(`[AI] Success with ${modelName}`);
            localStorage.setItem(MODEL_KEY, modelName);
            if (jsonMode) return parseJSON(text);
            return text;
        } catch (err) {
            lastError = err;
            const msg = (err.message || "").toLowerCase();

            // Model not found (404) → skip to next
            if (msg.includes("404") || msg.includes("not found") || msg.includes("not_found")) {
                console.warn(`[AI] ${modelName} not available (404), skipping...`);
                continue;
            }

            // Rate limit (429) → note delay, try next model immediately
            if (msg.includes("429") || msg.includes("quota") || msg.includes("rate") || msg.includes("exhausted")) {
                anyAvailable = true; // Model exists but hit quota
                console.warn(`[AI] ${modelName} rate-limited (429), trying next...`);
                const delay = extractRetryDelay(err.message || "");
                if (delay && delay > retryDelayMs) retryDelayMs = delay;
                continue;
            }

            // Other errors (e.g. 401, 500)
            anyAvailable = true;
            allRateLimited = false;
            console.error(`[AI] ${modelName} error:`, err.message);
        }
    }

    // ── Pass 2: If rate-limited, wait for retry delay and try again ──
    if (allRateLimited && retryDelayMs > 0) {
        const waitSec = Math.ceil(retryDelayMs / 1000);
        console.log(`[AI] All models rate-limited. Waiting ${waitSec}s before retrying...`);
        await sleep(Math.min(retryDelayMs + 2000, 65000));

        for (const modelName of MODEL_CHAIN) {
            try {
                console.log(`[AI] Retry: Trying ${modelName}...`);
                const text = await tryModel(modelName, prompt);
                console.log(`[AI] Retry Success with ${modelName}`);
                localStorage.setItem(MODEL_KEY, modelName);
                if (jsonMode) return parseJSON(text);
                return text;
            } catch (err) {
                lastError = err;
                const msg = (err.message || "").toLowerCase();
                if (msg.includes("404") || msg.includes("not found")) continue;
                if (msg.includes("429") || msg.includes("quota") || msg.includes("rate") || msg.includes("exhausted")) {
                    console.warn(`[AI] Retry: ${modelName} still rate-limited`);
                    continue;
                }
                allRateLimited = false;
            }
        }
    }

    // ── Final error ──
    if (!anyAvailable) {
        throw new Error(
            "AI Service Error: None of the models were available (All returned 404). " +
            "Please check if your API key belongs to a project with Gemini enabled."
        );
    }

    if (allRateLimited) {
        throw new Error(
            "API quota exhausted on all models. Please wait a minute and try again, " +
            "or create a NEW API key at aistudio.google.com/apikey"
        );
    }
    throw lastError || new Error("AI request failed. Please try again.");
};

// ─── Start a multi-turn chat ───
export const createChat = (systemPrompt) => {
    // Try to get the preferred model, default to the first in the chain
    let modelName = getPreferredModel();
    const key = getApiKey();
    if (!key) throw new Error("Gemini API key not set");

    const genAI = new GoogleGenerativeAI(key);

    const isLegacy = modelName.includes("gemini-pro") || modelName.includes("1.0");

    // Attempt to create chat with selected model
    // 1.5 and 2.0 models support systemInstruction natively.
    // Legacy models (1.0) need the system prompt hacked into the history.
    const modelConfig = { model: modelName };
    if (!isLegacy) {
        modelConfig.systemInstruction = systemPrompt;
    }

    const model = genAI.getGenerativeModel(modelConfig);

    const initialHistory = isLegacy ? [
        { role: "user", parts: [{ text: systemPrompt }] },
        {
            role: "model",
            parts: [
                { text: "Understood! I'm HireSmart AI, your career assistant. How can I help you today?" },
            ],
        },
    ] : [];

    const chat = model.startChat({ history: initialHistory });

    // We attach our own custom property so we know which model this chat is using
    chat._currentModelName = modelName;
    chat._systemPrompt = systemPrompt;

    return chat;
};

// ─── Send message in existing chat ───
export const sendChatMessage = async (chat, message) => {
    let currentChat = chat;
    let fallbackIndex = MODEL_CHAIN.indexOf(chat._currentModelName) || 0;

    // Try sending message, if fails with 404/400, we recursively retry with next model
    const trySend = async (chatInstance, modelIndex) => {
        try {
            const result = await chatInstance.sendMessage(message);
            // Save successful model
            localStorage.setItem(MODEL_KEY, MODEL_CHAIN[modelIndex]);
            return result.response.text();
        } catch (err) {
            const errCode = (err.message || "").toLowerCase();
            const isModelError = errCode.includes("404") || errCode.includes("not found") || errCode.includes("400") || errCode.includes("data: required oneof field") || errCode.includes("model not found");
            const isRateLimit = errCode.includes("429") || errCode.includes("quota") || errCode.includes("rate") || errCode.includes("exhausted");

            if (isModelError || isRateLimit) {
                console.warn(`[AI Chat] Model ${MODEL_CHAIN[modelIndex]} failed (ModelError: ${isModelError}, RateLimit: ${isRateLimit}), attempting fallback...`);
                // Move to next model
                const nextIndex = modelIndex + 1;
                if (nextIndex < MODEL_CHAIN.length) {
                    const nextModel = MODEL_CHAIN[nextIndex];
                    console.log(`[AI Chat] Fallback to model: ${nextModel}`);
                    const key = getApiKey();
                    const genAI = new GoogleGenerativeAI(key);

                    const isLegacy = nextModel.includes("gemini-pro") || nextModel.includes("1.0");
                    const modelConfig = { model: nextModel };
                    if (!isLegacy && chat._systemPrompt) {
                        modelConfig.systemInstruction = chat._systemPrompt;
                    }

                    const model = genAI.getGenerativeModel(modelConfig);

                    const initialHistory = isLegacy && chat._systemPrompt ? [
                        { role: "user", parts: [{ text: chat._systemPrompt }] },
                        {
                            role: "model",
                            parts: [
                                { text: "Understood! I'm HireSmart AI, your career assistant. How can I help you today?" },
                            ],
                        },
                    ] : [];

                    const newChat = model.startChat({ history: initialHistory });
                    newChat._currentModelName = nextModel;
                    newChat._systemPrompt = chat._systemPrompt;
                    return trySend(newChat, nextIndex);
                } else {
                    localStorage.removeItem(MODEL_KEY);
                    throw new Error("None of the available AI models are supported by your API key or all returned an error. Please create a new key at aistudio.google.com");
                }
            }

            throw err;
        }
    };

    return trySend(currentChat, fallbackIndex);
};

// ══════════════════════════════════════════════════
// ✨ FEATURE 1: ATS Resume Score
// ══════════════════════════════════════════════════
export const analyzeATS = async (userProfile) => {
    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer for tech industry jobs.
Analyze this candidate profile thoroughly and return a detailed JSON assessment.

Candidate Profile:
- Name: ${userProfile.name || "N/A"}
- Education: ${userProfile.college || "N/A"}, ${userProfile.degree || "N/A"} in ${userProfile.branch || "N/A"}
- CGPA: ${userProfile.cgpa || "N/A"}
- Graduation Year: ${userProfile.graduationYear || "N/A"}
- Skills: ${userProfile.skills?.join(", ") || "None listed"}
- Experience: ${userProfile.experience || "Fresher"}
- Languages: ${userProfile.languages?.join(", ") || "N/A"}
- Certifications: ${userProfile.certifications?.join(", ") || "None"}
- Achievements: ${userProfile.achievements?.join(", ") || "None"}
- LinkedIn: ${userProfile.linkedin ? "Yes" : "No"}
- GitHub: ${userProfile.github ? "Yes" : "No"}
- Portfolio: ${userProfile.portfolio ? "Yes" : "No"}
- Resume: ${userProfile.resumeUrl ? "Uploaded" : "Not uploaded"}
- Bio: ${userProfile.bio || "Not provided"}
- Location: ${userProfile.location || "N/A"}
- Preferred Job Type: ${userProfile.jobType || "N/A"}

Return ONLY valid JSON (no markdown, no explanation):
{
  "overallScore": <number 0-100>,
  "sections": {
    "skills": { "score": <0-100>, "feedback": "<specific feedback>" },
    "education": { "score": <0-100>, "feedback": "<specific feedback>" },
    "experience": { "score": <0-100>, "feedback": "<specific feedback>" },
    "onlinePresence": { "score": <0-100>, "feedback": "<specific feedback>" },
    "profileCompleteness": { "score": <0-100>, "feedback": "<specific feedback>" }
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "suggestions": ["<actionable suggestion 1>", "<actionable suggestion 2>", "<actionable suggestion 3>", "<actionable suggestion 4>", "<actionable suggestion 5>"],
  "industryReadiness": "<Junior / Mid / Senior>",
  "topRoles": ["<best fit role 1>", "<best fit role 2>", "<best fit role 3>"]
}`;

    return await askAI(prompt, true);
};

// ══════════════════════════════════════════════════
// ✨ FEATURE 2: Skill Match Score
// ══════════════════════════════════════════════════
export const analyzeSkillMatch = async (userProfile, job) => {
    const prompt = `You are a recruitment skill-matching AI. Compare this candidate with the job requirements.

Candidate Profile:
- Skills: ${userProfile.skills?.join(", ") || "None"}
- Experience: ${userProfile.experience || "Fresher"}
- Education: ${userProfile.degree || "N/A"} in ${userProfile.branch || "N/A"}
- CGPA: ${userProfile.cgpa || "N/A"}

Job Details:
- Title: ${job.title}
- Company: ${job.company}
- Required Skills: ${job.skills?.join(", ") || "Not specified"}
- Experience Required: ${job.experience || "Not specified"}
- Description: ${job.description || "N/A"}
- Eligibility: ${job.eligibility || "N/A"}

Return ONLY valid JSON (no markdown, no explanation):
{
  "matchScore": <number 0-100>,
  "matchedSkills": ["<skill1>", "<skill2>"],
  "missingSkills": ["<skill1>", "<skill2>"],  
  "partialMatch": ["<e.g. JavaScript → TypeScript (easy transition)>"],
  "learningPlan": [
    { "skill": "<missing skill>", "timeToLearn": "<e.g. 2 weeks>", "resource": "<recommended resource>" }
  ],
  "overallFit": "<Strong Match / Moderate Match / Weak Match>",
  "recommendation": "<1-2 sentence personalized advice>"
}`;

    return await askAI(prompt, true);
};

// ══════════════════════════════════════════════════
// ✨ FEATURE 4: Mock Interview
// ══════════════════════════════════════════════════
export const generateInterviewQuestions = async (
    role,
    skills,
    difficulty = "Medium",
    count = 5
) => {
    const prompt = `Generate ${count} technical interview questions for a ${role} position.
The candidate knows: ${skills.join(", ")}
Difficulty: ${difficulty}

Return ONLY valid JSON:
{
  "questions": [
    { "question": "<question text>", "topic": "<skill/topic>", "difficulty": "${difficulty}", "expectedPoints": ["<key point 1>", "<key point 2>", "<key point 3>"] }
  ]
}`;

    return await askAI(prompt, true);
};

export const evaluateAnswer = async (question, expectedPoints, answer) => {
    const prompt = `You are a technical interviewer. Evaluate this answer.

Question: ${question}
Expected Key Points: ${expectedPoints.join(", ")}
Candidate's Answer: ${answer}

Return ONLY valid JSON:
{
  "score": <number 1-10>,
  "strengths": ["<what was good>"],
  "weaknesses": ["<what was missing or wrong>"],
  "idealAnswer": "<a concise ideal answer in 3-4 sentences>",
  "tip": "<one actionable improvement tip>"
}`;

    return await askAI(prompt, true);
};

// ══════════════════════════════════════════════════
// ✨ FEATURE 5: Career Roadmap
// ══════════════════════════════════════════════════
export const generateCareerRoadmap = async (userProfile, targetRole) => {
    const prompt = `Create a personalized 8-week career roadmap for this candidate.

Current Skills: ${userProfile.skills?.join(", ") || "None"}
Target Role: ${targetRole}
Experience Level: ${userProfile.experience || "Fresher"}
Education: ${userProfile.degree || "N/A"} in ${userProfile.branch || "N/A"}

Return ONLY valid JSON:
{
  "roadmap": [
    { "week": 1, "title": "<week title>", "tasks": ["<task 1>", "<task 2>", "<task 3>"], "resources": ["<resource 1>", "<resource 2>"] }
  ],
  "estimatedReadiness": "<e.g. 80% job-ready after completing>",
  "focusAreas": ["<area 1>", "<area 2>", "<area 3>"]
}`;

    return await askAI(prompt, true);
};

// ══════════════════════════════════════════════════
// ✨ FEATURE 6: AI Candidate Ranking (Recruiter)
// ══════════════════════════════════════════════════
export const rankCandidates = async (job, candidates) => {
    const candidateList = candidates
        .map(
            (c, i) =>
                `${i + 1}. Name: ${c.user?.name || "N/A"}, Skills: ${c.user?.skills?.join(", ") || "None"}, Experience: ${c.user?.experience || "Fresher"}, Education: ${c.user?.college || "N/A"} - ${c.user?.degree || "N/A"}, CGPA: ${c.user?.cgpa || "N/A"}`
        )
        .join("\n");

    const prompt = `You are a recruiting AI. Rank these candidates for the following job.

Job: ${job.title} at ${job.company}
Required Skills: ${job.skills?.join(", ") || "N/A"}
Experience Required: ${job.experience || "N/A"}
Description: ${job.description || "N/A"}

Candidates:
${candidateList}

Return ONLY valid JSON:
{
  "rankings": [
    {
      "candidateIndex": <1-based index>,
      "aiScore": <0-100>,
      "matchedSkills": ["<skill>"],
      "missingSkills": ["<skill>"],
      "strengths": "<brief strength>",
      "concerns": "<brief concern>",
      "recommendation": "<Strong Hire / Hire / Maybe / No Hire>"
    }
  ],
  "topPick": <1-based index of best candidate>,
  "summary": "<1-2 sentence summary>"
}`;

    return await askAI(prompt, true);
};
