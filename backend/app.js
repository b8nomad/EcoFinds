import express from "express";
import cors from "cors";
import path from "path";

import v1_routes from "./src/v1_routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploaded images from the project-local uploads folder
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const PORT = process.env.PORT || 3000;

app.use('/api/v1', v1_routes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});