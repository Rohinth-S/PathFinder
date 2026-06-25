import fs from "fs";
import path from "path";

async function main(): Promise<void> {

  const audioPath = path.resolve("./Sarovar Enclave Road.m4a");
  const audioBuffer = fs.readFileSync(audioPath);
  const formData = new FormData();
  formData.append("audio",new Blob([audioBuffer],{type: "audio/mp4",}),"Sarovar Enclave Road.m4a");
  console.time("query");

  const response = await fetch(
    "http://localhost:5000/api/query",
    {
      method: "POST",
      body: formData,
    }
  );
  console.timeEnd("query");

  const result =
    await response.json();

  console.dir(
    result,
    { depth: null }
  );
}

main().catch(console.error);