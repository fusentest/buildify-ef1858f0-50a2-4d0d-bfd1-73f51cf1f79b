
// Supabase Edge Function for Fan Theories and "What If" Scenarios
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

    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const theoryId = url.searchParams.get("theoryId");

    let data;
    let error;

    switch (action) {
      case "getTheories":
        // Get all approved fan theories
        const { data: theories, error: theoriesError } = await supabaseClient
          .from("fan_theories")
          .select(`
            *,
            creator:creator_id(id, username, avatar_url)
          `)
          .eq("is_approved", true)
          .order("upvotes", { ascending: false });
          
        if (theoriesError) {
          throw theoriesError;
        }
        
        data = theories;
        break;
        
      case "getTheory":
        // Get a specific fan theory with comments
        const { data: theory, error: theoryError } = await supabaseClient
          .from("fan_theories")
          .select(`
            *,
            creator:creator_id(id, username, avatar_url)
          `)
          .eq("id", theoryId)
          .single();
          
        if (theoryError) {
          throw theoryError;
        }
        
        // Get comments for this theory
        const { data: comments, error: commentsError } = await supabaseClient
          .from("comments")
          .select(`
            *,
            user:user_id(id, username, avatar_url)
          `)
          .eq("fan_theory_id", theoryId)
          .order("created_at", { ascending: true });
          
        if (commentsError) {
          throw commentsError;
        }
        
        // Check if the current user has upvoted this theory
        let hasUpvoted = false;
        const authHeader = req.headers.get("Authorization");
        
        if (authHeader) {
          const { data: user } = await supabaseClient.auth.getUser();
          
          if (user) {
            const { data: vote, error: voteError } = await supabaseClient
              .from("votes")
              .select("id")
              .eq("user_id", user.user.id)
              .eq("fan_theory_id", theoryId)
              .maybeSingle();
              
            hasUpvoted = !!vote;
          }
        }
        
        data = {
          ...theory,
          comments,
          hasUpvoted
        };
        break;
        
      case "createTheory":
        // Create a new fan theory
        const theoryData = await req.json();
        
        const { data: newTheory, error: createError } = await supabaseClient
          .from("fan_theories")
          .insert({
            title: theoryData.title,
            description: theoryData.description,
            branching_point: theoryData.branchingPoint,
            alternate_timeline: theoryData.alternateTimeline,
            creator_id: theoryData.creatorId,
            is_approved: false, // Requires admin approval
            upvotes: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();
          
        if (createError) {
          throw createError;
        }
        
        data = newTheory[0];
        break;
        
      case "upvoteTheory":
        // Upvote a fan theory
        const { userId, theoryId: upvoteTheoryId } = await req.json();
        
        // Check if user has already upvoted
        const { data: existingVote, error: checkError } = await supabaseClient
          .from("votes")
          .select("id")
          .eq("user_id", userId)
          .eq("fan_theory_id", upvoteTheoryId)
          .maybeSingle();
          
        if (checkError) {
          throw checkError;
        }
        
        if (existingVote) {
          // User already upvoted, so remove the vote
          const { error: removeError } = await supabaseClient
            .from("votes")
            .delete()
            .eq("id", existingVote.id);
            
          if (removeError) {
            throw removeError;
          }
          
          // Decrement upvote count
          const { data: updatedTheory, error: updateError } = await supabaseClient.rpc(
            "decrement_upvotes",
            { theory_id: upvoteTheoryId }
          );
          
          if (updateError) {
            throw updateError;
          }
          
          data = { upvoted: false, upvotes: updatedTheory };
        } else {
          // Add new upvote
          const { error: voteError } = await supabaseClient
            .from("votes")
            .insert({
              user_id: userId,
              fan_theory_id: upvoteTheoryId,
              created_at: new Date().toISOString(),
            });
            
          if (voteError) {
            throw voteError;
          }
          
          // Increment upvote count
          const { data: updatedTheory, error: updateError } = await supabaseClient.rpc(
            "increment_upvotes",
            { theory_id: upvoteTheoryId }
          );
          
          if (updateError) {
            throw updateError;
          }
          
          data = { upvoted: true, upvotes: updatedTheory };
        }
        break;
        
      case "addComment":
        // Add a comment to a fan theory
        const commentData = await req.json();
        
        const { data: newComment, error: commentError } = await supabaseClient
          .from("comments")
          .insert({
            content: commentData.content,
            user_id: commentData.userId,
            fan_theory_id: commentData.fanTheoryId,
            created_at: new Date().toISOString(),
          })
          .select(`
            *,
            user:user_id(id, username, avatar_url)
          `);
          
        if (commentError) {
          throw commentError;
        }
        
        data = newComment[0];
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