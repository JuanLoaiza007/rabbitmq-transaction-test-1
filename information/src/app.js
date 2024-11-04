import { connect } from "amqplib";

const informationQueue = "payment_to_information";
const compensationQueue = "compensate_information";

async function processInformation(msg) {
  const order = JSON.parse(msg.content.toString());

  try {
    console.log(`[Information] Order completed successfully:`, order);
  } catch (error) {
    console.error("[Information] Failed to log information, compensating...");
    await sendMessage(compensationQueue, {
      ...order,
      status: "failed_information",
    });
  }
}

(async () => {
  const connection = await connect("amqp://user:password@rabbitmq");
  const channel = await connection.createChannel();
  await channel.assertQueue(informationQueue, { durable: false });
  await channel.consume(informationQueue, processInformation, { noAck: true });
})();
