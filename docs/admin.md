관리자 페이지 – 프론트 핵심 코드



사용자 관리 (검색/정렬/페이징/버튼 제어)



설명: 서버에서 받아온 전체 리스트를 프론트에서 검색→정렬→페이징으로 가공 렌더링. 자기 자신 삭제 방지, 관리자/비활성 상태에 따른 버튼 비활성화 등 UI 가드를 적용.

핵심 코드:

const filteredUsers = userList.filter(u => u.username?.toLowerCase().includes(filteredSearch.toLowerCase()) || u.email?.toLowerCase().includes(filteredSearch.toLowerCase()));

const sortedUsers = \[...filteredUsers].sort((a, b) => { let av=a\[sortBy], bv=b\[sortBy]; if (sortBy==="created\_at"){ av=new Date(av); bv=new Date(bv);} if (typeof av==="string"){ return sortOrder==="asc" ? av.localeCompare(bv) : bv.localeCompare(av);} return sortOrder==="asc" ? av-bv : bv-av; });

const startIndex = (currentPage - 1) \* itemsPerPage; const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

const handleSort = (field) => { if (sortBy===field) setSortOrder(sortOrder==="asc"?"desc":"asc"); else { setSortBy(field); setSortOrder("desc"); } };

삭제 버튼 비활성화: disabled={u.user\_id === user.login.user\_id}

관리자 토글 비활성화: disabled={u.user\_id === user.login.user\_id || (!u.is\_admin \&\& !u.is\_active)}



공지 관리 (다국어/번역 상태 반영, 모달 편집)



설명: 언어 셀렉트 변경 시 목록 자동 갱신. 공지의 원문/번역 상태를 프론트에서 판별하여 버튼/문구를 조건부로 렌더링. 수정/추가 폼은 모달로 열고 입력 상태를 양방향 바인딩.

핵심 코드:

언어 전환 트리거: useEffect(() => { fetchNotices(); }, \[language]);

목록 필터: const onlyNotices = json.data.filter(post => post.is\_notice);

번역 상태 표시: notice.origin\_language===language ? "원문" : (notice.has\_translation ? "번역완료" : "번역필요")

행 클릭 상세 열람, 내부 “번역하기” 버튼은 e.stopPropagation()으로 행 클릭 이벤트 차단

모달 편집 바인딩: value={editSubject} onChange={e=>setEditSubject(e.target.value)} (내용도 동일 패턴)



QnA 관리 (상세·댓글 병렬 로딩, 답변/삭제 UI)



설명: 리스트 행 클릭 시 질문 상세와 댓글 목록을 병렬로 불러와 모달에서 즉시 보여줌. 답변 입력값 상태 관리, 댓글 삭제 시 낙관적 UI 반영으로 반응성 강화.

핵심 코드:

행 클릭: const \[postRes, commentRes] = await Promise.all(\[ fetch(${API\_BASE}/api/posts/${id}?...), fetch(${API\_BASE}/api/posts/${id}/comments?...) ]); setPostDetail(postJson.data); setComments(commentJson.data.comments); setIsModalOpen(true);

답변 입력 바인딩: value={answerContent} onChange={e=>setAnswerContent(e.target.value)}

댓글 삭제 후 즉시 제거: setComments(prev => prev.filter(c => c.comment\_id !== commentId))



채팅 세션 관리 (유저별 그룹핑/펼침, 메시지 미리보기, 모달)



설명: 관리자 전용 세션 목록을 받아 user\_id 기준으로 그룹핑하여 상위(유저)·하위(세션) 2단 테이블로 표시. 펼침/접기 상태는 expandedUsers로 제어. 메시지 미리보기는 길이 제한과 툴팁을 적용.

핵심 코드:

그룹핑: const grouped = sessions.reduce((acc,s)=>{ const uid=s.user\_id; (acc\[uid] ||= { user\_id:uid, username:s.user\_info?.username||"Unknown", sessions:\[] }).sessions.push(s); return acc; }, {});

펼침 토글: const toggleUser = (uid) => setExpandedUsers(prev => prev.includes(uid) ? prev.filter(id=>id!==uid) : \[...prev, uid]);

미리보기 축약: const preview = lastMessage ? (lastMessage.length>20 ? lastMessage.slice(0,20)+"..." : lastMessage) : "-"; title={lastMessage||""}

모달 열기: setSelectedSession(session\_id); setSessionMessages(list); setIsModalOpen(true)



공통 UX 가드(안전장치/포맷)



설명: 위험 작업 전 confirm, 버튼 조건부 비활성화, 한국 로케일 날짜 포맷, 외부 클릭으로 모달 닫기 등 일관된 UX 패턴 적용.

핵심 코드:

confirm("정말 삭제하시겠습니까?")로 의도 확인 후 진행

날짜 포맷: new Date(value).toLocaleString("ko-KR")

모달 오버레이 onClick={() => setIsModalOpen(false)}, 내부 컨텐츠는 e.stopPropagation()

