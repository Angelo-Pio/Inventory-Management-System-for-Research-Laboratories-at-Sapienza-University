import CssBaseline from "@mui/material/CssBaseline";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "../components/AuthContext";

import { getDepartmentMaterials } from "../services/labManagerServices";

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
// import useNotifications from '../hooks/useNotifications/useNotifications';
import { deleteMaterial, getAllRequests } from "../services/labManagerServices";
import PageContainer from "../components/PageContainer";
import { getResearcherRequests } from "../services/researcherServices";
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
  const [materials, setMaterials] = useState([]);
    const [sortModel, setSortModel] = useState([{ field: 'requestStatus', sort: 'asc' }]);
  

  const dialogs = useDialogs();
  //Get materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await getDepartmentMaterials(user.departmentId);
        console.log(data.data);
        setMaterials(data.data);
      } catch (err) {
        console.error("Failed to load materials", err);
      }
    };

    fetchMaterials();
  }, []);

  const [paginationModel, setPaginationModel] = useState({
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 0, //get page number
    pageSize: searchParams.get("pageSize") //get page size
      ? Number(searchParams.get("pageSize"))
      : INITIAL_PAGE_SIZE,
  });

  // If a filter query param exists, it attempts to JSON.parse its value and use that as the initial filter mode
  const [filterModel, setFilterModel] = useState(
    searchParams.get("filter")
      ? JSON.parse(searchParams.get("filter") ?? "")
      : { items: [] }
  );

  //row state and row count
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

      if (
        model.items.length > 0 ||
        (model.quickFilterValues && model.quickFilterValues.length > 0)
      ) {
        searchParams.set("filter", JSON.stringify(model));
      } else {
        searchParams.delete("filter");
      }
      const newSearchParamsString = searchParams.toString();

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

      const listData = await getResearcherRequests(user.id);
      console.log(listData.data);
      
      const materialMap = new Map((materials).map((m) => [m.id, m]));

      const completeListData = listData.data.map((item) => {
        const mat = materialMap.get(item.material_id);
        
        return {
          ...item,
          // add `name` from material if found, otherwise fallback to "-" or null
          name: mat?.name ?? "-",
          threshold: mat?.threshold ?? "-",
          category: mat?.category ?? "-",

        };
      });

      console.log(completeListData);

      setRowsState({
        rows: completeListData,
        rowCount: completeListData.length,
      });
    } catch (listDataError) {
      setError(listDataError);
    }
    setIsLoading(false);
  }, [paginationModel, filterModel, materials]);

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

  // const handleRowDelete = useCallback(
  //   (material) => async () => {
  //     console.log(material);

  //     const confirmed = await dialogs.confirm(
  //       `Do you wish to delete ${material.name}?`,
  //       {
  //         title: `Delete material?`,
  //         severity: "error",
  //         okText: "Delete",
  //         cancelText: "Cancel",
  //       }
  //     );

  //     if (confirmed) {
  //       setIsLoading(true);
  //       try {
  //         await deleteMaterial(user.departmentId, material.id);
  //         loadData();
  //       } catch (deleteError) {}
  //       setIsLoading(false);
  //     }
  //   },
  //   [dialogs, loadData]
  // );

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
        field: "category",
        headerName: "Category",
        width: 180,
        sortable: false,
        disableColumnMenu: true,
        valueGetter: (params) => params?.title ?? "",
      },
      {
        field: "threshold",
        headerName: "Threshold",
        type: "number",
        width: 100,
        sortable: false,
        disableColumnMenu: true,
        renderCell: (params) => {
          const isConsumable = params.row?.category?.consumable;
          const threshold = params.row?.threshold;
          return (
            <Typography sx={{ textAlign: "center", paddingY: 2 }}>
              {!isConsumable ? "-" : threshold}
            </Typography>
          );
        },
      },
      {
        field: "quantity",
        headerName: "Requested Quantity",
        type: "number",
        width: 100,
        sortable: false,
        disableColumnMenu: true,
        renderCell: (params) => {
          const isConsumable = params.row?.category?.consumable;
          const quantity = params.row?.quantity;
          return (
            <Typography sx={{ textAlign: "center", paddingY: 2 }}>
              {!isConsumable ? "-" : quantity}
            </Typography>
          );
        },
      },
      {
        field: "materialStatus",
        headerName: "Request Type",
        width: 180,
        sortable: false,
        disableColumnMenu: true,
        renderCell: (params) => {
          const isConsumable = params.row?.category?.consumable;
          return (
            <Typography sx={{ textAlign: "left", paddingY: 2 }}>
              {!isConsumable ? "Damaged" : "Low quantity"}
            </Typography>
          );
        },
      },
      {
        field: "requestStatus",
        headerName: "Request Status",
        width: 180,
        sortable: false,
        disableColumnMenu: true,
      },
      // {
      //   field: "actions",
      //   type: "actions",
      //   flex: 1,
      //   align: "right",
      //   getActions: ({ row }) => [
      //     <GridActionsCellItem
      //       key="delete-item"
      //       icon={<DeleteIcon />}
      //       label="Delete"
      //       onClick={handleRowDelete(row)}
      //     />,
      //   ],
      // },
    ],
    []
  );

  const pageTitle = "Requests";

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
            getRowId={(row) => row.material_id}
            pagination
            sortingMode="server"
            filterMode="server"
            paginationMode="server"
            sortModel={sortModel}

            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
            disableRowSelectionOnClick
            loading={isLoading}
            initialState={initialState}
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
