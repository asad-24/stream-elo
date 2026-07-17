import { z } from "zod";
import { collections, getDb } from "@/lib/server/mongodb";

export const contactInquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  telephone: z.string().trim().max(50).optional().default(""),
  organization: z.string().trim().max(160).optional().default(""),
  inquiryType: z.string().trim().min(2).max(80),
  subject: z.string().trim().max(180).optional().default("Website enquiry"),
  message: z.string().trim().min(12).max(4000),
  consent: z.boolean().optional().default(false),
  website: z.string().trim().max(0).optional().default(""),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;

export async function createContactInquiry(input: ContactInquiryInput) {
  const db = await getDb();
  const now = new Date();

  const document = {
    name: input.name,
    email: input.email.toLowerCase(),
    telephone: input.telephone,
    organization: input.organization,
    inquiryType: input.inquiryType,
    subject: input.subject,
    message: input.message,
    consent: input.consent,
    status: "new",
    adminNotes: "",
    source: "website",
    createdAt: now,
    updatedAt: now,
  };

  const result = await db
    .collection(collections.contactInquiries)
    .insertOne(document);

  return {
    id: result.insertedId.toString(),
    status: document.status,
    createdAt: document.createdAt.toISOString(),
  };
}
