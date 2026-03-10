/* ===== 화투 카드 데이터 ===== */

// 화투 12월 대표 카드 데이터
// 각 월에 2장씩 총 24장 — Wikimedia Commons SVG Hwatu 이미지 사용 (CC BY-SA 4.0, by Mliu92)
var HWATU_IMG_BASE = 'https://upload.wikimedia.org/wikipedia/commons/';

var CARDS = [
  // 1월 — 소나무 (松)
  { id: 'jan-a', month: 1, monthName: '1월', name: '소나무', detail: '솔', category: '광', season: 'spring', seasonName: '봄', emoji: '🌲', color: '#3A7D44',
    imageSrc: HWATU_IMG_BASE + '9/9d/Hwatu_January_Hikari.svg' },
  { id: 'jan-b', month: 1, monthName: '1월', name: '학', detail: '솔의 학', category: '새', season: 'spring', seasonName: '봄', emoji: '🦢', color: '#3A7D44',
    imageSrc: HWATU_IMG_BASE + 'd/da/Hwatu_January_Tanzaku.svg' },

  // 2월 — 매화 (梅)
  { id: 'feb-a', month: 2, monthName: '2월', name: '매화', detail: '매', category: '꽃', season: 'spring', seasonName: '봄', emoji: '🌺', color: '#D45B7A',
    imageSrc: HWATU_IMG_BASE + 'b/bd/Hwatu_February_Tanzaku.svg' },
  { id: 'feb-b', month: 2, monthName: '2월', name: '꾀꼬리', detail: '매의 새', category: '새', season: 'spring', seasonName: '봄', emoji: '🐦', color: '#D45B7A',
    imageSrc: HWATU_IMG_BASE + '0/03/Hwatu_February_Tane.svg' },

  // 3월 — 벚꽃 (桜)
  { id: 'mar-a', month: 3, monthName: '3월', name: '벚꽃', detail: '벚', category: '광', season: 'spring', seasonName: '봄', emoji: '🌸', color: '#F4A0B0',
    imageSrc: HWATU_IMG_BASE + '9/93/Hwatu_March_Hikari.svg' },
  { id: 'mar-b', month: 3, monthName: '3월', name: '벚꽃잎', detail: '벚의 꽃', category: '꽃', season: 'spring', seasonName: '봄', emoji: '🌷', color: '#F4A0B0',
    imageSrc: HWATU_IMG_BASE + 'f/f3/Hwatu_March_Tanzaku.svg' },

  // 4월 — 등나무 (藤)
  { id: 'apr-a', month: 4, monthName: '4월', name: '등나무', detail: '흑싸리', category: '꽃', season: 'summer', seasonName: '여름', emoji: '🪻', color: '#7B68AE',
    imageSrc: HWATU_IMG_BASE + '7/75/Hwatu_April_Tanzaku.svg' },
  { id: 'apr-b', month: 4, monthName: '4월', name: '두견새', detail: '흑의 새', category: '새', season: 'summer', seasonName: '여름', emoji: '🐤', color: '#7B68AE',
    imageSrc: HWATU_IMG_BASE + 'e/e6/Hwatu_April_Tane.svg' },

  // 5월 — 난초 (蘭)
  { id: 'may-a', month: 5, monthName: '5월', name: '난초', detail: '초', category: '꽃', season: 'summer', seasonName: '여름', emoji: '🌿', color: '#5A9E6F',
    imageSrc: HWATU_IMG_BASE + '0/0f/Hwatu_May_Tanzaku.svg' },
  { id: 'may-b', month: 5, monthName: '5월', name: '다리', detail: '초의 다리', category: '장식', season: 'summer', seasonName: '여름', emoji: '🌉', color: '#5A9E6F',
    imageSrc: HWATU_IMG_BASE + '7/7e/Hwatu_May_Tane.svg' },

  // 6월 — 모란 (牡丹)
  { id: 'jun-a', month: 6, monthName: '6월', name: '모란', detail: '목단', category: '꽃', season: 'summer', seasonName: '여름', emoji: '🌹', color: '#C44569',
    imageSrc: HWATU_IMG_BASE + 'f/fc/Hwatu_June_Tanzaku.svg' },
  { id: 'jun-b', month: 6, monthName: '6월', name: '나비', detail: '목단의 나비', category: '동물', season: 'summer', seasonName: '여름', emoji: '🦋', color: '#C44569',
    imageSrc: HWATU_IMG_BASE + 'e/e1/Hwatu_June_Tane.svg' },

  // 7월 — 싸리 (萩)
  { id: 'jul-a', month: 7, monthName: '7월', name: '싸리', detail: '홍싸리', category: '꽃', season: 'autumn', seasonName: '가을', emoji: '🌾', color: '#D4764E',
    imageSrc: HWATU_IMG_BASE + '3/31/Hwatu_July_Tanzaku.svg' },
  { id: 'jul-b', month: 7, monthName: '7월', name: '멧돼지', detail: '홍의 멧돼지', category: '동물', season: 'autumn', seasonName: '가을', emoji: '🐗', color: '#D4764E',
    imageSrc: HWATU_IMG_BASE + 'd/d5/Hwatu_July_Tane.svg' },

  // 8월 — 억새 (芒)
  { id: 'aug-a', month: 8, monthName: '8월', name: '억새', detail: '공산', category: '광', season: 'autumn', seasonName: '가을', emoji: '🌕', color: '#E8A850',
    imageSrc: HWATU_IMG_BASE + 'c/c6/Hwatu_August_Hikari.svg' },
  { id: 'aug-b', month: 8, monthName: '8월', name: '기러기', detail: '공산의 기러기', category: '새', season: 'autumn', seasonName: '가을', emoji: '🦆', color: '#E8A850',
    imageSrc: HWATU_IMG_BASE + 'c/c7/Hwatu_August_Tane.svg' },

  // 9월 — 국화 (菊)
  { id: 'sep-a', month: 9, monthName: '9월', name: '국화', detail: '국', category: '꽃', season: 'autumn', seasonName: '가을', emoji: '🌼', color: '#F5C542',
    imageSrc: HWATU_IMG_BASE + '4/4c/Hwatu_September_Tanzaku.svg' },
  { id: 'sep-b', month: 9, monthName: '9월', name: '술잔', detail: '국의 술잔', category: '장식', season: 'autumn', seasonName: '가을', emoji: '🍶', color: '#F5C542',
    imageSrc: HWATU_IMG_BASE + 'c/c5/Hwatu_September_Tane.svg' },

  // 10월 — 단풍 (紅葉)
  { id: 'oct-a', month: 10, monthName: '10월', name: '단풍', detail: '풍', category: '꽃', season: 'winter', seasonName: '겨울', emoji: '🍁', color: '#C0392B',
    imageSrc: HWATU_IMG_BASE + 'c/c0/Hwatu_October_Tanzaku.svg' },
  { id: 'oct-b', month: 10, monthName: '10월', name: '사슴', detail: '풍의 사슴', category: '동물', season: 'winter', seasonName: '겨울', emoji: '🦌', color: '#C0392B',
    imageSrc: HWATU_IMG_BASE + 'f/f0/Hwatu_October_Tane.svg' },

  // 11월 — 오동 (桐)
  { id: 'nov-a', month: 11, monthName: '11월', name: '오동', detail: '동', category: '광', season: 'winter', seasonName: '겨울', emoji: '🍂', color: '#8B7355',
    imageSrc: HWATU_IMG_BASE + 'd/d1/Hwatu_November_Hikari.svg' },
  { id: 'nov-b', month: 11, monthName: '11월', name: '봉황', detail: '동의 봉황', category: '새', season: 'winter', seasonName: '겨울', emoji: '🔥', color: '#8B7355',
    imageSrc: HWATU_IMG_BASE + 'e/e6/Hwatu_November_Kasu_1.svg' },

  // 12월 — 비 (雨)
  { id: 'dec-a', month: 12, monthName: '12월', name: '비', detail: '비', category: '광', season: 'winter', seasonName: '겨울', emoji: '🌧️', color: '#5B7DB1',
    imageSrc: HWATU_IMG_BASE + '6/6b/Hwatu_December_Hikari.svg' },
  { id: 'dec-b', month: 12, monthName: '12월', name: '버들', detail: '비의 버들', category: '장식', season: 'winter', seasonName: '겨울', emoji: '🌿', color: '#5B7DB1',
    imageSrc: HWATU_IMG_BASE + '1/17/Hwatu_December_Tane.svg' }
];

