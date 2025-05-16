import dotenv from "dotenv";
dotenv.config();

async function main() {
  const payload = {
    email: "test@example.com",
    city: "Berlin",
    frequency: "hourly",
  };

  const res = await fetch(`${process.env.APP_URL}/api/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log("Status:", res.status);
  console.log("Response:", await res.json());
}

main().catch((err) => {
  console.error("Error:", err);
});
