import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  var reply;

  if (message === "Hello bro") {
    reply = "Hello from backend";
    return NextResponse.json({ reply: reply }, { status: 200 });
  }

  return NextResponse.json({ reply: "You didn't said hello bro" }, { status: 401 });
}