// 게임 목록 데이터
var GAMES = [
  { id: 'same-month',    name: '같은 달 찾기',       desc: '같은 월의 카드를 짝지어 보세요',         icon: '🎴' },
  { id: 'sequence',      name: '순서 기억하기',       desc: '카드가 나온 순서를 기억해 보세요',       icon: '🔢' },
  { id: 'hidden-card',   name: '숨은 카드 기억',      desc: '어디에 있었는지 기억해 보세요',          icon: '🔍' },
  { id: 'matching',      name: '화투 짝맞추기',       desc: '뒤집어서 같은 짝을 찾아보세요',         icon: '🃏' },
  { id: 'season-sort',   name: '계절 맞추기',         desc: '카드를 알맞은 계절에 놓아보세요',        icon: '🌸' },
  { id: 'missing-card',  name: '사라진 한 장 찾기',    desc: '어떤 카드가 사라졌는지 찾아보세요',      icon: '❓' },
  { id: 'story-recall',  name: '이야기 회상',         desc: '그림을 보고 이야기를 떠올려 보세요',     icon: '📖' }
];

// 계절 정보
var SEASONS = [
  { id: 'spring', name: '봄', emoji: '🌸', months: [1, 2, 3] },
  { id: 'summer', name: '여름', emoji: '☀️', months: [4, 5, 6] },
  { id: 'autumn', name: '가을', emoji: '🍂', months: [7, 8, 9] },
  { id: 'winter', name: '겨울', emoji: '❄️', months: [10, 11, 12] }
];

