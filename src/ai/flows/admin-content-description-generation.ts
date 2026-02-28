'use server';
/**
 * @fileOverview A Genkit flow to generate engaging descriptions for video content.
 *
 * - generateContentDescription - A function that handles the content description generation process.
 * - AdminContentDescriptionInput - The input type for the generateContentDescription function.
 * - AdminContentDescriptionOutput - The return type for the generateContentDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdminContentDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the video content.'),
  genre: z.string().describe('The genre(s) of the video content.'),
});
export type AdminContentDescriptionInput = z.infer<typeof AdminContentDescriptionInputSchema>;

const AdminContentDescriptionOutputSchema = z.object({
  description: z.string().describe('An engaging and concise description for the video content.'),
});
export type AdminContentDescriptionOutput = z.infer<typeof AdminContentDescriptionOutputSchema>;

export async function generateContentDescription(input: AdminContentDescriptionInput): Promise<AdminContentDescriptionOutput> {
  return adminContentDescriptionGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminContentDescriptionPrompt',
  input: { schema: AdminContentDescriptionInputSchema },
  output: { schema: AdminContentDescriptionOutputSchema },
  prompt: `You are an expert content writer for a streaming service named "Léo Tv & Stream".

Your task is to generate a concise, engaging, and SEO-friendly description for new video content.
The description should capture the essence of the content, entice users to watch, and include relevant keywords based on the title and genre.

Generate a description in Portuguese.

Title: {{{title}}}
Genre: {{{genre}}}`,
});

const adminContentDescriptionGenerationFlow = ai.defineFlow(
  {
    name: 'adminContentDescriptionGenerationFlow',
    inputSchema: AdminContentDescriptionInputSchema,
    outputSchema: AdminContentDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
