export const PROMPT_VERSION = "2.0.0";

export function buildResumeParsingPrompt(rawText: string, jobContext: string): string {
  return `You are an expert resume parser. Extract structured information following the Umurava Talent Profile Schema.

JOB CONTEXT (use this to understand which skills and experiences are most relevant):
${jobContext}

RESUME TEXT:
${rawText}

Extract the following JSON. If any field is not found, use empty string, empty array, or defaults as shown. Do NOT guess or fabricate information — only extract what is explicitly stated.

{
  "firstName": "string",
  "lastName": "string",
  "name": "string - full name as backup",
  "email": "string",
  "phone": "string",
  "headline": "string - short professional title, e.g. 'Backend Engineer - Node.js & AI Systems'",
  "bio": "string - professional summary/bio",
  "location": "string - City, Country",
  "skills": [{"name": "string", "level": "beginner|intermediate|advanced|expert", "yearsOfExperience": 0}],
  "languages": [{"name": "string", "proficiency": "basic|conversational|fluent|native"}],
  "experience": [{"company": "string", "role": "string", "startDate": "YYYY-MM", "endDate": "YYYY-MM or empty if current", "description": "string", "technologies": ["string"], "isCurrent": false, "achievements": ["string"]}],
  "education": [{"institution": "string", "degree": "string", "fieldOfStudy": "string", "startYear": 0, "endYear": 0}],
  "certifications": [{"name": "string", "issuer": "string", "issueDate": "YYYY-MM"}],
  "projects": [{"name": "string", "description": "string", "technologies": ["string"], "role": "string", "link": "string", "startDate": "YYYY-MM", "endDate": "YYYY-MM"}],
  "availability": {"status": "available|open_to_opportunities|not_available", "type": "full-time|part-time|contract", "startDate": ""},
  "socialLinks": {"linkedin": "string", "github": "string", "portfolio": "string"},
  "totalYearsExperience": 0
}

Rules:
- Split the full name into firstName and lastName. Also keep the full name in the "name" field.
- For headline, create a concise professional title if not explicitly stated (e.g. "Senior Software Engineer" from their most recent role)
- For skill levels, infer from context: senior + 5yr = advanced/expert
- For experience, extract technologies used per role from the description
- Set isCurrent: true if the role has no end date or says "Present"
- For languages, infer proficiency: if the resume is written in English, assume fluent
- For certifications, separate the cert name from the issuer (e.g. "AWS Certified Developer" → name: "Certified Developer", issuer: "AWS")
- For projects, extract from portfolio/projects sections if present
- Calculate totalYearsExperience from experience entries
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