// 난이도 설정
var DIFFICULTY = {
  easy:   { label: '천천히', sub: '쉬움', pairCount: 2, seqLength: 3, gridSize: 4, matchPairs: 3, seasonCards: 4, missingTotal: 3 },
  normal: { label: '보통',   sub: '보통', pairCount: 3, seqLength: 4, gridSize: 6, matchPairs: 4, seasonCards: 6, missingTotal: 4 },
  hard:   { label: '도전',   sub: '어려움', pairCount: 4, seqLength: 5, gridSize: 9, matchPairs: 6, seasonCards: 8, missingTotal: 6 }
};

// 칭찬 메시지 풀
var PRAISE = {
  correct: [
    '잘하셨어요! 👏',
    '참 잘하셨습니다! 🌟',
    '기억력이 좋으세요! ✨',
    '대단해요! 💛',
    '멋져요! 🎉',
    '차근차근 잘 찾으셨어요! 👍'
  ],
  encourage: [
    '천천히 다시 해볼까요? 😊',
    '괜찮아요, 한 번 더 해봐요! 💪',
    '조금만 더 생각해 보세요 🤔',
    '천천히 해도 괜찮아요 😌'
  ],
  complete: [
    '아주 잘하셨어요! 🎊',
    '훌륭합니다! 🌈',
    '참 대단하세요! 🏆',
    '즐거운 시간이었어요! 🌻'
  ],
  story: [
    '좋은 기억이네요 😊',
    '참 따뜻한 그림이지요 🌸',
    '멋진 선택이에요 ✨',
    '좋은 생각이에요! 💕'
  ]
};

// 이야기 회상 게임 문제 데이터
var STORY_QUESTIONS = [
  {
    cards: ['mar-a', 'feb-a'],
    question: '벚꽃과 매화를 보면 어느 계절이 떠오르세요?',
    choices: ['봄', '여름', '가을', '겨울'],
    answerIndex: 0
  },
  {
    cards: ['dec-a', 'nov-a'],
    question: '비와 오동 그림을 보면 어떤 느낌이 드세요?',
    choices: ['쓸쓸한 겨울', '화창한 봄', '뜨거운 여름', '풍성한 가을'],
    answerIndex: 0
  },
  {
    cards: ['aug-a', 'sep-a'],
    question: '억새와 국화는 어느 계절의 그림일까요?',
    choices: ['가을', '봄', '여름', '겨울'],
    answerIndex: 0
  },
  {
    cards: ['jan-b', 'mar-a'],
    question: '학과 벚꽃을 보고 가장 어울리는 장면을 골라보세요.',
    choices: ['봄날 산책', '한여름 바다', '겨울밤 눈길', '가을 들판'],
    answerIndex: 0
  },
  {
    cards: ['jun-b', 'may-a'],
    question: '나비와 난초가 어울리는 때는 언제일까요?',
    choices: ['따뜻한 여름날', '추운 겨울밤', '쌀쌀한 가을', '이른 봄'],
    answerIndex: 0
  },
  {
    cards: ['jul-b', 'oct-b'],
    question: '멧돼지와 사슴은 어디에서 만날 수 있을까요?',
    choices: ['깊은 산속', '넓은 바다', '도시 공원', '하늘 위'],
    answerIndex: 0
  },
  {
    cards: ['aug-b', 'dec-a'],
    question: '기러기가 날아가는 모습을 보면 무엇이 떠오르세요?',
    choices: ['가을 하늘', '봄 꽃밭', '여름 해변', '겨울 눈밭'],
    answerIndex: 0
  },
  {
    cards: ['jan-a', 'nov-b'],
    question: '소나무와 봉황이 함께 있는 그림은 어떤 느낌인가요?',
    choices: ['기품 있는 느낌', '슬픈 느낌', '시원한 느낌', '무서운 느낌'],
    answerIndex: 0
  }
];
