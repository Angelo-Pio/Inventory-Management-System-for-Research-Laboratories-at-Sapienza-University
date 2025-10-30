// LowStock.jsx
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import AppTheme from "../themes/AppTheme";
import PageContainer from "../components/PageContainer";
import { createMqttManager } from "../services/mqtt";
import { getMaterialById, updateMaterialQuantity } from "../services/labManagerServices";
import { useAuth } from "../components/AuthContext";
import { useDialogs } from "../hooks/useDialogs";
import { useLocation, useNavigate, useSearchParams } from "react-router";

const MQTT_BROKER_URL = "ws://localhost:15675/ws";
const MQTT_USERNAME = "guest";
const MQTT_PASSWORD = "guest";
const INITIAL_PAGE_SIZE = 10;

const themeComponents = {}; // keep your theme imports here (omitted for brevity)

export default function LowStock(props) {
  const { department, user } = useAuth();
  const dialogs = useDialogs();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

const [sortModel, setSortModel] = useState([
    { field: "name", sort: "asc" },
  ]);
  const [messages, setMessages] = useState([]); // raw incoming messages (from MQTT)
  const [rowsState, setRowsState] = useState({ rows: [], rowCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const messagesInitializedRef = useRef(false);

  // pagination/filter state (same as your original)
  const [paginationModel, setPaginationModel] = useState({
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 0,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : INITIAL_PAGE_SIZE,
  });
  const [filterModel, setFilterModel] = useState(
    searchParams.get("filter") ? JSON.parse(searchParams.get("filter") ?? "") : { items: [] }
  );

  // start MQTT manager once department.id is available
  useEffect(() => {
    if (!department?.id) return;

    const mgr = createMqttManager({
      brokerUrl: MQTT_BROKER_URL,
      options: {
        username: MQTT_USERNAME,
        password: MQTT_PASSWORD,
        path: "/ws",
        keepalive: 15,
        reconnectPeriod: 10000,
        clean: true,
      },
    });

    mgr.start(
      department.id,
      ({ topic, payload }) => {
        // payload is already parsed object by mqttManager
        setMessages((prev) => {
          // avoid duplicates by materialId & type if necessary
          const duplicate = prev.some((m) => m.materialId === payload.materialId && m.type === payload.type);
          if (duplicate) return prev;
          return [payload, ...prev];
        });
      },
      (statusText) => {
        // optional: set a visual status somewhere
        console.debug("MQTT status:", statusText);
      }
    );

    return () => {
      mgr.stop();
    };
  }, [department?.id]);

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

  const initialState = useMemo(
      () => ({
        pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
      }),
      []
    );


  // Hook that loads unified materials from messages and updates rowsState
  const loadUnifiedMessages = useCallback(async () => {
    // CASE A: initial empty
    const isInitialEmpty = !messagesInitializedRef.current && (!messages || messages.length === 0);
    if (isInitialEmpty) {
      setIsLoading(true);
      setRowsState({ rows: [], rowCount: 0 });
      return;
    }

    setIsLoading(true);
    let unifiedMaterials = [];
    try {
      if (!messages || messages.length === 0) {
        // real empty (after init)
        unifiedMaterials = [];
      } else {
        // optional: dedupe materialIds to avoid repeated backend calls
        const seen = new Set();
        const uniqueMessages = [];
        for (const m of messages) {
          if (!seen.has(m.materialId)) {
            uniqueMessages.push(m);
            seen.add(m.materialId);
          }
        }

        const unified = await Promise.all(
          uniqueMessages.map(async (msg) => {
            try {
              const response = await getMaterialById(msg.materialId);
              const mat = response.data;
              return {
                name: mat.name,
                quantity: mat.quantity,
                threshold: mat.threshold,
                status: mat.status,
                category: mat.category ?? "-",
                materialId: mat.id,
                researcher: mat.researcher ?? "-",
                type: msg.type ?? "",
              };
            } catch (err) {
              console.error("Error fetching material for id", msg.materialId, err);
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

      messagesInitializedRef.current = true;
      setRowsState({ rows: unifiedMaterials, rowCount: unifiedMaterials.length });
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  // re-run whenever messages change (or pagination/filter if you want)
  useEffect(() => {
    loadUnifiedMessages();
  }, [loadUnifiedMessages]);

  // handle ordering / using material
  const handleOrder = useCallback(
    async (row, amount) => {
      const confirmed = await dialogs.confirm(
        `Do you want to order ${amount} unit${amount === 1 ? "" : "s"} of "${row.name}"?`,
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
        const payload = { materialId: row.materialId, userId: user.id, quantity: amount };
        const result = await updateMaterialQuantity(department.id, payload);

        if (result?.data === true || result === undefined) {
          // refresh unified data and remove message(s) referring to this material
          await loadUnifiedMessages();
          setMessages((prev) => prev.filter((m) => m.materialId !== row.materialId));
        } else {
          await dialogs.alert(`Unable to use the material.`, { title: "Error", severity: "error" });
        }
      } catch (err) {
        console.error("Error using material", err);
        await dialogs.alert(`Error: ${err?.message ?? "Unknown error"}`, { title: "Error", severity: "error" });
      } finally {
        setIsLoading(false);
      }
    },
    [dialogs, department?.id, user?.id, loadUnifiedMessages]
  );

  // DataGrid columns (use your existing columns)
  const columns = useMemo(
    () => [
      { field: "name", headerName: "Name", width: 180, sortable: false, disableColumnMenu: true },
      { field: "researcher", headerName: "Researcher", width: 140, sortable: false, disableColumnMenu: true },
      { field: "category", headerName: "Category", width: 140, sortable: false, disableColumnMenu: true },
      { field: "quantity", headerName: "Quantity", width: 100, sortable: false, disableColumnMenu: true },
      { field: "threshold", headerName: "Threshold", width: 100, sortable: false, disableColumnMenu: true },
      {
        field: "orderQuantity",
        headerName: "Order Quantity",
        width: 220,
        sortable: false,
        disableColumnMenu: true,
        renderCell: (params) => <UseCell row={params.row} onOrder={(r, amount) => handleOrder(r, amount)} />,
      },
    ],
    [handleOrder]
  );

  const pageTitle = "Low Stock";

  return (
    <AppTheme {...props} themeComponents={themeComponents}>
      <CssBaseline enableColorScheme />
      <PageContainer title={pageTitle}>
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
        sx={{ width: 90, height:25 }}
        aria-label={`use-amount-${row.id}`}
        inputProps={{
          min: 0,
          max: 100,
          inputMode: "numeric",
          pattern: "[0-9]*",
          step: 1,
        }}
      />
      <Button size="small" sx={{ width: 90, height:35 }} variant="contained" onClick={handleClick}>
        Order
      </Button>
    </Box>
  );
}
