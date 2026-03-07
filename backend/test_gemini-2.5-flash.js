import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBzJZC2L3b4bug8pF4QpLhwzQY9U7nByYo";
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("hello");
        console.log("Success with gemini-2.5-flash:", result.response.text());
    } catch (e) {
        console.error("Error with gemini-2.5-flash:", e.status, e.message.substring(0, 100));
    }
}

test();
