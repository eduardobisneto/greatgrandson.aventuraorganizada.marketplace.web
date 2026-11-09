/**
 * URL base da marketplace.api consumida pela marketplace.web. Em produção,
 * aponte para o serviço real via variável de ambiente injetada no build
 * (VITE_MARKETPLACE_API_URL) — o default abaixo assume o serviço rodando
 * localmente (ver esquema de portas da família: identity.api=5000,
 * marketplace.api=5001, viagens.api=5002, ...).
 *
 * Mesma convenção usada pela prestadores.web (ver
 * src/lib/api-config.ts::VIAGENS_API_URL nesse repo-irmão).
 */
export const MARKETPLACE_API_URL =
  import.meta.env["VITE_MARKETPLACE_API_URL"] ?? "http://localhost:5001";
