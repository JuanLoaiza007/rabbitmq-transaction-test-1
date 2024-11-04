import { connect } from "amqplib";

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

let creditCardBalance = 500; // Total disponible

(async () => {
  const connection = await connectWithRetry("amqp://user:password@rabbitmq");
  const channel = await connection.createChannel();
  const paymentQueue = "payment_queue";
  const informationQueue = "information_queue";

  await channel.assertQueue(paymentQueue, { durable: false });
  await channel.assertQueue(informationQueue, { durable: false });

  channel.consume(paymentQueue, async (msg) => {
    const { productId, quantity, totalPrice } = JSON.parse(
      msg.content.toString()
    );
    console.log(
      `Payment processing order: ${JSON.stringify({
        productId,
        quantity,
        totalPrice,
      })}`
    );

    if (creditCardBalance >= totalPrice) {
      creditCardBalance -= totalPrice;
      console.log(`Payment successful. New balance: ${creditCardBalance}`);
      channel.sendToQueue(
        informationQueue,
        Buffer.from(JSON.stringify({ status: "success", productId, quantity }))
      );
    } else {
      console.error("Insufficient funds for payment");
      // Enviar compensación a Stock
      channel.sendToQueue(
        paymentQueue,
        Buffer.from(
          JSON.stringify({ productId, quantity, totalPrice, refund: true })
        )
      );
    }
  });
})();
