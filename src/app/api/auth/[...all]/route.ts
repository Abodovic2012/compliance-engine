import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const response = await auth.handler(request);
  return response;
}

export async function POST(request: Request) {
  const response = await auth.handler(request);
  return response;
}
