import React, { useState, useEffect } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useSearchParams } from "react-router-dom";
import WaBlasSettingsView from "./WaBlasSettingsView";
import AddressSettingsView from "./AddressSettingsView";
import GeneralSettingsView from "./GeneralSettingsView";

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

const tabValues = ["general", "address", "wablas", "paymentMethod"];

export default function SettingsView() {
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
      <BreadCrumberStyle
        navigation={[
          {
            label: "Settings",
            link: "/settings",
            icon: <IconMenus.settings fontSize="small" />,
          },
        ]}
      />
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleChange}>
            <Tab label="General" {...a11yProps(0)} />
            <Tab label="Address" {...a11yProps(1)} />
            <Tab label="Wablas" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <GeneralSettingsView />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <AddressSettingsView />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <WaBlasSettingsView />
        </CustomTabPanel>
      </Box>
    </>
  );
}
