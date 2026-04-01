/**
 * SFACSTUDIO docs landing — EN default (DOM), KO via this map.
 * Preference: localStorage key sfacstudio-docs-lang
 */
(function () {
  "use strict";

  var STORAGE_KEY = "sfacstudio-docs-lang";

  var KO = {
    nav_aria: "페이지 섹션",
    nav_overview: "개요",
    nav_compare: "렌더링",
    nav_why: "Why",
    nav_dt: "트윈 기능",
    nav_apps: "적용 분야",
    nav_resources: "리소스",
    meta_title: "SFACSTUDIO",
    meta_desc:
      "SFACSTUDIO는 3D 가우시안 스플랫팅 기반 디지털 트윈 에디터입니다. 일반 이미지·영상만으로 공장·설비를 포토리얼 3D로 재구성하고, 설비 배치·동선 시뮬레이션·스플랫 편집·데이터 레이어까지 한 워크플로로 처리합니다. 네이티브 설치 없이.",
    hero_position:
      "디지털 트윈의 새로운 혁명. 일반 이미지·영상으로 공장을 포토리얼 3D로—브라우저에서 생성·시뮬레이션·편집, 데스크톱 체인 없이.",
    hero_desc_a:
      "현장 촬영부터 3D 생성, 에디터 렌더링까지 단 3단계—전문 인력이나 특수 장비 없이.",
    hero_desc_b: "설치 대기 없이 운영과 엔지니어링이 같은 트윈을 공유합니다.",
    hero_byline: "Made by SFACSPACE",
    hero_demo: "앱 열기",
    hero_links_aria: "추가 링크",
    hero_paper: "논문",
    hero_video: "영상",
    video_modal_title: "제품 소개 영상",
    video_modal_close_aria: "영상 닫기",
    overview_title: "개요",
    overview_img_label: "이미지",
    overview_img_aria: "개요 섹션 일러스트 자리",
    overview_p1:
      "스마트폰으로 찍은 영상 하나면 충분합니다. 특수 장비도, 고가의 스캐너도, 전문 소프트웨어도 필요 없습니다. 촬영한 이미지와 영상을 올리면, <strong>SFACSTUDIO</strong>가 현장을 그대로 3D로 복원합니다.",
    overview_p2:
      "<strong>SFACSTUDIO</strong>는 3D Gaussian Splatting 기반의 산업 시설용 디지털 트윈 에디터입니다. 전체 공장 라인부터 단일 설비까지, 공간·설비·객체 단위로 자유롭게 재구성하고 추출할 수 있습니다. 복원된 공간 위에서 바로 편집하고, 배치를 바꾸고, 시뮬레이션까지—모든 작업이 브라우저 한 화면에서 이루어집니다.",
    overview_p3:
      "현장에 나가지 않아도, 설계 도면이 없어도. 찍는 것만으로 디지털 트윈이 시작됩니다.",
    compare_title: "다른 렌더링 기술과의 차이점",
    compare_caption:
      "더 적은 데이터 부담, 더 짧은 제작 시간, 더 낮은 비용, 더 높은 표현력.<br />SFACSTUDIO가 더 현실적인 선택이 되는 이유입니다.",
    compare_th_legacy: "기존",
    compare_th_sfac: "SFACSTUDIO",
    compare_r1_label: "입력 데이터",
    compare_r1_legacy: "3D 모델링 / 전문 장비 스캔",
    compare_r1_sfac: "일반 이미지/영상",
    compare_r2_label: "생성 시간",
    compare_r2_legacy: "수 시간 ~ 수일",
    compare_r2_sfac:
      '10분 이내 <small class="compare-matrix__note">(* 초등학교 교실 규모)</small>',
    compare_r3_label: "제작 비용",
    compare_r3_legacy: "수천만 원 이상",
    compare_r3_sfac: "촬영비 + SW 라이선스",
    compare_r4_label: "표현력",
    compare_r4_legacy: "수작업 한계 / 비현실적",
    compare_r4_sfac: "사실 기반 포토리얼",
    compare_r5_label: "업데이트",
    compare_r5_legacy: "재모델링 필요 (수일)",
    compare_r5_sfac: "재촬영 후 재생성 (1시간 이내)",
    compare_r6_label: "전문성 요구",
    compare_r6_legacy: "3D 전문가 필수",
    compare_r6_sfac: "일반 이미지/영상",
    compare_foot: "보다 효율적인 공정으로, 최상의 비즈니스 가치를 제공합니다.",
    why_title: "Why SFACSTUDIO",
    why_lead: "제품이 필요한 이유와, 접근을 신뢰할 수 있는 이유입니다.",
    card1_label: "CAD·포인트클라우드·파노라마",
    card1_title: "기존 방식의 한계",
    card1_p:
      "수작업 3D 모델링은 현실성이 낮고 비용·시간이 큽니다. 포토그래메트리는 디테일이 낮고 수동 보정이 필수입니다. 파노라믹 영상은 진짜 3D가 아니라 다른 모델과 상호작용이 불가합니다.",
    card2_label: "3DGS·검증된 기술",
    card2_title: "입증된 3DGS 엔진",
    card2_p:
      "SFACSTUDIO는 APIC-IST 2025 국제학술대회 Outstanding Paper Award를 수상한 연구를 기반으로, 전경·배경 분리 학습과 적응적 3D 결합으로 시간적으로 일관된 포토리얼 렌더링을 제공합니다.",
    card3_label: "간단한 워크플로",
    card3_title: "단 3단계로 충분",
    card3_p:
      "현장 촬영 → 3D 생성 → 에디터 렌더링. 전문 인력이나 기술 없이도 즉시 3D 재구성이 가능합니다. 실내·실외부터 개별 설비까지 모든 환경에 폭넓게 적용됩니다.",
    feat_title: "디지털 트윈 기능",
    feat_lead: "공간 재구성·재설계·시뮬레이션·정보 시각화를 묶어 정리했습니다.",
    feat1_t: "공간 재구성",
    feat1_p:
      "공간 전체 재구성, 개별 설비 복원, 개별 객체 추출. 저비용으로 다양한 디지털 트윈 활용 기반을 마련합니다.",
    feat2_t: "공간 재설계",
    feat2_p:
      "기존 설비 제거 후 새로운 오브젝트 배치. 객체 단위 분리·이동·삭제·교체로 설비 변경 시나리오를 실제 현장 기반으로 직관적으로 검토합니다.",
    feat3_t: "시뮬레이션",
    feat3_p: "3D 객체에 경로 기반 이동 애니메이션 적용. AMR·AGV 주행 흐름과 물류 동선을 실제 공간 위에서 시뮬레이션합니다.",
    feat4_t: "정보 시각화",
    feat4_p: "메모 핀 생성·데이터 연결·팝업 정보 표시로 설비 정보와 점검 이력을 공간 기반으로 관리. 위험 구역·이상 영역을 색상으로 강조해 한눈에 식별합니다.",
    feat_preview_aria_1: "공간 재구성 — 이미지 자리",
    feat_preview_aria_2: "공간 재설계 — 이미지 자리",
    feat_preview_aria_3: "시뮬레이션 — 이미지 자리",
    feat_preview_aria_4: "정보 시각화 — 이미지 자리",
    more_title: "더 넓은 적용",
    more_tagline:
      '<span class="more-tagline__accent">다양한 산업 전반에</span><span class="more-tagline__rest"> 폭넓게, 쉽고 빠르게 적용 가능</span>',
    more_hint: "아래에서 산업 분야를 선택해 활용 예를 살펴보세요.",
    tab_aria: "적용 분야",
    tab_app0: "제조업",
    tab_app1: "패션·커머스",
    tab_app2: "광고·브랜디드",
    tab_app3: "영화·VFX",
    tab_app4: "에듀테크",
    panel_app0_l: "제조업",
    panel_app0_p:
      "중장비·생산 라인이 있는 제조 현장에서 포토리얼 3D 트윈으로 배치 검토, 교육, 이해관계자 워크스루를 진행합니다. 풀 CAD 재구축을 기다리지 않아도 됩니다.",
    panel_app1_l: "패션·커머스",
    panel_app1_p:
      "제품·룩북·가상 피팅 장면을 일관된 조명 속에 구성해 이커머스, 시즌 드롭, 캠페인 프리뷰에 활용합니다. 실제 소재감에 가깝게 표현할 수 있습니다.",
    panel_app2_l: "광고·콘텐츠",
    panel_app2_p:
      "브랜디드 가상 세트와 무대형 공간, 체험형 마케팅 환경을 3D에서 빠르게 시안 내고, 비용이 큰 실물 세트·로케이션 촬영 전에 방향을 맞춥니다.",
    panel_app3_l: "영화·VFX",
    panel_app3_p:
      "프리비즈, 세트 익스텐션, 현장 매칭까지—촬영된 로케이션에 디지털 자산을 고정해 감독과 VFX 팀이 같은 공간 기준을 공유합니다.",
    panel_app4_l: "에듀테크",
    panel_app4_p:
      "실험실·교실·실습 현장을 재구성해 원격 안내, 안전 교육, 커리큘럼 시연을 브라우저에서 탐색할 수 있게 합니다.",
    res_title: "리소스",
    res_paper_t: "논문",
    res_paper_d: "준비 중",
    res_github_d: "소스, 이슈, README",
    res_site_t: "홈페이지",
    res_site_d: "제품 홈 · 새 탭에서 열기",
    lang_aria: "언어",
  };

  var ARIA_EN = {
    lang: "Language",
    nav: "Page sections",
    hero_links: "Additional links",
    tablist: "Application areas",
  };

  var defaults = {};

  function captureDefaults() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      if (el.hasAttribute("data-i18n-html")) {
        defaults[key] = el.innerHTML;
      } else {
        defaults[key] = el.textContent;
      }
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (!key) return;
      defaults[key] = el.getAttribute("aria-label") || "";
    });
    var t = document.getElementById("meta-desc");
    if (t) defaults.meta_desc = t.getAttribute("content") || "";
    var titleEl = document.querySelector("title");
    if (titleEl) defaults.meta_title = titleEl.textContent;
  }

  function setMeta(lang) {
    var titleEl = document.querySelector("title");
    var descEl = document.getElementById("meta-desc");
    if (lang === "ko") {
      if (titleEl) titleEl.textContent = KO.meta_title;
      if (descEl) descEl.setAttribute("content", KO.meta_desc);
    } else {
      if (titleEl) titleEl.textContent = defaults.meta_title;
      if (descEl) descEl.setAttribute("content", defaults.meta_desc);
    }
  }

  function applyLang(lang) {
    document.documentElement.lang = lang === "ko" ? "ko" : "en";
    setMeta(lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      var val =
        lang === "ko" && KO[key] != null ? KO[key] : defaults[key];
      if (val == null) return;
      if (el.hasAttribute("data-i18n-html")) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (!key) return;
      var val = lang === "ko" && KO[key] != null ? KO[key] : defaults[key];
      if (val == null || val === "") return;
      el.setAttribute("aria-label", val);
    });

    var langSw = document.querySelector(".lang-switch");
    if (langSw) {
      langSw.setAttribute("aria-label", lang === "ko" ? KO.lang_aria : ARIA_EN.lang);
    }
    var navEl = document.querySelector(".site-nav");
    if (navEl) {
      navEl.setAttribute("aria-label", lang === "ko" ? KO.nav_aria : ARIA_EN.nav);
    }
    var heroLinks = document.querySelector(".hero__cta-secondary");
    if (heroLinks) {
      heroLinks.setAttribute("aria-label", lang === "ko" ? KO.hero_links_aria : ARIA_EN.hero_links);
    }
    var tabList = document.querySelector(".tabs__list[role='tablist']");
    if (tabList) {
      tabList.setAttribute("aria-label", lang === "ko" ? KO.tab_aria : ARIA_EN.tablist);
    }

    document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
      var l = btn.getAttribute("data-lang");
      var on = l === lang;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function init() {
    captureDefaults();
    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}
    var lang = saved === "ko" || saved === "en" ? saved : "en";
    if (lang === "ko") {
      applyLang("ko");
    } else {
      applyLang("en");
    }

    document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var l = btn.getAttribute("data-lang");
        if (l === "ko" || l === "en") applyLang(l);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();