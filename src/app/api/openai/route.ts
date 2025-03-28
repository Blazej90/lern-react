import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Brak autoryzacji. Proszę się zalogować." },
        { status: 401 }
      );
    }

    const { question, userAnswer } = await req.json();

    console.log("Received data:", { question, userAnswer });

    if (!question || !userAnswer) {
      return NextResponse.json(
        { error: "Brak pytania lub odpowiedzi użytkownika." },
        { status: 400 }
      );
    }

    const messages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      {
        role: "system",
        content:
          "Jesteś nauczycielem React, który ocenia odpowiedzi uczniów. Twoim zadaniem jest udzielenie jasnej i zrozumiałej informacji zwrotnej. Twoje odpowiedzi mają być przyjazne, konkretne i pomocne.",
      },
      {
        role: "user",
        content: `Uczeń odpowiedział na pytanie: "${question}". Jego odpowiedź to: "${userAnswer}". Odpowiedz w prosty sposób, zaczynając od "Twoja odpowiedź była...", a następnie wskaż, co było poprawne, co wymaga poprawy i podaj dodatkowe wskazówki.`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    console.log("OpenAI response:", response);

    const aiAnswer =
      response.choices?.[0]?.message?.content || "Brak odpowiedzi AI.";

    return NextResponse.json({ aiAnswer });
  } catch (error: unknown) {
    console.error("Error while processing OpenAI request:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      { error: "Błąd podczas uzyskiwania odpowiedzi AI." },
      { status: 500 }
    );
  }
}
