import Stack from "@mui/material/Stack";
import NavbarBreadcrumbs from "./NavbarBreadcrumbs";

export default function Header() {
  return (
    <Stack
      direction="row"
      className="hidden md:flex w-full items-center justify-between max-w-[1700px] pt-2"
      spacing={2}
    >
      <NavbarBreadcrumbs />
    </Stack>
  );
}
