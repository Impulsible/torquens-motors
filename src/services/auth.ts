/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "jsonwebtoken" {
  export function sign(
    payload: unknown,
    secret: string,
    options?: { expiresIn?: string | number },
  ): string;
  export function verify(token: string, secret: string): unknown;
}

import { hash, compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.AUTH_SECRET || "secret";

const userSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  email: z.string().email(),
  role: z.string().min(1),
  password: z.string().min(8).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return hash(password, 12);
  }

  static async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return compare(password, hashedPassword);
  }

  static generateToken(userId: string, email: string, role: string): string {
    return sign({ userId, email, role }, JWT_SECRET, { expiresIn: "7d" });
  }

  static verifyToken(token: string): any {
    try {
      return verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  static validateUser(data: unknown) {
    return userSchema.parse(data);
  }

  static validateLogin(data: unknown) {
    return loginSchema.parse(data);
  }
}
