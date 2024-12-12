import { useEffect, useRef, useState } from "react";
import tmi from "tmi.js";
import CountUp from "react-countup";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

import "./App.css";

import { socket } from "./socket";


function App() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef<number>(0);

  useEffect(() => {
    const fetchInitialCount = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/count/total");
        const data = await response.json();
        setCount(data);
        prevCountRef.current = data;
      } catch (error) {
        console.error("Error fetching initial count:", error);
      }
    };

    fetchInitialCount();
  }, []);
  useEffect(() => {
    // Listen for change
    socket.on("change", (change) => {
      console.log("change", change);
      setCount((count) => count + change);
    });

    return () => {
      socket.off("change");
    };
  }, []);

  useEffect(() => {
    /**
     * assign the latest render value of count to the ref
     * However, assigning a value to ref doesn't re-render the app
     * So, prevCountRef.current in the return statement displays the
     * last value in the ref at the time of render i.e., the previous state value.
     */
    prevCountRef.current = count;
  }, [count]); //run this code when the value of count changes

  return (
    <>
      <CountUp
        start={prevCountRef.current}
        end={count}
        duration={2}
        className="text-outline"
      />
    </>
  );
}

export default App;
