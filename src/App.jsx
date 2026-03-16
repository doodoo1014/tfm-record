import { useState, useMemo, useEffect, useRef } from 'react';
import { Rocket, Map, Trophy, Star, Plus, Users, X, Check, Medal, History, ChevronLeft, Award, Settings, BarChart2, Edit, Trash2, PieChart, TrendingUp, Search, Lock, Unlock, Bell, Info, ShieldCheck, LogOut, ChevronDown, ChevronUp, ListPlus, Crown } from 'lucide-react';
import { supabase } from './supabase';

// =============================================================================
// 1. 상수 및 방대한 기초 데이터 모음
// =============================================================================

const MAPS = ['타르시스', '헬라스', '엘리시움', '보레알리스', '유토피아', '키메리아', '아마조니스'];
const EXPANSIONS = ['서곡', '서곡2', '비너스넥스트', '개척기지', '격동'];
const PLAYER_COUNTS = ['통합', '1인', '2인', '3인', '4인', '5인'];
const GUINNESS_TABS = ['통합', '1인', '2인', '3인', '4인', '5인', '명예의전당'];

const CORPORATIONS = [
  { name: '초보자용 기업', exp: '기본' }, { name: '에코라인', exp: '기본' }, { name: '헬리온', exp: '기본' }, { name: '시네마틱스', exp: '기본' }, { name: '인벤트릭스', exp: '기본' }, { name: '마이닝길드', exp: '기본' }, { name: '포볼로그', exp: '기본' }, { name: '타르시스 공화국', exp: '기본' }, { name: '토르게이트', exp: '기본' }, { name: '운미', exp: '기본' }, { name: '새턴시스템', exp: '기본' }, { name: '테랙터', exp: '기본' }, 
  { name: '아카디아 공동체', exp: '프로모' }, { name: '리사이클론', exp: '프로모' }, { name: '스플라이스', exp: '프로모' }, { name: '팩토럼', exp: '프로모' }, { name: '몬스 손해보험', exp: '프로모' }, { name: '필레어스', exp: '프로모' }, { name: '아스트로드릴 엔터프라이즈', exp: '프로모' }, { name: '파머시 유니온', exp: '프로모' }, { name: '카이퍼 협동조합', exp: '프로모' }, { name: '튀코 마그네틱스', exp: '프로모' }, 
  { name: '아프로디테', exp: '비너스넥스트' }, { name: '셀레스틱', exp: '비너스넥스트' }, { name: '매뉴테크', exp: '비너스넥스트' }, { name: '모닝 스타 인코퍼레이션', exp: '비너스넥스트' }, { name: '바이론', exp: '비너스넥스트' },
  { name: '포인트 루나', exp: '서곡' }, { name: '로빈슨 인더스트리', exp: '서곡' }, { name: '밸리 트러스트', exp: '서곡' }, { name: '비토르', exp: '서곡' }, { name: '쳉싱마스', exp: '서곡' },
  { name: '포세이돈', exp: '개척기지' }, { name: '폴리페모스', exp: '개척기지' }, { name: '아리도르', exp: '개척기지' }, { name: '스톰크래프트', exp: '개척기지' }, { name: '아크라이트', exp: '개척기지' },
  { name: '프리스타', exp: '격동' }, { name: '테라랩스', exp: '격동' }, { name: '레이크프론트 리조트', exp: '격동' }, { name: '유토피아', exp: '격동' }, { name: '셉템 트리부스', exp: '격동' },
  { name: '에코텍', exp: '서곡2' }, { name: '니르갈 엔터프라이즈', exp: '서곡2' }, { name: '팔라딘 해운', exp: '서곡2' }, { name: '사기타', exp: '서곡2' }, { name: '스파이어', exp: '서곡2' },
];

const CORE_ITEMS = ['최대 승점', '최소 TR', '최대 TR'];
const RESOURCE_ITEMS = ['메가크레딧', '강철', '티타늄', '식물', '에너지', '열'];
const PRODUCTION_ITEMS = ['메가크레딧', '강철', '티타늄', '식물', '에너지', '열'];
const TAG_ITEMS = ['건물', '우주', '과학', '식물', '미생물', '동물', '에너지', '목성', '지구', '도시', '금성', '무태그'];
const SPECIAL_AWARDS_DEFAULT = ['카드 최대 장수', '최대 특수 타일 개수'];

const SPECIAL_RESOURCES = {
  '동물자원': ['펭귄', '포식동물', '물고기', '새', '가축', '소형동물', '자연 생태 형성지', '초식동물', '애완동물', '냉동저항성 물고기', '금성 성층권 조류', '금성동물', '유해조수', '화성동물원', '아크라이트'],
  '미생물자원': ['개미', '분해자생물', '완보동물', '질산환원균', '표토섭식미생물', '온실가스생산세균', '호냉성 미생물', '황섭식미생물', '금성곤충', '극한성생물', '리사이클론'],
  '부양체자원': ['토성서핑', '스트라토폴리스', '공중주거구역', '대기포집풍선', '국지규모 햇빛가리개', '항공지도 작성', '금성에서 중수소 수출', '인공 강우', '비행선', '소형 대기감쇄기 살포', '목성 궤도 등불', '대기 포집', '타이탄 공중 발사대', '대적반 관측소', '타이탄 왕복선', '목성 공중정거장', '타이탄 대기 감쇄', '클라우드 투어', '공중 정제소', '기상관측기구', '셀레스틱', '스톰크래프트', '부양형 무역항'],
  '소행성 자원': ['소행성 유도 추력기', '소행성 궤도 굴절 방어체계', '소행성 사용수익권', '소행성 내부 공동화 사업', '혜성 조준발사', '자전 촉진 충돌', '아스트로드릴 엔터프랑즈', '카이퍼 협동조합', '주소행성대의 소행성'],
  '과학자원': ['생명체 탐사', '올림푸스 컨퍼런스', '물리 복합연구단지', '스파이어', '응용과학'],
  '기타자원': ['평화수호함대(전투기)', '탄소나노시스템(그래핀)', '쿠퍼티노 전도단의 성 요셉(대성당)', '해수발전자문(수력 전기)', '병원(질병)', '난민구호소(캠프)', '파머시유니온(질병)', '프리스타(보존)', '이사회(이사)']
};

const AWARD_GUIDE = {
  '교외개발기업상': '지도의 가장자리 구역에 배치된 타일을 가장 많이 소유한 플레이어.', '금융기업상': '메가크레딧 생산력이 가장 높은 플레이어.', '기획기업상': '자기 사건형 카드 무더기에 사건형 카드가 가장 많은 플레이어.', '내륙기업상': '해양 타일에 인접하지 않은 타일을 가장 많이 소유한 플레이어.', '다자원기업상': '개인 게임판과 카드의 자원을 통틀어, 보유한 자원 종류가 가장 많은 플레이어.', '도시기업상': '소유한 도시 타일이 가장 많은 플레이어.', '동물미생물기업상': '보유한 동물과 미생물 자원 수 총합이 가장 많은 플레이어.', '명문기업상': '추진 비용이 20 M€ 이상인 카드를 가장 많이 보유한 플레이어.', '법인기업상': '추진 비용이 10 M€ 이하인 카드를 가장 많이 보유한 플레이어.', '벤처기업상': '특수 타일에 인접한 타일을 가장 많이 소유한 플레이어.', '부동산기업상': '해양 타일에 인접한 타일을 가장 많이 소유한 플레이어.', '비전경영기업상': '손에 든 카드 장수가 가장 많은 플레이어.', '산림기업상': '소유한 녹지 타일이 가장 많은 플레이어.', '생물기업상': '보유한 생물(식물·동물·미생물) 태그가 가장 많은 플레이어.', '식물기업상': '식물 생산력이 가장 높은 플레이어.', '에너지기업상': '보유한 에너지 태그가 가장 많은 플레이어.', '열기업상': '보유한 열 자원 수가 가장 많은 플레이어.', '우주기업상': '보유한 우주 태그가 가장 많은 플레이어.', '정치기업상': '당대표 수와 영향력을 합쳐 가장 높은 플레이어.', '제조기업상': '강철 생산력과 열 생산력 총합이 가장 높은 플레이어.', '조경기업상': '소유한 타일이 가장 많이 연결되어 있는 플레이어. (가장 많이 연결된 그룹 비교)', '초국적기업상': '강철, 티타늄, 식물, 에너지, 열 생산력 총합이 가장 높은 플레이어. (MC 제외)', '테라포밍기업상': '테라포밍 등급(TR)이 가장 높은 플레이어. (가장 먼저 계산)', '투자기업상': '보유한 지구 태그가 가장 많은 플레이어.', '특수기업상': '카드에 있는 특수 자원의 수가 가장 많은 플레이어.', '행정기업상': '(기업과 서곡 포함) 태그가 없는 카드를 가장 많이 보유한 플레이어.', '개발기업상': '소유한 개척기지와 도시 타일이 가장 많은 플레이어.', '개척기업상': '소유한 타일이 가장 많은 플레이어.', '거대기업상': '보유한 유지형 카드(초록색 카드)가 가장 많은 플레이어.', '건설기업상': '보유한 건물 태그가 가장 많은 플레이어.', '공업기업상': '보유한 강철과 에너지 자원 수 총합이 가장 많은 플레이어.', '과학기업상': '보유한 과학 태그가 가장 많은 플레이어.', '관광기업상': '보유한 목성 태그와 지구 태그의 총합이 가장 많은 플레이어.', '관측기업상': '추진 조건이 있는 카드를 가장 많이 보유한 플레이어.', '광업기업상': '보유한 강철과 티타늄 자원 수 총합이 가장 많은 플레이어.'
};
const AWARD_ITEMS = Object.keys(AWARD_GUIDE).sort();

const GUINNESS_CATEGORIES_FORM = ['기본 기록', '자원', '생산력', '최대 태그', '특수자원', '기업상', '특별상'];

// =============================================================================
// 2. 컴포넌트: 검색 드롭다운 & 기업 그리드
// =============================================================================

const SearchableSelect = ({ selectedValue, onChange, options, placeholder, onAddNew, addNewLabel }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const matched = options?.find(o => o.value === selectedValue);
    if (matched) {
      setQuery(matched.label);
    } else if (selectedValue) {
      setQuery(selectedValue);
    } else if (!isOpen) {
      setQuery('');
    }
  }, [selectedValue, options, isOpen]);

  const safeOptions = options || [];
  const filtered = safeOptions.filter(o => o.label?.toLowerCase().includes(query.toLowerCase()));
  const isExactMatch = safeOptions.some(o => o.label === query.trim());

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
        <input
          type="text" value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); if (selectedValue) onChange(''); }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold outline-none text-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner"
        />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl z-[200] max-h-56 overflow-y-auto scrollbar-hide py-1">
          {filtered.map(opt => (
            <div key={opt.value} onMouseDown={(e) => { e.preventDefault(); setQuery(opt.label); onChange(opt.value); setIsOpen(false); }}
                 className="px-4 py-3 hover:bg-slate-700 cursor-pointer text-sm font-medium text-slate-200 border-b border-slate-700/50 last:border-0 transition-colors">
              {opt.label}
            </div>
          ))}
          {!isExactMatch && query.trim() !== '' && onAddNew && (
            <div onMouseDown={(e) => { e.preventDefault(); onAddNew(query.trim()); setIsOpen(false); }}
                 className="px-4 py-3 bg-orange-900/40 hover:bg-orange-900/60 cursor-pointer text-sm font-black text-orange-400 border-t border-slate-700/50 flex items-center gap-1.5 transition-colors">
              <Plus size={16}/> "{query.trim()}" {addNewLabel || '신규 등록'}
            </div>
          )}
          {filtered.length === 0 && (!onAddNew || query.trim() === '') && (
            <div className="px-4 py-4 text-xs text-slate-500 text-center font-bold">검색 결과가 없습니다.</div>
          )}
        </div>
      )}
    </div>
  );
};

