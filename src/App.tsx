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

    function messageCounter(message: string) {
      if (message.trim().startsWith("+2")) {
        setCount((pc) => {
          setPrevCount(pc);
          return pc + 2
      });
      } else if (message.trim().startsWith("-2")) {
        setCount((pc) => {
          setPrevCount(pc);
          return pc - 2
      });
      }
    }

    client.on("message", (_channel, tags, message, _self) => {
      console.log(`${tags["display-name"]}: ${message}`);
      messageCounter(message);
    });

    // Cleanup function to disconnect the client when the component unmounts
    return () => {
      client.disconnect();
    };
  }, []); // Empty dependency array ensures this runs only once


  return (
    <>
      <CountUp start={prevCount} end={count} duration={1} className="text-outline"/>
    </>
  );
}

export default App;
