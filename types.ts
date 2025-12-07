
export interface Transaction {
  id: number;
  date: Date;
  type: string;
  operator: string;
  location: string;
  amount: number;
  balance: number;
  originalType: string;
}

export type Language = 'es' | 'eu';

export interface Translations {
  title: string;
  upload_text: string;
  upload_subtext: string;
  processing: string;
  error_parsing: string;
  trips_card_title: string;
  trips_total: string;
  top_day: string;
  top_month: string;
  stops_title: string;
  top_stops_all: string;
  operators_title: string;
  streak_title: string;
  streak_days: string;
  streak_trips: string;
  money_title: string;
  total_spent: string;
  most_expensive_day: string;
  download_image: string;
  back: string;
  month_names: string[];
  click_for_details: string;
  export_image: string;
  ranking_days: string;
  ranking_months: string;
  ranking_stops: string;
  ranking_operators: string;
  monthly_stops: string;
  longest_streaks: string;
  spending_breakdown: string;
  time_of_day_title: string;
  morning: string;
  afternoon: string;
  night: string;
  weekday_title: string;
  weekday_names: string[];
  evolution_title: string;
  // Export Options
  export_options_title: string;
  include_top_days: string;
  include_top_months: string;
  include_time_of_day: string;
  include_weekdays: string;
  generate_image: string;
  stops_export_mode: string;
  stops_mode_global: string;
  stops_mode_monthly: string;
  download_template: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  es: {
    title: "Barik Wrapped",
    upload_text: "Sube tu extracto PDF de Barik",
    upload_subtext: "Analizaremos tus viajes localmente. Ningún dato sale de tu dispositivo.",
    processing: "Analizando tus viajes...",
    error_parsing: "Error al leer el PDF. Asegúrate de que es un extracto oficial del CTB.",
    trips_card_title: "Tus Viajes",
    trips_total: "Viajes Totales",
    top_day: "Día más viajero",
    top_month: "Mes más activo",
    stops_title: "Paradas Top",
    top_stops_all: "Tus paradas favoritas",
    operators_title: "Operadores",
    streak_title: "Racha Viajera",
    streak_days: "Días seguidos",
    streak_trips: "Viajes en esa racha",
    money_title: "Gastos",
    total_spent: "Total Gastado",
    most_expensive_day: "Día con más gasto",
    download_image: "Guardar Imagen",
    back: "Volver al inicio",
    month_names: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    click_for_details: "Ver detalles completos",
    export_image: "Exportar como imagen",
    ranking_days: "Top 5 Días",
    ranking_months: "Top 5 Meses",
    ranking_stops: "Top 10 Paradas",
    ranking_operators: "Operadores",
    monthly_stops: "Top 3 Paradas por Mes",
    longest_streaks: "Mejores rachas",
    spending_breakdown: "Desglose de gastos",
    time_of_day_title: "Momentos del día",
    morning: "Mañana (06-14h)",
    afternoon: "Tarde (14-22h)",
    night: "Noche (22-06h)",
    weekday_title: "Días de la semana",
    weekday_names: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    evolution_title: "Evolución mensual",
    export_options_title: "Personaliza tu imagen",
    include_top_days: "Incluir Top 5 Días",
    include_top_months: "Incluir Top 5 Meses",
    include_time_of_day: "Incluir Momento del día",
    include_weekdays: "Incluir Días de la semana",
    generate_image: "Generar Imagen",
    stops_export_mode: "Modo de exportación",
    stops_mode_global: "Top 10 Global",
    stops_mode_monthly: "Top 3 por Mes",
    download_template: "Descargar plantilla vacía"
  },
  eu: {
    title: "Barik Wrapped",
    upload_text: "Igo zure Barik PDF laburpena",
    upload_subtext: "Zure bidaiak lokalean aztertuko ditugu. Datuak ez dira gailutik aterako.",
    processing: "Zure bidaiak aztertzen...",
    error_parsing: "Errorea PDFa irakurtzean. Ziurtatu CTBko laburpen ofiziala dela.",
    trips_card_title: "Zure Bidaiak",
    trips_total: "Bidaia Guztira",
    top_day: "Bidaia gehieneko eguna",
    top_month: "Hilabete aktiboena",
    stops_title: "Geltoki Onenak",
    top_stops_all: "Geltoki gogokoenak",
    operators_title: "Operadoreak",
    streak_title: "Bidaia-Bolada",
    streak_days: "Egun segadan",
    streak_trips: "Bolada horretako bidaiak",
    money_title: "Gastuak",
    total_spent: "Guztira Gastatua",
    most_expensive_day: "Gastu handieneko eguna",
    download_image: "Gorde Irudia",
    back: "Itzuli hasierara",
    month_names: ["Urtarrila", "Otsaila", "Martxoa", "Apirila", "Maiatza", "Ekaina", "Uztaila", "Abuztua", "Iraila", "Urria", "Azaroa", "Abendua"],
    click_for_details: "Ikusi xehetasun guztiak",
    export_image: "Esportatu irudi gisa",
    ranking_days: "Bidaia gehieneko 5 egunak",
    ranking_months: "Bidaia gehieneko 5 hilabeteak",
    ranking_stops: "Gehien erabilitako 10 geltokiak",
    ranking_operators: "Erabilitako operadoreak",
    monthly_stops: "Hileko 3 geltoki onenak",
    longest_streaks: "Bidaia-bolada onenak",
    spending_breakdown: "Gastuen banaketa",
    time_of_day_title: "Eguneko momentuak",
    morning: "Goiza (06-14h)",
    afternoon: "Arratsaldea (14-22h)",
    night: "Gaua (22-06h)",
    weekday_title: "Asteko egunak",
    weekday_names: ["Iga", "Ast", "Ast", "Ast", "Ost", "Osti", "Lar"],
    evolution_title: "Hileroko bilakaera",
    export_options_title: "Pertsonalizatu irudia",
    include_top_days: "Sartu Top 5 Egunak",
    include_top_months: "Sartu Top 5 Hilabeteak",
    include_time_of_day: "Sartu Eguneko momentua",
    include_weekdays: "Sartu Asteko egunak",
    generate_image: "Sortu Irudia",
    stops_export_mode: "Esportazio modua",
    stops_mode_global: "Top 10 Globala",
    stops_mode_monthly: "Hileko Top 3",
    download_template: "Txantiloi hutsa deskargatu"
  }
};