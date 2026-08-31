import { NextResponse } from "next/server";
import { deleteCurrentSession } from "../../../../lib/auth";

export async function POST() {
  try {
    await deleteCurrentSession();

    return NextResponse.json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout exception:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
