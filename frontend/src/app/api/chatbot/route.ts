import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';

const endpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  if (!messages) {
    return NextResponse.json({ message: 'Messages are required' }, { status: 400 });
  }

  if (!endpoint || !apiKey) {
    console.error('Endpoint or API key is missing.');
    return NextResponse.json({ message: 'Endpoint or API key is missing' }, { status: 500 });
  }

  try {
    const client = new AzureOpenAI({ endpoint, apiKey, apiVersion: "2024-04-01-preview", deployment: "sample" });

    const result = await client.chat.completions.create({
      messages,
      model: "",
    });

    const assistantMessage = result.choices[0].message.content;

    return NextResponse.json({ message: assistantMessage }, { status: 200 });
  } catch (error) {
    console.error('Error fetching OpenAI response:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
