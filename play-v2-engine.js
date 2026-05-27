document.addEventListener("DOMContentLoaded", function () {
  const root = document.querySelector('[data-generative-layout="true"]');
  if (!root) return;

  const sourceCards = Array.from(root.querySelectorAll(".collection-item-index-cards"));

  const CONFIG = {
    columns: 12,
    gap: 32,
    topPadding: 64,
    bottomPadding: 120,
    minYGap: 32,
    rowStep: 360,

    sizeToSpan: {
      xsmall: 2,
      small: 3,
      medium: 4,
      large: 6
    },

    yBands: ["high", "mid", "low"],

    bandOffset: {
      high: 0,
      mid: 120,
      low: 260
    }
  };

  function hashString(str) {
    let hash = 2166136261;

    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash +=
        (hash << 1) +
        (hash << 4) +
        (hash << 7) +
        (hash << 8) +
        (hash << 24);
    }

    return hash >>> 0;
  }

  function seededRandom(seed) {
    let value = seed >>> 0;

    return function () {
      value += 0x6d2b79f5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(arr, rand) {
    return arr[Math.floor(rand() * arr.length)];
  }

  function getCardDataSize(card) {
    const directSize = card.getAttribute("data-size");
    if (directSize) return directSize.toLowerCase();

    const nestedSizeEl = card.querySelector("[data-size]");
    if (nestedSizeEl) return nestedSizeEl.getAttribute("data-size").toLowerCase();

    return "xsmall";
  }

  function getAllowedRatios(size) {
    if (size === "large") return ["landscape"];
    if (size === "medium") return ["landscape", "square", "portrait"];
    return ["portrait", "square", "landscape"];
  }

  function chooseRatio(size, history, rand) {
    const normalizedSize = String(size || "").toLowerCase().trim();
    let candidates = getAllowedRatios(normalizedSize).slice();

    const last = history[history.length - 1];
    const secondLast = history[history.length - 2];

    if (last && secondLast && last === secondLast) {
      candidates = candidates.filter(function (ratio) {
        return ratio !== last;
      });
    }

    if (!candidates.length) {
      candidates = getAllowedRatios(normalizedSize).slice();
    }

    return pick(candidates, rand);
  }

  function chooseYBand(history, index, rand) {
    let candidates = CONFIG.yBands.slice();

    const last = history[history.length - 1];
    const secondLast = history[history.length - 2];

    if (last && secondLast && last === secondLast) {
      candidates = candidates.filter(function (band) {
        return band !== last;
      });
    }

    if (index < 3) {
      candidates = candidates.filter(function (band) {
        return !history.includes(band);
      });

      if (!candidates.length) candidates = CONFIG.yBands.slice();
    }

    const recent = history.slice(-4);

    if (recent.length >= 3) {
      const hasHigh = recent.includes("high");
      const hasLow = recent.includes("low");

      if (!hasHigh && candidates.includes("high")) return "high";
      if (!hasLow && candidates.includes("low")) return "low";
    }

    return pick(candidates, rand);
  }

  function getCardSize(width, ratio) {
    if (ratio === "landscape") {
      return {
        width: width,
        height: width * (2 / 3)
      };
    }

    return {
      width: width,
      height: width
    };
  }

  function overlaps(a, b) {
    const buffer = CONFIG.minYGap;

    const horizontalOverlap = !(
      a.x + a.width <= b.x ||
      a.x >= b.x + b.width
    );

    const verticalOverlap = !(
      a.y + a.height + buffer <= b.y ||
      a.y >= b.y + b.height + buffer
    );

    return horizontalOverlap && verticalOverlap;
  }

  function setupPlayHover(card) {
  if (typeof gsap === "undefined") return;

  const media = card.querySelector(".card-media");
  if (!media) return;

  const title =
    media.querySelector(".play-hover-title") ||
    card.querySelector(".play-hover-title");

  let overlay = media.querySelector(".play-hover-overlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "play-hover-overlay";
    media.appendChild(overlay);
  }

    const cta = media.querySelector(".play-hover-cta");

if (cta) {
  gsap.set(cta, {
    opacity: 0.4
  });
}
    
  const lineNodes = [];

  if (title) {
    const sourceLines = title.querySelectorAll(
      ".play-title-hover-text, .data-play-hover-line, [data-play-hover-line]"
    );

    const lines = sourceLines.length
      ? Array.from(sourceLines)
      : [title];

    lines.forEach(function (line) {

      if (line.querySelector(".play-title-line-inner")) {
        lineNodes.push(
          line.querySelector(".play-title-line-inner")
        );
        return;
      }

      const clip = document.createElement("span");
      clip.className = "play-title-line-clip";

      const inner = document.createElement("span");
      inner.className = "play-title-line-inner";

      inner.textContent = line.textContent;

      clip.appendChild(inner);

      line.textContent = "";
      line.appendChild(clip);

      lineNodes.push(inner);
    });
  }

  gsap.set(overlay, {
    opacity: 0
  });

  gsap.set(lineNodes, {
    y: "115%"
  });

  function onEnter() {

    gsap.killTweensOf(
  [overlay, cta].concat(lineNodes)
);

    if (cta) {
  gsap.to(cta, {
    opacity: 1,
    duration: 0.2,
    ease: "power2.out"
  });
}
    
    gsap.to(overlay, {
      opacity: 1,
      duration: 0.22,
      ease: "power2.out"
    });

    gsap.to(lineNodes, {
      y: "0%",
      duration: 0.25,
      ease: "power2.out",
      stagger: 0.045
    });
  }

  function onLeave() {

    gsap.killTweensOf(
  [overlay, cta].concat(lineNodes)
);

    if (cta) {
  gsap.to(cta, {
    opacity: 0.4,
    duration: 0.18,
    ease: "power2.out"
  });
}

    gsap.to(lineNodes, {
      y: "115%",
      duration: 0.18,
      ease: "power2.in",
      stagger: {
        each: 0.035,
        from: "end"
      }
    });

    gsap.to(overlay, {
      opacity: 0,
      duration: 0.22,
      ease: "power2.out",
      delay: 0.04
    });
  }

  card.addEventListener("mouseenter", onEnter);
  card.addEventListener("mouseleave", onLeave);

  card.addEventListener("focusin", onEnter);
  card.addEventListener("focusout", onLeave);
}

  function initPlayHover() {
    root.querySelectorAll(".play-card").forEach(function (card) {
      setupPlayHover(card);
    });
  }

  function render() {
    const seedSource = sourceCards
      .map(function (card) {
        return (card.textContent || "").trim() + "-" + getCardDataSize(card);
      })
      .join("|");

    const rand = seededRandom(hashString(seedSource));

    root.innerHTML = "";
    root.classList.add("play-generative");

    const fieldWidth = root.clientWidth;
    const colWidth =
      (fieldWidth - CONFIG.gap * (CONFIG.columns - 1)) / CONFIG.columns;

    const placed = [];
    const arHistory = [];
    const yHistory = [];

    let colCursor = 1;
    let rowIndex = 0;
    let maxY = 0;

    sourceCards.forEach(function (sourceCard, index) {
      const size = getCardDataSize(sourceCard);
      const span = CONFIG.sizeToSpan[size] || 2;

      if (colCursor + span - 1 > CONFIG.columns) {
        colCursor = 1;
        rowIndex++;
      }

      const ratio = chooseRatio(size, arHistory, rand);
      const yBand = chooseYBand(yHistory, index, rand);

      const width = colWidth * span + CONFIG.gap * (span - 1);
      const cardSize = getCardSize(width, ratio);

      const maxColStart = CONFIG.columns - span + 1;

      let candidate = null;
      let chosenCol = colCursor;
      let chosenRow = rowIndex;

      function makeCandidate(col, row, yNudge) {
        const x = (col - 1) * (colWidth + CONFIG.gap);
        const baseY = CONFIG.topPadding + row * CONFIG.rowStep;
        const y = baseY + CONFIG.bandOffset[yBand] + yNudge;

        return {
          x: x,
          y: y,
          width: cardSize.width,
          height: cardSize.height
        };
      }

      for (let col = colCursor; col <= maxColStart; col++) {
        const test = makeCandidate(col, rowIndex, 0);

        const hasConflict = placed.some(function (item) {
          return overlaps(test, item);
        });

        if (!hasConflict) {
          candidate = test;
          chosenCol = col;
          chosenRow = rowIndex;
          break;
        }
      }

      if (!candidate) {
        chosenRow = rowIndex + 1;

        for (let col = 1; col <= maxColStart; col++) {
          const test = makeCandidate(col, chosenRow, 0);

          const hasConflict = placed.some(function (item) {
            return overlaps(test, item);
          });

          if (!hasConflict) {
            candidate = test;
            chosenCol = col;
            break;
          }
        }
      }

      if (!candidate) {
        chosenRow = rowIndex + 1;
        chosenCol = 1;
        candidate = makeCandidate(chosenCol, chosenRow, 0);
      }

      const card = sourceCard.cloneNode(true);
      const dateEl = card.querySelector(".date");

if (dateEl) {
  const raw = dateEl.textContent.trim();

  const parsed = new Date(raw);

  if (!isNaN(parsed)) {
    const month = parsed.toLocaleString("en-US", {
      month: "short"
    }).toUpperCase();

    const day = parsed.getDate();

    const year = String(parsed.getFullYear()).slice(-2);

    dateEl.textContent = `${month} ${day}-${year}`;
  }
}
      card.classList.add("play-card");
      card.style.display = "block";

      card.style.left = candidate.x + "px";
      card.style.top = candidate.y + "px";
      card.style.width = candidate.width + "px";
      card.style.height = candidate.height + "px";

      card.classList.toggle("is-portrait", ratio === "portrait");
      card.setAttribute("data-ratio", ratio);
      card.setAttribute("data-span", span);
      card.setAttribute("data-y-band", yBand);

      root.appendChild(card);

      placed.push(candidate);
      arHistory.push(ratio);
      yHistory.push(yBand);

      maxY = Math.max(maxY, candidate.y + candidate.height);

      rowIndex = chosenRow;
      colCursor = chosenCol + span;

      if (colCursor > CONFIG.columns) {
        colCursor = 1;
        rowIndex++;
      }
    });

    root.style.height = maxY + CONFIG.bottomPadding + "px";

    initPlayHover();
  }

  render();

  window.addEventListener("resize", function () {
    render();
  });
});
