/**
 * Configuração do AWS Cognito — documentacional apenas, não usada em
 * nenhuma chamada deste app. A marketplace.web nunca fala com o Cognito
 * (ou com a identity.api) diretamente: `src/lib/auth.ts` chama a
 * marketplace.api (POST /api/auth/sign-up e /sign-in), que repassa pra
 * identity.api, que fala com o Cognito — ver AuthController.cs na
 * marketplace.api.
 *
 * ⚠️ VALORES FAKE — os placeholders abaixo espelham os da identity.api
 * (COGNITO_USER_POOL_ID/COGNITO_CLIENT_ID), que ainda não tem um User
 * Pool real (ver "⚠️ Cognito ainda é FAKE" no README da identity.api).
 * Ficam aqui só como referência de qual User Pool o login real vai usar
 * quando esse User Pool existir — não precisam mudar nada do lado da
 * marketplace.web quando isso acontecer.
 */
export const cognitoConfig = {
  region: "us-east-1",
  userPoolId: "us-east-1_FAKEPOOL1",
  userPoolClientId: "fakeclientid00000000000000",
  domain: "aventura-organizada-fake.auth.us-east-1.amazoncognito.com",
};
