/* ===========================================================================
   quiz.js  —  全教材で共通の出題エンジン
   ---------------------------------------------------------------------------
   各教材のファイルは「問題データを作る関数」だけを書けば済むようにしてある。
   画面遷移・採点・スコア・やり直し・エラー処理はすべてここが受け持つので、
   教材ごとに実装がバラバラでバグる、という事態が起きない。

   使い方：
     Quiz.start({
       title: '展開マスター',
       modes: [{ id:'lv1', name:'レベル1', desc:'基本の公式' }],
       build: function (modeId) { return [ 問題オブジェクト, ... ]; }
     });

   問題オブジェクト：
     {
       text:    '次の式を展開しなさい',            // 問題文
       math:    'x²+3x+2',                        // 大きく出す式（省略可）
       figure:  '<svg>…</svg>',                   // 図（省略可）
       type:    'choice' | 'input' | 'blanks' | 'pick',
       choices: ['①','②','③','④'],   // choice / pick で使う
       correct: 0,                                 // choice の正解番号
       answer:  '2x+3',                            // input の正答
       answers: ['2','3'],                         // blanks / pick の正答（順番通り）
       template:'x = _ , _',                       // blanks / pick の枠（_ が空欄）
       check:   function (user) { return true; },  // 独自採点（省略可）
       hint:    'ヒント本文',
       explain: '解説本文'
     }
   ========================================================================= */
