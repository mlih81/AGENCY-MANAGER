import { GoogleGenAI } from "@google/genai";
import { Booking } from "../types.ts";

export const generateDraftMessage = async (
  booking: Booking,
  type: 'offer' | 'reminder' | 'status',
  tone: 'professional' | 'friendly' | 'urgent'
): Promise<string> => {
  // Safe access to process.env to avoid ReferenceError in environments without polyfills
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  
  if (!apiKey) {
    console.error("Gemini API Key is missing. Ensure process.env.API_KEY is configured.");
    return "Configuration Error: The AI service is not configured. Please check your API key settings.";
  }

  try {
    // Initialize AI client inside the function to ensure it has the latest key
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";

    // Construct passenger list string
    const paxNames = booking.passengers.map(p => p.name).join(', ');
    const flightDate = new Date(booking.departureDate).toLocaleDateString();
    const returnDateInfo = booking.returnDate ? ` - Return: ${new Date(booking.returnDate).toLocaleDateString()}` : '';

    const prompt = `
      You are a professional travel agent assistant.
      Write a short, clear ${type} message for a ${booking.category} via WhatsApp or Email.
      
      Context:
      Client/Contact: ${booking.clientName}
      Passengers: ${paxNames}
      
      Booking Details:
      PNR: ${booking.pnr}
      Airline: ${booking.airline}
      Route: ${booking.route} (${booking.tripType})
      Travel Date: ${flightDate}${returnDateInfo}
      Price: ${booking.price} ${booking.currency}
      Deadline: ${new Date(booking.ticketingDeadline).toLocaleString()}
      Status: ${booking.status}
      
      Instructions:
      - Tone: ${tone}
      - Keep it concise and professional.
      - Include the PNR and Deadline clearly.
      - Do not use hashtags.
      - Use Modern Standard Arabic if the client name sounds Arabic, otherwise use English/French based on common professional standards in Morocco.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    return response.text || "Could not generate message content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The AI service is currently unavailable. Please try drafting the message manually.";
  }
};