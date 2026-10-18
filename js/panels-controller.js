/**
 * panels-controller.js
 * Side Panels Resizing & Collapse/Expand Management
 * RBRU Next Gen Lab 2026
 */

let leftPanelWidth = 360;
let rightPanelWidth = 430;
let leftPanelCollapsed = false;
let rightPanelCollapsed = false;

function setPanelWidth(side, widthPx) {
  if (side === 'left') {
    leftPanelWidth = Math.max(260, Math.min(widthPx, window.innerWidth - 320));
    document.documentElement.style.setProperty('--left-panel-width', leftPanelWidth + 'px');
  } else if (side === 'right') {
    rightPanelWidth = Math.max(300, Math.min(widthPx, window.innerWidth - 320));
    document.documentElement.style.setProperty('--right-panel-width', rightPanelWidth + 'px');
  }
}

function adjustPanelWidth(side, deltaPx) {
  if (side === 'left') {
    if (leftPanelCollapsed) {
      toggleSidePanel('left');
    }
    setPanelWidth('left', leftPanelWidth + deltaPx);
  } else if (side === 'right') {
    if (rightPanelCollapsed) {
      toggleSidePanel('right');
    }
    setPanelWidth('right', rightPanelWidth + deltaPx);
  }
}

function toggleSidePanel(side) {
  if (side === 'left') {
    leftPanelCollapsed = !leftPanelCollapsed;
    document.querySelectorAll('.side-panel.left-panel').forEach(p => {
      p.classList.toggle('collapsed', leftPanelCollapsed);
    });
    const dockLeft = document.getElementById('edge-toggle-left');
    const dockLeftIcon = document.getElementById('edge-toggle-left-icon');
    const btnToggle = document.getElementById('btn-toggle-left-panel');
    const btnIcon = document.getElementById('btn-toggle-left-icon');

    if (dockLeft) dockLeft.classList.toggle('is-collapsed', leftPanelCollapsed);
    if (dockLeftIcon) dockLeftIcon.textContent = leftPanelCollapsed ? '▶' : '◀';
    if (btnToggle) btnToggle.classList.toggle('active', leftPanelCollapsed);
    if (btnIcon) btnIcon.textContent = leftPanelCollapsed ? '▶' : '◀';
  } else if (side === 'right') {
    rightPanelCollapsed = !rightPanelCollapsed;
    document.querySelectorAll('.side-panel.right-panel').forEach(p => {
      p.classList.toggle('collapsed', rightPanelCollapsed);
    });
    const dockRight = document.getElementById('edge-toggle-right');
    const dockRightIcon = document.getElementById('edge-toggle-right-icon');
    const btnToggle = document.getElementById('btn-toggle-right-panel');
    const btnIcon = document.getElementById('btn-toggle-right-icon');

    if (dockRight) dockRight.classList.toggle('is-collapsed', rightPanelCollapsed);
    if (dockRightIcon) dockRightIcon.textContent = rightPanelCollapsed ? '◀' : '▶';
    if (btnToggle) btnToggle.classList.toggle('active', rightPanelCollapsed);
    if (btnIcon) btnIcon.textContent = rightPanelCollapsed ? '◀' : '▶';
  }
}

// Mouse dragging resize functionality
let isResizingSide = null;

function initPanelResize(e, side) {
  e.preventDefault();
  e.stopPropagation();
  isResizingSide = side;
  document.body.classList.add('is-resizing-panel');

  const onPointerMove = (moveEvent) => {
    if (!isResizingSide) return;
    if (isResizingSide === 'left') {
      const newWidth = moveEvent.clientX - 16;
      setPanelWidth('left', newWidth);
    } else if (isResizingSide === 'right') {
      const newWidth = window.innerWidth - moveEvent.clientX - 16;
      setPanelWidth('right', newWidth);
    }
  };

  const onPointerUp = () => {
    isResizingSide = null;
    document.body.classList.remove('is-resizing-panel');
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}

// =========================================================================
// Academic LaTeX Typesetting Engine (KaTeX integration)
// =========================================================================
function renderAcademicMath(targetEl) {
  const el = targetEl || document.body;
  if (typeof renderMathInElement === 'function') {
    try {
      renderMathInElement(el, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false,
        trust: true
      });
    } catch (err) {
      console.warn('KaTeX render note:', err);
    }
  } else {
    // If KaTeX CDN is still downloading, retry periodically
    let retries = 0;
    const poller = setInterval(() => {
      retries++;
      if (typeof renderMathInElement === 'function') {
        clearInterval(poller);
        renderAcademicMath(el);
      } else if (retries >= 30) {
        clearInterval(poller);
      }
    }, 100);
  }
}

// Auto-render on document load and window load
window.addEventListener('DOMContentLoaded', () => {
  renderAcademicMath(document.body);
});
window.addEventListener('load', () => {
  renderAcademicMath(document.body);
  if (typeof refreshExp1UI === 'function') refreshExp1UI();
});

// Expose globally to window
window.toggleSidePanel = toggleSidePanel;
window.adjustPanelWidth = adjustPanelWidth;
window.setPanelWidth = setPanelWidth;
window.initPanelResize = initPanelResize;
window.renderAcademicMath = renderAcademicMath;
