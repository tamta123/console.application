import prompt from "prompt";
import pool from "./database.js";

// Initialize the prompt module
prompt.start();

// Function to purchase a product and add it to a cart
const purchaseProduct = async (quantity, price, id) => {
  const client = await pool.connect();
  console.log(id);

  try {
    // Check if the product exists
    const productQuery = await client.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );

    if (productQuery.rows.length === 0) {
      console.log("Product not found.");
      return;
    }

    const product = productQuery.rows[0];
    console.log(product);
    console.log("productId:", id);
    console.log("product.quantity:", product.quantity);

    // Check if there is enough quantity available for purchase
    if (product.quantity < quantity) {
      console.log("Insufficient quantity available for purchase.");
      return;
    }

    // Calculate the total cost
    const totalCost = quantity * price;

    // Deduct the purchased quantity from the available stock in the "products" table
    const newQuantity = product.quantity - quantity;
    await client.query("UPDATE products SET quantity = $1 WHERE id = $2", [
      newQuantity,
      id,
    ]);

    // Insert a record into the "purchase" table
    await client.query(
      "INSERT INTO purchase (id, product_id, quantity, price, total_cost) VALUES ($1, $2, $3, $4, $5)",
      [id, product_id, quantity, price, totalCost]
    );

    console.log(`Product added to cart. Total cost in cart: $${totalCost}`);
  } catch (error) {
    console.error("Error adding product to cart:", error);
  } finally {
    client.release();
  }
};

prompt.get(["quantity", "price", "id"], (err, result) => {
  const { quantity, price, id } = result;
  purchaseProduct(quantity, price, id);
});
