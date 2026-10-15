import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export function zodMessage(err: ZodError) {
  return err.issues.map((i) => i.message).join(" ");
}

export const isObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);
