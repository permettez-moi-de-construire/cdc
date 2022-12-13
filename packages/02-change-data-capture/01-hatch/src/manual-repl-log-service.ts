import { Parser } from "binary-parser";

// Define the structure of the pgoutput message
// using the binary-parser library
const PgOutputParser = new Parser()
  .endianess("big")
  .uint8("type")
  .uint32("length")
  .buffer("data", {
    length: "length",
  });

// Create a function that takes a Buffer containing
// a pgoutput message and decodes it into an object
function decodePgOutput(buffer: Buffer): any {
  // Parse the binary data into an object using our parser
  const data = PgOutputParser.parse(buffer);

  // Return the decoded object
  return data;
}
