import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user and verify admin
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError || !roleData) {
      throw new Error('Admin access required')
    }

    // Fetch all blog posts without featured images or with null images
    const { data: posts, error: postsError } = await supabaseClient
      .from('blog_posts')
      .select('id, title, slug, excerpt, featured_image_url')
      .or('featured_image_url.is.null,featured_image_url.eq.')
      .order('created_at', { ascending: false })

    if (postsError) throw postsError

    console.log(`Found ${posts.length} posts needing images`)

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured')

    const results = []

    for (const post of posts) {
      try {
        console.log(`Generating image for: ${post.title}`)

        // Create a detailed prompt based on the blog post title and excerpt
        const imagePrompt = `Create a professional, realistic photograph for a blog post titled "${post.title}". ${post.excerpt ? post.excerpt.substring(0, 200) : ''}. The image should be suitable for a financial planning and budgeting website, with warm, inviting tones. Ultra high resolution, professional photography style.`

        // Generate image using Lovable AI
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [
              {
                role: 'user',
                content: imagePrompt
              }
            ],
            modalities: ['image', 'text']
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Image generation failed for ${post.title}:`, errorText)
          results.push({
            post_id: post.id,
            title: post.title,
            success: false,
            error: `Image generation failed: ${response.status}`
          })
          continue
        }

        const data = await response.json()
        const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url

        if (!imageUrl) {
          console.error('No image URL returned for:', post.title)
          results.push({
            post_id: post.id,
            title: post.title,
            success: false,
            error: 'No image URL returned'
          })
          continue
        }

        // Convert base64 to blob
        const base64Data = imageUrl.split(',')[1]
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
        
        // Upload to storage
        const fileName = `blog-${post.slug}-${Date.now()}.png`
        const { data: uploadData, error: uploadError } = await supabaseClient
          .storage
          .from('goal-images')
          .upload(fileName, binaryData, {
            contentType: 'image/png',
            upsert: true
          })

        if (uploadError) {
          console.error('Upload error for', post.title, ':', uploadError)
          results.push({
            post_id: post.id,
            title: post.title,
            success: false,
            error: `Upload failed: ${uploadError.message}`
          })
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseClient
          .storage
          .from('goal-images')
          .getPublicUrl(fileName)

        // Update blog post with new image URL and optimized SEO metadata
        const { error: updateError } = await supabaseClient
          .from('blog_posts')
          .update({
            featured_image_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id)

        if (updateError) {
          console.error('Update error for', post.title, ':', updateError)
          results.push({
            post_id: post.id,
            title: post.title,
            success: false,
            error: `Update failed: ${updateError.message}`
          })
          continue
        }

        console.log(`Successfully generated and saved image for: ${post.title}`)
        results.push({
          post_id: post.id,
          title: post.title,
          success: true,
          image_url: publicUrl
        })

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        console.error(`Error processing ${post.title}:`, error)
        results.push({
          post_id: post.id,
          title: post.title,
          success: false,
          error: error.message
        })
      }
    }

    // Trigger sitemap regeneration
    try {
      await supabaseClient.functions.invoke('generate-sitemap')
      console.log('Sitemap updated after image generation')
    } catch (sitemapError) {
      console.error('Failed to update sitemap:', sitemapError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${results.length} blog posts`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in generate-blog-images:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
