// Questo file contiene l'implementazione di un'applicazione React a file singolo per testare la connessione
// e la sottoscrizione a un broker RabbitMQ tramite il protocollo MQTT su WebSockets (porta 15675).

// Istruzioni: Questa applicazione si basa sull'esistenza della libreria MQTT (mqtt.min.js) caricata
// tramite un tag <script> CDN nel documento HTML principale, rendendola accessibile tramite window.mqtt.

import React, { useState, useEffect } from 'react';
// ATTENZIONE: l'import "mqtt" fallirà la compilazione. Si accede a window.mqtt.
// Si assume che il file sia eseguito in un contesto dove il CDN di mqtt è caricato.
import mqtt from 'mqtt';
// ----------------------------------------------------------------------------------
// CONFIGURAZIONE MQTT (Adatta queste costanti al tuo ambiente)
// ----------------------------------------------------------------------------------
const MQTT_BROKER_URL = 'ws://localhost:15675/ws';

// Credenziali di default (sostituire con le variabili del proprio .env per il test)
// Si usano come fallback o per testare l'autenticazione richiesta da RabbitMQ.
const MQTT_USERNAME = 'guest'; // Utente RabbitMQ
const MQTT_PASSWORD = 'guest'; // Password RabbitMQ
const DEFAULT_DEPT_ID = 1;

// ----------------------------------------------------------------------------------
// UTILITY: Funzione per controllare la disponibilità della libreria MQTT
// ----------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------
// COMPONENTE PRINCIPALE DI SOTTOSCRIZIONE
// ----------------------------------------------------------------------------------
export default function MqttSubscriberApp() {
  const [status, setStatus] = useState('Disconnesso');
  const [messages, setMessages] = useState([]);
  const [departmentId, setDepartmentId] = useState(DEFAULT_DEPT_ID);
  const [client, setClient] = useState(null);

  // Effetto per gestire la connessione e la sottoscrizione
  useEffect(() => {

    if (!mqtt) return;

    const currentTopic = `${departmentId}/notifications`;
    const clientId = `mqtt_react_client_${new Date().getTime()}`;
    
    // Opzioni di connessione aggiornate per includere autenticazione e path: '/'
    const options = {
      clientId: clientId,
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
      // CRUCIALE: Forzare il percorso radice per RabbitMQ MQTT su WebSockets
      path: '/ws',
      keepalive: 15, // Secondi
      reconnectPeriod: 10000, // m
      clean : true,
    };

    console.log(`Connessione al broker MQTT su: ${MQTT_BROKER_URL}`);
    console.log(`Tentativo di connessione con client ID: ${clientId}`);

    // Se esiste già un client, lo chiudiamo prima di aprirne uno nuovo (necessario per cambiare topic)
    if (client) {
      console.log('Chiusura della connessione precedente...');
      client.end(true);
      setClient(null);
      setStatus('Disconnesso (Riconnessione in corso...)');
    }

    const newClient = mqtt.connect(MQTT_BROKER_URL, options);
    setClient(newClient);

    // Gestione Eventi
    newClient.on('connect', () => {
      setStatus(`Connesso al broker. Tentativo di sottoscrizione a ${currentTopic}...`);
      newClient.subscribe(currentTopic, { qos: 1 }, (err) => {
        if (!err) {
          setStatus(`Connesso e sottoscritto a ${currentTopic}`);
          console.log(`Sottoscrizione riuscita a: ${currentTopic}`);
        } else {
          setStatus(`Connesso ma SOTTOSCRIZIONE FALLITA a ${currentTopic}`);
          console.error(`Errore di sottoscrizione: ${err}`);
        }
      });
    });

    newClient.on('message', (topic, message) => {
      // Il messaggio è un Buffer, lo convertiamo in stringa
      const payload = message.toString();
      const timestamp = new Date().toLocaleTimeString();

      setMessages(prevMessages => [{
        timestamp,
        topic,
        payload: payload,
      }, ...prevMessages].slice(0, 10)); // Mantiene solo gli ultimi 10 messaggi
      console.log(`Messaggio ricevuto su [${topic}]: ${payload}`);
    });

    newClient.on('error', (err) => {
      setStatus(`ERRORE DI CONNESSIONE: ${err.message}`);
      console.error("Errore MQTT:", err);
    });

    newClient.on('close', () => {
      // Questo evento si attiva se la connessione viene persa o chiusa dal server
      setStatus('Disconnesso (Connessione Persa)');
      console.log('Connessione MQTT chiusa.');
    });

    // Pulizia all'unmount (o al cambio di departmentId)
    return () => {
      if (newClient.connected) {
        newClient.end(true); // Chiude la connessione forzatamente
        console.log('Pulizia: Chiusura connessione MQTT.');
      }
    };
  }, [departmentId]); // Riconnette quando l'ID del Dipartimento cambia

  // ----------------------------------------------------------------------------------
  // RENDERIZZAZIONE
  // ----------------------------------------------------------------------------------
  const statusColor = status.includes('Connesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Test Notifiche MQTT</h1>
        <p className="text-gray-600">Verifica la connessione RabbitMQ/MQTT e la logica di routing Spring.</p>
      </header>

      <div className="mb-6 flex items-center justify-between p-4 rounded-lg shadow-md bg-white">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Dipartimento (Topic base: `{departmentId}/notifications`)
          </label>
          <input
            type="number"
            value={departmentId}
            onChange={(e) => setDepartmentId(parseInt(e.target.value, 10) || 1)}
            min="1"
            className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">Stato Connessione</p>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${statusColor}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Sezione Messaggi */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ultimi 10 Messaggi Ricevuti</h2>
        
        {messages.length === 0 ? (
          <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-lg">
            In attesa di messaggi sul topic `{departmentId}/notifications`. Assicurati che il servizio Spring stia pubblicando.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span className="font-mono text-indigo-600 truncate mr-4">
                    Topic: {msg.topic}
                  </span>
                  <span className="text-gray-500">
                    Ricevuto alle: {msg.timestamp}
                  </span>
                </div>
                <pre className="mt-1 p-3 bg-gray-50 text-gray-900 rounded font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                  {msg.payload}
                </pre>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
