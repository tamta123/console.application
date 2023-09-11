import pkg from "pg"; // pg ფექიჯს აქვს კლასი pool
import dotenv from "dotenv";
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  host: process.PGHOST,
  user: process.PGUSER,
  passWord: process.PGPASSWORD,
  dataBase: process.PGDATABASE,
  connectionString: process.env.RAILWAY_PG_CONNECTION_STRING,
});

export default pool;
