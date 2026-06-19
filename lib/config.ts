export const CONFIG = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Zefast Admin",
  APP_TITLE: process.env.NEXT_PUBLIC_APP_TITLE || "Tableau de Bord Admin Zefast",
  APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Tableau de bord administrateur pour la plateforme Zefast",
  PRIMARY_COLOR: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "oklch(0.62 0.21 35)",
  ACCENT_COLOR: process.env.NEXT_PUBLIC_ACCENT_COLOR || "oklch(0.68 0.23 35)",
  APP_LOGO_URL: process.env.NEXT_PUBLIC_APP_LOGO_URL || "",
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "https://api.zefast.net/",

  // Stat Card Colors
  STAT_CARD_RUST: process.env.NEXT_PUBLIC_STAT_CARD_RUST || "#772014",
  STAT_CARD_ORANGE: process.env.NEXT_PUBLIC_STAT_CARD_ORANGE || "#D97706",
  STAT_CARD_DARK: process.env.NEXT_PUBLIC_STAT_CARD_DARK || "#0F110C",
  STAT_CARD_AMBER: process.env.NEXT_PUBLIC_STAT_CARD_AMBER || "#F59E0B",
  STAT_CARD_EMERALD: process.env.NEXT_PUBLIC_STAT_CARD_EMERALD || "#047857",
  STAT_CARD_PURPLE: process.env.NEXT_PUBLIC_STAT_CARD_PURPLE || "#7C3AED",
  STAT_CARD_ROSE: process.env.NEXT_PUBLIC_STAT_CARD_ROSE || "#E11D48",
  STAT_CARD_CYAN: process.env.NEXT_PUBLIC_STAT_CARD_CYAN || "#0891B2",

  // Chart Colors
  CHART_1: process.env.NEXT_PUBLIC_CHART_1 || "oklch(0.62 0.21 35)",
  CHART_2: process.env.NEXT_PUBLIC_CHART_2 || "oklch(0.68 0.23 30)",
  CHART_3: process.env.NEXT_PUBLIC_CHART_3 || "oklch(0.58 0.19 40)",
  CHART_4: process.env.NEXT_PUBLIC_CHART_4 || "oklch(0.65 0.20 25)",
  CHART_5: process.env.NEXT_PUBLIC_CHART_5 || "oklch(0.70 0.22 45)",

  // Feature Flags - Enable/Disable Pages
  FEATURES: {
    USERS: process.env.NEXT_PUBLIC_ENABLE_USERS !== "false",
    BOT_USERS: process.env.NEXT_PUBLIC_ENABLE_BOT_USERS !== "false",
    NETWORKS: process.env.NEXT_PUBLIC_ENABLE_NETWORKS !== "false",
    TELEPHONES: process.env.NEXT_PUBLIC_ENABLE_TELEPHONES !== "false",
    USER_APP_IDS: process.env.NEXT_PUBLIC_ENABLE_USER_APP_IDS !== "false",
    NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== "false",
    BONUSES: process.env.NEXT_PUBLIC_ENABLE_BONUSES !== "false",
    COUPONS: process.env.NEXT_PUBLIC_ENABLE_COUPONS !== "false",
    ADVERTISEMENTS: process.env.NEXT_PUBLIC_ENABLE_ADVERTISEMENTS !== "false",
    TRANSACTIONS: process.env.NEXT_PUBLIC_ENABLE_TRANSACTIONS !== "false",
    RECHARGES: process.env.NEXT_PUBLIC_ENABLE_RECHARGES !== "false",
    BOT_TRANSACTIONS: process.env.NEXT_PUBLIC_ENABLE_BOT_TRANSACTIONS !== "false",
    PLATFORMS: process.env.NEXT_PUBLIC_ENABLE_PLATFORMS !== "false",
    DEPOSITS: process.env.NEXT_PUBLIC_ENABLE_DEPOSITS !== "false",
    SETTINGS: process.env.NEXT_PUBLIC_ENABLE_SETTINGS !== "false",
    CRYPTO: process.env.NEXT_PUBLIC_ENABLE_CRYPTO !== "false",
    CRYPTO_NETWORKS: process.env.NEXT_PUBLIC_ENABLE_CRYPTO_NETWORKS !== "false",
    CRYPTO_TRANSACTIONS: process.env.NEXT_PUBLIC_ENABLE_CRYPTO_TRANSACTIONS !== "false",
  },
};
