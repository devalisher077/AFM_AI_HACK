import { createFileRoute } from "@tanstack/react-router";

type AgentRequest = {
  message?: unknown;
  route?: unknown;
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

const agentSystemPrompt = [
  "Ты AI-агент платформы AI Media Watch.",
  "Отвечай на русском языке кратко и по делу.",
  "Помогай аналитику разбирать источники, угрозы, отчеты и следующие действия.",
  "Если данных недостаточно, честно скажи, что нужно открыть конкретный источник или отчет.",
].join(" ");

export const Route = createFileRoute("/api/agent")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
          return Response.json(
            {
              message:
                "OPENAI_API_KEY не настроен. Добавьте ключ в .env.local и перезапустите dev-сервер.",
            },
            { status: 500 },
          );
        }

        let payload: AgentRequest;

        try {
          payload = (await request.json()) as AgentRequest;
        } catch {
          return Response.json(
            { message: "Некорректный JSON." },
            { status: 400 },
          );
        }

        const message =
          typeof payload.message === "string" ? payload.message.trim() : "";
        const route = typeof payload.route === "string" ? payload.route : "/";

        if (!message) {
          return Response.json(
            { message: "Сообщение не может быть пустым." },
            { status: 400 },
          );
        }

        const openAiResponse = await fetch(
          "https://api.openai.com/v1/responses",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: process.env.OPENAI_MODEL ?? "gpt-5.5",
              input: [
                {
                  role: "system",
                  content: agentSystemPrompt,
                },
                {
                  role: "user",
                  content: `Текущий раздел: ${route}\n\nВопрос пользователя: ${message}`,
                },
              ],
            }),
          },
        );

        const data = (await openAiResponse.json()) as OpenAIResponse;

        if (!openAiResponse.ok) {
          return Response.json(
            {
              message:
                data.error?.message ??
                "OpenAI API вернул ошибку. Проверьте ключ и модель.",
            },
            { status: openAiResponse.status },
          );
        }

        return Response.json({ message: extractOutputText(data) });
      },
    },
  },
});

function extractOutputText(data: OpenAIResponse) {
  if (data.output_text?.trim()) {
    return data.output_text.trim();
  }

  const text = data.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n")
    .trim();

  return text || "Я получил ответ, но не смог разобрать текст.";
}
