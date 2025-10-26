import mqtt from "mqtt";

export function createMqttClient({ brokerUrl, options = {}, handlers = {} }) {
  const { onConnect, onMessage, onError, onClose } = handlers;

  const client = mqtt.connect(brokerUrl, options);

  client.on("connect", () => {
    onConnect && onConnect(client);
  });

  client.on("message", (topic, message) => {
    const payload = JSON.parse(message)
    onMessage && onMessage({ payload });
  });
  

  client.on("error", (err) => {
    onError && onError(err);
  });

  client.on("close", () => {
    onClose && onClose();
  });

  return client;
}

export function subscribe(client, topic, opts = { qos: 1 }, cb) {
  if (!client) return;
  if (client.connected) {
    client.subscribe(topic, opts, cb);
  } else {
    // If not connected yet, subscribe once we connect
    const onConnect = () => {
      client.subscribe(topic, opts, cb);
      // remove this one-time listener
      client.removeListener("connect", onConnect);
    };
    client.on("connect", onConnect);
  }
}

export function disconnect(client) {
  try {
    if (!client) return;
    // end(true) forces a close and clears queues
    client.end(true);
  } catch (e) {
    // swallow errors on cleanup
    console.warn("Error during MQTT disconnect", e);
  }
}

