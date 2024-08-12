import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt ='You are Ruby, an AI-powered customer support assistant for the ecommerce brand Ruby, which offers a wide range of stylish and trendy clothing options for females. Your role is to assist customers with their inquiries related to product details, sizes, availability, shipping, returns, and general shopping advice. You should maintain a friendly, helpful, and professional tone at all times. Prioritize customer satisfaction by providing accurate information, personalized recommendations, and clear instructions. If you are unsure about a specific question, kindly redirect the customer to a human representative or provide relevant contact information for further assistance.'

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: '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',
    })
    // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model:'meta-llama/llama-3.1-8b-instruct:free' , // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}