import express from "express"
import { createRegistration } from "../controllers/registrationController"
import { authenticateUser } from "../middleware/authMiddleware";
app=express();

app.post("/register_event",authenticateUser,createRegistration);