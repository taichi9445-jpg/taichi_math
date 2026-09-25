/* ===========================================================================
   steps.js  —  「解答の途中式を穴埋めしていく」タイプの共通エンジン
   ---------------------------------------------------------------------------
   相互関係の計算・面積・正弦定理・因数分解のステップ学習など、
   答えを 1 つ出すのではなく「解き方の流れを順に埋めていく」教材で使う。

   元教材はドラッグ＆ドロップだったが、
     ・スマホだと指でうまくつかめず、途中で操作不能になる
     ・つかんだまま画面外に出すと選択肢が消える
   という不具合が出ていたので、ここでは「空欄をタップ → 候補をタップ」方式にした。
   誤操作しても必ず元に戻せる。

   使い方：
     Steps.start({
       title: '三角比の相互関係',
       problems: [{
         name: '問題1',
         given: '0° < A < 90°、cos A = 2/3',
         target: 'sin A と tan A',
         lines: [
           ['【相互関係】', {a:'sin²A'}, ' + ', {a:'cos²A'}, ' = ', {a:'1'}, ' より'],
           ['sin²A = ', {a:'5/9'}]
         ],
         extras: ['cos²A', '2/3'],     // ダミーの候補（省略可）
         summary: 'sin A = √5/3、tan A = √5/2'
       }]
     });
   ========================================================================= */
