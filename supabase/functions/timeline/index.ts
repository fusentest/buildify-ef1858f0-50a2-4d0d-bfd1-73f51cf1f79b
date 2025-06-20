
// Supabase Edge Function for Timeline Data
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
    const timelineId = url.searchParams.get("timelineId");
    const seriesId = url.searchParams.get("seriesId");

    let data;
    let error;

    switch (action) {
      case "getTimelines":
        // Get all timelines or filter by official/fan-made
        const isOfficial = url.searchParams.get("isOfficial");
        let timelinesQuery = supabaseClient.from("timelines").select("*");
        
        if (isOfficial !== null) {
          timelinesQuery = timelinesQuery.eq("is_official", isOfficial === "true");
        }
        
        const { data: timelines, error: timelinesError } = await timelinesQuery;
        
        if (timelinesError) {
          throw timelinesError;
        }
        
        data = timelines;
        break;
        
      case "getTimelineEvents":
        // Get events for a specific timeline, optionally filtered by series
        let eventsQuery = supabaseClient
          .from("timeline_events")
          .select(`
            *,
            series:series_id(id, name, color_code)
          `)
          .eq("timeline_id", timelineId);
          
        if (seriesId) {
          eventsQuery = eventsQuery.eq("series_id", seriesId);
        }
        
        // Order by year (as text, so we need a special approach for "XX" years)
        eventsQuery = eventsQuery.order("year");
        
        const { data: events, error: eventsError } = await eventsQuery;
        
        if (eventsError) {
          throw eventsError;
        }
        
        data = events;
        break;
        
      case "createFanTimeline":
        // Create a new fan timeline
        const { title, description, creatorId } = await req.json();
        
        const { data: newTimeline, error: createError } = await supabaseClient
          .from("timelines")
          .insert({
            title,
            description,
            is_official: false,
            creator_id: creatorId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();
          
        if (createError) {
          throw createError;
        }
        
        data = newTimeline[0];
        break;
        
      case "addTimelineEvent":
        // Add an event to a timeline
        const eventData = await req.json();
        
        const { data: newEvent, error: addEventError } = await supabaseClient
          .from("timeline_events")
          .insert({
            timeline_id: eventData.timelineId,
            title: eventData.title,
            description: eventData.description,
            year: eventData.year,
            series_id: eventData.seriesId,
            importance: eventData.importance || 1,
            created_at: new Date().toISOString(),
          })
          .select();
          
        if (addEventError) {
          throw addEventError;
        }
        
        data = newEvent[0];
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