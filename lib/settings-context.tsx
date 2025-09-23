"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface SettingsData {
  service_name: string;
  admin_id: string;
  admin_password: string;
  timer_minutes: number;
  total_problems: number;
  chatbot_enabled: boolean;
}

interface SettingsContextType {
  settings: SettingsData;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SettingsData = {
  service_name: "AI 수학 친구",
  admin_id: "admin",
  admin_password: "admin123",
  timer_minutes: 5,
  total_problems: 5,
  chatbot_enabled: true,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: false,
  refreshSettings: async () => {},
});

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);

        if (typeof document !== "undefined") {
          document.title = `${data.data.service_name}`;
        }
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    setLoading(true);
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
