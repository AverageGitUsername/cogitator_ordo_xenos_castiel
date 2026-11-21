/* ══════════════════════════════════════════════════════════════
   CASTIEL TERMINAL · SUPABASE TELEMETRY & INQUIRY DISPATCHER
   Direct browser-to-Supabase RPC ingestion (0 Vercel idle/heartbeat cost)
   ══════════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://zhutswzmyqletrtkuvzk.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_cMZ4E1-s7fuJQIGUand2Xg_xzDUsD6A';
const ADMIN_NOTIFY_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_NOTIFY_URL) || '';

function generateId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return prefix + '_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  }
  return (
    prefix +
    '_' +
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36)
  );
}

function getVisitorId() {
  try {
    var existing = localStorage.getItem('castiel_visitor_id');
    if (existing) return existing;
    var next = generateId('vis');
    localStorage.setItem('castiel_visitor_id', next);
    return next;
  } catch (e) {
    return generateId('vis');
  }
}

function getSessionId() {
  try {
    var existing = sessionStorage.getItem('castiel_session_id');
    if (existing) return existing;
    var next = generateId('ses');
    sessionStorage.setItem('castiel_session_id', next);
    return next;
  } catch (e) {
    return generateId('ses');
  }
}

function detectDevice(ua) {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

function detectOS(ua) {
  if (/windows/i.test(ua)) return 'Windows';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/macintosh|mac os x/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
}

function detectBrowser(ua) {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\/|opera/i.test(ua)) return 'Opera';
  if (/yabrowser/i.test(ua)) return 'Yandex';
  if (/firefox\//i.test(ua)) return 'Firefox';
  if (/chrome\/|crios\//i.test(ua)) return 'Chrome';
  if (/safari\//i.test(ua)) return 'Safari';
  return 'Other';
}

function getUtmSource() {
  try {
    return new URLSearchParams(window.location.search).get('utm_source') || null;
  } catch (e) {
    return null;
  }
}

function postSupabaseRpc(fnName, body) {
  return fetch(SUPABASE_URL + '/rest/v1/rpc/' + fnName, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: 'Bearer ' + SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(body),
    keepalive: true,
  });
}

export function createTerminalAnalytics() {
  var isAutomated =
    typeof navigator !== 'undefined' && Boolean(navigator.webdriver);
  var visitorId = getVisitorId();
  var sessionId = getSessionId();
  var currentTab = 'tab-bio';
  var currentLang = 'ru';
  var heartbeatTimer = null;

  function collectContext() {
    var ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
    var tz = '';
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (e) {}

    return {
      deviceType: detectDevice(ua),
      os: detectOS(ua),
      browser: detectBrowser(ua),
      screenRes:
        typeof screen !== 'undefined' ? screen.width + 'x' + screen.height : '',
      viewport:
        typeof window !== 'undefined'
          ? window.innerWidth + 'x' + window.innerHeight
          : '',
      timezone: tz,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      utmSource: getUtmSource(),
      userAgent: ua.slice(0, 480),
    };
  }

  function trackEvent(eventType, tabId, target, metadata) {
    if (isAutomated) return Promise.resolve();
    if (tabId) currentTab = tabId;
    var ctx = collectContext();

    return postSupabaseRpc('track_telemetry', {
      p_visitor_id: visitorId,
      p_session_id: sessionId,
      p_event_type: eventType || 'heartbeat',
      p_tab_id: tabId || currentTab,
      p_target: target || null,
      p_lang: currentLang,
      p_device_type: ctx.deviceType,
      p_os: ctx.os,
      p_browser: ctx.browser,
      p_screen_res: ctx.screenRes,
      p_viewport: ctx.viewport,
      p_timezone: ctx.timezone,
      p_referrer: ctx.referrer,
      p_utm_source: ctx.utmSource,
      p_user_agent: ctx.userAgent,
      p_metadata: metadata || {},
    }).catch(function () {});
  }

  function start(initialTab, initialLang) {
    if (initialTab) currentTab = initialTab;
    if (initialLang) currentLang = initialLang;
    if (isAutomated) return;

    trackEvent('tab_view', currentTab);

    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(function () {
      if (document.visibilityState === 'visible') {
        trackEvent('heartbeat', currentTab);
      }
    }, 30000);

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        trackEvent('heartbeat', currentTab);
      }
    });
  }

  function setLanguage(lang) {
    currentLang = lang === 'en' ? 'en' : 'ru';
  }

  function submitInquiry(payload) {
    if (isAutomated) return Promise.resolve(null);
    var ctx = collectContext();

    return postSupabaseRpc('submit_inquiry', {
      p_visitor_id: visitorId,
      p_session_id: sessionId,
      p_sender: payload.sender || '',
      p_message: payload.message || '',
      p_clearance: payload.clearance || 'VERMILION',
      p_relay: payload.relay || null,
      p_lang: payload.lang || currentLang,
      p_device_type: ctx.deviceType,
      p_user_agent: ctx.userAgent,
      p_page_url:
        typeof window !== 'undefined' ? window.location.href.slice(0, 480) : null,
    })
      .then(function (res) {
        return res.json().catch(function () {
          return null;
        });
      })
      .then(function (result) {
        if (result && result.ok && result.id && ADMIN_NOTIFY_URL) {
          fetch(ADMIN_NOTIFY_URL.replace(/\/$/, '') + '/api/inquiries/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inquiryId: result.id }),
            keepalive: true,
          }).catch(function () {});
        }
        return result;
      })
      .catch(function () {
        return null;
      });
  }

  return {
    start: start,
    setLanguage: setLanguage,
    trackEvent: trackEvent,
    submitInquiry: submitInquiry,
  };
}
