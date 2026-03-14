import { useState, useMemo, useEffect } from 'react';
import { Rocket, Map, Trophy, Star, Plus, Users, X, Check, Medal, History, ChevronLeft, Award, Settings, BarChart2, Edit, Trash2, PieChart, TrendingUp, Search, Lock, Unlock, Bell } from 'lucide-react';
// 💡 Supabase 클라이언트 임포트
import { supabase } from './supabase';

// --- 상수 및 기초 데이터 ---
const MAPS = ['기본(타르시스)', '헬라스', '엘리시움'];
const EXPANSIONS = ['서곡', '서곡2', '비너스넥스트', '개척기지', '격동'];
const GUINNESS_CATEGORIES = ['자원', '생산력', '기업상', '기타'];
const PLAYER_COUNTS = ['통합', '1인', '2인', '3인', '4인', '5인'];
const PRODUCTION_ITEMS = ['메가크레딧', '강철', '티타늄', '식물', '에너지', '열'];
const AWARD_ITEMS = ['지주', '은행가', '과학자', '온열기업가', '광부', '개척가', '자본가', '우주남작', '괴짜', '청부업자', '명사', '산업가', '사막녹화가', '부동산업자', '후원자', '비너스인'];

const CORPORATIONS = [
  { name: '타르시스 공화국', exp: '기본' }, { name: '에코라인', exp: '기본' }, { name: '크레디코르', exp: '기본' }, { name: '헬리온', exp: '기본' }, { name: '마이닝 길드', exp: '기본' }, { name: '인터플래너터리 시네마틱스', exp: '기본' }, { name: '새턴 시스템즈', exp: '기본' }, { name: '테라랙터', exp: '기본' }, { name: '유엔 화성 이니셔티브', exp: '기본' }, { name: '인벤트릭스', exp: '기본' }, { name: '포볼로그', exp: '기본' },
  { name: '아프로디테', exp: '비너스넥스트' }, { name: '셀레스틱', exp: '비너스넥스트' }, { name: '만박단', exp: '비너스넥스트' },
  { name: '포인트 루나', exp: '서곡' }, { name: '로빈슨 산업', exp: '서곡' }, { name: '밸리 트러스트', exp: '서곡' }, { name: '바이탈라이저', exp: '서곡' },
  { name: '포세이돈', exp: '개척기지' }, { name: '폴리펨', exp: '개척기지' },
  { name: '프리스토어', exp: '격동' }, { name: '테라랩스', exp: '격동' }
];

// --- 자동완성(Autocomplete) 검색 드롭다운 컴포넌트 ---
const SearchableSelect = ({ selectedValue, onChange, options, placeholder, onAddNew }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const matched = options?.find(o => o.value === selectedValue);
    if (matched) setQuery(matched.label);
    else if (!isOpen) setQuery('');
  }, [selectedValue, options, isOpen]);

  const safeOptions = options || [];
  const filtered = safeOptions.filter(o => o.label && o.label.toLowerCase().includes(query.toLowerCase()));
  const isExactMatch = safeOptions.some(o => o.label === query.trim());

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
        <Search size={14} className="text-slate-500" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value); setIsOpen(true);
          if (selectedValue) onChange(''); 
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        className="w-full pl-8 pr-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold outline-none text-slate-200 focus:border-orange-500 transition-colors"
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-slate-800 border border-slate-600 rounded-lg shadow-xl scrollbar-hide">
          {filtered.map(opt => (
            <div key={opt.value} onMouseDown={(e) => { e.preventDefault(); setQuery(opt.label); onChange(opt.value); setIsOpen(false); }}
                 className="p-2.5 hover:bg-slate-700 cursor-pointer text-sm font-medium text-slate-200 border-b border-slate-700/50 last:border-0">
              {opt.label}
            </div>
          ))}
          {!isExactMatch && query.trim() !== '' && onAddNew && (
            <div onMouseDown={(e) => { e.preventDefault(); onAddNew(query.trim()); setIsOpen(false); }}
                 className="p-2.5 bg-orange-900/30 hover:bg-orange-900/50 cursor-pointer text-sm font-black text-orange-500 border-t border-slate-700/50 flex items-center gap-1">
              <Plus size={14}/> "{query.trim()}" 신규 등록
            </div>
          )}
          {filtered.length === 0 && (!onAddNew || query.trim() === '') && (
            <div className="p-2 text-xs text-slate-500 text-center">검색 결과가 없습니다.</div>
          )}
        </div>
      )}
    </div>
  );
};

// --- 다인전 ELO 산출 로직 ---
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

