import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { resumeUploadSchema } from "@/lib/validators/resume";
import type { ResumeData } from "@/types";

// ─── GET — fetch the active resume for the current user ───────────────────

/**
 * GET /api/resume
 * Returns the currently active resume for the authenticated user.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resume = await prisma.resume.findFirst({
      where: { userId: session.user.id, isActive: true },
      orderBy: { uploadedAt: "desc" },
    });

    if (!resume) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    const data: ResumeData = {
      id: resume.id,
      userId: resume.userId,
      fileName: resume.fileName,
      storageUrl: resume.storageUrl,
      parsedText: resume.parsedText,
      isActive: resume.isActive,
      uploadedAt: resume.uploadedAt,
    };

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/resume]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST — upload and parse a new resume ─────────────────────────────────

/**
 * POST /api/resume
 * Accepts a multipart/form-data PDF upload (max 5MB).
 * Parses the PDF text, uploads to Supabase Storage, saves to DB.
 *
 * Rate limit: 5 uploads per hour per user.
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate limiting — 5 uploads per hour
    const rl = await rateLimit({
      prefix: "resume",
      identifier: userId,
      limit: 5,
      windowSeconds: 3600,
    });

    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many uploads. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.resetAt - Math.floor(Date.now() / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // Parse multipart form
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file metadata with Zod
    const validation = resumeUploadSchema.safeParse({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message ?? "Invalid file" },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF text — pdf-parse v2 uses a class-based API
    let parsedText = "";
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      parsedText = result.text?.trim() ?? "";
    } catch (parseError) {
      console.error("[PDF parse error]", parseError);
      return NextResponse.json(
        { error: "Could not read the PDF. Make sure it contains selectable text." },
        { status: 422 }
      );
    }

    if (!parsedText) {
      return NextResponse.json(
        { error: "The PDF appears to be empty or image-only. Please upload a text-based PDF." },
        { status: 422 }
      );
    }

    // Upload to Supabase Storage
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `resumes/${userId}/${Date.now()}_${sanitizedName}`;

    const { error: storageError } = await supabaseAdmin.storage
      .from("resumes")
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (storageError) {
      console.error("[Supabase storage error]", storageError);
      return NextResponse.json(
        { error: "Failed to store the file. Please try again." },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("resumes")
      .getPublicUrl(storagePath);

    const storageUrl = urlData.publicUrl;

    // Deactivate all previous resumes for this user
    await prisma.resume.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Save new resume record
    const resume = await prisma.resume.create({
      data: {
        userId,
        fileName: file.name,
        storageUrl,
        parsedText,
        isActive: true,
      },
    });

    const data: ResumeData = {
      id: resume.id,
      userId: resume.userId,
      fileName: resume.fileName,
      storageUrl: resume.storageUrl,
      parsedText: resume.parsedText,
      isActive: resume.isActive,
      uploadedAt: resume.uploadedAt,
    };

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/resume]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE — remove the active resume ────────────────────────────────────

/**
 * DELETE /api/resume?id=<resumeId>
 * Deactivates a resume record (soft delete — keeps storage file).
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get("id");

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID required" }, { status: 400 });
    }

    // Ensure the resume belongs to this user
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: session.user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    await prisma.resume.update({
      where: { id: resumeId },
      data: { isActive: false },
    });

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/resume]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
