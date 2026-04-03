export const PROMPT_VERSION = "1.0.0";

export function buildResumeParsingPrompt(rawText: string, jobContext: string): string {
  return `You are an expert resume parser. Extract structured information from the resume text below.

JOB CONTEXT (use this to understand which skills and experiences are most relevant):
${jobContext}

RESUME TEXT:
${rawText}

Extract the following information as JSON. If any field is not found, use empty string or empty array as appropriate. Do NOT guess or fabricate information — only extract what is explicitly stated.

{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedIn": "string",
  "portfolio": "string",
  "summary": "string - brief professional summary",
  "skills": [{"name": "string", "level": "beginner|intermediate|advanced|expert", "yearsOfExperience": 0}],
  "experience": [{"title": "string", "company": "string", "startDate": "string", "endDate": "string", "description": "string", "achievements": ["string"]}],
  "education": [{"degree": "string", "institution": "string", "field": "string", "graduationYear": 0}],
  "certifications": ["string"],
  "languages": ["string"],
  "totalYearsExperience": 0
}

Rules:
- For skill levels, infer from context: if someone is senior or has 5+ years in a skill, mark as "advanced" or "expert"
- Calculate totalYearsExperience from the experience entries
- Keep descriptions concise
- Return ONLY the JSON object, no other text`;
}

export function buildScoringPrompt(
  jobRequirements: Record<string, unknown>,
  jobPreferences: Record<string, unknown>,
  candidateProfile: Record<string, unknown>,
  screeningConfig: Record<string, unknown>
): string {
  return `You are an expert HR screening AI. Evaluate this candidate against the job requirements.

JOB REQUIREMENTS:
${JSON.stringify(jobRequirements, null, 2)}

JOB PREFERENCES (nice-to-have, weight lower):
${JSON.stringify(jobPreferences, null, 2)}

SCREENING WEIGHTS:
${JSON.stringify(screeningConfig, null, 2)}

CANDIDATE PROFILE:
${JSON.stringify(candidateProfile, null, 2)}

SCORING RUBRIC:
- 90-100: Exceeds all requirements significantly
- 70-89: Meets most requirements well
- 50-69: Meets some requirements
- 30-49: Meets few requirements
- 0-29: Does not meet requirements

CRITICAL INSTRUCTIONS:
- Only reference information EXPLICITLY present in the candidate profile
- If information is missing, note it as a gap rather than assuming
- Be specific in strengths and gaps — reference actual skills, experiences, or qualifications
- The reasoning should be 2-3 sentences explaining why this candidate is or isn't a good fit

Return a JSON object:
{
  "overallScore": number (0-100),
  "breakdown": {
    "skillsMatch": number (0-100),
    "experienceMatch": number (0-100),
    "educationMatch": number (0-100),
    "cultureFitMatch": number (0-100)
  },
  "strengths": ["string - max 3 specific strengths"],
  "gaps": ["string - max 3 specific gaps"],
  "recommendation": "strong_match|good_match|partial_match|weak_match",
  "reasoning": "string - 2-3 sentence explanation",
  "confidenceScore": number (0-100, how confident you are in this assessment)
}

Return ONLY the JSON object.`;
}

export function buildRankingPrompt(
  jobContext: string,
  candidateSummaries: Array<{ candidateId: string; name: string; overallScore: number; strengths: string[]; gaps: string[] }>,
  shortlistSize: number
): string {
  return `You are an expert HR ranking AI. Review the individual assessments below and produce a final comparative ranking.

JOB CONTEXT:
${jobContext}

CANDIDATE SUMMARIES (from individual scoring):
${JSON.stringify(candidateSummaries, null, 2)}

SHORTLIST SIZE: Top ${shortlistSize} candidates

Your task:
1. Review the individual scores for consistency
2. Consider how candidates compare RELATIVE to each other
3. Adjust scores if needed (max ±5 points) to ensure fair relative ranking
4. Return the final ranked list

Return a JSON object:
{
  "rankings": [
    {
      "candidateId": "string",
      "adjustedScore": number,
      "rank": number,
      "adjustmentReason": "string or empty if no change"
    }
  ]
}

Sort by adjustedScore descending. Include ALL candidates, not just the shortlist.
Return ONLY the JSON object.`;
}
