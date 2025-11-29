import { GoogleGenAI } from "@google/genai";
import { Task, User } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDashboardInsights = async (tasks: Task[], employees: User[]) => {
  try {
    const taskSummary = tasks.map(t => 
      `- ${t.title} (${t.status}): Assigned to ${employees.find(e => e.id === t.assignedToId)?.name || 'Unknown'}, Due: ${t.dueDate}`
    ).join('\n');

    const prompt = `
      You are an AI assistant for a retail manager. Analyze the following task data and provide 3 key insights regarding team performance, potential bottlenecks, and suggestions for improving Grocery/Retail KPIs (like efficiency, shelf availability, customer experience).
      
      Keep it concise and professional.

      Data:
      ${taskSummary}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini insights:", error);
    return "Unable to generate insights at this time. Please check your network connection or API key.";
  }
};