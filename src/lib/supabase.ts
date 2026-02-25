import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Environment variables (MUST exist in Vercel)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Safety check
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
  }

  // Create client (Frontend Safe — uses anon key only)
  export const supabase: SupabaseClient = createClient(
    supabaseUrl,
      supabaseAnonKey
      );

      /* =========================
         AUTH HELPERS
         ========================= */

         // Google Sign In
         export const signInWithGoogle = async () => {
           const { data, error } = await supabase.auth.signInWithOAuth({
               provider: "google",
                 });

                   return { data, error };
                   };

                   // Sign Out
                   export const signOut = async () => {
                     const { error } = await supabase.auth.signOut();
                       return { error };
                       };

                       /* =========================
                          STORAGE UPLOAD
                          ========================= */

                          export const uploadImage = async (file: File, path: string) => {
                            const fileExt = file.name.split(".").pop();
                              const fileName = `${path}.${fileExt}`;

                                // Upload file
                                  const { error: uploadError } = await supabase.storage
                                      .from("perfume-images")
                                          .upload(fileName, file, { upsert: true });

                                            if (uploadError) {
                                                console.error("Upload error:", uploadError.message);
                                                    throw uploadError;
                                                      }

                                                        // Get public URL (Supabase v2 pattern)
                                                          const { data } = supabase.storage
                                                              .from("perfume-images")
                                                                  .getPublicUrl(fileName);

                                                                    if (!data?.publicUrl) {
                                                                        throw new Error("Failed to retrieve public URL");
                                                                          }

                                                                            return data.publicUrl;
                                                                            };