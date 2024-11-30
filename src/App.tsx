import { useEffect, useState } from "react";
import tmi from "tmi.js";
import CountUp from "react-countup";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [prevCount, setPrevCount] = useState(count);
  useEffect(() => {
    const supabase = createClient<Database>(
      import.meta.env.VITE_PUBLIC_SUPABASE_URL,
      import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
    );

    const client = new tmi.Client({
      channels: ["paymoneywubby"],
    });

    client.connect();

    function messageCounter(message: string): number {
      if (message.trim().startsWith("+2")) {
        setCount((pc) => {
          setPrevCount(pc);
          return pc + 2;
        });
        return 2;
      }
      if (message.trim().startsWith("-2")) {
        setCount((pc) => {
          setPrevCount(pc);
          return pc - 2;
        });
        return -2;
      }
      return 0;
    }

    const messageQueue: Map<string, [string, string]> = new Map();
    client.on("message", (_channel, tags, message, _self) => {
      console.log(`${tags["display-name"]}: ${message}`);
      messageQueue.set(new Date().toUTCString(), [tags["display-name"] || "", message]);
    });

    setInterval(async () => {
      if (messageQueue.size > 0) {
        for (const msg of messageQueue) {
          const change = messageCounter(msg[1][1]);
          if (change === 0) {
            continue;
          }
          await supabase.from("chat").insert({
            created_at: msg[0],
            username: msg[1][0],
            message: msg[1][1],
            value: change,
          });
        }
        messageQueue.clear();
      }
    }, 2000);
  }, []);

  return (
    <>
      <CountUp
        start={prevCount}
        end={count}
        duration={2}
        className="text-outline"
      />
    </>
  );
}

export default App;
