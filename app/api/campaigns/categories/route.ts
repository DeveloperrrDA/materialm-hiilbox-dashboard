import { NextRequest, NextResponse } from "next/server";
import { apiBase, bearer, jsonFrom } from "../_authProxy";
export async function GET(req: NextRequest) {
  const auth = bearer(req);
  if (!auth) return NextResponse.json({ message: "Please sign in." }, { status: 401 });
  return jsonFrom(await fetch(`${apiBase}/campaign-categories`, { headers: { Authorization: auth }, cache: "no-store" }));
}
