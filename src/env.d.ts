declare module "*.css";

declare module "*.svg" {
  const source: string;
  export default source;
}

declare module "*.jpg" {
  const source: string;
  export default source;
}

declare module "*.wasm?url" {
  const source: string;
  export default source;
}
