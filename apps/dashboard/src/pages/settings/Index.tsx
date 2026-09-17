import React, { useState, useEffect } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useSearchParams } from "react-router-dom";
import AddressSettingsView from "./AddressSettingsView";
import BannerSettingsView from "./BannerSettingsView";
import GeneralSettingsView from "./GeneralSettingsView";
import ShipmentSettingsView from "./ShipmentSettingsView";
import { useTranslation } from "react-i18next";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const tabValues = ["general", "address", "banner", "shipment"];

export default function SettingsView() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState(0);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const tabIndex = tabValues.indexOf(tabParam);
      if (tabIndex !== -1) {
        setValue(tabIndex);
      }
    }
  }, [searchParams]);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setSearchParams({ tab: tabValues[newValue] });
  };

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleChange}>
            <Tab label={t("settings.general")} {...a11yProps(0)} />
            <Tab label={t("settings.address")} {...a11yProps(1)} />
            <Tab label={t("settings.banner")} {...a11yProps(2)} />
            <Tab label={t("settings.shipment")} {...a11yProps(3)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <GeneralSettingsView />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <AddressSettingsView />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <BannerSettingsView />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={3}>
          <ShipmentSettingsView />
        </CustomTabPanel>
      </Box>
    </>
  );
}
