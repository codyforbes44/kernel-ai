import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.error("Missing required fields:", { name: !!name, email: !!email, subject: !!subject, message: !!message });
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Processing contact form submission:", { name, email, subject });

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      // Dynamically import Resend when API key is available
      const { Resend } = await import("https://esm.sh/resend@2.0.0");
      const resend = new Resend(resendApiKey);
      
      const emailResponse = await resend.emails.send({
        from: "Contact Form <onboarding@resend.dev>",
        to: ["support@kernel.dev"], // Replace with actual support email
        reply_to: email,
        subject: `[Contact Form] ${subject} - from ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr/>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br/>')}</p>
        `,
      });

      console.log("Email sent successfully:", emailResponse);

      // Also send confirmation to user
      await resend.emails.send({
        from: "Kernel Support <onboarding@resend.dev>",
        to: [email],
        subject: "We received your message!",
        html: `
          <h1>Thank you for contacting us, ${name}!</h1>
          <p>We have received your message regarding "${subject}" and will get back to you as soon as possible.</p>
          <p>Best regards,<br>The Kernel Team</p>
        `,
      });

      return new Response(
        JSON.stringify({ success: true, method: "email" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      // Fallback: Log and return success when Resend is not configured
      console.log("RESEND_API_KEY not configured, logging submission");
      console.log("Contact form submission:", { name, email, subject, message: message.substring(0, 100) });

      return new Response(
        JSON.stringify({ success: true, method: "logged", note: "Email sending not configured - submission logged" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  } catch (error: any) {
    console.error("Error in send-contact function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
