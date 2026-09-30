import destinoBonitoImg from "@/assets/destino-bonito.jpeg";
import destinoSocorroImg from "@/assets/destino-socorro.jpeg";
import destinoBrotasImg from "@/assets/download.jpeg";
import destinoUbatubaImg from "@/assets/destino-ubatuba.jpeg";
import flutuacaoImg from "@/assets/flutuacao.jpeg";
import cachoeiraImg from "@/assets/cachoeira.jpeg";
import standUpPaddleImg from "@/assets/stand-up-paddle.jpeg";
import trilhaSetePraiasImg from "@/assets/trilha-sete-praias.jpeg";
import projetoTamarImg from "@/assets/projeto-tamar.jpeg";
import surfItamambucaImg from "@/assets/surf-itamambuca.jpeg";
import trilhasImg from "@/assets/trilhas.jpeg";

export interface Atracao {
  nome: string;
  descricao: string;
  imagem: string;
  alt: string;
  /** Slugs de experiências (ver src/data/experiencias.ts) oferecidas neste ponto. */
  experiencias?: string[];
}

export interface NumeroDestino {
  valor: string;
  label: string;
}

export interface Estado {
  nome: string;
  sigla: string;
}

export type TipoViagem = "Família" | "Grupo" | "Individual";

export interface Destino {
  slug: string;
  nome: string;
  /** País > Estado > Destino — usado no menu de navegação agrupado. Só Brasil por enquanto. */
  pais: string;
  estado: Estado;
  /**
   * Tipo do roteiro em destaque desse destino na home (ver Hero.tsx) —
   * "Viagem em Família para Bonito · 4 noites" em vez de um título
   * genérico. Um destino pode ter vários roteiros no futuro; por
   * enquanto, um tipo fixo por destino.
   */
  tipoViagem: TipoViagem;
  tagline: string;
  descricao: string;
  imagem: string;
  alt: string;
  duracao: string;
  grupo: string;
  incluso: string[];
  /**
   * Subconjuntos de INTERESSES_DISPONIVEIS / INCLUSOS_DISPONIVEIS (ver
   * src/lib/trip-plan.ts) relevantes para este destino — usados para
   * filtrar as opções mostradas no formulário de planejar viagem (não faz
   * sentido oferecer "Experiência Aérea" para Ubatuba, por exemplo).
   */
  interessesDisponiveis: string[];
  inclusosDisponiveis: string[];
  mapsQuery: string;
  mapsZoom: number;
  atracoes: Atracao[];
  totalAtracoes?: number;
  historia: string[];
  numeros: NumeroDestino[];
}

