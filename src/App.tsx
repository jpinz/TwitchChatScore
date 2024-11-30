import { useEffect, useState } from "react";
import tmi from "tmi.js";
import CountUp from "react-countup";

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

    let messageQueue: string[] = [];

    client.on("message", (_channel, tags, message, _self) => {
      console.log(`${tags["display-name"]}: ${message}`);
      messageQueue.push(message);
    });

    setInterval(() => {
      if (messageQueue.length > 0) {
      let totalChange = 0;
      for (const msg of messageQueue) {
        totalChange += messageCounter(msg);
      }
      messageQueue = [];
      }
    }, 2000);

    // Cleanup function to disconnect the client when the component unmounts
    return () => {
      client.disconnect();
    };
  }, []); // Empty dependency array ensures this runs only once


  return (
    <>
      <CountUp start={prevCount} end={count} duration={2} className="text-outline" />
    </>
  );
}

export default App;
