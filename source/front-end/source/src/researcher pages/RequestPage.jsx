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
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField"; // <-- added
import {
  DataGrid,
  gridClasses,
  Toolbar,
  QuickFilter,
  QuickFilterControl,
} from "@mui/x-data-grid";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useDialogs } from "../hooks/useDialogs";

import {
  updateMaterialQuantity,
  getMaterialById,
} from "../services/labManagerServices";

import PageContainer from "../components/PageContainer";

const INITIAL_PAGE_SIZE = 10;

import {
  createMqttClient,
  subscribe,
  disconnect,
} from "../services/notificationServices";
import { useTimeout } from "@mui/x-data-grid/internals";

const MQTT_BROKER_URL = "ws://localhost:15675/ws";
const MQTT_USERNAME = "guest";
const MQTT_PASSWORD = "guest";

export default function MqttSubscriberApp(props) {
  const [status, setStatus] = useState("Disconnesso");
  const [messages, setMessages] = useState([]);
  const { department, user } = useAuth();

  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sortModel, setSortModel] = useState([{ field: "name", sort: "asc" }]);

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
  const messagesInitializedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const dialogs = useDialogs();
  // const notifications = useNotifications();

  const [paginationModel, setPaginationModel] = useState({
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 0, //get page number
    pageSize: searchParams.get("pageSize") //get page size
      ? Number(searchParams.get("pageSize"))
      : INITIAL_PAGE_SIZE,
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

    //MQTT code
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

    // subscribe to topic (qos 1)
    subscribe(newClient, currentTopic, { qos: 1 }, (err) => {
      if (!err) {
        setStatus(`Connesso e sottoscritto a ${currentTopic}`);
      } else {
        setStatus(`Connesso ma SOTTOSCRIZIONE FALLITA a ${currentTopic}`);
      }
    });

    // cleanup on unmount or when department.id changes
    return () => {
      disconnect(newClient);
      setStatus("Disconnesso (Pulizia eseguita)");
    };
  }, [department?.id]);

  //
  //End mqtt code
  //

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
    // CASE A: initial empty (component just mounted and messages is still the placeholder [])
    const isInitialEmpty =
      !messagesInitializedRef.current && (!messages || messages.length === 0);

    if (isInitialEmpty) {
      // show spinner because we expect messages to be filled soon
      setIsLoading(true);

      // Optionally set rows to empty so the UI doesn't show stale content:
      setRowsState({ rows: [], rowCount: 0 });

      // Do not mark messages as "initialized" — wait until we actually receive data
      return;
    }

    // From here on, either we have messages to process, or this is a subsequent change
    setIsLoading(true);

    let unifiedMaterials = [];
    try {
      if (!messages || messages.length === 0) {
        // real empty (we've already initialized before)
        unifiedMaterials = [];
      } else {
        const unified = await Promise.all(
          messages.map(async (msg) => {
            try {
              const response = await getMaterialById(msg.materialId);
              const mat = response.data;
              return {
                name: mat.name,
                quantity: mat.quantity,
                threshold: mat.threshold,
                status: mat.status,
                category: mat.category ?? "-", // backend or fallback
                materialId: mat.id,
                researcher: mat.researcher ?? "-",
                type: msg.type ?? "",
              };
            } catch (err) {
              console.error(
                "Error fetching material for id",
                msg.materialId,
                err
              );
              return {
                name: msg.name ?? "",
                quantity: msg.quantity ?? 0,
                threshold: null,
                status: null,
                category: "",
                materialId: msg.materialId,
                type: msg.type,
              };
            }
          })
        );

        unifiedMaterials = unified;
      }

      // after a successful process of (possibly empty) messages we consider messages initialized
      messagesInitializedRef.current = true;

      // update rows
      setRowsState({
        rows: unifiedMaterials,
        rowCount: unifiedMaterials.length,
      });
    } finally {
      // Always clear loading after the real processing finishes
      setIsLoading(false);
    }
  }, [messages, paginationModel, filterModel, user?.departmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Called when user clicks Use button in the cell: rowId and amount are provided.
  const handleOrder = useCallback(
    async (row, amount) => {
      // Show confirmation
      const confirmed = await dialogs.confirm(
        `Do you want to order ${amount} unit${amount === 1 ? "" : "s"} of "${
          row.name
        }"?`,
        {
          title: "Confirm order",
          severity: "warning",
          okText: "Use",
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
        const result = await updateMaterialQuantity(department.id, payload);
        console.log(result);

        if (result.data === true || result === undefined) {
          await loadData();
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg.materialId !== row.materialId)
          );

          console.log("YEEEE");
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
        field: "researcher",
        headerName: "Researcher",
        width: 140,
        sortable: false,
        disableColumnMenu: true,
      },
      {
        field: "category",
        headerName: "Category",
        width: 140,
        sortable: false,
        disableColumnMenu: true,
      },
      {
        field: "quantity",
        headerName: "Quantity",
        width: 100,
        sortable: false,
        disableColumnMenu: true,
      },
      {
        field: "threshold",
        headerName: "Threshold",
        width: 100,
        sortable: false,
        disableColumnMenu: true,
      },
      {
        field: "orderQuantity",
        headerName: "Order Quantity",
        width: 220,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          // pass entire row to handler so confirmation can show row.name
          <UseCell
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
      
      <PageContainer title={"Low Stock"}>
        <Box sx={{ flex: 1, width: "100%" }}>
          <DataGrid
            rows={rowsState.rows}
            rowCount={rowsState.rowCount ?? 0}
            getRowId={(row) => row.materialId}
            columns={columns}
            pagination
            sortingMode="server"
            sortModel={sortModel}
            filterMode="server"
            paginationMode="server"
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

function UseCell({ row, onOrder }) {
  // keep the displayed value as a string to avoid fighting the TextField control

  const [value, setValue] = useState((row.threshold - row.quantity).toString());

  useEffect(() => {
    // reset to 0 when the row changes
    setValue((row.threshold - row.quantity).toString());
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

    // RULES:
    // - if prev === 0, don't allow decreasing (ignore any next < prev)
    if (prev === row.threshold - row.quantity && next < prev) {
      return; // ignore
    }
    // - if prev === max, don't allow increasing (ignore any next > prev)
    if (prev === max) {
      return; // ignore
    }

    // clamp into 0..max
    const clamped = Math.max(0, Math.min(next, max));

    // store the clamped numeric string (keeps input predictable)
    setValue(String(clamped));
  };

  const handleKeyDown = (e) => {
    // allow Enter to trigger "Use"
    if (e.key === "Enter") {
      e.preventDefault();
      handleClick();
    }
  };

  const handleClick = () => {
    const amount = parseAmount(value);
    if (amount < row.threshold - row.quantity) return;
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
