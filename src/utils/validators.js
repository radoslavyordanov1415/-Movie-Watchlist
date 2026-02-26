import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  password: z.string().min(1, "Password is required"),
});


export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),

    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must be 72 characters or fewer"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });


export const movieSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(150, "Title must be 150 characters or fewer"),

  genre: z.string().min(1, "Please select a genre"),

  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be 500 characters or fewer"),

  rating: z
    .number()
    .min(1, "Please give a rating")
    .max(5, "Rating cannot exceed 5"),

  watched: z.boolean(),

  watchDate: z
    .string()
    .min(1, "Watch date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});
