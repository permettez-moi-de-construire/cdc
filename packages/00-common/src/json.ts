type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>

export type JSONParser<T = JSONValue> = (x: JSONValue) => T

const parse = <T = JSONValue>(x: string, p: JSONParser<T>): T => {
  const jsonParsed: JSONValue = JSON.parse(x)
  const valueParsed = p(jsonParsed)
  return valueParsed
}

const stringify = JSON.stringify

const TypeJSON = {
  parse,
  stringify,
}

export { JSONValue, parse, stringify }
export default TypeJSON
