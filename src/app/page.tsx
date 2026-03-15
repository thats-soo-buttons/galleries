"use client";
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Home() {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [futureMarketingUpdate, setFutureMarketingUpdate] = useState(true); // default opt-in
  const [accessCode, setAccessCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Insert user info if not already present
    const { data: existingUser } = await supabase
      .from("dmg_users")
      .select("id")
      .eq("email", email)
      .single();

    if (!existingUser) {
      const { error: userError } = await supabase.from("dmg_users").insert([
        {
          email,
          agreed_terms: agreed,
          future_marketing_update: futureMarketingUpdate,
          access_code: accessCode,
        },
      ]);
      // If duplicate error, ignore and proceed
      if (userError && userError.code === "23505") {
        // 23505 is duplicate key violation in Postgres
        // Just proceed
      } else if (userError) {
        setError(userError.message);
        return;
      }
    }
    // Securely check access code in galleries table
    const trimmedCode = accessCode.trim();
    if (trimmedCode) {
      const { data: codeData, error: codeError } = await supabase
        .from("galleries")
        .select("slug, folder_id")
        .eq("access_code", trimmedCode)
        .single();
      if (codeError || !codeData) {
        setError("Invalid access code.");
        return;
      }
      if (codeData && codeData.slug && codeData.folder_id) {
        window.location.href = `/galleries/${codeData.slug}?folderId=${codeData.folder_id}`;
        return;
      }
    }
    // No code or incorrect code: redirect to main gallery
    window.location.href = "/accessgranted";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-row items-start justify-center py-32 px-6 bg-white dark:bg-black rounded-xl shadow-lg gap-8">
        <div className="w-full max-w-md flex flex-col">
          <h1 className="text-3xl font-bold mb-6 text-black dark:text-zinc-50">Welcome to Devillier Media Gallery</h1>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="font-medium text-lg text-black dark:text-zinc-50">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded border px-3 py-2 text-black"
              placeholder="Enter your email"
            />
            <label className="font-medium text-lg text-black dark:text-zinc-50 mt-2">Access Code (if required)</label>
            <input
              type="text"
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
              className="rounded border px-3 py-2 text-black"
              placeholder="Enter access code for event folder"
            />
            <div className="mt-4">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                id="terms"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-zinc-700 dark:text-zinc-200">
                By accessing and downloading images, you agree to the following terms:
                <ul className="ml-4 mt-2 text-xs">
                  <li>- All images are for personal, non-commercial use only.</li>
                  <li>- For any commercial use, you must contact <a href="mailto:contact@devilliermedia.com" className="underline">contact@devilliermedia.com</a> for permission.</li>
                  <li>- Standard photography copyright applies. Unauthorized commercial use is prohibited.</li>
                </ul>
              </label>
            </div>
            <div className="mt-4">
              <label className="font-medium text-sm text-black dark:text-zinc-50">Join the Database:</label>
              <div className="text-xs text-zinc-700 dark:text-zinc-200 mb-2 ml-4">
                Opting in means you'll receive future newsletters and updates about Devillier Media once we launch our newsletter and meet all legal requirements. Opt out if you do not wish to be contacted.
              </div>
              <div className="flex flex-row gap-4 ml-4 mt-2">
                <label>
                  <input
                    type="radio"
                    name="futureMarketingUpdate"
                    checked={futureMarketingUpdate}
                    onChange={() => setFutureMarketingUpdate(true)}
                    disabled={!agreed}
                  /> Opt in
                </label>
                <label>
                  <input
                    type="radio"
                    name="futureMarketingUpdate"
                    checked={!futureMarketingUpdate}
                    onChange={() => setFutureMarketingUpdate(false)}
                    disabled={!agreed}
                  /> Opt out
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition"
              disabled={!agreed || !email}
            >
              Access Gallery
            </button>
          </form>
          {error && <div className="mt-4 text-red-600 font-semibold">{error}</div>}
          {submitted && (
            <div className="mt-8 text-green-700 font-semibold">Thank you! You now have access to the gallery.</div>
          )}
        </div>
        {/* Donation/Support Info Box */}
        {/* You can add a new aside here for gallery-specific info, or leave it empty for now. */}
      </main>
    </div>
  );
}
        {/* End of main content */}
