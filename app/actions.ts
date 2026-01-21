"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GenerateState {
  success: boolean;
  message?: string;
  data?: string;
}

export async function generateCaption(
  prevState: GenerateState,
  formData: FormData,
): Promise<GenerateState> {
  try {
    const file = formData.get("image") as File | null;
    const platform = formData.get("platform") as string;
    const tone = formData.get("tone") as string;
    const postType = formData.get("postType") as string;
    const title = formData.get("title") as string;
    const date = formData.get("date") as string;
    const contact = formData.get("contact") as string;
    const link = formData.get("link") as string;
    const ctaFocus = formData.get("ctaFocus") as string;
    const hideEmoji = formData.get("hideEmoji") === "on";
    const instructions = formData.get("instructions") as string; // For remake/revision

    const apiKey = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      ""
    ).trim();
    if (!apiKey) {
      return {
        success: false,
        message:
          "API Key Gemini tidak ditemukan. Pastikan GEMINI_API_KEY atau GOOGLE_API_KEY sudah diset di .env.local",
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    console.log(`[KasihKepsyen] Using model: ${modelName}`);
    console.log(
      `[KasihKepsyen] API Key present: ${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`,
    );

    let imagePart = null;
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      };
    }

    // Construct the Master System Prompt
    let prompt = `Bertindak sebagai Social Media Specialist profesional. `;

    if (imagePart) {
      prompt += `Analisis gambar yang diberikan. `;
    }

    prompt += `Buat caption untuk platform **${platform}** dengan gaya **${tone}**.
Konteks: Ini adalah postingan **${postType}**.

Detail:
- Judul: ${title || "-"}
- Tanggal: ${date || "-"}
- CP: ${contact || "-"}
- Link: ${link || "-"}
- Fokus CTA: ${ctaFocus || "Bebas"}

Instruksi Khusus:
1. ${hideEmoji ? "JANGAN gunakan emoji sama sekali." : "Gunakan emoji yang pas tapi tidak spam."}
2. Akhiri dengan ajakan bertindak (CTA) yang kuat sesuai input.
3. Sertakan 10-15 hashtag relevan (campuran global dan lokal Indonesia).
4. Gunakan Bahasa Indonesia yang natural (kecuali diminta lain).
5. Jika ada teks di dalam gambar, gunakan itu sebagai konteks tambahan.
`;

    if (instructions) {
      prompt += `\nTambahan Instruksi Revisi: "${instructions}". Harap sesuaikan output dengan instruksi ini.`;
    }

    const parts: any[] = [prompt];
    if (imagePart) {
      parts.push(imagePart);
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      data: text,
    };
  } catch (error: any) {
    console.error("Error generating caption:", error);
    return {
      success: false,
      message:
        error.message || "Gagal menghasilkan caption. Silakan coba lagi.",
    };
  }
}
