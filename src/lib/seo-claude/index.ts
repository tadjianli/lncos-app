export {
  PROTECTED_PRODUCT_FIELDS,
  buildReadOnlyProductSeoContext,
  formatContextForPrompt,
} from "./context";
export type {
  ReadOnlyProductSeoContext,
  ProductSeoAnalysisResult,
  ProductSeoOptimizationResult,
} from "./context";
export { analyzeProductSeoWithClaude, optimizeProductSeoWithClaude } from "./service";
export type { SeoClaudeConfig, SeoClaudeMeta } from "./service";
export { applySeoOptimizationPatch, assertSeoOnlyPatch } from "./apply";
