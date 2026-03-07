# 🤖 AI Features Implementation Plan
## Smart Internship & Placement Management System 2.0

---

## 📋 Executive Summary

This plan adds **7 AI-powered features** using the **Google Gemini API** (free tier).
All AI runs **client-side** (API key stored per-user in `localStorage`) — **no backend AI costs**.

**Current State:** Frontend has placeholder AI pages (`UserAI`, `UserAIChat`, `UserAIMockInterview`, `AIRanking`) with mock/hardcoded data.

**Goal:** Replace all mock data with real Gemini AI calls.

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────┐
│                   FRONTEND                        │
│                                                   │
│  User enters Gemini API Key → localStorage        │
│         ↓                                         │
│  AI Service Layer (src/services/aiService.js)     │
│         ↓                                         │
│  Google Gemini API (generativelanguage.googleapis) │
│         ↓                                         │
│  Results displayed in UI + cached in state        │
└──────────────────────────────────────────────────┘
```

**Why client-side?**
- No backend cost or API key management
- Each user brings their own free Gemini key
- Instant setup, no environment variable needed
- Free tier gives 60 requests/minute

---

## 🎯 Feature List (Priority Order)

| # | Feature | For | Priority | Difficulty |
|---|---------|-----|----------|------------|
| 1 | **ATS Resume Score** | User | 🔴 HIGH | Medium |
| 2 | **Skill Match Score** | User + Recruiter | 🔴 HIGH | Medium |
| 3 | **AI Chat Assistant** | User | 🟡 MEDIUM | Easy |
| 4 | **AI Mock Interview** | User | 🟡 MEDIUM | Medium |
| 5 | **AI Career Roadmap** | User | 🟢 LOW | Easy |
| 6 | **AI Candidate Ranking** | Recruiter | 🔴 HIGH | Hard |
| 7 | **Smart Job Recommendations** | User | 🟡 MEDIUM | Medium |

---

## 📦 Phase 0: Foundation (Do This First)

### 0.1 — Install Gemini SDK

```bash
cd frontend
npm install @google/generative-ai
```

### 0.2 — Create AI Service Layer

**File:** `frontend/src/services/aiService.js`

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const STORAGE_KEY = "gemini_api_key";

// Get/Set API key from localStorage
export const getApiKey = () => localStorage.getItem(STORAGE_KEY);
export const setApiKey = (key) => localStorage.setItem(STORAGE_KEY, key);
export const hasApiKey = () => !!localStorage.getItem(STORAGE_KEY);

// Create Gemini model instance
const getModel = () => {
  const key = getApiKey();
  if (!key) throw new Error("Gemini API key not set");
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

// Generic AI call with JSON response parsing
export const askAI = async (prompt, jsonMode = false) => {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  if (jsonMode) {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || 
                      text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : text);
  }
  return text;
};
```

### 0.3 — Create API Key Input Component

**File:** `frontend/src/components/common/GeminiKeyInput.jsx`

A reusable modal/card that prompts users to enter their Gemini API key.
Shows on any AI page if `hasApiKey()` returns false.

---

## ⭐ Feature 1: ATS Resume Score

### What It Does
Analyzes the user's profile (skills, education, experience, resume URL) and gives:
- **Overall ATS Score** (0-100)
- **Section-wise breakdown** (Skills, Education, Experience, Projects, Formatting)
- **Strengths & Weaknesses**
- **Specific improvement suggestions**

### Where It Shows
- **User Profile Page** → "Check ATS Score" button
- **UserAI Dashboard** → ATS Score card

### Implementation

