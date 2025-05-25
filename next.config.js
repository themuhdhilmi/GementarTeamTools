// next.config.mjs
import "./src/env.js";

const config = {
  output: "standalone",
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
};

export default config;
