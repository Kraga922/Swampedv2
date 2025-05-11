
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { lat, lng } = await req.json()

    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use Nominatim for reverse geocoding (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'User-Agent': 'SafeNight App' } }
    )

    const data = await response.json()

    // Extract useful location information
    let locationName = 'Unknown location'
    
    if (data.name) {
      locationName = data.name
    } else if (data.address) {
      // Try to get the most specific place name possible
      locationName = data.address.amenity || 
                    data.address.building ||
                    data.address.leisure ||
                    data.address.shop ||
                    data.address.tourism ||
                    data.address.road ||
                    'Location'
                    
      // If it's just a road, add the neighborhood/suburb for context
      if (locationName === data.address.road && data.address.suburb) {
        locationName = `${locationName}, ${data.address.suburb}`
      }
    }

    console.log('Location lookup successful:', { locationName, raw: data })

    return new Response(
      JSON.stringify({
        name: locationName,
        address: data.address,
        display_name: data.display_name,
        raw: data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error in location lookup:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