**Prompt Template:**
```
You are an expert ATS (Applicant Tracking System) analyzer. 
Analyze this candidate profile and return a JSON response.

Profile:
- Name: {name}
- Education: {college}, {degree} in {branch}, CGPA: {cgpa}, Grad Year: {graduationYear}
- Skills: {skills}
- Experience: {experience}
- Certifications: {certifications}
- Achievements: {achievements}
- LinkedIn: {linkedin}
- GitHub: {github}
- Portfolio: {portfolio}
- Resume URL: {resumeUrl}

Return ONLY valid JSON:
{
  "overallScore": 0-100,
  "sections": {
    "skills": { "score": 0-100, "feedback": "..." },
    "education": { "score": 0-100, "feedback": "..." },
    "experience": { "score": 0-100, "feedback": "..." },
    "projects": { "score": 0-100, "feedback": "..." },
    "onlinePresence": { "score": 0-100, "feedback": "..." }
  },
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "suggestions": ["...", "...", "..."],
  "industryReadiness": "Junior / Mid / Senior",
  "topRoles": ["Role 1", "Role 2", "Role 3"]
}
```

### Files to Create/Modify
| File | Action |
|------|--------|
| `services/aiService.js` | Add `analyzeATS(userProfile)` function |
| `pages/user/MyProfile.jsx` | Add "Check ATS Score" button + results panel |
| `components/user/ATSScoreCard.jsx` | New — animated score display with breakdown |

---

## ⭐ Feature 2: Skill Match Score

### What It Does
Compares a user's skills with a job's required skills and gives:
- **Match Percentage** (0-100%)
- **Matched Skills** (green)
- **Missing Skills** (red)
- **Skill Gap Analysis** with learning suggestions
- **Estimated learning time** for missing skills

### Where It Shows
- **Job Details Page** → "Check Skill Match" section (auto-loads for logged-in users)
- **Job Card (UserJobs)** → Small match % badge
- **Recruiter: View Application** → Skill match between candidate & job

### Implementation

**Prompt Template:**
```
Compare this candidate's skills with this job's requirements.

Candidate Skills: {userSkills}
Candidate Experience: {experience}
Candidate Education: {degree} in {branch}

Job Title: {jobTitle}
Job Required Skills: {jobSkills}
Job Experience Required: {jobExperience}
Job Description: {jobDescription}

Return ONLY valid JSON:
{
  "matchScore": 0-100,
  "matchedSkills": ["React", "Node.js"],
  "missingSkills": ["TypeScript", "Docker"],
  "partialMatch": ["JavaScript → TypeScript (easy transition)"],
  "learningPlan": [
    { "skill": "TypeScript", "timeToLearn": "2 weeks", "resource": "Official TS docs" },
    { "skill": "Docker", "timeToLearn": "1 week", "resource": "Docker Getting Started" }
  ],
  "overallFit": "Strong Match / Moderate Match / Weak Match",
  "recommendation": "You're a strong candidate. Focus on learning TypeScript to stand out."
}
```

### Files to Create/Modify
| File | Action |
|------|--------|
| `services/aiService.js` | Add `analyzeSkillMatch(userProfile, job)` function |
| `pages/user/JobDetails.jsx` | Add skill match section below job details |
| `components/user/SkillMatchCard.jsx` | New — visual match display with progress bars |
| `pages/recruiter/ViewCandidate.jsx` | Add AI skill match for candidate vs job |

---

## ⭐ Feature 3: AI Chat Assistant (Real Gemini)

### What It Does
Replace the hardcoded mock response with a real Gemini chatbot that:
- Answers career questions
- Reviews resume text
- Generates cover letters
- Explains technical concepts
- Gives interview tips
- Has **context** of user's profile

### Current State
`UserAIChat.jsx` has a `sendMessage()` with `setTimeout` returning hardcoded text.

### Implementation
Replace `setTimeout` mock with actual Gemini call. Inject user profile as system context.

**System Prompt:**
```
You are HireSmart AI, a career assistant for students and freshers.
You help with: resume reviews, interview prep, career guidance, 
technical explanations, and job search strategies.

The user's profile:
- Name: {name}, Skills: {skills}, Experience: {experience}
- Education: {college}, {degree}
- Looking for: {jobType} roles

Be concise, actionable, and encouraging. Use bullet points.
```

### Files to Modify
| File | Action |
|------|--------|
| `pages/user/UserAIChat.jsx` | Replace mock with real Gemini streaming chat |
| `services/aiService.js` | Add `startChat(userProfile)` for multi-turn conversation |

