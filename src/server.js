// import prompt from "prompt";
import prompt from "prompt";
import pool from "./database.js";

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

const purchaseProduct = async (quantity, price, id) => {
  const client = await pool.connect();

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

    // Check if there is enough quantity available for purchase
    if (product.quantity < quantity) {
      console.log("Insufficient quantity available for purchase.");
      return;
    }

    // Calculate the total cost
    const totalCost = quantity * price;

    // Deduct the purchased quantity from the available stock
    const newQuantity = product.quantity - quantity;
    await client.query("UPDATE products SET quantity = $1 WHERE id = $2", [
      newQuantity,
      id,
    ]);

    // Record the purchase transaction in an "orders" table (assuming you have one)
    await client.query(
      "INSERT INTO orders (id, quantity, total_cost) VALUES ($1, $2, $3)",
      [id, quantity, totalCost]
    );

    console.log(`Purchase successful. Total cost: $${totalCost}`);
  } catch (error) {
    console.error("Error purchasing product:", error);
  } finally {
    client.release();
  }
};

// Prompt for user input and execute the appropriate command
prompt.get(["command"], (err, result) => {
  const command = result.command;
  switch (command) {
    case "product:save":
      prompt.get(["name", "price", "id", "quantity"], (err, result) => {
        const { name, price, id } = result;
        addOrUpdateProduct(name, price, id);
      });
      break;
    case "product:purchase":
      prompt.get(["quantity", "price", "id"], (err, result) => {
        const { quantity, price, id } = result;
        purchaseProduct(quantity, price, id);
      });
      break;
    case "product:order":
      prompt.get(["quantity", "id"], (err, result) => {
        const { quantity, id } = result;
        placeOrder(quantity, id);
      });
      break;
    // ... handle other commands ...
    default:
      console.log("Invalid command.");
  }
});

// const saveProducts = async () => {
//   prompt.get(["name", "price", "id"], function (error, result) {
//     if (error) {
//       console.log(error, "error");
//     }
//     product.name = result.name;
//     product.price = result.price;
//     product.id = result.id;
//     console.log(product, "product");

//     const existingProductIndex = products.findIndex((p) => p.id === product.id); //findIndex method makes the callback function as an argument and iterates through the array elements one by one.
//     //"p" represents the individual element is the products array
//     //callback function checks if the product element's id (p.id) is equal to the id property of the product object i want to find (product.id)
//     //If a match is found (i.e., if p.id is equal to product.id), the findIndex method returns the index of that element in the array. If no match is found, it returns -1

//     if (existingProductIndex !== -1) {
//       products[existingProductIndex] = product;
//     } else {
//       products.push(product);
//       console.log("product saved successfully");
//     }
//   });
// };

// // Handle command line arguments
// const args = process.argv.slice(2);

// if (args[0] === "product:save") {
//   saveProducts();
// } else {
//   console.log(
//     'Invalid command. Use "npm run product:save" to add/update a product.'
//   );
// }
