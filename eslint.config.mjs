// Next 16 ships native ESLint flat-config arrays — spread them directly.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  { ignores: [".next/**", "out/**", "node_modules/**"] },
];

export default eslintConfig;
