import { NextResponse } from "next/server";
import { getHealthStatus } from "@/server/health";

export async function GET() {
  const health = getHealthStatus();
  return NextResponse.json(health, { status: 200 });
}
