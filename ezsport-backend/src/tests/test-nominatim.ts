// @ts-ignore
import fetch from "node-fetch";

async function main() {
  const lat = 16.039326222557026;
  const lng = 108.23729340495596;
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
  
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept-Language": "vi"
    }
  });
  const data = await res.json();
  console.log("Full Nominatim Response:", JSON.stringify(data, null, 2));
}

main();
