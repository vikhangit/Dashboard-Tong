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
    // Await the fetch call to ensure it completes before the function returns
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        `[Webhook] Request failed with status ${response.status}: ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error("[Webhook] Error sending webhook", error);
  }
};