function App() {
  const THEME_BG = "bg-slate-950"; const THEME_PANEL = "bg-slate-900"; const THEME_CARD = "bg-slate-800";
  const THEME_BORDER = "border-slate-700"; const THEME_TEXT_PRIMARY = "text-slate-200"; const THEME_TEXT_MUTED = "text-slate-400";
  const ACCENT_ORANGE = "text-orange-500"; const ACCENT_BG = "bg-orange-600";

  // --- 전역 상태 ---
  const [activeNav, setActiveNav] = useState('기록');
  const [isLoading, setIsLoading] = useState(true); // 💡 로딩 상태 추가
  
  // --- 인증 상태 ---
  const [currentUser, setCurrentUser] = useState(() => {
    // 💡 로컬 스토리지에서 자동 로그인 정보 불러오기
    const saved = localStorage.getItem('tfm_user');
    return saved ? JSON.parse(saved) : null;
  }); 
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [authRoleReq, setAuthRoleReq] = useState('개척자');
  const isAdminOrMaster = currentUser?.role === 'master' || currentUser?.role === '관리자';
  const canWrite = currentUser?.is_approved === true;

  // --- DB 데이터 ---
  const [players, setPlayers] = useState([]); 
  const [seasons, setSeasons] = useState([{ id: 'all', name: '프리 시즌 (전체)', start_date: null, end_date: null }]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('all');
  const [games, setGames] = useState([]);
  const [guinnessRecords, setGuinnessRecords] = useState([]); 
  const [allUsers, setAllUsers] = useState([]); // 마스터용 유저 관리 목록

  // --- 모달 상태 ---
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);
  const [isGuinnessModalOpen, setIsGuinnessModalOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false); // 마스터 모달
  const [selectedGuinnessHistory, setSelectedGuinnessHistory] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [editingGameId, setEditingGameId] = useState(null);
  const [selectedPlayerIdForStats, setSelectedPlayerIdForStats] = useState(null); 

  // --- 대국 추가 폼 상태 ---
  const [seasonName, setSeasonName] = useState(''); const [seasonStart, setSeasonStart] = useState(''); const [seasonEnd, setSeasonEnd] = useState('');
  const [newGameDate, setNewGameDate] = useState(new Date().toISOString().split('T')[0]);
  const [newGameMap, setNewGameMap] = useState('기본(타르시스)'); const [newGameGen, setNewGameGen] = useState(10);
  const [selectedExps, setSelectedExps] = useState([...EXPANSIONS]); 
  const [isSoloMode, setIsSoloMode] = useState(false);
  const [soloResult, setSoloResult] = useState('성공'); 
  
  const defaultScore = { playerId: '', corps: [], score: 0, mc: 0 };
  const [gameScores, setGameScores] = useState([{...defaultScore}, {...defaultScore}]);

  // --- 기네스 폼 상태 ---
  const [gCount, setGCount] = useState('4인'); const [gCategory, setGCategory] = useState('생산력');
  const [gItem, setGItem] = useState(PRODUCTION_ITEMS[0]); const [gValue, setGValue] = useState(0);
  const [gPlayerId, setGPlayerId] = useState(''); const [gCorps, setGCorps] = useState([]);
  const [gGameId, setGGameId] = useState(''); const [guinnessTab, setGuinnessTab] = useState('통합');

  // ==========================================
  // 💡 DB 데이터 불러오기 (Read)
  // ==========================================
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. 시즌 가져오기
      const { data: sData } = await supabase.from('seasons').select('*').eq('is_active', true).order('created_at', { ascending: true });
      if (sData) setSeasons([{ id: 'all', name: '프리 시즌 (전체)', start_date: null, end_date: null }, ...sData]);

      // 2. 플레이어 가져오기
      const { data: pData } = await supabase.from('players').select('*').eq('is_active', true);
      if (pData) setPlayers(pData);

      // 3. 기네스 기록 가져오기
      const { data: gRecData } = await supabase.from('guinness_records').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (gRecData) setGuinnessRecords(gRecData.map(r => ({...r, id: r.id, playerCount: r.player_count, category: r.category, itemName: r.item_name, recordValue: r.record_value, playerId: r.player_id, corps: r.corps, gameId: r.game_id})));

      // 4. 게임 및 결과 가져오기 (Join)
      const { data: gData } = await supabase
        .from('games')
        .select(`*, game_results ( player_id, corps, score, mc, rank, rating_change )`)
        .order('date', { ascending: false });

      if (gData) {
        const formattedGames = gData.map(g => ({
          id: g.id,
          date: g.date,
          map: g.map_name,
          generation: g.generation,
          expansions: g.expansions,
          is_active: g.is_active,
          isSolo: g.player_count === 1,
          results: g.game_results.map(r => ({
            playerId: r.player_id, corps: r.corps, score: r.score, mc: r.mc, rank: r.rank, ratingChange: r.rating_change,
            soloResult: g.player_count === 1 ? (r.score > 0 ? '성공' : '실패') : null // 1인 게임용 가상 처리
          }))
        }));
        setGames(formattedGames);
      }

      // 마스터일 경우 유저 목록도 가져옴
      if (currentUser?.role === 'master') {
        const { data: uData } = await supabase.from('users').select('*');
        if (uData) setAllUsers(uData);
      }

    } catch (error) { console.error('DB 로드 에러:', error.message); }
    finally { setIsLoading(false); }
  };

  // 앱 시작 시 한 번 실행, currentUser 변경 시 재실행
  useEffect(() => { fetchInitialData(); }, [currentUser?.role]);

  // ==========================================
  // 💡 인증 및 유저 관리 (Supabase)
  // ==========================================
  const handleLogin = async () => {
    if (!authUsername || !authPin) return alert("이름과 PIN을 입력해주세요.");
    
    // 특수 마스터 계정 (DB 없이 하드코딩)
    if (authUsername === 'master' && authPin === '0000') {
      const mUser = { username: 'MasterUser', role: 'master', is_approved: true };
      setCurrentUser(mUser); localStorage.setItem('tfm_user', JSON.stringify(mUser));
      setIsAuthModalOpen(false); setAuthUsername(''); setAuthPin(''); return;
    }

    const { data: user, error } = await supabase.from('users').select('*').eq('username', authUsername).eq('is_active', true).single();
    if (!user || error) return alert('존재하지 않는 유저이거나 PIN이 틀렸습니다.');
    if (user.pin !== authPin) return alert('PIN 번호가 일치하지 않습니다.');
    
    setCurrentUser(user); localStorage.setItem('tfm_user', JSON.stringify(user));
    setIsAuthModalOpen(false); setAuthUsername(''); setAuthPin('');
  };

  const handleSignup = async () => {
    if (!authUsername || !authPin) return alert("이름과 PIN을 입력해주세요.");
    const { data: existing } = await supabase.from('users').select('*').eq('username', authUsername).single();
    if (existing) return alert('이미 존재하는 이름입니다. 로그인해주세요.');
    
    let isPending = authRoleReq === '관리자';
    const newUser = { username: authUsername, pin: authPin, role: authRoleReq === '관리자' ? '개척자' : authRoleReq, is_approved: false };
    
    const { data, error } = await supabase.from('users').insert([newUser]).select().single();
    if (error) return alert("회원가입 오류: " + error.message);
    
    alert('가입 완료! 쓰기 권한은 마스터의 승인이 필요합니다.');
    setCurrentUser(data); localStorage.setItem('tfm_user', JSON.stringify(data));
    setIsAuthModalOpen(false); setAuthUsername(''); setAuthPin('');
  };
  
  const handleLogout = () => { if (window.confirm("로그아웃 하시겠습니까?")) { setCurrentUser(null); localStorage.removeItem('tfm_user'); } };

  const updateRole = async (userId, updates) => {
    await supabase.from('users').update(updates).eq('id', userId);
    fetchInitialData(); // 유저 목록 새로고침
  };

  // ==========================================
  // 💡 신규 개척자 DB 추가
  // ==========================================
  const handleAddNewPlayer = async (newPlayerName) => {
    if (!newPlayerName) return '';
    const existing = players.find(p => p.name === newPlayerName);
    if (existing) return existing.id;
    
    const { data, error } = await supabase.from('players').insert([{ name: newPlayerName, rating: 1500, games_played: 0 }]).select().single();
    if (error) { alert("개척자 추가 실패: " + error.message); return ''; }
    
    setPlayers(prev => [...prev, { id: data.id, name: data.name, rating: data.rating, gamesPlayed: data.games_played }]);
    return data.id;
  };

  // --- 1인/다인 모드 전환 ---
  useEffect(() => {
    if (isSoloMode) {
      if (gameScores.length > 0) setGameScores([{ ...gameScores[0] }]);
      else setGameScores([{ ...defaultScore }]);
    } else if (gameScores.length < 2) {
      setGameScores([...gameScores, { ...defaultScore }]);
    }
  }, [isSoloMode]);

  // --- 데이터 필터링 및 동적 ELO 엔진 ---
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

      if (!game.results) return;
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

  // --- 글로벌 기업 통계 ---
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

  // --- 기네스 필터링 ---
  const displayedGuinness = useMemo(() => {
    if (!guinnessRecords) return [];
    const season = seasons.find(s => s.id === selectedSeasonId);
    let validRecords = guinnessRecords;
    if (season?.start_date) validRecords = validRecords.filter(r => r.date >= season.start_date);
    if (season?.end_date) validRecords = validRecords.filter(r => r.date <= season.end_date);

    const bests = {};
    validRecords.forEach(r => {
      if (guinnessTab !== '통합' && r.playerCount !== parseInt(guinnessTab.replace('인', ''), 10)) return;
      const key = `${r.category}_${r.itemName}`;
      if (!bests[key] || bests[key].recordValue < r.recordValue) bests[key] = r;
    });
    return Object.values(bests).sort((a,b) => (a.category || '').localeCompare(b.category || ''));
  }, [guinnessRecords, guinnessTab, selectedSeasonId, seasons]);

  // ==========================================
  // 💡 저장/수정/삭제 핸들러 (Supabase)
  // ==========================================
  const handleSaveSeason = async () => {
    if (!seasonName) return alert("시즌 이름을 입력하세요.");
    const seasonData = { name: seasonName, start_date: seasonStart || null, end_date: seasonEnd || null };
    await supabase.from('seasons').insert([seasonData]);
    setSeasonName(''); setSeasonStart(''); setSeasonEnd(''); setIsSeasonModalOpen(false);
    fetchInitialData();
  };

  const openGameModal = (gameToEdit = null) => {
    if (gameToEdit) {
      setEditingGameId(gameToEdit.id); setNewGameDate(gameToEdit.date); setNewGameMap(gameToEdit.map);
      setNewGameGen(gameToEdit.generation); setSelectedExps(gameToEdit.expansions || []);
      setIsSoloMode(gameToEdit.isSolo || false);
      if (gameToEdit.isSolo && gameToEdit.results.length > 0) setSoloResult(gameToEdit.results[0].soloResult || '성공');
      setGameScores(gameToEdit.results.map(r => ({ playerId: r.playerId, corps: [...(r.corps||[])], score: r.score, mc: r.mc })));
    } else {
      setEditingGameId(null); setNewGameDate(new Date().toISOString().split('T')[0]); setNewGameMap('기본(타르시스)');
      setNewGameGen(10); setSelectedExps([...EXPANSIONS]); setIsSoloMode(false); setSoloResult('성공');
      setGameScores([{...defaultScore}, {...defaultScore}]);
    }
    setIsNewGameModalOpen(true);
  };

  const handleSaveGame = async () => {
    if (gameScores.some(s => !s.playerId || !s.corps || s.corps.length === 0)) return alert("참가자 및 기업을 정확히 입력해주세요.");
    
    let finalResults = [];
    if (isSoloMode) {
      // 1인 게임 DB 저장용 (승패 여부를 score 값 등으로 우회하거나 별도 컬럼 활용, 여기서는 score=1/0 로직 대체)
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
        // 수정 모드: Game 업데이트 후 Results 재작성
        await supabase.from('games').update({ date: newGameDate, map_name: newGameMap, generation: newGameGen, expansions: selectedExps, player_count: isSoloMode ? 1 : finalResults.length }).eq('id', editingGameId);
        await supabase.from('game_results').delete().eq('game_id', editingGameId);
        const resultPayloads = finalResults.map(r => ({ game_id: editingGameId, player_id: r.playerId, corps: r.corps, score: r.score, mc: r.mc, rank: r.rank, rating_change: r.ratingChange }));
        await supabase.from('game_results').insert(resultPayloads);
      } else {
        // 새 게임 저장
        const sId = selectedSeasonId === 'all' ? null : selectedSeasonId;
        const { data: newGame, error: gameErr } = await supabase.from('games').insert([{ season_id: sId, date: newGameDate, map_name: newGameMap, generation: newGameGen, expansions: selectedExps, player_count: isSoloMode ? 1 : finalResults.length }]).select().single();
        if (gameErr) throw gameErr;
        
        const resultPayloads = finalResults.map(r => ({ game_id: newGame.id, player_id: r.playerId, corps: r.corps, score: r.score, mc: r.mc, rank: r.rank, rating_change: r.ratingChange }));
        await supabase.from('game_results').insert(resultPayloads);
      }
      setIsNewGameModalOpen(false); fetchInitialData();
    } catch(e) { alert("저장 실패: " + e.message); }
  };

  const handleDeleteGame = async (id) => {
    if (window.confirm("대국을 삭제하시겠습니까? (통계에서 제외되며 복구는 DB에서만 가능합니다)")) {
      await supabase.from('games').update({ is_active: false }).eq('id', id);
      fetchInitialData();
    }
  };

  const handleSaveGuinness = async () => {
    if (!gItem || !gPlayerId || !gGameId || gValue <= 0 || !gCorps || gCorps.length === 0) return alert("입력값을 모두 확인해주세요.");
    const payload = { player_count: parseInt(gCount.replace('인', ''), 10), category: gCategory, item_name: gItem, record_value: gValue, player_id: gPlayerId, corps: gCorps, game_id: gGameId, date: new Date().toISOString().split('T')[0] };
    await supabase.from('guinness_records').insert([payload]);
    setIsGuinnessModalOpen(false); setGValue(0); setGPlayerId(''); setGGameId(''); setGCorps([]); fetchInitialData();
  };

  const toggleExp = (exp) => setSelectedExps(prev => prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]);
  const addCorpToScore = (idx, newCorp) => { const n = [...gameScores]; if (!n[idx].corps) n[idx].corps = []; if (n[idx].corps.length < 3 && !n[idx].corps.includes(newCorp)) n[idx].corps.push(newCorp); setGameScores(n); };
  const removeCorpFromScore = (idx, c) => { const n = [...gameScores]; if(n[idx].corps) n[idx].corps = n[idx].corps.filter(x => x !== c); setGameScores(n); };

  const playerOptions = players.map(p => ({ value: p.id, label: p.name }));
  const getCorpOptions = (activeExps) => CORPORATIONS.filter(c => c.exp === '기본' || activeExps.includes(c.exp)).map(c => ({ value: c.name, label: c.name }));

  if (isLoading) return <div className={`h-screen flex items-center justify-center ${THEME_BG} font-bold text-orange-500`}>우주선과 교신 중...</div>;

  return (
    <div className={`flex flex-col h-screen ${THEME_BG} font-sans relative overflow-hidden ${THEME_TEXT_PRIMARY}`}>
      
      {/* 헤더 */}
      <header className={`${THEME_PANEL} border-b border-orange-900/50 p-4 pt-10 shadow-lg z-20 shrink-0`}>
        <div className="flex items-center justify-between mb-3 min-h-[36px]">
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Rocket size={22} className={ACCENT_ORANGE}/> 
            {activeNav === '업데이트' ? '패치 노트' : activeNav === '기록' ? '개척 일지' : activeNav === '랭킹' ? '기업가 랭킹' : activeNav === '통계' ? '화성 통계' : '명예의 전당'}
          </h1>
          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                {isAdminOrMaster && <button onClick={() => setIsMasterModalOpen(true)} className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-green-500 transition-colors"><Users size={16}/></button>}
                {isAdminOrMaster && <button onClick={() => setIsSeasonModalOpen(true)} className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-orange-500 transition-colors"><Settings size={16}/></button>}
                <button onClick={handleLogout} className="flex items-center gap-1 text-[10px] bg-slate-800 border border-slate-700 px-2 py-1.5 rounded-lg font-bold text-slate-300 hover:text-white"><Unlock size={12}/> {currentUser.username}</button>
              </>
            ) : (
              <button onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} className="flex items-center gap-1 text-[10px] bg-orange-600 px-3 py-1.5 rounded-lg font-bold text-white hover:bg-orange-500"><Lock size={12}/> 로그인</button>
            )}
          </div>
        </div>
        {activeNav !== '업데이트' && (
          <select value={selectedSeasonId} onChange={e=>setSelectedSeasonId(e.target.value)} className={`w-full p-2 ${THEME_CARD} border ${THEME_BORDER} rounded-lg text-sm font-bold outline-none text-orange-400`}>
            {seasons.map(s => <option key={s.id} value={s.id}>{s.name} {s.start_date ? `(${s.start_date} ~ ${s.end_date||'진행중'})` : ''}</option>)}
          </select>
        )}
      </header>

      <main className="flex-1 overflow-y-auto flex flex-col relative pb-24 scrollbar-hide">
        
        {/* 1. 대국 기록 탭 */}
        {activeNav === '기록' && (
          <div className="p-4 space-y-4">
            {!canWrite && currentUser && <div className="bg-red-900/30 border border-red-500/50 p-3 rounded-lg text-xs text-red-400 font-bold flex items-center gap-2"><Lock size={14}/> 개척자 권한 대기 중입니다 (마스터 승인 필요)</div>}
            {filteredGames.length === 0 ? <div className={`mt-20 text-center ${THEME_TEXT_MUTED} font-bold`}>해당 시즌에 기록된 대국이 없습니다.</div> : 
              filteredGames.map(g => (
              <div key={g.id} className={`${THEME_CARD} p-4 rounded-2xl shadow-xl ${THEME_BORDER} border relative`}>
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-xs font-bold ${THEME_TEXT_MUTED}`}>{g.date}</span>
                  <div className="flex gap-1.5">
                    {g.isSolo && <span className="text-[10px] bg-purple-900/50 border border-purple-700 text-purple-300 px-2 py-0.5 rounded font-bold">1인 챌린지</span>}
                    <span className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold">{g.map}</span>
                    <span className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold">{g.generation}세대</span>
                  </div>
                </div>
                {g.expansions && g.expansions.length > 0 && <div className="text-[9px] text-orange-500/80 font-bold mb-3 flex gap-1 flex-wrap">{g.expansions.map(e => <span key={e} className="border border-orange-900/50 px-1.5 py-0.5 rounded bg-orange-900/10">{e}</span>)}</div>}
                
                <div className="space-y-2">
                  {(g.results || []).sort((a,b)=>(a.rank||99) - (b.rank||99)).map(r => (
                    <div key={r.playerId} className={`flex justify-between items-center ${THEME_PANEL} p-2.5 rounded-xl border ${THEME_BORDER}`}>
                      <div className="flex items-center gap-3">
                        {!g.isSolo && <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black ${r.rank===1 ? 'bg-yellow-600 text-slate-900' : r.rank===2 ? 'bg-slate-400 text-slate-900' : 'bg-orange-900 text-slate-300'}`}>{r.rank}</div>}
                        <div className="flex flex-col"><span className="text-sm font-bold text-slate-200">{players.find(p=>p.id===r.playerId)?.name || r.playerId}</span><span className="text-[10px] text-slate-400 font-medium">{(r.corps||[]).join(' + ')}</span></div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-black ${ACCENT_ORANGE}`}>{g.isSolo && r.score === 1 ? '성공' : g.isSolo && r.score === 0 ? '실패' : r.score + ' VP'}</span>
                        {g.isSolo ? null : (
                          <span className={`text-[10px] font-bold ${r.ratingChange > 0 ? 'text-green-500' : 'text-red-500'}`}>{r.ratingChange > 0 ? '▲ ' : '▼ '}{Math.abs(r.ratingChange||0)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {isAdminOrMaster && (
                  <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-slate-700">
                    <button onClick={() => openGameModal(g)} className="text-xs font-bold text-slate-400 hover:text-orange-400 flex items-center gap-1"><Edit size={12}/> 수정</button>
                    <button onClick={() => handleDeleteGame(g.id)} className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1"><Trash2 size={12}/> 삭제</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 2. 랭킹 탭 */}
        {activeNav === '랭킹' && (
          <div className="p-4">
            <div className={`${THEME_CARD} rounded-2xl shadow-xl ${THEME_BORDER} border overflow-hidden`}>
              <table className="w-full text-sm text-center">
                <thead className={`${THEME_PANEL} font-bold text-slate-400 border-b ${THEME_BORDER}`}>
                  <tr><th className="p-3">순위</th><th className="p-3 text-left">개척자</th><th className="p-3">승률</th><th className="p-3">ELO</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {Object.values(playerStatsEngine).filter(p=>p.gamesPlayed>0).sort((a,b)=>b.currentRating - a.currentRating).map((p, idx) => (
                    <tr key={p.id} onClick={() => setSelectedPlayerIdForStats(p.id)} className="hover:bg-slate-700/30 transition-colors cursor-pointer active:scale-[0.98]">
                      <td className="p-3 font-black text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-left text-slate-200 flex items-center gap-1.5">{idx===0 && <Medal size={14} className="text-yellow-500"/>}{p.name}</td>
                      <td className="p-3 text-slate-400">{Math.round((p.wins/p.gamesPlayed)*100)}%</td>
                      <td className={`p-3 font-black ${ACCENT_ORANGE}`}>{p.currentRating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {Object.values(playerStatsEngine).filter(p=>p.gamesPlayed>0).length === 0 && <p className="text-center text-xs text-slate-500 p-4">등록된 유저가 없습니다.</p>}
              <div className="p-2 text-center text-[10px] text-slate-500 bg-slate-900 border-t border-slate-700">이름을 클릭하면 개인 통계를 볼 수 있습니다.</div>
            </div>
          </div>
        )}

        {/* 3. 전체 통계 탭 */}
        {activeNav === '통계' && (
          <div className="p-4 space-y-4">
            <div className={`${THEME_CARD} rounded-2xl shadow-xl ${THEME_BORDER} border p-4`}>
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><PieChart size={16} className={ACCENT_ORANGE}/> 기업 픽률 및 승률 통계</h3>
              {globalCorpStats.length === 0 ? <p className="text-xs text-slate-500 text-center">데이터가 없습니다.</p> : (
                <div className="space-y-3">
                  {globalCorpStats.map(corp => (
                    <div key={corp.name} className="bg-slate-900 p-3 rounded-lg border border-slate-700 hover:border-orange-500/50 transition-colors">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-bold text-slate-200">{corp.name}</span>
                        <span className="text-xs font-black text-orange-500">{Math.round((corp.wins/corp.plays)*100)}% 승률</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>총 {corp.plays}회 픽</span>
                        <span>최다 픽: {players.find(p=>p.id===Object.entries(corp.players).sort((a,b)=>b[1]-a[1])[0][0])?.name || Object.entries(corp.players).sort((a,b)=>b[1]-a[1])[0][0]} ({Object.entries(corp.players).sort((a,b)=>b[1]-a[1])[0][1]}회)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. 기네스 탭 */}
        {activeNav === '기네스' && (
          <div className="flex flex-col h-full">
            <div className={`flex ${THEME_PANEL} border-b ${THEME_BORDER} shrink-0 overflow-x-auto scrollbar-hide text-sm`}>
              {PLAYER_COUNTS.map(t => <button key={t} onClick={() => setGuinnessTab(t)} className={`px-4 py-3 font-bold whitespace-nowrap transition-colors ${guinnessTab === t ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>)}
            </div>
            <div className="p-4 space-y-4">
              {displayedGuinness.length === 0 ? <p className="text-center text-slate-500 mt-10 font-bold">등록된 기록이 없습니다.</p> : 
                displayedGuinness.map(r => (
                  <div key={r.id} onClick={() => setSelectedGuinnessHistory(r)} className={`${THEME_CARD} p-4 rounded-xl shadow-md border border-slate-700 flex justify-between items-center cursor-pointer hover:border-orange-700 transition-colors`}>
                    <div>
                      <div className="flex gap-1.5 mb-1.5">
                        <span className="text-[9px] bg-slate-900 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-bold">{r.category}</span>
                        {guinnessTab === '통합' && <span className="text-[9px] bg-orange-900/30 text-orange-400 border border-orange-900/50 px-1.5 py-0.5 rounded font-bold">{r.playerCount}인 달성</span>}
                      </div>
                      <h3 className="text-sm font-bold text-slate-200">{r.itemName}</h3>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">{(r.corps||[]).join(' + ')}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-xl font-black ${ACCENT_ORANGE}`}>{r.recordValue}</span>
                      <span className="text-[10px] font-bold text-slate-400">{players.find(p=>p.id === r.playerId)?.name || r.playerId}</span>
                    </div>
                  </div>
                ))
              }
            </div>
            {canWrite && (
              <div className="fixed bottom-24 right-6 z-20">
                <button onClick={() => setIsGuinnessModalOpen(true)} className={`bg-yellow-600 text-slate-900 px-4 py-3 rounded-full shadow-lg hover:bg-yellow-500 transition-transform active:scale-95 flex items-center gap-2 font-black text-sm`}>
                  <Award size={20}/> 기록 갱신
                </button>
              </div>
            )}
          </div>
        )}

        {/* 5. 🔔 업데이트 로그 탭 */}
        {activeNav === '업데이트' && (
          <div className="p-4 space-y-4">
            <div className={`${THEME_CARD} p-5 rounded-2xl shadow-xl ${THEME_BORDER} border`}>
              <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                <span className="font-black text-orange-500 text-xl">v1.2.0</span>
                <span className="text-sm font-bold text-slate-400">2026/03/15</span>
              </div>
              <ul className="text-sm font-medium text-slate-300 space-y-2 pl-2 list-disc list-inside">
                <li>1인 게임 전용 모드(도전 TR왕 / 나홀로 화성에)를 완벽 지원합니다.</li>
                <li>Supabase 데이터베이스 연동이 완료되었습니다.</li>
                <li>개척자 쓰기 권한 승인 대기 시스템이 도입되었습니다.</li>
                <li>업데이트 패치노트 페이지가 추가되었습니다.</li>
              </ul>
            </div>
            <div className={`${THEME_CARD} p-5 rounded-2xl shadow-xl ${THEME_BORDER} border`}>
              <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                <span className="font-black text-orange-500 text-xl">v1.1.0</span>
                <span className="text-sm font-bold text-slate-400">2026/03/14</span>
              </div>
              <ul className="text-sm font-medium text-slate-300 space-y-2 pl-2 list-disc list-inside">
                <li>데이터베이스 소프트 삭제 기능 추가 (기록 복구 지원)</li>
                <li>검색창에서 신규 개척자를 즉시 생성할 수 있는 기능 추가</li>
                <li>'서곡: 합병' 규칙을 위해 기업 다중 선택 기능 지원</li>
              </ul>
            </div>
          </div>
        )}

        {/* 대국 추가 FAB (쓰기 권한자만 노출) */}
        {activeNav === '기록' && canWrite && (
          <div className="fixed bottom-24 right-6 z-20">
            <button onClick={() => openGameModal(null)} className={`${ACCENT_BG} text-white p-4 rounded-full shadow-xl hover:bg-orange-500 transition-transform active:scale-95`}>
              <Plus size={28} strokeWidth={3}/>
            </button>
          </div>
        )}
      </main>

      <nav className={`fixed bottom-0 w-full ${THEME_PANEL} border-t ${THEME_BORDER} flex justify-around p-2 pb-6 z-10`}>
        {[ { id:'기록', i:Map }, { id:'랭킹', i:Trophy }, { id:'통계', i:BarChart2 }, { id:'기네스', i:Star }, { id:'업데이트', i:Bell } ].map(n => (
          <button key={n.id} onClick={() => setActiveNav(n.id)} className={`flex flex-col items-center p-2 transition-colors ${activeNav === n.id ? ACCENT_ORANGE : 'text-slate-500'}`}>
            <n.i size={24}/><span className="text-[10px] mt-1 font-bold">{n.id}</span>
          </button>
        ))}
      </nav>

      {/* --- 모달: 로그인/회원가입 --- */}
      {isAuthModalOpen && (
        <div className="absolute inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 animate-in fade-in">
          <div className={`${THEME_CARD} w-full max-w-sm rounded-2xl p-6 relative shadow-2xl border ${THEME_BORDER}`}>
            <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20}/></button>
            <div className="flex mb-6 border-b border-slate-700">
              <button onClick={() => setAuthMode('login')} className={`flex-1 pb-2 font-bold ${authMode === 'login' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-500'}`}>로그인</button>
              <button onClick={() => setAuthMode('signup')} className={`flex-1 pb-2 font-bold ${authMode === 'signup' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-500'}`}>개척자 등록</button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="이름 (예: 테포마고수)" value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white outline-none focus:border-orange-500"/>
              <input type="password" maxLength={4} placeholder="비밀번호 (4자리)" value={authPin} onChange={e => setAuthPin(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white outline-none focus:border-orange-500"/>
              {authMode === 'signup' && (
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl">
                  <span className="block text-xs font-bold text-slate-400 mb-2">권한 요청</span>
                  <select value={authRoleReq} onChange={e => setAuthRoleReq(e.target.value)} className="w-full p-2 bg-slate-800 border border-slate-600 text-white font-bold outline-none rounded-lg">
                    <option value="개척자">일반 개척자</option>
                    <option value="관리자">관리자 (승인 필요)</option>
                  </select>
                </div>
              )}
              <button onClick={authMode === 'login' ? handleLogin : handleSignup} className={`w-full ${ACCENT_BG} text-white font-bold py-3.5 rounded-xl hover:bg-orange-500 active:scale-95 transition-all shadow-md`}>{authMode === 'login' ? '접속하기' : '등록하기'}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- 모달: 마스터/유저 관리 --- */}
      {isMasterModalOpen && (
        <div className="absolute inset-0 bg-black/80 z-[70] flex flex-col justify-end animate-in fade-in">
          <div className={`${THEME_BG} w-full h-[85%] rounded-t-3xl flex flex-col shadow-2xl border-t border-slate-700`}>
            <div className={`${THEME_PANEL} rounded-t-3xl p-4 flex justify-between text-white items-center border-b border-slate-800 shrink-0`}>
              <h2 className="text-lg font-bold flex gap-2"><Users size={18}/> 개척자 관리 보드</h2>
              <button onClick={() => setIsMasterModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {allUsers.filter(u => u.role !== 'master').map(u => (
                <div key={u.id} className={`${THEME_CARD} p-3 rounded-xl shadow-sm border ${THEME_BORDER}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white text-base">{u.username}</span>
                    <span className={`text-[10px] px-2 py-1 rounded font-bold ${u.role === '관리자' ? 'bg-blue-900/50 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>{u.role}</span>
                  </div>
                  {!u.is_approved && (
                    <div className="bg-orange-900/30 border border-orange-500/50 p-2 rounded-lg mb-2 flex justify-between items-center">
                      <span className="text-xs font-bold text-orange-400">⚠️ 쓰기 권한 대기중</span>
                      <button onClick={() => updateRole(u.id, { is_approved: true })} className="bg-orange-600 text-white px-2 py-1 text-xs font-bold rounded flex gap-1 items-center hover:bg-orange-500"><Check size={14}/> 승인</button>
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    {u.role === '관리자' ? (
                      <button onClick={() => updateRole(u.id, { role: '개척자' })} className="flex-1 py-1.5 bg-slate-700 text-slate-300 font-bold text-xs rounded-lg hover:bg-slate-600">권한 강등</button>
                    ) : (
                      <button onClick={() => updateRole(u.id, { role: '관리자' })} className="flex-1 py-1.5 bg-blue-900/50 text-blue-400 border border-blue-900 font-bold text-xs rounded-lg hover:bg-blue-900">관리자 임명</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- 모달: 시즌 관리 --- */}
      {isSeasonModalOpen && (
        <div className="absolute inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 animate-in fade-in">
          <div className={`${THEME_CARD} w-full max-w-sm rounded-2xl shadow-2xl p-5 border ${THEME_BORDER}`}>
            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg text-white">시즌 관리</h3><button onClick={() => setIsSeasonModalOpen(false)} className="text-slate-400"><X size={20}/></button></div>
            <div className="space-y-4">
              <div className="max-h-40 overflow-y-auto space-y-2 bg-slate-900 p-2 rounded-lg border border-slate-700">
                {seasons.map(s => (
                  <div key={s.id} className="text-xs bg-slate-800 p-2 rounded border border-slate-700 text-slate-300">
                    <span className="font-bold text-orange-400">{s.name}</span> <br/>
                    {s.start_date ? `${s.start_date} ~ ${s.end_date||'진행중'}` : '기간 제한 없음'}
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-700 space-y-3">
                <input type="text" placeholder="새 시즌 이름" value={seasonName} onChange={e=>setSeasonName(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-sm text-white outline-none focus:border-orange-500"/>
                <div className="flex gap-2">
                  <div className="flex-1"><span className="text-[10px] text-slate-500 mb-1 block">시작일</span><input type="date" value={seasonStart} onChange={e=>setSeasonStart(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white color-scheme-dark outline-none"/></div>
                  <div className="flex-1"><span className="text-[10px] text-slate-500 mb-1 block">종료일 (선택)</span><input type="date" value={seasonEnd} onChange={e=>setSeasonEnd(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white color-scheme-dark outline-none"/></div>
                </div>
                <button onClick={handleSaveSeason} className={`w-full ${ACCENT_BG} text-white font-bold py-3 rounded-lg`}>새 시즌 추가</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 모달: 대국 폼 --- */}
      {isNewGameModalOpen && (
        <div className="absolute inset-0 bg-black/80 z-[60] flex flex-col justify-end animate-in fade-in">
          <div className={`${THEME_BG} w-full h-[90%] rounded-t-3xl flex flex-col shadow-2xl border-t border-slate-700`}>
            <div className={`${THEME_PANEL} rounded-t-3xl p-4 flex justify-between items-center shrink-0 border-b border-slate-800`}>
              <h2 className="text-lg font-bold text-white">{editingGameId ? '기록 수정' : '새 화성 개척 기록'}</h2>
              <button onClick={() => setIsNewGameModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4 scrollbar-hide">
              <div className={`${THEME_CARD} p-3 rounded-xl border ${THEME_BORDER} shadow-lg space-y-3`}>
                <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400 w-10">일자</span><input type="date" value={newGameDate} onChange={e=>setNewGameDate(e.target.value)} className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-sm font-bold outline-none text-slate-200 color-scheme-dark"/></div>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2"><span className="text-xs font-bold text-slate-400 w-10">맵</span><select value={newGameMap} onChange={e=>setNewGameMap(e.target.value)} className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-xs font-bold outline-none text-slate-200">{MAPS.map(m=><option key={m}>{m}</option>)}</select></div>
                  <div className="flex-1 flex items-center gap-2"><span className="text-xs font-bold text-slate-400 w-10">세대</span><input type="number" value={newGameGen} onChange={e=>setNewGameGen(e.target.value)} className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-sm font-bold outline-none text-slate-200"/></div>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 mb-1 block">확장판 (다중 선택)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {EXPANSIONS.map(exp => <button key={exp} onClick={() => toggleExp(exp)} className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors ${selectedExps.includes(exp) ? 'bg-orange-600 text-white border-orange-500' : 'bg-slate-900 text-slate-400 border-slate-700'}`}>{exp}</button>)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pr-1">
                <button onClick={() => setIsSoloMode(!isSoloMode)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${isSoloMode ? 'bg-purple-900/50 text-purple-300 border-purple-700' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-300'}`}>
                  {isSoloMode ? '1인 게임 모드 (ON)' : '1인 게임 전환'}
                </button>
              </div>

              <div className="space-y-3 pb-10">
                <div className="flex justify-between items-end"><h3 className="font-bold text-orange-500 text-sm flex items-center gap-1"><Users size={16}/> 참가자별 결과</h3>
                  {!isSoloMode && gameScores.length < 5 && <button onClick={() => setGameScores([...gameScores, {...defaultScore}])} className="text-[10px] font-bold bg-slate-800 border border-slate-600 text-slate-300 px-2 py-1 rounded hover:bg-slate-700">+ 인원 추가</button>}
                </div>
                {gameScores.map((score, idx) => (
                  <div key={idx} className={`${THEME_CARD} p-3 rounded-xl border ${THEME_BORDER} shadow-lg relative`}>
                    {!isSoloMode && gameScores.length > 1 && <button onClick={() => setGameScores(gameScores.filter((_,i)=>i!==idx))} className="absolute top-2 right-2 text-slate-500 hover:text-red-500"><X size={16}/></button>}
                    
                    <div className="mb-3 pr-6 space-y-2">
                      <div className="relative z-[55]">
                        <SearchableSelect 
                          selectedValue={score.playerId} 
                          onChange={val => { const n=[...gameScores]; n[idx].playerId=val; setGameScores(n); }} 
                          options={playerOptions} 
                          placeholder="개척자 검색..." 
                          onAddNew={(name) => {
                            const newId = handleAddNewPlayer(name);
                            const n=[...gameScores]; n[idx].playerId=newId; setGameScores(n);
                          }}
                        />
                      </div>
                      
                      <div className="space-y-1.5 bg-slate-900 p-2 border border-slate-700 rounded relative z-[50]">
                        <span className="text-[10px] font-bold text-slate-500 block">선택된 기업 (합병 시 최대 3개)</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(!score.corps || score.corps.length === 0) && <span className="text-[10px] text-slate-500 italic">아래에서 기업을 추가하세요</span>}
                          {(score.corps || []).map(c => <span key={c} className="text-[10px] bg-slate-800 text-slate-300 border border-slate-600 px-2 py-1 rounded flex items-center gap-1 font-bold">{c} <X size={12} onClick={() => removeCorpFromScore(idx, c)} className="cursor-pointer text-slate-500 hover:text-red-400" /></span>)}
                        </div>
                        {(!score.corps || score.corps.length < 3) && (
                          <div className="mt-1">
                            <SearchableSelect selectedValue="" onChange={val => { if(val) addCorpToScore(idx, val); }} options={getCorpOptions(selectedExps)} placeholder="+ 기업 추가" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center bg-slate-900 p-2 rounded border border-slate-700">
                      <div className="flex-1"><span className="block text-[10px] font-bold text-slate-500 mb-0.5">최종 총점 (VP)</span><input type="number" value={score.score} onChange={e=>{const n=[...gameScores]; n[idx].score=Number(e.target.value); setGameScores(n);}} className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-lg font-black text-orange-500 text-center outline-none"/></div>
                      {!isSoloMode ? (
                        <div className="w-1/3"><span className="block text-[10px] font-bold text-slate-500 mb-0.5">동점판독 MC</span><input type="number" value={score.mc} onChange={e=>{const n=[...gameScores]; n[idx].mc=Number(e.target.value); setGameScores(n);}} className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-sm font-bold text-center outline-none text-slate-300"/></div>
                      ) : (
                        <div className="w-1/3">
                          <span className="block text-[10px] font-bold text-slate-500 mb-0.5 text-center">결과</span>
                          <button onClick={() => setSoloResult(prev => prev === '성공' ? '실패' : '성공')} className={`w-full p-2 border rounded text-sm font-bold transition-colors ${soloResult === '성공' ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-red-900/30 border-red-700 text-red-400'}`}>{soloResult}</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-4 ${THEME_PANEL} border-t ${THEME_BORDER} shrink-0`}><button onClick={handleSaveGame} className={`w-full ${ACCENT_BG} text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center`}><Check size={18} className="inline mr-1"/> 대국 결과 저장</button></div>
          </div>
        </div>
      )}

      {/* --- 모달: 기네스 기록 갱신 --- */}
      {isGuinnessModalOpen && (
        <div className="absolute inset-0 bg-black/80 z-[70] flex flex-col justify-end animate-in fade-in">
          <div className={`${THEME_BG} w-full rounded-t-3xl flex flex-col shadow-2xl p-5 pb-10 max-h-[90vh] overflow-y-auto border-t border-slate-700`}>
            <div className="flex justify-between items-center mb-5"><h2 className="text-lg font-bold text-white flex items-center gap-1"><Award size={20} className="text-orange-500"/> 기네스 기록 신청</h2><button onClick={()=>setIsGuinnessModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button></div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <select value={gCount} onChange={e=>setGCount(e.target.value)} className="flex-1 p-3 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl font-bold text-sm outline-none">{['1인','2인','3인','4인','5인'].map(c=><option key={c} value={c}>{c} 게임</option>)}</select>
                <select value={gCategory} onChange={e => {setGCategory(e.target.value); if(e.target.value==='생산력') setGItem(PRODUCTION_ITEMS[0]); else if(e.target.value==='기업상') setGItem(AWARD_ITEMS[0]); else setGItem('');}} className="flex-1 p-3 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl font-bold text-sm outline-none">{GUINNESS_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select>
              </div>
              
              <div>
                <span className="block text-xs font-bold text-slate-400 mb-1">상세 항목</span>
                {gCategory === '생산력' ? <select value={gItem} onChange={e=>setGItem(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl text-sm font-bold outline-none">{PRODUCTION_ITEMS.map(i => <option key={i} value={i}>{i} 생산력</option>)}</select>
                : gCategory === '기업상' ? <select value={gItem} onChange={e=>setGItem(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl text-sm font-bold outline-none">{AWARD_ITEMS.map(i => <option key={i} value={i}>{i} 기업상</option>)}</select>
                : <input type="text" value={gItem} onChange={e=>setGItem(e.target.value)} placeholder="직접 입력" className="w-full p-3 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl text-sm font-bold outline-none"/>}
              </div>
              
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-3">
                <span className="block text-xs font-bold text-slate-400 mb-1 border-b border-slate-800 pb-1">달성 정보</span>
                <div className="relative z-[55]">
                  <SearchableSelect 
                    selectedValue={gPlayerId} onChange={setGPlayerId} options={playerOptions} placeholder="개척자 검색..." 
                    onAddNew={(name) => { const newId = handleAddNewPlayer(name); setGPlayerId(newId); }}
                  />
                </div>
                
                <div className="bg-slate-800 border border-slate-600 p-2 rounded-lg space-y-1.5 relative z-[50]">
                  <span className="text-[10px] font-bold text-slate-500">달성 기업 (최대 3개)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {gCorps.length===0 && <span className="text-[10px] text-slate-500 italic">기업을 추가하세요</span>}
                    {gCorps.map(c => <span key={c} className="text-[10px] bg-slate-700 text-slate-300 px-2 py-1 rounded flex items-center gap-1 font-bold">{c} <X size={12} onClick={()=>setGCorps(gCorps.filter(x=>x!==c))} className="cursor-pointer hover:text-red-400"/></span>)}
                  </div>
                  {gCorps.length < 3 && <div className="mt-1"><SearchableSelect selectedValue="" onChange={val=>{if(val && !gCorps.includes(val)) setGCorps([...gCorps, val])}} options={getCorpOptions(EXPANSIONS)} placeholder="+ 기업 추가" /></div>}
                </div>
                <select value={gGameId} onChange={e=>setGGameId(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-600 text-slate-200 rounded-lg text-sm font-bold outline-none"><option value="">-- 해당 대국 선택 --</option>{filteredGames.map(g=><option key={g.id} value={g.id}>{g.date} | {g.map}</option>)}</select>
              </div>
              <div><span className="block text-xs font-bold text-slate-400 mb-1">기록 수치</span><input type="number" value={gValue} onChange={e=>setGValue(Number(e.target.value))} className="w-full p-4 bg-slate-900 border border-orange-900/50 text-orange-500 rounded-xl text-2xl text-center font-black outline-none"/></div>
              <button onClick={handleSaveGuinness} className={`w-full ${ACCENT_BG} text-white font-bold py-4 rounded-xl shadow-lg mt-2 active:scale-95 transition-transform`}>새 기록 등록하기</button>
            </div>
          </div>
        </div>
      )}

      {/* --- 모달: 개인 통계 상세 --- */}
      {selectedPlayerIdForStats && (() => {
        const p = playerStatsEngine[selectedPlayerIdForStats];
        if (!p) return null;
        const recentHistory = p.ratingHistory.slice(-8);
        const maxR = Math.max(...recentHistory.map(h=>h.rating)); const minR = Math.min(...recentHistory.map(h=>h.rating));
        const range = maxR === minR ? 10 : maxR - minR;
        
        return (
        <div className="absolute inset-0 bg-black/80 z-[70] flex flex-col justify-end animate-in fade-in">
          <div className={`${THEME_BG} w-full h-[85%] rounded-t-3xl shadow-2xl flex flex-col border-t border-slate-700`}>
            <div className={`${THEME_PANEL} p-5 flex flex-col gap-3 border-b border-slate-800 rounded-t-3xl`}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white">{p.name} 통계</h2>
                <button onClick={() => setSelectedPlayerIdForStats(null)} className="text-slate-400"><X size={24}/></button>
              </div>
              <select value={selectedSeasonId} onChange={e=>setSelectedSeasonId(e.target.value)} className={`w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs font-bold outline-none text-orange-400`}>
                {seasons.map(s => <option key={s.id} value={s.id}>{s.name} 기준 데이터로 보기</option>)}
              </select>
            </div>
            <div className="p-5 overflow-y-auto space-y-6 scrollbar-hide">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-700"><span className="block text-[10px] text-slate-500 mb-1">게임 수</span><span className="text-xl font-black text-white">{p.gamesPlayed}</span></div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-700"><span className="block text-[10px] text-slate-500 mb-1">승률 (1등)</span><span className="text-xl font-black text-orange-500">{p.gamesPlayed > 0 ? Math.round((p.wins/p.gamesPlayed)*100) : 0}%</span></div>
                <div className="bg-orange-900/30 p-3 rounded-xl border border-orange-500/30"><span className="block text-[10px] text-orange-400 mb-1">현재 ELO</span><span className="text-xl font-black text-orange-500">{p.currentRating}</span></div>
              </div>

              {/* 레이팅 그래프 */}
              <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
                <h3 className="text-xs font-bold text-slate-400 mb-4 flex items-center gap-1.5"><TrendingUp size={14}/> 최근 8게임 레이팅 변화</h3>
                {recentHistory.length < 2 ? <p className="text-xs text-slate-600 text-center py-4">게임 기록이 부족합니다.</p> : (
                  <div className="w-full h-32 relative flex items-end justify-between pt-4">
                    {recentHistory.map((h, i) => {
                      const heightPct = ((h.rating - minR) / range) * 80 + 10;
                      return (
                        <div key={i} className="flex flex-col items-center relative w-full group">
                          <span className="absolute -top-6 text-[9px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-1.5 py-0.5 rounded">{h.rating}</span>
                          <div className="w-2 bg-orange-500 rounded-t-sm transition-all duration-500" style={{ height: `${heightPct}%` }}></div>
                          <span className="text-[8px] text-slate-600 mt-1">{h.gameIdx}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 플레이한 기업 통계 */}
              <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
                <h3 className="text-xs font-bold text-slate-400 mb-3">플레이한 기업 (승률)</h3>
                {Object.keys(p.corpStats).length === 0 ? <p className="text-xs text-slate-600">기록이 없습니다.</p> : (
                  <div className="space-y-2">
                    {Object.entries(p.corpStats).sort((a,b)=>b[1].plays - a[1].plays).map(([cName, cStat]) => (
                      <div key={cName} className="flex justify-between items-center bg-slate-800 p-2.5 rounded border border-slate-700">
                        <span className="text-sm font-bold text-slate-300">{cName}</span>
                        <div className="text-right">
                          <span className="text-xs font-black text-orange-400">{Math.round((cStat.wins/cStat.plays)*100)}%</span>
                          <span className="text-[10px] text-slate-500 ml-2">({cStat.plays}회)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )})()}

      {/* --- 모달: 기네스 이력 조회 --- */}
      {selectedGuinnessHistory && (
        <div className="absolute inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 animate-in fade-in">
          <div className={`${THEME_CARD} w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] border ${THEME_BORDER}`}>
            <div className={`${THEME_PANEL} p-4 flex justify-between items-center text-white border-b border-slate-800`}><h3 className="font-bold text-base flex items-center gap-1.5"><History size={16} className="text-orange-500"/> [{selectedGuinnessHistory.category}] {selectedGuinnessHistory.itemName} 역사</h3><button onClick={() => setSelectedGuinnessHistory(null)} className="text-slate-400 hover:text-white"><X size={20}/></button></div>
            <div className="p-4 overflow-y-auto space-y-3 scrollbar-hide">
              {guinnessRecords.filter(r => r.category === selectedGuinnessHistory.category && r.itemName === selectedGuinnessHistory.itemName && (guinnessTab === '통합' || r.playerCount === parseInt(guinnessTab.replace('인',''), 10)))
                .sort((a,b) => b.recordValue - a.recordValue)
                .map((history, idx) => (
                  <div key={history.id} className={`flex justify-between items-center p-3 rounded-lg border ${idx === 0 ? 'bg-orange-900/20 border-orange-900/50' : 'bg-slate-900 border-slate-700'}`}>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        {idx === 0 && <span className="text-[9px] bg-orange-600 text-white px-1.5 py-0.5 rounded font-bold">현재 1위</span>}
                        <span className="text-sm font-bold text-slate-200">{players.find(p=>p.id===history.playerId)?.name || history.playerId}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 space-y-0.5 font-medium">
                        <p>🏢 {(history.corps||[]).join(' + ')}</p>
                        <p>📅 {history.date} ({history.playerCount}인)</p>
                      </div>
                    </div>
                    <span className={`text-xl font-black ${idx === 0 ? 'text-orange-500' : 'text-slate-500'}`}>{history.recordValue}</span>
                  </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;