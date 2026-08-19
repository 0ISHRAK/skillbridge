import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { authenticate, sanitizeFilename, validateFileUpload } from "../../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No thumbnail was uploaded" }, { status: 400 });
    }

    const validationError = validateFileUpload(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "courses");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const filename = sanitizeFilename(file.name);
    await fs.promises.writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ url: `/uploads/courses/${filename}` });
  } catch (err) {
    console.error("Admin course thumbnail upload error:", err);
    return NextResponse.json({ error: "Unable to upload thumbnail" }, { status: 500 });
  }
}