---

## ⭐ Feature 4: AI Mock Interview (Real Gemini)

### What It Does
Replace hardcoded questions with AI-generated interview questions based on:
- The user's target role/skills
- Difficulty level (Easy / Medium / Hard)
- AI evaluates answers and gives detailed feedback

### Current State
`UserAIMockInterview.jsx` has 4 hardcoded questions and random scores.

### Implementation

**Question Generation Prompt:**
```
Generate {count} technical interview questions for a {role} position.
The candidate knows: {skills}
Difficulty: {difficulty}

Return ONLY valid JSON:
{
  "questions": [
    { "question": "...", "topic": "React", "difficulty": "Medium", "expectedPoints": ["...", "..."] }
  ]
}
```

**Answer Evaluation Prompt:**
```
Evaluate this interview answer.

Question: {question}
Expected Points: {expectedPoints}
Candidate's Answer: {answer}

Return ONLY valid JSON:
{
  "score": 0-10,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "idealAnswer": "...",
  "tips": "..."
}
```

### Files to Modify
| File | Action |
|------|--------|
| `pages/user/UserAIMockInterview.jsx` | Full rewrite with AI questions + evaluation |
| `services/aiService.js` | Add `generateQuestions()` and `evaluateAnswer()` |

---

## ⭐ Feature 5: AI Career Roadmap

### What It Does
Generate a personalized week-by-week career roadmap based on:
- Current skills vs target role
- Experience level
- Available learning time

### Current State
`UserAI.jsx` has `generateRoadmap()` with hardcoded 4-week plan.

### Implementation

**Prompt:**
```
Create a personalized 8-week career roadmap.

Current Skills: {skills}
Target Role: {targetRole}
Experience: {experience}
Education: {degree} in {branch}

Return ONLY valid JSON:
{
  "roadmap": [
    { "week": 1, "title": "...", "tasks": ["...", "..."], "resources": ["..."] }
  ],
  "estimatedReadiness": "75% job-ready after completing",
  "focusAreas": ["...", "..."]
}
```

### Files to Modify
| File | Action |
|------|--------|
| `pages/user/UserAI.jsx` | Replace mock roadmap with AI-generated one |

---

## ⭐ Feature 6: AI Candidate Ranking (Recruiter)

### What It Does
For a job posting, AI ranks all applicants by:
- **AI Score** (0-100) based on skill match, experience, education fit
- **Ranking explanation** for each candidate
- **Top recommendations** highlighted
- **Comparison matrix** between top candidates

### Current State
`AIRanking.jsx` uses mock data from Redux `candidates` slice.

### Implementation

**Prompt (batch — send all candidates for a job):**
```
You are a recruiting AI. Rank these candidates for the following job.

Job: {title} at {company}
Required Skills: {skills}
Experience Required: {experience}
Description: {description}

Candidates:
1. Name: {name}, Skills: {skills}, Experience: {exp}, Education: {edu}, CGPA: {cgpa}
2. ...

Return ONLY valid JSON:
{
  "rankings": [
    {
      "candidateIndex": 1,
      "aiScore": 0-100,
      "matchedSkills": ["..."],
      "missingSkills": ["..."],
      "strengths": "...",
      "concerns": "...",
      "recommendation": "Strong Hire / Hire / Maybe / No Hire"
    }
  ],
  "topPick": 1,
  "summary": "Candidate 1 is the strongest because..."
}
```

### Files to Modify
| File | Action |
|------|--------|
| `pages/recruiter/AIRanking.jsx` | Full rewrite to fetch real applications + AI rank |
| `services/aiService.js` | Add `rankCandidates(job, candidates)` function |

---

## ⭐ Feature 7: Smart Job Recommendations

### What It Does
On the user's dashboard or jobs page, AI suggests the **top 5 best-fit jobs** from all available jobs based on the user's profile.

### Implementation

