import prompt from "prompt";
import pool from "./database.js";
import minimist from "minimist";

// Initialize the prompt module
prompt.start();

const addOrUpdateProduct = async (name, price, id, quantity) => {
  const client = await pool.connect(); //pool.connection method acquires a client from the connection pool, allowing us to perform operation with database
  try {
    const existingProduct = await client.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );
    console.log(existingProduct, "existing");
    if (existingProduct.rows.length === 0) {
      await client.query(
        "INSERT INTO products(name,price,id, quantity) VALUES($1, $2, $3, $4)",
        [name, price, id, quantity]
      );
      console.log("New product added successfully.");
    } else {
      await client.query(
        "UPDATE products SET name = $1, price = $2 , quantity =$4 WHERE id = $3",
        [name, price, id, quantity]
      );
      console.log("Product name and price updated successfully.");
    }
  } catch (error) {
    console.error("Error adding/updating product:", error);
  } finally {
    client.release();
  }
};

// Prompt for user input and execute the appropriate command
prompt.get(["name", "price", "id", "quantity"], (err, result) => {
  const { name, price, id, quantity } = result;
  addOrUpdateProduct(name, price, id, quantity);
});
