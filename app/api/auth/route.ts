import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

async function syncChildProfile(parentId: string, name: string, avatar: string) {
  if (!supabaseAdmin) {
    return null;
  }

  const { data: existingProfile } = await supabaseAdmin
    .from("child_profiles")
    .select("id, name, avatar, level, xp, coins, streak, completed_lessons, accuracy")
    .eq("parent_id", parentId)
    .maybeSingle();

  if (existingProfile) {
    return existingProfile;
  }

  const { data: createdProfile, error } = await supabaseAdmin
    .from("child_profiles")
    .insert({
      parent_id: parentId,
      name,
      avatar
    })
    .select("id, name, avatar, level, xp, coins, streak, completed_lessons, accuracy")
    .single();

  if (error) {
    throw error;
  }

  return createdProfile;
}

export async function POST(request: Request) {
  const { email, password, childName, avatar } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Authentication is not configured. Add Supabase environment variables to enable real accounts." },
      { status: 503 }
    );
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const profileName = childName?.trim() || "Child";
  const profileAvatar = avatar || "rocket";

  try {
    const login = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (!login.error && login.data.user) {
      const profile = await syncChildProfile(login.data.user.id, profileName, profileAvatar);
      return NextResponse.json({
        status: "logged_in",
        user: { id: login.data.user.id, email: login.data.user.email },
        session: login.data.session,
        profile
      });
    }

    const signup = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { child_name: profileName, avatar: profileAvatar }
      }
    });

    if (signup.error) {
      return NextResponse.json({ error: signup.error.message }, { status: 400 });
    }

    const user = signup.data.user;
    const profile = user ? await syncChildProfile(user.id, profileName, profileAvatar) : null;

    return NextResponse.json({
      status: signup.data.session ? "registered" : "confirmation_required",
      user: user ? { id: user.id, email: user.email } : null,
      session: signup.data.session,
      profileSaved: Boolean(profile),
      profile
    });
  } catch {
    return NextResponse.json(
      { error: "Authentication service is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }
}
