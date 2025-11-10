import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import DialogsContext from './DialogsContext';

export default function DialogsProvider(props) {
  const { children, unmountAfter = 1000 } = props;
  const [stack, setStack] = React.useState([]);
  const keyPrefix = React.useId();
  const nextId = React.useRef(0);
  const dialogMetadata = React.useRef(new WeakMap());

  const requestDialog = useEventCallback(function open(Component, payload, options = {}) {
    const { onClose = async () => {} } = options;
    let resolve;
    const promise = new Promise((resolveImpl) => {
      resolve = resolveImpl;
    });

    if (!resolve) {
      throw new Error('resolve not set.');
    }

    const key = `${keyPrefix}-${nextId.current}`;
    nextId.current += 1;

    const newEntry = {
      key,
      open: true,
      promise,
      Component,
      payload,
      onClose,
      resolve,
    };

    dialogMetadata.current.set(promise, newEntry);

    setStack((prevStack) => [...prevStack, newEntry]);
    return promise;
  });

  const closeDialogUi = useEventCallback(function closeDialogUi(dialog) {
    setStack((prevStack) =>
      prevStack.map((entry) =>
        entry.promise === dialog ? { ...entry, open: false } : entry,
      ),
    );
    setTimeout(() => {
      setStack((prevStack) => prevStack.filter((entry) => entry.promise !== dialog));
    }, unmountAfter);
  });

  const closeDialog = useEventCallback(async function closeDialog(dialog, result) {
    const entryToClose = dialogMetadata.current.get(dialog);
    if (!entryToClose) {
      throw new Error('Dialog not found.');
    }

    try {
      await entryToClose.onClose(result);
    } finally {
      entryToClose.resolve(result);
      closeDialogUi(dialog);
    }
    return dialog;
  });

  const contextValue = React.useMemo(() => ({ open: requestDialog, close: closeDialog }), [
    requestDialog,
    closeDialog,
  ]);

  return (
    <DialogsContext.Provider value={contextValue}>
      {children}
      {stack.map(({ key, open, Component, payload, promise }) => (
        <Component
          key={key}
          payload={payload}
          open={open}
          onClose={async (result) => {
            await closeDialog(promise, result);
          }}
        />
      ))}
    </DialogsContext.Provider>
  );
}
