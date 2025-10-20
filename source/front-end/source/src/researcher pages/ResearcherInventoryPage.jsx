import CssBaseline from '@mui/material/CssBaseline';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '../components/AuthContext'; 

import AppTheme from '../themes/AppTheme';
import {
  dataGridCustomizations,
  datePickersCustomizations,
  formInputCustomizations,
} from '../themes/customization';
const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...formInputCustomizations,
};

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField'; // <-- added
import {
  DataGrid,
  GridActionsCellItem,
  gridClasses,
  Toolbar,
  QuickFilter,
  QuickFilterControl,
  QuickFilterTrigger,
  QuickFilterClear,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useDialogs } from '../hooks/useDialogs';
// import useNotifications from '../hooks/useNotifications/useNotifications';
import {
  getMany,
} from '../services/labManagerServices';

import { useMaterial } from '../services/researcherServices';

import PageContainer from '../components/PageContainer';


const INITIAL_PAGE_SIZE = 10

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
  const {user} = useAuth();

  const dialogs = useDialogs();
  // const notifications = useNotifications();

  const [paginationModel, setPaginationModel] = useState({
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0, //get page number
    pageSize: searchParams.get('pageSize') //get page size
      ? Number(searchParams.get('pageSize'))
      : INITIAL_PAGE_SIZE,
  });

  // If a filter query param exists, it attempts to JSON.parse its value and use that as the initial filter mode
  const [filterModel, setFilterModel] = useState(
    searchParams.get('filter')
      ? JSON.parse(searchParams.get('filter') ?? '')
      : { items: [] },
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
      searchParams.set('page', String(model.page));
      searchParams.set('pageSize', String(model.pageSize));
      const newSearchParamsString = searchParams.toString();
      navigate(`${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`);
    },
    [navigate, pathname, searchParams],
  );

  const handleFilterModelChange = useCallback(
    (model) => {
      setFilterModel(model);
      console.log("model", model);
      
      if (
        model.items.length > 0 ||
        (model.quickFilterValues && model.quickFilterValues.length > 0)
      ) {
        searchParams.set('filter', JSON.stringify(model));
      } else {
        searchParams.delete('filter');
      }
      const newSearchParamsString = searchParams.toString();
      console.log("parm:", newSearchParamsString);
      
      navigate(`${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`);
    },
    [navigate, pathname, searchParams],
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
      console.log(listData);
      
      setRowsState({
        rows: listData.items,
        rowCount: listData.itemCount,
      });
    } catch (listDataError) {
      setError(listDataError);
    }
    setIsLoading(false);
  }, [paginationModel, filterModel, user?.departmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    if (!isLoading) {
      loadData();
    }
  }, [isLoading, loadData]);

  const handleCreateClick = useCallback(() => {
    navigate('new');
  }, [navigate]);

  

  
  // Called when user clicks Use button in the cell: rowId and amount are provided.
  const handleUse = useCallback(
  async (row, amount) => {
    // Show confirmation
    const confirmed = await dialogs.confirm(
      `Do you want to use ${amount} unit${amount === 1 ? '' : 's'} of "${row.name}"?`,
      {
        title: 'Confirm use',
        severity: 'warning',
        okText: 'Use',
        cancelText: 'Cancel',
      },
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      // call real backend
      const result = await useMaterial(row.id, amount);
      // backend returns Boolean (true/false) according to your controller
      if (result === true || result === undefined) {
        // treat undefined as success if your apiCall returns nothing
        await loadData();
        // optional quick feedback
        await dialogs.alert(`Used ${amount} unit${amount === 1 ? '' : 's'} of "${row.name}".`, {
          title: 'Success',
        });
      } else {
        // backend returned false
        await dialogs.alert(`Unable to use the material.`, { title: 'Error', severity: 'error' });
      }
    } catch (err) {
      console.error('Error using material', err);
      await dialogs.alert(`Error: ${err?.message ?? 'Unknown error'}`, { title: 'Error', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  },
  [dialogs, loadData],
);
  // ------------------------------------------------

  const initialState = useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
    }),
    [],
  );

  const columns = useMemo(
    () => [
      { field: 'name', headerName: 'Name', width: 180, sortable: false, disableColumnMenu: true ,flex:1},
      { field: 'category', headerName: 'Category', width:180,sortable: false, disableColumnMenu: true, valueGetter:(params) => params?.title ?? ''  ,flex:1},
      { field: 'threshold', headerName: 'Threshold', type: 'number', width:100,sortable: false, disableColumnMenu: true ,flex:1},
      { field: 'quantity', headerName: 'Quantity', type: 'number', width: 100,sortable: false, disableColumnMenu: true,flex:1},
      {
  field: 'use',
  headerName: 'Use',
  width: 220,
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  renderCell: (params) => (
    // pass entire row to handler so confirmation can show row.name
    <UseCell row={params.row} onUse={(rowObj, amount) => handleUse(rowObj, amount)} />
  ),
},
    ],
    [handleUse],
  );

  const pageTitle = 'Inventory';


  return (
    <AppTheme {...props} themeComponents={themeComponents}>
      <CssBaseline enableColorScheme />
          <PageContainer
      title={pageTitle}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Reload data" placement="right" enterDelay={1000}>
            <div>
              <IconButton size="small" aria-label="refresh" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </div>
          </Tooltip>
          <Button variant="contained" onClick={handleCreateClick} startIcon={<AddIcon />}>
            Create
          </Button>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: '100%' }}>
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
                outline: 'transparent',
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]: {
                outline: 'none',
              },
            
            }}
            slotProps={{
              loadingOverlay: {
                variant: 'circular-progress',
                noRowsVariant: 'circular-progress',
              },
              baseIconButton: {
                size: 'small',
              },
            }}
          />
          </Box>
    </PageContainer>
    </AppTheme>
  );
}

/**
 * UseCell - small local component rendered inside DataGrid cell.
 * Props:
 *  - row: the full row object
 *  - onUse: function(rowId, amount) => void  (called when user presses button or Enter)
 */
function UseCell({ row, onUse }) {
  const [value, setValue] = useState(1);

  useEffect(() => {
    const defaultValue = Number.isFinite(Number(row?.quantity)) && row.quantity > 0 ? 1 : 0;
    setValue(defaultValue);
  }, [row?.quantity]);

  const parseAmount = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n));
  };

  const handleClick = () => {
    const amount = parseAmount(value);
    if (amount <= 0) return;
    const useAmount = Math.min(amount, Number(row.quantity || 0));
    if (useAmount <= 0) return;
    // Now we call parent with the whole row so it can show name/other info in dialog
    onUse(row, useAmount);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <TextField
        size="small"
        variant="outlined"
        type="number"
        inputProps={{ min: 0, step: 1 }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 90 }}
        aria-label={`use-amount-${row.id}`}
      />
      <Button
        size="small"
        variant="contained"
        onClick={handleClick}
        disabled={Number(row.quantity || 0) <= 0}
      >
        Use
      </Button>
    </Box>
  );
}
