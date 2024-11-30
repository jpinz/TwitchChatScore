import { useEffect, useState } from "react";
import tmi from "tmi.js";
import CountUp from "react-countup";
import { prisma } from "./db";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [prevCount, setPrevCount] = useState(count);

  useEffect(() => {
    const client = new tmi.Client({
      channels: ["paymoneywubby"],
    });

    client.connect();

    function messageCounter(message: string): number {
      if (message.trim().startsWith("+2")) {
        setCount((pc) => {
          setPrevCount(pc);
          return pc + 2
        });
        return 2;
      }
      if (message.trim().startsWith("-2")) {
        setCount((pc) => {
          setPrevCount(pc);
          return pc - 2
        });
        return -2;
      }
      return 0;
    }

    client.on("message", (_channel, tags, message, _self) => {
      console.log(`${tags["display-name"]}: ${message}`);
      const change = messageCounter(message);
      if (change === 0) {
        return;
      }
      prisma.chat.create({
        data: {
          username: tags["display-name"] || "unknown",
          message: message,
          value: change,
        },
      });
    });

    // Cleanup function to disconnect the client when the component unmounts
    return () => {
      client.disconnect();
      prisma.$disconnect().catch((e) => console.error(e));
    };
  }, []); // Empty dependency array ensures this runs only once


  return (
    <>
      <CountUp start={prevCount} end={count} duration={1} className="text-outline" />
    </>
  );
}

export default App;
