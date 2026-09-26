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

  global.google = global.google || {};
  global.google.script = global.google.script || {};
  global.google.script.run = runner(null, null);
})(typeof window !== 'undefined' ? window : globalThis);
