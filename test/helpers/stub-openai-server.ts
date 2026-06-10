import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

export interface CapturedRequest {
  authorization?: string;
  body: unknown;
}

export interface StubOpenAIServer {
  url: string;
  requests: CapturedRequest[];
  close(): Promise<void>;
  enqueue(payload: unknown, status?: number): void;
}

export async function createStubOpenAIServer(initialPayloads: unknown[] = []): Promise<StubOpenAIServer> {
  const queue = initialPayloads.map((payload) => ({ payload, status: 200 }));
  const requests: CapturedRequest[] = [];
  const server = createServer(async (req, res) => {
    await handleRequest(req, res, queue, requests);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (typeof address !== "object" || address === null) {
    throw new Error("server did not bind to a TCP port");
  }
  return {
    url: `http://127.0.0.1:${address.port}/v1`,
    requests,
    enqueue(payload: unknown, status = 200) {
      queue.push({ payload, status });
    },
    close() {
      return closeServer(server);
    },
  };
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  queue: Array<{ payload: unknown; status: number }>,
  requests: CapturedRequest[],
): Promise<void> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  requests.push({
    ...(req.headers.authorization === undefined ? {} : { authorization: req.headers.authorization }),
    body: text === "" ? {} : JSON.parse(text),
  });
  const next = queue.shift() ?? { status: 200, payload: completion("default stub") };
  res.writeHead(next.status, { "content-type": "application/json" });
  res.end(JSON.stringify(next.payload));
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error !== undefined) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

export function completion(text: string): unknown {
  return {
    id: "chatcmpl_stub",
    object: "chat.completion",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: "stop",
      },
    ],
    usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
  };
}

export function toolCall(name: string, args: string): unknown {
  return {
    id: "chatcmpl_tool",
    object: "chat.completion",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call_1",
              type: "function",
              function: { name, arguments: args },
            },
          ],
        },
        finish_reason: "tool_calls",
      },
    ],
  };
}
