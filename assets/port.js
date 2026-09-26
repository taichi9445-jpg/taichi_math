/* ===========================================================================
   port.js  —  先生の GAS 版を移植した教材で共通に使う「つなぎ」
   ---------------------------------------------------------------------------
   GAS では、問題データを作る処理がサーバー側（コード.gs）にあり、画面側からは
     google.script.run.withSuccessHandler(受け取る関数).getQuizData()
   のように呼んでいた。この書き方のまま動くように、同じ名前の仕組みを用意する。

   サーバー側のコードは、各教材のページで
     window.__GAS = (function () { …コード.gs の中身… ; return { getQuizData: getQuizData }; })();
   のように囲んで置く。囲むのは、画面側の関数（shuffle など）と名前がぶつからないようにするため。
   ========================================================================= */
(function (global) {
  'use strict';

  function runner(onOk, onNg) {
    return new Proxy({}, {
      get: function (_, name) {
        if (name === 'withSuccessHandler') return function (f) { return runner(f, onNg); };
        if (name === 'withFailureHandler') return function (f) { return runner(onOk, f); };
        if (name === 'withUserObject') return function () { return runner(onOk, onNg); };
        return function () {
          var args = arguments;
          // GAS と同じく「少し後で」結果を返す（画面の描画を止めない）
          setTimeout(function () {
            try {
              var server = global.__GAS || {};
              var fn = server[name];
              if (typeof fn !== 'function') throw new Error('サーバー側の関数が見つかりません: ' + name);
              var result = fn.apply(null, args);
              // GAS はサーバーから受け取るときにデータを複製する。同じ動きにしておく。
              if (result !== undefined) result = JSON.parse(JSON.stringify(result));
              if (onOk) onOk(result);
            } catch (e) {
              if (onNg) onNg(e);
              else if (global.console) console.error(e);
            }
          }, 0);
        };
      }
    });
  }

  /* ------------------------------------------------------------------
     キャンバ版から移した教材用：elementSdk / dataSdk の代わり
     ------------------------------------------------------------------
     キャンバでは、タイトルなどの文字をキャンバの編集画面から変えられるように
     window.elementSdk が用意されていた。ここでは「最初の設定（defaultConfig）」で
     1 回だけ画面を整える。
     window.dataSdk は、ゲームの進み具合などをキャンバ側に保存する仕組みだった。
     ここでは同じ使い方のまま、その端末（ブラウザ）の中に保存する。                 */
  if (!global.elementSdk) {
    var esdk = {
      config: {},
      init: function (o) {
        o = o || {};
        esdk._o = o;
        esdk.config = Object.assign({}, o.defaultConfig || {});
        if (typeof o.onConfigChange === 'function') {
          setTimeout(function () {
            try {
              var r = o.onConfigChange(esdk.config);
              if (r && r.catch) r.catch(function (e) { if (global.console) console.error(e); });
            } catch (e) { if (global.console) console.error(e); }
          }, 0);
        }
      },
      setConfig: function (c) {
        esdk.config = Object.assign({}, esdk.config, c || {});
        if (esdk._o && typeof esdk._o.onConfigChange === 'function') {
          try { esdk._o.onConfigChange(esdk.config); } catch (e) { if (global.console) console.error(e); }
        }
      }
    };
    global.elementSdk = esdk;
  }
  if (!global.dataSdk) {
    var KEY = 'port-data:' + (global.location ? global.location.pathname : '');
    var load = function () { try { return JSON.parse(global.localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
    var save = function (a) { try { global.localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { } };
    var rows = load(), handler = null;
    var notify = function () { if (handler) { try { handler(rows.map(function (r) { return Object.assign({}, r); })); } catch (e) { if (global.console) console.error(e); } } };
    global.dataSdk = {
      init: function (o) { handler = o && o.onDataChanged; notify(); return Promise.resolve({ isOk: true }); },
      create: function (r) {
        var row = Object.assign({ __backendId: 'r' + Date.now() + Math.random().toString(36).slice(2, 6) }, r);
        rows.push(row); save(rows); notify();
        return Promise.resolve({ isOk: true, data: row });
      },
      update: function (r) {
        var i = rows.findIndex(function (x) { return r && x.__backendId === r.__backendId; });
        if (i < 0 && rows.length && r && !r.__backendId) i = 0;
        if (i < 0) return Promise.resolve({ isOk: false });
        rows[i] = Object.assign({}, rows[i], r); save(rows); notify();
        return Promise.resolve({ isOk: true });
      },
      delete: function (r) {
        rows = rows.filter(function (x) { return !(r && x.__backendId === r.__backendId); });
        save(rows); notify();
        return Promise.resolve({ isOk: true });
      }
    };
  }

  global.google = global.google || {};
  global.google.script = global.google.script || {};
  global.google.script.run = runner(null, null);

  /* ------------------------------------------------------------------
     数式表示（MathJax）が読み込めなかったときの予備
     ------------------------------------------------------------------
     学校の回線などで MathJax を読み込めないと、\frac{1}{2} や \sqrt{3} のような記号が
     そのまま画面に出てしまう。決めた時間までに読み込めなかったら、代わりの MathJax を置いて、
     記号を (1)/(2)、√3 のような読める形に直す。教材側の MathJax.typesetPromise(...) の
     呼び出しは、そのまま代わりのほうに届く。                                          */
  function texToPlain(s) {
    var t = String(s);
    for (var i = 0; i < 6; i++) {
      t = t.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '($1)/($2)')
           .replace(/\\sqrt\s*\{([^{}]*)\}/g, function (m, a) { return a.length > 1 ? '√(' + a + ')' : '√' + a; })
           .replace(/\\text\s*\{([^{}]*)\}/g, '$1');
    }
    return t
      .replace(/\\pm/g, '±').replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\cdot/g, '·')
      .replace(/\\left|\\right/g, '').replace(/\\sqrt\s*(\d+)/g, '√$1')
      .replace(/\^\{?2\}?/g, '²').replace(/\^\{?3\}?/g, '³')
      .replace(/\\\(|\\\)|\\\[|\\\]|\$\$|\$/g, '')
      .replace(/\\,|\\;|\\ /g, ' ')
      .replace(/\\/g, '');
  }

  function plainMath(root) {
    if (!root || !root.ownerDocument) return;
    var walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      if (/\\|\$\$|\^/.test(n.nodeValue)) n.nodeValue = texToPlain(n.nodeValue);
    });
  }

  global.PortMath = {
    texToPlain: texToPlain,
    plainMath: plainMath,
    /** ms ミリ秒たっても MathJax が使えなければ、代わりを置いて画面の記号を直す */
    fallbackAfter: function (ms) {
      setTimeout(function () {
        if (global.MathJax && global.MathJax.typesetPromise) return;
        global.MathJax = {
          typesetPromise: function (els) {
            (els && els.length ? els : [document.body]).forEach(plainMath);
            return Promise.resolve();
          },
          typesetClear: function () {}
        };
        plainMath(document.body);
      }, ms || 6000);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
