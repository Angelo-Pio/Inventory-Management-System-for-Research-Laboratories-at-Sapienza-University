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
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useDialogs } from "../hooks/useDialogs";
// import useNotifications from '../hooks/useNotifications/useNotifications';
import {
  deleteUser,
  getFilteredUsers,
  getAllDepartments,
} from "../services/adminServices";
import PageContainer from "../components/PageContainer";

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

export default function EmployeesPage(props) {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [departments, setDepartments] = useState([]);

  const getDepartmentName = (id) => {
    return departments.find((dep) => dep.id === id)?.name || "—";
  };

  const dialogs = useDialogs();
  // const notifications = useNotifications();

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
      // ✅ Run both requests in parallel for best performance
      const [departmentsRes, usersRes] = await Promise.all([
        getAllDepartments(),
        getFilteredUsers({
          departmentId: user.departmentId,
          role: user.role,
          paginationModel,
          filterModel,
        }),
      ]);

      // ✅ Set departments
      setDepartments(departmentsRes.data);
      console.log(usersRes);
      
      // if (user.role === "Admin") {
      //   usersRes = usersRes
      // }

      // ✅ Set users
      setRowsState({
        rows: usersRes.items,
        rowCount: usersRes.itemCount,
      });
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false); // ✅ Only stops loading after BOTH requests complete
    }
  }, [paginationModel, filterModel, user.departmentId]);

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
    (user) => async () => {
      const confirmed = await dialogs.confirm(
        `Do you wish to delete ${user.name}?`,
        {
          title: `Delete User?`,
          severity: "error",
          okText: "Delete",
          cancelText: "Cancel",
        }
      );

      if (confirmed) {
        setIsLoading(true);
        try {
          await deleteUser(user.id);
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

  const columns = useMemo(() => {
    const baseColumns = [
      {
        field: "name",
        headerName: "Name",
        width: 180,
        sortable: false,
        disableColumnMenu: true,
      },
      {
        field: "surname",
        headerName: "Surname",
        width: 180,
        sortable: false,
        disableColumnMenu: true,
      },
      {
        field: "email",
        headerName: "Email",
        width: 200,
        sortable: false,
        disableColumnMenu: true,
      },
      {
        field: "role",
        headerName: "Role",
        width: 180,
        sortable: false,
        disableColumnMenu: true,
      },
    ];

    if (user.role === "admin") {
      baseColumns.push({
        field: "departmentId",
        headerName: "Department",
        width: 180,
        sortable: false,
        disableColumnMenu: true,
        valueGetter: (params) => {
          return getDepartmentName(params);
        },
      });
    }

    // ✅ Always add actions
    if (user.role === "admin") {
      baseColumns.push({
        field: "actions",
        type: "actions",
        flex: 1,
        align: "right",
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="delete-item"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleRowDelete(row)}
          />,
        ],
      });
    } else {
      baseColumns.push({
        field: "actions",
        type: "actions",
        flex: 1,
        align: "right",
        getActions: ({ row }) => {
          return row.role === "researcher"
            ? [
                <GridActionsCellItem
                  key="delete-item"
                  icon={<DeleteIcon />}
                  label="Delete"
                  onClick={() => handleRowDelete(row)} // ✅ make sure it's wrapped in a function
                />,
              ]
            : [];
        },
      });
    }

    return baseColumns;
  }, [user.role, handleRowDelete, departments]);

  const pageTitle = "Employees";

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
