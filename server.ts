import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "WrapRoute AI Engine Online" });
  });

  // Vision AI Endpoint
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  app.post("/api/scan-wrapper", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image uploaded" });
      }

      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = "Analyze this image carefully. 1. Is it a multi-layered plastic (MLP) food wrapper? 2. What is the brand (e.g., Lays, Nestle, Kurkure)? 3. Is the wrapper crushed or intact? Return strictly in JSON format with keys: 'is_mlp_wrapper' (boolean), 'brand' (string), 'condition' (string).";

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: req.file.buffer.toString("base64"),
          },
        },
        prompt,
      ]);

      const response = await result.response;
      let text = response.text() || "";
      text = text.trim();
      
      // Clean up markdown markers if present
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const data = JSON.parse(jsonStr);

      if (data.is_mlp_wrapper) {
        res.json({
          success: true,
          message: "Wrapper Validated",
          brand: data.brand || "Unknown",
          eco_coins_awarded: 15
        });
      } else {
        res.json({
          success: false,
          message: "Invalid item detected. No coins awarded."
        });
      }
    } catch (error) {
      console.error("Vision Error:", error);
      res.status(500).json({ success: false, message: "Detection engine error" });
    }
  });

  // Agentic Routing Endpoint
  app.post("/api/check-dispatch", (req, res) => {
    const { bins } = req.body;
    if (!Array.isArray(bins)) {
      return res.status(400).json({ error: "Invalid bins data" });
    }

    const dispatchOrders = bins
      .filter((bin: any) => bin.capacity >= 90)
      .map((bin: any) => ({
        bin_id: bin.id,
        location: bin.location,
        truck_id: `FL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        priority: "High"
      }));

    res.json({
      dispatch_triggered: dispatchOrders.length > 0,
      orders: dispatchOrders
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
