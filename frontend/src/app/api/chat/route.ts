import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Call Gemini API directly via fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { 
                  text: "System Instruction: You are the AeroGuard AI Assistant, an advanced aviation maintenance and fleet health expert. Provide concise, professional, and accurate answers about aircraft inspections, defects, FAA regulations, and fleet health. Format your responses with markdown.\n\nUser Message: " + message 
                }
              ],
            },
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }

    const data = await response.json();
    
    // Extract text from Gemini response structure
    let generatedText = 'I am sorry, but I could not generate a response at this time.';
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      generatedText = data.candidates[0].content.parts[0].text;
    }

    // Return the response, along with mock citations just to keep the UI looking nice
    return NextResponse.json({
      text: generatedText,
      citations: [
        { label: 'AeroGuard Analysis', type: 'report' },
      ]
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
