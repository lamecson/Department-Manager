import { GoogleGenAI } from "@google/genai";
import { Task, User, Note } from '../types';
import { STANDARD_TASKS } from '../constants';

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

export const getTaskSuggestions = async (employeeName: string, recentTasks: Task[], availableTasks: string[] = STANDARD_TASKS) => {
  try {
    const taskHistory = recentTasks.map(t => t.title).join(', ');
    const tasksToConsider = availableTasks;
    
    const prompt = `
      You are a grocery retail manager advisor.
      Employee: ${employeeName}
      Available Standard Tasks: ${tasksToConsider.join(', ')}
      
      Recent Completed History: ${taskHistory}
      
      Suggest 5 specific tasks from the Standard List for this employee for today. 
      Focus on filling gaps in their history (tasks they haven't done recently) or maintaining operational rhythm. 
      
      Return ONLY the task names separated by commas. Do not add numbering or bullets.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    // Split by comma and clean up
    return text.split(',').map(t => t.trim()).filter(t => tasksToConsider.includes(t));
  } catch (error) {
    console.error("Error fetching task suggestions:", error);
    // Fallback: Return 3 random tasks from availableTasks
    return availableTasks.sort(() => 0.5 - Math.random()).slice(0, 3);
  }
};

export const generateFeedbackAnalysis = async (employeeName: string, notes: Note[], tasks: Task[]) => {
  try {
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const notesText = notes.map(n => `"${n.text}" (${n.date})`).join('; ');
    
    const prompt = `
      You are a specialized retail HR and Leadership coach.
      Manager's Goal: Prepare a 1-on-1 feedback session.
      
      Employee: ${employeeName}
      Performance Data: ${completedTasks} tasks completed.
      Manager's Private Notes: ${notesText}
      
      Generate a structured 1-on-1 feedback script.
      Include:
      1. Positive Reinforcement (based on data/notes)
      2. Constructive Feedback & Areas for Improvement
      3. A motivational closing statement.
      
      Tone: Professional, encouraging, growth-oriented.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    return "Unable to generate feedback analysis at this time.";
  }
};