import express from "express";
import cors from "cors";

import v1_routes from "./src/v1_routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.use('/api/v1', v1_routes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});