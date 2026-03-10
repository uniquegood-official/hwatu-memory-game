/* ===== 화투 기억마당 — 메인 애플리케이션 ===== */

(function () {
  'use strict';

  // ─── 앱 상태 ───
  var state = {
    screen: 'start',        // start | modeSelect | difficultySelect | gameSelect | game | gameComplete | result
    mode: null,              // sequential | select
    difficulty: 'easy',
    currentGameIndex: 0,
    selectedGameIndex: null,
    gameResults: [],          // [{gameIndex, correct, total}]
    gameState: {},            // 현재 게임 내부 상태
    inputLocked: false        // 빠른 연속 클릭 방지
  };

  var $app = document.getElementById('app');

  // ─── 유틸리티 ───
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function pick(arr, n) {
    return shuffle(arr).slice(0, n);
  }

  function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getCardById(id) {
    for (var i = 0; i < CARDS.length; i++) {
      if (CARDS[i].id === id) return CARDS[i];
    }
    return null;
  }

  function getCardsByMonth(month) {
    return CARDS.filter(function (c) { return c.month === month; });
  }

  function getUniqueMonths() {
    var months = [];
    var seen = {};
    CARDS.forEach(function (c) {
      if (!seen[c.month]) { seen[c.month] = true; months.push(c.month); }
    });
    return months;
  }

  function getDiffConfig() {
    return DIFFICULTY[state.difficulty];
  }

  // ─── 사운드 훅 (향후 TTS/효과음 연동용) ───
  function playSuccessSound() { /* 향후 구현 */ }
  function playTapSound() { /* 향후 구현 */ }
  function speakGuide(text) { /* 향후 TTS 연동: speechSynthesis.speak(...) */ }

  // ─── 피드백 표시 ───
  var feedbackTimer = null;

  function showFeedback(emoji, text, subtext, duration, callback) {
    duration = duration || 1800;
    clearTimeout(feedbackTimer);

    var overlay = document.querySelector('.feedback-overlay');
    var fb = document.querySelector('.feedback');
    if (!overlay || !fb) return;

    fb.querySelector('.feedback-emoji').textContent = emoji || '';
    fb.querySelector('.feedback-text').textContent = text || '';
    fb.querySelector('.feedback-sub').textContent = subtext || '';
    overlay.classList.add('show');
    fb.classList.add('show');

    feedbackTimer = setTimeout(function () {
      overlay.classList.remove('show');
      fb.classList.remove('show');
      if (callback) setTimeout(callback, 200);
    }, duration);
  }

  function showPraise(callback) {
    var msg = randomItem(PRAISE.correct);
    showFeedback('🎉', msg, '', 1500, callback);
    playSuccessSound();
  }

  function showEncourage(callback) {
    var msg = randomItem(PRAISE.encourage);
    showFeedback('😊', msg, '', 1500, callback);
  }

  // ─── 입력 잠금 ───
  function lockInput(ms) {
    state.inputLocked = true;
    setTimeout(function () { state.inputLocked = false; }, ms || 600);
  }

  // ─── HTML 렌더링 헬퍼 ───
  function h(tag, attrs, children) {
    var html = '<' + tag;
    if (attrs) {
      for (var key in attrs) {
        if (attrs.hasOwnProperty(key)) html += ' ' + key + '="' + attrs[key] + '"';
      }
    }
    html += '>';
    if (children !== undefined) html += (Array.isArray(children) ? children.join('') : children);
    html += '</' + tag + '>';
    return html;
  }

  // 카드 HTML 생성
  function renderCard(card, options) {
    options = options || {};
    var flipped = options.flipped ? ' flipped' : '';
    var selected = options.selected ? ' selected' : '';
    var matched = options.matched ? ' matched' : '';
    var disabled = options.disabled ? ' disabled' : '';
    var extra = options.extraClass || '';
    var onClick = options.onClick || '';
    var idx = options.dataIndex !== undefined ? ' data-index="' + options.dataIndex + '"' : '';
    var dataId = ' data-id="' + card.id + '"';

    return '<div class="hwatu-card' + flipped + selected + matched + disabled + ' ' + extra + '"' +
      idx + dataId +
      (onClick ? ' onclick="' + onClick + '"' : '') + '>' +
      '<div class="hwatu-card-inner">' +
        '<div class="hwatu-card-face ' + card.season + '">' +
          '<span class="card-emoji">' + card.emoji + '</span>' +
          '<span class="card-month">' + card.monthName + '</span>' +
          '<span class="card-name">' + card.name + '</span>' +
          '<span class="card-season ' + card.season + '">' + card.seasonName + '</span>' +
        '</div>' +
        '<div class="hwatu-card-back"></div>' +
      '</div>' +
    '</div>';
  }

  // 진행 바
  function renderProgressBar(current, total) {
    var pct = Math.round((current / total) * 100);
    return '<div class="progress-bar">' +
      '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
      '<span class="progress-text">' + current + ' / ' + total + '</span>' +
    '</div>';
  }

  // 게임 상단 바
  function renderGameTopBar(gameName, step, total) {
    return '<div class="game-top-bar">' +
      '<button class="home-btn" onclick="APP.goHome()">처음으로</button>' +
      '<span class="game-title-bar">' + gameName + '</span>' +
      '<span class="game-step">' + (step !== undefined ? step + '/' + total : '') + '</span>' +
    '</div>';
  }

  // 피드백 오버레이 (항상 DOM에 존재)
  function feedbackHTML() {
    return '<div class="feedback-overlay"></div>' +
      '<div class="feedback">' +
        '<div class="feedback-emoji"></div>' +
        '<div class="feedback-text"></div>' +
        '<div class="feedback-sub"></div>' +
      '</div>';
  }

  // ─────────────────────────────
  //  화면 렌더링
  // ─────────────────────────────

  function render() {
    var html = '';
    switch (state.screen) {
      case 'start':           html = renderStartScreen(); break;
      case 'modeSelect':      html = renderModeSelect(); break;
      case 'difficultySelect': html = renderDifficultySelect(); break;
      case 'gameSelect':      html = renderGameSelect(); break;
      case 'game':            html = renderGameScreen(); break;
      case 'gameComplete':    html = renderGameCompleteScreen(); break;
      case 'result':          html = renderResultScreen(); break;
      default:                html = renderStartScreen();
    }
    $app.innerHTML = html + feedbackHTML();
    window.scrollTo(0, 0);
  }

  // ── 시작 화면 ──
  function renderStartScreen() {
    return '<div class="screen start-screen">' +
      '<div class="start-deco">🌸🎴🍁🌕</div>' +
      '<h1 class="start-title">화투 기억마당</h1>' +
      '<p class="start-subtitle">추억의 그림으로 즐기는 두뇌놀이</p>' +
      '<p class="start-desc">친숙한 화투 그림으로 기억력과 집중력을 키워보세요.<br>천천히 즐기면 됩니다.</p>' +
      '<div class="btn-group" style="margin-top:12px">' +
        '<button class="btn btn-primary" onclick="APP.startSequential()">오늘의 두뇌놀이</button>' +
        '<button class="btn btn-secondary" onclick="APP.startSelect()">원하는 놀이 고르기</button>' +
      '</div>' +
    '</div>';
  }

  // ── 난이도 선택 ──
  function renderDifficultySelect() {
    var diffs = ['easy', 'normal', 'hard'];
    var btns = diffs.map(function (d) {
      var cfg = DIFFICULTY[d];
      var sel = state.difficulty === d ? ' selected' : '';
      return '<button class="difficulty-btn' + sel + '" onclick="APP.setDifficulty(\'' + d + '\')">' +
        cfg.label +
        '<span class="difficulty-label">' + cfg.sub + '</span>' +
      '</button>';
    }).join('');

    return '<div class="screen">' +
      '<div class="screen-header">' +
        '<h2>어떤 빠르기로 할까요?</h2>' +
        '<p>편한 단계를 골라주세요</p>' +
      '</div>' +
      '<div class="difficulty-options">' + btns + '</div>' +
      '<div class="btn-group" style="margin-top:28px">' +
        '<button class="btn btn-primary" onclick="APP.confirmDifficulty()">시작하기</button>' +
        '<button class="btn btn-secondary btn-small" onclick="APP.goHome()">돌아가기</button>' +
      '</div>' +
    '</div>';
  }

  // ── 게임 선택 화면 ──
  function renderGameSelect() {
    var cards = GAMES.map(function (g, i) {
      return '<div class="game-select-card" onclick="APP.selectGame(' + i + ')">' +
        '<div class="game-num">' + (i + 1) + '</div>' +
        '<div class="game-title">' + g.icon + ' ' + g.name + '</div>' +
        '<div class="game-desc">' + g.desc + '</div>' +
      '</div>';
    }).join('');

    return '<div class="screen">' +
      '<div class="screen-header">' +
        '<h2>어떤 놀이를 해볼까요?</h2>' +
        '<p>하고 싶은 놀이를 골라주세요</p>' +
      '</div>' +
      '<div class="game-select-grid">' + cards + '</div>' +
      '<div class="btn-group" style="margin-top:20px">' +
        '<button class="btn btn-secondary btn-small" onclick="APP.goHome()">처음으로</button>' +
      '</div>' +
    '</div>';
  }

  // ── 게임 플레이 화면 ──
  function renderGameScreen() {
    var idx = state.mode === 'sequential' ? state.currentGameIndex : state.selectedGameIndex;
    var gameDef = GAMES[idx];
    var topBar = renderGameTopBar(
      gameDef.icon + ' ' + gameDef.name,
      state.mode === 'sequential' ? (state.currentGameIndex + 1) : undefined,
      state.mode === 'sequential' ? GAMES.length : undefined
    );

    var progressHTML = '';
    if (state.mode === 'sequential') {
      progressHTML = renderProgressBar(state.currentGameIndex, GAMES.length);
    }

    var gameHTML = '';
    switch (idx) {
      case 0: gameHTML = renderGame1(); break;
      case 1: gameHTML = renderGame2(); break;
      case 2: gameHTML = renderGame3(); break;
      case 3: gameHTML = renderGame4(); break;
      case 4: gameHTML = renderGame5(); break;
      case 5: gameHTML = renderGame6(); break;
      case 6: gameHTML = renderGame7(); break;
    }

    return '<div class="screen" style="justify-content:flex-start">' +
      topBar + progressHTML + gameHTML +
    '</div>';
  }

  // ── 게임 완료 화면 ──
  function renderGameCompleteScreen() {
    var gs = state.gameState;
    var praise = randomItem(PRAISE.complete);
    var isSeq = state.mode === 'sequential';
    var hasNext = isSeq && state.currentGameIndex < GAMES.length - 1;

    var btns = '';
    if (hasNext) {
      btns = '<button class="btn btn-primary" onclick="APP.nextGame()">다음 놀이로 넘어가볼까요?</button>';
    } else if (isSeq) {
      btns = '<button class="btn btn-primary" onclick="APP.showResult()">결과 보기</button>';
    }
    btns += '<button class="btn btn-secondary btn-small" onclick="APP.replayGame()">다시하기</button>';
    btns += '<button class="btn btn-secondary btn-small" onclick="APP.goHome()">처음으로</button>';

    return '<div class="screen">' +
      '<div class="game-complete-card">' +
        '<div class="complete-emoji">🎊</div>' +
        '<h3>' + praise + '</h3>' +
        '<p>' + (gs.completeMessage || '잘 해내셨어요!') + '</p>' +
        '<div class="btn-group" style="margin-top:20px">' + btns + '</div>' +
      '</div>' +
    '</div>';
  }

  // ── 결과 화면 ──
  function renderResultScreen() {
    var totalGames = state.gameResults.length;
    var totalCorrect = 0;
    var totalQ = 0;
    state.gameResults.forEach(function (r) {
      totalCorrect += r.correct;
      totalQ += r.total;
    });

    var messages = [
      '오늘도 즐겁게 두뇌놀이를 마치셨어요.',
      '참 잘하셨습니다!',
      '다음에도 천천히 함께 해봐요.'
    ];
    var bestPraise = randomItem(PRAISE.complete);

    return '<div class="screen result-screen">' +
      '<div class="result-card">' +
        '<div class="result-emoji">🏆</div>' +
        '<div class="result-title">오늘의 두뇌놀이 완료!</div>' +
        '<div class="result-message">' + messages[0] + '<br>' + messages[2] + '</div>' +
        '<div class="result-stats">' +
          '<div class="result-stat">' +
            '<div class="stat-value">' + totalGames + '</div>' +
            '<div class="stat-label">완료한 놀이</div>' +
          '</div>' +
          '<div class="result-stat">' +
            '<div class="stat-value">' + totalCorrect + '</div>' +
            '<div class="stat-label">맞힌 문제</div>' +
          '</div>' +
        '</div>' +
        '<div class="result-praise">' + bestPraise + '</div>' +
        '<div class="btn-group" style="margin-top:24px">' +
          '<button class="btn btn-primary" onclick="APP.startSequential()">다시하기</button>' +
          '<button class="btn btn-secondary" onclick="APP.goHome()">처음으로</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ─────────────────────────────
  //  게임 초기화 & 렌더링
  // ─────────────────────────────

  function initGame(gameIndex) {
    state.gameState = {};
    switch (gameIndex) {
      case 0: initGame1(); break;
      case 1: initGame2(); break;
      case 2: initGame3(); break;
      case 3: initGame4(); break;
      case 4: initGame5(); break;
      case 5: initGame6(); break;
      case 6: initGame7(); break;
    }
  }

  // ════════════════════════════════
  //  게임 1: 같은 달 찾기
  // ════════════════════════════════

  function initGame1() {
    var cfg = getDiffConfig();
    var months = pick(getUniqueMonths(), cfg.pairCount);
    var cards = [];
    months.forEach(function (m) {
      var mc = getCardsByMonth(m);
      cards.push(mc[0], mc[1]);
    });
    state.gameState = {
      cards: shuffle(cards),
      selected: [],
      matched: [],
      correct: 0,
      total: cfg.pairCount,
      phase: 'play'
    };
  }

  function renderGame1() {
    var gs = state.gameState;
    var guide = '<div class="guide-message">같은 달의 카드 두 장을 찾아보세요</div>';
    var cardsHTML = gs.cards.map(function (c, i) {
      var isSelected = gs.selected.indexOf(i) >= 0;
      var isMatched = gs.matched.indexOf(c.month) >= 0;
      return renderCard(c, {
        selected: isSelected,
        matched: isMatched,
        disabled: isMatched,
        dataIndex: i,
        onClick: 'APP.game1Click(' + i + ')'
      });
    }).join('');

    return guide + '<div class="card-grid">' + cardsHTML + '</div>';
  }

  function game1Click(index) {
    if (state.inputLocked) return;
    var gs = state.gameState;
    if (gs.phase !== 'play') return;
    if (gs.matched.indexOf(gs.cards[index].month) >= 0) return;
    if (gs.selected.indexOf(index) >= 0) {
      gs.selected = gs.selected.filter(function (i) { return i !== index; });
      render();
      return;
    }
    if (gs.selected.length >= 2) return;

    playTapSound();
    gs.selected.push(index);

    if (gs.selected.length === 2) {
      lockInput(1000);
      var c1 = gs.cards[gs.selected[0]];
      var c2 = gs.cards[gs.selected[1]];
      if (c1.month === c2.month) {
        gs.matched.push(c1.month);
        gs.correct++;
        gs.selected = [];
        render();
        if (gs.matched.length === gs.total) {
          setTimeout(function () { completeGame('같은 달을 모두 찾으셨어요!', gs.correct, gs.total); }, 600);
        } else {
          showPraise();
        }
      } else {
        render();
        setTimeout(function () {
          gs.selected = [];
          render();
          showEncourage();
        }, 800);
      }
    } else {
      render();
    }
  }

  // ════════════════════════════════
  //  게임 2: 순서 기억하기
  // ════════════════════════════════

  function initGame2() {
    var cfg = getDiffConfig();
    var allCards = shuffle(CARDS);
    var seqCards = allCards.slice(0, cfg.seqLength);
    state.gameState = {
      sequence: seqCards,
      shuffled: shuffle(seqCards.slice()),
      phase: 'showing',  // showing | input | done
      showIndex: 0,
      userInput: [],
      correct: 0,
      total: cfg.seqLength
    };
    setTimeout(function () { showNextInSequence(); }, 500);
  }

  function showNextInSequence() {
    var gs = state.gameState;
    if (gs.showIndex < gs.sequence.length) {
      gs.showIndex++;
      render();
      setTimeout(function () { showNextInSequence(); }, 1200);
    } else {
      setTimeout(function () {
        gs.phase = 'input';
        render();
      }, 800);
    }
  }

  function renderGame2() {
    var gs = state.gameState;

    if (gs.phase === 'showing') {
      var showCards = '';
      for (var i = 0; i < gs.showIndex; i++) {
        var isLast = i === gs.showIndex - 1;
        showCards += renderCard(gs.sequence[i], { extraClass: isLast ? 'highlight' : '' });
      }
      return '<div class="guide-message">카드를 잘 보세요. 순서를 기억해 주세요!</div>' +
        '<div class="card-grid">' + showCards + '</div>';
    }

    if (gs.phase === 'input') {
      // 순서 표시 점
      var dots = '';
      for (var j = 0; j < gs.total; j++) {
        var cls = j < gs.userInput.length ? 'filled' : (j === gs.userInput.length ? 'current' : '');
        dots += '<div class="seq-dot ' + cls + '">' + (j + 1) + '</div>';
      }

      var cardsHTML = gs.shuffled.map(function (c, i) {
        var used = false;
        gs.userInput.forEach(function (ui) { if (ui === c.id) used = true; });
        return renderCard(c, {
          disabled: used,
          dataIndex: i,
          onClick: 'APP.game2Click("' + c.id + '")'
        });
      }).join('');

      return '<div class="guide-message">기억하신 순서대로 눌러보세요</div>' +
        '<div class="sequence-display">' + dots + '</div>' +
        '<div class="card-grid">' + cardsHTML + '</div>';
    }

    return '';
  }

  function game2Click(cardId) {
    if (state.inputLocked) return;
    var gs = state.gameState;
    if (gs.phase !== 'input') return;

    playTapSound();
    lockInput(600);

    var expected = gs.sequence[gs.userInput.length];
    if (cardId === expected.id) {
      gs.userInput.push(cardId);
      gs.correct++;
      render();
      if (gs.userInput.length === gs.total) {
        setTimeout(function () { completeGame('순서를 모두 맞히셨어요!', gs.correct, gs.total); }, 600);
      } else {
        showPraise();
      }
    } else {
      showEncourage(function () {
        // 순서가 틀리면 진행은 계속하되 해당 순서에 올바른 답 표시 후 넘김
        gs.userInput.push(expected.id);
        render();
        if (gs.userInput.length === gs.total) {
          setTimeout(function () { completeGame('잘 하셨어요! 순서 기억은 어려운 일이에요.', gs.correct, gs.total); }, 600);
        }
      });
    }
  }

  // ════════════════════════════════
  //  게임 3: 숨은 카드 기억 게임
  // ════════════════════════════════

  function initGame3() {
    var cfg = getDiffConfig();
    var allCards = shuffle(CARDS);
    var gridCards = allCards.slice(0, cfg.gridSize);
    var targetCard = gridCards[Math.floor(Math.random() * gridCards.length)];

    state.gameState = {
      cards: gridCards,
      target: targetCard,
      phase: 'reveal',  // reveal | hidden | done
      selected: null,
      correct: 0,
      total: 1
    };

    // 카드를 잠시 보여준 후 뒤집기
    var revealTime = cfg.gridSize <= 4 ? 3000 : cfg.gridSize <= 6 ? 4000 : 5000;
    setTimeout(function () {
      state.gameState.phase = 'hidden';
      render();
    }, revealTime);
  }

  function renderGame3() {
    var gs = state.gameState;

    if (gs.phase === 'reveal') {
      var cardsHTML = gs.cards.map(function (c) {
        return renderCard(c, {});
      }).join('');
      return '<div class="guide-message">카드를 잘 보세요! 곧 뒤집힙니다</div>' +
        '<div class="card-grid">' + cardsHTML + '</div>';
    }

    if (gs.phase === 'hidden') {
      var target = '<div class="target-display">' +
        '<span class="card-emoji">' + gs.target.emoji + '</span>' +
        '<span>' + gs.target.monthName + ' ' + gs.target.name + ' 카드는 어디 있었을까요?</span>' +
      '</div>';

      var cardsHTML2 = gs.cards.map(function (c, i) {
        return renderCard(c, {
          flipped: true,
          dataIndex: i,
          onClick: 'APP.game3Click(' + i + ')'
        });
      }).join('');

      return '<div class="guide-message small">기억을 떠올려 보세요!</div>' +
        target +
        '<div class="card-grid">' + cardsHTML2 + '</div>';
    }

    if (gs.phase === 'done') {
      var cardsHTML3 = gs.cards.map(function (c) {
        var isTarget = c.id === gs.target.id;
        var isSelected = gs.selected !== null && gs.cards[gs.selected].id === c.id;
        return renderCard(c, {
          matched: isTarget,
          selected: isSelected && !isTarget
        });
      }).join('');

      return '<div class="guide-message">' + (gs.correct ? '정확해요! 👏' : '여기에 있었어요!') + '</div>' +
        '<div class="card-grid">' + cardsHTML3 + '</div>';
    }

    return '';
  }

  function game3Click(index) {
    if (state.inputLocked) return;
    var gs = state.gameState;
    if (gs.phase !== 'hidden') return;

    playTapSound();
    lockInput(1000);
    gs.selected = index;

    if (gs.cards[index].id === gs.target.id) {
      gs.correct = 1;
      gs.phase = 'done';
      render();
      showPraise(function () {
        completeGame('숨은 카드를 찾으셨어요!', 1, 1);
      });
    } else {
      gs.phase = 'done';
      render();
      showEncourage(function () {
        completeGame('다음에는 꼭 찾을 수 있어요!', 0, 1);
      });
    }
  }

  // ════════════════════════════════
  //  게임 4: 화투 짝맞추기
  // ════════════════════════════════

  function initGame4() {
    var cfg = getDiffConfig();
    var months = pick(getUniqueMonths(), cfg.matchPairs);
    var cards = [];
    months.forEach(function (m) {
      var mc = getCardsByMonth(m);
      cards.push(mc[0], mc[1]);
    });
    state.gameState = {
      cards: shuffle(cards),
      flipped: [],      // 현재 뒤집힌 인덱스
      matched: [],      // 매칭된 카드 인덱스들
      correct: 0,
      total: cfg.matchPairs,
      phase: 'play'
    };
  }

  function renderGame4() {
    var gs = state.gameState;
    var guide = '<div class="guide-message">카드를 두 장씩 뒤집어 같은 달을 찾아보세요</div>';

    var cardsHTML = gs.cards.map(function (c, i) {
      var isFlipped = gs.flipped.indexOf(i) < 0 && gs.matched.indexOf(i) < 0;
      var isMatched = gs.matched.indexOf(i) >= 0;
      return renderCard(c, {
        flipped: isFlipped,
        matched: isMatched,
        disabled: isMatched,
        dataIndex: i,
        onClick: 'APP.game4Click(' + i + ')'
      });
    }).join('');

    return guide + '<div class="card-grid">' + cardsHTML + '</div>';
  }

  function game4Click(index) {
    if (state.inputLocked) return;
    var gs = state.gameState;
    if (gs.phase !== 'play') return;
    if (gs.matched.indexOf(index) >= 0) return;
    if (gs.flipped.indexOf(index) >= 0) return;
    if (gs.flipped.length >= 2) return;

    playTapSound();
    gs.flipped.push(index);
    render();

    if (gs.flipped.length === 2) {
      lockInput(1200);
      var c1 = gs.cards[gs.flipped[0]];
      var c2 = gs.cards[gs.flipped[1]];

      if (c1.month === c2.month) {
        gs.matched.push(gs.flipped[0], gs.flipped[1]);
        gs.correct++;
        gs.flipped = [];
        render();
        if (gs.matched.length === gs.cards.length) {
          setTimeout(function () { completeGame('모든 짝을 찾으셨어요!', gs.correct, gs.total); }, 600);
        } else {
          showPraise();
        }
      } else {
        setTimeout(function () {
          gs.flipped = [];
          render();
        }, 1000);
      }
    }
  }

  // ════════════════════════════════
  //  게임 5: 계절 맞추기
  // ════════════════════════════════

  function initGame5() {
    var cfg = getDiffConfig();
    // 각 계절에서 균등하게 카드 선택
    var allCards = shuffle(CARDS);
    var selected = allCards.slice(0, cfg.seasonCards);

    state.gameState = {
      cards: selected,
      currentIndex: 0,
      placed: { spring: [], summer: [], autumn: [], winter: [] },
      correct: 0,
      total: cfg.seasonCards,
      phase: 'play'
    };
  }

  function renderGame5() {
    var gs = state.gameState;

    if (gs.phase === 'done' || gs.currentIndex >= gs.cards.length) {
      return '<div class="guide-message">모든 카드를 계절에 놓았어요!</div>';
    }

    var currentCard = gs.cards[gs.currentIndex];
    var guide = '<div class="guide-message">이 카드는 어느 계절일까요?</div>';

    var cardDisplay = '<div class="current-card-display">' +
      renderCard(currentCard, {}) +
    '</div>';

    var zones = SEASONS.map(function (s) {
      var placedHTML = gs.placed[s.id].map(function (c) {
        return '<span class="mini-card">' + c.emoji + ' ' + c.name + '</span>';
      }).join('');

      return '<div class="season-zone ' + s.id + '-zone" onclick="APP.game5Click(\'' + s.id + '\')">' +
        '<div class="zone-emoji">' + s.emoji + '</div>' +
        '<div class="zone-label">' + s.name + '</div>' +
        '<div class="placed-cards">' + placedHTML + '</div>' +
      '</div>';
    }).join('');

    return guide + cardDisplay + '<div class="season-zones">' + zones + '</div>';
  }

  function game5Click(seasonId) {
    if (state.inputLocked) return;
    var gs = state.gameState;
    if (gs.phase !== 'play') return;
    if (gs.currentIndex >= gs.cards.length) return;

    playTapSound();
    lockInput(800);

    var card = gs.cards[gs.currentIndex];
    var correct = card.season === seasonId;

    if (correct) {
      gs.correct++;
      gs.placed[seasonId].push(card);
      gs.currentIndex++;
      render();

      if (gs.currentIndex >= gs.cards.length) {
        setTimeout(function () { completeGame('계절을 잘 맞추셨어요!', gs.correct, gs.total); }, 600);
      } else {
        showPraise();
      }
    } else {
      showEncourage(function () {
        // 틀려도 올바른 계절로 배치하고 다음으로
        gs.placed[card.season].push(card);
        gs.currentIndex++;
        render();
        if (gs.currentIndex >= gs.cards.length) {
          setTimeout(function () { completeGame('계절을 잘 맞추셨어요!', gs.correct, gs.total); }, 600);
        }
      });
    }
  }

  // ════════════════════════════════
  //  게임 6: 사라진 한 장 찾기
  // ════════════════════════════════

  function initGame6() {
    var cfg = getDiffConfig();
    var allCards = shuffle(CARDS);
    var gameCards = allCards.slice(0, cfg.missingTotal);
    var missingIndex = Math.floor(Math.random() * gameCards.length);
    var missingCard = gameCards[missingIndex];

    // 보기 선택지: 사라진 카드 + 다른 카드 2장
    var others = allCards.filter(function (c) {
      return gameCards.indexOf(c) < 0;
    }).slice(0, 2);
    var choices = shuffle([missingCard].concat(others));

    state.gameState = {
      originalCards: gameCards,
      missingCard: missingCard,
      missingIndex: missingIndex,
      remainingCards: gameCards.filter(function (_, i) { return i !== missingIndex; }),
      choices: choices,
      phase: 'reveal',  // reveal | guess | done
      correct: 0,
      total: 1
    };

    var revealTime = cfg.missingTotal <= 3 ? 3000 : cfg.missingTotal <= 4 ? 4000 : 5000;
    setTimeout(function () {
      state.gameState.phase = 'guess';
      render();
    }, revealTime);
  }

  function renderGame6() {
    var gs = state.gameState;

    if (gs.phase === 'reveal') {
      var cardsHTML = gs.originalCards.map(function (c) {
        return renderCard(c, {});
      }).join('');
      return '<div class="guide-message">카드를 잘 보세요! 한 장이 곧 사라집니다</div>' +
        '<div class="card-grid">' + cardsHTML + '</div>';
    }

    if (gs.phase === 'guess') {
      var remainHTML = gs.remainingCards.map(function (c) {
        return renderCard(c, {});
      }).join('');

      // 빈 자리 표시
      var emptySlot = '<div class="empty-slot">?</div>';

      // 남은 카드 + 빈 자리
      var displayCards = '';
      for (var i = 0; i < gs.originalCards.length; i++) {
        if (i === gs.missingIndex) {
          displayCards += emptySlot;
        } else {
          displayCards += renderCard(gs.originalCards[i], { disabled: true });
        }
      }

      var choicesHTML = gs.choices.map(function (c) {
        return '<button class="choice-btn" onclick="APP.game6Click(\'' + c.id + '\')">' +
          c.emoji + ' ' + c.monthName + ' ' + c.name +
        '</button>';
      }).join('');

      return '<div class="guide-message">어떤 카드가 사라졌을까요?</div>' +
        '<div class="card-grid">' + displayCards + '</div>' +
        '<div class="choices" style="margin-top:20px">' + choicesHTML + '</div>';
    }

    if (gs.phase === 'done') {
      var allCardsHTML = gs.originalCards.map(function (c) {
        var isMissing = c.id === gs.missingCard.id;
        return renderCard(c, { matched: isMissing });
      }).join('');
      return '<div class="guide-message">' + (gs.correct ? '정확해요! 👏' : '이 카드가 사라졌었어요!') + '</div>' +
        '<div class="card-grid">' + allCardsHTML + '</div>';
    }

    return '';
  }

  function game6Click(cardId) {
    if (state.inputLocked) return;
    var gs = state.gameState;
    if (gs.phase !== 'guess') return;

    playTapSound();
    lockInput(1000);

    if (cardId === gs.missingCard.id) {
      gs.correct = 1;
      gs.phase = 'done';
      render();
      showPraise(function () {
        completeGame('사라진 카드를 찾으셨어요!', 1, 1);
      });
    } else {
      gs.phase = 'done';
      render();
      showEncourage(function () {
        completeGame('다음에는 꼭 찾을 수 있어요!', 0, 1);
      });
    }
  }

  // ════════════════════════════════
  //  게임 7: 이야기 회상 게임
  // ════════════════════════════════

  function initGame7() {
    var q = randomItem(STORY_QUESTIONS);
    var questionCards = q.cards.map(function (id) { return getCardById(id); });

    state.gameState = {
      question: q,
      questionCards: questionCards,
      phase: 'play',
      selected: null,
      correct: 0,
      total: 1
    };
  }

  function renderGame7() {
    var gs = state.gameState;

    var cardsHTML = gs.questionCards.map(function (c) {
      return renderCard(c, {});
    }).join('');

    var choicesHTML = gs.question.choices.map(function (ch, i) {
      var cls = '';
      if (gs.phase === 'done') {
        if (i === gs.question.answerIndex) cls = ' correct';
        else if (gs.selected === i && i !== gs.question.answerIndex) cls = ' wrong';
      }
      return '<button class="choice-btn' + cls + '"' +
        (gs.phase === 'play' ? ' onclick="APP.game7Click(' + i + ')"' : '') +
        '>' + ch + '</button>';
    }).join('');

    var guide = gs.phase === 'play'
      ? '<div class="guide-message">' + gs.question.question + '</div>'
      : '<div class="guide-message">' + randomItem(PRAISE.story) + '</div>';

    return guide +
      '<div class="card-grid">' + cardsHTML + '</div>' +
      '<div class="choices" style="margin-top:20px">' + choicesHTML + '</div>';
  }

  function game7Click(index) {
    if (state.inputLocked) return;
    var gs = state.gameState;
    if (gs.phase !== 'play') return;

    playTapSound();
    lockInput(1200);
    gs.selected = index;

    // 이야기 회상은 모든 답이 "맞는" 느낌으로 처리
    if (index === gs.question.answerIndex) {
      gs.correct = 1;
    }
    gs.phase = 'done';
    render();

    var storyMsg = randomItem(PRAISE.story);
    showFeedback('🌸', storyMsg, '', 1800, function () {
      completeGame('좋은 이야기를 나누었어요!', gs.correct || 1, 1);
    });
  }

  // ─────────────────────────────
  //  게임 완료 처리
  // ─────────────────────────────

  function completeGame(message, correct, total) {
    var idx = state.mode === 'sequential' ? state.currentGameIndex : state.selectedGameIndex;
    state.gameResults.push({ gameIndex: idx, correct: correct, total: total });
    state.gameState.completeMessage = message;
    state.screen = 'gameComplete';
    render();
  }

  // ─────────────────────────────
  //  공개 API (onclick에서 호출)
  // ─────────────────────────────

  window.APP = {
    goHome: function () {
      state.screen = 'start';
      state.gameResults = [];
      state.currentGameIndex = 0;
      state.selectedGameIndex = null;
      state.mode = null;
      render();
    },

    startSequential: function () {
      state.mode = 'sequential';
      state.currentGameIndex = 0;
      state.gameResults = [];
      state.screen = 'difficultySelect';
      render();
    },

    startSelect: function () {
      state.mode = 'select';
      state.gameResults = [];
      state.screen = 'gameSelect';
      render();
    },

    setDifficulty: function (d) {
      state.difficulty = d;
      render();
    },

    confirmDifficulty: function () {
      if (state.mode === 'sequential') {
        state.currentGameIndex = 0;
        state.screen = 'game';
        initGame(0);
        render();
      } else if (state.mode === 'select') {
        state.screen = 'game';
        initGame(state.selectedGameIndex);
        render();
      }
    },

    selectGame: function (index) {
      state.selectedGameIndex = index;
      state.screen = 'difficultySelect';
      render();
    },

    nextGame: function () {
      state.currentGameIndex++;
      if (state.currentGameIndex >= GAMES.length) {
        state.screen = 'result';
      } else {
        state.screen = 'game';
        initGame(state.currentGameIndex);
      }
      render();
    },

    replayGame: function () {
      var idx = state.mode === 'sequential' ? state.currentGameIndex : state.selectedGameIndex;
      state.screen = 'game';
      initGame(idx);
      render();
    },

    showResult: function () {
      state.screen = 'result';
      render();
    },

    // 게임별 클릭 핸들러
    game1Click: game1Click,
    game2Click: game2Click,
    game3Click: game3Click,
    game4Click: game4Click,
    game5Click: game5Click,
    game6Click: game6Click,
    game7Click: game7Click
  };

  // ─── 초기 렌더링 ───
  render();

})();
