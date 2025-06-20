
// Supabase Edge Function for Authentication
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { action, email, password, username } = await req.json();

    let data;
    let error;

    // Handle different authentication actions
    switch (action) {
      case "signup":
        // Sign up a new user
        const signUpResult = await supabaseClient.auth.signUp({
          email,
          password,
        });
        
        if (signUpResult.error) {
          throw signUpResult.error;
        }
        
        // If signup successful, create a profile
        if (signUpResult.data.user) {
          const { error: profileError } = await supabaseClient
            .from("profiles")
            .insert({
              id: signUpResult.data.user.id,
              username,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            
          if (profileError) {
            throw profileError;
          }
        }
        
        data = signUpResult.data;
        break;
        
      case "signin":
        // Sign in an existing user
        const signInResult = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInResult.error) {
          throw signInResult.error;
        }
        
        data = signInResult.data;
        break;
        
      case "signout":
        // Sign out the current user
        const signOutResult = await supabaseClient.auth.signOut();
        
        if (signOutResult.error) {
          throw signOutResult.error;
        }
        
        data = { message: "Signed out successfully" };
        break;
        
      case "reset":
        // Send password reset email
        const resetResult = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: `${req.headers.get("origin")}/reset-password`,
        });
        
        if (resetResult.error) {
          throw resetResult.error;
        }
        
        data = { message: "Password reset email sent" };
        break;
        
      default:
        throw new Error("Invalid action");
    }

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});