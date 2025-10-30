"use client";
import { useEffect, useState } from "react";

export default function HomeComponent() {
  // Variables
  const [reply, setReply] = useState("Fetching from backend...");

  // Fetching data from api
  useEffect(() => {
    const response = fetch("/api/getText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Hello bro",
      }),
    });
    
    const data = response.then((res) => res.json());

    data.then((data) => {
      setReply(data.reply);
    });
  }, []);
  return (
    <div>
      <h1>{reply}</h1>
    </div>
  );
}