export const destinos: Destino[] = [
  {
    slug: "bonito",
    nome: "Bonito, MS",
    pais: "Brasil",
    estado: { nome: "Mato Grosso do Sul", sigla: "MS" },
    tipoViagem: "Família",
    tagline: "Águas cristalinas e grutas",
    descricao:
      "Roteiro completo por flutuações em rios de águas transparentes, grutas e cachoeiras na capital brasileira do ecoturismo.",
    imagem: destinoBonitoImg,
    alt: "Rio de águas cristalinas cercado por vegetação em Bonito, MS",
    duracao: "4 dias / 3 noites",
    grupo: "Grupos de até 15 pessoas",
    incluso: [
      "Mobilidade ida e volta",
      "Estadia com café da manhã",
      "Passeios e experiências culturais do roteiro",
      "Acompanhamento durante toda a viagem",
    ],
    interessesDisponiveis: ["Aventura", "Natureza", "Gastronomia"],
    inclusosDisponiveis: [
      "Experiência Aérea",
      "Experiências de Estadia",
      "Mobilidade",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    mapsQuery: "Bonito, MS, Brasil",
    mapsZoom: 7,
    atracoes: [
      {
        nome: "Porto da Ilha",
        descricao:
          "Point à beira do rio, ideal para passeio de barco e para curtir a paisagem com tranquilidade.",
        imagem: destinoBonitoImg,
        alt: "Foto ilustrativa do Porto da Ilha, em Bonito",
      },
      {
        nome: "Nascente Azul",
        descricao:
          "Nascente de águas azul-turquesa, ótima para flutuação e observação da vida aquática bem de perto.",
        imagem: flutuacaoImg,
        alt: "Foto ilustrativa de flutuação em nascente de águas cristalinas",
        experiencias: ["flutuacao"],
      },
      {
        nome: "Ceita Corê",
        descricao:
          "Parque com trilhas, cânions e piscinas naturais, ótima opção para quem gosta de caminhar em contato com a natureza.",
        imagem: destinoBonitoImg,
        alt: "Foto ilustrativa do parque Ceita Corê, em Bonito",
        experiencias: ["trilhas"],
      },
      {
        nome: "Parque Ecológico",
        descricao:
          "Point sobre o Rio Formoso, no centro da cidade, ideal para observar peixes e relaxar em contato com a natureza.",
        imagem: destinoBonitoImg,
        alt: "Foto ilustrativa do Parque Ecológico do Rio Formoso, em Bonito",
      },
      {
        nome: "Balneário do Sol",
        descricao:
          "Balneário de água doce, ótimo para refrescar e passar o dia em família entre um passeio e outro.",
        imagem: destinoBonitoImg,
        alt: "Foto ilustrativa do Balneário do Sol, em Bonito",
      },
    ],
    totalAtracoes: 60,
    historia: [
      "Por décadas, Bonito foi só mais uma cidade agropecuária no interior do Mato Grosso do Sul, cercada pela Serra da Bodoquena — até descobrir que suas águas escondiam um tesouro que mudaria a cidade para sempre.",
      "Na virada dos anos 1990, Bonito apostou em um modelo de turismo controlado e sustentável: número limitado de visitantes por atrativo, guia obrigatório em todos os passeios e fiscalização ambiental séria — tudo pensado para proteger a natureza e, ao mesmo tempo, receber famílias com a segurança e a estrutura que uma viagem inesquecível exige.",
      "O cuidado deu tão certo que Bonito virou referência mundial em ecoturismo sustentável — e também um dos destinos preferidos por famílias brasileiras, pela combinação rara de aventura leve, natureza preservada e passeios pensados para todas as idades, das crianças aos avós.",
      "Não é à toa que quem visita Bonito uma vez, volta: é o tipo de viagem que vira história contada por anos na roda da família — um lugar feito para ser lembrado para a vida toda.",
    ],
    numeros: [
      { valor: "~22 mil", label: "habitantes" },
      { valor: "60+", label: "atrações turísticas" },
      { valor: "desde 1995", label: "turismo com visitação controlada" },
    ],
  },
  {
    slug: "socorro",
    nome: "Socorro, SP",
    pais: "Brasil",
    estado: { nome: "São Paulo", sigla: "SP" },
    tipoViagem: "Grupo",
    tagline: "A capital do turismo de aventura",
    descricao:
      "Trilhas, tirolesas, rafting e cachoeiras a poucas horas de São Paulo, com estrutura completa para todos os níveis de aventura.",
    imagem: destinoSocorroImg,
    alt: "Paisagem de montanhas e vegetação em Socorro, SP",
    duracao: "3 dias / 2 noites",
    grupo: "Grupos de até 20 pessoas",
    incluso: [
      "Mobilidade ida e volta",
      "Estadia com café da manhã",
      "Passeios e experiências culturais do roteiro",
      "Acompanhamento durante toda a viagem",
    ],
    interessesDisponiveis: ["Aventura", "Natureza"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Lazer",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    mapsQuery: "Socorro, SP, Brasil",
    mapsZoom: 7,
    atracoes: [
      {
        nome: "Parque dos Sonhos",
        descricao:
          "Um dos maiores parques de aventura do Brasil, com tirolesa, rafting, escalada, cavalgada, quadriciclo e paintball, além de trilhas com vista para o vale.",
        imagem: destinoSocorroImg,
        alt: "Foto ilustrativa do Parque dos Sonhos, em Socorro",
        experiencias: [
          "tirolesa",
          "rafting",
          "escalada",
          "trilhas",
          "cavalgada",
          "quadriciclo",
          "paintball",
        ],
      },
      {
        nome: "Monjolinho",
        descricao:
          "Point com estrutura completa de esportes de aventura: escalada, rapel, rafting, arvorismo, caiaque e cachoeira, tudo em um só lugar.",
        imagem: destinoSocorroImg,
        alt: "Foto ilustrativa do Monjolinho, em Socorro",
        experiencias: [
          "escalada",
          "rapel",
          "rafting",
          "arvorismo",
          "caiaque",
          "cachoeiras",
        ],
      },
      {
        nome: "Cachoeira do Paraíso",
        descricao:
          "Cachoeira com piscina natural cercada de mata, ótima para refrescar depois de um dia de trilhas.",
        imagem: cachoeiraImg,
        alt: "Foto ilustrativa de cachoeira com piscina natural",
        experiencias: ["cachoeiras"],
      },
      {
        nome: "Lago dos Espelhos",
        descricao:
          "Represa que vira praia de água doce na cidade, com areia e estrutura para passar o dia em família.",
        imagem: destinoSocorroImg,
        alt: "Foto ilustrativa do Lago dos Espelhos, em Socorro",
        experiencias: ["praias"],
      },
    ],
    historia: [
      "Socorro nasceu no século 18 como povoado ligado à mineração e, mais tarde, à cultura do café, na região serrana ao norte de Campinas — uma cidade tranquila de arquitetura colonial e clima ameno.",
      "Nos anos 1990, Socorro reinventou seu relevo montanhoso e transformou trilhas e paredões em uma estrutura de turismo de aventura pensada para todos os níveis, do iniciante em família ao aventureiro mais experiente.",
      "O investimento contínuo em segurança e infraestrutura rendeu à cidade o título oficial de Capital Nacional do Turismo de Aventura — e fez de Socorro um dos destinos preferidos de famílias que buscam adrenalina com tranquilidade, sabendo que cada passeio segue protocolos rígidos de segurança.",
      "É um lugar onde pais reencontram a coragem da infância e filhos descobrem que aventura pode ser em família — memórias que ficam muito depois da viagem terminar.",
    ],
    numeros: [
      { valor: "~38 mil", label: "habitantes" },
      { valor: "4", label: "principais pontos de aventura" },
      { valor: "desde os anos 1990", label: "polo de turismo de aventura" },
    ],
  },
  {
    slug: "brotas",
    nome: "Brotas, SP",
    pais: "Brasil",
    estado: { nome: "São Paulo", sigla: "SP" },
    tipoViagem: "Grupo",
    tagline: "Rios, cachoeiras e adrenalina",
    descricao:
      "Rafting, bóia-cross, tirolesas e cachoeiras em um dos points de esportes de aventura mais completos do interior paulista.",
    imagem: destinoBrotasImg,
    alt: "Foto ilustrativa do destino Brotas, SP",
    duracao: "3 dias / 2 noites",
    grupo: "Grupos de até 20 pessoas",
    incluso: [
      "Mobilidade ida e volta",
      "Estadia com café da manhã",
      "Passeios e experiências culturais do roteiro",
      "Acompanhamento durante toda a viagem",
    ],
    interessesDisponiveis: ["Aventura", "Natureza"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Lazer",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    mapsQuery: "Brotas, SP, Brasil",
    mapsZoom: 7,
    atracoes: [
      {
        nome: "Parque de Aventuras e Ecoturismo",
        descricao:
          "Estrutura completa de esportes de aventura com rafting, bóia-cross, tirolesas e trilhas, reunindo boa parte do ecoturismo de Brotas em um só lugar.",
        imagem: destinoBrotasImg,
        alt: "Foto ilustrativa do Parque de Aventuras e Ecoturismo, em Brotas",
        experiencias: ["rafting", "tirolesa", "trilhas"],
      },
      {
        nome: "Rio Jacaré-Pepira",
        descricao:
          "Palco do rafting e do bóia-cross que colocaram Brotas no mapa dos esportes de aventura no Brasil.",
        imagem: standUpPaddleImg,
        alt: "Foto ilustrativa de esporte de aventura em rio",
        experiencias: ["rafting"],
      },
      {
        nome: "Cachoeira Véu da Noiva",
        descricao:
          "Queda d'água cercada de mata fechada, com trilha de acesso e poço para banho.",
        imagem: cachoeiraImg,
        alt: "Foto ilustrativa da Cachoeira Véu da Noiva, em Brotas",
        experiencias: ["cachoeiras"],
      },
      {
        nome: "Balneário Municipal",
        descricao:
          "Área de lazer às margens do rio, com estrutura para famílias e grupos passarem o dia.",
        imagem: destinoBrotasImg,
        alt: "Foto ilustrativa do Balneário Municipal de Brotas",
      },
    ],
    historia: [
      "Brotas surgiu no século 19 como cidade ligada à cultura do café e, mais tarde, à citricultura, no interior paulista — cortada pelo Rio Jacaré-Pepira, o mesmo rio que décadas depois mudaria seu destino.",
      "Nos anos 1990, moradores enxergaram nas corredeiras do rio o potencial para o rafting, então uma novidade no Brasil, e começaram, aos poucos, a montar a estrutura que hoje recebe visitantes com segurança e conforto.",
      "O crescimento foi rápido, e Brotas se tornou uma das principais referências do país em turismo de aventura — reconhecida por famílias e grupos de amigos como um destino onde é possível viver adrenalina de verdade sem abrir mão de conforto e cuidado.",
      'Depois de conhecer Brotas, é comum ouvir a mesma frase: "precisamos voltar" — sinal de que a cidade conquistou um lugar cativo no roteiro de férias de muita gente.',
    ],
    numeros: [
      { valor: "~24 mil", label: "habitantes" },
      { valor: "4", label: "principais pontos de aventura" },
      { valor: "desde os anos 1990", label: "pioneira do rafting no Brasil" },
    ],
  },
  {
    slug: "ubatuba",
    nome: "Ubatuba, SP",
    pais: "Brasil",
    estado: { nome: "São Paulo", sigla: "SP" },
    tipoViagem: "Família",
    tagline: "Praias e trilhas na Mata Atlântica",
    descricao:
      "Mais de 100 praias, trilhas na mata atlântica preservada e passeios de barco até ilhas e piscinas naturais no litoral norte de SP.",
    imagem: destinoUbatubaImg,
    alt: "Praia de areia clara cercada por mata atlântica e mar em Ubatuba, SP",
    duracao: "4 dias / 3 noites",
    grupo: "Grupos de até 15 pessoas",
    incluso: [
      "Mobilidade ida e volta",
      "Estadia com café da manhã",
      "Passeios e experiências culturais do roteiro",
      "Acompanhamento durante toda a viagem",
    ],
    interessesDisponiveis: ["Praia", "Natureza", "Aventura"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Experiências Culturais e de Entretenimento",
      "Lazer",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    mapsQuery: "Ubatuba, SP, Brasil",
    mapsZoom: 7,
    atracoes: [
      {
        nome: "Trilha das Sete Praias",
        descricao:
          "Trilha à beira-mar que liga sete praias diferentes, com mirantes ao longo do caminho — um dos programas mais conhecidos de Ubatuba para quem gosta de caminhar de praia em praia.",
        imagem: trilhaSetePraiasImg,
        alt: "Foto ilustrativa da Trilha das Sete Praias, em Ubatuba",
        experiencias: ["trilhas", "praias"],
      },
      {
        nome: "Projeto Tamar",
        descricao:
          "Base de conservação de tartarugas marinhas aberta para visitação, com tanques e exposições educativas sobre a preservação das espécies que desovam no litoral de Ubatuba.",
        imagem: projetoTamarImg,
        alt: "Foto ilustrativa da região costeira próxima ao Projeto Tamar, em Ubatuba",
      },
      {
        nome: "Aulas de surfe em Itamambuca",
        descricao:
          "Itamambuca é uma das praias mais famosas do surfe brasileiro, com escolinhas de surfe para todos os níveis, de iniciantes a mais experientes.",
        imagem: surfItamambucaImg,
        alt: "Foto ilustrativa da praia de Itamambuca, em Ubatuba",
        experiencias: ["aulas-de-surf", "praias"],
      },
    ],
    historia: [
      "Ubatuba fica no litoral norte de São Paulo, onde a Serra do Mar avança quase até o oceano, formando mais de 100 praias emolduradas por uma das maiores faixas contínuas de Mata Atlântica preservada do Brasil.",
      "Entre as décadas de 1970 e 1980, o crescimento do turismo colocou em risco parte dessa vegetação nativa, desmatada para dar lugar a loteamentos e casas de veraneio.",
      "A cidade respondeu com a expansão do Parque Estadual da Serra do Mar, protegendo a maior parte do seu território — um esforço que hoje garante praias preservadas e seguras, ideais para famílias que buscam natureza de verdade sem abrir mão de estrutura.",
      "Não é surpresa que Ubatuba seja destino certo de férias em família há gerações: é o tipo de lugar que fica marcado — na memória de quem foi criança ali e hoje leva os próprios filhos para viver a mesma história.",
    ],
    numeros: [
      { valor: "100+", label: "praias" },
      { valor: "~93 mil", label: "habitantes" },
      { valor: "80%+", label: "do território em área de preservação" },
    ],
  },
  {
    slug: "petar",
    nome: "PETAR, SP",
    pais: "Brasil",
    estado: { nome: "São Paulo", sigla: "SP" },
    tipoViagem: "Grupo",
    tagline: "Cavernas e trilhas na Mata Atlântica",
    descricao:
      "Roteiro de espeleologia por algumas das maiores cavernas do Brasil, entre trilhas e cachoeiras no coração da Mata Atlântica do Vale do Ribeira.",
    imagem: trilhasImg,
    alt: "Foto ilustrativa de trilha na Mata Atlântica",
    duracao: "3 dias / 2 noites",
    grupo: "Grupos de até 12 pessoas",
    incluso: [
      "Mobilidade ida e volta",
      "Estadia com café da manhã",
      "Passeios e experiências culturais do roteiro",
      "Acompanhamento durante toda a viagem",
    ],
    interessesDisponiveis: ["Aventura", "Natureza"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    mapsQuery:
      "PETAR - Parque Estadual Turístico do Alto Ribeira, Iporanga, SP, Brasil",
    mapsZoom: 11,
    atracoes: [
      {
        nome: "Caverna de Santana",
        descricao:
          "Uma das maiores e mais visitadas cavernas do Brasil, no Núcleo Santana, com visitação monitorada por guias credenciados.",
        imagem: trilhasImg,
        alt: "Foto ilustrativa de trilha na Mata Atlântica, na região do PETAR",
        experiencias: ["grutas", "trilhas"],
      },
      {
        nome: "Casa de Pedra",
        descricao:
          "Um dos maiores paredões e entradas de caverna da América do Sul, no Núcleo Casa de Pedra, alcançado por trilha na floresta.",
        imagem: trilhasImg,
        alt: "Foto ilustrativa de trilha na Mata Atlântica, na região do PETAR",
        experiencias: ["grutas", "trilhas"],
      },
      {
        nome: "Cachoeira do Betari",
        descricao:
          "Queda d'água de águas claras dentro do parque, ótima para refrescar depois de um dia de cavernas e trilhas.",
        imagem: cachoeiraImg,
        alt: "Foto ilustrativa de cachoeira com piscina natural",
        experiencias: ["cachoeiras"],
      },
    ],
    historia: [
      "No extremo sul do estado de São Paulo, entre as cidades de Iporanga e Apiaí, o relevo cárstico do Vale do Ribeira escondeu, por milênios, uma das maiores redes de cavernas do Brasil sob uma das áreas de Mata Atlântica mais preservadas da região.",
      "Em 1958, essa riqueza subterrânea foi reconhecida com a criação do Parque Estadual Turístico do Alto Ribeira, uma das primeiras unidades de conservação do Brasil dedicadas à proteção de um patrimônio espeleológico — com visitação sempre acompanhada por guias credenciados, para preservar as formações e garantir a segurança de quem entra.",
      "Dividido em núcleos como Santana, Casa de Pedra, Ouro Grosso e Caboclos, o PETAR reúne cavernas com salões imensos, rios subterrâneos e formações que levaram milhares de anos para se formar, além de trilhas e cachoeiras na floresta que leva até elas.",
      "É um roteiro para quem busca um tipo diferente de aventura — mais silenciosa e intrigante, no escuro das cavernas e no verde denso da Mata Atlântica, um contraste e tanto com o dia a dia da cidade.",
    ],
    numeros: [
      { valor: "1958", label: "ano de criação do parque" },
      { valor: "4", label: "núcleos de visitação" },
      { valor: "só com guia", label: "visitação sempre monitorada" },
    ],
  },
  {
    slug: "cataratas-do-iguacu",
    nome: "Foz do Iguaçu, PR",
    pais: "Brasil",
    estado: { nome: "Paraná", sigla: "PR" },
    tipoViagem: "Família",
    tagline: "Um dos maiores espetáculos naturais do mundo",
    descricao:
      "Roteiro pelas Cataratas do Iguaçu, um dos maiores espetáculos naturais do mundo, com trilhas, mirantes e passeio de barco até perto das quedas.",
    imagem: cachoeiraImg,
    alt: "Foto ilustrativa de queda d'água em meio à natureza",
    duracao: "4 dias / 3 noites",
    grupo: "Grupos de até 15 pessoas",
    incluso: [
      "Mobilidade ida e volta",
      "Estadia com café da manhã",
      "Passeios e experiências culturais do roteiro",
      "Acompanhamento durante toda a viagem",
    ],
    interessesDisponiveis: ["Aventura", "Natureza", "Cultura"],
    inclusosDisponiveis: [
      "Experiência Aérea",
      "Experiências de Estadia",
      "Mobilidade",
      "Experiências Culturais e de Entretenimento",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    mapsQuery: "Parque Nacional do Iguaçu, Foz do Iguaçu, PR, Brasil",
    mapsZoom: 12,
    atracoes: [
      {
        nome: "Trilha das Cataratas",
        descricao:
          "Passarela de cerca de 1,2 km à beira do cânion, com vista panorâmica para a maior parte das quedas do lado brasileiro.",
        imagem: trilhasImg,
        alt: "Foto ilustrativa de trilha com vista para a natureza",
        experiencias: ["trilhas", "cachoeiras"],
      },
      {
        nome: "Garganta do Diabo",
        descricao:
          "A queda mais impressionante do conjunto, com passarela que leva bem de frente para a força da água — o ponto alto da visita.",
        imagem: cachoeiraImg,
        alt: "Foto ilustrativa de queda d'água em meio à natureza",
        experiencias: ["cachoeiras"],
      },
      {
        nome: "Macuco Safari",
        descricao:
          "Passeio guiado que combina um trecho de trilha em veículo elétrico pela mata com um passeio de barco que se aproxima da base das quedas — vale levar roupa de troca.",
        imagem: cachoeiraImg,
        alt: "Foto ilustrativa de queda d'água em meio à natureza",
        experiencias: ["safaris"],
      },
      {
        nome: "Parque das Aves",
        descricao:
          "Parque com viveiros imersivos ao lado do Parque Nacional, com centenas de aves e outros animais em meio à Mata Atlântica.",
        imagem: trilhasImg,
        alt: "Foto ilustrativa de trilha em meio à Mata Atlântica",
        experiencias: ["parques"],
      },
    ],
    historia: [
      "Na fronteira entre o Brasil e a Argentina, o Rio Iguaçu encontra um paredão de basalto e se despedaça em cerca de 275 quedas d'água espalhadas por quase 3 km — um dos espetáculos naturais mais impressionantes do planeta.",
      "Do lado brasileiro, o Parque Nacional do Iguaçu protege a floresta ao redor das quedas desde 1939, e foi reconhecido pela UNESCO como Patrimônio Natural da Humanidade em 1986, por abrigar uma das maiores extensões preservadas de Mata Atlântica do país.",
      "A Trilha das Cataratas leva os visitantes bem de frente para as quedas, com vista final para a imponente Garganta do Diabo — e para quem quer sentir a força da água ainda mais de perto, passeios como o Macuco Safari aproximam o barco quase até debaixo das quedas.",
      "Não importa quantas fotos você já viu: estar ali na frente, sentindo o barulho e a espuma da água, é uma daquelas experiências que realmente precisam ser vividas para serem entendidas.",
    ],
    numeros: [
      { valor: "275", label: "quedas d'água" },
      { valor: "2,7 km", label: "de extensão" },
      { valor: "desde 1986", label: "Patrimônio Mundial da UNESCO" },
    ],
  },
  {
    slug: "sao-pedro",
    nome: "São Pedro, SP",
    pais: "Brasil",
    estado: { nome: "São Paulo", sigla: "SP" },
    tipoViagem: "Individual",
    tagline: "Águas termais e paraquedismo",
    descricao:
      "Roteiro que combina relaxamento em águas termais e mineral com um dos principais points de paraquedismo do Brasil, no interior de São Paulo.",
    imagem: flutuacaoImg,
    alt: "Foto ilustrativa de pessoas nadando em água cristalina",
    duracao: "3 dias / 2 noites",
    grupo: "Grupos de até 15 pessoas",
    incluso: [
      "Mobilidade ida e volta",
      "Estadia com café da manhã",
      "Passeios e experiências culturais do roteiro",
      "Acompanhamento durante toda a viagem",
    ],
    interessesDisponiveis: ["Aventura", "Natureza"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Lazer",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    mapsQuery: "São Pedro, SP, Brasil",
    mapsZoom: 7,
    atracoes: [
      {
        nome: "Parque das Fontes",
        descricao:
          "Parque com piscinas de água termal e mineral no coração da cidade, ideal para relaxar entre um passeio e outro.",
        imagem: flutuacaoImg,
        alt: "Foto ilustrativa de piscina de água natural",
        experiencias: ["parques-aquaticos"],
      },
      {
        nome: "Salto de Paraquedas",
        descricao:
          "Um dos principais points de paraquedismo do Brasil, com escola e pista para saltos com vista para o Vale do Corumbataí.",
        imagem: destinoSocorroImg,
        alt: "Foto ilustrativa de paisagem de montanhas vista do alto",
      },
      {
        nome: "Balneário Municipal",
        descricao:
          "Área de lazer às margens do rio, com piscinas naturais e estrutura para famílias e grupos passarem o dia.",
        imagem: flutuacaoImg,
        alt: "Foto ilustrativa de piscina de água natural",
        experiencias: ["praias"],
      },
    ],
    historia: [
      "No interior de São Paulo, perto de Piracicaba, São Pedro nasceu ao redor de suas fontes de água termal e mineral — o que rendeu à cidade o título oficial de Estância Hidromineral.",
      "Ao longo do século 20, a cidade se estruturou em torno do turismo de águas, com parques e balneários pensados para quem busca descanso nas fontes termais.",
      "Mais recentemente, São Pedro também se tornou um dos principais destinos do paraquedismo no Brasil, com escolas e pistas que recebem praticantes do país inteiro para saltos com vista para o Vale do Corumbataí.",
      "É um roteiro que combina dois ritmos bem diferentes: o descanso nas águas termais e a adrenalina de um salto de paraquedas — dois jeitos opostos de sair da rotina.",
    ],
    numeros: [
      { valor: "~37 mil", label: "habitantes" },
      { valor: "Estância", label: "Hidromineral, título oficial da cidade" },
      { valor: "polo nacional", label: "de paraquedismo" },
    ],
  },
  {
    slug: "cunha",
    nome: "Cunha, SP",
    pais: "Brasil",
    estado: { nome: "São Paulo", sigla: "SP" },
    tipoViagem: "Individual",
    tagline: "Clima de montanha, trilha histórica e vinícolas",
    descricao:
      "Roteiro na Serra da Bocaina, entre trilhas históricas, vinícolas de altitude e cerâmica artesanal, com clima de montanha o ano todo.",
    imagem: trilhasImg,
    alt: "Foto ilustrativa de trilha na Mata Atlântica",
    duracao: "3 dias / 2 noites",
    grupo: "Grupos de até 15 pessoas",
    incluso: [
      "Mobilidade ida e volta",
      "Estadia com café da manhã",
      "Passeios e experiências culturais do roteiro",
      "Acompanhamento durante toda a viagem",
    ],
    interessesDisponiveis: ["Aventura", "Natureza", "Cultura", "Gastronomia"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Experiências Culturais e de Entretenimento",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    mapsQuery: "Cunha, SP, Brasil",
    mapsZoom: 7,
    atracoes: [
      {
        nome: "Estrada do Ouro",
        descricao:
          "Antigo caminho colonial que ligava as minas de Minas Gerais ao litoral, hoje percorrido por quem busca trilhas e passeios de 4x4 rumo a Paraty.",
        imagem: trilhasImg,
        alt: "Foto ilustrativa de trilha na Mata Atlântica",
        experiencias: ["trilhas"],
      },
      {
        nome: "Vale das Videiras",
        descricao:
          "Região de vinícolas de altitude, com degustação e vista para os vales da Serra da Bocaina.",
        imagem: trilhasImg,
        alt: "Foto ilustrativa de paisagem de montanha",
      },
      {
        nome: "Núcleo Santa Virgínia",
        descricao:
          "Núcleo do Parque Estadual da Serra do Mar em Cunha, com trilhas e cachoeiras em meio a uma das áreas mais preservadas de Mata Atlântica do estado.",
        imagem: cachoeiraImg,
        alt: "Foto ilustrativa de cachoeira com piscina natural",
        experiencias: ["trilhas", "cachoeiras"],
      },
    ],
    historia: [
      "No alto da Serra do Mar, entre São Paulo e o litoral norte, Cunha cresceu isolada por décadas — um isolamento que ajudou a preservar seu clima de montanha, sua arquitetura simples e boa parte da mata ao redor.",
      "A cidade é cortada pela antiga Estrada do Ouro, caminho colonial que ligava as minas de Minas Gerais ao litoral, hoje percorrido por quem busca trilhas e passeios de 4x4 com história.",
      "Nas últimas décadas, Cunha também virou point de vinícolas de altitude e de cerâmica artesanal, tradição que deu à cidade o apelido de capital da cerâmica no estado de São Paulo.",
      "É um roteiro para quem gosta de clima serrano, trilha histórica e um bom queijo com vinho ao final do dia — um contraste e tanto com o calor do litoral logo ali na descida da serra.",
    ],
    numeros: [
      { valor: "~24 mil", label: "habitantes" },
      { valor: "colonial", label: "Estrada do Ouro, ligando Cunha a Paraty" },
      { valor: "polo de", label: "cerâmica artesanal e vinícolas de altitude" },
    ],
  },
  {
    slug: "olimpia",
    nome: "Olímpia, SP",
    pais: "Brasil",
    estado: { nome: "São Paulo", sigla: "SP" },
    tipoViagem: "Família",
    tagline: "Capital nacional dos parques aquáticos",
    descricao:
      "Roteiro pelo maior polo de parques aquáticos do Brasil, com toboáguas, piscinas de ondas e águas termais para curtir o ano todo.",
    imagem: flutuacaoImg,
    alt: "Foto ilustrativa de pessoas nadando em água cristalina",
    duracao: "3 dias / 2 noites",
    grupo: "Grupos de até 20 pessoas",
    incluso: [
      "Mobilidade ida e volta",
      "Estadia com café da manhã",
      "Passeios e experiências culturais do roteiro",
      "Acompanhamento durante toda a viagem",
    ],
    interessesDisponiveis: ["Natureza", "Gastronomia"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Lazer",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    mapsQuery: "Olímpia, SP, Brasil",
    mapsZoom: 7,
    atracoes: [
      {
        nome: "Thermas dos Laranjais",
        descricao:
          "Um dos maiores parques aquáticos da América Latina, com toboáguas, piscinas de ondas e águas termais.",
        imagem: flutuacaoImg,
        alt: "Foto ilustrativa de pessoas nadando em água cristalina",
        experiencias: ["parques-aquaticos"],
      },
      {
        nome: "Hot Beach Olímpia",
        descricao:
          "Parque aquático com praia artificial, toboáguas radicais e águas termais, um dos principais points da cidade.",
        imagem: flutuacaoImg,
        alt: "Foto ilustrativa de pessoas nadando em água cristalina",
        experiencias: ["parques-aquaticos"],
      },
      {
        nome: "Hotéis com Águas Termais",
        descricao:
          "A cidade reúne dezenas de hotéis e resorts com poços próprios de água termal, muitos deles com acesso direto aos parques aquáticos.",
        imagem: flutuacaoImg,
        alt: "Foto ilustrativa de pessoas nadando em água cristalina",
      },
    ],
    historia: [
      "No interior de São Paulo, próxima a Rio Preto, Olímpia descobriu suas águas termais em poços perfurados ao longo do século 20 — e, a partir delas, construiu o maior polo de parques aquáticos do país.",
      "Parques como o Thermas dos Laranjais e o Hot Beach transformaram a cidade em um dos destinos mais visitados do Brasil, com toboáguas, piscinas de ondas e águas termais que funcionam em qualquer época do ano.",
      "O sucesso do turismo de águas rendeu a Olímpia o título de Capital Nacional do Turismo, reconhecimento oficial da força do setor na economia da cidade.",
      "É o tipo de roteiro perfeito para quem quer um dia — ou vários — de diversão em família, sem depender do clima, com direito a toboágua de manhã e água termal ao entardecer.",
    ],
    numeros: [
      { valor: "~60 mil", label: "habitantes" },
      { valor: "maior polo", label: "de parques aquáticos do Brasil" },
      { valor: "Capital Nacional", label: "do Turismo" },
    ],
  },
  {
    slug: "cabo-frio",
    nome: "Cabo Frio, RJ",
    pais: "Brasil",
    estado: { nome: "Rio de Janeiro", sigla: "RJ" },
    tipoViagem: "Família",
    tagline: "Dunas, ilhas e o mar mais azul do Rio",
    descricao:
      "Praias de areia branca e água cristalina, dunas para andar de buggy e ilhas só acessíveis de barco na Região dos Lagos fluminense.",
    imagem: surfItamambucaImg,
    alt: "Foto ilustrativa de praia de areia branca com costão rochoso e mar azul-turquesa",
    duracao: "4 dias / 3 noites",
    grupo: "Grupos de até 15 pessoas",
    incluso: [
      "Mobilidade ida e volta",
      "Estadia com café da manhã",
      "Passeios e experiências culturais do roteiro",
      "Acompanhamento durante toda a viagem",
    ],
    interessesDisponiveis: ["Praia", "Aventura", "Natureza"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Lazer",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    mapsQuery: "Cabo Frio, RJ, Brasil",
    mapsZoom: 7,
    atracoes: [
      {
        nome: "Praia do Forte",
        descricao:
          "Uma das praias mais conhecidas da cidade, com areia branca e mar de águas claras, e estrutura completa de quiosques para passar o dia.",
        imagem: trilhaSetePraiasImg,
        alt: "Foto ilustrativa de praia de areia clara cercada por costão rochoso",
        experiencias: ["praias"],
      },
      {
        nome: "Ilha do Japonês",
        descricao:
          "Ilha só acessível de barco ou lancha, com piscinas naturais de água cristalina — um dos passeios mais concorridos de Cabo Frio.",
        imagem: projetoTamarImg,
        alt: "Foto ilustrativa de costão rochoso com vista para o mar e as ilhas, ponto de partida de passeios de barco",
        experiencias: ["passeio-de-barco"],
      },
      {
        nome: "Dunas do Peró",
        descricao:
          "Extenso cordão de dunas de areia branca ao lado da Praia do Peró, ponto certo para um passeio de buggy com direito a descida nas dunas.",
        imagem: destinoUbatubaImg,
        alt: "Foto ilustrativa de vegetação de restinga com vista para o mar",
        experiencias: ["buggy"],
      },
      {
        nome: "Praia do Forno",
        descricao:
          "Pequena enseada de águas calmas e transparentes, ótima para mergulho livre e observação da vida marinha bem de perto.",
        imagem: flutuacaoImg,
        alt: "Foto ilustrativa de água cristalina, ideal para mergulho e flutuação",
        experiencias: ["flutuacao"],
      },
    ],
    historia: [
      "Fundada em 1615 à beira do Canal do Itajuru, Cabo Frio é uma das cidades mais antigas do Brasil — point estratégico na costa fluminense desde os tempos coloniais, quando a extração de sal movia a economia da região.",
      "A partir da segunda metade do século 20, as águas claríssimas e as dezenas de praias da Região dos Lagos transformaram Cabo Frio em um dos destinos de praia mais procurados do Rio de Janeiro, com uma visibilidade da água digna de mar caribenho.",
      "Hoje a cidade reúne praias urbanas, dunas de areia branca como as do Peró e ilhas só acessíveis de barco, como a Ilha do Japonês — um roteiro que mistura sol, mar e um tanto de aventura, dos passeios de lancha aos passeios de buggy pelas dunas.",
      "É o tipo de destino perfeito para quem quer alternar dias de praia tranquila com um pouco de adrenalina na areia e na água — sem economizar no visual de cartão-postal.",
    ],
    numeros: [
      { valor: "1615", label: "ano de fundação" },
      {
        valor: "Costa do Sol",
        label: "apelido da região, por suas águas claras",
      },
      { valor: "dezenas de", label: "praias e enseadas" },
    ],
  },
  {
    slug: "paraty",
    nome: "Paraty, RJ",
    pais: "Brasil",
    estado: { nome: "Rio de Janeiro", sigla: "RJ" },
    tipoViagem: "Individual",
    tagline: "Centro histórico, ilhas e cachoeiras",
    descricao:
      "Centro histórico colonial tombado pela UNESCO, ilhas e piscinas naturais só acessíveis de barco e cachoeiras na Mata Atlântica preservada.",
    imagem: projetoTamarImg,
    alt: "Foto ilustrativa de baía com mar calmo cercado por montanhas e Mata Atlântica",
    duracao: "3 dias / 2 noites",
    grupo: "Grupos de até 15 pessoas",
    incluso: [
      "Mobilidade ida e volta",
      "Estadia com café da manhã",
      "Passeios e experiências culturais do roteiro",
      "Acompanhamento durante toda a viagem",
    ],
    interessesDisponiveis: ["Cultura", "Natureza", "Aventura"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Experiências Culturais e de Entretenimento",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    mapsQuery: "Paraty, RJ, Brasil",
    mapsZoom: 7,
    atracoes: [
      {
        nome: "Centro Histórico",
        descricao:
          "Ruas de pedra irregular e casarios coloniais preservados desde o século 18, tombados como Patrimônio Mundial pela UNESCO.",
        imagem: destinoUbatubaImg,
        alt: "Foto ilustrativa da orla de Paraty, com o mar cercado por vegetação nativa",
      },
      {
        nome: "Ilhas da Baía de Paraty",
        descricao:
          "Mais de 65 ilhas e praias só acessíveis de barco ou lancha, com destaque para as piscinas naturais da Lagoa Azul.",
        imagem: trilhaSetePraiasImg,
        alt: "Foto ilustrativa de praia rochosa com ilhas ao fundo, parada de passeios de barco",
        experiencias: ["passeio-de-barco"],
      },
      {
        nome: "Cachoeira do Tobogã",
        descricao:
          "Queda d'água que forma um escorregador natural na rocha, um dos passeios mais divertidos nos arredores de Paraty.",
        imagem: cachoeiraImg,
        alt: "Foto ilustrativa de cachoeira com piscina natural",
        experiencias: ["cachoeiras"],
      },
      {
        nome: "Trilha do Ouro",
        descricao:
          "Trecho preservado do antigo caminho colonial que ligava as minas de Minas Gerais ao litoral, hoje percorrido por quem busca trilha com história.",
        imagem: trilhasImg,
        alt: "Foto ilustrativa de trilha na Mata Atlântica",
        experiencias: ["trilhas"],
      },
    ],
    historia: [
      "Fundada em 1667 no litoral sul do Rio de Janeiro, Paraty foi um dos principais portos do Brasil colonial, por onde escoava o ouro de Minas Gerais rumo a Portugal pela histórica Estrada Real.",
      "Com o declínio do ciclo do ouro, a cidade praticamente parou no tempo — o que, décadas depois, preservou seu centro histórico de ruas de pedra e casarões coloniais, hoje reconhecido como Patrimônio Mundial pela UNESCO.",
      "Cercada por Mata Atlântica preservada e por uma baía com mais de 65 ilhas, Paraty também virou point de passeios de barco e lancha, cachoeiras escondidas na mata e trilhas históricas, como a lendária Estrada do Ouro que liga a cidade a Cunha.",
      "É um roteiro raro, que combina história viva, natureza preservada e mar calmo — o tipo de lugar que rende tanto uma volta tranquila pelo centro histórico quanto um dia inteiro de barco entre as ilhas.",
    ],
    numeros: [
      { valor: "1667", label: "ano de fundação" },
      { valor: "Patrimônio Mundial", label: "UNESCO, pelo centro histórico" },
      { valor: "65+", label: "ilhas na baía" },
    ],
  },
];

export function getDestino(slug: string): Destino | undefined {
  return destinos.find((destino) => destino.slug === slug);
}
