import CssBaseline from "@mui/material/CssBaseline";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "../components/AuthContext";

import AppTheme from "../themes/AppTheme";
import {
  dataGridCustomizations,
  datePickersCustomizations,
  formInputCustomizations,
} from "../themes/customization";
const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...formInputCustomizations,
};
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import {
  DataGrid,
  GridActionsCellItem,
  gridClasses,
  Toolbar,
  QuickFilter,
  QuickFilterControl,
  QuickFilterTrigger,
  QuickFilterClear,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useDialogs } from "../hooks/useDialogs";
import { deleteMaterial, getMany } from "../services/labManagerServices";
import PageContainer from "../components/PageContainer";
import Typography from "@mui/material/Typography";

const INITIAL_PAGE_SIZE = 10;

function QuickSearchToolbar() {
  return (
    <Toolbar>
      <QuickFilter>
        <QuickFilterControl placeholder="Search…" />
      </QuickFilter>
    </Toolbar>
  );
}

export default function InventoryPage(props) {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const dialogs = useDialogs();

  const [paginationModel, setPaginationModel] = useState({
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 0,
    pageSize: searchParams.get("pageSize")
      ? Number(searchParams.get("pageSize"))
      : INITIAL_PAGE_SIZE,
  });

  const [filterModel, setFilterModel] = useState(
    searchParams.get("filter")
      ? JSON.parse(searchParams.get("filter") ?? "")
      : { items: [] }
  );

  const [rowsState, setRowsState] = useState({
    rows: [],
    rowCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handlePaginationModelChange = useCallback(
    (model) => {
      setPaginationModel(model);
      searchParams.set("page", String(model.page));
      searchParams.set("pageSize", String(model.pageSize));
      const newSearchParamsString = searchParams.toString();
      navigate(
        `${pathname}${newSearchParamsString ? "?" : ""}${newSearchParamsString}`
      );
    },
    [navigate, pathname, searchParams]
  );

  const handleFilterModelChange = useCallback(
    (model) => {
      setFilterModel(model);
      console.log("model", model);

      if (
        model.items.length > 0 ||
        (model.quickFilterValues && model.quickFilterValues.length > 0)
      ) {
        searchParams.set("filter", JSON.stringify(model));
      } else {
        searchParams.delete("filter");
      }
      const newSearchParamsString = searchParams.toString();
      console.log("parm:", newSearchParamsString);

      navigate(
        `${pathname}${newSearchParamsString ? "?" : ""}${newSearchParamsString}`
      );
    },
    [navigate, pathname, searchParams]
  );

  const loadData = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const listData = await getMany({
        departmentId: user.departmentId,
        paginationModel,
        filterModel,
      });
      console.log("LISTDATA", listData);

      setRowsState({
        rows: listData.items,
        rowCount: listData.itemCount,
      });
    } catch (listDataError) {
      setError(listDataError);
    }
    setIsLoading(false);
  }, [paginationModel, filterModel]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    if (!isLoading) {
      loadData();
    }
  }, [isLoading, loadData]);

  const handleCreateClick = useCallback(() => {
    navigate("new");
  }, [navigate]);

  const handleRowDelete = useCallback(
    (material) => async () => {
      const confirmed = await dialogs.confirm(
        `Do you wish to delete ${material.name}?`,
        {
          title: `Delete material?`,
          severity: "error",
          okText: "Delete",
          cancelText: "Cancel",
        }
      );

      if (confirmed) {
        setIsLoading(true);
        try {
          await deleteMaterial(user.departmentId, material.id);
          loadData();
        } catch (deleteError) {}
        setIsLoading(false);
      }
    },
    [dialogs, loadData]
  );

  const initialState = useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
    }),
    []
  );

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        width: 180,
        sortable: false,
        disableColumnMenu: true,
      },
      {
        field: "threshold",
        headerName: "Threshold",
        type: "number",
        width: 100,
        sortable: false,
        disableColumnMenu: true,
      },
      {
        field: "quantity",
        headerName: "Quantity",
        type: "number",
        width: 100,
        sortable: false,
        disableColumnMenu: true,
      },
      {
        field: "category",
        headerName: "Category",
        width: 180,
        sortable: false,
        disableColumnMenu: true,
        flex: 1,
        valueGetter: (params) => params?.title ?? "",
      },
      {
        field: "consumable",
        headerName: "Consumable",
        width: 180,
        sortable: false,
        disableColumnMenu: true,
        flex: 1,
        renderCell: (params) => {
          const val = params.row?.category?.consumable;
          return (
            <Typography sx={{ textAlign: "center", paddingY: 2 }}>
              {val ? "Yes" : "No"}
            </Typography>
          );
        },
      },
      {
        field: "actions",
        headerName: "",
        type: "actions",
        flex: 1,
        align: "right",
        sortable: false,
        disableColumnMenu: true,
        renderCell: (params) => {
          const row = params.row;

          if (row?.status === "Damaged") {
            return (
              <Tooltip
                title="The material is damaged"
                slotProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: "red",
                      fontSize: "small",
                    },
                  },
                }}
                onClick={() => navigate("/labmanager-dashboard/alerts")}
              >
                <PriorityHighIcon fontSize="large" color="error" />
              </Tooltip>
            );
          }

          return <></>;
        },
      },
    ],
    [handleRowDelete]
  );

  const pageTitle = "Inventory";

  return (
    <AppTheme {...props} themeComponents={themeComponents}>
      <CssBaseline enableColorScheme />
      <PageContainer
        title={pageTitle}
        actions={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title="Reload data" placement="right" enterDelay={1000}>
              <div>
                <IconButton
                  size="small"
                  aria-label="refresh"
                  onClick={handleRefresh}
                >
                  <RefreshIcon />
                </IconButton>
              </div>
            </Tooltip>
            <Button
              variant="contained"
              onClick={handleCreateClick}
              startIcon={<AddIcon />}
            >
              Create
            </Button>
          </Stack>
        }
      >
        <Box sx={{ flex: 1, width: "100%" }}>
          <DataGrid
            rows={rowsState.rows}
            rowCount={rowsState.rowCount}
            columns={columns}
            pagination
            sortingMode="server"
            filterMode="server"
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
            disableRowSelectionOnClick
            loading={isLoading}
            initialState={initialState}
            slots={{ toolbar: QuickSearchToolbar }}
            showToolbar
            pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25]}
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: "transparent",
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                {
                  outline: "none",
                },
            }}
            slotProps={{
              loadingOverlay: {
                variant: "circular-progress",
                noRowsVariant: "circular-progress",
              },
              baseIconButton: {
                size: "small",
              },
            }}
          />
        </Box>
      </PageContainer>
    </AppTheme>
  );
}
