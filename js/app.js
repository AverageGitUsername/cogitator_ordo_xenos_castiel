/* ══════════════════════════════════════════════════════════════
   ORDO XENOS · SUBJECT-884 · CASTIEL — CORE APPLICATION LOGIC
   Модульный скрипт интерфейса, аудио-движка, вебхука и локализации
══════════════════════════════════════════════════════════════ */
import ru from '../locales/ru.js';
import en from '../locales/en.js';
import { createCogitatorAudioEngine } from './cogitatorAudio.js';
import { createTerminalAnalytics } from './analytics.js';
import { rangeMin, rangeMax, minDummies, maxDummies, visorPrelude, visorSettle, visorShots, visorScenario } from '../src/visorScenario.js';
import { resolveCaelisMap } from '../src/caelisMap.js';
import { escapeMarkup, mergeLocale } from '../src/cmsValues.js';

const locales = { ru, en };
const builtinNavOrder = ['tab-bio', 'tab-dossier', 'tab-armory', 'tab-logs', 'tab-astro', 'tab-squad', 'tab-comm'];

export default function initializeTerminal(cms) {
  var currentLang = localStorage.getItem('cogitator_lang') === 'en' ? 'en' : 'ru';
  var sfx = createCogitatorAudioEngine();
  var preview = cms.preview;
  var telemetry = createTerminalAnalytics({ preview });
  var currentLocales = locales;

  function L(lang) {
    return currentLocales[lang || currentLang] || ru;
  }

  function setElText(sel, txt) {
    var el = document.querySelector(sel);
    if (el) el.textContent = txt;
  }

  function setElHTML(sel, html) {
    var el = document.querySelector(sel);
    if (el) el.innerHTML = html;
  }

  /* ── SHARED APPLICATION STATE ── */
  var _dossierReady = false;
  var _corticalLinkRunning = false;
  var _corticalSynced = false;
  var _activeSquadIdx = null;
  var _activeRouteId = 'tab-bio';
  var _activeWidgetIds = ['tab-bio'];
  var bypassBootPreview = function () {};

  var _currentArmorNodeIdx = 0;
  var _currentAmmoIdx = 0;
  var _currentTargetIdx = 0;
  var _currentVisorMode = 0;

  var _astroInPlanet = false;
  var _selectedAstroIdx = 0;

  var _curSublimIdx = -1;
  var _currentActIdx = 0;

  var _commClearance = 'VERMILION';
  var _commRelayIdx = 0;

  var _bioEcgState = { bpm: 42, stress: false, sublim: false };

  var COMM_CIPHER_PROFILES = {
    OMICRON:   { rgb: [92, 214, 92],   freq: 1.5, amp: 0.22, speed: 1.4, fluxBase: 0.01 },
    CYAN:      { rgb: [106, 210, 245], freq: 2.2, amp: 0.30, speed: 1.9, fluxBase: 0.02 },
    MAGENTA:   { rgb: [240, 108, 184], freq: 3.0, amp: 0.38, speed: 2.4, fluxBase: 0.03 },
    VERMILION: { rgb: [255, 59, 48],   freq: 3.8, amp: 0.46, speed: 3.0, fluxBase: 0.04 },
    BLACK:     { rgb: [255, 72, 72],   freq: 5.0, amp: 0.58, speed: 4.0, fluxBase: 0.08 }
  };

  var COMM_RELAY_PROFILES = [
    { warpAmp: 0.06, warpSpeed: 1.2, fluxAdd: 0.00 },
    { warpAmp: 0.16, warpSpeed: 2.0, fluxAdd: 0.03 },
    { warpAmp: 0.44, warpSpeed: 3.5, fluxAdd: 0.14 }
 ];

  function openArchivePage(playOpenSound) {
    var arch = document.getElementById('psycho-archive');
    var dossierTab = document.getElementById('tab-dossier');
    if (arch) {
      arch.hidden = false;
      arch.classList.add('active');
    }
    if (dossierTab) dossierTab.classList.add('has-subpage');
    var contentEl = document.querySelector('.content');
    if (contentEl) contentEl.scrollTop = 0;
    if (playOpenSound) sfx.modalOpen();
    updateBreadcrumbs();
  }

  function getTabSectionLabel(tabId) {
    var authoredLabel = cms.labelFor(tabId, currentLang);
    if (authoredLabel) return authoredLabel;
    var loc = L();
    var navLabels = (loc.UI && loc.UI.sidebar && loc.UI.sidebar.navLabels) || [];
    var map = {
      'tab-bio': navLabels[0] || (currentLang === 'en' ? 'Biometrics' : 'Биометрия'),
      'tab-dossier': navLabels[1] || (currentLang === 'en' ? 'Dossier' : 'Досье'),
      'tab-armory': navLabels[2] || (currentLang === 'en' ? 'Armory' : 'Арсенал'),
      'tab-logs': navLabels[3] || (currentLang === 'en' ? 'Personal Logs' : 'Личные Логи'),
      'tab-astro': navLabels[4] || (currentLang === 'en' ? 'Astrography' : 'Астрография'),
      'tab-squad': navLabels[5] || (currentLang === 'en' ? 'Battle-Brothers' : 'Боевые Братья'),
      'tab-sublim': (loc.UI && loc.UI.sublim && loc.UI.sublim.title) || (currentLang === 'en' ? 'Sublimation' : 'Сублимация'),
      'tab-comm': navLabels[6] || (currentLang === 'en' ? 'Vox-Link' : 'Связь')
    };
    return map[tabId] || map['tab-bio'];
  }

  function renderBreadcrumbTrail(targetEl, crumbs) {
    if (!targetEl) return;
    targetEl.innerHTML = '';
    crumbs.forEach(function (c, i) {
      if (i > 0) {
        var sep = document.createElement('span');
        sep.className = 'bc-sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '›';
        targetEl.appendChild(sep);
      }
      if (c.current) {
        var cur = document.createElement('span');
        cur.className = 'bc-current';
        cur.setAttribute('aria-current', 'page');
        cur.textContent = c.label;
        targetEl.appendChild(cur);
      } else {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bc-link';
        btn.textContent = c.label;
        btn.onclick = function () {
          sfx.tabSwitch();
          if (c.action) c.action();
        };
        targetEl.appendChild(btn);
      }
    });
  }

  function updateBreadcrumbs() {
    var nav = document.getElementById('terminal-breadcrumbs');
    var squadNav = document.getElementById('squad-breadcrumbs');
    if (!nav && !squadNav) return;

    var rootLabel = currentLang === 'en' ? 'Home' : 'Главная';
    var sectionLabel = getTabSectionLabel(_activeRouteId);
    var subpageLabel = '';
    var onSectionClick = null;

    var arch = document.getElementById('psycho-archive');
    var squadModal = document.getElementById('squad-modal');

    if (_activeWidgetIds.includes('tab-dossier') && arch && arch.classList.contains('active')) {
      subpageLabel = currentLang === 'en' ? 'Psycho-Memorial Archive' : 'Психо-мемориальный архив';
      onSectionClick = function () { window.closeArchive(); };
    } else if (_activeWidgetIds.includes('tab-astro') && _astroInPlanet) {
      subpageLabel = currentLang === 'en' ? 'Caelis-9' : 'Каэлис-9';
      onSectionClick = function () { window.closeAstroPlanet(); };
    } else if (_activeWidgetIds.includes('tab-squad') && squadModal && squadModal.classList.contains('active') && _activeSquadIdx !== null) {
      var sqItem = (L().SQUAD_DATA || [])[_activeSquadIdx];
      subpageLabel = (sqItem && sqItem.name) || (currentLang === 'en' ? 'Dossier' : 'Досье');
      onSectionClick = function () { window.closeSquadModal(); };
    } else if (_activeWidgetIds.includes('tab-sublim') && _curSublimIdx >= 0) {
      subpageLabel = (currentLang === 'en' ? 'Scroll 0' : 'Свиток 0') + (_curSublimIdx + 1);
      onSectionClick = function () { window.encryptActiveSublimSlot(); };
    }

    if (_activeRouteId === cms.homeId() && !subpageLabel) {
      if (nav) {
        nav.hidden = true;
        nav.innerHTML = '';
      }
      if (squadNav) squadNav.innerHTML = '';
      return;
    }

    var crumbs = [{
      label: rootLabel,
      action: function () {
        window.closeArchive();
        window.closeSquadModal();
        if (_astroInPlanet) window.closeAstroPlanet();
        window.switchTab(cms.homeId());
      }
    }];

    if (subpageLabel) {
      crumbs.push({ label: sectionLabel, action: onSectionClick });
      crumbs.push({ label: subpageLabel, current: true });
    } else {
      crumbs.push({ label: sectionLabel, current: true });
    }

    if (nav) {
      nav.hidden = false;
      renderBreadcrumbTrail(nav, crumbs);
    }
    if (squadNav) {
      renderBreadcrumbTrail(squadNav, squadModal && squadModal.classList.contains('active') ? crumbs : []);
    }
  }
  var squadPlaceholder =
      '<svg class="sc-placeholder-svg" aria-hidden="true" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M20 95 L28 58 L50 48 L72 58 L80 95 Z" fill="#180404" stroke="#c0392b" stroke-width="1.5"/>' +
        '<path d="M12 65 C12 45, 32 45, 38 55 L34 85 L14 82 Z" fill="#120202" stroke="#c9a84c" stroke-width="1.4"/>' +
        '<path d="M88 65 C88 45, 68 45, 62 55 L66 85 L86 82 Z" fill="#120202" stroke="#c9a84c" stroke-width="1.4"/>' +
        '<path d="M35 28 L50 18 L65 28 L62 55 L50 62 L38 55 Z" fill="#220505" stroke="#e53935" stroke-width="1.6"/>' +
        '<polygon points="40,42 48,45 41,47" fill="#e53935"/>' +
        '<polygon points="60,42 52,45 59,47" fill="#e53935"/>' +
      '</svg>';

  function squadImage(item, lazy) {
    return item.img
      ? '<img data-squad-photo="' + escapeMarkup(item.img) + '" alt="' + escapeMarkup(item.name) + '"' +
        (lazy ? ' loading="lazy"' : '') + '>'
      : '';
  }

  function loadSquadPortraits(container) {
    container.querySelectorAll('img[data-squad-photo]').forEach(function (image) {
      var frame = image.closest('.sc-portrait, .sq-modal-portrait');
      var placeholder = frame.querySelector('.sc-placeholder-svg');
      var link = image.closest('.sq-portrait-link');
      image.addEventListener('load', function () {
        if (!image.naturalWidth) return;
        placeholder.setAttribute('hidden', '');
        image.dataset.loaded = '';
        if (link) link.hidden = false;
      });
      image.src = image.dataset.squadPhoto;
    });
  }

  window.renderSquadCards = function () {
    var grid = document.getElementById('squad-grid');
    if (!grid) return;
    var loc = L();
    var squadData = loc.SQUAD_DATA || [];
    var hoverPrompt = (loc.UI && loc.UI.squad && loc.UI.squad.hoverPrompt) || '[ ОТКРЫТЬ ДОСЬЕ ЦЕНЗОРА ]';

    grid.innerHTML = squadData.map(function (item, idx) {
      return (
        '<div class="squad-card" role="button" tabindex="0" data-squad-idx="' + idx + '" aria-label="' + escapeMarkup(item.name) + '" onclick="openSquadModal(' + idx + ')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();openSquadModal(' + idx + ');}">' +
          '<div class="sc-portrait">' +
            '<div class="sc-top-badges">' +
              '<span class="sc-slot-tag">' + escapeMarkup(item.slot) + '</span>' +
              '<span class="sc-clearance">' + escapeMarkup(item.status) + '</span>' +
            '</div>' +
            squadPlaceholder + squadImage(item, true) +
            '<div class="sc-hover-prompt">' + escapeMarkup(hoverPrompt) + '</div>' +
          '</div>' +
          '<div class="sc-footer">' +
            '<div class="sc-role">' + escapeMarkup(item.role) + '</div>' +
            '<div class="sc-name">' + escapeMarkup(item.name) + '</div>' +
            '<div class="sc-chapter">' + escapeMarkup(item.chapter) + '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
    loadSquadPortraits(grid);
  };

  window.openSquadModal = function (idx) {
    var loc = L();
    var squadData = loc.SQUAD_DATA || [];
    var d = squadData[idx];
    if (!d) return;
    _activeSquadIdx = idx;
    var uiSq = (loc.UI && loc.UI.squad) || {};

    document.getElementById('sqm-eyebrow').textContent = d.slot + (uiSq.modalStatusMid || ' · СТАТУС: ') + d.status;
    document.getElementById('sqm-name').textContent    = d.name;
    document.getElementById('sqm-sub').textContent     = d.chapter + ' · ' + d.role;
    document.getElementById('sqm-synergy').textContent = d.synergy;
    document.getElementById('sqm-priority').textContent = d.priority;
    document.getElementById('sqm-dossier').textContent = d.dossier;
    document.getElementById('sqm-verdict').textContent = d.verdict;

    var pBox = document.getElementById('sqm-portrait');
    var imgTag = squadImage(d, false);
    pBox.innerHTML = squadPlaceholder + (imgTag && d.link
      ? '<a hidden class="sq-portrait-link" href="' + escapeMarkup(d.link) + '" target="_blank" rel="noopener noreferrer" title="' + escapeMarkup(uiSq.modalLinkTitle || '') + '">' +
          imgTag + '<span class="sq-link-badge">' + escapeMarkup(uiSq.modalLinkBadge || '[ ↗ ]') + '</span></a>'
      : imgTag);
    loadSquadPortraits(pBox);

    document.getElementById('sqm-b1').style.width = '0%';
    document.getElementById('sqm-b2').style.width = '0%';
    document.getElementById('sqm-b3').style.width = '0%';
    document.getElementById('squad-modal').classList.add('active');
    sfx.modalOpen();
    telemetry.trackEvent('squad_open', 'tab-squad', d.name || String(idx));
    updateBreadcrumbs();
    requestAnimationFrame(function () {
      var closeBtn = document.querySelector('#squad-modal .modal-close');
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    });

    setTimeout(function () {
      document.getElementById('sqm-v1').textContent = d.discipline + '%';
      document.getElementById('sqm-b1').style.width = d.discipline + '%';
      document.getElementById('sqm-v2').textContent = d.control + '%';
      document.getElementById('sqm-b2').style.width = d.control + '%';
      document.getElementById('sqm-v3').textContent = d.risk + '%';
      document.getElementById('sqm-b3').style.width = d.risk + '%';
    }, 80);
  };

  window.closeSquadModal = function () {
    var prevIdx = _activeSquadIdx;
    _activeSquadIdx = null;
    var m = document.getElementById('squad-modal');
    if (m && m.classList.contains('active')) {
      m.classList.remove('active');
      sfx.modalClose();
      if (prevIdx !== null) {
        var card = document.querySelector('.squad-card[data-squad-idx="' + prevIdx + '"]');
        if (card) card.focus({ preventScroll: true });
      }
    }
    updateBreadcrumbs();
  };

  /* ══════════════════════════════════════════════
     2. ARMORY: AUSPEX NODES, AMMO, VISOR & WEAPON CARDS
  ══════════════════════════════════════════════ */
  window.selectArmorNode = function (idx) {
    var loc = L();
    var nodes = loc.ARMOR_NODES || [];
    var n = nodes[idx];
    if (!n) return;
    _currentArmorNodeIdx = idx;

    document.getElementById('ni-code').textContent   = n.code;
    document.getElementById('ni-title').textContent  = n.title;
    document.getElementById('ni-status').textContent = n.status;
    document.getElementById('ni-desc').textContent   = n.desc;

    var extra = (loc.NODE_EXTRA_METRICS || [])[idx];
    if (extra) {
      document.getElementById('nit-v1').textContent = extra[0];
      document.getElementById('nit-v2').textContent = extra[1];
      document.getElementById('nit-v3').textContent = extra[2];
      document.getElementById('nit-v4').textContent = extra[3];
    }

    document.querySelectorAll('.armor-node').forEach(function (el, i) {
      el.classList.toggle('active', i === idx);
    });
    document.querySelectorAll('.ni-btn').forEach(function (btn, i) {
      btn.classList.toggle('active', i === idx);
    });
  };

  var _visorDist = 1840;
  var _visorBurst = false;
  var _visorSpread = false;
  var _visorCharge = false;
  var _visorDummies = 3;
  var _visorScenario;
  var _visorRun = null;
  var _visorFrame = null;
  var _visorRenderer;
  var _visorLoad;
  var _visorViewport = document.getElementById('visor-viewport');
  var _visorCanvas = document.getElementById('visor-3d-canvas');
  var _visorPanel = document.getElementById('visor-panel');
  var _visorExpand = document.getElementById('visor-expand');
  var _visorCastView = document.getElementById('visor-cast-view');
  var _visorReceiverView = document.getElementById('visor-receiver-view');

  function updateVisorRangeTelemetry() {
    var ui = L().UI.armory;
    var distance = new Intl.NumberFormat(currentLang).format(_visorDist);
    var tof = _visorScenario.tof ?? (_visorScenario.flight * _visorScenario.trace.end);
    var time = new Intl.NumberFormat(currentLang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tof);
    setElText('#visor-dist-val', distance);
    setElText('#visor-hud-tof', ui.tofPrefix + ': ' + time + ' ' + ui.tofUnit);
  }

  function updateVisorScenario() {
    _visorScenario = visorScenario(_visorDist, _currentAmmoIdx, _visorDummies, _visorCharge);
    _visorRun = null;
    setVisorStep('ready');
    updateVisorShotStatus('ready');
    updateVisorRangeTelemetry();
  }

  window.onVisorDistChange = function (value) {
    var next = Math.max(rangeMin, Math.min(rangeMax, Number(value) || 1840));
    if (next === _visorDist) return;
    _visorDist = next;
    updateVisorScenario();
    sfx.visorRangeTick(_visorDist);
  };

  window.setVisorBurst = function (burst) {
    if (_visorBurst === burst) return;
    _visorBurst = burst;
    document.querySelectorAll('[data-visor-burst]').forEach(function (button) {
      button.setAttribute('aria-pressed', Number(button.dataset.visorBurst) === Number(burst));
    });
    updateVisorScenario();
  };

  function updateVisorTraceLabel() {
    var names = ['Executioner', 'Mortis', 'Infernus'];
    setElText('#visor-svg-ammo', names[_currentAmmoIdx]);
  }

  window.selectAmmo = function (idx, btnEl) {
    var loc = L();
    var a = (loc.AMMO_TYPES || [])[idx];
    if (!a) return;
    _currentAmmoIdx = idx;

    document.querySelectorAll('.ammo-tab').forEach(function (t, i) {
      t.classList.toggle('active', btnEl ? t === btnEl : i === idx);
    });
    document.querySelectorAll('[data-visor-ammo]').forEach(function (button) {
      button.setAttribute('aria-pressed', Number(button.dataset.visorAmmo) === idx);
    });
    var changed = !_visorScenario || _visorScenario.ammo !== idx;
    updateVisorTraceLabel();
    document.getElementById('ammo-desc').innerHTML = a.desc;
    document.getElementById('am-v1').textContent = a.b1 + '%';
    document.getElementById('am-b1').style.width = a.b1 + '%';
    document.getElementById('am-v2').textContent = a.b2 + '%';
    document.getElementById('am-b2').style.width = a.b2 + '%';
    document.getElementById('am-v3').textContent = a.b3 + '%';
    document.getElementById('am-b3').style.width = a.b3 + '%';

    if (changed) updateVisorScenario();
  };

  window.setVisorMode = function (modeIdx) {
    _currentVisorMode = modeIdx;
    var vp = document.getElementById('visor-viewport');
    if (!vp) return;
    vp.classList.remove('mode-auspex', 'mode-nvg');
    if (modeIdx === 1) vp.classList.add('mode-auspex');
    if (modeIdx === 2) vp.classList.add('mode-nvg');
    [0, 1, 2].forEach(function (i) {
      var b = document.getElementById('vmode-' + i);
      if (b) {
        b.classList.toggle('active', i === modeIdx);
        b.setAttribute('aria-pressed', i === modeIdx);
      }
    });
    sfx.visorMode(modeIdx);
  };

  window.setVisorSpread = function (spread) {
    if (_visorSpread === spread) return;
    _visorSpread = spread;
    document.querySelectorAll('[data-visor-spread]').forEach(function (button) {
      button.setAttribute('aria-pressed', Number(button.dataset.visorSpread) === Number(spread));
    });
    updateVisorScenario();
  };

  window.setVisorCharge = function (charge) {
    if (_visorCharge === charge) return;
    _visorCharge = charge;
    document.querySelectorAll('[data-visor-charge]').forEach(function (button) {
      button.setAttribute('aria-pressed', Number(button.dataset.visorCharge) === Number(charge));
    });
    updateVisorScenario();
  };

  window.setVisorDummies = function (count) {
    var next = Math.max(minDummies, Math.min(maxDummies, count));
    if (next === _visorDummies) return;
    _visorDummies = next;
    setElText('#vdummy-count', _visorDummies + ' / ' + maxDummies);
    var minusBtn = document.getElementById('vdummy-minus');
    var plusBtn = document.getElementById('vdummy-plus');
    if (minusBtn) minusBtn.disabled = _visorDummies <= minDummies;
    if (plusBtn) plusBtn.disabled = _visorDummies >= maxDummies;
    updateVisorScenario();
  };

  window.changeVisorDummies = function (delta) {
    window.setVisorDummies(_visorDummies + delta);
  };

  function updateVisorShotStatus(phase) {
    var status = document.getElementById('visor-shot-status');
    if (!status) return;
    var text = currentLang === 'en'
      ? { ready: 'Ready to simulate', running: 'Simulation running', complete: 'Simulation complete' }
      : { ready: 'Готово к симуляции', running: 'Идёт симуляция', complete: 'Симуляция завершена' };
    status.dataset.phase = phase;
    status.textContent = text[phase];
  }

  function setVisorStep(step) {
    var sequence = document.getElementById('visor-sequence');
    if (!sequence || sequence.dataset.step === step) return;
    sequence.dataset.step = step;
    var current = sequence.querySelector('[data-visor-step="' + step + '"]');
    var passed = true;
    sequence.querySelectorAll('[data-visor-step]').forEach(function (item) {
      if (item === current) passed = false;
      item.toggleAttribute('data-passed', Boolean(current) && passed);
      if (item === current) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
  }

  window.simulateVisorShot = function () {
    _visorRun = { elapsed: 0, lastTime: null, shots: visorShots(_visorScenario, _visorBurst, _visorSpread, _visorCharge) };
    setVisorStep('setup');
    updateVisorShotStatus('running');
    telemetry.trackEvent('visor_fire', 'tab-armory', 'ammo_' + _currentAmmoIdx);
  };

  function resizeVisor3D() {
    var width = _visorViewport.clientWidth;
    var height = _visorViewport.clientHeight;
    if (width && height) _visorRenderer?.resize(width, height);
  }

  function handleVisorPhysicsEvent(ev) {
    if (!ev) return;
    if (ev.type === 'hit' || ev.type === 'head' || ev.type === 'kill' || ev.type === 'collapse') {
      setVisorStep('event');
    }
    sfx.visorShotImpact(_currentAmmoIdx, ev);
  }

  function renderVisor3D(timestamp) {
    _visorFrame = requestAnimationFrame(renderVisor3D);
    var run = _visorRun;
    if (run) {
      var previousFlightTime = run.elapsed - visorPrelude;
      if (run.lastTime !== null) run.elapsed += (timestamp - run.lastTime) / 1000;
      run.lastTime = timestamp;
      var flightTime = run.elapsed - visorPrelude;
      function crossed(cue) { return previousFlightTime < cue && flightTime >= cue; }
      run.shots.forEach(function (shot, index) {
        if (crossed(shot.cue)) {
          if (index === 0) setVisorStep('flight');
          sfx.visorShotFire(_currentAmmoIdx);
        }
      });
      var lastShot = run.shots.at(-1);
      var lastArrival = lastShot ? lastShot.cue + (lastShot.flight ?? _visorScenario.flight) : 0;
      if (flightTime >= lastArrival + visorSettle) {
        _visorRun = null;
        setVisorStep('complete');
        updateVisorShotStatus('complete');
      }
    }
    _visorRenderer?.render(_visorScenario, _currentVisorMode, _visorRun?.elapsed ?? null, _visorRun?.shots, timestamp, handleVisorPhysicsEvent);
  }

  function isVisorExpanded() {
    return document.fullscreenElement === _visorPanel || _visorPanel.hasAttribute('data-expanded');
  }

  function updateVisorExpand() {
    _visorExpand.setAttribute('aria-pressed', isVisorExpanded());
  }

  function toggleVisorView(event) {
    var button = event.currentTarget;
    var selected = button.getAttribute('aria-pressed') !== 'true';
    var view = button === _visorCastView ? 'cast' : 'receiver';
    _visorRenderer.setView(selected ? view : 'overview');
    _visorCastView.setAttribute('aria-pressed', selected && view === 'cast');
    _visorReceiverView.setAttribute('aria-pressed', selected && view === 'receiver');
    resizeVisor3D();
  }

  window.toggleVisorFullscreen = async function () {
    if (document.fullscreenElement === _visorPanel) {
      await document.exitFullscreen();
    } else if (_visorPanel.hasAttribute('data-expanded')) {
      if (_visorPanel.hasAttribute('popover')) _visorPanel.hidePopover();
      _visorPanel.removeAttribute('popover');
      _visorPanel.removeAttribute('data-expanded');
      _visorExpand.focus({ preventScroll: true });
    } else {
      try {
        if (!document.fullscreenEnabled) throw new Error('Fullscreen unavailable');
        await _visorPanel.requestFullscreen();
      } catch {
        _visorPanel.setAttribute('data-expanded', '');
        if (typeof _visorPanel.showPopover === 'function') {
          _visorPanel.setAttribute('popover', 'manual');
          _visorPanel.showPopover();
        }
        _visorExpand.focus({ preventScroll: true });
      }
    }
    updateVisorExpand();
  };

  function syncVisor3DActive() {
    var tab = document.getElementById('tab-armory');
    var active = tab?.classList.contains('active');
    if (!active && isVisorExpanded()) window.toggleVisorFullscreen();
    if (document.hidden || !active) {
      cancelAnimationFrame(_visorFrame);
      _visorFrame = null;
      if (_visorRun) _visorRun.lastTime = null;
      _visorRenderer?.stopNavigation();
      return;
    }
    if (!_visorLoad) {
      _visorLoad = import('../src/visorScene.js').then(function ({ createVisorScene }) {
        _visorRenderer = createVisorScene(_visorCanvas, function () {
          _visorCastView.disabled = false;
        });
        _visorReceiverView.disabled = false;
        _visorCanvas.dataset.renderer = 'webgl';
        resizeVisor3D();
      }).catch(function () {
        _visorViewport.dataset.unavailable = '';
      });
    }
    if (!_visorFrame) _visorFrame = requestAnimationFrame(renderVisor3D);
  }

  new ResizeObserver(resizeVisor3D).observe(_visorViewport);
  _visorCastView.addEventListener('click', toggleVisorView);
  _visorReceiverView.addEventListener('click', toggleVisorView);
  _visorViewport.addEventListener('pointerdown', function () {
    _visorViewport.focus({ preventScroll: true });
  });
  _visorPanel.addEventListener('keydown', function (event) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input, textarea, select, [contenteditable]')) return;
    if (_visorRenderer?.setNavigationKey(event.code, true)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
  _visorPanel.addEventListener('focusout', function (event) {
    if (!(event.relatedTarget instanceof Element) || !_visorPanel.contains(event.relatedTarget)
      || event.relatedTarget.closest('input, textarea, select, [contenteditable]')) {
      _visorRenderer?.stopNavigation();
    }
  });
  window.addEventListener('keyup', function (event) { _visorRenderer?.setNavigationKey(event.code, false); });
  window.addEventListener('blur', function () { _visorRenderer?.stopNavigation(); });
  document.addEventListener('visibilitychange', syncVisor3DActive);
  document.addEventListener('fullscreenchange', updateVisorExpand);

  function updateToggleAllBtnText() {
    var btn = document.getElementById('armory-toggle-all-btn');
    if (!btn) return;
    var uiArm = (L().UI && L().UI.armory) || {};
    var cards = document.querySelectorAll('#tab-armory .weapon-card');
    var allOpen = Array.from(cards).every(function (c) { return c.classList.contains('open'); });
    btn.textContent = allOpen
      ? (uiArm.collapseAll || '[ СВЕРНУТЬ ВЕСЬ РЕЕСТР ]')
      : (uiArm.expandAll || '[ РАЗВЕРНУТЬ ВЕСЬ РЕЕСТР ]');
  }

  function setWeaponOpen(card, isOpen) {
    card.classList.toggle('open', isOpen);
    card.querySelector('.w-head').setAttribute('aria-expanded', String(isOpen));
    card.querySelector('.w-body').inert = !isOpen;
    card.querySelectorAll('.bar-fill').forEach(function (bar) {
      var target = bar.getAttribute('data-w');
      bar.style.width = (isOpen && target) ? (target + '%') : '0%';
    });
  }

  window.toggleWeapon = function (card) {
    var nextOpen = !card.classList.contains('open');
    setWeaponOpen(card, nextOpen);
    updateToggleAllBtnText();
    sfx.accordion(nextOpen);
  };

  window.toggleAllWeapons = function () {
    var cards = document.querySelectorAll('#tab-armory .weapon-card');
    var allOpen = Array.from(cards).every(function (c) { return c.classList.contains('open'); });
    cards.forEach(function (card) { setWeaponOpen(card, !allOpen); });
    updateToggleAllBtnText();
    sfx.accordion(!allOpen);
  };

  /* ══════════════════════════════════════════════
     3. TABS, PRELOADERS & DOSSIER AUTH
  ══════════════════════════════════════════════ */
  var preloaderRuns = new Map();

  function cancelPreloader(name) {
    var timers = preloaderRuns.get(name);
    if (!timers) return;
    timers.forEach(function (timer) { clearTimeout(timer); });
    preloaderRuns.delete(name);
  }

  function ensurePreloaderDOM(name, tabId) {
    var tab = document.getElementById(tabId);
    if (!tab || document.getElementById(name + '-loader')) return;

    tab.style.position  = 'relative';
    tab.style.overflow  = 'hidden';
    tab.style.minHeight = '520px';

    var loader = document.createElement('div');
    loader.id = name + '-loader';
    loader.className = 'tab-preloader';

    var content = document.createElement('div');
    content.id = name + '-content';
    content.className = 'preload-content';

    while (tab.firstChild) {
      content.appendChild(tab.firstChild);
    }
    tab.appendChild(loader);
    tab.appendChild(content);
  }

  function runPreloader(name, tabId) {
    if (tabId) ensurePreloaderDOM(name, tabId);
    var cfg = (L().PRELOADER_CONFIGS || {})[name];
    var key = 'preloader_done_' + name;
    var loader  = document.getElementById(name + '-loader');
    var content = document.getElementById(name + '-content');
    if (!loader || !content || !cfg) return;

    if (preview || sessionStorage.getItem(key)) {
      cancelPreloader(name);
      loader.classList.remove('active');
      loader.style.display = 'none';
      content.inert = false;
      content.classList.add('visible');
      return;
    }
    if (preloaderRuns.has(name)) return;

    var timers = [];
    preloaderRuns.set(name, timers);
    function schedule(callback, delay) {
      timers.push(setTimeout(callback, delay));
    }

    loader.style.display = '';
    loader.innerHTML = '';
    loader.classList.remove('pl-flash-out');
    loader.classList.add('active');
    content.inert = true;
    content.classList.remove('visible');

    cfg.lines.forEach(function (item) {
      schedule(function () {
        var div = document.createElement('div');
        div.className = 'pl-line ' + item.cls;
        div.innerHTML = item.text + item.tail;
        loader.appendChild(div);
        sfx.preloaderLine(item.cls);
        schedule(function () { div.classList.add('show'); }, 30);
      }, item.delay);
    });

    schedule(function () {
      loader.classList.add('pl-flash-out');
      sfx.preloaderUnlock();
      schedule(function () {
        cancelPreloader(name);
        loader.classList.remove('active');
        loader.style.display = 'none';
        content.inert = false;
        content.classList.add('visible');
        sessionStorage.setItem(key, '1');
      }, 480);
    }, cfg.closeAt);
  }

  function runDossierAuth() {
    var screen  = document.getElementById('auth-screen');
    var content = document.getElementById('dossier-content');
    var lineIds = ['al1', 'al2', 'al3', 'al4'];
    var delays  = [0, 550, 1050, 1550];
    var totalDuration = 2600;

    if (preview) {
      screen.classList.remove('visible');
      content.classList.add('visible');
      window.initMatrixDecrypt();
      return;
    }

    screen.classList.add('visible');
    content.classList.remove('visible');

    lineIds.forEach(function (id, i) {
      setTimeout(function () {
        var el = document.getElementById(id);
        if (el) el.classList.add('show');
        sfx.bootLine(i === lineIds.length - 1 ? 'bt-gold' : 'bt-ok');
      }, delays[i]);
    });

    setTimeout(function () {
      screen.classList.remove('visible');
      sfx.preloaderUnlock();
      setTimeout(function () {
        content.classList.add('visible');
        window.initMatrixDecrypt();
      }, 350);
    }, totalDuration);
  }

  window.switchTab = function (tabId, el, options = {}) {
    var route = cms.resolveRoute(tabId);
    if (!route || cms.isHidden(tabId) && !options.force) return;
    var previousRoute = _activeRouteId;
    _activeRouteId = route;
    _activeWidgetIds = cms.activeWidgets(route);
    if (!_activeWidgetIds.includes('tab-dossier')) {
      var arch = document.getElementById('psycho-archive');
      var dossierTab = document.getElementById('tab-dossier');
      if (arch) { arch.classList.remove('active'); arch.hidden = true; }
      if (dossierTab) dossierTab.classList.remove('has-subpage');
    }
    if (!_activeWidgetIds.includes('tab-squad')) {
      _activeSquadIdx = null;
      var sq = document.getElementById('squad-modal');
      if (sq) sq.classList.remove('active');
    }

    document.querySelectorAll('.tab').forEach(function (t) {
      t.classList.toggle('active', t.id === route || _activeWidgetIds.includes(t.id));
    });
    el = cms.navButton(route) || el;
    document.querySelectorAll('.nav-item').forEach(function (n) {
      n.classList.toggle('active', n === el);
      if (n === el) n.setAttribute('aria-current', 'page');
      else n.removeAttribute('aria-current');
    });
    var contentEl = document.querySelector('.content');
    if (contentEl && (previousRoute !== route || !options.keepScroll)) contentEl.scrollTop = 0;
    updateBreadcrumbs();

    if (_activeWidgetIds.includes('tab-dossier') && !_dossierReady) {
      _dossierReady = true;
      runDossierAuth();
    }
    for (var name of ['armory', 'logs', 'astro', 'squad', 'sublim', 'comm']) {
      if (_activeWidgetIds.includes('tab-' + name)) runPreloader(name, 'tab-' + name);
    }
    if (typeof _commRadar !== 'undefined' && _commRadar.syncActive) {
      _commRadar.syncActive();
    }
    syncVisor3DActive();
    if (typeof _bioOsc !== 'undefined' && _bioOsc.syncActive) {
      _bioOsc.syncActive();
    }
    if (!options.skipHistory && cms.hasDocument() && previousRoute !== route) {
      history.pushState(null, '', '#' + route.slice(4));
    }
    if (!options.silent) telemetry.trackEvent('tab_view', route);
    cms.inspectRoute(route, !options.skipHistory && previousRoute !== route);
  };

  window.initMatrixDecrypt = function () {
    document.querySelectorAll('.mx-decrypt').forEach(function (el) {
      if (el._inited) return;
      el._inited = true;
      var trueText = el.getAttribute('data-text');
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-pressed', 'false');
      function reveal() {
        el.textContent = trueText;
        el.classList.add('revealed');
        el.setAttribute('aria-pressed', 'true');
        sfx.matrixDecrypt();
      }
      el.addEventListener('mouseenter', reveal, { once: true });
      el.addEventListener('click', reveal, { once: true });
      el.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          reveal();
        }
      });
    });
  };

  /* ══════════════════════════════════════════════
     4. PSYCHO-MEMORIAL ARCHIVE & CORTICAL LINK
  ══════════════════════════════════════════════ */
  window.startCorticalLink = function () {
    if (_corticalLinkRunning) return;
    _corticalLinkRunning = true;

    var loc     = L();
    var btn     = document.getElementById('archive-btn');
    var overlay = document.getElementById('psycho-link-overlay');
    var phaseEl = document.getElementById('plo-phase');
    var barFill = document.getElementById('plo-bar-fill');
    var phases  = loc.CORTICAL_PHASES || [];

    btn.disabled = true;
    btn.classList.add('clink-active');
    overlay.style.display = 'block';
    barFill.style.width = '0%';
    sfx.rosettaSeal();

    phases.forEach(function (p, i) {
      setTimeout(function () {
        phaseEl.style.opacity = '0';
        sfx.corticalPhase(i);
        setTimeout(function () {
          phaseEl.innerHTML     = p.html;
          phaseEl.style.color   = p.color;
          phaseEl.style.opacity = '1';
          barFill.style.width   = p.bar + '%';
        }, 160);

        if (i === phases.length - 1) {
          setTimeout(function () {
            btn.classList.remove('clink-active');
            setTimeout(function () {
              openArchivePage(false);
              sfx.corticalComplete();
              _corticalSynced = true;
              btn.classList.add('clink-done');
              btn.innerHTML = (L().UI && L().UI.dossier && L().UI.dossier.corticalDoneBtnHtml) || '';
              overlay.style.display = 'none';
              barFill.style.width = '0%';
              _corticalLinkRunning = false;
              btn.disabled = false;
              btn.onclick = function () {
                openArchivePage(true);
              };
            }, 420);
          }, 300);
        }
      }, p.delay);
    });
  };

  window.closeArchive = function () {
    var arch = document.getElementById('psycho-archive');
    var dossierTab = document.getElementById('tab-dossier');
    if (dossierTab) dossierTab.classList.remove('has-subpage');
    if (arch && arch.classList.contains('active')) {
      arch.classList.remove('active');
      arch.hidden = true;
      var contentEl = document.querySelector('.content');
      if (contentEl) contentEl.scrollTop = 0;
      sfx.modalClose();
    }
    updateBreadcrumbs();
  };

  var _lastFocusBeforeHotkeys = null;

  window.openHotkeysModal = function () {
    var modal = document.getElementById('hotkeys-modal');
    if (!modal) return;
    _lastFocusBeforeHotkeys = document.activeElement;
    modal.classList.add('active');
    sfx.modalOpen();
    requestAnimationFrame(function () {
      var closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    });
  };

  window.closeHotkeysModal = function () {
    var modal = document.getElementById('hotkeys-modal');
    if (!modal || !modal.classList.contains('active')) return;
    modal.classList.remove('active');
    sfx.modalClose();
    if (_lastFocusBeforeHotkeys && typeof _lastFocusBeforeHotkeys.focus === 'function') {
      _lastFocusBeforeHotkeys.focus({ preventScroll: true });
    }
    _lastFocusBeforeHotkeys = null;
  };

  (function initKeyboardNavigation() {
    var TAB_ORDER = ['tab-bio', 'tab-dossier', 'tab-armory', 'tab-logs', 'tab-astro', 'tab-squad', 'tab-sublim', 'tab-comm'];
    var FOCUS_SELECTOR = 'button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [role="button"], .mx-decrypt, .sr-body, .mnemo-viewport';

    function isTextInput(el) {
      if (!el) return false;
      var tag = el.tagName;
      if (tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable) return true;
      if (tag === 'INPUT') {
        var t = (el.type || 'text').toLowerCase();
        return t !== 'range' && t !== 'button' && t !== 'checkbox' && t !== 'radio';
      }
      return false;
    }

    function getDirection(e) {
      if (e.key === 'ArrowUp' || e.code === 'KeyW') return 'up';
      if (e.key === 'ArrowDown' || e.code === 'KeyS') return 'down';
      if (e.key === 'ArrowLeft' || e.code === 'KeyA') return 'left';
      if (e.key === 'ArrowRight' || e.code === 'KeyD') return 'right';
      return null;
    }

    function isElementFocusable(el) {
      if (!el || el.disabled) return false;
      if (el.tabIndex < 0 && el.getAttribute('tabindex') !== '0') return false;
      if (el.closest('[inert], [hidden]')) return false;
      var tab = el.closest('.tab');
      if (tab && !tab.classList.contains('active')) return false;
      var modal = el.closest('.modal-overlay, .archive-page');
      if (modal && !modal.classList.contains('active')) return false;
      var preload = el.closest('.preload-content');
      if (preload && !preload.classList.contains('visible')) return false;
      if (el.closest('#dossier-content') && !el.closest('#dossier-content').classList.contains('visible')) return false;
      if (el.closest('#tab-dossier.has-subpage #dossier-content')) return false;
      if (el.closest('.w-body') && !el.closest('.weapon-card.open')) return false;
      if (el.closest('#astro-system-hub') && getComputedStyle(el.closest('#astro-system-hub')).display === 'none') return false;
      if (el.closest('#astro-caelis-view') && getComputedStyle(el.closest('#astro-caelis-view')).display === 'none') return false;
      if (el.classList.contains('sr-body') && el.scrollHeight <= el.clientHeight + 4) return false;
      var style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      var rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }

    function getVisibleFocusables() {
      var scope = document;
      var hk = document.getElementById('hotkeys-modal');
      var sq = document.getElementById('squad-modal');
      if (hk && hk.classList.contains('active')) {
        scope = hk;
      } else if (sq && sq.classList.contains('active')) {
        scope = sq;
      }
      var list = Array.prototype.slice.call(scope.querySelectorAll(FOCUS_SELECTOR));
      return list.filter(isElementFocusable);
    }

    function getActiveScrollContainer(el) {
      if (el && el.closest && el.closest('.sr-body')) {
        var sr = el.closest('.sr-body');
        if (sr.scrollHeight > sr.clientHeight + 2) return sr;
      }
      var sq = document.getElementById('squad-modal');
      if (sq && sq.classList.contains('active')) return sq;
      if (el && el.closest && el.closest('.sidebar')) return null;
      return document.querySelector('main.content');
    }

    function scrollContainerBy(scroller, deltaY) {
      if (!scroller) return false;
      var before = scroller.scrollTop;
      scroller.scrollTop = before + deltaY;
      return scroller.scrollTop !== before;
    }

    function edgeGap(aMin, aMax, bMin, bMax) {
      if (aMax < bMin) return bMin - aMax;
      if (bMax < aMin) return aMin - bMax;
      return 0;
    }

    function moveFocusInDirection(dir) {
      var list = getVisibleFocusables();
      var cur = document.activeElement;
      var scroller = (dir === 'up' || dir === 'down') ? getActiveScrollContainer(cur) : null;

      if (!list.length) {
        if (scroller && (dir === 'up' || dir === 'down')) {
          return scrollContainerBy(scroller, dir === 'down' ? 140 : -140);
        }
        return false;
      }

      if (!cur || list.indexOf(cur) === -1) {
        var initial = document.querySelector('.tab.active button, .tab.active [role="button"], .sb-nav .nav-item.active') || list[0];
        if (!isElementFocusable(initial)) initial = list[0];
        initial.focus({ preventScroll: false });
        sfx.hoverTick();
        sfx.haptic('tick');
        return true;
      }

      var r0 = cur.getBoundingClientRect();
      var cx0 = r0.left + r0.width * 0.5;
      var cy0 = r0.top + r0.height * 0.5;
      var best = null;
      var bestScore = Infinity;

      for (var i = 0; i < list.length; i++) {
        var cand = list[i];
        if (cand === cur) continue;
        var r1 = cand.getBoundingClientRect();
        var cx1 = r1.left + r1.width * 0.5;
        var cy1 = r1.top + r1.height * 0.5;
        var dx = cx1 - cx0;
        var dy = cy1 - cy0;

        var valid = false;
        var primary = 0;
        var secondary = 0;

        if (dir === 'up') {
          valid = dy < -4;
          primary = -dy;
          secondary = edgeGap(r0.left, r0.right, r1.left, r1.right);
        } else if (dir === 'down') {
          valid = dy > 4;
          primary = dy;
          secondary = edgeGap(r0.left, r0.right, r1.left, r1.right);
        } else if (dir === 'left') {
          valid = dx < -4;
          primary = -dx;
          secondary = edgeGap(r0.top, r0.bottom, r1.top, r1.bottom);
        } else if (dir === 'right') {
          valid = dx > 4;
          primary = dx;
          secondary = edgeGap(r0.top, r0.bottom, r1.top, r1.bottom);
        }

        if (!valid) continue;
        var score = primary + secondary * 2.4;
        if (score < bestScore) {
          bestScore = score;
          best = cand;
        }
      }

      // Smart story scrolling: when inside a scrollable reading area or when next item is off-screen
      if (scroller && (dir === 'up' || dir === 'down')) {
        var stepY = dir === 'down' ? 140 : -140;
        var canDown = scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 2;
        var canUp = scroller.scrollTop > 2;
        var canScroll = (dir === 'down' && canDown) || (dir === 'up' && canUp);

        if (canScroll) {
          // 1. Inside poem scroll box (.sr-body) or archive story (.mnemo-viewport): scroll until top/bottom edge
          if (cur.classList && cur.classList.contains('sr-body')) {
            if (scrollContainerBy(scroller, dir === 'down' ? 96 : -96)) return true;
          }
          if (cur.classList && cur.classList.contains('mnemo-viewport')) {
            if (scrollContainerBy(scroller, stepY)) return true;
          }
          // 2. No focusable element in that direction (e.g. inside Squad Dossier or bottom of Archive/Logs)
          if (!best) {
            return scrollContainerBy(scroller, stepY);
          }
          // 3. Expanded mission entry extends below viewport, or next element is off-screen
          var sRect = scroller.getBoundingClientRect();
          var bRect = best.getBoundingClientRect();
          var missionEntry = (dir === 'down' && cur.classList && cur.classList.contains('mission-hd') && cur.getAttribute('aria-expanded') === 'true')
            ? cur.closest('.mission-entry')
            : null;
          var missionExtends = missionEntry && missionEntry.getBoundingClientRect().bottom > sRect.bottom - 16;
          var offScreen = dir === 'down'
            ? (bRect.top > sRect.bottom - 16)
            : (bRect.bottom < sRect.top + 16);

          if (missionExtends || offScreen) {
            return scrollContainerBy(scroller, stepY);
          }
        }
      }

      if (best) {
        best.focus({ preventScroll: false });
        if (typeof best.scrollIntoView === 'function') {
          best.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
        sfx.hoverTick();
        sfx.haptic('tick');
        return true;
      }
      return false;
    }

    function navigateBackOneLevel() {
      var hk = document.getElementById('hotkeys-modal');
      if (hk && hk.classList.contains('active')) {
        window.closeHotkeysModal();
        return true;
      }
      var sq = document.getElementById('squad-modal');
      if (sq && sq.classList.contains('active')) {
        window.closeSquadModal();
        return true;
      }
      var arch = document.getElementById('psycho-archive');
      if (arch && arch.classList.contains('active')) {
        window.closeArchive();
        return true;
      }
      if (_activeWidgetIds.includes('tab-astro') && _astroInPlanet) {
        window.closeAstroPlanet();
        sfx.astroExitPlanet();
        return true;
      }
      return false;
    }

    document.addEventListener('keydown', function (e) {
      var bt = document.getElementById('boot-terminal');
      var bootOpen = bt && !bt.classList.contains('bt-hidden');
      var editable = isTextInput(e.target);

      // Allow Ctrl+Enter to transmit inside Vox-Link form
      if (editable && e.ctrlKey && e.key === 'Enter') {
        if (_activeWidgetIds.includes('tab-comm') && e.target.closest('#tab-comm')) {
          e.preventDefault();
          window.sendMessage();
        }
        return;
      }

      if (e.key === 'Escape') {
        if (isVisorExpanded()) {
          e.preventDefault();
          window.toggleVisorFullscreen();
          return;
        }
        if (editable && document.activeElement) {
          document.activeElement.blur();
          return;
        }
        navigateBackOneLevel();
        return;
      }

      if (bootOpen) return;

      // Hotkeys guide (? or F1)
      if (e.key === 'F1' || (!editable && !e.ctrlKey && !e.metaKey && !e.altKey && e.key === '?')) {
        e.preventDefault();
        var hkModal = document.getElementById('hotkeys-modal');
        if (hkModal && hkModal.classList.contains('active')) window.closeHotkeysModal();
        else window.openHotkeysModal();
        return;
      }

      if (editable) return;

      var hkOpen = document.getElementById('hotkeys-modal')?.classList.contains('active');
      if (hkOpen) {
        var hkDir = getDirection(e);
        if (hkDir && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          moveFocusInDirection(hkDir);
        }
        return;
      }

      if (e.key === 'Backspace' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (navigateBackOneLevel()) {
          e.preventDefault();
        } else if (_activeWidgetIds.includes('tab-sublim') && _curSublimIdx >= 0) {
          e.preventDefault();
          window.encryptActiveSublimSlot();
          sfx.sublimEncrypt();
        }
        return;
      }

      // Direct section shortcuts 1..8
      if (!e.ctrlKey && !e.metaKey && !e.altKey && /^[1-8]$/.test(e.key)) {
        var targetTabId = TAB_ORDER[Number(e.key) - 1];
        var navBtn = document.querySelector('.sb-nav .nav-item[data-tab="' + targetTabId + '"]');
        if (navBtn) {
          e.preventDefault();
          window.switchTab(targetTabId, navBtn);
          sfx.tabSwitch();
        }
        return;
      }

      // Layout-independent global shortcuts (B, M, L)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.code === 'KeyB') {
          e.preventDefault();
          var toggleBtn = document.querySelector('.sidebar-toggle');
          if (toggleBtn) toggleBtn.click();
          return;
        }
        if (e.code === 'KeyM') {
          e.preventDefault();
          window.toggleCogitatorAudio();
          return;
        }
        if (e.code === 'KeyL') {
          e.preventDefault();
          window.toggleSiteLanguage();
          sfx.auspexSelect(2);
          return;
        }
      }

      // Range slider: A/D adjusts distance, Arrows Left/Right native, W/S/Up/Down exits slider spatially
      var dir = getDirection(e);
      if (dir && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'range' && (dir === 'left' || dir === 'right')) {
          if (e.code === 'KeyA' || e.code === 'KeyD') {
            e.preventDefault();
            var step = Number(e.target.step || 10) * 5;
            var nextVal = Number(e.target.value) + (dir === 'right' ? step : -step);
            e.target.value = String(Math.max(Number(e.target.min || 500), Math.min(Number(e.target.max || 2500), nextVal)));
            window.onVisorDistChange(e.target.value);
          }
          return;
        }
        e.preventDefault();
        moveFocusInDirection(dir);
        return;
      }

      if (e.key === 'PageDown' || e.key === 'PageUp') {
        var pgScroller = getActiveScrollContainer(document.activeElement);
        if (pgScroller) {
          e.preventDefault();
          var pageDelta = Math.round(pgScroller.clientHeight * 0.72);
          scrollContainerBy(pgScroller, e.key === 'PageDown' ? pageDelta : -pageDelta);
        }
        return;
      }

      if ((e.key === 'Home' || e.key === 'End') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        var list = getVisibleFocusables();
        if (list.length) {
          e.preventDefault();
          var targetEl = e.key === 'Home' ? list[0] : list[list.length - 1];
          targetEl.focus({ preventScroll: false });
          sfx.hoverTick();
        }
      }
    });
  })();

  window.selectMemoryAct = function (idx) {
    _currentActIdx = idx;
    var loc = L();
    var tList = loc.MEMORY_TELEMETRY || [];
    var t = tList[idx] || tList[0];
    if (!t) return;

    document.querySelectorAll('#psycho-archive .mnemo-tab-btn').forEach(function (btn, i) {
      btn.classList.toggle('active', i === idx);
    });

    var vp = document.getElementById('mnemo-viewport');
    var footNav = document.getElementById('mnemo-foot-nav');
    if (vp) {
      vp.classList.toggle('mv-critical', idx === 2);
      if (idx === 4) {
        vp.classList.add('show-all');
        if (footNav) footNav.style.display = 'none';
      } else {
        vp.classList.remove('show-all');
        if (footNav) footNav.style.display = 'flex';
        vp.querySelectorAll('.act').forEach(function (actEl, ai) {
          actEl.classList.toggle('active-act', ai === idx);
        });
      }
    }

    var locEl   = document.getElementById('mt-v-loc');
    var bpmEl   = document.getElementById('mt-v-bpm');
    var stateEl = document.getElementById('mt-v-state');
    var trVal   = document.getElementById('mt-v-trauma');
    var trBar   = document.getElementById('mt-b-trauma');
    if (locEl)   locEl.textContent = t.loc;
    if (bpmEl)   { bpmEl.textContent = t.bpm; bpmEl.className = 'mt-v ' + (idx === 2 ? 'mt-crit' : ''); }
    if (stateEl) { stateEl.textContent = t.state; stateEl.className = 'mt-v ' + t.sCls; }
    if (trVal)   trVal.textContent = t.trauma + '%';
    if (trBar)   { trBar.className = 'bar-fill ' + t.bCls; trBar.style.width = t.trauma + '%'; }

    var prevBtn = document.getElementById('mnemo-prev-btn');
    var nextBtn = document.getElementById('mnemo-next-btn');
    var indEl   = document.getElementById('mnemo-step-ind');
    if (prevBtn) prevBtn.disabled = (idx <= 0);
    if (nextBtn) nextBtn.disabled = (idx >= 3);
    if (indEl && idx < 4) {
      var prefix = (loc.UI && loc.UI.archive && loc.UI.archive.engramPrefix) || 'ЭНГРАММА 0';
      indEl.textContent = prefix + (idx + 1) + ' / 04';
    }
  };

  window.stepMemoryAct = function (dir) {
    var next = _currentActIdx + dir;
    if (next >= 0 && next <= 3) window.selectMemoryAct(next);
  };

  /* ══════════════════════════════════════════════
     5. OPERATION LOGS (MISSIONS 01..11)
  ══════════════════════════════════════════════ */
  function setMissionOpen(entry, open) {
    entry.classList.toggle('open', open);
    entry.querySelector('.mission-hd').setAttribute('aria-expanded', String(open));
  }

  window.toggleMission = function (id) {
    var entry = document.getElementById(id);
    if (entry) {
      var nextOpen = !entry.classList.contains('open');
      setMissionOpen(entry, nextOpen);
      sfx.accordion(nextOpen);
      if (nextOpen) {
        telemetry.trackEvent('mission_open', 'tab-logs', id);
      }
    }
  };

  /* ══════════════════════════════════════════════
     6. ASTROGRAPHY: SYSTEM HUB & CAELIS-9 HOLOLITH
  ══════════════════════════════════════════════ */
  function getAstroNodeSortKey(n, origIdx) {
    var code = (n && n.code) || '';
    var shortName = (n && n.shortName) || '';
    var opMatch = shortName.match(/(?:ОП|OP)-(\d+)/i) || code.match(/(?:ОП|OP)-(\d+)/i);
    if (opMatch) {
      return [1, parseInt(opMatch[1], 10), origIdx];
    }
    if (n && n.missionId) {
      var mMatch = String(n.missionId).match(/(\d+)/);
      return [1, mMatch ? parseInt(mMatch[1], 10) : 999, origIdx];
    }
    if (/КЛЮЧЕВОЙ УЗЕЛ|KEY NODE/i.test(code)) {
      var cityOrder = [/голгот|golgotha/i, /астерион|asterion/i, /этерна|aeterna/i];
      var cIdx = cityOrder.findIndex(function (rx) { return rx.test(shortName) || rx.test(n.title || ''); });
      return [2, cIdx === -1 ? 99 : cIdx, origIdx];
    }
    if (/МАКРО-РЕГИОН|MACRO-REGION/i.test(code) || /^(Биом:|Biome:)/i.test(shortName)) {
      var biomeOrder = [/долин|valley/i, /цитадел|citadel/i, /безмолв|silent/i, /пепел|ash/i];
      var bIdx = biomeOrder.findIndex(function (rx) { return rx.test(shortName) || rx.test(n.title || ''); });
      return [3, bIdx === -1 ? 99 : bIdx, origIdx];
    }
    if (/ОРБИТАЛЬНЫЙ|ORBITAL/i.test(code)) {
      return [4, 0, origIdx];
    }
    return [5, 0, origIdx];
  }

  function getSortedAstroNodes() {
    var nodes = (L().ASTRO_NODES || []).slice();
    return nodes
      .map(function (n, idx) { return { node: n, key: getAstroNodeSortKey(n, idx) }; })
      .sort(function (a, b) {
        if (a.key[0] !== b.key[0]) return a.key[0] - b.key[0];
        if (a.key[1] !== b.key[1]) return a.key[1] - b.key[1];
        return a.key[2] - b.key[2];
      })
      .map(function (item) { return item.node; });
  }

  function syncAstroPlanetImage(loc) {
    var planetImg = document.querySelector('#hololith-stage .holo-map-img');
    var url = resolveCaelisMap(loc?.CAELIS_IMG);
    if (planetImg && planetImg.getAttribute('src') !== url) planetImg.src = url;
  }

  window.initAstroMap = function () {
    var qGrid = document.getElementById('ah-quick-grid');
    if (!qGrid) return;
    var nodes = getSortedAstroNodes();
    if (_selectedAstroIdx >= nodes.length) _selectedAstroIdx = 0;

    qGrid.innerHTML = nodes.map(function (n, idx) {
      return (
        '<button class="ah-qbtn' + (idx === _selectedAstroIdx ? ' active' : '') +
        '" onclick="selectAstroNode(' + idx + ')">' + escapeMarkup(n.shortName) + '</button>'
      );
    }).join('');

    var pinToIdx = {};
    var nodeByPin = {};
    nodes.forEach(function (n, idx) {
      if (n.pinId) {
        pinToIdx[n.pinId] = idx;
        nodeByPin[n.pinId] = n;
      }
    });
    document.querySelectorAll('#astro-layer-main .astro-pin').forEach(function (pin) {
      if (Object.prototype.hasOwnProperty.call(pinToIdx, pin.id)) {
        var targetIdx = pinToIdx[pin.id];
        pin.dataset.nodeIndex = targetIdx;
        pin.setAttribute('role', 'button');
        pin.setAttribute('tabindex', '0');
        pin.setAttribute('aria-label', (nodeByPin[pin.id] && nodeByPin[pin.id].shortName) || pin.id);
        if (!pin._kbBound) {
          pin._kbBound = true;
          pin.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              window.selectAstroNode(Number(pin.dataset.nodeIndex));
              sfx.auspexSelect(1);
            }
          });
        }
      }
    });

    window.selectAstroNode(_selectedAstroIdx);
  };

  window.selectAstroNode = function (idx) {
    var nodes = getSortedAstroNodes();
    var n = nodes[idx];
    if (!n) return;
    _selectedAstroIdx = idx;

    document.getElementById('ah-code').textContent       = n.code;
    document.getElementById('ah-coords').textContent     = n.coords;
    document.getElementById('ah-title').textContent      = n.title;
    document.getElementById('ah-type').textContent       = n.type;
    document.getElementById('ah-ballistics').textContent = n.ballistics;
    document.getElementById('ah-desc').textContent       = n.desc;

    var jumpBtn = document.getElementById('ah-jump-btn');
    if (jumpBtn) {
      if (n.missionId) {
        jumpBtn.style.display = 'block';
        jumpBtn.textContent = n.missionBtnText;
        jumpBtn.onclick = function () { window.jumpToMissionLog(n.missionId); };
      } else {
        jumpBtn.style.display = 'none';
      }
    }

    var activePinId = n.pinId || ('apin-' + idx);
    document.querySelectorAll('#astro-layer-main .astro-pin').forEach(function (pin) {
      pin.classList.toggle('active', pin.id === activePinId);
    });
    document.querySelectorAll('#ah-quick-grid .ah-qbtn').forEach(function (b, i) {
      b.classList.toggle('active', i === idx);
    });
  };

  window.setAstroLayer = function (layer, btnEl) {
    document.querySelectorAll('.astro-layers .astro-btn').forEach(function (b) { b.classList.remove('active'); });
    if (btnEl) btnEl.classList.add('active');
    document.getElementById('astro-layer-main').classList.toggle('visible', layer === 'main');
    document.getElementById('astro-layer-tau').classList.toggle('visible',  layer === 'tau');
    document.getElementById('astro-layer-imp').classList.toggle('visible',  layer === 'imp');
  };

  window.toggleAstroSpectrum = function () {
    var uiAstro = (L().UI && L().UI.astro) || {};
    var stage = document.getElementById('hololith-stage');
    var btn   = document.getElementById('astro-spectrum-btn');
    if (!stage || !btn) return;
    var isOpt = stage.classList.toggle('optical-mode');
    btn.textContent = isOpt ? uiAstro.spectrumOpt : uiAstro.spectrumAuspex;
    btn.classList.toggle('active', isOpt);
  };

  window.toggleAstroFullscreen = function () {
    var uiAstro = (L().UI && L().UI.astro) || {};
    var tab  = document.getElementById('tab-astro');
    var btn  = document.getElementById('astro-fs-btn');
    if (!tab || !btn) return;
    var isFs = tab.classList.toggle('holo-fullscreen');
    btn.textContent = isFs ? uiAstro.fsExit : uiAstro.fsEnter;
  };

  window.jumpToMissionLog = function (missionId) {
    var uiAstro = (L().UI && L().UI.astro) || {};
    var astroTab = document.getElementById('tab-astro');
    if (astroTab) astroTab.classList.remove('holo-fullscreen');
    var fsBtn = document.getElementById('astro-fs-btn');
    if (fsBtn && uiAstro.fsEnter) fsBtn.textContent = uiAstro.fsEnter;

    sessionStorage.setItem('preloader_done_logs', '1');

    var logsNav = document.querySelector('.nav-item[data-tab="tab-logs"]');
    if (logsNav) window.switchTab('tab-logs', logsNav);

    setTimeout(function () {
      var mEl = document.getElementById(missionId);
      if (mEl) {
        setMissionOpen(mEl, true);
        mEl.scrollIntoView({ block: 'start' });
      }
    }, 120);
  };

  window.previewSystemBody = function (idx) {
    var item = (L().SYS_BODIES_INFO || [])[idx];
    if (!item) return;
    document.getElementById('shf-title').textContent = item[0];
    document.getElementById('shf-sub').textContent   = item[1];
    document.querySelectorAll('[data-system-body]').forEach(function (control) {
      control.setAttribute('aria-pressed', String(Number(control.dataset.systemBody) === idx));
    });
  };

  window.openAstroPlanet = function (planetKey) {
    _astroInPlanet = true;
    var uiAstro = (L().UI && L().UI.astro) || {};
    document.getElementById('astro-system-hub').style.display      = 'none';
    document.getElementById('astro-caelis-view').style.display     = 'grid';
    document.getElementById('astro-hub-bar-left').style.display    = 'none';
    document.getElementById('astro-planet-bar-left').style.display = 'flex';

    document.getElementById('astro-pg-eyebrow').textContent    = uiAstro.planetEyebrow;
    document.getElementById('astro-pg-main-title').textContent = uiAstro.planetTitle;
    document.getElementById('astro-pg-badge').textContent      = uiAstro.planetBadge;

    syncAstroPlanetImage(L());
    window.selectAstroNode(_selectedAstroIdx);
    updateBreadcrumbs();
  };

  window.closeAstroPlanet = function () {
    _astroInPlanet = false;
    var uiAstro = (L().UI && L().UI.astro) || {};
    document.getElementById('astro-caelis-view').style.display     = 'none';
    document.getElementById('astro-system-hub').style.display      = 'flex';
    document.getElementById('astro-planet-bar-left').style.display = 'none';
    document.getElementById('astro-hub-bar-left').style.display    = 'flex';

    document.getElementById('astro-pg-eyebrow').textContent    = uiAstro.hubEyebrow;
    document.getElementById('astro-pg-main-title').textContent = uiAstro.hubTitle;
    document.getElementById('astro-pg-badge').textContent      = uiAstro.hubBadge;
    document.getElementById('shf-title').textContent           = uiAstro.shfTitleDefault;
    document.getElementById('shf-sub').textContent             = uiAstro.shfSubDefault;
    document.querySelectorAll('[data-system-body][aria-pressed="true"]').forEach(function (control) {
      control.setAttribute('aria-pressed', 'false');
    });
    updateBreadcrumbs();
  };

  /* ══════════════════════════════════════════════
     7. BIOMETRICS: X-RAY, DNA HELIX, STRESS TEST & ECG
  ══════════════════════════════════════════════ */
  window.selectBioNode = function (idx) {
    var n = (L().BIO_XRAY_NODES || [])[idx];
    if (!n) return;
    document.getElementById('bxi-title').textContent  = n.title;
    document.getElementById('bxi-status').textContent = n.status;
    document.getElementById('bxi-desc').textContent   = n.desc;
    document.querySelectorAll('.bio-node').forEach(function (el, i) {
      el.classList.toggle('active', i === idx);
      el.setAttribute('aria-pressed', String(i === idx));
    });
    document.querySelectorAll('.bx-btn').forEach(function (btn, i) {
      btn.classList.toggle('active', i === idx);
      btn.setAttribute('aria-pressed', String(i === idx));
    });
  };

  window.selectDnaNode = function (idx, btnEl) {
    document.querySelectorAll('.dna-tab').forEach(function (t, i) {
      t.classList.toggle('active', btnEl ? t === btnEl : i === idx);
    });
    document.getElementById('dna-desc').innerHTML = (L().BIO_DNA_NODES || [])[idx] || '';
  };

  window.syncBioWithSublimation = function () {
    var uiBio = (L().UI && L().UI.bio) || {};
    var anyOpen = document.querySelectorAll('#tab-sublim .log-entry.open').length > 0;
    _bioEcgState.sublim = anyOpen;

    var hrEl    = document.getElementById('bio-heart-rate');
    var bpmRead = document.getElementById('ecg-bpm-readout');
    var riskBar = document.getElementById('gs-risk-bar');
    var riskPct = document.getElementById('gs-risk-pct');
    var riskBdg = document.getElementById('gs-risk-badge');
    var gsNote  = document.getElementById('gs-status-note');

    if (anyOpen) {
      if (hrEl)    { hrEl.textContent = uiBio.bpmSublim; hrEl.classList.add('ph-stabilized'); }
      if (bpmRead) { bpmRead.textContent = uiBio.bpmSublim; bpmRead.style.color = '#389e38'; }
      if (riskBar) { riskBar.style.width = '18%'; }
      if (riskPct) { riskPct.textContent = '18%'; }
      if (riskBdg) { riskBdg.textContent = uiBio.riskBadgeSublim; riskBdg.className = 'gs-h-verdict v-ok'; }
      if (gsNote && !_bioEcgState.stress) { gsNote.textContent = ''; }
    } else {
      if (hrEl)    { hrEl.textContent = uiBio.bpmNominal; hrEl.classList.remove('ph-stabilized'); }
      if (bpmRead) { bpmRead.textContent = uiBio.bpmNominal; bpmRead.style.color = 'var(--crimson-bright)'; }
      if (riskBar) { riskBar.style.width = '65%'; }
      if (riskPct) { riskPct.textContent = '65%'; }
      if (riskBdg) { riskBdg.textContent = uiBio.riskBadgeNominal; riskBdg.className = 'gs-h-verdict v-danger'; }
      if (gsNote && !_bioEcgState.stress) { gsNote.textContent = ''; }
    }
  };

  window.triggerBioStressTest = function () {
    if (_bioEcgState.stress) return;
    _bioEcgState.stress = true;
    sfx.bioStressTest();
    var uiBio    = (L().UI && L().UI.bio) || {};
    var btn      = document.getElementById('ecg-stress-btn');
    var bpmRead  = document.getElementById('ecg-bpm-readout');
    var hrEl     = document.getElementById('bio-heart-rate');
    var riskBar  = document.getElementById('gs-risk-bar');
    var riskPct  = document.getElementById('gs-risk-pct');
    var riskBdg  = document.getElementById('gs-risk-badge');
    var gsNote   = document.getElementById('gs-status-note');

    btn.classList.add('active');
    btn.textContent = uiBio.stressBtnAlert;
    if (bpmRead) { bpmRead.textContent = uiBio.bpmStressReadout; bpmRead.style.color = '#ff2020'; }
    if (hrEl)    { hrEl.textContent = uiBio.bpmStressHr; hrEl.classList.remove('ph-stabilized'); }
    if (riskBar) { riskBar.style.width = '98%'; }
    if (riskPct) { riskPct.textContent = '98%'; }
    if (riskBdg) { riskBdg.textContent = uiBio.riskBadgeStress; riskBdg.className = 'gs-h-verdict v-danger'; }
    if (gsNote)  { gsNote.textContent = uiBio.gsNoteStress; gsNote.style.color = '#ff3020'; }

    setTimeout(function () {
      _bioEcgState.stress = false;
      btn.classList.remove('active');
      btn.textContent = (L().UI && L().UI.bio && L().UI.bio.stressBtnIdle) || uiBio.stressBtnIdle;
      window.syncBioWithSublimation();
    }, 3600);
  };

  var _bioOsc = (function initBioOscilloscope() {
    var canvas = document.getElementById('bio-ecg-canvas');
    if (!canvas) return { syncActive: function () {} };
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var phase = 0;
    var history1 = new Array(W).fill(H * 0.42);
    var rafId = null;

    function getEcgSample(p, isStress) {
      var cycle = p % 1;
      if (isStress) {
        if (cycle > 0.2 && cycle < 0.28) return -22 * Math.sin((cycle - 0.2) / 0.08 * Math.PI);
        if (cycle >= 0.28 && cycle < 0.34) return 14;
        return (Math.random() - 0.5) * 6;
      }
      if (cycle > 0.10 && cycle < 0.18) return -4 * Math.sin((cycle - 0.10) / 0.08 * Math.PI);
      if (cycle > 0.22 && cycle < 0.25) return 5;
      if (cycle >= 0.25 && cycle < 0.30) return -21 * Math.sin((cycle - 0.25) / 0.05 * Math.PI);
      if (cycle >= 0.30 && cycle < 0.34) return 9;
      if (cycle > 0.42 && cycle < 0.54) return -5.5 * Math.sin((cycle - 0.42) / 0.12 * Math.PI);
      return 0;
    }

    function drawFrame() {
      rafId = null;
      var tab = document.getElementById('tab-bio');
      if (document.hidden || !tab || !tab.classList.contains('active')) return;

      var step = _bioEcgState.stress ? 0.036 : (_bioEcgState.sublim ? 0.0085 : 0.0125);
      phase += step;
      var y1 = (H * 0.44) + getEcgSample(phase, _bioEcgState.stress);
      history1.push(y1);
      if (history1.length > W) history1.shift();

      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(201, 168, 76, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, H * 0.82);
      ctx.lineTo(W, H * 0.82);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = _bioEcgState.stress ? '#ff2020' : (_bioEcgState.sublim ? '#389e38' : '#e53935');
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var i = 0; i < history1.length; i++) {
        if (i === 0) ctx.moveTo(i, history1[i]);
        else ctx.lineTo(i, history1[i]);
      }
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(W - 2, history1[history1.length - 1], 2.5, 0, Math.PI * 2);
      ctx.fill();

      rafId = requestAnimationFrame(drawFrame);
    }

    function syncActive() {
      var tab = document.getElementById('tab-bio');
      var shouldRun = !document.hidden && tab && tab.classList.contains('active');
      if (shouldRun && !rafId) {
        rafId = requestAnimationFrame(drawFrame);
      } else if (!shouldRun && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    document.addEventListener('visibilitychange', syncActive);
    syncActive();
    return { syncActive: syncActive };
  })();

  /* ══════════════════════════════════════════════
     8. SUBLIMATION (BARREL PARCHMENTS)
  ══════════════════════════════════════════════ */
  function renderPoemStanzas(poemView, poemTxt) {
    poemView.classList.remove('is-standby');
    poemView.innerHTML = '';
    var stanzas = (poemTxt || '').trim().split(/\n\s*\n/);
    stanzas.forEach(function (stanza, i) {
      var trimmed = stanza.trim();
      if (!trimmed) return;
      var wrap = document.createElement('div');
      wrap.className = 'sr-stanza';
      var num = document.createElement('span');
      num.className = 'sr-stanza-num';
      num.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
      var txt = document.createElement('div');
      txt.className = 'sr-stanza-text';
      txt.textContent = trimmed;
      wrap.appendChild(num);
      wrap.appendChild(txt);
      poemView.appendChild(wrap);
    });
  }

  function setStandbyReader() {
    var uiSub = (L().UI && L().UI.sublim) || {};
    document.getElementById('sr-eyebrow').textContent   = uiSub.standbyEyebrow || '';
    document.getElementById('sr-title').textContent     = uiSub.standbyTitle || '';
    document.getElementById('sr-rhythm').textContent    = uiSub.standbyRhythm || '';
    var poemView = document.getElementById('sr-poem-view');
    if (poemView) {
      poemView.classList.add('is-standby');
      poemView.textContent = uiSub.standbyPoem || '';
    }
    var encBtn = document.getElementById('sr-encrypt-btn');
    if (encBtn) encBtn.disabled = true;
    document.querySelectorAll('#tab-sublim .log-entry').forEach(function (el) {
      el.classList.remove('active-slot');
    });
  }

  window.toggleLog = function (id) {
    var uiSub = (L().UI && L().UI.sublim) || {};
    var entry = document.getElementById(id);
    if (!entry) return;
    entry.classList.toggle('open');
    var badge = document.getElementById('enc-' + id);
    if (badge) {
      if (entry.classList.contains('open')) {
        badge.textContent = uiSub.decrypted;
        badge.classList.add('decoded');
      } else {
        badge.textContent = uiSub.encrypted;
        badge.classList.remove('decoded');
      }
    }
    window.syncBioWithSublimation();
  };

  window.encryptActiveSublimSlot = function () {
    var entries = document.querySelectorAll('#tab-sublim .log-entry');
    if (!entries.length || _curSublimIdx < 0 || _curSublimIdx >= entries.length) return;
    var uiSub = (L().UI && L().UI.sublim) || {};
    var target = entries[_curSublimIdx];
    target.classList.remove('open', 'active-slot');

    var badge = target.querySelector('.log-enc');
    if (badge) {
      badge.textContent = uiSub.encrypted;
      badge.classList.remove('decoded');
    }

    var nextOpenIdx = -1;
    entries.forEach(function (el, i) {
      if (nextOpenIdx === -1 && el.classList.contains('open')) nextOpenIdx = i;
    });

    if (nextOpenIdx !== -1) {
      window.selectSublimSlot(nextOpenIdx, true);
    } else {
      _curSublimIdx = -1;
      setStandbyReader();
      window.syncBioWithSublimation();
      updateBreadcrumbs();
    }
  };

  window.selectSublimSlot = function (idx, forceOpen) {
    var entries = document.querySelectorAll('#tab-sublim .log-entry');
    if (!entries.length) return;
    if (idx < 0) idx = entries.length - 1;
    if (idx >= entries.length) idx = 0;

    var target = entries[idx];
    if (!forceOpen && _curSublimIdx === idx && target.classList.contains('open')) {
      window.encryptActiveSublimSlot();
      return;
    }

    _curSublimIdx = idx;

    var uiSub = (L().UI && L().UI.sublim) || {};

    entries.forEach(function (el, i) {
      el.classList.toggle('active-slot', i === idx);
    });
    target.classList.add('open');

    var badge = target.querySelector('.log-enc');
    if (badge) {
      badge.textContent = uiSub.decrypted;
      badge.classList.add('decoded');
    }

    var titleTxt = target.querySelector('.log-title-text').textContent;
    var poemTxt  = target.querySelector('.log-poem').textContent;
    var codeNum  = '0' + (idx + 1);

    document.getElementById('sr-eyebrow').textContent = (uiSub.activeEyebrowPrefix || '') + codeNum;
    document.getElementById('sr-title').textContent   = titleTxt;
    document.getElementById('sr-rhythm').textContent  = uiSub.activeRhythm;

    var encBtn = document.getElementById('sr-encrypt-btn');
    if (encBtn) encBtn.disabled = false;

    var poemView = document.getElementById('sr-poem-view');
    renderPoemStanzas(poemView, poemTxt);
    poemView.parentElement.scrollTop = 0;

    window.syncBioWithSublimation();
    updateBreadcrumbs();
  };

  window.stepSublimSlot = function (dir) {
    if (_curSublimIdx === -1) {
      window.selectSublimSlot(0, true);
    } else {
      window.selectSublimSlot(_curSublimIdx + dir, true);
    }
  };

  var _commRadar = (function initCommRadar() {
    var canvas = document.getElementById('comm-radar-canvas');
    if (!canvas) return { setTarget: function () {}, syncActive: function () {} };
    var ctx = canvas.getContext('2d');
    var W = 360, H = 316, dpr = 1;
    var rafId = null;
    var lastTime = 0;

    var defC = COMM_CIPHER_PROFILES.VERMILION;
    var defR = COMM_RELAY_PROFILES[0];

    var cur = {
      r: defC.rgb[0], g: defC.rgb[1], b: defC.rgb[2],
      freq: defC.freq, amp: defC.amp, speed: defC.speed,
      warpAmp: defR.warpAmp, warpSpeed: defR.warpSpeed
    };
    var tgt = {
      r: defC.rgb[0], g: defC.rgb[1], b: defC.rgb[2],
      freq: defC.freq, amp: defC.amp, speed: defC.speed,
      warpAmp: defR.warpAmp, warpSpeed: defR.warpSpeed
    };

    var phase = 0;
    var angOuter = 0;
    var angMid = 0;
    var angInner = 0;
    var angWard = 0;
    var pulses = [
      { t: -0.95, spd: 0.42 },
      { t: -0.45, spd: 0.48 },
      { t:  0.05, spd: 0.40 },
      { t:  0.55, spd: 0.46 }
 ];

    function resize() {
      var cw = canvas.clientWidth;
      var ch = canvas.clientHeight;
      if (!cw || !ch) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cw;
      H = ch;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }

    function rgba(r, g, b, a) {
      return 'rgba(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ',' + a + ')';
    }

    function waveEnvelope(nx) {
      return Math.pow(Math.max(0, Math.cos(nx * Math.PI * 0.5)), 1.35);
    }

    function samplePrimaryY(nx, cy, maxH) {
      var env = waveEnvelope(nx);
      var carrier = Math.sin(nx * cur.freq * Math.PI + phase) * cur.amp;
      var warp = Math.sin(nx * cur.freq * 2.7 - phase * 0.85) * (cur.warpAmp * 0.30);
      return cy + (carrier + warp) * maxH * env;
    }

    function sampleHarmonicY(nx, cy, maxH) {
      var env = waveEnvelope(nx);
      var warpMod = Math.sin(nx * 4.2 + phase * 1.25) * cur.warpAmp +
                    Math.sin(nx * 10.5 - phase * cur.warpSpeed) * (cur.warpAmp * 0.48);
      var harm = Math.sin(nx * cur.freq * 2.25 - phase * 1.65 + warpMod * 2.3) * (cur.amp * 0.46);
      return cy + (harm + warpMod * 0.34) * maxH * env;
    }

    function drawFrame(now) {
      rafId = null;
      var tab = document.getElementById('tab-comm');
      if (document.hidden || !tab || !tab.classList.contains('active')) return;

      if (!lastTime) lastTime = now;
      var dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (canvas.clientWidth && (canvas.clientWidth !== W || canvas.clientHeight !== H)) {
        resize();
      }

      var k = 1 - Math.exp(-dt * 5.5);
      cur.r         += (tgt.r - cur.r) * k;
      cur.g         += (tgt.g - cur.g) * k;
      cur.b         += (tgt.b - cur.b) * k;
      cur.freq      += (tgt.freq - cur.freq) * k;
      cur.amp       += (tgt.amp - cur.amp) * k;
      cur.speed     += (tgt.speed - cur.speed) * k;
      cur.warpAmp   += (tgt.warpAmp - cur.warpAmp) * k;
      cur.warpSpeed += (tgt.warpSpeed - cur.warpSpeed) * k;

      phase    += dt * cur.speed;
      angOuter += dt * 0.09;
      angMid   -= dt * 0.16;
      angInner += dt * 0.25;
      angWard  -= dt * 0.11;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      var cx = W * 0.5;
      var cy = H * 0.5;
      var R = Math.min(W, H) * 0.43;
      var innerClipR = R * 0.83;

      // 1. Subtle radial grid & crosshairs
      ctx.strokeStyle = rgba(cur.r, cur.g, cur.b, 0.14);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx - R * 1.06, cy);
      ctx.lineTo(cx + R * 1.06, cy);
      ctx.moveTo(cx, cy - R * 1.06);
      ctx.lineTo(cx, cy + R * 1.06);
      ctx.stroke();

      // 2. Outer azimuth degree ring (CW)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angOuter);
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.stroke();
      for (var i = 0; i < 72; i++) {
        var a = (i / 72) * Math.PI * 2;
        var isMajor = (i % 6 === 0);
        var rIn = isMajor ? R - 7 : R - 3.5;
        ctx.strokeStyle = isMajor ? 'rgba(229, 195, 101, 0.52)' : 'rgba(201, 168, 76, 0.20)';
        ctx.lineWidth = isMajor ? 1.1 : 0.7;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * rIn, Math.sin(a) * rIn);
        ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Mid segmented orbital scale (CCW)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angMid);
      ctx.strokeStyle = rgba(cur.r, cur.g, cur.b, 0.45);
      ctx.lineWidth = 1.2;
      ctx.setLineDash([16, 7, 4, 7]);
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.88, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      for (var q = 0; q < 4; q++) {
        var qa = q * Math.PI * 0.5;
        var mx = Math.cos(qa) * R * 0.88;
        var my = Math.sin(qa) * R * 0.88;
        ctx.fillStyle = rgba(cur.r, cur.g, cur.b, 0.75);
        ctx.beginPath();
        ctx.arc(mx, my, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 4. Inner vernier scale (CW)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angInner);
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.22)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      for (var v = 0; v < 36; v++) {
        var va = (v / 36) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(va) * (R * 0.72 - 3), Math.sin(va) * (R * 0.72 - 3));
        ctx.lineTo(Math.cos(va) * (R * 0.72 + 2), Math.sin(va) * (R * 0.72 + 2));
        ctx.stroke();
      }
      ctx.restore();

      // 5. Ordo Xenos Astrolabe / Protective Ward Contour (CCW)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angWard);
      var wardR = R * 0.56;
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.26)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(0, 0, wardR, 0, Math.PI * 2);
      ctx.stroke();
      // Interlocking 8-point astrolabe squares
      for (var s = 0; s < 2; s++) {
        ctx.save();
        ctx.rotate(s * Math.PI * 0.25);
        ctx.strokeStyle = s === 0 ? 'rgba(201, 168, 76, 0.26)' : rgba(cur.r, cur.g, cur.b, 0.24);
        ctx.beginPath();
        for (var c = 0; c < 4; c++) {
          var ca = (c / 4) * Math.PI * 2;
          var px = Math.cos(ca) * wardR;
          var py = Math.sin(ca) * wardR;
          if (c === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
      // Innermost dashed ward ring
      ctx.strokeStyle = 'rgba(229, 195, 101, 0.42)';
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 6. Clipped Wave & Signal Packets inside innerClipR
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, innerClipR, 0, Math.PI * 2);
      ctx.clip();

      var bgGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, innerClipR);
      bgGrad.addColorStop(0, rgba(cur.r, cur.g, cur.b, 0.11));
      bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(cx - innerClipR, cy - innerClipR, innerClipR * 2, innerClipR * 2);

      var maxWaveH = innerClipR * 0.62;
      var steps = 96;
      var xStart = cx - innerClipR;
      var xSpan = innerClipR * 2;

      // Secondary harmonic / warp-noise wave
      ctx.strokeStyle = 'rgba(229, 195, 101, 0.48)';
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      for (var st2 = 0; st2 <= steps; st2++) {
        var nx2 = (st2 / steps) * 2 - 1;
        var px2 = xStart + (st2 / steps) * xSpan;
        var py2 = sampleHarmonicY(nx2, cy, maxWaveH);
        if (st2 === 0) ctx.moveTo(px2, py2);
        else ctx.lineTo(px2, py2);
      }
      ctx.stroke();

      // Primary carrier wave (glow pass + crisp core pass)
      ctx.beginPath();
      for (var st1 = 0; st1 <= steps; st1++) {
        var nx1 = (st1 / steps) * 2 - 1;
        var px1 = xStart + (st1 / steps) * xSpan;
        var py1 = samplePrimaryY(nx1, cy, maxWaveH);
        if (st1 === 0) ctx.moveTo(px1, py1);
        else ctx.lineTo(px1, py1);
      }
      ctx.strokeStyle = rgba(cur.r, cur.g, cur.b, 0.24);
      ctx.lineWidth = 4.8;
      ctx.stroke();
      ctx.strokeStyle = rgba(cur.r, cur.g, cur.b, 0.95);
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Traveling signal packet pulses along carrier wave
      for (var pIdx = 0; pIdx < pulses.length; pIdx++) {
        var p = pulses[pIdx];
        p.t += dt * p.spd * (0.65 + cur.speed * 0.14);
        if (p.t > 1) p.t = -1;
        var pEnv = waveEnvelope(p.t);
        if (pEnv > 0.04) {
          var pX = cx + p.t * innerClipR;
          var pY = samplePrimaryY(p.t, cy, maxWaveH);
          var pGrad = ctx.createRadialGradient(pX, pY, 0.5, pX, pY, 7);
          pGrad.addColorStop(0, 'rgba(255, 250, 220, ' + (0.95 * pEnv).toFixed(3) + ')');
          pGrad.addColorStop(0.45, rgba(cur.r, cur.g, cur.b, (0.75 * pEnv).toFixed(3)));
          pGrad.addColorStop(1, rgba(cur.r, cur.g, cur.b, 0));
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(pX, pY, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 7. Central pulsing focus node
      var pulse = 0.72 + 0.28 * Math.sin(phase * 1.5);
      var coreGlow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22 * pulse);
      coreGlow.addColorStop(0, rgba(cur.r, cur.g, cur.b, 0.55));
      coreGlow.addColorStop(1, rgba(cur.r, cur.g, cur.b, 0));
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 22 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = rgba(cur.r, cur.g, cur.b, 0.85);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cx, cy, 10 + pulse * 3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#e5c365';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      rafId = requestAnimationFrame(drawFrame);
    }

    function syncActive() {
      var tab = document.getElementById('tab-comm');
      var shouldRun = !document.hidden && tab && tab.classList.contains('active');
      if (shouldRun && !rafId) {
        resize();
        lastTime = 0;
        rafId = requestAnimationFrame(drawFrame);
      } else if (!shouldRun && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    document.addEventListener('visibilitychange', syncActive);
    window.addEventListener('resize', function () {
      var tab = document.getElementById('tab-comm');
      if (tab && tab.classList.contains('active')) resize();
    });

    return {
      setTarget: function (clr, relayIdx) {
        var cp = COMM_CIPHER_PROFILES[clr] || COMM_CIPHER_PROFILES.VERMILION;
        var rp = COMM_RELAY_PROFILES[relayIdx] || COMM_RELAY_PROFILES[0];
        tgt.r = cp.rgb[0];
        tgt.g = cp.rgb[1];
        tgt.b = cp.rgb[2];
        tgt.freq = cp.freq;
        tgt.amp = cp.amp;
        tgt.speed = cp.speed;
        tgt.warpAmp = rp.warpAmp;
        tgt.warpSpeed = rp.warpSpeed;
      },
      syncActive: syncActive
    };
  })();

  /* ══════════════════════════════════════════════
     9. ASTROPATHIC TRANSMISSION & GOOGLE SHEETS WEBHOOK
  ══════════════════════════════════════════════ */
  function refreshCommReadouts() {
    var loc = L();
    var uiComm = (loc.UI && loc.UI.comm) || {};
    var rList = loc.RELAY_NODES || [];
    var r = rList[_commRelayIdx] || rList[0];
    if (!r) return;
    var clr = _commClearance;

    var topBdg = document.getElementById('comm-top-badge');
    if (topBdg) topBdg.textContent = (uiComm.topBadgePrefix || '') + clr;

    var freqEl = document.getElementById('cb-freq-val');
    if (freqEl) freqEl.textContent = (uiComm.freqPrefix || '') + r.freq;

    var svgNode   = document.getElementById('comm-svg-node');
    var svgClr    = document.getElementById('comm-svg-clr');
    var radarFlux = document.getElementById('comm-radar-flux');
    var radarShld = document.getElementById('comm-radar-shield');

    if (svgNode) svgNode.textContent = r.svg;
    if (svgClr)  svgClr.textContent  = (uiComm.radarCipherPrefix || 'CIPHER: ') + clr + (uiComm.radarCipherSuffix || '');
    if (radarShld && uiComm.radarShield) radarShld.textContent = uiComm.radarShield;

    var cp = COMM_CIPHER_PROFILES[clr] || COMM_CIPHER_PROFILES.VERMILION;
    var rp = COMM_RELAY_PROFILES[_commRelayIdx] || COMM_RELAY_PROFILES[0];
    if (radarFlux) {
      var fluxVal = (cp.fluxBase + rp.fluxAdd).toFixed(2) + '%';
      radarFlux.textContent = (uiComm.radarWarpFluxPrefix || 'WARP FLUX: ') + fluxVal;
      radarFlux.style.color = (_commRelayIdx === 2 || clr === 'BLACK') ? '#ffd166' : '#ff4d42';
    }

    _commRadar.setTarget(clr, _commRelayIdx);

    var ctv3 = document.getElementById('ct-v3');
    var ctv4 = document.getElementById('ct-v4');
    if (ctv3) ctv3.textContent = r.delay;
    if (ctv4) ctv4.textContent = clr;

    var nodeInput = document.getElementById('commNodeReadout');
    if (nodeInput) nodeInput.value = r.name + ' [' + clr + ']';
  }

  window.selectCommRelay = function (idx) {
    _commRelayIdx = idx;
    document.querySelectorAll('#tab-comm .crs-btn').forEach(function (b, i) {
      b.classList.toggle('active', i === idx);
    });
    refreshCommReadouts();
  };

  window.selectCommClearance = function (clrCode) {
    _commClearance = clrCode;
    document.querySelectorAll('#tab-comm .clr-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-clr') === clrCode);
    });
    refreshCommReadouts();
  };

  window.updateCommPacketTelemetry = function () {
    var uiComm = (L().UI && L().UI.comm) || {};
    var sEl = document.getElementById('senderName');
    var mEl = document.getElementById('messageText');
    var s = (sEl && sEl.value) || '';
    var m = (mEl && mEl.value) || '';
    var bytes = (s.length + m.length) * 2;
    var hash = (0x8840 + ((bytes * 31) & 0x0FFF)).toString(16).toUpperCase();
    var counter = document.getElementById('cp-byte-counter');
    if (counter) {
      counter.textContent = (uiComm.bytePrefix || '') + bytes + (uiComm.byteMid || '') + hash;
    }
  };

  window.sendMessage = function () {
    var loc = L();
    var uiComm = (loc.UI && loc.UI.comm) || {};
    var nameEl = document.getElementById('senderName');
    var emailEl = document.getElementById('senderEmail');
    var msgEl  = document.getElementById('messageText');
    var name   = nameEl ? nameEl.value.trim() : '';
    var email  = emailEl ? emailEl.value.trim() : '';
    var msg    = msgEl  ? msgEl.value.trim()  : '';
    var st     = document.getElementById('form-status');
    var btn    = document.querySelector('#tab-comm .comm-btn');
    var clr    = _commClearance || 'VERMILION';
    var rList  = loc.RELAY_NODES || [];
    var relayName = (rList[_commRelayIdx] || rList[0] || {}).name || '';

    if (!name || !email || !msg) {
      st.style.color = 'var(--crimson-bright)';
      st.innerText = uiComm.errEmpty;
      sfx.commError();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      st.style.color = 'var(--crimson-bright)';
      st.innerText = uiComm.errEmail || 'ОШИБКА: Укажите корректный Email.';
      sfx.commError();
      return;
    }

    sfx.commTransmit();
    st.style.color = 'var(--text)';
    st.innerText = uiComm.sendingPrefix + clr + uiComm.sendingSuffix;
    btn.disabled = true;

    var scriptURL = 'https://script.google.com/macros/s/AKfycbz62mS5Z81uijCTZD0wV0yX3UkdiSMMSZPH7PYykeA26p2QGpHlWwegVZYLNDEyeM0i/exec';
    var fd = new FormData();
    fd.append('sender', name);
    fd.append('email', email);
    fd.append('message', msg);
    fd.append('urgency', clr);
    fd.append('priority', clr);
    fd.append('clearance', clr);
    fd.append('relay', relayName);

    telemetry.submitInquiry({
      sender: name,
      email: email,
      message: msg,
      clearance: clr,
      relay: relayName,
      lang: currentLang
    });

    (preview ? Promise.resolve() : fetch(scriptURL, { method: 'POST', body: fd, mode: 'no-cors' }))
      .then(function () {
        var feed = document.getElementById('comm-live-feed');
        if (feed) {
          var row = document.createElement('div');
          row.className = 'clb-line';
          var isCrit = (clr === 'BLACK' || clr === 'VERMILION');
          var tag = document.createElement('span');
          tag.className = 'clb-tag' + (isCrit ? ' crit' : '');
          tag.textContent = '[' + clr + ' · ' + name.toUpperCase() + ']';
          var text = document.createElement('span');
          text.className = 'clb-txt';
          text.textContent = msg;
          row.append(tag, text);
          feed.insertBefore(row, feed.firstChild);
        }

        if (nameEl) nameEl.value = '';
        if (emailEl) emailEl.value = '';
        if (msgEl)  msgEl.value  = '';
        window.updateCommPacketTelemetry();

        var curUiComm = (L().UI && L().UI.comm) || uiComm;
        st.style.color = 'var(--gold)';
        st.innerText = curUiComm.sentPrefix + clr + curUiComm.sentSuffix;
        btn.disabled = false;
        setTimeout(function () { st.innerText = ''; }, 5000);
      })
      .catch(function () {
        var curUiComm = (L().UI && L().UI.comm) || uiComm;
        st.style.color = 'var(--crimson-bright)';
        st.innerText = curUiComm.errNetwork;
        btn.disabled = false;
      });
  };

  /* ══════════════════════════════════════════════
     10. BOOT TERMINAL & REBOOT
  ══════════════════════════════════════════════ */
  (function initBootTerminal() {
    var SESSION_KEY = 'boot_terminal_shown';
    var bt = document.getElementById('boot-terminal');
    if (!bt) return;

    var logArea    = document.getElementById('bt-log-area');
    var consolWrap = document.getElementById('bt-console-wrap');
    var iconWrap   = document.getElementById('bt-icon');
    var progWrap   = document.getElementById('bt-progress-wrap');
    var progFill   = document.getElementById('bt-progress-fill');
    var progPct    = document.getElementById('bt-progress-pct');
    var authWrap   = document.getElementById('bt-auth-wrap');
    var authBtn    = document.getElementById('bt-auth-btn');
    var skipHint   = document.getElementById('bt-skip-hint');
    var timerEl    = document.getElementById('bt-timer');

    var PROGRESS_STEPS = [
      [0, 1000], [12, 1200], [28, 1500], [28, 2000], [45, 2200],
      [57, 2600], [57, 3100], [72, 3400], [83, 3750], [91, 4150], [100, 4600]
 ];

    var allTimers = [];
    var booting   = !sessionStorage.getItem(SESSION_KEY);
    var skipped   = false;
    var startTime = Date.now();
    var timerInterval = null;

    bypassBootPreview = function () {
      booting = false;
      allTimers.forEach(clearTimeout);
      allTimers = [];
      clearInterval(timerInterval);
      bt.classList.add('bt-hidden');
    };

    function startTimer() {
      clearInterval(timerInterval);
      timerInterval = setInterval(function () {
        var elapsed = Date.now() - startTime;
        var h = Math.floor(elapsed / 3600000);
        var m = Math.floor((elapsed % 3600000) / 60000);
        var s = Math.floor((elapsed % 60000) / 1000);
        timerEl.textContent =
          String(h).padStart(2, '0') + ':' +
          String(m).padStart(2, '0') + ':' +
          String(s).padStart(2, '0');
      }, 500);
    }

    function appendLine(text, cls) {
      var div = document.createElement('div');
      div.className = 'bt-log-line ' + cls;
      div.textContent = text;
      logArea.appendChild(div);
      logArea.scrollTop = logArea.scrollHeight;
      requestAnimationFrame(function () { div.classList.add('show'); });
    }

    function animateProgress() {
      progWrap.classList.add('visible');
      PROGRESS_STEPS.forEach(function (step) {
        var t = setTimeout(function () {
          if (skipped) return;
          progFill.style.width = step[0] + '%';
          progPct.textContent  = step[0] + '%';
        }, step[1]);
        allTimers.push(t);
      });
    }

    function showAuth() {
      authWrap.classList.add('visible');
      skipHint.classList.add('bt-hidden-hint');
    }

    function skipBoot() {
      if (!booting) return;
      skipped = true;
      sfx.tabSwitch();
      iconWrap.classList.add('bt-console-open');
      consolWrap.classList.add('visible');
      allTimers.forEach(clearTimeout);
      allTimers = [];
      var seq = L().BOOT_SEQ || [];
      var shown = logArea.querySelectorAll('.bt-log-line').length;
      seq.slice(shown).forEach(function (item) {
        appendLine(item.text, item.cls);
      });
      progFill.style.transition = 'none';
      progFill.style.width = '100%';
      progPct.textContent  = '100%';
      progWrap.classList.add('visible');
      showAuth();
    }

    function runBoot() {
      var consoleStarted = false;
      var seq = L().BOOT_SEQ || [];
      seq.forEach(function (item) {
        var t = setTimeout(function () {
          if (skipped) return;
          if (!consoleStarted) {
            consoleStarted = true;
            iconWrap.classList.add('bt-console-open');
            consolWrap.classList.add('visible');
          }
          if (item.delay === 3200 && !skipped) {
            bt.classList.add('bt-warp-glitch');
            sfx.bootGlitch();
            setTimeout(function () { bt.classList.remove('bt-warp-glitch'); }, 350);
          } else {
            sfx.bootLine(item.cls);
          }
          appendLine(item.text, item.cls);
        }, item.delay);
        allTimers.push(t);
      });

      allTimers.push(setTimeout(animateProgress, 800));
      var lastDelay = (seq.length ? seq[seq.length - 1].delay : 4400) + 650;
      allTimers.push(setTimeout(function () {
        if (!skipped) {
          sfx.preloaderUnlock();
          showAuth();
        }
      }, lastDelay));
    }

    window.bootAuthorize = function () {
      if (!booting) return;
      booting = false;
      sfx.rosettaSeal();
      var uiBoot = (L().UI && L().UI.boot) || {};
      authBtn.innerHTML = uiBoot.accessGranted || '[ ДОСТУП РАЗРЕШЕН ]';
      authBtn.classList.add('bt-access-granted');
      clearInterval(timerInterval);
      sessionStorage.setItem(SESSION_KEY, '1');
      setTimeout(function () {
        bt.classList.add('bt-exit-crt');
        bt.addEventListener('animationend', function handler() {
          bt.removeEventListener('animationend', handler);
          bt.classList.add('bt-hidden');
          var activeNav = document.querySelector('.sb-nav .nav-item.active');
          if (activeNav && getComputedStyle(activeNav).visibility !== 'hidden') {
            activeNav.focus({ preventScroll: true });
          }
        });
      }, 480);
    };

    function bindBootKey() {
      document.addEventListener('keydown', function onBootKey(e) {
        if (!booting) {
          document.removeEventListener('keydown', onBootKey);
          return;
        }
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          if (authWrap.classList.contains('visible')) {
            window.bootAuthorize();
            document.removeEventListener('keydown', onBootKey);
          } else {
            skipBoot();
          }
        }
      });
    }

    bt.addEventListener('click', function (e) {
      if (!booting) return;
      if (e.target === authBtn || authBtn.contains(e.target)) return;
      if (authWrap.classList.contains('visible')) return;
      skipBoot();
    });

    window.restartBootTerminal = function () {
      allTimers.forEach(clearTimeout);
      allTimers = [];
      clearInterval(timerInterval);

      var uiBoot = (L().UI && L().UI.boot) || {};
      booting = true;
      skipped = false;
      startTime = Date.now();
      logArea.innerHTML = '';
      progFill.style.transition = '';
      progFill.style.width = '0%';
      progPct.textContent = '0%';
      progWrap.classList.remove('visible');
      authWrap.classList.remove('visible');
      consolWrap.classList.remove('visible');
      iconWrap.classList.remove('bt-console-open');
      skipHint.classList.remove('bt-hidden-hint');
      authBtn.innerHTML = uiBoot.authBtnHtml || '<span>[ </span>ПРИЛОЖИТЬ РОЗЕТТУ · ВОЙТИ<span> ]</span>';
      authBtn.classList.remove('bt-access-granted');
      bt.classList.remove('bt-hidden', 'bt-exit-crt', 'bt-warp-glitch');

      bindBootKey();
      allTimers.push(setTimeout(runBoot, 400));
      startTimer();
    };

    if (!booting) {
      bt.classList.add('bt-hidden');
      return;
    }

    bindBootKey();
    allTimers.push(setTimeout(runBoot, 650));
    startTimer();
  })();

  window.rebootTerminal = function () {
    sfx.rebootTerminal();
    sessionStorage.clear();
    _dossierReady = false;
    ['armory', 'logs', 'astro', 'squad', 'comm', 'sublim'].forEach(function (name) {
      cancelPreloader(name);
      var l = document.getElementById(name + '-loader');
      var c = document.getElementById(name + '-content');
      if (l) { l.style.display = ''; l.classList.remove('pl-flash-out', 'active'); l.innerHTML = ''; }
      if (c) { c.classList.remove('visible'); c.inert = true; }
    });
    window.switchTab(cms.homeId());
    if (window.restartBootTerminal) window.restartBootTerminal();
  };

  /* ══════════════════════════════════════════════
     11. COGITATOR PROCEDURAL AUDIO ENGINE (WEB AUDIO API)
  ══════════════════════════════════════════════ */
  function updateAudioBtnLabel() {
    var btn = document.getElementById('sfx-toggle-btn');
    if (!btn) return;
    var uiSb = (L().UI && L().UI.sidebar) || {};
    var isMuted = sfx.isMuted();
    btn.textContent = isMuted
      ? (uiSb.audioOff || '[ ВОКС-АУДИО: ВЫКЛ ]')
      : (uiSb.audioOn  || '[ ВОКС-АУДИО: ВКЛ ]');
    btn.style.color = isMuted ? '#6a4035' : 'var(--gold)';
  }

  (function bindCogitatorAudioEvents() {
    window.toggleCogitatorAudio = function () {
      sfx.toggleMute();
      updateAudioBtnLabel();
    };

    window.playCogitatorBeep = function () {
      sfx.init();
      sfx.auspexSelect(0);
    };

    function wakeAudioOnGesture() {
      document.documentElement.classList.remove('kb-nav');
      sfx.init();
    }

    function onKeyWake(e) {
      if (
        e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' ||
        e.key === 'End' || e.key === 'PageUp' || e.key === 'PageDown' ||
        e.key === '?' || e.key === 'F1' || /^[1-8]$/.test(e.key) ||
        e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyS' || e.code === 'KeyD' ||
        e.code === 'KeyB' || e.code === 'KeyM' || e.code === 'KeyL'
      ) {
        document.documentElement.classList.add('kb-nav');
      }
      sfx.init();
    }

    document.addEventListener('pointerdown', wakeAudioOnGesture, { passive: true, capture: true });
    document.addEventListener('keydown', onKeyWake, { passive: true, capture: true });

    document.addEventListener('click', function (e) {
      sfx.init();
      var t = e.target;
      if (
        t.closest('#bt-auth-btn') ||
        t.closest('#archive-btn') ||
        t.closest('#visor-fire-btn') ||
        t.closest('#ecg-stress-btn') ||
        t.closest('#reboot-btn') ||
        t.closest('#sfx-toggle-btn') ||
        t.closest('.comm-btn') ||
        t.closest('.weapon-card') ||
        t.closest('.mission-hd') ||
        t.closest('.squad-card') ||
        t.closest('.modal-close')
      ) {
        return;
      }

      if (t.closest('#astro-open-caelis-btn, #shf-enter-btn, .sys-node.clickable')) {
        sfx.astroEnterPlanet();
      } else if (t.closest('#astro-back-hub-btn')) {
        sfx.astroExitPlanet();
      } else if (t.closest('.nav-item')) {
        sfx.tabSwitch();
      } else if (t.closest('.sidebar-toggle')) {
        var sidebar = document.getElementById('terminal-sidebar');
        sfx.accordion(sidebar && sidebar.getAttribute('data-collapsed') !== 'true');
      } else if (t.closest('[data-visor-spread], [data-visor-charge], #vdummy-minus, #vdummy-plus, #vdummy-plus10, #vdummy-max')) {
        sfx.visorLock();
      } else if (t.closest('.clr-btn')) {
        sfx.commClearance(t.closest('.clr-btn').getAttribute('data-clr'));
      } else if (t.closest('.crs-btn')) {
        var crsBtns = Array.prototype.slice.call(document.querySelectorAll('#tab-comm .crs-btn'));
        sfx.commRelay(crsBtns.indexOf(t.closest('.crs-btn')));
      } else if (t.closest('#sr-encrypt-btn')) {
        sfx.sublimEncrypt();
      } else if (t.closest('#tab-sublim .log-entry, #sr-prev-btn, #sr-next-btn')) {
        sfx.sublimScroll();
      } else if (t.closest('#lang-toggle-btn')) {
        sfx.auspexSelect(2);
      } else if (t.closest('.armor-node, .ni-btn, .ammo-tab, [data-visor-ammo], .astro-pin, .ah-qbtn, .astro-btn, .bio-node, .bx-btn, .dna-tab, .sys-node, .mnemo-tab-btn, .mnemo-step-btn')) {
        sfx.auspexSelect(Math.floor(Math.random() * 4));
      } else if (t.closest('button, a, [role="button"], .bc-link, .mx-decrypt')) {
        sfx.haptic('tap');
      }
    });

    document.addEventListener('input', function (e) {
      if (e.target && (e.target.id === 'senderName' || e.target.id === 'messageText')) {
        sfx.init();
        sfx.commKeyTick();
      }
    });

    var lastHovered = null;
    var lastRawTarget = null;
    document.addEventListener('mouseover', function (e) {
      if (sfx.isMuted() || e.target === lastRawTarget) return;
      lastRawTarget = e.target;
      var item = e.target.closest('.nav-item, .sidebar-toggle, .reboot-btn, .armor-node, .ni-btn, .ammo-tab, .squad-card, .weapon-card, .astro-pin, .astro-btn, .ah-qbtn, .bio-node, .bx-btn, .dna-tab, .vc-btn, .crs-btn, .clr-btn, .mnemo-tab-btn, .sr-step-btn, .sr-encrypt-btn');
      if (item && item !== lastHovered) {
        lastHovered = item;
        sfx.hoverTick();
      } else if (!item) {
        lastHovered = null;
      }
    }, { passive: true });

    updateAudioBtnLabel();
  })();

  /* ══════════════════════════════════════════════
     12. UNIFIED LOCALIZATION ENGINE (RU · EN)
  ══════════════════════════════════════════════ */
  function updateSidebarNav(uiSb) {
    var navLabels = uiSb.navLabels || [];
    builtinNavOrder.forEach(function (id, idx) {
      var item = cms.navButton(id);
      var label = navLabels[idx];
      if (!item || !label) return;
      item.title = label;
      item.querySelector('.nav-label').textContent = label;
    });

    var badgeEl = document.querySelector('.sb-nav .nav-badge');
    if (badgeEl && uiSb.logsBadge) badgeEl.textContent = uiSb.logsBadge;

    var hidItem = document.querySelector('.sb-nav .nav-item.hidden-item');
    if (hidItem) {
      hidItem.title = uiSb.hiddenTitle || '';
      var lockedLabel = hidItem.querySelector('.hi-scramble');
      if (lockedLabel) lockedLabel.textContent = currentLang === 'en' ? 'Restricted section' : 'Закрытый раздел';
      var realSpan = hidItem.querySelector('.hi-real');
      if (realSpan) realSpan.textContent = (uiSb.hiddenReal || '').replace(/^>\s*/, '');
    }
  }

  function applyBioLocalization(loc) {
    var ui = loc.UI.bio;
    setElText('#profile-context', ui.eyebrow);
    setElHTML('#tab-bio .pg-title', ui.titleHtml);
    var avImg = document.querySelector('#tab-bio .char-img');
    if (avImg) avImg.alt = ui.avatarAlt;

    setElText('#tab-bio .physio-title', ui.physioTitle);
    document.querySelectorAll('#tab-bio .physio-row').forEach(function (row, i) {
      var k = row.querySelector('.ph-key');
      var v = row.querySelector('.ph-val');
      if (k && ui.phKeys[i]) k.textContent = ui.phKeys[i];
      if (v && ui.phVals[i]) v.textContent = ui.phVals[i];
    });

    document.querySelectorAll('#tab-bio .info-panel .data-row').forEach(function (row, i) {
      if (!ui.passport[i]) return;
      var l = row.querySelector('.data-label');
      var v = row.querySelector('.data-value');
      if (l) l.textContent = ui.passport[i][0];
      if (v) v.textContent = ui.passport[i][1];
    });

    var gsLabelSpans = document.querySelectorAll('#tab-bio .gs-label > span');
    if (gsLabelSpans[0]) gsLabelSpans[0].textContent = ui.gsLabel;

    var ecgSpans = document.querySelectorAll('#tab-bio .ecg-readout > span');
    if (ecgSpans[0]) ecgSpans[0].innerHTML = ui.heart1Html;
    if (ecgSpans[2]) ecgSpans[2].innerHTML = ui.heart2Html;
    if (!_bioEcgState.stress) {
      setElText('#ecg-stress-btn', ui.stressBtnIdle);
    } else {
      setElText('#ecg-stress-btn', ui.stressBtnAlert);
    }

    document.querySelectorAll('#tab-bio .gs-h-item').forEach(function (item, i) {
      if (!ui.gsBars[i]) return;
      var nm = item.querySelector('.gs-h-name');
      var vd = item.querySelector('.gs-h-verdict');
      if (nm) nm.textContent = ui.gsBars[i][0];
      if (vd && i < 3) vd.textContent = ui.gsBars[i][1];
    });
    window.syncBioWithSublimation();

    var xrayHdr = document.querySelectorAll('#tab-bio .bio-xray-panel .bx-header > span');
    if (xrayHdr[0]) xrayHdr[0].textContent = ui.xrayTitle;
    if (xrayHdr[1]) xrayHdr[1].textContent = ui.xrayImplants;

    document.querySelectorAll('#tab-bio .bx-svg text').forEach(function (t) {
      if (t.id === 'bx-svg-blocked' || t.textContent.indexOf('ОММОФАГИЯ') !== -1 || t.textContent.indexOf('OMOPHAGAEA') !== -1) {
        t.textContent = ui.xraySvgBlocked;
      }
    });

    var activeBioIdx = 0;
    document.querySelectorAll('#tab-bio .bx-btn').forEach(function (b, i) {
      if (ui.bxBtns[i]) {
        b.textContent = ui.bxBtns[i];
        document.getElementById('bnode-' + i)?.setAttribute('aria-label', ui.bxBtns[i]);
      }
      if (b.classList.contains('active')) activeBioIdx = i;
    });
    window.selectBioNode(activeBioIdx);

    var dnaHdr = document.querySelectorAll('#tab-bio .bio-dna-panel .bx-header > span');
    if (dnaHdr[0]) dnaHdr[0].textContent = ui.dnaTitle;
    if (dnaHdr[1]) dnaHdr[1].textContent = ui.dnaStrain;

    var activeDnaIdx = 0;
    var activeDnaEl = null;
    document.querySelectorAll('#tab-bio .dna-tab').forEach(function (b, i) {
      if (ui.dnaBtns[i]) b.textContent = ui.dnaBtns[i];
      if (b.classList.contains('active')) { activeDnaIdx = i; activeDnaEl = b; }
    });
    window.selectDnaNode(activeDnaIdx, activeDnaEl);
  }

  function applyDossierLocalization(loc) {
    var ui = loc.UI.dossier;
    setElHTML('#al1', ui.al1Html);
    setElHTML('#al2', ui.al2Html);
    setElHTML('#al3', ui.al3Html);
    setElHTML('#al4', ui.al4Html);

    var dEl = document.getElementById('dossier-content');
    if (dEl) dEl.innerHTML = loc.DOSSIER_BENTO_HTML || '';

    var aEl = document.querySelector('#psycho-archive .modal-box');
    if (aEl) {
      aEl.innerHTML = loc.ARCHIVE_MNEMO_HTML || '';
      var mnemoVp = aEl.querySelector('#mnemo-viewport');
      if (mnemoVp) mnemoVp.setAttribute('tabindex', '0');
    }

    if (_corticalSynced) {
      var archBtn = document.getElementById('archive-btn');
      if (archBtn) {
        archBtn.classList.add('clink-done');
        archBtn.innerHTML = ui.corticalDoneBtnHtml;
        archBtn.onclick = function () {
          openArchivePage(true);
        };
      }
    }

    var origSealSvg = document.querySelector('.inquisition-seal-box .isb-svg');
    var waxSlot = document.getElementById('sr-wax-svg-slot');
    if (origSealSvg && waxSlot) {
      waxSlot.innerHTML = '';
      waxSlot.appendChild(origSealSvg.cloneNode(true));
    }

    window.initMatrixDecrypt();
    window.selectMemoryAct(_currentActIdx);
  }

  function applyArmoryLocalization(loc) {
    var ui = loc.UI.armory;
    setElText('#tab-armory .pg-eyebrow', ui.eyebrow);
    setElHTML('#tab-armory .pg-title', ui.titleHtml);

    var auspexTop = document.querySelectorAll('#tab-armory .auspex-top-bar > span');
    if (auspexTop[0]) auspexTop[0].textContent = ui.auspexScan;
    if (auspexTop[1]) auspexTop[1].textContent = ui.auspexSig;
    setElText('#tab-armory .auspex-foot', ui.auspexFoot);

    ['ams-k1', 'ams-k2', 'ams-k3', 'ams-k4'].forEach(function (id, i) {
      setElText('#' + id, ui.amsKeys[i]);
    });
    ['ams-v1', 'ams-v2', 'ams-v3', 'ams-v4'].forEach(function (id, i) {
      setElText('#' + id, ui.amsVals[i]);
    });
    ['nit-k1', 'nit-k2', 'nit-k3', 'nit-k4'].forEach(function (id, i) {
      setElText('#' + id, ui.nitKeys[i]);
    });

    document.querySelectorAll('#tab-armory .ni-btn').forEach(function (b, i) {
      if (ui.niBtns[i]) b.textContent = ui.niBtns[i];
    });
    window.selectArmorNode(_currentArmorNodeIdx);

    setElText('#tab-armory .ammo-title', ui.ammoTitle);
    document.querySelectorAll('#tab-armory .ammo-bars .stat-lbl > span:first-child').forEach(function (sp, i) {
      if (ui.ammoBarLabels[i]) sp.textContent = ui.ammoBarLabels[i];
    });
    window.selectAmmo(_currentAmmoIdx);

    setElText('#visor-top-title', ui.visorTopTitle);
    ui.vmodes.forEach(function (label, i) {
      setElText('#vmode-' + i, label);
    });
    updateVisorShotStatus(document.getElementById('visor-shot-status')?.dataset.phase || 'ready');
    if (ui.simDistLabel) setElText('#visor-dist-lbl', ui.simDistLabel);
    updateVisorRangeTelemetry();

    setElText('#armory-reg-divider', ui.regDivider);

    var wCardsData = loc.WEAPON_CARDS || [];
    document.querySelectorAll('#tab-armory .weapon-card').forEach(function (card, idx) {
      var wd = wCardsData[idx];
      if (!wd) return;
      var cat = card.querySelector('.w-cat');
      var nm  = card.querySelector('.w-name');
      var sb  = card.querySelector('.w-sub');
      var nt  = card.querySelector('.w-note');
      if (cat) cat.innerHTML = wd.cat;
      if (nm)  nm.textContent = wd.name;
      if (sb)  sb.textContent = wd.sub;
      if (nt)  nt.innerHTML = wd.note;

      card.querySelectorAll('.wqs-pill').forEach(function (pill, pi) {
        if (!wd.quickSpecs || !wd.quickSpecs[pi]) return;
        var pk = pill.querySelector('.wqs-k');
        var pv = pill.querySelector('.wqs-v');
        if (pk) pk.textContent = wd.quickSpecs[pi][0];
        if (pv) pv.textContent = wd.quickSpecs[pi][1];
      });

      card.querySelectorAll('.stat-row').forEach(function (sr, si) {
        if (!wd.stats[si]) return;
        var s1 = sr.querySelector('.stat-lbl > span:first-child');
        var s2 = sr.querySelector('.stat-val');
        if (s1) s1.textContent = wd.stats[si][0];
        if (s2) s2.textContent = wd.stats[si][1];
      });

      var wfsL = card.querySelector('.wfs-left');
      var wfsS = card.querySelector('.wfs-seal');
      if (wfsL) wfsL.textContent = wd.forgeLeft;
      if (wfsS) wfsS.textContent = wd.forgeSeal;
    });

    updateToggleAllBtnText();
  }

  function applyLogsLocalization(loc) {
    var ui = loc.UI.logs;
    var missions = loc.MISSIONS || {};

    setElText('#tab-logs .pg-eyebrow', ui.eyebrow);
    setElHTML('#tab-logs .pg-title', ui.titleHtml);
    document.querySelectorAll('#tab-logs .ts-card').forEach(function (tc, i) {
      if (!ui.tsCards[i]) return;
      var l = tc.querySelector('.ts-lbl');
      var v = tc.querySelector('.ts-val');
      if (l) l.textContent = ui.tsCards[i][0];
      if (v) v.textContent = ui.tsCards[i][1];
    });
    setElHTML('#tab-logs .warning-strip', ui.warningHtml);

    ['mission-1', 'mission-2'].forEach(function (domId, idx) {
      var mData = idx === 0 ? missions.m1 : missions.m2;
      if (!mData) return;
      setElText('#' + domId + ' .m-code', mData.code);
      setElText('#' + domId + ' .m-title', mData.title);
      setElText('#' + domId + ' .m-dist', mData.dist);
      var mStatus = document.querySelector('#' + domId + ' .m-status');
      if (mStatus) {
        mStatus.classList.remove('template');
        mStatus.textContent = mData.status;
      }
      document.querySelectorAll('#' + domId + ' .st-item').forEach(function (item, si) {
        if (!mData.telem[si]) return;
        var k = item.querySelector('.st-k');
        var v = item.querySelector('.st-v');
        if (k) k.textContent = mData.telem[si][0];
        if (v) v.textContent = mData.telem[si][1];
      });
      document.querySelectorAll('#' + domId + ' .lore-p').forEach(function (p, pi) {
        if (mData.paras[pi]) {
          p.removeAttribute('style');
          p.innerHTML = mData.paras[pi];
        }
      });
      setElText('#' + domId + ' .cv-head', mData.cvHead);
      var cvText = document.querySelector('#' + domId + ' .cv-text');
      if (cvText) {
        cvText.removeAttribute('style');
        cvText.textContent = mData.cvText;
      }
    });

    var entries = missions.entries || {};
    Object.keys(entries).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.innerHTML = entries[id];
    });
  }

  function applyAstroLocalization(loc) {
    var ui = loc.UI.astro;
    var hubImg = document.getElementById('sys-hub-img');
    if (hubImg && loc.SYS_IMG) hubImg.src = loc.SYS_IMG;
    syncAstroPlanetImage(loc);

    setElText('#astro-open-caelis-btn', ui.openCaelisBtn);
    setElText('#astro-back-hub-btn', ui.backHubBtn);
    setElText('#alayer-btn-0', ui.layers[0]);
    setElText('#alayer-btn-1', ui.layers[1]);
    setElText('#alayer-btn-2', ui.layers[2]);

    var stageEl = document.getElementById('hololith-stage');
    var isOpt = stageEl && stageEl.classList.contains('optical-mode');
    setElText('#astro-spectrum-btn', isOpt ? ui.spectrumOpt : ui.spectrumAuspex);

    var tabAstro = document.getElementById('tab-astro');
    var isFs = tabAstro && tabAstro.classList.contains('holo-fullscreen');
    setElText('#astro-fs-btn', isFs ? ui.fsExit : ui.fsEnter);

    document.getElementById('system-caelis-marker').setAttribute('aria-label', ui.openCaelisBtn.replace(/[\[\]]/g, '').trim());
    document.querySelectorAll('[data-system-body]').forEach(function (control) {
      var body = (loc.SYS_BODIES_INFO || [])[Number(control.dataset.systemBody)];
      if (!body) return;
      var label = body[0].split(' · ')[0];
      if (control.tagName.toLowerCase() === 'button') control.textContent = label;
      else control.setAttribute('aria-label', label);
    });
    setElText('#shf-enter-btn', ui.shfEnterBtn);

    setElText('#apin-0 .pin-tag', ui.pin0);
    setElText('#apin-1 .pin-tag', ui.pin1);
    setElText('#apin-10-tag', ui.pin10);
    setElText('#apin-11 .pin-tag', ui.pin11);
    setElText('#apin-12 .pin-tag', ui.pin12);
    setElText('#apin-13 .pin-tag', ui.pin13);
    setElText('#apin-14 .pin-tag', ui.pin14);
    setElText('#apin-15 .pin-tag', ui.pin15);
    setElText('#apin-16 .pin-tag', ui.pin16);
    setElText('#apin-17 .pin-tag', ui.pin17);
    setElText('#apin-18 .pin-tag', ui.pin18);

    setElText('#ah-spec-k1', ui.specKeys[0]);
    setElText('#ah-spec-k2', ui.specKeys[1]);
    setElText('#ah-quick-title', ui.quickTitle);

    window.initAstroMap();

    if (_astroInPlanet) {
      window.openAstroPlanet('caelis');
    } else {
      window.closeAstroPlanet();
    }
  }

  function applySquadLocalization(loc) {
    var ui = loc.UI.squad;
    setElText('#tab-squad .pg-eyebrow', ui.eyebrow);
    setElHTML('#tab-squad .pg-title', ui.titleHtml);
    setElHTML('#tab-squad .warning-strip', ui.warningHtml);
    window.renderSquadCards();

    setElText('#squad-modal .modal-close', ui.modalClose);
    document.querySelectorAll('#squad-modal .stat-lbl > span:first-child').forEach(function (sp, i) {
      if (ui.statLabels[i]) sp.textContent = ui.statLabels[i];
    });
    var sqmMeta = document.querySelector('#squad-modal .doc-meta');
    if (sqmMeta) {
      var curSyn = document.getElementById('sqm-synergy') ? document.getElementById('sqm-synergy').textContent : '';
      var curPri = document.getElementById('sqm-priority') ? document.getElementById('sqm-priority').textContent : '';
      sqmMeta.innerHTML =
        escapeMarkup(ui.synergyPrefix) + '<span id="sqm-synergy">' + escapeMarkup(curSyn) + '</span><br>' +
        escapeMarkup(ui.priorityPrefix) + '<span id="sqm-priority">' + escapeMarkup(curPri) + '</span>';
    }
    setElText('#squad-modal .file-tag', ui.fileTag);
    setElText('#squad-modal .file-name', ui.fileName);
    setElText('#squad-modal .cv-head', ui.verdictHead);

    var sqModal = document.getElementById('squad-modal');
    if (sqModal && sqModal.classList.contains('active') && _activeSquadIdx !== null) {
      window.openSquadModal(_activeSquadIdx);
    }
  }

  function applySublimLocalization(loc) {
    var ui = loc.UI.sublim;
    setElText('#tab-sublim .pg-eyebrow', ui.eyebrow);
    setElHTML('#tab-sublim .pg-title', escapeMarkup(ui.title) + ' <span class="status-badge" id="sublim-top-badge">' + escapeMarkup(ui.topBadge) + '</span>');
    setElHTML('#tab-sublim .warning-strip', ui.warningHtml);
    setElHTML('#sublim-banner', ui.bannerHtml);

    var logs = loc.SUBLIM_LOGS || [];
    logs.forEach(function (item, idx) {
      var entry = document.getElementById('sub-' + (idx + 1));
      if (!entry) return;
      var numEl = entry.querySelector('.log-num');
      var titEl = entry.querySelector('.log-title-text');
      var encEl = entry.querySelector('.log-enc');
      var pmEl  = entry.querySelector('.log-poem');
      if (numEl) numEl.textContent = item.num;
      if (titEl) titEl.textContent = item.title;
      if (pmEl)  pmEl.textContent  = item.poem;
      if (encEl) {
        var isOpen = entry.classList.contains('open');
        encEl.textContent = isOpen ? ui.decrypted : ui.encrypted;
      }
    });

    setElText('#sr-wax-title', ui.waxTitle);
    setElText('#sr-wax-sub', ui.waxSub);
    setElText('#sr-prev-btn', ui.prevBtn);
    setElText('#sr-next-btn', ui.nextBtn);
    setElText('#sr-encrypt-btn', ui.encryptBtn);

    if (_curSublimIdx === -1) {
      setStandbyReader();
    } else {
      window.selectSublimSlot(_curSublimIdx, true);
    }
  }

  function applyCommLocalization(loc) {
    var ui = loc.UI.comm;
    setElText('#tab-comm .pg-eyebrow', ui.eyebrow);

    var commTitle = document.querySelector('#tab-comm .pg-title');
    if (commTitle) {
      commTitle.innerHTML = escapeMarkup(ui.title) + ' <span class="status-badge" id="comm-top-badge"></span>';
    }

    setElText('#cb-head-title', ui.beaconHeadTitle);
    setElText('#ct-k1', ui.ctKeys[0]);
    setElText('#ct-k2', ui.ctKeys[1]);
    setElText('#ct-v2', ui.ctV2);
    setElText('#ct-k3', ui.ctKeys[2]);
    setElText('#ct-k4', ui.ctKeys[3]);
    setElText('#crs-label', ui.crsLabel);

    var relays = loc.RELAY_NODES || [];
    document.querySelectorAll('#tab-comm .crs-btn').forEach(function (btn, i) {
      var spans = btn.querySelectorAll('span');
      if (relays[i]) {
        if (spans[0]) spans[0].textContent = relays[i].btnName;
        if (spans[1]) spans[1].textContent = relays[i].btnTag;
      }
    });

    setElText('#cp-console-title', ui.consoleTitle);
    setElText('#clr-group-lbl', ui.clrGroupLbl);

    document.querySelectorAll('#tab-comm .clr-btn').forEach(function (btn) {
      var grade = btn.getAttribute('data-clr');
      var sub = btn.querySelector('.clr-sub');
      if (sub && grade && ui.clrSub[grade]) sub.textContent = ui.clrSub[grade];
    });

    setElText('#lbl-sender', ui.lblSender);
    setElText('#lbl-email', ui.lblEmail);
    setElText('#lbl-target-node', ui.lblTargetNode);
    setElText('#lbl-msg', ui.lblMsg);

    var sInp = document.getElementById('senderName');
    var eInp = document.getElementById('senderEmail');
    var mInp = document.getElementById('messageText');
    if (sInp) sInp.placeholder = ui.senderPlaceholder;
    if (eInp && ui.emailPlaceholder) eInp.placeholder = ui.emailPlaceholder;
    if (mInp) mInp.placeholder = ui.msgPlaceholder;

    var sendBtn = document.querySelector('#tab-comm .comm-btn');
    if (sendBtn) sendBtn.innerHTML = ui.sendBtnHtml;

    setElText('#clb-head-title', ui.logHeadTitle);
    setElText('#clb-head-status', ui.logHeadStatus);

    var feed = document.getElementById('comm-live-feed');
    if (feed && ui.initialFeed) {
      feed.querySelectorAll('.clb-seed').forEach(function (el) { el.remove(); });
      ui.initialFeed.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'clb-line clb-seed';
        row.innerHTML =
          '<span class="clb-tag' + (item.crit ? ' crit' : '') + '">' + escapeMarkup(item.tag) + '</span>' +
          '<span class="clb-txt">' + escapeMarkup(item.txt) + '</span>';
        feed.appendChild(row);
      });
    }

    refreshCommReadouts();
    window.updateCommPacketTelemetry();
  }

  function applyBootLocalization(loc) {
    var ui = loc.UI.boot;
    var bt = document.getElementById('boot-terminal');
    if (bt) bt.setAttribute('aria-label', ui.ariaLabel);
    setElText('.bt-header-left', ui.headerLeft);
    setElText('#bt-progress-label-text', ui.progressLabel);
    var authBtn = document.getElementById('bt-auth-btn');
    if (authBtn && !authBtn.classList.contains('bt-access-granted')) {
      authBtn.innerHTML = ui.authBtnHtml;
    }
    setElText('#bt-skip-hint', ui.skipHint);
  }

  window.applySiteLanguage = function (lang) {
    var code = (lang === 'en') ? 'en' : 'ru';
    cms.restoreOverrides();
    currentLang = code;
    if (!preview) localStorage.setItem('cogitator_lang', code);
    document.documentElement.lang = code;

    var loc = L(code);
    if (!loc || !loc.UI) return;

    document.title = loc.title || document.title;

    /* Sidebar */
    var uiSb = loc.UI.sidebar;
    setElText('.sb-chapter', uiSb.chapter);
    setElText('.sb-legion', uiSb.legion);
    updateSidebarNav(uiSb);
    setElText('#sb-codex-ref', uiSb.codexRef);
    setElText('#sb-access-badge', uiSb.accessBadge);
    setElText('#lang-toggle-btn', uiSb.langBtn);
    setElText('#reboot-btn', uiSb.rebootBtn);
    updateAudioBtnLabel();

    /* All Tabs & Modals */
    applyBioLocalization(loc);
    applyDossierLocalization(loc);
    applyArmoryLocalization(loc);
    applyLogsLocalization(loc);
    applyAstroLocalization(loc);
    applySquadLocalization(loc);
    applySublimLocalization(loc);
    applyCommLocalization(loc);
    applyBootLocalization(loc);
    cms.applyLanguage(code);
    updateBreadcrumbs();
    cms.inspectRoute(_activeRouteId);
  };

  window.toggleSiteLanguage = function () {
    var next = currentLang === 'ru' ? 'en' : 'ru';
    telemetry.setLanguage(next);
    telemetry.trackEvent('lang_switch', _activeRouteId, next);
    window.applySiteLanguage(next);
  };

  /* ── BACKGROUND MEDIA PRELOADER (2-CONCURRENT QUEUE) ── */
  var _mediaPreloadStarted = false;

  function collectMediaUrls() {

    var seen = Object.create(null);
    var urls = [];

    function addUrl(url) {
      if (typeof url !== 'string') return;
      var trimmed = url.trim();
      if (!trimmed || seen[trimmed]) return;
      seen[trimmed] = true;
      urls.push(trimmed);
    }

    function addFromList(list) {
      if (!Array.isArray(list)) return;
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (!item) continue;
        addUrl(item.img || item.image);
      }
    }

    var langs = ['ru', 'en'];
    for (var i = 0; i < langs.length; i++) {
      var loc = currentLocales[langs[i]];
      if (!loc) continue;
      addUrl(resolveCaelisMap(loc.CAELIS_IMG));
      addUrl(loc.SYS_IMG);
      addFromList(loc.SQUAD_DATA);
      addFromList(loc.SUBLIM_LOGS);
      addFromList(loc.MISSIONS);
      addFromList(loc.BIO_XRAY_NODES);
      addFromList(loc.BIO_DNA_NODES);
    }

    return urls;
  }

  window.preloadAllMedia = function () {
    if (_mediaPreloadStarted) return;
    _mediaPreloadStarted = true;

    var urls = collectMediaUrls();
    if (!urls.length) return;

    var CONCURRENCY = 2;
    var nextIndex = 0;

    function loadNext() {
      if (nextIndex >= urls.length) return;
      var url = urls[nextIndex++];
      var img = new Image();
      var finished = false;

      function onDone() {
        if (finished) return;
        finished = true;
        img.onload = null;
        img.onerror = null;
        loadNext();
      }

      img.onload = onDone;
      img.onerror = onDone;
      img.src = url;
    }

    var workers = Math.min(CONCURRENCY, urls.length);
    for (var i = 0; i < workers; i++) {
      loadNext();
    }
  };

  if (document.readyState === 'complete') {
    setTimeout(window.preloadAllMedia, 1000);
  } else {
    window.addEventListener('load', function () {
      setTimeout(window.preloadAllMedia, 1000);
    });
  }

  /* ── INITIALIZE APPLICATION ON LOAD ── */
  window.applySiteLanguage(currentLang);
  telemetry.start(_activeRouteId, currentLang);

  function navigateFromLocation() {
    var slug = location.hash.slice(1);
    var route = slug ? cms.resolveRoute(slug) : cms.homeId();
    if (route && !cms.isHidden(route)) window.switchTab(route, null, { skipHistory: true });
  }

  window.addEventListener('hashchange', navigateFromLocation);
  cms.start({
    onDocument: function (document) {
      currentLocales = {
        ru: mergeLocale(ru, document.locales?.ru, cms.base),
        en: mergeLocale(en, document.locales?.en, cms.base)
      };
      cms.setDocument(document, currentLang);
      var route = cms.resolveRoute(location.hash.slice(1)) || cms.resolveRoute(_activeRouteId);
      if (!route || cms.isHidden(route)) route = cms.homeId();
      window.switchTab(route, null, { skipHistory: true, keepScroll: true, silent: true, force: true });
      window.applySiteLanguage(currentLang);
    },
    onNavigate: function (route) {
      window.switchTab(route, null, { skipHistory: true, keepScroll: true, force: true });
    },
    onLanguage: window.applySiteLanguage,
    onPreview: function () {
      preview = true;
      bypassBootPreview();
    }
  });
  if (location.hash) navigateFromLocation();
}