const CorporationGrid = ({ selectedExps, selectedCorps, onChange }) => {
  const timerRef = useRef(null);
  const isLongPress = useRef(false);

  const handlePointerDown = (corpName) => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      if (!selectedCorps.includes(corpName) && selectedCorps.length < 3) {
        onChange([...selectedCorps, corpName]); 
      }
    }, 400); 
  };

  const handlePointerUp = (corpName) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isLongPress.current) {
      onChange([corpName]); 
    }
  };

  const handlePointerLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const groupedCorps = useMemo(() => {
    const groups = { '기본': [] };
    // 선택된 확장에 대한 그룹 생성
    selectedExps.forEach(exp => { groups[exp] = []; });

    CORPORATIONS.forEach(c => {
      // 💡 프로모 기업이거나 기본 기업이면 '기본' 그룹에 추가
      if (c.exp === '기본' || c.exp === '프로모') {
        groups['기본'].push(c.name);
      } 
      // 그 외 선택된 확장에 해당하는 기업 추가
      else if (groups[c.exp]) {
        groups[c.exp].push(c.name);
      }
    });
    return groups;
  }, [selectedExps]);

  return (
    <div className="space-y-4 max-h-60 overflow-y-auto scrollbar-hide pr-1" style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}>
      {Object.entries(groupedCorps).map(([expName, corps]) => {
        if (corps.length === 0) return null;
        return (
          <div key={expName} className="space-y-2">
            <h4 className="text-[10px] font-black text-slate-500 ml-1 border-b border-slate-700/50 pb-1">{expName}</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {corps.map(corpName => {
                const isSelected = selectedCorps.includes(corpName);
                const isPrimary = selectedCorps[0] === corpName; 
                return (
                  <button
                    key={corpName}
                    onPointerDown={() => handlePointerDown(corpName)}
                    onPointerUp={() => handlePointerUp(corpName)}
                    onPointerLeave={handlePointerLeave}
                    onContextMenu={(e) => e.preventDefault()} 
                    className={`p-2 rounded-xl text-[10px] font-bold leading-tight break-keep flex items-center justify-center min-h-[44px] transition-all duration-200 shadow-md ${
                      isSelected 
                        ? (isPrimary ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-slate-900 border border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]') 
                        : 'bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {corpName}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="text-[9px] text-slate-500 text-center mt-2 font-bold">터치 시 주기업 변경 • 0.4초 꾹 누르면 합병 추가</p>
    </div>
  );
};

// =============================================================================
// 3. 헬퍼 로직 (ELO)
// =============================================================================

const calculateMultiplayerELO = (playersResult, kFactor = 32) => {
  let results = playersResult.map(p => ({ ...p, ratingChange: 0 }));
  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      let p1 = results[i]; let p2 = results[j];
      let expectedP1 = 1 / (1 + Math.pow(10, (p2.rating - p1.rating) / 400));
      let expectedP2 = 1 / (1 + Math.pow(10, (p1.rating - p2.rating) / 400));
      let s1 = 0.5, s2 = 0.5; 
      if (p1.rank < p2.rank) { s1 = 1; s2 = 0; } 
      else if (p1.rank > p2.rank) { s1 = 0; s2 = 1; }
      let adjustedK = kFactor / Math.max(1, (results.length - 1));
      p1.ratingChange += adjustedK * (s1 - expectedP1);
      p2.ratingChange += adjustedK * (s2 - expectedP2);
    }
  }
  return results.map(p => ({ ...p, ratingChange: Math.round(p.ratingChange), newRating: Math.round(p.rating + p.ratingChange) }));
};

const createEmptyScore = () => ({ playerId: '', corps: [], score: '', mc: '' });

// =============================================================================
// 4. 메인 어플리케이션
// =============================================================================

export default function App() {
  const THEME_BG = "bg-slate-950"; const THEME_PANEL = "bg-slate-900"; const THEME_CARD = "bg-slate-800";
  const THEME_BORDER = "border-slate-700"; const THEME_TEXT_PRIMARY = "text-slate-200"; const THEME_TEXT_MUTED = "text-slate-400";
  const ACCENT_ORANGE = "text-orange-500"; const ACCENT_BG = "bg-orange-600";

  const [activeNav, setActiveNav] = useState('기록');
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('tfm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [authRoleReq, setAuthRoleReq] = useState('개척자');
  
  const isAdminOrMaster = currentUser?.role === 'master' || currentUser?.role === '관리자';
  const isMaster = currentUser?.role === 'master';
  const canWrite = currentUser?.is_approved === true;

  const [players, setPlayers] = useState([]); 
  const [seasons, setSeasons] = useState([{ id: 'all', name: '프리 시즌 (전체)', start_date: null, end_date: null }]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('all');
  const [games, setGames] = useState([]);
  const [guinnessRecords, setGuinnessRecords] = useState([]); 
  const [allUsers, setAllUsers] = useState([]); 

  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);
  const [isGuinnessModalOpen, setIsGuinnessModalOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false); 
  const [selectedGuinnessHistory, setSelectedGuinnessHistory] = useState(null);
  const [selectedPlayerIdForStats, setSelectedPlayerIdForStats] = useState(null); 
  const [expandedCorpStats, setExpandedCorpStats] = useState(null); 

  const [editingGameId, setEditingGameId] = useState(null);
  const [newGameDate, setNewGameDate] = useState(new Date().toISOString().split('T')[0]);
  const [newGameMap, setNewGameMap] = useState('타르시스'); 
  const [selectedExps, setSelectedExps] = useState([...EXPANSIONS]); 
  const [isSoloMode, setIsSoloMode] = useState(false);
  const [gamePlayerCount, setGamePlayerCount] = useState(4); 
  
  const [soloType, setSoloType] = useState('나 홀로 화성에'); 
  const [soloResult, setSoloResult] = useState('성공'); 
  const [gameScores, setGameScores] = useState([createEmptyScore(), createEmptyScore(), createEmptyScore(), createEmptyScore()]);

  const [gPlayerIds, setGPlayerIds] = useState([]); // 💡 다중 선택 배열로 변경
  const [gGameId, setGGameId] = useState(''); 
  const [guinnessBatch, setGuinnessBatch] = useState([]);
  
  const [gCategory, setGCategory] = useState('기본 기록');
  const [gSubCategory, setGSubCategory] = useState('동물자원'); 
  const [gItem, setGItem] = useState(CORE_ITEMS[0]); 
  const [gValue, setGValue] = useState('');
  const [showGInput, setShowGInput] = useState(true);

  const [guinnessTab, setGuinnessTab] = useState('통합');
  const [showAwardInfo, setShowAwardInfo] = useState(null);
  
  const [expandedCats, setExpandedCats] = useState({
    '자원': false, '생산력': false, '최대 태그': false, '특수자원': false, '특수자원_동물자원': false, '특수자원_미생물자원': false, '특수자원_부양체자원': false, '특수자원_소행성 자원': false, '특수자원_과학자원': false, '특수자원_기타자원': false, '기업상': false, '특별상': false
  });

  const [seasonName, setSeasonName] = useState(''); const [seasonStart, setSeasonStart] = useState(''); const [seasonEnd, setSeasonEnd] = useState('');

  // ==========================================
  // 💡 DB 로드 함수
  // ==========================================
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const { data: sData } = await supabase.from('seasons').select('*');
      if (sData) setSeasons([{ id: 'all', name: '프리 시즌 (전체)', start_date: null, end_date: null }, ...sData.filter(s=>s.is_active).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at))]);

      const { data: pData } = await supabase.from('players').select('*');
      if (pData) setPlayers(pData.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)));

      const { data: gRecData } = await supabase.from('guinness_records').select('*');
      if (gRecData) setGuinnessRecords(gRecData.filter(r=>r.is_active).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).map(r => ({
        ...r, id: r.id, playerCount: r.player_count, category: r.category, itemName: r.item_name, recordValue: r.record_value, 
        playerId: r.player_id, corps: r.corps, gameId: r.game_id, is_approved: r.is_approved, is_hall_of_fame: r.is_hall_of_fame
      })));

      const { data: gData } = await supabase.from('games').select(`*, game_results ( player_id, corps, score, mc, rank, rating_change )`);
      if (gData) {
        const formattedGames = gData.filter(g=>g.is_active).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(g => ({
          id: g.id, date: g.date, map: g.map_name, generation: g.generation, expansions: g.expansions, is_active: g.is_active, isSolo: g.player_count === 1,
          results: g.game_results.map(r => ({
            playerId: r.player_id, corps: r.corps, score: r.score, mc: r.mc, rank: r.rank, ratingChange: r.rating_change,
            soloResult: g.player_count === 1 ? (r.score > 0 ? '성공' : '실패') : null 
          }))
        }));
        setGames(formattedGames);
      }
      if (isAdminOrMaster) {
        const { data: uData } = await supabase.from('users').select('*');
        if (uData) setAllUsers(uData.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)));
      }
    } catch (error) { console.error('DB 에러:', error.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchInitialData(); }, [currentUser?.role]);

  const handleLogin = async () => {
    if (!authUsername || !authPin) return alert("입력값을 확인해주세요.");
    if (authUsername === 'master' && authPin === '0000') {
      const mUser = { username: 'Master', role: 'master', is_approved: true };
      setCurrentUser(mUser); localStorage.setItem('tfm_user', JSON.stringify(mUser));
      setIsAuthModalOpen(false); setAuthUsername(''); setAuthPin(''); return;
    }
    const { data: user, error } = await supabase.from('users').select('*').eq('username', authUsername).eq('is_active', true).single();
    if (!user || error || user.pin !== authPin) return alert('유저 정보가 없거나 PIN이 틀렸습니다.');
    
    setCurrentUser(user); localStorage.setItem('tfm_user', JSON.stringify(user));
    setIsAuthModalOpen(false); setAuthUsername(''); setAuthPin('');
  };

  const handleSignup = async () => {
    if (!/^\d{4}$/.test(authPin)) return alert('PIN은 4자리 숫자여야 합니다.');
    const { data: existing } = await supabase.from('users').select('*').eq('username', authUsername).single();
    if (existing) return alert('이미 존재하는 이름입니다.');
    
    const newUser = { username: authUsername, pin: authPin, role: authRoleReq === '관리자' ? '개척자' : authRoleReq, is_approved: false };
    const { data, error } = await supabase.from('users').insert([newUser]).select().single();
    if (error) return alert("회원가입 오류: " + error.message);
    
    alert('가입 신청 완료! 관리자 승인 후 기록이 가능합니다.');
    setCurrentUser(data); localStorage.setItem('tfm_user', JSON.stringify(data));
    setIsAuthModalOpen(false); setAuthUsername(''); setAuthPin('');
  };
  
  const handleLogout = () => { if (window.confirm("로그아웃 하시겠습니까?")) { setCurrentUser(null); localStorage.removeItem('tfm_user'); } };
  const updateRole = async (userId, updates) => { await supabase.from('users').update(updates).eq('id', userId); fetchInitialData(); };

  const handleAddNewPlayer = async (newPlayerName) => {
    if (!newPlayerName) return '';
    const existingPlayersWithSameName = players.filter(p => p.name === newPlayerName);
    const newAlphabet = String.fromCharCode(65 + existingPlayersWithSameName.length); 
    
    const { data, error } = await supabase.from('players').insert([{ name: newPlayerName, alphabet: newAlphabet, rating: 1500, games_played: 0 }]).select().single();
    if (error) { alert("추가 실패: " + error.message); return ''; }
    setPlayers(prev => [...prev, { id: data.id, name: data.name, alphabet: data.alphabet, rating: data.rating, gamesPlayed: data.games_played }]);
    return data.id;
  };

  useEffect(() => {
    if (isSoloMode) {
      setGamePlayerCount(1);
      setGameScores(prev => prev.length > 0 ? [{ ...prev[0] }] : [createEmptyScore()]);
    } else {
      setGameScores(prev => {
        const newScores = [...prev];
        if (newScores.length < gamePlayerCount) {
          while (newScores.length < gamePlayerCount) newScores.push(createEmptyScore());
        } else if (newScores.length > gamePlayerCount) {
          newScores.length = gamePlayerCount;
        }
        return newScores;
      });
    }
  }, [isSoloMode, gamePlayerCount]);

  // ==========================================
  // 💡 메인 엔진 (ELO, 개인 통계)
  // ==========================================
  const { filteredGames, playerStatsEngine } = useMemo(() => {
    const season = seasons.find(s => s.id === selectedSeasonId) || seasons[0];
    let validGames = games.filter(g => g.is_active); 
    
    if (season.start_date) validGames = validGames.filter(g => g.date >= season.start_date);
    if (season.end_date) validGames = validGames.filter(g => g.date <= season.end_date);
    validGames.sort((a,b) => new Date(a.date) - new Date(b.date)); 

    const stats = {};
    players.forEach(p => {
      stats[p.id] = { ...p, currentRating: 1500, gamesPlayed: 0, wins: 0, ratingHistory: [{ gameIdx: 0, rating: 1500 }], corpStats: {}, rankCounts: {} };
    });

    validGames.forEach((game, index) => {
      if (game.isSolo) {
        if (!game.results || game.results.length === 0) return;
        const res = game.results[0];
        if (!stats[res.playerId]) return;
        const pStat = stats[res.playerId];
        pStat.gamesPlayed += 1;
        
        if (!pStat.rankCounts['1인']) pStat.rankCounts['1인'] = { total: 0, 1: 0, fail: 0 };
        pStat.rankCounts['1인'].total += 1;
        if (res.soloResult === '성공') { pStat.wins += 1; pStat.rankCounts['1인'][1] += 1; }
        else { pStat.rankCounts['1인'].fail += 1; }
        
        (res.corps || []).forEach(c => {
          if (!pStat.corpStats[c]) pStat.corpStats[c] = { plays: 0, wins: 0 };
          pStat.corpStats[c].plays += 1; 
          if (res.soloResult === '성공') pStat.corpStats[c].wins += 1;
        });
        const targetRes = game.results.find(x => x.playerId === res.playerId);
        if (targetRes) { targetRes.rank = 1; targetRes.ratingChange = 0; }
        return; 
      }

      let sorted = [...game.results].sort((a,b) => b.score !== a.score ? b.score - a.score : b.mc - a.mc);
      let r = 1;
      sorted = sorted.map((s, idx, arr) => {
        if (idx > 0 && s.score === arr[idx-1].score && s.mc === arr[idx-1].mc) {} else r = idx + 1;
        return { ...s, rank: r, rating: stats[s.playerId]?.currentRating || 1500 };
      });

      const pCountStr = `${game.results.length}인`;

      const eloOutput = calculateMultiplayerELO(sorted);
      eloOutput.forEach(res => {
        if (!stats[res.playerId]) return;
        const pStat = stats[res.playerId];
        pStat.currentRating = res.newRating; pStat.gamesPlayed += 1;
        
        if (!pStat.rankCounts[pCountStr]) pStat.rankCounts[pCountStr] = { total: 0 };
        pStat.rankCounts[pCountStr].total += 1;
        pStat.rankCounts[pCountStr][res.rank] = (pStat.rankCounts[pCountStr][res.rank] || 0) + 1;

        if (res.rank === 1) pStat.wins += 1;
        
        if (pStat.ratingHistory.length === 1 && pStat.ratingHistory[0].gameIdx === 0) {
          pStat.ratingHistory = [{ gameIdx: index + 1, date: game.date, rating: res.newRating, change: res.ratingChange }];
        } else {
          pStat.ratingHistory.push({ gameIdx: index + 1, date: game.date, rating: res.newRating, change: res.ratingChange });
        }

        (res.corps || []).forEach(c => {
          if (!pStat.corpStats[c]) pStat.corpStats[c] = { plays: 0, wins: 0 };
          pStat.corpStats[c].plays += 1; if (res.rank === 1) pStat.corpStats[c].wins += 1;
        });

        const targetRes = game.results.find(x => x.playerId === res.playerId);
        // 💡 렌더링 시 현재 ELO 점수(newRating)를 쓸 수 있도록 엔진에서 값 주입
        if (targetRes) { targetRes.rank = res.rank; targetRes.ratingChange = res.ratingChange; targetRes.newRating = res.newRating; }
      });
    });

    return { filteredGames: validGames.reverse(), playerStatsEngine: stats }; 
  }, [games, seasons, selectedSeasonId, players]);

  const globalCorpStats = useMemo(() => {
    const stats = {};
    filteredGames.forEach(g => {
      (g.results || []).forEach(r => {
        (r.corps || []).forEach(c => {
          if (!stats[c]) stats[c] = { name: c, plays: 0, wins: 0, players: {} };
          stats[c].plays += 1; 
          if (g.isSolo) {
            if (r.soloResult === '성공') stats[c].wins += 1;
          } else {
            if (r.rank === 1) stats[c].wins += 1;
          }
          stats[c].players[r.playerId] = (stats[c].players[r.playerId] || 0) + 1;
        });
      });
    });
    // 💡 픽수(plays)가 많은 순으로 1차 정렬, 픽수가 같다면 승률이 높은 순으로 2차 정렬
    return Object.values(stats).sort((a, b) => {
      if (b.plays !== a.plays) return b.plays - a.plays;
      return (b.wins / b.plays) - (a.wins / a.plays);
    });
  }, [filteredGames]);

  // ==========================================
  // 💡 기네스 데이터 그룹화 (명예의 전당 분리)
  // ==========================================
  const displayedGuinnessGroups = useMemo(() => {
    const season = seasons.find(s => s.id === selectedSeasonId);
    let validRecords = guinnessRecords;
    if (season?.start_date) validRecords = validRecords.filter(r => r.date >= season.start_date);
    if (season?.end_date) validRecords = validRecords.filter(r => r.date <= season.end_date);

    validRecords = validRecords.filter(r => r.is_approved);

    const isHoF = guinnessTab === '명예의전당';
    const pCountInt = guinnessTab === '통합' ? null : parseInt(guinnessTab.replace('인', ''), 10);
    
    // 🏆 명예의 전당
    if (isHoF) {
      const hofRecords = validRecords.filter(r => r.is_hall_of_fame).sort((a,b) => new Date(b.date) - new Date(a.date));
      return [{ category: '명예의 전당', title: '명예의 전당 (불멸의 기록)', records: hofRecords }];
    }

    // 일반 기록
    validRecords = validRecords.filter(r => !r.is_hall_of_fame);
    if (pCountInt) validRecords = validRecords.filter(r => r.playerCount === pCountInt);
    
    const bests = {};
    const dynamicSpecialAwards = new Set(SPECIAL_AWARDS_DEFAULT);

    validRecords.forEach(r => {
      if (r.category === '특별상') dynamicSpecialAwards.add(r.itemName);

      const key = `${r.category}_${r.itemName}`;
      if (!bests[key]) {
        bests[key] = r;
      } else {
        if (r.itemName === '최소 TR') {
          if (r.recordValue < bests[key].recordValue) bests[key] = r;
        } else {
          if (r.recordValue > bests[key].recordValue) bests[key] = r;
        }
      }
    });

    const specialAwardsList = Array.from(dynamicSpecialAwards).sort();

    const groups = [
      { id: '기본 기록', title: '기본 기록 (Max VP, Min/Max TR)', items: CORE_ITEMS },
      { id: '자원', title: '기본 자원', items: RESOURCE_ITEMS },
      { id: '생산력', title: '생산력', items: PRODUCTION_ITEMS },
      { id: '최대 태그', title: '최대 태그 수', items: TAG_ITEMS },
      { id: '특수자원', title: '특수 자원', isNested: true, subGroups: [
          { id: '특수자원_동물자원', title: '동물자원 (10+)', items: SPECIAL_RESOURCES['동물자원'] },
          { id: '특수자원_미생물자원', title: '미생물자원 (20+)', items: SPECIAL_RESOURCES['미생물자원'] },
          { id: '특수자원_부양체자원', title: '부양체자원 (10+)', items: SPECIAL_RESOURCES['부양체자원'] },
          { id: '특수자원_소행성 자원', title: '소행성 자원', items: SPECIAL_RESOURCES['소행성 자원'] },
          { id: '특수자원_과학자원', title: '과학자원', items: SPECIAL_RESOURCES['과학자원'] },
          { id: '특수자원_기타자원', title: '기타자원', items: SPECIAL_RESOURCES['기타자원'] }
      ]},
      { id: '기업상', title: '기업상', items: AWARD_ITEMS },
      { id: '특별상', title: '특별상', items: specialAwardsList }
    ];

    const result = [];
    groups.forEach(g => {
      if (g.isNested) {
        const nestedGroups = g.subGroups.map(sub => {
          const records = sub.items.map(item => {
            const key = `${sub.id}_${item}`;
            return bests[key] || { category: sub.title.split('_')[1] || sub.id, itemName: item, recordValue: '-', playerId: null, corps: [], is_empty: true, id: `empty_${key}` };
          });
          return { ...sub, records };
        });
        result.push({ category: g.id, title: g.title, isNested: true, subGroups: nestedGroups });
      } else {
        const records = g.items.map(item => {
          const key = `${g.id}_${item}`;
          return bests[key] || { category: g.id, itemName: item, recordValue: '-', playerId: null, corps: [], is_empty: true, id: `empty_${key}` };
        });
        result.push({ category: g.id, title: g.title, records });
      }
    });

    return result;
  }, [guinnessRecords, guinnessTab, selectedSeasonId, seasons]);


  // ==========================================
  // DB 저장 및 수정 핸들러
  // ==========================================
  const handleSaveSeason = async () => {
    if (!seasonName) return alert("시즌 이름을 입력하세요.");
    await supabase.from('seasons').insert([{ name: seasonName, start_date: seasonStart || null, end_date: seasonEnd || null }]);
    setSeasonName(''); setSeasonStart(''); setSeasonEnd(''); setIsSeasonModalOpen(false); fetchInitialData();
  };

  const openGameModal = (gameToEdit = null) => {
    if (gameToEdit) {
      setEditingGameId(gameToEdit.id); setNewGameDate(gameToEdit.date); 
      let loadedMap = gameToEdit.map;
      let sType = '나 홀로 화성에';
      if (gameToEdit.isSolo) {
        if (loadedMap.includes('[도전 TR왕]')) { sType = '도전 TR왕'; loadedMap = loadedMap.replace(' [도전 TR왕]', ''); }
        else if (loadedMap.includes('[나 홀로 화성에]')) { sType = '나 홀로 화성에'; loadedMap = loadedMap.replace(' [나 홀로 화성에]', ''); }
      }
      setNewGameMap(loadedMap); setSoloType(sType); 
      setGamePlayerCount(gameToEdit.isSolo ? 1 : gameToEdit.results.length);
      setSelectedExps(gameToEdit.expansions || []);
      setIsSoloMode(gameToEdit.isSolo || false);
      if (gameToEdit.isSolo && gameToEdit.results.length > 0) setSoloResult(gameToEdit.results[0].soloResult || '성공');
      setGameScores(gameToEdit.results.map(r => ({ playerId: r.playerId, corps: [...(r.corps||[])], score: r.score, mc: r.mc })));
    } else {
      setEditingGameId(null); setNewGameDate(new Date().toISOString().split('T')[0]); setNewGameMap('타르시스');
      setGamePlayerCount(4); setSelectedExps([...EXPANSIONS]); setIsSoloMode(false); setSoloType('나 홀로 화성에'); setSoloResult('성공');
      setGameScores([createEmptyScore(), createEmptyScore(), createEmptyScore(), createEmptyScore()]);
    }
    setIsNewGameModalOpen(true);
  };

  const handleSaveGame = async () => {
    if (gameScores.some(s => !s.playerId || !s.corps || s.corps.length === 0 || s.score === '')) return alert("참가자, 기업, 점수를 정확히 입력해주세요.");
    
    const finalMapName = isSoloMode ? `${newGameMap} [${soloType}]` : newGameMap;
    let finalResults = [];
    if (isSoloMode) {
      finalResults = [{ ...gameScores[0], rank: 1, score: soloResult === '성공' ? 1 : 0, ratingChange: 0 }];
    } else {
      let sorted = [...gameScores].sort((a,b) => b.score !== a.score ? b.score - a.score : b.mc - a.mc);
      let currentRank = 1;
      sorted = sorted.map((s, idx, arr) => {
        if (idx > 0 && s.score === arr[idx-1].score && s.mc === arr[idx-1].mc) {} else currentRank = idx + 1;
        return { ...s, rank: currentRank, rating: players.find(p => p.id === s.playerId)?.rating || 1500 };
      });
      finalResults = calculateMultiplayerELO(sorted);
    }

    try {
      if (editingGameId) {
        await supabase.from('games').update({ date: newGameDate, map_name: finalMapName, generation: 0, expansions: selectedExps, player_count: isSoloMode ? 1 : finalResults.length }).eq('id', editingGameId);
        await supabase.from('game_results').delete().eq('game_id', editingGameId);
        await supabase.from('game_results').insert(finalResults.map(r => ({ game_id: editingGameId, player_id: r.playerId, corps: r.corps, score: r.score, mc: r.mc, rank: r.rank, rating_change: r.ratingChange })));
      } else {
        const { data: newGame, error: gameErr } = await supabase.from('games').insert([{ season_id: selectedSeasonId === 'all' ? null : selectedSeasonId, date: newGameDate, map_name: finalMapName, generation: 0, expansions: selectedExps, player_count: isSoloMode ? 1 : finalResults.length }]).select().single();
        if (gameErr) throw gameErr;
        await supabase.from('game_results').insert(finalResults.map(r => ({ game_id: newGame.id, player_id: r.playerId, corps: r.corps, score: r.score, mc: r.mc, rank: r.rank, rating_change: r.ratingChange })));
      }
      setIsNewGameModalOpen(false); fetchInitialData();
    } catch(e) { alert("저장 실패: " + e.message); }
  };

  const handleDeleteGame = async (id) => {
    if (window.confirm("대국을 삭제하시겠습니까? (통계 제외, DB 보존)")) {
      await supabase.from('games').update({ is_active: false }).eq('id', id); fetchInitialData();
    }
  };

  // ==========================================
  // 💡 기네스 일괄 등록 및 승인 로직 (대국 연동 스마트화)
  // ==========================================
  
  const gameOptions = useMemo(() => {
    return filteredGames.map(g => {
      const exps = g.expansions?.length === EXPANSIONS.length ? '풀확장' : (g.expansions?.length > 0 ? g.expansions.join(',') : '기본판');
      const pCountInt = g.isSolo ? 1 : g.results.length;
      const pNames = g.results.map(r => {
        const p = players.find(x=>x.id === r.playerId);
        return p ? `${p.name}${p.alphabet||'A'}` : '';
      }).join(', ');
      return { 
        value: g.id, 
        label: `${g.date} | ${g.map.split(' ')[0]} | ${exps} | ${pCountInt}인 | ${pNames}`,
        pCountInt, date: g.date, results: g.results, isSolo: g.isSolo
      };
    });
  }, [filteredGames, players]);

  const selectedGameObj = useMemo(() => {
    return gameOptions.find(g => g.value === gGameId) || null;
  }, [gGameId, gameOptions]);

  const handleAddToGuinnessBatch = () => {
    if (!gItem || gValue === '' || !gGameId || gPlayerIds.length === 0) return alert("대국과 공동 달성 개척자(들)를 선택하고, 수치를 입력해주세요.");
    
    // 💡 숫자가 아닌 문자열이면 그대로 문자열로 저장, 숫자면 Number로 변환
    const val = isNaN(Number(gValue)) ? gValue : Number(gValue);
    
    if ((gCategory === '생산력' || gCategory === '자원') && typeof val === 'number' && val < 10) return alert("생산력 및 기본 자원은 10 이상부터 가능합니다.");
    if (gCategory === '특수자원' && typeof val === 'number') {
      if (gSubCategory === '동물자원' && val < 10) return alert("동물자원은 10개 이상부터 가능합니다.");
      if (gSubCategory === '부양체자원' && val < 10) return alert("부양체자원은 10개 이상부터 가능합니다.");
      if (gSubCategory === '미생물자원' && val < 20) return alert("미생물자원은 20개 이상부터 가능합니다.");
    }

    const combinedCorps = gPlayerIds.flatMap(pid => {
      const pResult = selectedGameObj.results.find(r => r.playerId === pid);
      return pResult ? pResult.corps : [];
    });

    const newItem = {
      id: Date.now() + Math.random(),
      category: gCategory,
      subCategory: gCategory === '특수자원' ? gSubCategory : null,
      itemName: gItem,
      recordValue: val,
      playerCount: selectedGameObj.pCountInt,
      date: selectedGameObj.date,
      gameId: gGameId,
      playerId: gPlayerIds.join(','), // 공동 달성자 ID를 쉼표로 연결
      corps: combinedCorps // 공동 달성자들의 기업 배열 병합
    };

    setGuinnessBatch([...guinnessBatch, newItem]);
    setGValue(''); 
    if (gCategory === '특별상') setGItem('');
    setShowGInput(false); 
  };

  const handleRemoveFromGuinnessBatch = (id) => {
    setGuinnessBatch(guinnessBatch.filter(b => b.id !== id));
  };

  const handleSaveGuinnessBatch = async () => {
    if (guinnessBatch.length === 0) return alert("추가할 기록이 없습니다.");

    const finalBatch = [];
    let rejectedCount = 0;

    for (let b of guinnessBatch) {
      const saveCategory = b.category === '특수자원' ? `특수자원_${b.subCategory}` : b.category;
      
      const currentBest = guinnessRecords.find(r => r.category === saveCategory && r.itemName === b.itemName && r.playerCount === b.playerCount && r.is_approved && !r.is_hall_of_fame);
      let isBetter = true;
      
      if (currentBest) {
        const bVal = parseFloat(b.recordValue);
        const currVal = parseFloat(currentBest.recordValue);
        
        // 💡 만약 어느 하나라도 문자열(NaN)이라면 단순 크기 비교가 불가하므로 무조건 승인 대기열로 올립니다 (관리자 판단)
        if (isNaN(bVal) || isNaN(currVal)) {
          isBetter = true;
        } else {
          if (b.itemName === '최소 TR') isBetter = bVal < currVal;
          else isBetter = bVal > currVal;
        }
      }

      if (isBetter) {
        finalBatch.push({
          player_count: b.playerCount, category: saveCategory, item_name: b.itemName, record_value: b.recordValue, 
          player_id: b.playerId, corps: b.corps, game_id: b.gameId, date: b.date,
          is_approved: isAdminOrMaster, // 💡 관리자가 등록할 때도 즉시 승인되도록 수정
          is_hall_of_fame: false
        });
      } else {
        rejectedCount++;
      }
    }

    if (finalBatch.length === 0) return alert("입력하신 모든 기록이 현재 1위 기록과 같거나 낮아 등록이 취소되었습니다.");
    
    // 💡 에러 발생 시 사용자에게 즉각 팝업으로 원인을 알려주도록 try-catch 역할 추가
    const { error } = await supabase.from('guinness_records').insert(finalBatch);
    if (error) {
      alert(`DB 저장 중 오류가 발생했습니다.\n(원인: ${error.message})\n\n※ DB에 숫자형(numeric)으로 세팅된 항목에 문자를 넣으려 시도했다면 에러가 납니다.`);
      return;
    }

    if (rejectedCount > 0) alert(`${rejectedCount}개의 기록은 기존 1위보다 낮아 제외되었습니다. 나머지 ${finalBatch.length}개 서버 등록 완료!`);
    else if (!isAdminOrMaster) alert("서버에 전송 완료! 관리자의 승인 후 갱신됩니다.");
    else alert("기네스 등록이 성공적으로 완료되었습니다!");

    setIsGuinnessModalOpen(false); 
    setGuinnessBatch([]); setGPlayerIds([]); setGGameId(''); 
    fetchInitialData();
  };

  const handleApproveGuinness = async (recordId, isApproved) => {
    if (isApproved) await supabase.from('guinness_records').update({ is_approved: true }).eq('id', recordId);
    else await supabase.from('guinness_records').update({ is_active: false }).eq('id', recordId);
    fetchInitialData();
  };

  const handleToggleHallOfFame = async (recordId, currentStatus) => {
    await supabase.from('guinness_records').update({ is_hall_of_fame: !currentStatus }).eq('id', recordId);
    fetchInitialData();
  };

  // 💡 기네스 기록 삭제 함수 추가
  const handleDeleteGuinnessRecord = async (recordId) => {
    if (window.confirm("해당 기네스 기록을 삭제하시겠습니까? (삭제 시 복구 불가)")) {
      await supabase.from('guinness_records').update({ is_active: false }).eq('id', recordId);
      fetchInitialData();
      setSelectedGuinnessHistory(null);
    }
  };

  // ==========================================
  // 폼 UI 헬퍼
  // ==========================================
  const toggleExp = (exp) => setSelectedExps(prev => prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]);
  const playerOptions = players.map(p => ({ value: p.id, label: `${p.name}${p.alphabet||'A'}` }));

  if (isLoading) return <div className={`h-screen flex flex-col items-center justify-center ${THEME_BG} font-bold text-orange-500 gap-4`}><Rocket className="animate-bounce" size={48}/> 화성 데이터 수신 중...</div>;

  return (
    <div className={`flex flex-col h-screen ${THEME_BG} font-sans relative overflow-hidden ${THEME_TEXT_PRIMARY}`}>
      
      {/* 🔹 상단 헤더 */}
      <header className={`${THEME_PANEL} border-b border-orange-900/50 p-4 pt-10 shadow-lg z-20 shrink-0`}>
        <div className="flex items-center justify-between mb-3 min-h-[36px]">
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Rocket size={22} className={ACCENT_ORANGE}/> 
            {activeNav === '업데이트' ? '패치 노트' : activeNav === '기록' ? '개척 일지' : activeNav === '랭킹' ? '기업가 랭킹' : activeNav === '통계' ? '화성 통계' : '기네스 북'}
          </h1>
          <div className="flex items-center gap-1.5">
            {/* 1. 마작 사이트 이동 (주황/갈색 테마) */}
            <button 
              onClick={() => window.open('https://mahjong-record-v2.vercel.app/', '_blank')}
              className="flex items-center gap-1.5 text-[11px] bg-orange-700/80 px-2.5 py-1.5 rounded-lg font-black text-white hover:bg-orange-600 transition-colors shadow-sm"
              title="마작 기록실로 이동"
            >
              <span className="text-[12px] leading-none -mt-0.5">🀄</span> 마작
            </button>

            {currentUser ? (
              <>
                {/* 2. 로그인명 (녹색 테마 + 마스터 왕관) */}
                <div className="flex items-center gap-1.5 text-[11px] bg-emerald-800/80 px-2.5 py-1.5 rounded-lg font-black text-white shadow-sm">
                  {isMaster && <Crown size={14} className="text-yellow-400" />}
                  {currentUser.username}
                </div>

                {/* 3. 시즌 관리 (녹색 테마) */}
                {isAdminOrMaster && (
                  <button onClick={() => setIsSeasonModalOpen(true)} className="p-1.5 bg-emerald-800/80 rounded-lg hover:bg-emerald-700 text-white transition-colors shadow-sm" title="시즌 관리">
                    <Settings size={14}/>
                  </button>
                )}

                {/* 4. 마스터/관리자 관리 보드 (노란/오렌지 테마) */}
                {isAdminOrMaster && (
                  <button onClick={() => setIsMasterModalOpen(true)} className="p-1.5 bg-amber-600/90 rounded-lg hover:bg-amber-500 text-white transition-colors relative shadow-sm" title="통합 관리 보드">
                    <Users size={14}/>
                    {(guinnessRecords.filter(r=>!r.is_approved).length > 0 || (isMaster && allUsers.filter(u=>!u.is_approved).length > 0)) && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-slate-900"/>
                    )}
                  </button>
                )}

                {/* 5. 로그아웃 (녹색 테마 + 노란 자물쇠 아이콘) */}
                <button onClick={handleLogout} className="p-1.5 bg-emerald-800/80 rounded-lg hover:bg-emerald-700 text-yellow-400 transition-colors shadow-sm" title="로그아웃">
                  <Unlock size={14}/>
                </button>
              </>
            ) : (
              <button onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} className="flex items-center gap-1 text-[10px] bg-orange-600 px-3 py-1.5 rounded-lg font-bold text-white hover:bg-orange-500"><Lock size={12}/> 로그인</button>
            )}
          </div>
        </div>
        {activeNav !== '업데이트' && (
          <select value={selectedSeasonId} onChange={e=>setSelectedSeasonId(e.target.value)} className={`w-full p-2.5 ${THEME_CARD} border ${THEME_BORDER} rounded-lg text-sm font-bold outline-none text-orange-400 shadow-inner`}>
            {seasons.map(s => <option key={s.id} value={s.id}>{s.name} {s.start_date ? `(${s.start_date} ~ ${s.end_date||'진행중'})` : ''}</option>)}
          </select>
        )}
      </header>

      {/* 🔹 메인 컨텐츠 영역 */}
      <main className="flex-1 overflow-y-auto flex flex-col relative pb-36 scrollbar-hide">
        
        {/* 탭 1: 기록 */}
        {activeNav === '기록' && (
          <div className="p-4 space-y-4 animate-in fade-in duration-300">
            {!canWrite && currentUser && <div className="bg-orange-900/20 border border-orange-500/30 p-3 rounded-lg text-xs text-orange-400 font-bold flex items-center gap-2"><Lock size={14}/> 권한 승인 대기 중 (기록은 마스터만 가능)</div>}
            {filteredGames.length === 0 ? <div className={`mt-20 text-center ${THEME_TEXT_MUTED} font-bold`}>해당 시즌에 기록된 대국이 없습니다.</div> : 
              filteredGames.map(g => (
              <div key={g.id} className={`${THEME_CARD} p-4 rounded-3xl shadow-xl ${THEME_BORDER} border relative`}>
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-xs font-bold ${THEME_TEXT_MUTED}`}>{g.date}</span>
                  <div className="flex gap-1.5">
                    {g.isSolo && <span className="text-[10px] bg-purple-900/50 border border-purple-700 text-purple-300 px-2 py-0.5 rounded font-bold">1인 챌린지</span>}
                    <span className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold">{g.map}</span>
                  </div>
                </div>
                {g.expansions && g.expansions.length > 0 && <div className="text-[9px] text-orange-500/80 font-bold mb-4 flex gap-1 flex-wrap">{g.expansions.map(e => <span key={e} className="border border-orange-900/50 px-1.5 py-0.5 rounded bg-orange-900/10">{e}</span>)}</div>}
                
                <div className="space-y-2.5">
                  {(g.results || []).sort((a,b)=>(a.rank||99) - (b.rank||99)).map(r => (
                    <div key={r.playerId} onClick={()=>setSelectedPlayerIdForStats(r.playerId)} className={`flex justify-between items-center ${THEME_PANEL} p-3 rounded-2xl border ${THEME_BORDER} cursor-pointer hover:border-orange-500/50 transition-colors`}>
                      <div className="flex items-center gap-3">
                        {!g.isSolo && <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${r.rank===1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-slate-900 shadow-lg shadow-yellow-500/20' : r.rank===2 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>{r.rank}</div>}
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-200 hover:text-orange-400 transition-colors">{players.find(p=>p.id===r.playerId)?.name || r.playerId}</span>
                          <span className="text-[10px] text-slate-400 font-bold mt-0.5">{(r.corps||[]).join(' + ')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-black ${ACCENT_ORANGE}`}>{g.isSolo ? (r.score===1 ? '성공' : '실패') : r.score + ' VP'}</span>
                        {/* 💡 요청하신 대로 ELO 점수와 등락을 한 줄에 깔끔하게 표기 */}
                        {!g.isSolo && (
                          <span className={`text-[10px] font-black ${r.ratingChange >= 0 ? 'text-green-500' : 'text-red-500'} mt-0.5`}>
                            {r.newRating} ({r.ratingChange >= 0 ? '▲' : '▼'} {Math.abs(r.ratingChange||0)})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {isAdminOrMaster && (
                  <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-700">
                    <button onClick={() => openGameModal(g)} className="text-[11px] font-bold text-slate-400 hover:text-orange-400 flex items-center gap-1 transition-colors"><Edit size={14}/>수정</button>
                    <button onClick={() => handleDeleteGame(g.id)} className="text-[11px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"><Trash2 size={14}/>삭제</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 탭 2: 랭킹 */}
        {activeNav === '랭킹' && (
          <div className="p-4 animate-in slide-in-from-right duration-300">
            <div className={`${THEME_CARD} rounded-3xl border ${THEME_BORDER} overflow-hidden shadow-2xl`}>
              <table className="w-full text-sm text-center">
                <thead className="bg-slate-900 font-black text-slate-400 border-b border-slate-700 uppercase tracking-widest text-[10px]">
                  <tr><th className="p-4">Rank</th><th className="p-4 text-left">Pioneer</th><th className="p-4">Win Rate</th><th className="p-4 text-orange-500">ELO</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {Object.values(playerStatsEngine).filter(p=>p.gamesPlayed>0).sort((a,b)=>b.currentRating-a.currentRating).map((p,i)=>(
                    <tr key={p.id} onClick={()=>setSelectedPlayerIdForStats(p.id)} className="hover:bg-slate-700/30 cursor-pointer transition-colors active:scale-95">
                      <td className="p-4 text-slate-500 font-black">{i+1}</td>
                      <td className="p-4 font-black text-left text-slate-200 flex items-center gap-2">{i===0 && <Medal size={16} className="text-yellow-500 drop-shadow-md"/>}{p.name}</td>
                      <td className="p-4 text-slate-400 font-bold">{Math.round((p.wins/p.gamesPlayed)*100)}%</td>
                      <td className={`p-4 font-black ${ACCENT_ORANGE} text-base`}>{p.currentRating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {Object.values(playerStatsEngine).filter(p=>p.gamesPlayed>0).length === 0 && <p className="text-center text-xs text-slate-500 p-6 font-bold">등록된 유저가 없습니다.</p>}
            </div>
          </div>
        )}

        {/* 탭 3: 전체 통계 */}
        {activeNav === '통계' && (
          <div className="p-4 space-y-4 animate-in fade-in">
            <div className={`${THEME_CARD} p-5 rounded-3xl border border-slate-700 shadow-2xl`}>
              <h3 className="text-sm font-black text-white mb-5 flex items-center gap-2 border-b border-slate-700 pb-3"><PieChart size={18} className={ACCENT_ORANGE}/> 기업 데이터 분석표</h3>
              <div className="space-y-3">
                {globalCorpStats.map(c => (
                  <div key={c.name} className="bg-slate-900 p-4 rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-colors flex flex-col cursor-pointer" onClick={() => setExpandedCorpStats(expandedCorpStats === c.name ? null : c.name)}>
                    <div className="flex justify-between items-center w-full">
                      <div className="flex-1 pr-3">
                        <span className="text-sm font-black block text-slate-200 mb-1">{c.name}</span>
                        <span className="text-[10px] text-slate-500 font-bold">최다 기용: {players.find(p=>p.id===Object.entries(c.players).sort((a,b)=>b[1]-a[1])[0][0])?.name || '-'}</span>
                      </div>
                      <div className="text-right border-l border-slate-800 pl-4">
                        <span className="text-sm font-black text-orange-500 block mb-0.5">{Math.round((c.wins/c.plays)*100)}% 승률</span>
                        <span className="text-[10px] text-slate-500 font-bold">{c.plays}회 참여</span>
                      </div>
                    </div>
                    {expandedCorpStats === c.name && (
                      <div className="mt-4 pt-3 border-t border-slate-700/50 w-full animate-in fade-in slide-in-from-top-2">
                        <div className="text-[10px] text-slate-400 font-bold mb-2 uppercase tracking-widest">개척자별 사용 횟수</div>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(c.players).sort((a,b)=>b[1]-a[1]).map(([pId, count]) => (
                            <div key={pId} className="flex justify-between items-center bg-slate-800 px-3 py-2 rounded-xl text-xs">
                              <span className="text-slate-300 font-bold truncate">{players.find(p=>p.id === pId)?.name || pId}</span>
                              <span className="text-orange-400 font-black">{count}회</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 탭 4: 기네스 */}
        {activeNav === '기네스' && (
          <div className="flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex bg-slate-900 border-b border-slate-700 overflow-x-auto scrollbar-hide sticky top-0 z-30 shadow-md">
              {GUINNESS_TABS.map(t => <button key={t} onClick={()=>setGuinnessTab(t)} className={`px-5 py-4 font-black text-xs whitespace-nowrap transition-colors ${guinnessTab===t?'text-orange-500 border-b-2 border-orange-500 bg-orange-500/10':'text-slate-500 hover:text-slate-300'} ${t==='명예의전당' && 'text-yellow-600'}`}>{t==='명예의전당'?<span className="flex items-center gap-1"><Crown size={14}/>명예의 전당</span>:t}</button>)}
            </div>
            
            <div className="p-4 space-y-6">
              {/* 💡 명예의 전당 카드뉴스 렌더링 분기 */}
              {guinnessTab === '명예의전당' ? (
                <div className="space-y-4 pt-2">
                  {displayedGuinnessGroups[0]?.records?.length > 0 ? displayedGuinnessGroups[0].records.map((r) => (
                    <div key={r.id} className="relative bg-gradient-to-br from-yellow-900 via-slate-900 to-slate-900 p-6 rounded-[2rem] border border-yellow-500/30 shadow-[0_10px_30px_rgba(234,179,8,0.15)] overflow-hidden group">
                      <Crown className="absolute -right-6 -bottom-6 w-36 h-36 text-yellow-500/10 rotate-12" />
                      
                      {/* 💡 관리자 권한: 영구 삭제 버튼은 없애고, 안전하게 '일반 기록 강등' 기능만 제공 */}
                      {isAdminOrMaster && (
                        <div className="absolute top-4 right-4 flex gap-2 z-20 transition-all opacity-0 group-hover:opacity-100">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleToggleHallOfFame(r.id, r.is_hall_of_fame); }} 
                            className="bg-slate-950/80 px-3 py-2 rounded-xl text-slate-400 hover:text-yellow-500 border border-slate-800 text-[10px] font-black flex items-center gap-1.5" 
                            title="명예의 전당 타이틀을 박탈하고 일반 기네스 기록으로 돌려보냅니다."
                          >
                            <ChevronDown size={14} strokeWidth={3}/> 일반 기록으로 강등
                          </button>
                        </div>
                      )}

                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-yellow-500 text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">{r.category.split('_')[1] || r.category}</span>
                          <span className="text-yellow-500/50 text-xs font-bold mr-8">{r.date}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-100 mb-1">{r.itemName}</h3>
                        <div className="text-5xl font-black text-yellow-400 drop-shadow-md mb-6">{r.recordValue}</div>
                        <div className="flex items-center gap-3 border-t border-yellow-500/20 pt-4">
                           <div className="flex-1">
                             <div className="text-[10px] text-yellow-600 font-black mb-1 uppercase tracking-widest">Pioneer</div>
                             <div className="text-lg font-black text-white">{(r.playerId||'').split(',').map(id => players.find(p=>p.id===id)?.name || id).join(', ')}</div>
                           </div>
                           <div className="text-right">
                             <div className="text-[10px] text-yellow-600 font-black mb-1 uppercase tracking-widest">Corporation</div>
                             <div className="text-sm font-bold text-yellow-200">{(r.corps||[]).join(' + ')}</div>
                           </div>
                        </div>
                      </div>
                    </div>
                  )) : <p className="text-center text-slate-500 font-bold py-10">등록된 불멸의 기록이 없습니다.</p>}
                </div>
              ) : (
                /* 일반 기네스 그룹핑 렌더링 */
                displayedGuinnessGroups.map(group => (
                  <div key={group.category} className="space-y-3">
                    <div onClick={() => setExpandedCats(prev => ({...prev, [group.category]: !prev[group.category]}))} className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-md cursor-pointer hover:border-orange-500/50 transition-colors">
                      <h2 className="text-sm font-black text-orange-500">{group.title}</h2>
                      <span className="text-slate-400">{expandedCats[group.category] ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}</span>
                    </div>

                    {(group.category === '기본 기록' || expandedCats[group.category]) && (
                      <div className="space-y-3 pl-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        {group.isNested ? (
                          group.subGroups.map(sub => (
                            <div key={sub.id} className="space-y-2.5">
                              <div onClick={() => setExpandedCats(prev => ({...prev, [sub.id]: !prev[sub.id]}))} className="flex justify-between items-center bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-700 transition-colors ml-2">
                                <h3 className="text-xs font-black text-slate-300">{sub.title}</h3>
                                <span className="text-slate-500">{expandedCats[sub.id] ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</span>
                              </div>
                              {expandedCats[sub.id] && (
                                <div className="space-y-2.5 pl-4 animate-in fade-in duration-200">
                                  {sub.records.map((r, idx) => (
                                    <div key={r.id || idx} onClick={() => !r.is_empty && setSelectedGuinnessHistory(r)} className={`${THEME_CARD} p-3.5 rounded-2xl border border-slate-700 flex justify-between items-center relative transition-transform ${r.is_empty ? 'opacity-30 grayscale' : 'shadow-md hover:border-orange-700 cursor-pointer active:scale-[0.98]'}`}>
                                      <div className="flex-1 pr-2">
                                        <h4 className="text-sm font-bold text-slate-100">{r.itemName}</h4>
                                        <p className="text-[10px] text-slate-500 mt-1 font-medium">{(r.corps||[]).join(' + ') || (r.is_empty ? '공석' : '-')}</p>
                                      </div>
                                      <div className="flex flex-col items-end">
                                        <span className={`text-xl font-black ${r.is_empty ? 'text-slate-500' : ACCENT_ORANGE}`}>{r.recordValue}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{r.is_empty ? '기록 없음' : (r.playerId||'').split(',').map(id => players.find(p=>p.id===id)?.name || id).join(', ')}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          group.records.map((r, idx) => (
                            <div key={r.id || idx} onClick={() => !r.is_empty && setSelectedGuinnessHistory(r)} className={`${THEME_CARD} p-4 rounded-2xl border border-slate-700 flex justify-between items-center relative transition-transform ${r.is_empty ? 'opacity-30 grayscale' : 'shadow-md hover:border-orange-700 cursor-pointer active:scale-[0.98]'}`}>
                              <div className="flex-1 pr-2">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-black inline-block uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-300`}>{r.category.split('_')[1] || r.category}</span>
                                  {guinnessTab === '통합' && !r.is_empty && <span className="text-[9px] bg-orange-900/30 text-orange-400 border border-orange-900/50 px-2 py-0.5 rounded-md font-black inline-block">{r.playerCount}인 달성</span>}
                                  {r.category === '기업상' && <button onClick={(e)=>{e.stopPropagation(); setShowAwardInfo(showAwardInfo===r.itemName?null:r.itemName);}} className="text-orange-500/70 p-1 hover:text-orange-400 z-10"><Info size={16}/></button>}
                                </div>
                                <h3 className="text-base font-black text-slate-100">{r.itemName}</h3>
                                <p className="text-[11px] text-slate-500 mt-1 font-bold">{(r.corps||[]).join(' + ') || (r.is_empty ? '공석' : '-')}</p>
                                
                                {showAwardInfo === r.itemName && (
                                  <div className="absolute left-4 top-16 z-[110] bg-slate-800 text-slate-200 text-xs p-4 rounded-2xl shadow-2xl w-[280px] animate-in zoom-in border border-orange-500/50">
                                    <div className="font-black text-orange-500 border-b border-slate-700 mb-2 pb-2 flex items-center justify-between">수상 조건 <X size={14} className="cursor-pointer text-slate-500 hover:text-white" onClick={()=>setShowAwardInfo(null)}/></div>
                                    <div className="leading-relaxed font-medium">{AWARD_GUIDE[r.itemName]}</div>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end">
                                <span className={`text-2xl font-black ${r.is_empty ? 'text-slate-500' : ACCENT_ORANGE}`}>{r.recordValue}</span>
                                <span className="text-xs font-bold text-slate-400 mt-1">{r.is_empty ? '기록 없음' : (r.playerId||'').split(',').map(id => players.find(p=>p.id===id)?.name || id).join(', ')}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {canWrite && (
              <div className="fixed bottom-28 right-6 z-20">
                <button onClick={() => {
                  setIsGuinnessModalOpen(true);
                  setGCategory('기본 기록'); setGItem(CORE_ITEMS[0]); setGValue('');
                  setGGameId(''); setGPlayerIds([]); 
                  setGuinnessBatch([]); setShowGInput(true);
                }}
                className={`bg-gradient-to-tr from-yellow-600 to-yellow-400 text-slate-950 px-5 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform active:scale-95 flex items-center gap-2 font-black text-sm`}>
                  <ListPlus size={20} strokeWidth={3}/> 신기록 일괄 등록
                </button>
              </div>
            )}
          </div>
        )}

        {/* 탭 5: 업데이트 로그 */}
        {activeNav === '업데이트' && (
          <div className="p-4 space-y-4">
            <div className={`${THEME_CARD} p-6 rounded-3xl shadow-2xl ${THEME_BORDER} border`}>
              <div className="flex items-center justify-between mb-5 border-b border-slate-700 pb-4">
                <span className="font-black text-orange-500 text-xl tracking-tight">v1.9.5 - UI Overhaul</span>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">2026.03.16</span>
              </div>
              <ul className="text-sm text-slate-300 space-y-4 list-disc list-inside font-bold leading-relaxed">
                  <li>시작.</li>
              </ul>
            </div>
          </div>
        )}

        {/* 대국 추가 FAB */}
        {activeNav === '기록' && canWrite && (
          <div className="fixed bottom-28 right-6 z-20">
            <button onClick={() => openGameModal(null)} className={`${ACCENT_BG} text-white p-5 rounded-full shadow-2xl hover:bg-orange-500 transition-transform active:scale-95`}>
              <Plus size={32} strokeWidth={3}/>
            </button>
          </div>
        )}
      </main>

      {/* --- 하단 네비게이션 --- */}
      <nav className={`fixed bottom-0 w-full ${THEME_PANEL} border-t ${THEME_BORDER} flex justify-around p-3 pb-8 z-[140] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]`}>
        {[ { id:'기록', i:Map }, { id:'랭킹', i:Trophy }, { id:'통계', i:BarChart2 }, { id:'기네스', i:Star }, { id:'업데이트', i:Bell } ].map(n => (
          <button key={n.id} onClick={() => setActiveNav(n.id)} className={`flex flex-col items-center p-2 transition-all ${activeNav === n.id ? ACCENT_ORANGE + ' scale-110 drop-shadow-md' : 'text-slate-500 hover:text-slate-400'}`}><n.i size={24}/><span className="text-[10px] mt-1.5 font-black uppercase tracking-widest">{n.id}</span></button>
        ))}
      </nav>

      {/* =========================================================================
         💡 모달 레이어
      ========================================================================== */}

      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[250] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
          <div className={`${THEME_CARD} w-full max-w-sm rounded-3xl p-8 relative shadow-2xl border border-orange-500/20`}>
            <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24}/></button>
            <div className="flex mb-8 border-b border-slate-700/50">
              <button onClick={() => setAuthMode('login')} className={`flex-1 pb-3 text-sm font-black transition-all ${authMode==='login'?'text-orange-500 border-b-2 border-orange-500':'text-slate-500'}`}>로그인</button>
              <button onClick={() => setAuthMode('signup')} className={`flex-1 pb-3 text-sm font-black transition-all ${authMode==='signup'?'text-orange-500 border-b-2 border-orange-500':'text-slate-500'}`}>계정생성</button>
            </div>
            <div className="space-y-5">
              <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 ml-1">이름</span><input type="text" placeholder="예: 홍길동" value={authUsername} onChange={e=>setAuthUsername(e.target.value)} className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-orange-500 font-bold"/></div>
              <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 ml-1">비밀 PIN (4자리)</span><input type="password" maxLength={4} placeholder="숫자만 입력" value={authPin} onChange={e=>setAuthPin(e.target.value)} className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-orange-500 font-black"/></div>
              {authMode==='signup' && <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 ml-1">권한 구분</span><select value={authRoleReq} onChange={e=>setAuthRoleReq(e.target.value)} className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none font-bold"><option>개척자</option><option>관리자</option></select></div>}
              <button onClick={authMode==='login'?handleLogin:handleSignup} className={`w-full ${ACCENT_BG} text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-transform mt-2`}>{authMode==='login'?'시스템 접속':'개척자 등록'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 대국 추가 폼 모달 (기업 UI 색상으로만 표시 적용) */}
      {isNewGameModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex flex-col justify-end animate-in slide-in-from-bottom duration-300">
          <div className={`${THEME_BG} w-full h-[95%] rounded-t-[2.5rem] flex flex-col shadow-2xl border-t border-slate-700 overflow-hidden`}>
            <div className={`${THEME_PANEL} p-6 flex justify-between items-center border-b border-slate-800`}>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Operation Mars</span>
                <h2 className="text-2xl font-black text-white">{editingGameId ? '기록 정정' : '화성 개척 완료'}</h2>
              </div>
              <button onClick={() => setIsNewGameModalOpen(false)} className="bg-slate-800 p-2.5 rounded-full text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-6 scrollbar-hide pb-10">
              
              <div className={`${THEME_CARD} p-5 rounded-3xl border ${THEME_BORDER} shadow-xl space-y-5`}>
                <div className="space-y-1.5"><span className="text-[10px] font-black text-slate-500 ml-1 uppercase">Date</span><input type="date" value={newGameDate} onClick={e => e.target.showPicker && e.target.showPicker()} onChange={e=>setNewGameDate(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white color-scheme-dark outline-none focus:border-orange-500 cursor-pointer"/></div>

                <div className="space-y-2.5 pt-2">
                  <span className="text-[10px] font-black text-slate-500 block ml-1 uppercase tracking-widest">Map</span>
                  <div className="flex flex-wrap gap-2">
                    {MAPS.map(m => (
                      <button key={m} type="button" onClick={() => setNewGameMap(m)} className={`px-3 py-2 text-xs font-black rounded-xl border transition-all ${newGameMap === m ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300 hover:bg-slate-800'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2.5 pt-3 border-t border-slate-700/50"><span className="text-[10px] font-black text-slate-500 block ml-1 uppercase tracking-widest">Expansions</span><div className="flex flex-wrap gap-2">{EXPANSIONS.map(exp => <button key={exp} onClick={() => toggleExp(exp)} className={`px-3 py-2 text-xs font-black rounded-xl border transition-all ${selectedExps.includes(exp) ? 'bg-orange-600 text-white border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>{exp}</button>)}</div></div>
              </div>

              <div className="bg-slate-900 p-4 border border-slate-700 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 ml-1"><div className={`w-2.5 h-2.5 rounded-full ${isSoloMode?'bg-purple-500 shadow-[0_0_10px_#a855f7]':'bg-green-500 shadow-[0_0_10px_#22c55e]'}`}/> <span className="text-sm font-black text-slate-200">플레이 인원 선택</span></div>
                <div className="flex gap-2">
                  <button onClick={() => setIsSoloMode(true)} className={`flex-1 py-3 rounded-2xl text-xs font-black border transition-all ${isSoloMode ? 'bg-purple-900/40 text-purple-300 border-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>1인 솔로</button>
                  {[2,3,4,5].map(num => (
                    <button key={num} onClick={() => { setIsSoloMode(false); setGamePlayerCount(num); }} className={`flex-1 py-3 rounded-2xl text-xs font-black border transition-all ${!isSoloMode && gamePlayerCount === num ? 'bg-green-900/40 text-green-300 border-green-600 shadow-[0_0_15px_rgba(22,163,74,0.3)]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>{num}인</button>
                  ))}
                </div>
              </div>

              {isSoloMode && (
                <div className="flex gap-3 animate-in slide-in-from-top-4 duration-300">
                  <button onClick={() => setSoloType('나 홀로 화성에')} className={`flex-1 py-3.5 rounded-2xl text-xs font-black border transition-all ${soloType === '나 홀로 화성에' ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>나 홀로 화성에 (기본)</button>
                  <button onClick={() => setSoloType('도전 TR왕')} className={`flex-1 py-3.5 rounded-2xl text-xs font-black border transition-all ${soloType === '도전 TR왕' ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>도전 TR왕 (서곡)</button>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-end px-1"><h3 className="font-black text-orange-500 text-sm flex items-center gap-1.5"><Users size={18}/> 참가자별 최종 결과</h3></div>
                
                {gameScores.map((score, idx) => (
                  <div key={idx} style={{ zIndex: 60 - idx }} className={`${THEME_CARD} p-5 rounded-3xl border ${THEME_BORDER} shadow-2xl relative`}>
                    <div className="mb-5 pr-2 space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">Player {idx + 1}</span>
                        <SearchableSelect 
                          selectedValue={score.playerId} 
                          onChange={val => { const n=[...gameScores]; n[idx].playerId=val; setGameScores(n); }} 
                          options={playerOptions} placeholder="개척자 이름 검색..." 
                          onAddNew={async (name) => { const newId = await handleAddNewPlayer(name); const n=[...gameScores]; n[idx].playerId=newId; setGameScores(n); }}
                          addNewLabel="신규 등록 (자동선택됨)"
                        />
                      </div>
                      
                      <div className="space-y-1.5 bg-slate-900/80 p-4 border border-slate-700 rounded-2xl relative">
                        <span className="text-[10px] font-black text-slate-500 block mb-3 uppercase tracking-widest">Corporations (Max 3)</span>
                        <CorporationGrid selectedExps={selectedExps} selectedCorps={score.corps || []} onChange={(newCorps) => { const n=[...gameScores]; n[idx].corps=newCorps; setGameScores(n); }} />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 space-y-1.5"><span className="text-[10px] text-slate-500 font-black block ml-1 uppercase tracking-widest">Final VP</span><input type="number" value={score.score} onChange={e=>{const n=[...gameScores]; n[idx].score=e.target.value; setGameScores(n);}} className="w-full p-3.5 bg-slate-950 border border-slate-600 rounded-xl text-2xl font-black text-orange-500 text-center outline-none focus:border-orange-500 shadow-inner"/></div>
                      {!isSoloMode ? (
                        <div className="w-1/3 space-y-1.5"><span className="text-[10px] text-slate-500 font-black block ml-1 text-center uppercase tracking-widest">Tie (MC)</span><input type="number" value={score.mc} onChange={e=>{const n=[...gameScores]; n[idx].mc=e.target.value; setGameScores(n);}} className="w-full p-3.5 bg-slate-900 border border-slate-600 rounded-xl text-base font-bold text-center outline-none text-slate-300 focus:border-slate-500 h-[64px] shadow-inner"/></div>
                      ) : (
                        <div className="w-1/3 space-y-1.5">
                          <span className="text-[10px] text-slate-500 font-black block ml-1 text-center uppercase tracking-widest">Result</span>
                          <button onClick={() => setSoloResult(prev => prev === '성공' ? '실패' : '성공')} className={`w-full p-3.5 rounded-xl border text-sm font-black transition-all h-[64px] ${soloResult === '성공' ? 'bg-green-900/30 text-green-400 border-green-700 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : 'bg-red-900/30 text-red-400 border-red-700 shadow-[0_0_15px_rgba(239,68,68,0.15)]'}`}>{soloResult}</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-6 ${THEME_PANEL} border-t ${THEME_BORDER} shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.4)]`}>
              <button onClick={handleSaveGame} className={`w-full ${ACCENT_BG} text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2 text-lg`}><Check size={24} strokeWidth={3}/> 대국 결과 영구 보존</button>
            </div>
          </div>
        </div>
      )}

      {/* 💡 기네스 일괄 등록 폼 (대국 연동 데이터 표시기능 강화) */}
      {isGuinnessModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[150] flex flex-col justify-end animate-in fade-in duration-300">
          <div className={`${THEME_BG} w-full rounded-t-[2.5rem] p-6 pb-12 border-t border-slate-700 shadow-2xl max-h-[92vh] flex flex-col`}>
            <div className="flex justify-between items-center mb-6 shrink-0"><h2 className="text-white font-black text-xl flex items-center gap-2"><ListPlus className="text-yellow-500" size={24}/> 기네스 일괄 등록</h2><button onClick={()=>setIsGuinnessModalOpen(false)} className="text-slate-500 hover:text-white bg-slate-800 p-1.5 rounded-full"><X size={20}/></button></div>
            
            <div className="flex-1 overflow-y-auto space-y-5 scrollbar-hide pb-6">
              
              <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-700 shadow-inner space-y-5">
                <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-3"><div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]"></div><span className="text-xs font-black text-slate-300 uppercase tracking-widest">Common Settings</span></div>
                
                <div className="space-y-1.5 z-50 relative">
                  <span className="text-[10px] font-black text-slate-500 ml-1 uppercase">Reference Game (필수)</span>
                  <select value={gGameId} onChange={e=>{setGGameId(e.target.value); setGPlayerIds([]);}} className="w-full p-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-300 text-xs font-bold outline-none shadow-inner"><option value="">-- 증명용 대국을 선택하세요 --</option>{gameOptions.map(g=><option key={g.value} value={g.value}>{g.label}</option>)}</select>
              </div>

              {gGameId && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <span className="text-[10px] font-black text-slate-500 ml-1 uppercase">Select Pioneer (다중 선택 가능)</span>
                  <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-1">
                    {gameOptions.find(g => g.value === gGameId)?.results.map((r) => {
                      const pName = players.find(p=>p.id === r.playerId)?.name || 'Unknown';
                      const isSelected = gPlayerIds.includes(r.playerId);
                      return (
                        <button 
                          key={r.playerId} 
                          onClick={() => setGPlayerIds(prev => prev.includes(r.playerId) ? prev.filter(id => id !== r.playerId) : [...prev, r.playerId])}
                          className={`px-4 py-3 rounded-xl text-xs font-black shrink-0 transition-all shadow-md ${isSelected ? 'bg-orange-600 text-white border border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700'}`}
                        >
                          {pName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* 💡 다중 선택된 플레이어들의 데이터 출력 패널 (깔끔한 1줄 UI) */}
              {gPlayerIds.length > 0 && selectedGameObj && (
                <div className="space-y-1.5 animate-in fade-in max-h-48 overflow-y-auto scrollbar-hide pr-1">
                  <span className="text-[10px] font-black text-slate-500 ml-1 uppercase">Auto-Assigned Info ({gPlayerIds.length}명 공동)</span>
                  {gPlayerIds.map(pid => {
                    const pResult = selectedGameObj.results.find(r=>r.playerId===pid);
                    if(!pResult) return null;
                    return (
                      <div key={pid} className="flex justify-between items-center bg-slate-800/60 px-4 py-3 rounded-xl border border-slate-700/50 mb-2 shadow-sm">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm font-black text-white shrink-0">{players.find(p=>p.id===pid)?.name}</span>
                          <span className="text-slate-600 font-black mb-0.5">|</span>
                          <span className="text-xs font-bold text-slate-400 truncate">{(pResult.corps||[]).join(' + ')}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 pl-3">
                          {selectedGameObj.isSolo ? (
                            <span className="text-xs font-black text-purple-400">{pResult.score===1 ? '성공':'실패'}</span>
                          ) : (
                            <>
                              <span className="text-xs font-black text-slate-300">{pResult.rank}위</span>
                              <span className="text-sm font-black text-orange-400">{pResult.score} VP</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>

              {/* 💡 1. 등록 대기열 (위로 이동) */}
              {guinnessBatch.length > 0 && (
                <div className="bg-slate-900 p-5 rounded-3xl border border-slate-700 shadow-2xl space-y-3 animate-in slide-in-from-bottom-2 mb-4">
                  <h3 className="text-xs font-black text-slate-400 mb-4 ml-1 uppercase tracking-widest border-b border-slate-800 pb-3">등록 대기열 ({guinnessBatch.length})</h3>
                  {guinnessBatch.map(b => (
                    <div key={b.id} className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-600 shadow-md">
                      <div>
                        <div className="text-[10px] text-orange-400 font-bold mb-1 uppercase flex gap-2">
                          {b.category.split('_')[1] || b.category} {b.subCategory ? `> ${b.subCategory}` : ''}
                        </div>
                        <div className="text-base font-black text-white">{b.itemName}</div>
                      </div>
                      <div className="flex items-center gap-5">
                        <span className="text-2xl font-black text-orange-500">{b.recordValue}</span>
                        <button onClick={()=>handleRemoveFromGuinnessBatch(b.id)} className="text-slate-500 hover:text-red-500 transition-colors bg-slate-900 p-2 rounded-full"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 💡 2. Record Details (아래로 이동 & 토글 로직 적용) */}
              {(showGInput || guinnessBatch.length === 0) ? (
                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-600 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-2 border-b border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_10px_#eab308]"></div>
                      <span className="text-xs font-black text-slate-200 uppercase tracking-widest">Record Details</span>
                    </div>
                  </div>
                  
                  <select value={gCategory} onChange={e=>{
                    const cat = e.target.value; setGCategory(cat);
                    if (cat === '기본 기록') setGItem(CORE_ITEMS[0]); else if (cat === '자원') setGItem(RESOURCE_ITEMS[0]); else if (cat === '생산력') setGItem(PRODUCTION_ITEMS[0]); else if (cat === '최대 태그') setGItem(TAG_ITEMS[0]); else if (cat === '특수자원') { setGSubCategory('동물자원'); setGItem(SPECIAL_RESOURCES['동물자원'][0]); } else if (cat === '기업상') setGItem(AWARD_ITEMS[0]); else if (cat === '특별상') setGItem(''); else setGItem('');
                  }} className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-orange-400 font-black text-sm outline-none shadow-inner">
                    {GUINNESS_CATEGORIES_FORM.map(c=><option key={c}>{c}</option>)}
                  </select>

                  {gCategory === '특수자원' && (
                    <select value={gSubCategory} onChange={e => { setGSubCategory(e.target.value); setGItem(SPECIAL_RESOURCES[e.target.value][0]); }} className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 font-bold outline-none animate-in fade-in shadow-inner">
                      {Object.keys(SPECIAL_RESOURCES).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                  )}

                  <div className="z-30 relative">
                    {gCategory==='기본 기록'?<select value={gItem} onChange={e=>setGItem(e.target.value)} className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold shadow-inner">{CORE_ITEMS.map(i=><option key={i} value={i}>{i}</option>)}</select>
                    :gCategory==='자원'?<select value={gItem} onChange={e=>setGItem(e.target.value)} className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold shadow-inner">{RESOURCE_ITEMS.map(i=><option key={i} value={i}>{i}</option>)}</select>
                    :gCategory==='생산력'?<select value={gItem} onChange={e=>setGItem(e.target.value)} className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold shadow-inner">{PRODUCTION_ITEMS.map(i=><option key={i} value={i}>{i} 생산력</option>)}</select>
                    :gCategory==='최대 태그'?<select value={gItem} onChange={e=>setGItem(e.target.value)} className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold shadow-inner">{TAG_ITEMS.map(i=><option key={i} value={i}>{i}</option>)}</select>
                    :gCategory==='특수자원'?<select value={gItem} onChange={e=>setGItem(e.target.value)} className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold shadow-inner">{SPECIAL_RESOURCES[gSubCategory].map(i=><option key={i} value={i}>{i}</option>)}</select>
                    :gCategory==='기업상'?<select value={gItem} onChange={e=>setGItem(e.target.value)} className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold shadow-inner">{AWARD_ITEMS.map(i=><option key={i} value={i}>{i}</option>)}</select>
                    :gCategory==='특별상'?<SearchableSelect selectedValue={gItem} onChange={setGItem} options={Array.from(new Set([...SPECIAL_AWARDS_DEFAULT, ...(guinnessRecords || []).filter(r => r.category === '특별상' && r.is_approved).map(r => r.itemName)])).sort().map(a=>({value:a,label:a}))} placeholder="신규 특별상 검색/입력..." onAddNew={name=>setGItem(name)} addNewLabel="목록에 없나요? 신설하기" />
                    :<input type="text" value={gItem} onChange={e=>setGItem(e.target.value)} placeholder="직접 입력" className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none font-bold shadow-inner"/>}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* 💡 모바일에서 넘치지 않도록 flex-col 적용 및 폰트 크기 반응형 조절 */}
                    <input 
                      type="text" 
                      inputMode="text" 
                      value={gValue} 
                      onChange={e=>setGValue(e.target.value)} 
                      placeholder="수치 또는 문자 입력 (- 가능)" 
                      className="flex-1 p-4 bg-slate-950 border border-orange-500/50 text-orange-500 rounded-xl text-lg sm:text-2xl font-black outline-none focus:border-orange-500 shadow-inner min-w-0"
                    />
                    <button 
                      onClick={handleAddToGuinnessBatch} 
                      className="w-full sm:w-auto px-8 py-4 sm:py-0 bg-slate-900 border border-slate-600 text-white font-black rounded-xl hover:bg-slate-700 active:scale-95 transition-all text-base shadow-lg shrink-0"
                    >
                      추가
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowGInput(true)} 
                  className="w-full py-5 border-2 border-dashed border-slate-600 text-slate-400 font-black rounded-3xl hover:border-orange-500 hover:bg-orange-900/10 hover:text-orange-500 transition-all flex justify-center items-center gap-2 animate-in fade-in"
                >
                  <Plus size={20} strokeWidth={3} /> 기록 추가하기
                </button>
              )}
            </div>

            <div className="shrink-0 pt-4">
              <button onClick={handleSaveGuinnessBatch} className={`w-full py-4 rounded-2xl text-lg uppercase tracking-widest font-black shadow-2xl active:scale-95 transition-transform ${guinnessBatch.length>0 ? ACCENT_BG + ' text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                {guinnessBatch.length > 0 ? `총 ${guinnessBatch.length}개 기록 일괄 전송` : '기록을 먼저 추가해주세요'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 개인 통계 모달 */}
      {selectedPlayerIdForStats && (() => {
        const p = playerStatsEngine[selectedPlayerIdForStats]; if(!p) return null;
        
        const rh = p.ratingHistory.slice(-10); 
        const ratings = rh.map(h => h.rating);
        const maxR = Math.max(...ratings, 1500) + 10;
        const minR = Math.min(...ratings, 1500) - 10;
        
        return (
          <div className="fixed inset-0 bg-black/90 z-[150] flex flex-col justify-end animate-in fade-in duration-300">
            <div className={`${THEME_BG} w-full h-[88%] rounded-t-[2.5rem] flex flex-col border-t border-slate-700 shadow-2xl overflow-hidden`}>
              <div className={`${THEME_PANEL} p-6 flex justify-between items-center rounded-t-[2.5rem] border-b border-slate-800`}>
                <div className="flex flex-col"><span className="text-[10px] font-black text-slate-500 uppercase">Pioneer Analytics</span><h2 className="text-2xl font-black text-white">{p.name}</h2></div>
                <button onClick={()=>setSelectedPlayerIdForStats(null)} className="bg-slate-800 p-2 rounded-full text-slate-400"><X size={24}/></button>
              </div>
              <div className="p-6 space-y-8 overflow-y-auto scrollbar-hide pb-20">
                
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 shadow-inner flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">데이터 기준 시즌</span>
                  <select value={selectedSeasonId} onChange={e=>setSelectedSeasonId(e.target.value)} className="bg-slate-800 text-orange-400 text-xs font-bold p-2 rounded-lg border border-slate-600 outline-none">
                    {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 shadow-inner"><span className="text-[10px] text-slate-500 font-black block mb-1 uppercase">Total</span><span className="text-xl font-black">{p.gamesPlayed}전</span></div>
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 shadow-inner"><span className="text-[10px] text-slate-500 font-black block mb-1 uppercase">Win Rate</span><span className="text-xl font-black text-orange-500">{p.gamesPlayed?Math.round((p.wins/p.gamesPlayed)*100):0}%</span></div>
                  <div className="bg-orange-900/20 p-4 rounded-2xl border border-orange-500/30 shadow-inner"><span className="text-[10px] text-orange-400 font-black block mb-1 uppercase">MMR</span><span className="text-xl font-black text-orange-400">{p.currentRating}</span></div>
                </div>

                <div className="bg-slate-900 p-4 rounded-3xl border border-slate-700 shadow-lg">
                  <h3 className="text-xs font-black text-slate-500 mb-3 ml-1 uppercase tracking-widest">Detail Rank Info</h3>
                  <div className="space-y-2">
                    {Object.keys(p.rankCounts || {}).length === 0 ? (
                      <p className="text-xs text-slate-600 font-bold text-center py-2">참여 기록이 없습니다.</p>
                    ) : (
                      Object.entries(p.rankCounts).sort().map(([pCount, ranks]) => (
                        <div key={pCount} className="flex items-center justify-between bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700/50">
                          <span className="text-[11px] font-black text-orange-400 bg-orange-900/30 px-2 py-0.5 rounded-lg">{pCount} 모드</span>
                          <div className="flex gap-3 text-[10px] font-bold text-slate-400">
                            {pCount === '1인' ? (
                              <><span className="text-green-400">성공: {ranks[1]||0}</span><span className="text-red-400">실패: {ranks.fail||0}</span></>
                            ) : (
                              <>
                                <span className="text-yellow-500">1등: {ranks[1]||0}</span>
                                <span>2등: {ranks[2]||0}</span>
                                <span>3등: {ranks[3]||0}</span>
                                <span>4등: {ranks[4]||0}</span>
                                <span>5등: {ranks[5]||0}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* 💡 1게임이라도 그래프가 뜨도록 로직 완벽 보정 */}
                <div className="bg-slate-900 p-5 rounded-3xl border border-slate-700 shadow-lg relative h-52 flex flex-col">
                  <h3 className="text-xs font-black text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-wider shrink-0">
                    <TrendingUp size={16} className="text-orange-500"/> Rating Performance
                  </h3>
                  {(() => {
                    // 최근 8게임으로 제한
                    const rh = p.ratingHistory.slice(-8); 
                    if (rh.length === 0) return <div className="m-auto text-slate-500 font-bold text-xs">기록이 없습니다.</div>;
                    
                    const ratings = rh.map(h => h.rating);
                    const maxR = Math.max(...ratings, 1500) + 15; // 그래프 상단 여백
                    const minR = Math.min(...ratings, 1500) - 15; // 그래프 하단 여백
                    
                    // 각 점의 X, Y 좌표를 % 비율로 계산
                    const points = rh.map((h, i) => {
                      const x = rh.length === 1 ? 50 : 5 + (i / (rh.length - 1)) * 90;
                      const y = maxR === minR ? 50 : 80 - ((h.rating - minR) / (maxR - minR)) * 60;
                      return { x, y, rating: h.rating };
                    });

                    return (
                      <div className="relative flex-1 w-full mt-4">
                        {/* 배경 점선 (1500점 혹은 중간값 기준선 용도) */}
                        <div className="absolute inset-x-0 top-1/2 border-t border-slate-800 border-dashed" />
                        
                        {/* SVG 선(Line)과 점(Circle) 그리기 */}
                        <svg className="w-full h-full absolute inset-0 overflow-visible">
                          {points.map((p, i) => {
                            if (i === 0) return null;
                            const prev = points[i - 1];
                            return <line key={`l-${i}`} x1={`${prev.x}%`} y1={`${prev.y}%`} x2={`${p.x}%`} y2={`${p.y}%`} stroke="#f97316" strokeWidth="2.5" className="opacity-80" />
                          })}
                          {points.map((p, i) => (
                            <circle key={`c-${i}`} cx={`${p.x}%`} cy={`${p.y}%`} r="4.5" fill="#0f172a" stroke="#f97316" strokeWidth="2.5" />
                          ))}
                        </svg>

                        {/* 각 점 위에 항상 표시되는 점수 텍스트 */}
                        {points.map((p, i) => (
                          <div key={`t-${i}`} className="absolute flex justify-center items-center font-black text-orange-400 text-[11px] bg-slate-900/60 px-1.5 py-0.5 rounded-md z-10" 
                              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -170%)' }}>
                            {p.rating}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Corporation Proficiency</h3>
                  {Object.entries(p.corpStats).sort((a,b)=>b[1].plays - a[1].plays).map(([n,s])=>(
                    <div key={n} className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-slate-800 hover:border-orange-500/30 transition-all">
                      <span className="text-sm font-black text-slate-200">{n}</span>
                      <div className="text-right">
                        <span className="text-xs text-orange-500 font-black block">{Math.round((s.wins/s.plays)*100)}% Win</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase">{s.plays} Missions</span>
                      </div>
                    </div>
                  ))}
                  {Object.keys(p.corpStats).length === 0 && <div className="text-center py-6 text-slate-600 font-black">해당 시즌에 플레이한 기업이 없습니다.</div>}
                </div>

                {/* 💡 새로 추가되는 '나의 기네스 기록' 영역 */}
                <div className="space-y-3 pt-6 border-t border-slate-800 mt-6">
                  <h3 className="text-xs font-black text-slate-500 mb-3 ml-1 uppercase tracking-widest flex items-center gap-2">
                    <Star size={16} className="text-yellow-500"/> My Guinness Records
                  </h3>
                  {(() => {
                    // 모든 기록 중 카테고리별 현재 1위 기록만 필터링
                    const currentBests = {};
                    guinnessRecords.filter(r => r.is_approved && !r.is_hall_of_fame).forEach(r => {
                      const key = `${r.playerCount || '통합'}_${r.category}_${r.itemName}`;
                      if (!currentBests[key]) currentBests[key] = r;
                      else {
                        if (r.itemName === '최소 TR') {
                          if (r.recordValue < currentBests[key].recordValue) currentBests[key] = r;
                        } else {
                          if (r.recordValue > currentBests[key].recordValue) currentBests[key] = r;
                        }
                      }
                    });
                    
                    // 1위 기록 중 해당 플레이어의 기록 + 명예의 전당 기록 합치기
                    // 1위 기록 중 해당 플레이어의 기록 + 명예의 전당 기록 합치기 (공동 달성 포함)
                    const myBests = Object.values(currentBests).filter(r => r.playerId && r.playerId.split(',').includes(p.id));
                    const myHoF = guinnessRecords.filter(r => r.is_approved && r.is_hall_of_fame && r.playerId && r.playerId.split(',').includes(p.id));
                    const allMyRecords = [...myHoF, ...myBests].sort((a,b) => new Date(b.date) - new Date(a.date));

                    if (allMyRecords.length === 0) return <div className="text-center py-6 text-slate-600 font-black bg-slate-900/50 rounded-2xl border border-slate-800">보유 중인 타이틀이 없습니다.</div>;

                    return (
                      <div className="grid grid-cols-2 gap-3">
                        {allMyRecords.map(r => (
                          <div key={r.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-700 shadow-md relative overflow-hidden transition-transform hover:scale-[1.02]">
                            {r.is_hall_of_fame && <Crown size={32} className="absolute -right-2 -bottom-2 text-yellow-500/20" />}
                            <div className="text-[10px] text-orange-400 font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                              {r.is_hall_of_fame && <span className="bg-yellow-600 text-slate-900 px-1.5 py-0.5 rounded-md text-[9px] font-black">명예의전당</span>}
                              {r.category.split('_')[1] || r.category}
                            </div>
                            <div className="text-sm font-black text-slate-200 truncate">{r.itemName}</div>
                            <div className="text-xl font-black text-orange-500 mt-2 flex items-baseline gap-1">
                              {r.recordValue}
                              <span className="text-[9px] text-slate-500 font-bold">{r.playerCount}인</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                {/* 💡 추가 영역 끝 */}

              </div>
            </div>
          </div>
        );
      })()}

      {/* 기네스 이력 조회 모달 (명예의 전당 지정 버튼 포함) */}
      {selectedGuinnessHistory && (
        <div className="fixed inset-0 bg-black/90 z-[220] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
          <div className={`${THEME_CARD} w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[75vh] border border-slate-700`}>
            <div className={`${THEME_PANEL} p-5 flex justify-between items-center border-b border-slate-800`}>
              <div className="flex flex-col"><span className="text-[10px] font-black text-orange-500 uppercase">Hall of Fame History</span><h3 className="font-black text-slate-100 flex items-center gap-1.5 truncate pr-4"><History size={16} className="text-orange-500"/> {selectedGuinnessHistory.itemName}</h3></div>
              <button onClick={() => setSelectedGuinnessHistory(null)} className="text-slate-400 p-1 bg-slate-800 rounded-full"><X size={20}/></button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 scrollbar-hide bg-slate-950/50">
              {guinnessRecords.filter(r=>r.category===selectedGuinnessHistory.category && r.itemName===selectedGuinnessHistory.itemName && r.is_approved)
                .sort((a,b)=> a.itemName === '최소 TR' ? a.recordValue - b.recordValue : b.recordValue - a.recordValue).map((h, i)=>(
                  <div key={h.id} className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${i===0?'bg-orange-900/20 border-orange-900/50 shadow-[0_0_20px_rgba(249,115,22,0.1)]':'bg-slate-900 border-slate-800'}`}>
                    <div className="flex items-center gap-3 w-full">
                      {/* 💡 명예의 전당 및 삭제 권한을 관리자(Admin)에게도 확대 허용 */}
                      {isAdminOrMaster && (
                        <button onClick={(e) => { e.stopPropagation(); handleToggleHallOfFame(h.id, h.is_hall_of_fame); }} className={`p-2 rounded-xl border ${h.is_hall_of_fame ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-yellow-500 hover:border-yellow-500/50'} transition-colors shrink-0`}>
                          <Crown size={16}/>
                        </button>
                      )}
                      {/* 💡 공동 달성자 중 본인이 포함되어 있으면 삭제 가능하게 처리 */}
                      {(isAdminOrMaster || (currentUser && h.playerId && h.playerId.split(',').includes(currentUser.id))) && (
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteGuinnessRecord(h.id); }} className="p-2 rounded-xl border bg-slate-800 text-slate-500 border-slate-700 hover:text-red-500 hover:border-red-500/50 transition-colors shrink-0">
                          <Trash2 size={16}/>
                        </button>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 truncate">
                          {i === 0 && <span className="text-[8px] bg-orange-600 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-lg shadow-orange-900/50 shrink-0">Current Best</span>}
                          {h.is_hall_of_fame && <span className="text-[8px] bg-yellow-600 text-slate-900 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter shrink-0">불멸</span>}
                          <span className="text-sm font-black text-slate-200 truncate">{(h.playerId||'').split(',').map(id => players.find(p=>p.id===id)?.name || id).join(', ')}</span>
                        </div>
                        <div className="text-[9px] text-slate-500 font-black uppercase space-y-0.5 truncate">
                          <p className="text-slate-400 truncate">🏢 {(h.corps || []).join(' + ')}</p>
                          <p>📅 {h.date} • {h.playerCount}인 대국</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0"><span className="text-2xl font-black text-orange-500 drop-shadow-lg">{h.recordValue}</span><span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Points</span></div>
                    </div>
                  </div>
              ))}
              {guinnessRecords.filter(r=>r.category===selectedGuinnessHistory.category && r.itemName===selectedGuinnessHistory.itemName && r.is_approved).length === 0 && <div className="text-center py-10 text-slate-600 font-black uppercase">No History Found</div>}
            </div>
          </div>
        </div>
      )}

      {/* 마스터 유저 관리 보드 */}
      {isMasterModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col justify-end animate-in fade-in duration-300">
          <div className={`${THEME_BG} w-full h-[85%] rounded-t-[2.5rem] flex flex-col border-t border-slate-700 shadow-2xl`}>
            <div className={`${THEME_PANEL} p-6 flex justify-between border-b border-slate-800 rounded-t-[2.5rem] shrink-0`}>
              <div className="flex flex-col"><span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">System Administrator</span><h2 className="text-xl font-black flex items-center gap-2"><ShieldCheck size={20}/> 통합 관리 보드</h2></div>
              <button onClick={()=>setIsMasterModalOpen(false)} className="bg-slate-800 p-2 rounded-full text-slate-400"><X size={24}/></button>
            </div>
            <div className="p-5 overflow-y-auto space-y-6 scrollbar-hide pb-20">
              
              <div className="space-y-3">
                <h3 className="font-black text-yellow-500 text-sm flex items-center gap-2 border-b border-slate-800 pb-2"><Award size={16}/> 기네스 승인 대기열</h3>
                {guinnessRecords.filter(r=>!r.is_approved).map(r=>(
                  <div key={r.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-700 shadow-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-[10px] text-slate-500 font-black mb-1 flex gap-1">{r.category} • {r.playerCount}인 {r.is_hall_of_fame && <span className="bg-yellow-600 text-slate-900 px-1 rounded">명예의전당 신청</span>}</div>
                        <span className="font-black text-white text-base">{r.itemName} : {r.recordValue}</span>
                      </div>
                      <span className="text-xs font-black text-orange-400 text-right">달성자: {(r.playerId||'').split(',').map(id => players.find(p=>p.id===id)?.name || id).join(', ')}</span>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-slate-800">
                      <button onClick={()=>handleApproveGuinness(r.id, true)} className="flex-1 bg-green-900/30 text-green-500 border border-green-800 py-2 text-xs font-bold rounded-lg hover:bg-green-800/50 transition-colors">승인</button>
                      <button onClick={()=>handleApproveGuinness(r.id, false)} className="p-2 bg-red-900/20 text-red-500 rounded-lg border border-red-900/50 hover:bg-red-900/40 px-4 font-bold text-xs">반려 (삭제)</button>
                    </div>
                  </div>
                ))}
                {guinnessRecords.filter(r=>!r.is_approved).length === 0 && <div className="text-center py-6 text-slate-600 font-black uppercase text-xs">대기 중인 기록이 없습니다.</div>}
              </div>

              {/* 💡 개척자 권한 관리 영역은 오직 master만 볼 수 있도록 감싸기 */}
              {isMaster && (
                <div className="space-y-3">
                  <h3 className="font-black text-blue-500 text-sm flex items-center gap-2 border-b border-slate-800 pb-2 mt-4"><Users size={16}/> 개척자 권한 관리</h3>
                  {allUsers.filter(u=>u.role!=='master').map(u=>(
                    <div key={u.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-700 shadow-lg">
                      <div className="flex justify-between items-center mb-3">
                        <div><span className="font-bold text-white text-sm block">{u.username}</span><span className="text-[10px] text-slate-500 font-bold">{u.is_approved ? '✅ 승인됨' : '⏳ 대기중'}</span></div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black ${u.role==='관리자'?'bg-blue-900/50 text-blue-400 border border-blue-800':'bg-slate-800 text-slate-400 border border-slate-600'}`}>{u.role}</span>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-slate-800">
                        {!u.is_approved && <button onClick={()=>updateRole(u.id, {is_approved:true})} className="flex-1 bg-green-900/30 text-green-500 border border-green-800 py-2 text-xs font-bold rounded-lg hover:bg-green-800/50 transition-colors">접근 승인</button>}
                        <button onClick={()=>updateRole(u.id, {role:u.role==='관리자'?'개척자':'관리자'})} className="flex-1 bg-slate-800 text-slate-300 py-2 text-xs font-bold rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors">직위 변경</button>
                        <button onClick={()=>updateRole(u.id, {is_active:false})} className="p-2 bg-red-900/20 text-red-500 rounded-lg border border-red-900/50 hover:bg-red-900/40"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 시즌 관리 모달 */}
      {isSeasonModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6 animate-in zoom-in duration-200">
          <div className={`${THEME_CARD} w-full max-w-sm rounded-3xl p-6 border border-slate-700 shadow-2xl`}>
            <div className="flex justify-between mb-6 font-black text-white uppercase tracking-widest text-sm"><h3>Season Management</h3><button onClick={()=>setIsSeasonModalOpen(false)}><X size={20}/></button></div>
            <div className="max-h-48 overflow-y-auto space-y-2 mb-6 scrollbar-hide">
              {seasons.map(s=>(
                <div key={s.id} className="text-[11px] bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div><span className="text-orange-500 font-black block text-sm">{s.name}</span><span className="text-slate-500 font-bold">{s.start_date || 'N/A'} ~ {s.end_date || 'Present'}</span></div>
                </div>
              ))}
            </div>
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 ml-1">시즌명</span><input type="text" value={seasonName} onChange={e=>setSeasonName(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none text-sm font-bold"/></div>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1"><span className="text-[10px] font-bold text-slate-500 ml-1">시작일</span><input type="date" value={seasonStart} onClick={e => e.target.showPicker && e.target.showPicker()} onChange={e=>setSeasonStart(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-[10px] text-white color-scheme-dark cursor-pointer"/></div>
                <div className="flex-1 space-y-1"><span className="text-[10px] font-bold text-slate-500 ml-1">종료일</span><input type="date" value={seasonEnd} onClick={e => e.target.showPicker && e.target.showPicker()} onChange={e=>setSeasonEnd(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-[10px] text-white color-scheme-dark cursor-pointer"/></div>
              </div>
              <button onClick={handleSaveSeason} className={`w-full ${ACCENT_BG} text-white font-black py-3.5 rounded-xl active:scale-95 transition-transform`}>Add New Season</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}