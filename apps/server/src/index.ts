import { __prod__ } from "./utils/contants";
import { app } from "./app";
import { configuration } from "./utils/configuration";

const port = configuration.port;
app.listen(port, () => {
  console.log(`~~~~ Server Started ~~~~`);
  if (!__prod__) {
    console.log(`**** VISIT: http://localhost:${port} ****`);
  }
});

export default app;