**Prompt:**
```
Given this candidate's profile and the available jobs, recommend the top 5 best matches.

Candidate: {name}, Skills: {skills}, Experience: {exp}, Preferred: {jobType}, Location: {preferredLocation}

Available Jobs:
1. {title} at {company}, Skills: {skills}, Location: {location}
2. ...

Return ONLY valid JSON:
{
  "recommendations": [
    { "jobIndex": 3, "matchScore": 92, "reason": "Strong skill overlap in React & Node" }
  ]
}
```

### Files to Modify
| File | Action |
|------|--------|
| `pages/user/UserDashboard.jsx` | Add "Recommended for You" section |
| `pages/user/UserJobs.jsx` | Add "AI Recommended" filter/tab |
| `services/aiService.js` | Add `getJobRecommendations(userProfile, jobs)` |

---

## 📁 New Files Summary

```
frontend/src/
├── services/
│   └── aiService.js              ← Central AI service (Gemini calls)
├── components/
│   └── common/
│       ├── GeminiKeyInput.jsx    ← API key input modal
│       ├── ATSScoreCard.jsx      ← ATS score display component
│       └── SkillMatchCard.jsx    ← Skill match visual component
```

---

## 🚀 Implementation Phases

### Phase 1 — Foundation + ATS Score (Day 1)
1. Install `@google/generative-ai`
2. Create `aiService.js` with base functions
3. Create `GeminiKeyInput.jsx` component
4. Implement ATS Score on Profile page
5. Test with real Gemini API key

### Phase 2 — Skill Match + Chat (Day 2)
1. Add Skill Match to Job Details page
2. Add Skill Match to Recruiter's ViewCandidate page
3. Replace mock AI Chat with real Gemini streaming
4. Add user profile context to chat

### Phase 3 — Mock Interview + Roadmap (Day 3)
1. Rewrite Mock Interview with AI question generation
2. Add AI answer evaluation with detailed feedback
3. Replace mock Career Roadmap with real AI generation
4. Add progress tracking

### Phase 4 — Recruiter AI + Recommendations (Day 4)
1. Rewrite AI Candidate Ranking for recruiters
2. Add Smart Job Recommendations for users
3. Polish all UI components
4. Add loading states and error handling

---

## 💡 Suggested Bonus AI Features

| Feature | Description | Difficulty |
|---------|-------------|------------|
| 🔍 **Resume Summary Generator** | AI writes a 3-line professional summary from profile data | Easy |
| 📝 **AI Cover Letter Writer** | Generates customized cover letter for each job | Easy |
| 🎯 **Interview Question Predictor** | Predicts likely interview questions based on job description | Easy |
| 📊 **Salary Estimator** | Estimates salary range based on skills, location, experience | Medium |
| 🧠 **Skills Trend Analysis** | Shows which skills are trending in the user's target domain | Medium |
| 💬 **AI Application Status Explainer** | Explains why an application might be rejected + improvement tips | Easy |
| 🏆 **Certificate Recommender** | Suggests relevant online certifications to boost profile | Easy |
| 📋 **Job Description Quality Checker** | Helps recruiters write better job descriptions | Medium |

---

## ⚙️ Technical Notes

1. **Rate Limiting:** Gemini free tier = 60 req/min. Add debouncing and caching.
2. **Caching:** Cache AI results in `sessionStorage` to avoid repeated calls.
3. **Error Handling:** Handle invalid API keys, quota exceeded, and network errors gracefully.
4. **Loading UX:** Use skeleton loaders and typewriter effect for AI responses.
5. **Token Limit:** Gemini Flash supports 1M tokens — more than enough for all features.
6. **No Backend Changes Required** for Phases 1-3. Phase 4 may need a batch endpoint.

---

## 🎨 UI Design Guidelines for AI Features

- Use **purple/indigo gradients** for AI-related cards (differentiates from green/teal used for jobs)
- Add **sparkle/brain icons** (✨🧠) for AI features
- Use **typewriter animation** for AI text responses
- Show **progress ring** for score animations (0 → final score)
- Add **"Powered by Gemini AI"** badge on all AI cards

---

**Ready to implement? Tell me which feature to start building first!** 🚀