(function (global) {
  'use strict';

  var M = global.MathCore;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined && html !== null) n.innerHTML = html;
    return n;
  }

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /** 候補の文字列としての一致（全角・空白・記号ゆれを吸収したうえで比べる） */
  function sameText(a, b) {
    var f = function (s) {
      return String(s)
        .replace(/[！-～]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
        .replace(/[−–—－]/g, '-')
        .replace(/[×✕・]/g, '×')
        .replace(/\s|　/g, '')
        .toLowerCase();
    };
    return f(a) === f(b);
  }

  function Steps(cfg) {
    this.cfg = cfg;
    this.root = document.getElementById('app');
    this.index = 0;
    this.cleared = 0;
  }

  Steps.prototype.mount = function () {
    var self = this;
    document.title = this.cfg.title + ' | 数学Ⅰ デジタル教材';

    var head = el('div', 'app-head');
    head.appendChild(el('h1', null, esc(this.cfg.title)));
    var home = el('a', 'home', '一覧へ');
    home.href = '../index.html';
    head.appendChild(home);

    this.root.innerHTML = '';
    this.root.appendChild(head);
    if (this.cfg.subtitle) this.root.appendChild(el('p', 'sub', esc(this.cfg.subtitle)));

    this.screen = el('div');
    this.root.appendChild(this.screen);

    window.addEventListener('error', function () { self.crash(); });

    this.showSelect();
  };

  Steps.prototype.crash = function () {
    if (this.crashed) return;
    this.crashed = true;
    this.screen.innerHTML =
      '<div class="card"><div class="verdict ng"><div class="head">問題が起きました</div>' +
      '<div class="why">画面を読み込み直すと直ります。</div></div></div>';
  };

  /* ---------- 問題えらび ---------- */

  Steps.prototype.showSelect = function () {
    var self = this;
    this.screen.innerHTML = '';
    var card = el('div', 'card');
    card.appendChild(el('p', 'q-label', '問題をえらぼう'));
    var list = el('div', 'modes');
    this.cfg.problems.forEach(function (p, i) {
      var b = el('button', 'mode');
      b.type = 'button';
      b.innerHTML = '<span class="name">' + esc(p.name || ('問題' + (i + 1))) + '</span>' +
        '<span class="desc">' + esc(p.given || '') + '</span>';
      b.onclick = function () { self.index = i; self.showProblem(); };
      list.appendChild(b);
    });
    card.appendChild(list);
    this.screen.appendChild(card);
  };

  /* ---------- 出題 ---------- */

  Steps.prototype.showProblem = function () {
    var self = this;
    var p = this.cfg.problems[this.index];
    this.screen.innerHTML = '';

    var status = el('div', 'status');
    status.innerHTML = '<span>' + esc(p.name || ('問題' + (this.index + 1))) + '</span>' +
      '<span>' + (this.index + 1) + ' / ' + this.cfg.problems.length + '</span>';
    this.screen.appendChild(status);

    var card = el('div', 'card');

    // 問題文が日本語の長い文のときは、数式用の大きな書体だと読みにくいので
    // ふつうの本文として出す。短い式のときだけ数式として大きく見せる。
    if (p.given) {
      var isSentence = p.given.length > 24 && /[ぁ-んァ-ヶ一-龠]/.test(p.given);
      card.appendChild(isSentence
        ? el('p', 'q-text', p.given)
        : el('div', 'math plain', p.given));
    }
    if (p.target) card.appendChild(el('p', 'q-text', '<b>' + p.target + '</b> を求めなさい。'));
    if (p.figure) {
      var f = el('div', 'figure');
      f.innerHTML = p.figure;
      card.appendChild(f);
    }

    // --- 途中式を組み立てる ---
    var work = el('div', 'work');
    this.blanks = [];
    var answers = [];

    // トークンを 1 つ描く。文字列・空欄・分数（中に空欄を置ける）に対応する。
    function renderToken(token, into) {
      if (typeof token === 'string') {
        var s = el('span', 'work-text');
        s.innerHTML = token;
        into.appendChild(s);
        return;
      }
      if (token.frac) {
        var f = el('span', 'frac');
        var num = el('span', 'num');
        var den = el('span', 'den');
        token.frac[0].forEach(function (t) { renderToken(t, num); });
        token.frac[1].forEach(function (t) { renderToken(t, den); });
        f.appendChild(num);
        f.appendChild(den);
        into.appendChild(f);
        return;
      }
      var b = el('input', 'blank');
      b.type = 'text';
      b.readOnly = true;
      b.dataset.answer = token.a;
      b.dataset.kind = token.kind || 'text';
      b.onclick = function () { self.focusSlot(b); };
      into.appendChild(b);
      self.blanks.push(b);
      // 「8|6」形式はどちらも候補に並べる
      String(token.a).split('|').forEach(function (x) { answers.push(x); });
    }

    p.lines.forEach(function (line) {
      var row = el('div', 'work-line');
      if (!line || !line.length) {
        row.innerHTML = '&nbsp;';
        work.appendChild(row);
        return;
      }
      line.forEach(function (token) { renderToken(token, row); });
      work.appendChild(row);
    });
    card.appendChild(work);

    // --- 候補（バンク） ---
    var bankItems = answers.slice();
    (p.extras || []).forEach(function (x) { bankItems.push(x); });
    // 同じ文字列は 1 つにまとめる（同じ答えを 2 か所で使うときは何度でも置ける）
    var seen = {}, uniq = [];
    bankItems.forEach(function (x) {
      var k = String(x);
      if (seen[k]) return;
      seen[k] = true;
      uniq.push(x);
    });

    card.appendChild(el('p', 'q-label', '空欄をタップして、下から選ぼう（同じものを何回使ってもOK）'));
    var bank = el('div', 'choices');
    shuffle(uniq).forEach(function (x) {
      var b = el('button', 'choice', x);
      b.type = 'button';
      b.onclick = function () { self.place(x); };
      bank.appendChild(b);
    });
    card.appendChild(bank);
    this.bank = bank;

    this.focusSlot(this.blanks[0]);

    // --- ボタン ---
    var row = el('div', 'btn-row');
    var check = el('button', 'btn', '答え合わせ');
    check.type = 'button';
    check.onclick = function () { self.check(check); };
    row.appendChild(check);

    var clear = el('button', 'btn ghost', 'ぜんぶ消す');
    clear.type = 'button';
    clear.onclick = function () {
      self.blanks.forEach(function (b) {
        b.value = '';
        b.classList.remove('is-correct', 'is-wrong');
      });
      self.focusSlot(self.blanks[0]);
      self.feedback.innerHTML = '';
    };
    row.appendChild(clear);
    card.appendChild(row);

    this.feedback = el('div');
    card.appendChild(this.feedback);

    this.screen.appendChild(card);
  };

  Steps.prototype.focusSlot = function (slot) {
    this.blanks.forEach(function (b) { b.classList.remove('is-active'); });
    if (slot) { slot.classList.add('is-active'); this.active = slot; }
    else this.active = null;
  };

  Steps.prototype.place = function (value) {
    var slot = this.active;
    if (!slot) {
      for (var i = 0; i < this.blanks.length; i++) {
        if (!this.blanks[i].value) { slot = this.blanks[i]; break; }
      }
    }
    if (!slot) return;
    slot.value = String(value).replace(/<[^>]*>/g, '');
    slot.classList.remove('is-correct', 'is-wrong');
    var next = null;
    for (var j = 0; j < this.blanks.length; j++) {
      if (!this.blanks[j].value) { next = this.blanks[j]; break; }
    }
    this.focusSlot(next);
  };

  Steps.prototype.check = function (btn) {
    var self = this;
    var p = this.cfg.problems[this.index];

    var empty = this.blanks.some(function (b) { return !b.value; });
    if (empty) {
      this.feedback.innerHTML =
        '<div class="verdict"><div class="why">まだ空いているところがあります。全部うめてから答え合わせしよう。</div></div>';
      return;
    }

    var wrong = 0;
    this.blanks.forEach(function (b) {
      var expected = b.dataset.answer;
      // 「8|6」のように | で区切ってあるときは、どちらでも正解にする。
      // （面積の公式の 2 辺のように、入れる順番が決まっていない場所で使う）
      var allowed = String(expected).split('|');
      var ok = allowed.some(function (exp) {
        if (b.dataset.kind === 'math') {
          return M.isEqual(b.value, exp) || sameText(b.value, exp);
        }
        return sameText(b.value, exp);
      });
      b.classList.remove('is-correct', 'is-wrong');
      b.classList.add(ok ? 'is-correct' : 'is-wrong');
      if (!ok) wrong++;
    });

    var v = el('div', 'verdict ' + (wrong === 0 ? 'ok' : 'ng'));
    if (wrong === 0) {
      v.innerHTML = '<div class="head">全部正解！</div>' +
        (p.summary ? '<div class="why">' + p.summary + '</div>' : '');
      this.cleared++;
    } else {
      v.innerHTML = '<div class="head">' + wrong + 'か所ちがいます</div>' +
        '<div class="why">赤くなっているところを直して、もう一度「答え合わせ」を押してみよう。' +
        (p.hint ? '<br>' + p.hint : '') + '</div>';
    }
    this.feedback.innerHTML = '';
    this.feedback.appendChild(v);

    if (wrong === 0) {
      var row = el('div', 'btn-row');
      var isLast = this.index >= this.cfg.problems.length - 1;
      if (!isLast) {
        var next = el('button', 'btn', '次の問題へ');
        next.type = 'button';
        next.onclick = function () { self.index++; self.showProblem(); window.scrollTo(0, 0); };
        row.appendChild(next);
      }
      var back = el('button', 'btn ghost', '問題を選び直す');
      back.type = 'button';
      back.onclick = function () { self.showSelect(); window.scrollTo(0, 0); };
      row.appendChild(back);
      var home = el('a', 'btn ghost', '教材一覧へ');
      home.href = '../index.html';
      row.appendChild(home);
      this.feedback.appendChild(row);
    } else {
      // まちがえても操作は続けられる。ボタンは無効化しない。
      var again = el('div', 'btn-row');
      var reveal = el('button', 'btn ghost small', '答えを見る');
      reveal.type = 'button';
      reveal.onclick = function () {
        self.blanks.forEach(function (b) {
          b.value = String(b.dataset.answer).split('|')[0].replace(/<[^>]*>/g, '');
          b.classList.remove('is-wrong');
          b.classList.add('is-correct');
        });
        self.feedback.innerHTML =
          '<div class="verdict ok"><div class="head">これが正しい流れです</div>' +
          (p.summary ? '<div class="why">' + p.summary + '</div>' : '') + '</div>';
      };
      again.appendChild(reveal);
      this.feedback.appendChild(again);
    }
  };

  global.Steps = {
    start: function (cfg) {
      var s = new Steps(cfg);
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { s.mount(); });
      } else { s.mount(); }
      return s;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
