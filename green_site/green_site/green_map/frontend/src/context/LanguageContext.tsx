import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "it" | "en" | "fr" | "es" | "ar" | "zh" | "ru";

export const LANGUAGES: { code: Lang; label: string; flag: string; rtl?: boolean }[] = [
  { code: "it", label: "Italiano",  flag: "🇮🇹" },
  { code: "en", label: "English",   flag: "🇬🇧" },
  { code: "fr", label: "Français",  flag: "🇫🇷" },
  { code: "es", label: "Español",   flag: "🇪🇸" },
  { code: "ar", label: "العربية",   flag: "🇸🇦", rtl: true },
  { code: "zh", label: "中文",       flag: "🇨🇳" },
  { code: "ru", label: "Русский",   flag: "🇷🇺" },
];

export const T: Record<Lang, {
  navMap: string; navFeatures: string; navMuni: string; navApi: string;
  navStart: string;
  badge: string;
  tabRoutesLabel: string; tabRoutesHeadline: string; tabRoutesSub: string; tabRoutesCta: string;
  tabMuniLabel: string;   tabMuniHeadline: string;   tabMuniSub: string;   tabMuniCta: string;
  tabApiLabel: string;    tabApiHeadline: string;    tabApiSub: string;    tabApiCta: string;
  howItWorks: string; scroll: string;
}> = {
  it: {
    navMap: "Mappa", navFeatures: "Funzionalità", navMuni: "Comuni", navApi: "API",
    navStart: "Inizia gratis",
    badge: "Sentinel-2 · OSMnx · Green Score",
    tabRoutesLabel: "Percorsi",
    tabRoutesHeadline: "Cammina nel verde.",
    tabRoutesSub: "Percorsi pedonali che scelgono parchi, viali alberati e zone fresche. Zero caldo, zero asfalto.",
    tabRoutesCta: "Trova il tuo percorso",
    tabMuniLabel: "Comuni",
    tabMuniHeadline: "Governa il territorio.",
    tabMuniSub: "Analisi UHI da Sentinel-2, mappa del verde quartiere per quartiere. Report PDF per assessorati.",
    tabMuniCta: "Richiedi una demo",
    tabApiLabel: "API",
    tabApiHeadline: "Build with green data.",
    tabApiSub: "REST API per integrare routing verde, green score e heatmap nelle tue applicazioni. Pay per call.",
    tabApiCta: "Esplora le API",
    howItWorks: "Come funziona", scroll: "scroll",
  },
  en: {
    navMap: "Map", navFeatures: "Features", navMuni: "Municipalities", navApi: "API",
    navStart: "Get started",
    badge: "Sentinel-2 · OSMnx · Green Score",
    tabRoutesLabel: "Routes",
    tabRoutesHeadline: "Walk in the green.",
    tabRoutesSub: "Pedestrian routes that favour parks, tree-lined avenues and cool zones. No heat, no asphalt.",
    tabRoutesCta: "Find your route",
    tabMuniLabel: "Municipalities",
    tabMuniHeadline: "Govern the territory.",
    tabMuniSub: "UHI analysis from Sentinel-2, neighbourhood-by-neighbourhood green map. PDF reports for councils.",
    tabMuniCta: "Request a demo",
    tabApiLabel: "API",
    tabApiHeadline: "Build with green data.",
    tabApiSub: "REST API to integrate green routing, green score and heatmaps into your apps. Pay per call.",
    tabApiCta: "Explore the API",
    howItWorks: "How it works", scroll: "scroll",
  },
  fr: {
    navMap: "Carte", navFeatures: "Fonctionnalités", navMuni: "Communes", navApi: "API",
    navStart: "Commencer",
    badge: "Sentinel-2 · OSMnx · Green Score",
    tabRoutesLabel: "Parcours",
    tabRoutesHeadline: "Marchez dans le vert.",
    tabRoutesSub: "Itinéraires piétons qui privilégient parcs, avenues arborées et zones fraîches. Zéro chaleur, zéro asphalte.",
    tabRoutesCta: "Trouver mon parcours",
    tabMuniLabel: "Communes",
    tabMuniHeadline: "Gouvernez le territoire.",
    tabMuniSub: "Analyse UHI depuis Sentinel-2, carte du vert quartier par quartier. Rapports PDF pour les élus.",
    tabMuniCta: "Demander une démo",
    tabApiLabel: "API",
    tabApiHeadline: "Construisez avec les données vertes.",
    tabApiSub: "API REST pour intégrer le routage vert, green score et heatmaps dans vos apps. Paiement à l'appel.",
    tabApiCta: "Explorer l'API",
    howItWorks: "Comment ça marche", scroll: "défiler",
  },
  es: {
    navMap: "Mapa", navFeatures: "Funciones", navMuni: "Municipios", navApi: "API",
    navStart: "Empezar gratis",
    badge: "Sentinel-2 · OSMnx · Green Score",
    tabRoutesLabel: "Rutas",
    tabRoutesHeadline: "Camina en el verde.",
    tabRoutesSub: "Rutas peatonales que eligen parques, avenidas arboladas y zonas frescas. Sin calor, sin asfalto.",
    tabRoutesCta: "Encontrar mi ruta",
    tabMuniLabel: "Municipios",
    tabMuniHeadline: "Gobierna el territorio.",
    tabMuniSub: "Análisis UHI desde Sentinel-2, mapa del verde barrio a barrio. Informes PDF para ayuntamientos.",
    tabMuniCta: "Solicitar una demo",
    tabApiLabel: "API",
    tabApiHeadline: "Construye con datos verdes.",
    tabApiSub: "API REST para integrar routing verde, green score y mapas de calor en tus apps. Pago por llamada.",
    tabApiCta: "Explorar la API",
    howItWorks: "Cómo funciona", scroll: "scroll",
  },
  ar: {
    navMap: "الخريطة", navFeatures: "الميزات", navMuni: "البلديات", navApi: "API",
    navStart: "ابدأ مجانًا",
    badge: "Sentinel-2 · OSMnx · Green Score",
    tabRoutesLabel: "مسارات",
    tabRoutesHeadline: "تمشَّ في الطبيعة الخضراء.",
    tabRoutesSub: "مسارات للمشاة تختار الحدائق والطرق المشجرة والمناطق الباردة. بلا حرارة، بلا أسفلت.",
    tabRoutesCta: "ابحث عن مسارك",
    tabMuniLabel: "البلديات",
    tabMuniHeadline: "أدِر الأراضي.",
    tabMuniSub: "تحليل UHI من Sentinel-2، خريطة المساحات الخضراء حيًّا بحي. تقارير PDF للمجالس.",
    tabMuniCta: "اطلب عرضًا توضيحيًا",
    tabApiLabel: "API",
    tabApiHeadline: "ابنِ بالبيانات الخضراء.",
    tabApiSub: "API REST لدمج التوجيه الأخضر وdرجة الخضرة والخرائط الحرارية في تطبيقاتك. الدفع بالطلب.",
    tabApiCta: "استكشف الـ API",
    howItWorks: "كيف يعمل", scroll: "تمرير",
  },
  zh: {
    navMap: "地图", navFeatures: "功能", navMuni: "市政", navApi: "API",
    navStart: "免费开始",
    badge: "Sentinel-2 · OSMnx · Green Score",
    tabRoutesLabel: "路线",
    tabRoutesHeadline: "行走于绿色之中。",
    tabRoutesSub: "步行路线优先选择公园、林荫道和凉爽区域。远离酷热，远离沥青。",
    tabRoutesCta: "找到我的路线",
    tabMuniLabel: "市政",
    tabMuniHeadline: "管理城市领土。",
    tabMuniSub: "来自Sentinel-2的UHI分析，逐街区绿色地图。为政府提供PDF报告。",
    tabMuniCta: "申请演示",
    tabApiLabel: "API",
    tabApiHeadline: "用绿色数据构建应用。",
    tabApiSub: "REST API，将绿色路由、绿色评分和热力图集成到您的应用中。按调用付费。",
    tabApiCta: "探索 API",
    howItWorks: "如何运作", scroll: "滚动",
  },
  ru: {
    navMap: "Карта", navFeatures: "Функции", navMuni: "Муниципалитеты", navApi: "API",
    navStart: "Начать бесплатно",
    badge: "Sentinel-2 · OSMnx · Green Score",
    tabRoutesLabel: "Маршруты",
    tabRoutesHeadline: "Гуляйте в зелени.",
    tabRoutesSub: "Пешеходные маршруты через парки, озеленённые аллеи и прохладные зоны. Без жары, без асфальта.",
    tabRoutesCta: "Найти маршрут",
    tabMuniLabel: "Муниципалитеты",
    tabMuniHeadline: "Управляйте территорией.",
    tabMuniSub: "Анализ УТО по данным Sentinel-2, карта зелени по кварталам. PDF-отчёты для администраций.",
    tabMuniCta: "Запросить демо",
    tabApiLabel: "API",
    tabApiHeadline: "Стройте с зелёными данными.",
    tabApiSub: "REST API для интеграции зелёной навигации, green score и тепловых карт в ваши приложения.",
    tabApiCta: "Изучить API",
    howItWorks: "Как это работает", scroll: "прокрутить",
  },
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof T["it"];
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "it", setLang: () => {}, t: T.it,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("gm-lang") as Lang | null;
    return saved && T[saved] ? saved : "it";
  });

  const setLang = (l: Lang) => {
    localStorage.setItem("gm-lang", l);
    setLangState(l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: T[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
