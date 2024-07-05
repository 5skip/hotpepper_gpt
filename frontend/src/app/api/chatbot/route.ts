import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json({ message: 'Prompt is required' }, { status: 400 });
  }

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    let assistantMessage = '';
    for await (const chunk of stream) {
      assistantMessage += chunk.choices[0]?.delta?.content || '';
    }

    return NextResponse.json({ message: assistantMessage }, { status: 200 });
  } catch (error) {
    console.error('Error fetching OpenAI response:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
