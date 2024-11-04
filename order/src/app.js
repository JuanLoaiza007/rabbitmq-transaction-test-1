import { connect } from "amqplib";
import http from "http";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let delay = 10000;
let retries = 3;

async function connectWithRetry(url) {
  while (retries) {
    try {
      const connection = await connect(url);
      console.log("Connected to RabbitMQ");
      return connection;
    } catch (err) {
      console.error(`Error connecting to RabbitMQ: ${err}. Retrying...`);
      retries -= 1;
      await wait(delay);
    }
  }
  throw new Error("Failed to connect to RabbitMQ after several attempts");
}

(async () => {
  const connection = await connectWithRetry("amqp://user:password@rabbitmq");
  const channel = await connection.createChannel();
  const orderQueue = "order_queue";

  await channel.assertQueue(orderQueue, { durable: false });

  const server = http.createServer((req, res) => {
    let body = "";

    if (req.method === "POST") {
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        const { productId, quantity } = JSON.parse(body);

        if (typeof productId !== "number" || typeof quantity !== "number") {
          res.writeHead(400);
          res.end("Invalid input");
          return;
        }

        channel.sendToQueue(
          orderQueue,
          Buffer.from(JSON.stringify({ productId, quantity }))
        );
        console.log(`Order sent: ${JSON.stringify({ productId, quantity })}`);
        res.writeHead(200);
        res.end("Order sent to stock");
      });
    } else {
      res.writeHead(405);
      res.end("Method Not Allowed");
    }
  });

  server.listen(3000, () => {
    console.log("Order service is listening on port 3000");
  });
})();
