"use client";

import { useEffect, useState } from "react";

export default function Home() {
const [data, setData] = useState(null);

useEffect(() => {
fetch("/api/candles")
.then((res) => res.json())
.then((json) => setData(json));
}, []);

return (
<main style={{ padding: 40, color: "white" }}> <h1>Gold Bias</h1>

```
  {!data && <p>Loading candles...</p>}

  {data && data.waiting && (
    <div style={{ marginTop: 20, color: "gold" }}>
      <p>⏳ Waiting for cTrader approval...</p>
      <p style={{ opacity: 0.7 }}>{data.message}</p>
    </div>
  )}

  {data && data.ok && (
    <div>
      <h2>Real Candles Loaded</h2>
    </div>
  )}
</main>
```

);
}
