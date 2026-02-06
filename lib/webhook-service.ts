type WebhookAction = "APPROVE" | "REJECT" | "DIRECT";
type WebhookType = "PROPOSAL" | "INCIDENT" | "DIRECTIVE";

interface WebhookPayload {
  type: WebhookType;
  action: WebhookAction;
  title: string;
  content?: string;
}

export const sendWebhook = async (payload: WebhookPayload) => {
  const webhookUrl = process.env.N8N_WEBHOOK_DIRECT_URL;

  if (!webhookUrl) {
    console.warn("[Webhook] URL not configured");
    return;
  }

  try {
    // Fire-and-forget, simple fetch
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => console.error("[Webhook] Request failed", err));
  } catch (error) {
    console.error("[Webhook] Error sending webhook", error);
  }
};
