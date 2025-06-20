
// Supabase Edge Function for Character Data
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
    const characterId = url.searchParams.get("characterId");
    const seriesId = url.searchParams.get("seriesId");

    let data;
    let error;

    switch (action) {
      case "getAllCharacters":
        // Get all characters or filter by series
        let charactersQuery = supabaseClient
          .from("characters")
          .select(`
            *,
            series:series_id(id, name, color_code)
          `);
          
        if (seriesId) {
          charactersQuery = charactersQuery.eq("series_id", seriesId);
        }
        
        charactersQuery = charactersQuery.order("name");
        
        const { data: characters, error: charactersError } = await charactersQuery;
        
        if (charactersError) {
          throw charactersError;
        }
        
        data = characters;
        break;
        
      case "getCharacter":
        // Get a specific character with their relationships
        const { data: character, error: characterError } = await supabaseClient
          .from("characters")
          .select(`
            *,
            series:series_id(id, name, color_code)
          `)
          .eq("id", characterId)
          .single();
          
        if (characterError) {
          throw characterError;
        }
        
        // Get relationships where this character is either character1 or character2
        const { data: relationships1, error: rel1Error } = await supabaseClient
          .from("relationships")
          .select(`
            id,
            relationship_type,
            description,
            character2:character2_id(id, name, portrait_url, series_id)
          `)
          .eq("character1_id", characterId);
          
        if (rel1Error) {
          throw rel1Error;
        }
        
        const { data: relationships2, error: rel2Error } = await supabaseClient
          .from("relationships")
          .select(`
            id,
            relationship_type,
            description,
            character1:character1_id(id, name, portrait_url, series_id)
          `)
          .eq("character2_id", characterId);
          
        if (rel2Error) {
          throw rel2Error;
        }
        
        // Format relationships for easier consumption by frontend
        const formattedRelationships = [
          ...relationships1.map(r => ({
            id: r.id,
            relationshipType: r.relationship_type,
            description: r.description,
            character: r.character2,
            direction: "outgoing"
          })),
          ...relationships2.map(r => ({
            id: r.id,
            relationshipType: r.relationship_type,
            description: r.description,
            character: r.character1,
            direction: "incoming"
          }))
        ];
        
        // Get lore entries related to this character
        const { data: loreEntries, error: loreError } = await supabaseClient
          .from("character_lore_entries")
          .select(`
            lore_entry:lore_entry_id(
              id, 
              title, 
              content, 
              tags, 
              created_at,
              series:series_id(id, name)
            )
          `)
          .eq("character_id", characterId);
          
        if (loreError) {
          throw loreError;
        }
        
        data = {
          ...character,
          relationships: formattedRelationships,
          loreEntries: loreEntries.map(entry => entry.lore_entry)
        };
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