(function (global) {
  'use strict';

  var M = global.MathCore;

  /* ---------- 小道具 ---------- */

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

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function randInt(min, max) {           // min 以上 max 以下
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /** 重複しない値を n 個作る。作れなければ諦めて返す（無限ループ防止）。 */
  function uniqueSample(n, gen, keyOf, seed) {
    var seen = {}, out = [];
    if (seed !== undefined) { seen[keyOf(seed)] = true; }
    var guard = 0;
    while (out.length < n && guard++ < n * 200) {
      var v = gen();
      var k = keyOf(v);
      if (seen[k]) continue;
      seen[k] = true;
      out.push(v);
    }
    return out;
  }

  /* ---------- 本体 ---------- */

  function Quiz(cfg) {
    this.cfg = cfg;
    this.root = document.getElementById('app');
    if (!this.root) {
      this.root = el('div');
      this.root.id = 'app';
      document.body.appendChild(this.root);
    }
    this.state = null;
  }

  Quiz.prototype.mount = function () {
    var self = this;
    document.title = this.cfg.title + ' | 数学Ⅰ デジタル教材';

    var head = el('div', 'app-head');
    head.appendChild(el('h1', null, esc(this.cfg.title)));
    var home = el('a', 'home', '一覧へ');
    home.href = '../remake.html';
    head.appendChild(home);

    this.root.innerHTML = '';
    this.root.appendChild(head);

    this.screen = el('div');
    this.root.appendChild(this.screen);

    // 想定外のエラーで画面が固まるのを防ぐ最後の砦。
    // 旧教材の「途中で動かなくなる」はここが無かったのが原因。
    window.addEventListener('error', function (e) {
      self.crash(e && e.message);
    });

    this.showModes();
  };

  Quiz.prototype.crash = function (msg) {
    if (this.crashed) return;
    this.crashed = true;
    var box = el('div', 'card');
    box.innerHTML =
      '<div class="verdict ng"><div class="head">問題が起きました</div>' +
      '<div class="why">画面を読み込み直すと直ります。' +
      (msg ? '<br><small class="muted">' + esc(msg) + '</small>' : '') +
      '</div></div>';
    var b = el('button', 'btn wide', 'もう一度はじめから');
    b.onclick = function () { location.reload(); };
    box.appendChild(el('div', 'btn-row')).appendChild(b);
    this.screen.innerHTML = '';
    this.screen.appendChild(box);
  };

  /* ---------- 画面1：モード選択 ---------- */

  Quiz.prototype.showModes = function () {
    var self = this;
    this.screen.innerHTML = '';
    this.crashed = false;

    if (this.cfg.subtitle) {
      this.screen.appendChild(el('p', 'sub', esc(this.cfg.subtitle)));
    }

    var modes = this.cfg.modes || [{ id: 'default', name: 'はじめる' }];

    // モードが 1 つだけなら選択画面を出さずにすぐ始める
    if (modes.length === 1 && this.cfg.skipModeScreen) {
      this.startMode(modes[0]);
      return;
    }

    function makeButton(m) {
      var b = el('button', 'mode');
      b.type = 'button';
      b.innerHTML = '<span class="name">' + esc(m.name) + '</span>' +
        (m.desc ? '<span class="desc">' + esc(m.desc) + '</span>' : '');
      b.onclick = function () { self.startMode(m); };
      return b;
    }

    // group 指定があれば見出しで区切って並べる（モードが多い教材向け）
    var grouped = modes.some(function (m) { return !!m.group; });

    if (!grouped) {
      var card = el('div', 'card');
      card.appendChild(el('p', 'q-label', 'モードをえらぼう'));
      var list = el('div', 'modes');
      modes.forEach(function (m) { list.appendChild(makeButton(m)); });
      card.appendChild(list);
      this.screen.appendChild(card);
      return;
    }

    var order = [];
    var byGroup = {};
    modes.forEach(function (m) {
      var g = m.group || 'その他';
      if (!byGroup[g]) { byGroup[g] = []; order.push(g); }
      byGroup[g].push(m);
    });
    order.forEach(function (g) {
      var c = el('div', 'card');
      c.appendChild(el('p', 'q-label', esc(g)));
      var l = el('div', 'modes');
      byGroup[g].forEach(function (m) { l.appendChild(makeButton(m)); });
      c.appendChild(l);
      self.screen.appendChild(c);
    });
  };

  /* ---------- 出題の準備 ---------- */

  Quiz.prototype.startMode = function (mode) {
    var questions;
    try {
      questions = this.cfg.build(mode.id, mode);
    } catch (e) {
      if (global.console) console.error(e);
      this.crash(e && e.message);
      return;
    }
    if (!questions || !questions.length) {
      this.crash('問題を作れませんでした');
      return;
    }

    this.state = {
      mode: mode,
      questions: questions,
      index: 0,
      correct: 0,
      answered: false,
      log: [],
      timed: !!mode.timed,          // タイムアタック：かかった時間を出す
      survival: !!mode.survival,    // サバイバル：1問まちがえたら終了
      startedAt: Date.now()
    };
    this.showQuestion();
  };

  /* ---------- 画面2：出題 ---------- */

  Quiz.prototype.showQuestion = function () {
    var self = this;
    var st = this.state;
    var q = st.questions[st.index];
    st.answered = false;

    this.screen.innerHTML = '';

    // --- 進捗とスコア ---
    var status = el('div', 'status');
    var right = st.survival
      ? '<span>連続 <b>' + st.correct + '</b> 問</span>'
      : '<span>正解 <b>' + st.correct + '</b></span>';
    if (st.timed) right += '<span>時間 <b id="q-timer">0.0</b> 秒</span>';
    status.innerHTML =
      '<span>第 <b>' + (st.index + 1) + '</b> 問' +
      (st.survival ? '' : ' / 全 ' + st.questions.length + ' 問') + '</span>' + right;
    this.screen.appendChild(status);

    // タイムアタックの時計。画面を描き直すたびに作り直すので二重に動かない。
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (st.timed) {
      var out = status.querySelector('#q-timer');
      this.timer = setInterval(function () {
        if (!out || !out.isConnected) return;
        out.textContent = ((Date.now() - st.startedAt) / 1000).toFixed(1);
      }, 100);
    }

    var bar = el('div', 'bar');
    var fill = el('i');
    bar.appendChild(fill);
    this.screen.appendChild(bar);
    // 描画後に幅を変えるとアニメーションする
    setTimeout(function () {
      fill.style.width = (st.index / st.questions.length * 100) + '%';
    }, 20);

    var card = el('div', 'card');

    if (q.tag) card.appendChild(el('div', 'q-label', '<span class="tag">' + esc(q.tag) + '</span>'));
    if (q.text) card.appendChild(el('p', 'q-text', q.text));
    if (q.figure) {
      var fig = el('div', 'figure');
      fig.innerHTML = q.figure;
      card.appendChild(fig);
    }
    if (q.math) card.appendChild(el('div', 'math' + (q.mathPlain ? ' plain' : ''), q.math));

    // --- 解答欄 ---
    this.answerArea = el('div');
    card.appendChild(this.answerArea);
    this.renderAnswerArea(q);

    // --- ヒント ---
    if (q.hint) {
      var hintBox = el('div', 'hint hidden', q.hint);
      var hintBtn = el('button', 'btn warn small', 'ヒントを見る');
      hintBtn.type = 'button';
      hintBtn.onclick = function () {
        hintBox.classList.remove('hidden');
        hintBtn.classList.add('hidden');
      };
      var hintRow = el('div', 'btn-row');
      hintRow.appendChild(hintBtn);
      card.appendChild(hintRow);
      card.appendChild(hintBox);
    }

    this.feedback = el('div');
    card.appendChild(this.feedback);

    this.screen.appendChild(card);

    // 入力欄があれば、すぐ打てるようにフォーカスを当てる（スマホでは邪魔なので PC のみ）
    var first = card.querySelector('.input, .blank');
    if (first && window.matchMedia('(hover: hover)').matches) first.focus();
  };

  /* ---------- 解答欄の描画（型ごと） ---------- */

  Quiz.prototype.renderAnswerArea = function (q) {
    var self = this;
    var area = this.answerArea;
    area.innerHTML = '';

    if (q.type === 'choice') {
      // 選択肢は毎回シャッフルするが、正解の位置は内部で追跡するのでズレない。
      // 同じ内容の選択肢が 2 つ入ってしまっているデータでも、
      // 「正解と同じ文字列なら正解」とすることで取りこぼさない。
      var correctHtml = q.choices[q.correct];
      var pairs = q.choices.map(function (c, i) {
        return { html: c, ok: i === q.correct || c === correctHtml };
      });
      var order = q.noShuffle ? pairs : shuffle(pairs);
      var box = el('div', 'choices');
      order.forEach(function (p) {
        var b = el('button', 'choice', p.html);
        b.type = 'button';
        b.onclick = function () { self.submitChoice(box, b, p.ok, order); };
        box.appendChild(b);
      });
      area.appendChild(box);
      return;
    }

    if (q.type === 'input') {
      var row = el('div', 'answer-row');
      var inp = el('input', 'input');
      inp.type = 'text';
      inp.setAttribute('inputmode', q.inputmode || 'text');
      inp.setAttribute('autocomplete', 'off');
      inp.setAttribute('autocapitalize', 'off');
      inp.setAttribute('spellcheck', 'false');
      inp.placeholder = q.placeholder || '答えを入力';
      inp.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } };
      var btn = el('button', 'btn', '答え合わせ');
      btn.type = 'button';
      btn.style.flex = '0 0 auto';
      btn.onclick = go;
      row.appendChild(inp);
      row.appendChild(btn);
      area.appendChild(row);
      if (q.note) area.appendChild(el('p', 'sub', esc(q.note)));

      function go() { self.submitInput(inp, btn); }
      return;
    }

    if (q.type === 'blanks' || q.type === 'pick') {
      var tpl = el('div', 'math plain');
      var parts = String(q.template).split('_');
      var inputs = [];
      parts.forEach(function (text, i) {
        tpl.appendChild(document.createTextNode(''));
        var span = el('span');
        span.innerHTML = text;
        tpl.appendChild(span);
        if (i < parts.length - 1) {
          var b = el('input', 'blank');
          b.type = 'text';
          b.setAttribute('autocomplete', 'off');
          b.setAttribute('spellcheck', 'false');
          if (q.type === 'pick') {
            b.readOnly = true;
            b.dataset.slot = String(inputs.length);
            b.onclick = function () { self.focusSlot(b); };
          } else {
            b.setAttribute('inputmode', q.inputmode || 'text');
          }
          tpl.appendChild(b);
          inputs.push(b);
        }
      });
      area.appendChild(tpl);
      this.blanks = inputs;

      if (q.type === 'pick') {
        // タップで選ぶ方式。ドラッグはスマホで扱いづらいので採用しない。
        this.activeSlot = inputs[0] || null;
        if (this.activeSlot) this.activeSlot.classList.add('is-active');
        var bank = el('div', 'choices');
        shuffle(q.choices.slice()).forEach(function (c) {
          var b = el('button', 'choice', c);
          b.type = 'button';
          b.onclick = function () { self.placeIntoSlot(c, b); };
          bank.appendChild(b);
        });
        area.appendChild(el('p', 'q-label', '空欄をタップして、下から選ぼう'));
        area.appendChild(bank);
        this.bank = bank;
      }

      var row2 = el('div', 'btn-row');
      var btn2 = el('button', 'btn', '答え合わせ');
      btn2.type = 'button';
      btn2.onclick = function () { self.submitBlanks(btn2); };
      row2.appendChild(btn2);
      if (q.type === 'pick') {
        var clr = el('button', 'btn ghost', 'やり直す');
        clr.type = 'button';
        clr.onclick = function () {
          inputs.forEach(function (b) { b.value = ''; });
          self.focusSlot(inputs[0]);
        };
        row2.appendChild(clr);
      }
      area.appendChild(row2);
      return;
    }

    this.crash('未知の問題形式: ' + q.type);
  };

  Quiz.prototype.focusSlot = function (slot) {
    if (!this.blanks) return;
    this.blanks.forEach(function (b) { b.classList.remove('is-active'); });
    if (slot) { slot.classList.add('is-active'); this.activeSlot = slot; }
  };

  Quiz.prototype.placeIntoSlot = function (value, btn) {
    if (this.state.answered) return;
    var slot = this.activeSlot;
    if (!slot) {
      // 空いている最初の枠に入れる
      for (var i = 0; i < this.blanks.length; i++) {
        if (!this.blanks[i].value) { slot = this.blanks[i]; break; }
      }
    }
    if (!slot) return;
    slot.value = btn.textContent;
    // 次の空欄へ自動で進む
    var next = null;
    for (var j = 0; j < this.blanks.length; j++) {
      if (!this.blanks[j].value) { next = this.blanks[j]; break; }
    }
    this.focusSlot(next);
  };

  /* ---------- 採点 ---------- */

  Quiz.prototype.submitChoice = function (box, btn, ok, order) {
    if (this.state.answered) return;
    this.state.answered = true;
    var q = this.state.questions[this.state.index];

    var buttons = box.querySelectorAll('.choice');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
      if (order[i].ok) buttons[i].classList.add('is-correct');
      else buttons[i].classList.add('is-dim');
    }
    if (!ok) btn.classList.remove('is-dim'), btn.classList.add('is-wrong');

    this.judge(ok, btn.textContent, q.choices[q.correct]);
  };

  Quiz.prototype.submitInput = function (inp, btn) {
    if (this.state.answered) return;
    var q = this.state.questions[this.state.index];
    var raw = inp.value;

    if (!String(raw).trim()) {
      this.flashNote('答えを入力してから「答え合わせ」を押してね。');
      inp.focus();
      return;   // 未入力は採点しない（空欄が正解になる事故を防ぐ）
    }

    this.state.answered = true;
    var ok = this.checkAnswer(q, raw);

    inp.readOnly = true;
    inp.classList.add(ok ? 'is-correct' : 'is-wrong');
    btn.disabled = true;

    this.judge(ok, raw, q.answer);
  };

  Quiz.prototype.submitBlanks = function (btn) {
    if (this.state.answered) return;
    var q = this.state.questions[this.state.index];
    var vals = this.blanks.map(function (b) { return b.value; });

    for (var i = 0; i < vals.length; i++) {
      if (!String(vals[i]).trim()) {
        this.flashNote('空欄がまだ残っているよ。全部うめてから答え合わせしよう。');
        return;
      }
    }

    this.state.answered = true;
    var allOk = true;
    for (var j = 0; j < vals.length; j++) {
      var ok1 = this.checkOne(q, vals[j], q.answers[j], j);
      this.blanks[j].classList.add(ok1 ? 'is-correct' : 'is-wrong');
      this.blanks[j].readOnly = true;
      if (!ok1) allOk = false;
    }
    if (this.bank) {
      var bs = this.bank.querySelectorAll('.choice');
      for (var k = 0; k < bs.length; k++) bs[k].disabled = true;
    }
    btn.disabled = true;

    this.judge(allOk, vals.join(' , '), q.answers.join(' , '));
  };

  /** 1 つの解答の正誤。教材側で check を指定していればそれを優先する。 */
  Quiz.prototype.checkAnswer = function (q, raw) {
    if (typeof q.check === 'function') {
      try { return !!q.check(raw, M); } catch (e) { return false; }
    }
    return this.checkOne(q, raw, q.answer, 0);
  };

  Quiz.prototype.checkOne = function (q, raw, answer, index) {
    // 教材側が個別の判定関数を持っていればそれを使う
    if (typeof q.checkEach === 'function') {
      try { return !!q.checkEach(raw, index, M); } catch (e) { return false; }
    }
    if (typeof q.check === 'function' && q.type !== 'blanks' && q.type !== 'pick') {
      try { return !!q.check(raw, M); } catch (e) { return false; }
    }

    if (answer === undefined || answer === null) return false;

    // 数の集合（解が複数）
    if (Array.isArray(answer)) return M.isEqualSet(raw, answer);

    // 数式として比較。ここが従来の文字列比較との決定的な違い。
    var ok = M.isEqual(raw, String(answer));
    if (!ok) return false;

    // 「形」が問われる問題の追加チェック
    if (q.requireFactored && !M.isFactoredForm(raw)) return false;
    if (q.requireRationalized && !M.isRationalized(raw)) return false;
    if (q.requireSimplestRadical && !M.isSimplestRadical(raw)) return false;
    return true;
  };

  Quiz.prototype.flashNote = function (msg) {
    this.feedback.innerHTML =
      '<div class="verdict"><div class="why">' + esc(msg) + '</div></div>';
  };

  /* ---------- 判定の表示と次へ ---------- */

  Quiz.prototype.judge = function (ok, given, expected) {
    var self = this;
    var st = this.state;
    var q = st.questions[st.index];

    if (ok) st.correct++;
    st.log.push({
      text: q.reviewText || q.math || q.text || ('第' + (st.index + 1) + '問'),
      ok: ok,
      given: given,
      expected: q.answerLabel || expected
    });

    var v = el('div', 'verdict ' + (ok ? 'ok' : 'ng'));
    var head = ok ? '正解！' : 'おしい！';
    var body = '';
    if (!ok) {
      body += '<div class="why">正しい答えは <span class="math-inline">' +
        (q.answerLabel !== undefined ? q.answerLabel : esc(M.pretty(expected))) +
        '</span></div>';
    }
    if (q.explain) body += '<div class="why">' + q.explain + '</div>';
    v.innerHTML = '<div class="head">' + head + '</div>' + body;

    this.feedback.innerHTML = '';
    this.feedback.appendChild(v);

    var row = el('div', 'btn-row');
    // サバイバルは 1問まちがえたらそこで終了
    var isLast = st.index >= st.questions.length - 1 || (st.survival && !ok);
    var next = el('button', 'btn wide', isLast ? '結果を見る' : '次の問題へ');
    next.type = 'button';
    next.onclick = function () {
      if (isLast) { self.showResult(); }
      else { st.index++; self.showQuestion(); window.scrollTo(0, 0); }
    };
    row.appendChild(next);
    this.feedback.appendChild(row);
    next.focus();
  };

  /* ---------- 画面3：結果 ---------- */

  Quiz.prototype.showResult = function () {
    var self = this;
    var st = this.state;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }

    var done = st.log.length;                 // 実際に答えた問題数
    var total = st.survival ? done : st.questions.length;
    var rate = total ? Math.round(st.correct / total * 100) : 0;
    var secs = ((Date.now() - st.startedAt) / 1000).toFixed(1);

    var msg;
    if (st.survival) {
      msg = st.correct >= st.questions.length ? '最後まで一度もまちがえずクリア！'
        : st.correct >= 10 ? st.correct + '問連続正解。すごい。'
        : st.correct >= 5 ? st.correct + '問連続。いい調子。'
        : 'もう一度ちょうせんしてみよう。';
    } else {
      msg = rate === 100 ? '全問正解！文句なし。'
        : rate >= 80 ? 'よくできました。'
        : rate >= 50 ? 'あと少し。まちがえた問題を見直そう。'
        : 'ゆっくりで大丈夫。もう一度やってみよう。';
    }

    this.screen.innerHTML = '';
    var card = el('div', 'card result');
    card.innerHTML =
      '<div class="score">' + st.correct + '<small> / ' + total + '</small></div>' +
      '<p class="msg">' + esc(msg) + '</p>' +
      '<p class="muted">正答率 ' + rate + '%' +
      (st.timed ? '　／　かかった時間 ' + secs + ' 秒' : '') + '</p>';

    var wrong = st.log.filter(function (r) { return !r.ok; });
    if (wrong.length) {
      var rv = el('div', 'review');
      var html = '<h3>まちがえた問題</h3><ol>';
      wrong.forEach(function (r) {
        html += '<li>' + r.text +
          '<br><span class="mine">あなた: ' + esc(M.pretty(r.given)) + '</span>' +
          ' → <span class="right">正解: ' + (typeof r.expected === 'string' ? esc(M.pretty(r.expected)) : r.expected) + '</span></li>';
      });
      html += '</ol>';
      rv.innerHTML = html;
      card.appendChild(rv);
    }

    var row = el('div', 'btn-row');
    var again = el('button', 'btn', 'もう一度');
    again.type = 'button';
    again.onclick = function () { self.startMode(st.mode); window.scrollTo(0, 0); };
    row.appendChild(again);

    var back = el('button', 'btn ghost', 'モードを選び直す');
    back.type = 'button';
    back.onclick = function () { self.showModes(); window.scrollTo(0, 0); };
    row.appendChild(back);

    var home = el('a', 'btn ghost', '教材一覧へ');
    home.href = '../remake.html';
    row.appendChild(home);

    card.appendChild(row);
    this.screen.appendChild(card);
  };

  /* ---------- 公開する窓口 ---------- */

  /* ------------------------------------------------------------------
     数式の表示をつくる道具
     ------------------------------------------------------------------
     「1x」「+-3」「0x²」のような表示のくずれは、教材ごとに文字列を
     つなげて作っていたのが原因だった。ここに一本化して防ぐ。      */

  var Fmt = {
    /** 指数つきの文字：pow('x',2) → 'x<sup>2</sup>' */
    pow: function (v, n) {
      if (n === 0) return '';
      if (n === 1) return v;
      return v + '<sup>' + n + '</sup>';
    },

    /**
     * 項ひとつ分の表示。
     *   term(3,'x')  → '3x'
     *   term(1,'x')  → 'x'
     *   term(-1,'x') → '-x'
     *   term(0,'x')  → ''      （0 の項は表示しない）
     *   term(5,'')   → '5'
     */
    term: function (coef, varPart) {
      if (coef === 0) return '';
      if (!varPart) return String(coef);
      if (coef === 1) return varPart;
      if (coef === -1) return '-' + varPart;
      return coef + varPart;
    },

    /**
     * 項を並べて 1 つの式にする。符号は自動で整える。
     *   poly([[1,'x<sup>2</sup>'],[-5,'x'],[6,'']]) → 'x<sup>2</sup> - 5x + 6'
     * 全部 0 のときは '0' を返す。
     */
    poly: function (terms) {
      var out = '';
      terms.forEach(function (t) {
        var c = t[0], v = t[1];
        if (c === 0) return;
        var body = Fmt.term(Math.abs(c), v);
        if (out === '') {
          out = (c < 0 ? '-' : '') + body;
        } else {
          out += (c < 0 ? ' - ' : ' + ') + body;
        }
      });
      return out === '' ? '0' : out;
    },

    /** 判定用の素の式（sup タグを ^ に戻す）。MathCore に渡すときに使う。 */
    plain: function (html) {
      return String(html)
        .replace(/<sup>(\d+)<\/sup>/g, '^$1')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, '');
    },

    /** 符号つきの数を「+3」「-4」の形で返す（式の途中に置くとき用） */
    signed: function (n) { return (n < 0 ? ' - ' : ' + ') + Math.abs(n); }
  };

  global.Quiz = {
    fmt: Fmt,
    start: function (cfg) {
      var q = new Quiz(cfg);
      // 動作確認のときに中身をのぞけるようにしておく（教材の動きには影響しない）
      global.__quiz = q;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { q.mount(); });
      } else {
        q.mount();
      }
      return q;
    },
    // 教材側から使える小道具
    shuffle: shuffle,
    randInt: randInt,
    pick: pick,
    uniqueSample: uniqueSample,
    esc: esc
  };
})(typeof window !== 'undefined' ? window : globalThis);
