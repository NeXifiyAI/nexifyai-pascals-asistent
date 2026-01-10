import { NextRequest, NextResponse } from "next/server";

const AUTHORIZED_EMAIL = "p.courbois@icloud.com";
const AUTHORIZED_PASSWORD = "1def!xO2022!!";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (email === AUTHORIZED_EMAIL && password === AUTHORIZED_PASSWORD) {
      const response = NextResponse.json({ success: true });

      response.cookies.set("nexify_auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { error: "Ungültige Anmeldedaten" },
      { status: 401 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 },
    );
  }
}
