import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a Design Architect and UX Forensics Expert with 20 years of experience auditing digital products. You have deep knowledge of every UX law, UI principle, accessibility standard, and cognitive psychology principle that affects how users interact with interfaces. Analyze this uploaded design screen in extreme detail, pixel by pixel.

Evaluate it against ALL of the following:

UX Laws: Fitts's Law, Hick's Law, Miller's Law, Jakob's Law, Tesler's Law, Postel's Law, Doherty Threshold, Serial Position Effect, Peak-End Rule, Aesthetic-Usability Effect, Von Restorff Effect, Law of Proximity, Law of Similarity, Law of Common Region, Law of Continuity, Law of Closure, Figure-Ground Principle, Law of Symmetry, Zeigarnik Effect, Goal-Gradient Effect

UI Rules: Spacing and padding consistency, 8pt grid system, alignment, visual hierarchy, typography scale, font size readability (minimum 16px body), line height, letter spacing, color contrast, whitespace usage, touch target size (minimum 44x44px), button sizing, CTA clarity, card design, iconography consistency, shadow and elevation, border radius consistency

Accessibility WCAG 2.2: Color contrast ratio (minimum 4.5:1 for normal text, 3:1 for large text), text size, touch target size, color independence, focus states, screen reader compatibility, keyboard navigation, error identification, labels and instructions

Nielsen's 10 Heuristics: Visibility of system status, Match between system and real world, User control and freedom, Consistency and standards, Error prevention, Recognition rather than recall, Flexibility and efficiency of use, Aesthetic and minimalist design, Help users recognize diagnose and recover from errors, Help and documentation

Gestalt Principles: Proximity, Similarity, Closure, Continuity, Figure-Ground, Symmetry, Common Fate

Cognitive Load: Information density, decision fatigue, F-pattern and Z-pattern reading flow, scannability, chunking of information

Content and Copy: CTA effectiveness, microcopy clarity, error message quality, empty state copy, tone and clarity

Platform Guidelines: iOS Human Interface Guidelines and Material Design 3

Color Theory: Color harmony, emotional response to color, color meaning, contrast between background and foreground, color used to guide attention

Research and Benchmarking: Compare against industry best practices from Airbnb, Stripe, Google, Apple, Swiggy, Zomato, Amazon, Flipkart, Linear, Notion.

For every single issue and win found, write the learn_why field with ALL of these:
1. What the law or rule says in one simple sentence
2. How it applies specifically to THIS exact screen and the exact element you are analyzing
3. What happens to the user if this is ignored on this screen
4. A real world example of a top app that gets this right and exactly how they do it

Minimum 4 sentences for every learn_why. Never be generic. Always connect the law directly to what you can see in this specific screen. Use exact numbers where possible. Use plain simple language.

IMPORTANT: The location field must contain ACCURATE coordinates as percentages (0-100) of where the element actually appears on the screen. x is left position, y is top position, width and height are dimensions. Be precise.

Return ONLY raw valid JSON with absolutely no markdown, no backticks, no explanation text before or after. Just the raw JSON:

{"overall_score":0,"scores":{"usability":0,"accessibility":0,"visual_design":0,"hierarchy":0,"cognitive_load":0},"summary":"2 sentence specific assessment of this exact screen","issues":[{"id":1,"element":"exact element name","severity":"critical","category":"ux_law","rule_violated":"exact law name","problem":"specific problem with exact numbers and measurements","learn_why":"4 sentence explanation connecting law to this specific screen","fix":"specific actionable fix with exact pixel values","location":{"x":5,"y":10,"width":90,"height":8}}],"wins":[{"id":1,"element":"exact element name","severity":"win","category":"ux_law","rule_violated":"principle followed","problem":"","learn_why":"4 sentence explanation of why this works on this specific screen","fix":"maintain this pattern","location":{"x":5,"y":80,"width":90,"height":10}}],"priority_fixes":["most critical fix with exact element","second fix with exact element","third fix with exact element"]}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType || "image/png",
                    data: imageBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) { return NextResponse.json({ error: data?.error?.message || "Gemini error", status: response.status, full: data }, { status: 500 }); }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json({ error: "No response from Gemini" }, { status: 500 });
    }

    const cleaned = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);
    return NextResponse.json(result);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
