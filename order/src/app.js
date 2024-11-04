import { connect } from "amqplib";
import express from "express";

const app = express();
app.use(express.json());

const orderQueue = "order_to_stock";

async function sendMessage(queue, message) {
  const connection = await connect("amqp://user:password@rabbitmq");
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  console.log(`[Order] Sent order to ${queue}:`, message);
}

app.post("/order", async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity) {
    return res
      .status(400)
      .json({ error: "Product ID and quantity are required" });
  }

  const order = {
    orderId: new Date().getTime(),
    productId,
    quantity,
    status: "pending",
  };

  try {
    await sendMessage(orderQueue, order);
    res.status(200).json({ message: "Order sent to stock service" });
  } catch (error) {
    console.error("[Order] Error sending order:", error);
    res.status(500).json({ error: "Failed to send order" });
  }
});

app.listen(3000, () => console.log("Order service listening on port 3000"));
