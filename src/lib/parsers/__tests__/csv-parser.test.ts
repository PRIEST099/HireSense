import { describe, it, expect } from "vitest";
import { parseCSV } from "../csv-parser";

describe("parseCSV", () => {
  it("parses standard CSV with common headers", () => {
    const csv = `name,email,skills,experience,location
Alice Kamau,alice@test.com,"React, TypeScript, Node.js",5,Kigali
Bob Smith,bob@test.com,"Python, Django",3,Nairobi`;

    const { candidates, errors } = parseCSV(csv);
    expect(candidates).toHaveLength(2);
    expect(errors).toHaveLength(0);
    expect(candidates[0].profile.name).toBe("Alice Kamau");
    expect(candidates[0].profile.email).toBe("alice@test.com");
    expect(candidates[0].profile.skills).toHaveLength(3);
    expect(candidates[0].profile.totalYearsExperience).toBe(5);
  });

  it("handles alternative column names", () => {
    const csv = `full name,e-mail,technical skills,years of experience
Jane Doe,jane@test.com,"Java, Spring",4`;

    const { candidates, errors } = parseCSV(csv);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].profile.name).toBe("Jane Doe");
    expect(candidates[0].profile.email).toBe("jane@test.com");
    expect(candidates[0].profile.skills).toHaveLength(2);
  });

  it("skips rows with missing name", () => {
    const csv = `name,email
,missing@test.com
Valid Name,valid@test.com`;

    const { candidates, errors } = parseCSV(csv);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].profile.name).toBe("Valid Name");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("errors when no name column detected", () => {
    const csv = `id,score
1,85
2,90`;

    const { candidates, errors } = parseCSV(csv);
    expect(candidates).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("name");
  });

  it("handles empty CSV", () => {
    const { candidates } = parseCSV("");
    expect(candidates).toHaveLength(0);
  });

  it("parses skills with different delimiters", () => {
    const csv = `name,skills
Test1,"React; TypeScript; Node.js"
Test2,"Python | Django | FastAPI"`;

    const { candidates } = parseCSV(csv);
    expect(candidates[0].profile.skills).toHaveLength(3);
    expect(candidates[1].profile.skills).toHaveLength(3);
  });

  it("preserves raw CSV row data", () => {
    const csv = `name,email,custom_field
Alice,alice@test.com,some_value`;

    const { candidates } = parseCSV(csv);
    expect(candidates[0].rawCsvRow).toHaveProperty("custom_field", "some_value");
  });

  it("parses certifications and languages", () => {
    const csv = `name,certifications,languages
Alice,"AWS, GCP","English, French"`;

    const { candidates } = parseCSV(csv);
    expect(candidates[0].profile.certifications).toHaveLength(2);
    expect(candidates[0].profile.languages).toHaveLength(2);
  });
});
