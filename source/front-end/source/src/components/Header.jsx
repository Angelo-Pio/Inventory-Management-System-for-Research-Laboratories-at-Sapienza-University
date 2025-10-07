import React from "react";
import Stack from "@mui/material/Stack";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import CustomDatePicker from "./CustomDataPicker";
import NavbarBreadcrumbs from "./NavbarBreadcrumbs";
import MenuButton from "./MenuButton";
// import ColorModeIconDropdown from "../themes/ColorModeIconDropdown";
import Search from "./Search";

export default function Header() {
  return (
    <Stack
      direction="row"
      className="hidden md:flex w-full items-center justify-between max-w-[1700px] pt-2"
      spacing={2}
    >
      {/* Left side breadcrumbs */}
      <NavbarBreadcrumbs />

      
    </Stack>
  );
}
