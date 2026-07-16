import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { authenticate, validateFileUpload, sanitizeFilename } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file was uploaded" },
        { status: 400 }
      );
    }

    const validationError = validateFileUpload(file);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const uniqueFilename = sanitizeFilename(file.name);
    const filePath = path.join(uploadDir, uniqueFilename);

    await fs.promises.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({
      message: "File uploaded successfully",
      url: relativeUrl,
    });
  } catch (err) {
    console.error("Upload exception:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
