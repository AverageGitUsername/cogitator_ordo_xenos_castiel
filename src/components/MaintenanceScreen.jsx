import { useEffect, useState } from 'react';
import seal from '../assets/castiel-emblem.webp';

const SUPABASE_URL = 'https://zhutswzmyqletrtkuvzk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cMZ4E1-s7fuJQIGUand2Xg_xzDUsD6A';

function parseSiteStatus(value) {
  if (!value || typeof value !== 'object') {
    return { maintenance: false, announcement: '' };
  }
  return {
    maintenance: Boolean(value.maintenance),
    announcement: typeof value.announcement === 'string' ? value.announcement.trim() : '',
  };
}

export default function MaintenanceScreen() {
  const [status, setStatus] = useState({ maintenance: false, announcement: '' });
  const lang = typeof localStorage !== 'undefined' && localStorage.getItem('cogitator_lang') === 'en' ? 'en' : 'ru';

  useEffect(() => {
    const isAutomated = typeof navigator !== 'undefined' && Boolean(navigator.webdriver);
    if (isAutomated && !window.__TEST_MAINTENANCE__) {
      return;
    }

    let cancelled = false;
    let ws = null;
    let hbTimer = null;
    let reconnectTimer = null;
    let pollTimer = null;
    let refCounter = 1;

    async function fetchStatus() {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/site_config?key=eq.site_status&select=value`,
          {
            cache: 'no-store',
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
          }
        );
        if (!res.ok) return;
        const rows = await res.json();
        if (!cancelled && Array.isArray(rows) && rows[0]) {
          setStatus(parseSiteStatus(rows[0].value));
        }
      } catch {
        // ignore transient network errors
      }
    }

    function connectRealtime() {
      if (cancelled || (isAutomated && window.__TEST_MAINTENANCE_NO_WS__)) return;
      try {
        const wsUrl = SUPABASE_URL.replace(/^https:/, 'wss:') +
          `/realtime/v1/websocket?apikey=${encodeURIComponent(SUPABASE_KEY)}&vsn=1.0.0`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (cancelled || !ws || ws.readyState !== WebSocket.OPEN) return;
          ws.send(
            JSON.stringify({
              topic: 'realtime:public:site_config',
              event: 'phx_join',
              payload: {
                config: {
                  broadcast: { self: false },
                  presence: { key: '' },
                  postgres_changes: [
                    {
                      event: '*',
                      schema: 'public',
                      table: 'site_config',
                      filter: 'key=eq.site_status',
                    },
                  ],
                },
              },
              ref: String(refCounter++),
            })
          );

          if (hbTimer) clearInterval(hbTimer);
          hbTimer = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  topic: 'phoenix',
                  event: 'heartbeat',
                  payload: {},
                  ref: String(refCounter++),
                })
              );
            }
          }, 25000);
        };

        ws.onmessage = (event) => {
          if (cancelled) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg?.event === 'postgres_changes') {
              const record = msg.payload?.data?.record;
              if (record?.key === 'site_status') {
                setStatus(parseSiteStatus(record.value));
              }
            }
          } catch {
            // ignore malformed ws frames
          }
        };

        ws.onclose = () => {
          if (hbTimer) clearInterval(hbTimer);
          if (!cancelled) {
            reconnectTimer = setTimeout(connectRealtime, 3000);
          }
        };

        ws.onerror = () => {
          try {
            ws?.close();
          } catch {}
        };
      } catch {
        // fallback polling handles updates
      }
    }

    fetchStatus();
    connectRealtime();

    pollTimer = setInterval(fetchStatus, 8000);
    const onFocus = () => fetchStatus();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchStatus();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      if (hbTimer) clearInterval(hbTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pollTimer) clearInterval(pollTimer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      try {
        ws?.close();
      } catch {}
    };
  }, []);

  if (!status.maintenance) return null;

  return (
    <div
      id="maintenance-overlay"
      className="maint-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="maint-title"
    >
      <div className="maint-card">
        <div className="maint-header">
          <span>ORDO XENOS · COGITATOR LOCKOUT</span>
          <span className="maint-code">PROTOCOL 77-MAINT</span>
        </div>

        <div className="maint-body">
          <div className="maint-seal-wrap">
            <img className="maint-seal" src={seal} alt="" />
          </div>

          <p className="maint-kicker">
            {lang === 'en' ? '[ SYSTEM SEAL ENGAGED ]' : '[ АКТИВИРОВАНА ПЕЧАТЬ БЛОКИРОВКИ ]'}
          </p>

          <h1 id="maint-title" className="maint-title">
            {lang === 'en'
              ? 'COGITATOR MAINTENANCE PROTOCOL'
              : 'ТЕХНИЧЕСКОЕ ОБСЛУЖИВАНИЕ КОГИТАТОРА'}
          </h1>

          <p className="maint-desc">
            {lang === 'en'
              ? 'Terminal access is temporarily suspended by Ordo Xenos Tech-Priests. The interface will unlock automatically as soon as maintenance concludes.'
              : 'Доступ к терминалу временно приостановлен техножрецами Ордо Ксенос. Система автоматически разблокируется сразу после завершения работ.'}
          </p>

          {status.announcement ? (
            <div className="maint-dispatch">
              <div className="maint-dispatch-label">
                {lang === 'en' ? 'VOX-DISPATCH' : 'ВОКС-СООБЩЕНИЕ'}
              </div>
              <p className="maint-dispatch-text">{status.announcement}</p>
            </div>
          ) : null}

          <div className="maint-footer">
            <span className="maint-dot" aria-hidden="true" />
            <span>
              {lang === 'en'
                ? 'REALTIME LINK ACTIVE · AWAITING CLEARANCE'
                : 'КАНАЛ СВЯЗИ АКТИВЕН · ОЖИДАНИЕ ДОПУСКА'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
