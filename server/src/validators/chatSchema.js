// src/validators/chatSchema.js
import { z } from "zod";



/* ---------------------------------------------
   RENAME CHAT
--------------------------------------------- */
export const renameChatSchema = z.object({
  params: z.object({
    chatId: z.string().min(1, "Chat ID is required"),
  }),
  body: z.object({
    name: z
      .string({ required_error: "Chat name is required" })
      .min(3, "Chat name must be at least 3 characters")
      .max(50, "Chat name too long"),
  }),
});

/* ---------------------------------------------
   GET CHAT(S)
--------------------------------------------- */
export const getChatsSchema = z.object({
  query: z.object({
    skip: z.coerce.number().int().min(0).default(0),
    limit: z.coerce.number().int().min(1).max(200).default(20),
  }),
});

/* ---------------------------------------------
   DELETE CHAT
--------------------------------------------- */
export const deleteChatSchema = z.object({
  params: z.object({
    chatId: z.string().min(1, "Chat ID is required"),
  }),
});

/* ---------------------------------------------
   ADD MESSAGE
--------------------------------------------- */
export const addMessageSchema = z.object({
  params: z.object({
    chatId: z.string().min(1, "Chat ID is required"),
  }),
  body: z.object({
    role: z.enum(["user", "assistant", "system"], { required_error: "Role is required" }),
    content: z.string().min(1, "Message content cannot be empty"),
    isImage: z.boolean().optional().default(false),
    isPublished: z.boolean().optional().default(false),
  }),
});

/* ---------------------------------------------
   UPDATE MESSAGE
--------------------------------------------- */
export const updateMessageSchema = z.object({
  params: z.object({
    chatId: z.string().min(1, "Chat ID is required"),
    messageId: z.string().min(1, "Message ID is required"),
  }),
  body: z
    .object({
      role: z.enum(["user", "assistant", "system"]).optional(),
      content: z.string().optional(),
      isImage: z.boolean().optional(),
      isPublished: z.boolean().optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field (content, role, isImage, isPublished) must be provided"
    ),
});

/* ---------------------------------------------
   DELETE MESSAGE
--------------------------------------------- */
export const deleteMessageSchema = z.object({
  params: z.object({
    chatId: z.string().min(1, "Chat ID is required"),
    messageId: z.string().min(1, "Message ID is required"),
  }),
});

/* ---------------------------------------------
   GET MESSAGES (pagination)
--------------------------------------------- */
export const getMessagesSchema = z.object({
  params: z.object({
    chatId: z.string().min(1, "Chat ID is required"),
  }),
  query: z.object({
    skip: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : 0))
      .refine((val) => val >= 0, "Skip must be non-negative"),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : 100))
      .refine((val) => val > 0 && val <= 200, "Limit must be between 1 and 200"),
  }),
});
