import dotenv from "dotenv";

// Load environment variables first, before any other imports
dotenv.config();

import { app } from "./app";

const PORT = parseInt(process.env.PORT || "3005", 10);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔧 API Version: ${process.env.API_VERSION || "v1"}`);
});
