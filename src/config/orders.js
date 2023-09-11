import prompt from "prompt";
import pool from "./database.js";

// Initialize the prompt module
prompt.start();

// Function to buy products from the cart
const placeOrder = async (quantity, id) => {
  const client = await pool.connect();

  try {
    // Check if the product exists in the cart
    const purchaseQuery = await client.query(
      "SELECT * FROM purchase WHERE product_id = $1",
      [id]
    );

    if (purchaseQuery.rows.length === 0) {
      console.log("Product not found in the cart.");
      return;
    }

    const cartProduct = purchaseQuery.rows[0];

    // Check if there is enough quantity in the cart for the order
    if (cartProduct.quantity < quantity) {
      console.log("Insufficient quantity in the cart for this order.");
      return;
    }

    // Calculate the total cost
    const totalCost = quantity * cartProduct.price;

    // Deduct the ordered quantity from the cart
    const newQuantity = cartProduct.quantity - quantity;
    await client.query(
      "UPDATE purchase SET quantity = $1 WHERE product_id = $2",
      [newQuantity, id]
    );

    // Insert a record into the "orders" table
    await client.query(
      "INSERT INTO orders (product_id, quantity, total_cost) VALUES ($1, $2, $3 )",
      [id, quantity, totalCost]
    );

    console.log(`Order placed for product. Total cost: $${totalCost}`);
  } catch (error) {
    console.error("Error placing order:", error);
  } finally {
    client.release();
  }
};

prompt.get(["quantity", "price", "id"], (err, result) => {
  const { id, quantity } = result;
  placeOrder(quantity, id);
});
