(function () {
  var PLACEHOLDER_KEYWORD = "REPLACE_ME";
  var config = window.APP_CONFIG || { links: {}, refresh: {} };

  var fallbackData = {
    meta: { source: "fallback-inline", refreshedAt: "2026-06-02 09:30", refreshNote: "示例数据" },
    me: { name: "张三（示例）", team: "西南大区", points: 126, rankMonthly: 9, rankYearly: 14, rankDelta: 3 },
    monthlyBoard: [],
    yearlyBoard: [],
    pointDetails: [],
    treasure: { discoveries: [], copyArea: [], pitfalls: [] }
  };

  function isConfigured(url) {
    return typeof url === "string" && url.trim() !== "" && url.indexOf(PLACEHOLDER_KEYWORD) === -1;
  }

  function initNavigation() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".nav-btn"));
    var pages = Array.prototype.slice.call(document.querySelectorAll(".page"));

    function setPage(pageName) {
      pages.forEach(function (page) {
        page.classList.toggle("active", page.id === "page-" + pageName);
      });
      buttons.forEach(function (btn) {
        btn.classList.toggle("active", btn.getAttribute("data-page") === pageName);
      });
      window.location.hash = pageName;
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setPage(btn.getAttribute("data-page"));
      });
    });

    var initialPage = window.location.hash.replace("#", "") || "home";
    var exists = pages.some(function (page) { return page.id === "page-" + initialPage; });
    setPage(exists ? initialPage : "home");
  }

  function setGlobalHint() {
    var hint = document.getElementById("global-config-hint");
    var requiredLinks = ["submissionFormUrl", "leaderboardViewUrl", "adminBaseUrl", "featuredViewUrl"];
    var missing = requiredLinks.filter(function (key) { return !isConfigured(config.links[key]); });
    if (missing.length === 0) {
      hint.classList.add("hidden");
      hint.textContent = "";
      return;
    }
    hint.classList.remove("hidden");
    hint.textContent = "管理员提醒：请先在 config.js 中替换占位飞书链接（" + missing.join(", ") + "）。";
  }

  function setupHomeEntry() {
    var submitLink = document.getElementById("hero-submit-link");
    if (isConfigured(config.links.submissionFormUrl)) {
      submitLink.href = config.links.submissionFormUrl;
    } else {
      submitLink.href = "#submit";
      submitLink.removeAttribute("target");
      submitLink.removeAttribute("rel");
      submitLink.textContent = "先配置提交链接（查看提交页说明）";
    }
  }

  function setupSubmitEntry() {
    var container = document.getElementById("submit-entry");
    container.innerHTML = "";

    if (!isConfigured(config.links.submissionFormUrl)) {
      var warn = document.createElement("div");
      warn.className = "notice warning";
      warn.innerHTML = [
        "<strong>未配置提交表单链接。</strong>",
        "请管理员在 <code>config.js</code> 中替换 <code>submissionFormUrl</code>。",
        "建议使用飞书多维表格表单链接，确保点击即可提交。"
      ].join("<br>");
      container.appendChild(warn);
      return;
    }

    var actionWrap = document.createElement("div");
    actionWrap.className = "card";
    actionWrap.innerHTML = [
      '<p>优先推荐直接跳转飞书表单提交（可在飞书内识别人员并按权限控制）。</p>',
      '<a class="btn primary" target="_blank" rel="noopener" href="' + config.links.submissionFormUrl + '">打开飞书表单提交</a>',
      '<p class="muted">如浏览器允许且链接支持，可尝试下方嵌入展示；若无法加载请使用按钮跳转。</p>',
      '<iframe title="提交表单嵌入" src="' + config.links.submissionFormUrl + '" style="width:100%;height:500px;border:1px solid #e5e7eb;border-radius:8px;"></iframe>'
    ].join("");
    container.appendChild(actionWrap);
  }

  function deltaText(delta) {
    if (!delta) return "—";
    return (delta > 0 ? "+" : "") + delta;
  }

  function deltaClass(delta) {
    if (!delta) return "";
    return delta > 0 ? "up" : "down";
  }

  function renderBoard(containerId, rows) {
    var host = document.getElementById(containerId);
    if (!rows || rows.length === 0) {
      host.innerHTML = "<p class='muted'>暂无样例数据。</p>";
      return;
    }

    var html = "<table><thead><tr><th>排名</th><th>姓名</th><th>团队</th><th>积分</th><th>变化</th></tr></thead><tbody>";
    rows.forEach(function (row) {
      html += "<tr>";
      html += "<td>" + row.rank + "</td>";
      html += "<td>" + row.name + "</td>";
      html += "<td>" + row.team + "</td>";
      html += "<td>" + row.points + "</td>";
      html += "<td class='delta " + deltaClass(row.delta) + "'>" + deltaText(row.delta) + "</td>";
      html += "</tr>";
    });
    html += "</tbody></table>";
    host.innerHTML = html;
  }

  function renderDetails(containerId, rows) {
    var host = document.getElementById(containerId);
    if (!rows || rows.length === 0) {
      host.innerHTML = "<p class='muted'>暂无样例明细。</p>";
      return;
    }

    var html = "<table><thead><tr><th>日期</th><th>类型</th><th>内容</th><th>积分</th><th>状态</th></tr></thead><tbody>";
    rows.forEach(function (row) {
      html += "<tr>";
      html += "<td>" + row.date + "</td>";
      html += "<td>" + row.type + "</td>";
      html += "<td>" + row.title + "</td>";
      html += "<td>" + row.points + "</td>";
      html += "<td>" + row.status + "</td>";
      html += "</tr>";
    });
    html += "</tbody></table>";
    host.innerHTML = html;
  }

  function renderTreasureList(containerId, rows) {
    var host = document.getElementById(containerId);
    if (!rows || rows.length === 0) {
      host.innerHTML = "<p class='muted'>暂无内容。</p>";
      return;
    }

    host.innerHTML = rows
      .map(function (item) {
        return "<div class='mini-item'><strong>" + item.title + "</strong><p>" + item.summary + "</p></div>";
      })
      .join("");
  }

  function renderAdminCards() {
    var host = document.getElementById("admin-cards");
    var cards = [
      { title: "审核提交", desc: "查看并处理待审核案例。", link: config.links.reviewViewUrl },
      { title: "核定积分", desc: "确认积分及排名变化。", link: config.links.scoreAuditViewUrl },
      { title: "管理挑战", desc: "维护每周挑战主题。", link: config.links.challengeViewUrl },
      { title: "精选内容", desc: "维护精选案例和挖宝专区。", link: config.links.featuredViewUrl },
      { title: "榜单快照", desc: "维护每日榜单刷新快照。", link: config.links.snapshotViewUrl },
      { title: "管理后台 Base", desc: "进入飞书多维表格后台。", link: config.links.adminBaseUrl }
    ];

    host.innerHTML = cards
      .map(function (card) {
        var action = isConfigured(card.link)
          ? '<a class="btn secondary" href="' + card.link + '" target="_blank" rel="noopener">打开入口</a>'
          : '<span class="muted">请在 config.js 配置链接</span>';

        return [
          "<article class='card admin-card'>",
          "<h3>" + card.title + "</h3>",
          "<p>" + card.desc + "</p>",
          "<div class='actions'>" + action + "</div>",
          "</article>"
        ].join("");
      })
      .join("");
  }

  function renderPoints(data) {
    var me = data.me || fallbackData.me;
    var refreshedAt = data.meta && data.meta.refreshedAt ? data.meta.refreshedAt : "未提供";
    var refreshDisplay = (config.refresh && config.refresh.displayTime) ? config.refresh.displayTime : "每日定时";
    var leaderboardView = isConfigured(config.links.leaderboardViewUrl)
      ? '<a class="btn secondary" target="_blank" rel="noopener" href="' + config.links.leaderboardViewUrl + '">查看飞书排行榜视图</a>'
      : "<span class='muted'>未配置排行榜视图链接</span>";

    document.getElementById("my-points").innerHTML = [
      "<div><strong>" + me.name + "</strong> · " + me.team + "</div>",
      "<div class='stat-main'>" + me.points + " 分</div>",
      "<div>本月排名：" + me.rankMonthly + " ｜ 年度排名：" + me.rankYearly + "</div>",
      "<div class='delta " + deltaClass(me.rankDelta) + "'>排名变化：" + deltaText(me.rankDelta) + "</div>"
    ].join("");

    document.getElementById("refresh-time").innerHTML = [
      "样例数据刷新时间：<strong>" + refreshedAt + "</strong>",
      "<br>页面展示刷新节奏：<strong>" + refreshDisplay + "</strong>",
      "<br>" + leaderboardView
    ].join("");

    renderBoard("monthly-board", data.monthlyBoard || []);
    renderBoard("yearly-board", data.yearlyBoard || []);
    renderDetails("points-details", data.pointDetails || []);
    renderTreasureList("discover-feed", data.treasure && data.treasure.discoveries);
    renderTreasureList("copy-feed", data.treasure && data.treasure.copyArea);
    renderTreasureList("pitfall-feed", data.treasure && data.treasure.pitfalls);
  }

  function start() {
    initNavigation();
    setGlobalHint();
    setupHomeEntry();
    setupSubmitEntry();
    renderAdminCards();

    fetch("data/points.sample.json")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load local JSON");
        }
        return response.json();
      })
      .then(function (data) {
        renderPoints(data);
      })
      .catch(function () {
        renderPoints(fallbackData);
      });
  }

  start();
})();
