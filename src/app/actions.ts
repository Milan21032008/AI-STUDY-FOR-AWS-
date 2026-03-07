
"use server";

import { aiMediation } from "@/ai/flows/ai-message-rephrasing";
import { translateText } from "@/ai/flows/translate-text";
import { textToSpeech } from "@/ai/flows/text-to-speech";

export async function mediateMessage(audioDataUri?: string, textMessage?: string) {
  try {
    // Transcribe, mediate, rephrase and check safety in one go
    const mediationResult = await aiMediation({
      audioDataUri,
      textMessage,
    });

    return {
      transcription: mediationResult.originalMessage,
      sentiment: mediationResult.originalSentiment,
      rephrased: mediationResult.rephrasedMessage,
      explanation: mediationResult.explanation,
      safety: mediationResult.safety,
    };
  } catch (error) {
    console.error("Error in mediateMessage action:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("API key expired") || errorMessage.includes("INVALID_ARGUMENT")) {
      throw new Error("The AI service is currently unavailable due to an expired API key. Please update your GOOGLE_GENAI_API_KEY in the environment settings.");
    }
    
    if (error instanceof Error) {
        throw new Error(`Failed to mediate message: ${error.message}`);
    }
    throw new Error("Failed to mediate message. Please try again.");
  }
}

export type MediationResult = Awaited<ReturnType<typeof mediateMessage>>;


export async function getTranslatedSpeech(text: string, language: string) {
    try {
        let textToSpeak = text;
        if (language.toLowerCase() !== 'english') {
            const translationResult = await translateText({ text: text, targetLanguage: language });
            textToSpeak = translationResult.translatedText;
        }

        const speechResult = await textToSpeech({ text: textToSpeak, language: language });
        return { audioDataUri: speechResult.audioDataUri };

    } catch (error) {
        console.error("Error in getTranslatedSpeech action:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate speech: ${error.message}`);
        }
        throw new Error("Failed to generate speech. Please try again.");
    }
}
