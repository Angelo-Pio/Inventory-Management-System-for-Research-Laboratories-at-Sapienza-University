import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import useEventCallback from '@mui/utils/useEventCallback';
import DialogsContext from './DialogsContext';

function useDialogLoadingButton(onClose) {
  const [loading, setLoading] = React.useState(false);
  const handleClick = async () => {
    try {
      setLoading(true);
      await onClose();
    } finally {
      setLoading(false);
    }
  };
  return {
    onClick: handleClick,
    loading,
  };
}

export function AlertDialog({ open, payload, onClose }) {
  const okButtonProps = useDialogLoadingButton(() => onClose());

  return (
    <Dialog maxWidth="xs" fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>{payload.title ?? 'Alert'}</DialogTitle>
      <DialogContent>{payload.msg}</DialogContent>
      <DialogActions>
        <Button disabled={!open} {...okButtonProps}>
          {payload.okText ?? 'Ok'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function ConfirmDialog({ open, payload, onClose }) {
  const cancelButtonProps = useDialogLoadingButton(() => onClose(false));
  const okButtonProps = useDialogLoadingButton(() => onClose(true));

  return (
    <Dialog maxWidth="xs" fullWidth open={open} onClose={() => onClose(false)}>
      <DialogTitle>{payload.title ?? 'Confirm'}</DialogTitle>
      <DialogContent>{payload.msg}</DialogContent>
      <DialogActions>
        <Button autoFocus disabled={!open} {...cancelButtonProps}>
          {payload.cancelText ?? 'Cancel'}
        </Button>
        <Button color={payload.severity} disabled={!open} {...okButtonProps}>
          {payload.okText ?? 'Ok'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function PromptDialog({ open, payload, onClose }) {
  const [input, setInput] = React.useState('');
  const cancelButtonProps = useDialogLoadingButton(() => onClose(null));

  const [loading, setLoading] = React.useState(false);

  const name = 'input';
  return (
    <Dialog
      maxWidth="xs"
      fullWidth
      open={open}
      onClose={() => onClose(null)}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: async (event) => {
            event.preventDefault();
            try {
              setLoading(true);
              const formData = new FormData(event.currentTarget);
              const value = formData.get(name) ?? '';

              if (typeof value !== 'string') {
                throw new Error('Value must come from a text input.');
              }

              await onClose(value);
            } finally {
              setLoading(false);
            }
          },
        },
      }}
    >
      <DialogTitle>{payload.title ?? 'Confirm'}</DialogTitle>
      <DialogContent>
        <DialogContentText>{payload.msg} </DialogContentText>
        <TextField
          autoFocus
          required
          margin="dense"
          id="name"
          name={name}
          type="text"
          fullWidth
          variant="standard"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button disabled={!open} {...cancelButtonProps}>
          {payload.cancelText ?? 'Cancel'}
        </Button>
        <Button disabled={!open} loading={loading} type="submit">
          {payload.okText ?? 'Ok'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function useDialogs() {
  const dialogsContext = React.useContext(DialogsContext);
  if (!dialogsContext) {
    throw new Error('Dialogs context was used without a provider.');
  }
  const { open, close } = dialogsContext;

  const alert = useEventCallback((msg, { onClose, ...options } = {}) =>
    open(AlertDialog, { ...options, msg }, { onClose }),
  );

  const confirm = useEventCallback((msg, { onClose, ...options } = {}) =>
    open(ConfirmDialog, { ...options, msg }, { onClose }),
  );

  const prompt = useEventCallback((msg, { onClose, ...options } = {}) =>
    open(PromptDialog, { ...options, msg }, { onClose }),
  );

  return React.useMemo(
    () => ({
      alert,
      confirm,
      prompt,
      open,
      close,
    }),
    [alert, close, confirm, open, prompt],
  );
}
