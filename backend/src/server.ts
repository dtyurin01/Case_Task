import app from "./app/app";
import "./scheduler"; 


const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
