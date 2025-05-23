import { useEffect, useState } from "react";
import { getHello } from "./api/hello";

export default function Hello() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    getHello().then((res) => setMsg(res.data.message));
  }, []);
  return <div>{msg}</div>;
}