import CssBaseline from "@mui/material/CssBaseline";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
import TextField from "@mui/material/TextField";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useDialogs } from "../hooks/useDialogs";

import {
  updateMaterialQuantity,
  getMaterialById,
  markRequestAsDone,
  getManyRequests,
} from "../services/labManagerServices";

import PageContainer from "../components/PageContainer";

const INITIAL_PAGE_SIZE = 10;

import {
  createMqttClient,
  subscribe,
  disconnect,
} from "../services/notificationServices";

const MQTT_BROKER_URL = "ws://localhost:15675/ws";
const MQTT_USERNAME = "guest";
const MQTT_PASSWORD = "guest";

export default function AlertsPage(props) {
  const [status, setStatus] = useState("Disconnesso");
  const [messages, setMessages] = useState([]);
  const { department, user } = useAuth();

  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sortModel, setSortModel] = useState([{ field: "name", sort: "asc" }]);

  const messagesInitializedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const dialogs = useDialogs();
  const [filterModel, setFilterModel] = useState(
    searchParams.get("filter")
      ? JSON.parse(searchParams.get("filter") ?? "")
      : { items: [] }
  );

  const [AlertRowsState, setAlertRowsState] = useState({
    rows: [],
    rowCount: 0,
  });

  const [LowStockrowsState, setLowStockRowsState] = useState({
    rows: [],
    rowCount: 0,
  });

  const parsePageParam = (key, fallbackPage = 0) =>
    searchParams.get(key) ? Number(searchParams.get(key)) : fallbackPage;

  const parsePageSizeParam = (key, fallbackSize = INITIAL_PAGE_SIZE) =>
    searchParams.get(key) ? Number(searchParams.get(key)) : fallbackSize;

  const [paginationModelAlert, setPaginationModelAlert] = useState({
    page: parsePageParam("alertPage", 0),
    pageSize: parsePageSizeParam("alertPageSize", INITIAL_PAGE_SIZE),
  });

  const [paginationModelLowStock, setPaginationModelLowStock] = useState({
    page: parsePageParam("lowPage", 0),
    pageSize: parsePageSizeParam("lowPageSize", INITIAL_PAGE_SIZE),
  });

  useEffect(() => {
    if (!department?.id) {
      setStatus("Dipartimento non valido");
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    const currentTopic = `${department.id}/notifications`;
    const clientId = `mqtt_react_client_${new Date().getTime()}`;

    const options = {
      clientId,
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
      path: "/ws",
      keepalive: 15,
      reconnectPeriod: 10000,
      clean: true,
    };

    const newClient = createMqttClient({
      brokerUrl: MQTT_BROKER_URL,
      options,
      handlers: {
        onConnect: (cli) => {
          setStatus(
            `Connesso al broker. Tentativo di sottoscrizione a ${currentTopic}...`
          );
        },
        onMessage: ({ topic, payload }) => {
          const timestamp = new Date().toLocaleTimeString();

          setMessages((prev) => {
            const duplicate = prev.some((m) => JSON.stringify(m) === payload);
            if (duplicate) {
              return prev;
            }
            const newEntry = JSON.parse(payload);

            return [newEntry, ...prev];
          });
        },
        onError: (err) => {
          setStatus(`ERRORE DI CONNESSIONE: ${err?.message ?? String(err)}`);
        },
        onClose: () => {
          setStatus("Disconnesso (Connessione Persa)");
        },
      },
    });

    subscribe(newClient, currentTopic, { qos: 1 }, (err) => {
      if (!err) {
        setStatus(`Connesso e sottoscritto a ${currentTopic}`);
      } else {
        setStatus(`Connesso ma SOTTOSCRIZIONE FALLITA a ${currentTopic}`);
      }
    });

    return () => {
      disconnect(newClient);
      setStatus("Disconnesso (Pulizia eseguita)");
    };
  }, [department?.id]);

  const handlePaginationModelChangeAlert = useCallback(
    (model) => {
      setPaginationModelAlert(model);

      searchParams.set("alertPage", String(model.page));
      searchParams.set("alertPageSize", String(model.pageSize));
      const newSearchParamsString = searchParams.toString();
      navigate(
        `${pathname}${newSearchParamsString ? "?" : ""}${newSearchParamsString}`
      );
    },
    [navigate, pathname, searchParams]
  );

  const handlePaginationModelChangeLowStock = useCallback(
    (model) => {
      setPaginationModelLowStock(model);

      searchParams.set("lowPage", String(model.page));
      searchParams.set("lowPageSize", String(model.pageSize));
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
    const isInitialEmpty =
      !messagesInitializedRef.current && (!messages || messages.length === 0);

    if (isInitialEmpty) {
      setIsLoading(true);

      setAlertRowsState({ rows: [], rowCount: 0 });
      setLowStockRowsState({ rows: [], rowCount: 0 });

      return;
    }

    setIsLoading(true);
    let alerts = [];
    let countAlerts = 0;
    let lowStock = [];
    let countLowStock = 0;
    let unifiedMaterials = [];
    try {
      if (!messages || messages.length === 0) {
        unifiedMaterials = [];
      } else {
        try {
          const {
            itemsLowStock,
            itemCountLowStock,
            itemsAlert,
            itemCountAlert,
          } = await getManyRequests({
            messages,
            alertPaginationModel: paginationModelAlert,
            lowStockPaginationModel: paginationModelLowStock,
            filterModel,
            sortModel,
          });

          lowStock = itemsLowStock ?? [];
          countLowStock = itemCountLowStock ?? 0;
          alerts = itemsAlert ?? [];
          countAlerts = itemCountAlert ?? 0;
        } catch (error) {
          console.error("error loading alerts", error);
        }
      }

      messagesInitializedRef.current = true;

      setAlertRowsState({
        rows: alerts,
        rowCount: countAlerts,
      });

      setLowStockRowsState({
        rows: lowStock,
        rowCount: countLowStock,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    messages,
    paginationModelAlert,
    paginationModelLowStock,
    filterModel,
    user?.departmentId,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOrder = useCallback(
    async (row, amount) => {
      const confirmed = await dialogs.confirm(
        `Do you want to order ${amount} unit${amount === 1 ? "" : "s"} of "${
          row.name
        }"?`,
        {
          title: "Confirm order",
          severity: "success",
          okText: "Order",
          cancelText: "Cancel",
        }
      );

      if (!confirmed) return;

      setIsLoading(true);
      try {
        const payload = {
          materialId: row.materialId,
          userId: user.id,
          quantity: amount,
        };
        const resultRequest = await markRequestAsDone(row.requestId);
        const result = await updateMaterialQuantity(department.id, payload);

        if (result.data === true || result === undefined) {
          await loadData();
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg.materialId !== row.materialId)
          );
        } else {
          await dialogs.alert(`Unable to use the material.`, {
            title: "Error",
            severity: "error",
          });
        }
      } catch (err) {
        console.error("Error using material", err);
        await dialogs.alert(`Error: ${err?.message ?? "Unknown error"}`, {
          title: "Error",
          severity: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [dialogs, loadData]
  );

  const handleOrderAlert = useCallback(
    async (row) => {
      console.log(row);

      const confirmed = await dialogs.confirm(
        `Do you want to replace the damaged "${row.name}"?`,
        {
          title: "Confirm replace",
          severity: "warning",
          okText: "Replace",
          cancelText: "Cancel",
        }
      );

      if (!confirmed) return;

      setIsLoading(true);
      try {
        const result = await markRequestAsDone(row.requestId);

        if (result.data === true || result === undefined) {
          await loadData();
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg.materialId !== row.materialId)
          );
        } else {
          await dialogs.alert(`Unable to order the material.`, {
            title: "Error",
            severity: "error",
          });
        }
      } catch (err) {
        console.error("Error ordering material", err);
        await dialogs.alert(`Error: ${err?.message ?? "Unknown error"}`, {
          title: "Error",
          severity: "error",
        });
      } finally {
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

  const alertColumns = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        width: 180,
        sortable: false,
        disableColumnMenu: true,
        flex: 1,
      },
      {
        field: "researcher",
        headerName: "Researcher",
        width: 140,
        sortable: false,
        disableColumnMenu: true,
        flex: 1,
      },
      {
        field: "category",
        headerName: "Category",
        width: 140,
        sortable: false,
        disableColumnMenu: true,
        flex: 1,
      },

      {
        field: "orderQuantity",
        headerName: "Replace",
        width: 180,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,

        renderCell: (params) => (
          <UseCellAlert
            row={params.row}
            onOrder={(rowObj, amount) => handleOrderAlert(rowObj)}
          />
        ),
      },
    ],
    [handleOrder]
  );

  const lowStockColumns = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        width: 180,
        sortable: false,
        disableColumnMenu: true,
        flex: 1,
      },
      {
        field: "researcher",
        headerName: "Researcher",
        width: 140,
        sortable: false,
        disableColumnMenu: true,
        flex: 1,
      },
      {
        field: "category",
        headerName: "Category",
        width: 140,
        sortable: false,
        disableColumnMenu: true,
        flex: 1,
      },
      {
        field: "quantity",
        headerName: "Current Quantity",
        width: 100,
        sortable: false,
        disableColumnMenu: true,
        flex: 1,
      },
      {
        field: "requested_quantity",
        headerName: "Requested Quantity",
        width: 100,
        sortable: false,
        disableColumnMenu: true,
        flex: 1,
      },
      {
        field: "threshold",
        headerName: "Threshold",
        width: 100,
        sortable: false,
        disableColumnMenu: true,
        flex: 1,
      },
      {
        field: "orderQuantity",
        headerName: "Order Quantity",
        width: 220,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <UseCellLowStock
            row={params.row}
            onOrder={(rowObj, amount) => handleOrder(rowObj, amount)}
          />
        ),
      },
    ],
    [handleOrder]
  );

  return (
    <AppTheme {...props} themeComponents={themeComponents}>
      <CssBaseline enableColorScheme />
      <PageContainer title={"Status Alert"}>
        <Box sx={{ flex: 1, width: "100%" }}>
          <DataGrid
            rows={AlertRowsState.rows}
            rowCount={AlertRowsState.rowCount ?? 0}
            getRowId={(row) => row.requestId}
            columns={alertColumns}
            pagination
            sortingMode="server"
            sortModel={sortModel}
            filterMode="server"
            paginationMode="server"
            paginationModel={paginationModelAlert}
            onPaginationModelChange={handlePaginationModelChangeAlert}
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

      <PageContainer title={"Low Stock"}>
        <Box sx={{ flex: 1, width: "100%" }}>
          <DataGrid
            rows={LowStockrowsState.rows}
            rowCount={LowStockrowsState.rowCount ?? 0}
            getRowId={(row) => row.requestId}
            columns={lowStockColumns}
            pagination
            sortingMode="server"
            sortModel={sortModel}
            filterMode="server"
            paginationMode="server"
            paginationModel={paginationModelLowStock}
            onPaginationModelChange={handlePaginationModelChangeLowStock}
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

function UseCellLowStock({ row, onOrder }) {
  const minValue = Math.max(
    row.requested_quantity,
    row.threshold - row.quantity
  );
  const [value, setValue] = useState(minValue.toString());

  useEffect(() => {
    setValue(minValue.toString());
  }, [row?.id]);

  const parseAmount = (v) => {
    if (v === "" || v == null) return 0;
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n));
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    const prev = parseAmount(value);
    const next = parseAmount(raw);
    const max = 100;

    if (prev === minValue && next < prev) {
      return;
    }
    if (prev === max) {
      return;
    }

    const clamped = Math.max(0, Math.min(next, max));

    setValue(String(clamped));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleClick();
    }
  };

  const handleClick = () => {
    const amount = parseAmount(value);
    if (amount < minValue) return;
    onOrder(row, amount);
  };

  const numericValue = parseAmount(value);

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <TextField
        size="small"
        variant="outlined"
        type="number"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        sx={{ width: 90 }}
        aria-label={`use-amount-${row.id}`}
        inputProps={{
          min: 0,
          max: 100,
          inputMode: "numeric",
          pattern: "[0-9]*",
          step: 1,
        }}
      />
      <Button size="small" variant="contained" onClick={handleClick}>
        Order
      </Button>
    </Box>
  );
}

function UseCellAlert({ row, onOrder }) {
  const handleClick = () => {
    onOrder(row);
  };

  return (
    <Button size="small" variant="contained" onClick={handleClick}>
      Replace
    </Button>
  );
}
