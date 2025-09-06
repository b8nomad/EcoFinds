import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

async function login(req, res) {
    try {
        // Validate request body
        if (!req.body) return res.status(400).json({ success: false, message: "Request body is missing" });
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });

        const lower_email = email.toLowerCase();

        // Validate user
        const user = await prisma.user.findUnique({ where: { email: lower_email } });
        if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid email or password" });

        // Create JWT Token 
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ success: true, message: "Login successful", data: { token, user: { role: user.role } } });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

async function signup(req, res) {
    try {
        // Validate request body
        if (!req.body) return res.status(400).json({ success: false, message: "Request body is missing" });
        const { name, email, password } = req.body;
        const lower_email = email ? email.toLowerCase() : email;
        if (!name || !lower_email || !password) return res.status(400).json({ success: false, message: "All fields are required" });
        const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email_regex.test(lower_email)) return res.status(400).json({ success: false, message: "Invalid email format" });

        // Hash Password
        const hashed = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name, email, password: hashed, role: 'USER'
            }
        });

        // Create JWT Token
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ success: true, message: "User registered successfully", data: { token, user: { role: user.role } } });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

export { login, signup }