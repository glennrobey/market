import express from "express";
import usersRouter from "#routes/users";
import productsRouter from "#routes/products";
import ordersRouter from "#routes/orders";

const app = express();

app.use(express.json());

app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);

export default app;
