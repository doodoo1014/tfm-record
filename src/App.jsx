import { useState, useMemo, useEffect, useRef } from 'react';
import { Rocket, Map, Trophy, Star, Plus, Users, X, Check, Medal, History, ChevronLeft, Award, Settings, BarChart2, Edit, Trash2, PieChart, TrendingUp, Search, Lock, Unlock, Bell, Info, ShieldCheck, LogOut, ChevronDown, ChevronUp, ListPlus, Crown } from 'lucide-react';
import { supabase } from './supabase';

// =============================================================================
// 1. 상수 및 방대한 기초 데이터 모음
// =============================================================================

const MAPS = ['타르시스', '헬라스', '엘리시움', '북극', '유토피아', '키메리아', '아마조니스'];
const EXPANSIONS = ['서곡', '서곡2', '비너스넥스트', '개척기지', '격동'];
const PLAYER_COUNTS = ['통합', '1인', '2인', '3인', '4인', '5인'];
const GUINNESS_TABS = ['통합', '1인', '2인', '3인', '4인', '5인', '명예의전당']; // 상단 탭 전용

const CORPORATIONS = [
  { name: '타르시스 공화국', exp: '기본' }, { name: '에코라인', exp: '기본' }, { name: '크레디코르', exp: '기본' }, { name: '헬리온', exp: '기본' }, { name: '마이닝 길드', exp: '기본' }, { name: '인터플래너터리 시네마틱스', exp: '기본' }, { name: '새턴 시스템즈', exp: '기본' }, { name: '테라랙터', exp: '기본' }, { name: '유엔 화성 이니셔티브', exp: '기본' }, { name: '인벤트릭스', exp: '기본' }, { name: '포볼로그', exp: '기본' }, { name: '초보자용 기업', exp: '기본' },
  { name: '아프로디테', exp: '비너스넥스트' }, { name: '셀레스틱', exp: '비너스넥스트' }, { name: '만박단', exp: '비너스넥스트' }, { name: '모닝 스타 인코퍼레이션', exp: '비너스넥스트' }, { name: '비론', exp: '비너스넥스트' },
  { name: '포인트 루나', exp: '서곡' }, { name: '로빈슨 산업', exp: '서곡' }, { name: '밸리 트러스트', exp: '서곡' }, { name: '바이탈라이저', exp: '서곡' }, { name: '정착군', exp: '서곡' },
  { name: '포세이돈', exp: '개척기지' }, { name: '폴리펨', exp: '개척기지' }, { name: '아르도르', exp: '개척기지' }, { name: '스톰크래프트 에셋', exp: '개척기지' }, { name: '타키온 테라포밍', exp: '개척기지' },
  { name: '프리스토어', exp: '격동' }, { name: '테라랩스', exp: '격동' }, { name: '레이크프론트 리조트', exp: '격동' }, { name: '유토피아 인베스트', exp: '격동' }, { name: '셉템 트리오네스', exp: '격동' },
  { name: '아크라이트', exp: '서곡2' }, { name: '스플라이스', exp: '서곡2' }, { name: '팩토럼', exp: '서곡2' }, { name: '필란스로피', exp: '서곡2' }, { name: '리사이클론', exp: '프로모' }, { name: '아크몬트', exp: '프로모' }
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
    if (matched) setQuery(matched.label);
    else if (!isOpen) setQuery('');
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

// 💡 마작 스타일의 기업 선택 그리드 (롱프레스 지원)
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
    selectedExps.forEach(exp => groups[exp] = []);
    CORPORATIONS.forEach(c => {
      if (groups[c.exp]) groups[c.exp].push(c.name);
      if (c.exp === '프로모' && groups['서곡2']) groups['서곡2'].push(c.name);
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
                    className={`relative p-2 rounded-xl text-[10px] font-bold leading-tight break-keep flex items-center justify-center min-h-[44px] transition-all duration-200 shadow-md ${
                      isSelected 
                        ? (isPrimary ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)] ring-1 ring-orange-300' : 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-slate-900 border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]') 
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
// 3. 헬퍼 로직 (ELO 및 알파벳 식별자)
// =============================================================================

const calculateMultiplayerELO = (playersResult, kFactor = 32) => {
  let results = playersResult.map(p => ({ ...p, ratingChange: 0 }));
  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      let p1 = results[i]; let p2 = results[j];
      let expectedP1 = 1 / (1 + Math.pow(10, (p2.rating - p1.rating) / 400));
      let expectedP2 = 1 / (1 + Math.pow(10, (p1.rating - p2.rating) / 400));
      let s1 = 0, s2 = 0;
      if (p1.rank < p2.rank) { s1 = 1; s2 = 0; } else if (p1.rank > p2.rank) { s1 = 0; s2 = 1; } else { s1 = 0.5; s2 = 0.5; }
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

  const [editingGameId, setEditingGameId] = useState(null);
  const [newGameDate, setNewGameDate] = useState(new Date().toISOString().split('T')[0]);
  const [newGameMap, setNewGameMap] = useState('타르시스');
  const [newGameGen, setNewGameGen] = useState(10);
  const [selectedExps, setSelectedExps] = useState([...EXPANSIONS]); 
  const [isSoloMode, setIsSoloMode] = useState(false);
  const [soloType, setSoloType] = useState('나 홀로 화성에'); 
  const [soloResult, setSoloResult] = useState('성공'); 
  const [gameScores, setGameScores] = useState([createEmptyScore(), createEmptyScore()]);

  const [gCount, setGCount] = useState('4인'); 
  const [gDate, setGDate] = useState(new Date().toISOString().split('T')[0]);
  const [gPlayerId, setGPlayerId] = useState(''); 
  const [gCorps, setGCorps] = useState([]);
  const [gGameId, setGGameId] = useState(''); 
  const [guinnessBatch, setGuinnessBatch] = useState([]); 
  
  const [gCategory, setGCategory] = useState('기본 기록');
  const [gSubCategory, setGSubCategory] = useState('동물자원'); 
  const [gItem, setGItem] = useState(CORE_ITEMS[0]); 
  const [gValue, setGValue] = useState('');

  const [guinnessTab, setGuinnessTab] = useState('통합');
  const [showAwardInfo, setShowAwardInfo] = useState(null);
  
  const [expandedCats, setExpandedCats] = useState({
    '자원': false, '생산력': false, '최대 태그': false, '특수자원': false, '특수자원_동물자원': false, '특수자원_미생물자원': false, '특수자원_부양체자원': false, '특수자원_소행성 자원': false, '특수자원_과학자원': false, '특수자원_기타자원': false, '기업상': false, '특별상': false
  });

  const [seasonName, setSeasonName] = useState(''); const [seasonStart, setSeasonStart] = useState(''); const [seasonEnd, setSeasonEnd] = useState('');

  // ==========================================
  // DB 로드 함수
  // ==========================================
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const { data: sData } = await supabase.from('seasons').select('*').eq('is_active', true).order('created_at', { ascending: true });
      if (sData) setSeasons([{ id: 'all', name: '프리 시즌 (전체)', start_date: null, end_date: null }, ...sData]);

      const { data: pData } = await supabase.from('players').select('*').eq('is_active', true).order('created_at', { ascending: true });
      if (pData) setPlayers(pData);

      const { data: gRecData } = await supabase.from('guinness_records').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (gRecData) setGuinnessRecords(gRecData.map(r => ({
        ...r, id: r.id, playerCount: r.player_count, category: r.category, itemName: r.item_name, recordValue: r.record_value, 
        playerId: r.player_id, corps: r.corps, gameId: r.game_id, is_approved: r.is_approved, is_hall_of_fame: r.is_hall_of_fame
      })));

      const { data: gData } = await supabase.from('games').select(`*, game_results ( player_id, corps, score, mc, rank, rating_change )`).order('date', { ascending: false });
      if (gData) {
        const formattedGames = gData.map(g => ({
          id: g.id, date: g.date, map: g.map_name, generation: g.generation, expansions: g.expansions, is_active: g.is_active, isSolo: g.player_count === 1,
          results: g.game_results.map(r => ({
            playerId: r.player_id, corps: r.corps, score: r.score, mc: r.mc, rank: r.rank, ratingChange: r.rating_change,
            soloResult: g.player_count === 1 ? (r.score > 0 ? '성공' : '실패') : null 
          }))
        }));
        setGames(formattedGames);
      }
      if (isAdminOrMaster) {
        const { data: uData } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (uData) setAllUsers(uData);
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

  // 💡 알파벳 자동 부여 플레이어 생성
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
      if (gameScores.length > 0) setGameScores([{ ...gameScores[0] }]);
      else setGameScores([createEmptyScore()]);
    } else if (gameScores.length < 2) {
      setGameScores([...gameScores, createEmptyScore()]);
    }
  }, [isSoloMode]);

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
      stats[p.id] = { ...p, currentRating: 1500, gamesPlayed: 0, wins: 0, ratingHistory: [{ gameIdx: 0, rating: 1500 }], corpStats: {} };
    });

    validGames.forEach((game, index) => {
      if (game.isSolo) {
        if (!game.results || game.results.length === 0) return;
        const res = game.results[0];
        if (!stats[res.playerId]) return;
        const pStat = stats[res.playerId];
        pStat.gamesPlayed += 1;
        if (res.soloResult === '성공') pStat.wins += 1;
        
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

      const eloOutput = calculateMultiplayerELO(sorted);
      eloOutput.forEach(res => {
        if (!stats[res.playerId]) return;
        const pStat = stats[res.playerId];
        pStat.currentRating = res.newRating; pStat.gamesPlayed += 1;
        if (res.rank === 1) pStat.wins += 1;
        pStat.ratingHistory.push({ gameIdx: index + 1, date: game.date, rating: res.newRating, change: res.ratingChange });

        (res.corps || []).forEach(c => {
          if (!pStat.corpStats[c]) pStat.corpStats[c] = { plays: 0, wins: 0 };
          pStat.corpStats[c].plays += 1; if (res.rank === 1) pStat.corpStats[c].wins += 1;
        });

        const targetRes = game.results.find(x => x.playerId === res.playerId);
        if (targetRes) { targetRes.rank = res.rank; targetRes.ratingChange = res.ratingChange; }
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
    return Object.values(stats).sort((a,b) => b.plays - a.plays);
  }, [filteredGames]);

  // ==========================================
  // 💡 기네스 데이터 그룹화 (명예의 전당 완전 분리)
  // ==========================================
  const displayedGuinnessGroups = useMemo(() => {
    const season = seasons.find(s => s.id === selectedSeasonId);
    let validRecords = guinnessRecords;
    if (season?.start_date) validRecords = validRecords.filter(r => r.date >= season.start_date);
    if (season?.end_date) validRecords = validRecords.filter(r => r.date <= season.end_date);

    validRecords = validRecords.filter(r => r.is_approved);

    const isHoF = guinnessTab === '명예의전당';
    const pCountInt = guinnessTab === '통합' ? null : parseInt(guinnessTab.replace('인', ''), 10);
    
    let result = [];

    // 🏆 명예의 전당 전용 렌더링
    if (isHoF) {
      const hofRecords = validRecords.filter(r => r.is_hall_of_fame).sort((a,b) => new Date(b.date) - new Date(a.date));
      return [{ category: '명예의 전당', title: '명예의 전당 (불멸의 기록)', records: hofRecords }];
    }

    // 일반 기록 필터링
    validRecords = validRecords.filter(r => !r.is_hall_of_fame);
    
    const bests = {};
    const dynamicSpecialAwards = new Set(SPECIAL_AWARDS_DEFAULT);

    validRecords.forEach(r => {
      if (pCountInt && r.playerCount !== pCountInt) return;
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
      { id: '기본 기록', title: '핵심 기록 (Max VP, Min/Max TR)', items: CORE_ITEMS },
      { id: '자원', title: '최다 자원 축적 기록', items: RESOURCE_ITEMS },
      { id: '생산력', title: '최고 자원 생산력 기록', items: PRODUCTION_ITEMS },
      { id: '최대 태그', title: '최대 태그 수집 기록', items: TAG_ITEMS },
      { id: '특수자원', title: '특수 자원 카드별 기록', isNested: true, subGroups: [
          { id: '특수자원_동물자원', title: '동물자원 (10+)', items: SPECIAL_RESOURCES['동물자원'] },
          { id: '특수자원_미생물자원', title: '미생물자원 (20+)', items: SPECIAL_RESOURCES['미생물자원'] },
          { id: '특수자원_부양체자원', title: '부양체자원 (10+)', items: SPECIAL_RESOURCES['부양체자원'] },
          { id: '특수자원_소행성 자원', title: '소행성 자원', items: SPECIAL_RESOURCES['소행성 자원'] },
          { id: '특수자원_과학자원', title: '과학자원', items: SPECIAL_RESOURCES['과학자원'] },
          { id: '특수자원_기타자원', title: '기타자원', items: SPECIAL_RESOURCES['기타자원'] }
      ]},
      { id: '기업상', title: '공식 기업상 달성 수치', items: AWARD_ITEMS },
      { id: '특별상', title: '특별상 (기타 커스텀 요모조모)', items: specialAwardsList }
    ];

    groups.forEach(g => {
      if (g.isNested) {
        const nestedGroups = g.subGroups.map(sub => {
          const records = sub.items.map(item => {
            const key = `${sub.id}_${item}`;
            return bests[key] || { category: sub.title.split(' (')[0], itemName: item, recordValue: '-', playerId: null, corps: [], is_empty: true, id: `empty_${key}` };
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
      setNewGameMap(loadedMap); setSoloType(sType); setNewGameGen(gameToEdit.generation); setSelectedExps(gameToEdit.expansions || []);
      setIsSoloMode(gameToEdit.isSolo || false);
      if (gameToEdit.isSolo && gameToEdit.results.length > 0) setSoloResult(gameToEdit.results[0].soloResult || '성공');
      setGameScores(gameToEdit.results.map(r => ({ playerId: r.playerId, corps: [...(r.corps||[])], score: r.score, mc: r.mc })));
    } else {
      setEditingGameId(null); setNewGameDate(new Date().toISOString().split('T')[0]); setNewGameMap('타르시스');
      setNewGameGen(10); setSelectedExps([...EXPANSIONS]); setIsSoloMode(false); setSoloType('나 홀로 화성에'); setSoloResult('성공');
      setGameScores([createEmptyScore(), createEmptyScore()]);
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
        await supabase.from('games').update({ date: newGameDate, map_name: finalMapName, generation: newGameGen, expansions: selectedExps, player_count: isSoloMode ? 1 : finalResults.length }).eq('id', editingGameId);
        await supabase.from('game_results').delete().eq('game_id', editingGameId);
        await supabase.from('game_results').insert(finalResults.map(r => ({ game_id: editingGameId, player_id: r.playerId, corps: r.corps, score: r.score, mc: r.mc, rank: r.rank, rating_change: r.ratingChange })));
      } else {
        const { data: newGame, error: gameErr } = await supabase.from('games').insert([{ season_id: selectedSeasonId === 'all' ? null : selectedSeasonId, date: newGameDate, map_name: finalMapName, generation: newGameGen, expansions: selectedExps, player_count: isSoloMode ? 1 : finalResults.length }]).select().single();
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
  // 💡 기네스 일괄 등록 및 승인 로직
  // ==========================================
  
  const handleAddToGuinnessBatch = () => {
    if (!gItem || gValue === '') return alert("항목과 수치를 모두 입력해주세요.");
    
    const val = Number(gValue);
    if ((gCategory === '생산력' || gCategory === '자원') && val < 10) return alert("생산력 및 기본 자원은 10 이상부터 가능합니다.");
    if (gCategory === '특수자원') {
      if (gSubCategory === '동물자원' && val < 10) return alert("동물자원은 10개 이상부터 가능합니다.");
      if (gSubCategory === '부양체자원' && val < 10) return alert("부양체자원은 10개 이상부터 가능합니다.");
      if (gSubCategory === '미생물자원' && val < 20) return alert("미생물자원은 20개 이상부터 가능합니다.");
    }

    const newItem = {
      id: Date.now() + Math.random(),
      category: gCategory,
      subCategory: gCategory === '특수자원' ? gSubCategory : null,
      itemName: gItem,
      recordValue: val
    };

    setGuinnessBatch([...guinnessBatch, newItem]);
    setGValue(''); 
  };

  const handleRemoveFromGuinnessBatch = (id) => {
    setGuinnessBatch(guinnessBatch.filter(b => b.id !== id));
  };

  const handleSaveGuinnessBatch = async () => {
    if (!gPlayerId || !gCorps || gCorps.length === 0) return alert("공통 정보(개척자, 기업)를 모두 입력해주세요.");
    if (guinnessBatch.length === 0) return alert("추가할 기록이 없습니다.");

    const pCountInt = parseInt(gCount.replace('인', ''), 10);
    const finalBatch = [];
    let rejectedCount = 0;

    for (let b of guinnessBatch) {
      const saveCategory = b.category === '특수자원' ? `특수자원_${b.subCategory}` : b.category;
      
      const currentBest = guinnessRecords.find(r => r.category === saveCategory && r.itemName === b.itemName && r.playerCount === pCountInt && r.is_approved && !r.is_hall_of_fame);
      let isBetter = true;
      
      if (currentBest) {
        if (b.itemName === '최소 TR') isBetter = b.recordValue < currentBest.recordValue;
        else isBetter = b.recordValue > currentBest.recordValue;
      }

      if (isBetter) {
        finalBatch.push({
          player_count: pCountInt, category: saveCategory, item_name: b.itemName, record_value: b.recordValue, 
          player_id: gPlayerId, corps: gCorps, game_id: gGameId || null, date: gDate,
          is_approved: isMaster, 
          is_hall_of_fame: false
        });
      } else {
        rejectedCount++;
      }
    }

    if (finalBatch.length === 0) return alert("입력하신 모든 기록이 현재 1위 기록과 같거나 낮아 등록이 취소되었습니다.");
    if (rejectedCount > 0) alert(`${rejectedCount}개의 기록은 기존 1위보다 낮아 제외되었습니다. 나머지 ${finalBatch.length}개를 서버에 전송합니다.`);
    else if (!isMaster) alert("서버에 전송 완료! 마스터의 승인 후 갱신됩니다.");

    await supabase.from('guinness_records').insert(finalBatch);
    setIsGuinnessModalOpen(false); 
    setGuinnessBatch([]); setGPlayerId(''); setGGameId(''); setGCorps([]); 
    setGDate(new Date().toISOString().split('T')[0]);
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

  // ==========================================
  // 폼 UI 헬퍼
  // ==========================================
  const toggleExp = (exp) => setSelectedExps(prev => prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]);
  
  // 💡 드롭다운 옵션 라벨에 알파벳 포함 (표시용: 홍길동A)
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
          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                {isAdminOrMaster && <button onClick={() => setIsMasterModalOpen(true)} className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-green-500 transition-colors relative">
                  <ShieldCheck size={16}/>
                  {(guinnessRecords.filter(r=>!r.is_approved).length > 0 || allUsers.filter(u=>!u.is_approved).length > 0) && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"/>}
                </button>}
                {isAdminOrMaster && <button onClick={() => setIsSeasonModalOpen(true)} className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-orange-500 transition-colors"><Settings size={16}/></button>}
                <button onClick={handleLogout} className="flex items-center gap-1 text-[10px] bg-slate-800 border border-slate-700 px-2 py-1.5 rounded-lg font-bold text-slate-300 hover:text-white"><LogOut size={12}/> {currentUser.username}</button>
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
                    <span className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold">{g.generation}세대</span>
                  </div>
                </div>
                {g.expansions && g.expansions.length > 0 && <div className="text-[9px] text-orange-500/80 font-bold mb-4 flex gap-1 flex-wrap">{g.expansions.map(e => <span key={e} className="border border-orange-900/50 px-1.5 py-0.5 rounded bg-orange-900/10">{e}</span>)}</div>}
                
                <div className="space-y-2.5">
                  {(g.results || []).sort((a,b)=>(a.rank||99) - (b.rank||99)).map(r => (
                    <div key={r.playerId} className={`flex justify-between items-center ${THEME_PANEL} p-3 rounded-2xl border ${THEME_BORDER}`}>
                      <div className="flex items-center gap-3">
                        {!g.isSolo && <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${r.rank===1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-slate-900 shadow-lg shadow-yellow-500/20' : r.rank===2 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>{r.rank}</div>}
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-200">{players.find(p=>p.id===r.playerId)?.name || r.playerId}</span>
                          <span className="text-[10px] text-slate-400 font-bold mt-0.5">{(r.corps||[]).join(' + ')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-black ${ACCENT_ORANGE}`}>{g.isSolo ? (r.score===1 ? '성공' : '실패') : r.score + ' VP'}</span>
                        {!g.isSolo && <span className={`text-[10px] font-black ${r.ratingChange > 0 ? 'text-green-500' : 'text-red-500'}`}>{r.ratingChange > 0 ? '▲ ' : '▼ '}{Math.abs(r.ratingChange||0)}</span>}
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
                  <div key={c.name} className="bg-slate-900 p-4 rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-colors flex justify-between items-center">
                    <div className="flex-1 pr-3">
                      <span className="text-sm font-black block text-slate-200 mb-1">{c.name}</span>
                      <span className="text-[10px] text-slate-500 font-bold">최다 기용: {players.find(p=>p.id===Object.entries(c.players).sort((a,b)=>b[1]-a[1])[0][0])?.name || '-'}</span>
                    </div>
                    <div className="text-right border-l border-slate-800 pl-4">
                      <span className="text-sm font-black text-orange-500 block mb-0.5">{Math.round((c.wins/c.plays)*100)}% 승률</span>
                      <span className="text-[10px] text-slate-500 font-bold">{c.plays}회 참여</span>
                    </div>
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
                    <div key={r.id} className="relative bg-gradient-to-br from-yellow-900 via-slate-900 to-slate-900 p-6 rounded-[2rem] border border-yellow-500/30 shadow-[0_10px_30px_rgba(234,179,8,0.15)] overflow-hidden">
                      <Crown className="absolute -right-6 -bottom-6 w-36 h-36 text-yellow-500/10 rotate-12" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-yellow-500 text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">{r.category.split('_')[1] || r.category}</span>
                          <span className="text-yellow-500/50 text-xs font-bold">{r.date}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-100 mb-1">{r.itemName}</h3>
                        <div className="text-5xl font-black text-yellow-400 drop-shadow-md mb-6">{r.recordValue}</div>
                        <div className="flex items-center gap-3 border-t border-yellow-500/20 pt-4">
                           <div className="flex-1">
                             <div className="text-[10px] text-yellow-600 font-black mb-1 uppercase tracking-widest">Pioneer</div>
                             <div className="text-lg font-black text-white">{players.find(p=>p.id===r.playerId)?.name || r.playerId}</div>
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
                                        <span className="text-[10px] font-bold text-slate-400">{r.is_empty ? '기록 없음' : (players.find(p=>p.id === r.playerId)?.name || r.playerId)}</span>
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
                                  {guinnessTab !== '통합' && !r.is_empty && <span className="text-[9px] bg-orange-900/30 text-orange-400 border border-orange-900/50 px-2 py-0.5 rounded-md font-black inline-block">{r.playerCount}인 달성</span>}
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
                                <span className="text-xs font-bold text-slate-400 mt-1">{r.is_empty ? '기록 없음' : (players.find(p=>p.id === r.playerId)?.name || r.playerId)}</span>
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
                <button onClick={() => setIsGuinnessModalOpen(true)} className={`bg-gradient-to-tr from-yellow-600 to-yellow-400 text-slate-950 px-5 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform active:scale-95 flex items-center gap-2 font-black text-sm`}>
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
                <span className="font-black text-orange-500 text-xl tracking-tight">v1.6.0 - Hall of Fame</span>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">2026.03.15</span>
              </div>
              <ul className="text-sm text-slate-300 space-y-4 list-disc list-inside font-bold leading-relaxed">
                <li>기네스 탭 상단에 <span className="text-yellow-500">👑 명예의 전당 (불멸의 기록)</span> 탭이 신설되어, 마스터가 지정한 불멸의 기록을 카드뉴스 형태로 멋지게 감상할 수 있습니다.</li>
                <li>기업 선택창 UI가 검색창에서 <span className="text-orange-300">그라데이션 칩 디자인</span>의 그리드 형태로 전면 개편되었습니다. 롱프레스 터치 시 합병 기업도 누적 추가됩니다.</li>
                <li>동명이인 구분을 위해 이름 뒤에 알파벳 식별자(A, B, C...)가 보이지 않게 처리되어 작동합니다. 등록 폼에서는 구분하고 랭킹에서는 깔끔하게 보여줍니다.</li>
                <li>기타 카테고리가 특별상으로 일원화되었으며, 없는 특별상은 즉석 신규 등록할 수 있습니다.</li>
              </ul>
            </div>
          </div>
        )}

        {/* 대국 추가 FAB (기록 탭) */}
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
          <button key={n.id} onClick={() => setActiveNav(n.id)} className={`flex flex-col items-center p-2 transition-all ${activeNav === n.id ? ACCENT_ORANGE + ' scale-110 drop-shadow-md' : 'text-slate-500 hover:text-slate-400'}`}><n.i size={24}/><span className="text-[9px] mt-1.5 font-black uppercase tracking-widest">{n.id}</span></button>
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
              <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 ml-1">이름</span><input type="text" placeholder="예: ywc1014" value={authUsername} onChange={e=>setAuthUsername(e.target.value)} className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-orange-500 font-bold"/></div>
              <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 ml-1">비밀 PIN (4자리)</span><input type="password" maxLength={4} placeholder="숫자만 입력" value={authPin} onChange={e=>setAuthPin(e.target.value)} className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-orange-500 font-black tracking-[0.5em] text-center"/></div>
              {authMode==='signup' && <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 ml-1">권한 구분</span><select value={authRoleReq} onChange={e=>setAuthRoleReq(e.target.value)} className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none font-bold"><option>개척자</option><option>관리자</option></select></div>}
              <button onClick={authMode==='login'?handleLogin:handleSignup} className={`w-full ${ACCENT_BG} text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-transform mt-2`}>{authMode==='login'?'시스템 접속':'개척자 등록'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 대국 추가 폼 모달 */}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><span className="text-[10px] font-black text-slate-500 ml-1 uppercase">Date</span><input type="date" value={newGameDate} onChange={e=>setNewGameDate(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white color-scheme-dark outline-none focus:border-orange-500"/></div>
                  <div className="space-y-1.5"><span className="text-[10px] font-black text-slate-500 ml-1 uppercase">Generation</span><input type="number" value={newGameGen} onChange={e=>setNewGameGen(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:border-orange-500"/></div>
                </div>
                <div className="space-y-2.5 pt-2">
                  <span className="text-[10px] font-black text-slate-500 block ml-1 uppercase tracking-widest">Map</span>
                  <div className="flex flex-wrap gap-2">
                    {MAPS.map(m => (
                      <button 
                        key={m} 
                        onClick={() => setNewGameMap(m)} 
                        className={`px-3 py-2 text-xs font-black rounded-xl border transition-all ${
                          newGameMap === m 
                            ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2.5 pt-3 border-t border-slate-700/50"><span className="text-[10px] font-black text-slate-500 block ml-1 uppercase tracking-widest">Expansions</span><div className="flex flex-wrap gap-2">{EXPANSIONS.map(exp => <button key={exp} onClick={() => toggleExp(exp)} className={`px-3 py-2 text-xs font-black rounded-xl border transition-all ${selectedExps.includes(exp) ? 'bg-orange-600 text-white border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>{exp}</button>)}</div></div>
              </div>

              <div className="flex justify-between items-center bg-slate-900 p-3 border border-slate-700 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2.5 ml-2"><div className={`w-2.5 h-2.5 rounded-full ${isSoloMode?'bg-purple-500 shadow-[0_0_10px_#a855f7]':'bg-green-500 shadow-[0_0_10px_#22c55e]'}`}/> <span className="text-sm font-black text-slate-200">인원 모드</span></div>
                <button onClick={() => setIsSoloMode(!isSoloMode)} className={`text-xs font-black px-4 py-2.5 rounded-xl border transition-all ${isSoloMode ? 'bg-purple-900/30 text-purple-300 border-purple-700' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-300'}`}>
                  {isSoloMode ? '1인 챌린지 (ON)' : '다인 경쟁 (ON)'}
                </button>
              </div>

              {isSoloMode && (
                <div className="flex gap-3 animate-in slide-in-from-top-4 duration-300">
                  <button onClick={() => setSoloType('나 홀로 화성에')} className={`flex-1 py-3.5 rounded-2xl text-xs font-black border transition-all ${soloType === '나 홀로 화성에' ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>나 홀로 화성에 (기본)</button>
                  <button onClick={() => setSoloType('도전 TR왕')} className={`flex-1 py-3.5 rounded-2xl text-xs font-black border transition-all ${soloType === '도전 TR왕' ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>도전 TR왕 (서곡)</button>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-end px-1"><h3 className="font-black text-orange-500 text-sm flex items-center gap-1.5"><Users size={18}/> 참가자별 최종 결과</h3>
                  {!isSoloMode && gameScores.length < 5 && <button onClick={() => setGameScores([...gameScores, createEmptyScore()])} className="text-xs font-black bg-slate-800 border border-slate-600 text-slate-300 px-3.5 py-2 rounded-xl hover:bg-slate-700 transition-colors shadow-md">+ 인원 추가</button>}
                </div>
                {gameScores.map((score, idx) => (
                  <div key={idx} style={{ zIndex: 60 - idx }} className={`${THEME_CARD} p-5 rounded-3xl border ${THEME_BORDER} shadow-2xl relative`}>
                    {!isSoloMode && gameScores.length > 1 && <button onClick={() => setGameScores(gameScores.filter((_,i)=>i!==idx))} className="absolute top-5 right-5 text-slate-500 hover:text-red-500 transition-colors"><X size={20}/></button>}
                    
                    <div className="mb-5 pr-8 space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">Select Player</span>
                        <SearchableSelect 
                          selectedValue={score.playerId} 
                          onChange={val => { const n=[...gameScores]; n[idx].playerId=val; setGameScores(n); }} 
                          options={playerOptions} placeholder="개척자 이름 검색..." 
                          onAddNew={async (name) => { const newId = await handleAddNewPlayer(name); const n=[...gameScores]; n[idx].playerId=newId; setGameScores(n); }}
                          addNewLabel="신규 등록"
                        />
                      </div>
                      
                      <div className="space-y-1.5 bg-slate-900/80 p-4 border border-slate-700 rounded-2xl relative">
                        <span className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-widest">Corporations (Max 3)</span>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(!score.corps || score.corps.length === 0) && <span className="text-xs text-slate-600 font-bold italic py-1">아래에서 기업을 선택하세요</span>}
                          {(score.corps || []).map(c => (
                            <span key={c} className="group relative text-[11px] bg-gradient-to-r from-slate-800 to-slate-700 text-orange-100 border border-slate-600 px-3.5 py-2 rounded-full flex items-center gap-1.5 font-bold shadow-md pr-8">
                              🏢 {c}
                              <button onClick={() => removeCorpFromScore(idx, c)} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-slate-950 transition-colors"><X size={12}/></button>
                            </span>
                          ))}
                        </div>
                        {(!score.corps || score.corps.length < 3) && (
                           <CorporationGrid selectedExps={selectedExps} selectedCorps={score.corps || []} onChange={(newCorps) => { const n=[...gameScores]; n[idx].corps=newCorps; setGameScores(n); }} />
                        )}
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

      {/* 기네스 일괄 등록 폼 */}
      {isGuinnessModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[150] flex flex-col justify-end animate-in fade-in duration-300">
          <div className={`${THEME_BG} w-full rounded-t-[2.5rem] p-6 pb-12 border-t border-slate-700 shadow-2xl max-h-[92vh] flex flex-col`}>
            <div className="flex justify-between items-center mb-6 shrink-0"><h2 className="text-white font-black text-xl flex items-center gap-2"><ListPlus className="text-yellow-500" size={24}/> 기네스 일괄 등록</h2><button onClick={()=>setIsGuinnessModalOpen(false)} className="text-slate-500 hover:text-white bg-slate-800 p-1.5 rounded-full"><X size={20}/></button></div>
            
            <div className="flex-1 overflow-y-auto space-y-5 scrollbar-hide pb-6">
              
              <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-700 shadow-inner space-y-5">
                <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-3"><div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]"></div><span className="text-xs font-black text-slate-300 uppercase tracking-widest">Common Settings</span></div>
                
                <div className="flex gap-3">
                  <select value={gCount} onChange={e=>setGCount(e.target.value)} className="flex-1 p-3.5 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 outline-none font-bold text-sm shadow-inner">{PLAYER_COUNTS.filter(p=>p!=='통합').map(c=><option key={c}>{c} 게임</option>)}</select>
                  <input type="date" value={gDate} onChange={e=>setGDate(e.target.value)} className="flex-1 p-3.5 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 outline-none font-bold text-sm color-scheme-dark shadow-inner"/>
                </div>

                <div className="space-y-1.5 z-50 relative"><span className="text-[10px] font-black text-slate-500 ml-1 uppercase">Pioneer</span><SearchableSelect selectedValue={gPlayerId} onChange={setGPlayerId} options={playerOptions} placeholder="개척자 검색..." onAddNew={async (name) => { const newId = await handleAddNewPlayer(name); setGPlayerId(newId); }} addNewLabel="신규 등록" /></div>
                
                <div className="space-y-1.5 z-40 relative"><span className="text-[10px] font-black text-slate-500 ml-1 uppercase">Corporations</span>
                  <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700/50 shadow-inner">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(gCorps.length === 0) && <span className="text-xs text-slate-600 font-bold italic py-1">아래에서 기업을 선택하세요</span>}
                      {gCorps.map(c=><span key={c} className="group relative text-[11px] bg-gradient-to-r from-slate-800 to-slate-700 text-orange-100 border border-slate-600 px-3.5 py-2 rounded-full flex items-center gap-1.5 font-bold shadow-md pr-8">🏢 {c} <button onClick={()=>setGCorps(gCorps.filter(x=>x!==c))} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-slate-950 transition-colors"><X size={12}/></button></span>)}
                    </div>
                    {gCorps.length < 3 && <CorporationGrid selectedExps={EXPANSIONS} selectedCorps={gCorps} onChange={setGCorps} />}
                  </div>
                </div>

                <div className="space-y-1.5"><span className="text-[10px] font-black text-slate-500 ml-1 uppercase">Reference Game</span><select value={gGameId} onChange={e=>setGGameId(e.target.value)} className="w-full p-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-300 text-xs font-bold outline-none shadow-inner"><option value="">-- 대국 목록에서 선택 (선택사항) --</option>{filteredGames.map(g=><option key={g.id} value={g.id}>{g.date} | {g.map}</option>)}</select></div>
              </div>

              <div className="bg-slate-800 p-6 rounded-3xl border border-slate-600 shadow-2xl space-y-5">
                <div className="flex items-center justify-between mb-2 border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_10px_#eab308]"></div><span className="text-xs font-black text-slate-200 uppercase tracking-widest">Record Details</span></div>
                </div>
                
                <select value={gCategory} onChange={e=>{
                  const cat = e.target.value; setGCategory(cat);
                  if (cat === '기본 기록') setGItem(CORE_ITEMS[0]); else if (cat === '자원') setGItem(RESOURCE_ITEMS[0]); else if (cat === '생산력') setGItem(PRODUCTION_ITEMS[0]); else if (cat === '최대 태그') setGItem(TAG_ITEMS[0]); else if (cat === '특수자원') { setGSubCategory('동물자원'); setGItem(SPECIAL_RESOURCES['동물자원'][0]); } else if (cat === '기업상') setGItem(AWARD_ITEMS[0]); else if (cat === '특별상') setGItem(SPECIAL_AWARDS_DEFAULT[0]); else setGItem('');
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
                  :gCategory==='특별상'?<SearchableSelect selectedValue={gItem} onChange={setGItem} options={SPECIAL_AWARDS_DEFAULT.map(a=>({value:a,label:a}))} placeholder="신규 특별상 검색/입력..." onAddNew={name=>setGItem(name)} addNewLabel="목록에 없나요? 신설하기" />
                  :<input type="text" value={gItem} onChange={e=>setGItem(e.target.value)} placeholder="직접 입력" className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none font-bold shadow-inner"/>}
                </div>
                
                <div className="flex gap-3">
                  <input type="number" value={gValue} onChange={e=>setGValue(e.target.value)} placeholder="최종 수치 입력" className="flex-1 p-4 bg-slate-950 border border-orange-500/50 text-orange-500 rounded-xl text-2xl font-black outline-none focus:border-orange-500 shadow-inner"/>
                  <button onClick={handleAddToGuinnessBatch} className="px-8 bg-slate-900 border border-slate-600 text-white font-black rounded-xl hover:bg-slate-700 active:scale-95 transition-all text-base shadow-lg">추가</button>
                </div>
              </div>

              {guinnessBatch.length > 0 && (
                <div className="bg-slate-900 p-5 rounded-3xl border border-slate-700 shadow-2xl space-y-3 animate-in slide-in-from-bottom-2">
                  <h3 className="text-xs font-black text-slate-400 mb-4 ml-1 uppercase tracking-widest border-b border-slate-800 pb-3">등록 대기열 ({guinnessBatch.length})</h3>
                  {guinnessBatch.map(b => (
                    <div key={b.id} className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-600 shadow-md">
                      <div>
                        <div className="text-[10px] text-orange-400 font-bold mb-1 uppercase flex gap-2">{b.category} {b.subCategory ? `> ${b.subCategory}` : ''}</div>
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
                
                {/* 💡 개인 통계 창 전용 시즌 필터 (글로벌과 분리하여 편의성 제공 가능하지만 현재는 글로벌 연동) */}
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
                
                <div className="bg-slate-900 p-5 rounded-3xl border border-slate-700 shadow-lg relative h-48">
                  <h3 className="text-xs font-black text-slate-500 mb-6 flex items-center gap-2 uppercase tracking-wider"><TrendingUp size={16} className="text-orange-500"/> Rating Performance</h3>
                  <div className="h-24 flex items-end justify-between px-4 relative">
                    <div className="absolute inset-x-4 top-1/2 border-t border-slate-800 border-dashed" />
                    {rh.map((h,i) => {
                      const height = ((h.rating - minR) / (maxR - minR)) * 100;
                      return (
                        <div key={i} className="group relative flex flex-col items-center w-full">
                          <div className="w-2.5 bg-gradient-to-t from-orange-800 to-orange-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]" style={{ height: `${height}%` }} />
                          <span className="absolute -top-6 text-[8px] font-black text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-950 px-1.5 py-0.5 rounded">{h.rating}</span>
                        </div>
                      )
                    })}
                  </div>
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
                      {isMaster && (
                        <button onClick={(e) => { e.stopPropagation(); handleToggleHallOfFame(h.id, h.is_hall_of_fame); }} className={`p-2 rounded-xl border ${h.is_hall_of_fame ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-yellow-500 hover:border-yellow-500/50'} transition-colors shrink-0`}>
                          <Crown size={16}/>
                        </button>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 truncate">
                          {i === 0 && <span className="text-[8px] bg-orange-600 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-lg shadow-orange-900/50 shrink-0">Current Best</span>}
                          {h.is_hall_of_fame && <span className="text-[8px] bg-yellow-600 text-slate-900 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter shrink-0">불멸</span>}
                          <span className="text-sm font-black text-slate-200 truncate">{players.find(p=>p.id===h.playerId)?.name || h.playerId}</span>
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
                        <div className="text-[10px] text-slate-500 font-black mb-1 flex gap-1">{r.category} • {r.playerCount}인</div>
                        <span className="font-black text-white text-base">{r.itemName} : {r.recordValue}</span>
                      </div>
                      <span className="text-xs font-black text-orange-400 text-right">신청자: {players.find(p=>p.id===r.playerId)?.name}</span>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-slate-800">
                      <button onClick={()=>handleApproveGuinness(r.id, true)} className="flex-1 bg-green-900/30 text-green-500 border border-green-800 py-2 text-xs font-bold rounded-lg hover:bg-green-800/50 transition-colors">승인</button>
                      <button onClick={()=>handleApproveGuinness(r.id, false)} className="p-2 bg-red-900/20 text-red-500 rounded-lg border border-red-900/50 hover:bg-red-900/40 px-4 font-bold text-xs">반려 (삭제)</button>
                    </div>
                  </div>
                ))}
                {guinnessRecords.filter(r=>!r.is_approved).length === 0 && <div className="text-center py-6 text-slate-600 font-black uppercase text-xs">대기 중인 기록이 없습니다.</div>}
              </div>

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
                <div className="flex-1 space-y-1"><span className="text-[10px] font-bold text-slate-500 ml-1">시작일</span><input type="date" value={seasonStart} onChange={e=>setSeasonStart(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-[10px] text-white color-scheme-dark"/></div>
                <div className="flex-1 space-y-1"><span className="text-[10px] font-bold text-slate-500 ml-1">종료일</span><input type="date" value={seasonEnd} onChange={e=>setSeasonEnd(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-[10px] text-white color-scheme-dark"/></div>
              </div>
              <button onClick={handleSaveSeason} className={`w-full ${ACCENT_BG} text-white font-black py-3.5 rounded-xl active:scale-95 transition-transform`}>Add New Season</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}