
// Supabase Edge Function for Lore Entries
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
    const loreId = url.searchParams.get("loreId");
    const seriesId = url.searchParams.get("seriesId");
    const tag = url.searchParams.get("tag");

    let data;
    let error;

    switch (action) {
      case "getLoreEntries":
        // Get all lore entries or filter by series/tag
        let loreQuery = supabaseClient
          .from("lore_entries")
          .select(`
            *,
            series:series_id(id, name, color_code),
            creator:creator_id(id, username)
          `)
          .eq("is_approved", true);
          
        if (seriesId) {
          loreQuery = loreQuery.eq("series_id", seriesId);
        }
        
        if (tag) {
          loreQuery = loreQuery.contains("tags", [tag]);
        }
        
        loreQuery = loreQuery.order("created_at", { ascending: false });
        
        const { data: loreEntries, error: loreError } = await loreQuery;
        
        if (loreError) {
          throw loreError;
        }
        
        data = loreEntries;
        break;
        
      case "getLoreEntry":
        // Get a specific lore entry with related characters
        const { data: loreEntry, error: entryError } = await supabaseClient
          .from("lore_entries")
          .select(`
            *,
            series:series_id(id, name, color_code),
            creator:creator_id(id, username)
          `)
          .eq("id", loreId)
          .single();
          
        if (entryError) {
          throw entryError;
        }
        
        // Get characters related to this lore entry
        const { data: relatedCharacters, error: relatedError } = await supabaseClient
          .from("character_lore_entries")
          .select(`
            character:character_id(
              id, 
              name, 
              portrait_url,
              series:series_id(id, name, color_code)
            )
          `)
          .eq("lore_entry_id", loreId);
          
        if (relatedError) {
          throw relatedError;
        }
        
        // Get comments for this lore entry
        const { data: comments, error: commentsError } = await supabaseClient
          .from("comments")
          .select(`
            *,
            user:user_id(id, username, avatar_url)
          `)
          .eq("lore_entry_id", loreId)
          .order("created_at", { ascending: true });
          
        if (commentsError) {
          throw commentsError;
        }
        
        data = {
          ...loreEntry,
          relatedCharacters: relatedCharacters.map(rc => rc.character),
          comments
        };
        break;
        
      case "createLoreEntry":
        // Create a new lore entry
        const entryData = await req.json();
        
        const { data: newEntry, error: createError } = await supabaseClient
          .from("lore_entries")
          .insert({
            title: entryData.title,
            content: entryData.content,
            series_id: entryData.seriesId,
            tags: entryData.tags,
            sources: entryData.sources,
            creator_id: entryData.creatorId,
            is_approved: false, // Requires admin approval
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();
          
        if (createError) {
          throw createError;
        }
        
        // If there are related characters, create the relationships
        if (entryData.characterIds && entryData.characterIds.length > 0) {
          const characterRelations = entryData.characterIds.map(characterId => ({
            character_id: characterId,
            lore_entry_id: newEntry[0].id
          }));
          
          const { error: relError } = await supabaseClient
            .from("character_lore_entries")
            .insert(characterRelations);
            
          if (relError) {
            throw relError;
          }
        }
        
        data = newEntry[0];
        break;
        
      case "addComment":
        // Add a comment to a lore entry
        const commentData = await req.json();
        
        const { data: newComment, error: commentError } = await supabaseClient
          .from("comments")
          .insert({
            content: commentData.content,
            user_id: commentData.userId,
            lore_entry_id: commentData.loreEntryId,
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