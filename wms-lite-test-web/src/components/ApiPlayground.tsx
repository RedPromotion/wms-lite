import { useState, useEffect } from 'react';
import { API_CATALOG, type ApiEndpoint } from '../constants/apiCatalog';
import { apiClient } from '../utils/apiClient';
import {
  Play,
  Key,
  Trash2,
  Search,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  FileText,
  Layers,
  User,
  Database,
  ArrowRightLeft
} from 'lucide-react';

export default function ApiPlayground() {
  const [selectedApi, setSelectedApi] = useState<ApiEndpoint>(API_CATALOG[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');

  // Dynamic Request States
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [requestBody, setRequestBody] = useState('');

  // Auth State
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loginId, setLoginId] = useState('operator1');
  const [loginPassword, setLoginPassword] = useState('Password123!');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Response States
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState('');
  const [responseBody, setResponseBody] = useState<any>(null);
  const [responseHeaders, setResponseHeaders] = useState<any>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Sync token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('wms_access_token');
    setAccessToken(token);
  }, []);

  // Update input states when API selection changes
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedApi.pathParams) {
      selectedApi.pathParams.forEach(p => {
        params[p] = p === 'customerId' || p === 'warehouseId' || p === 'itemId' ? '1' : '';
      });
    }
    setPathParams(params);

    const queries: Record<string, string> = {};
    if (selectedApi.queryParams) {
      selectedApi.queryParams.forEach(q => {
        queries[q.key] = q.defaultValue || '';
      });
    }
    setQueryParams(queries);

    setRequestBody(selectedApi.bodyTemplate || '');

    setResponseStatus(null);
    setResponseBody(null);
    setResponseHeaders(null);
    setResponseTime(null);
    setErrorDetails(null);
  }, [selectedApi]);

  const handleSaveToken = (token: string) => {
    localStorage.setItem('wms_access_token', token);
    setAccessToken(token);
  };

  const handleClearToken = () => {
    localStorage.removeItem('wms_access_token');
    setAccessToken(null);
  };

  const handleQuickLogin = async (isAdmin: boolean) => {
    setIsAuthLoading(true);
    setErrorDetails(null);
    try {
      const url = isAdmin ? '/api/admin/admins/login' : '/api/members/login';
      const response = await apiClient.post(url, {
        loginId,
        password: loginPassword
      });

      const token = response.data?.accessToken;
      if (token) {
        handleSaveToken(token);
        setResponseBody(response.data);
        setResponseStatus(response.status);
        setResponseStatusText(response.statusText);
      } else {
        setErrorDetails('인증에 성공했으나 토큰이 반환되지 않았습니다.');
      }
    } catch (err: any) {
      setResponseStatus(err.response?.status || 500);
      setResponseStatusText(err.response?.statusText || 'Error');
      setResponseBody(err.response?.data || err.message);
      setErrorDetails('인증에 실패했습니다. 아이디 또는 패스워드를 확인해주세요.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSendRequest = async () => {
    setIsRequestLoading(true);
    setResponseStatus(null);
    setResponseBody(null);
    setResponseHeaders(null);
    setResponseTime(null);
    setErrorDetails(null);

    let finalPath = selectedApi.path;
    Object.entries(pathParams).forEach(([key, value]) => {
      finalPath = finalPath.replace(`{${key}}`, encodeURIComponent(value));
    });

    const activeQueries = Object.entries(queryParams).reduce((acc, [key, val]) => {
      if (val.trim() !== '') {
        acc[key] = val;
      }
      return acc;
    }, {} as Record<string, string>);

    let parsedBody: any = null;
    if (selectedApi.bodyTemplate && requestBody.trim() !== '') {
      try {
        parsedBody = JSON.parse(requestBody);
      } catch (e: any) {
        setErrorDetails(`JSON 파싱 에러: ${e.message}`);
        setIsRequestLoading(false);
        return;
      }
    }

    const startTime = performance.now();
    try {
      const response = await apiClient({
        method: selectedApi.method,
        url: finalPath,
        params: activeQueries,
        data: parsedBody
      });

      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResponseStatus(response.status);
      setResponseStatusText(response.statusText);
      setResponseBody(response.data);
      setResponseHeaders(response.headers);
    } catch (err: any) {
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResponseStatus(err.response?.status || 500);
      setResponseStatusText(err.response?.statusText || 'Network Error');
      setResponseBody(err.response?.data || { message: err.message });
      setResponseHeaders(err.response?.headers || null);
    } finally {
      setIsRequestLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(API_CATALOG.map(api => api.category)))];
  const methods = ['All', 'GET', 'POST', 'PUT', 'DELETE'];

  const filteredApis = API_CATALOG.filter(api => {
    const matchesCategory = selectedCategory === 'All' || api.category === selectedCategory;
    const matchesMethod = selectedMethod === 'All' || api.method === selectedMethod;
    const matchesSearch =
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.path.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesMethod && matchesSearch;
  });

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET': return 'badge-method badge-get';
      case 'POST': return 'badge-method badge-post';
      case 'PUT': return 'badge-method badge-put';
      case 'DELETE': return 'badge-method badge-delete';
      default: return 'badge-method';
    }
  };

  const getStatusBadgeClass = (status: number) => {
    if (status >= 200 && status < 300) return 'status-badge status-green';
    if (status >= 400 && status < 500) return 'status-badge status-orange';
    return 'status-badge status-red';
  };

  return (
    <div className="app-container">

      {/* HEADER SECTION */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon-box">
              <ArrowRightLeft style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-emerald)' }} />
            </div>
            <div className="title-box">
              <h1>
                WMS Lite <span className="title-badge">API Playground</span>
              </h1>
              <p className="subtitle">자바 스프링 백엔드 API 연동 및 모의 테스트 디버거</p>
            </div>
          </div>

          {/* Token Header Widget */}
          <div className="token-widget">
            <Key style={{ width: '1rem', height: '1rem', color: 'var(--color-amber)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>JWT Token:</span>
            {accessToken ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="token-value">{accessToken}</span>
                <button onClick={handleClearToken} className="btn-clear" title="토큰 삭제">
                  <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                  <span>Clear</span>
                </button>
              </div>
            ) : (
              <span style={{ color: '#555', fontStyle: 'italic' }}>토큰 없음 (로그인 필요)</span>
            )}
          </div>
        </div>
      </header>

      {/* QUICK LOGIN HELPER */}
      <section className="login-bar">
        <div className="login-bar-content">
          <span className="login-bar-title">
            <User style={{ width: '0.875rem', height: '0.875rem', color: 'var(--text-muted)' }} />
            빠른 로그인 도우미:
          </span>
          <input
            type="text"
            placeholder="아이디"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className="login-input"
          />
          <input
            type="password"
            placeholder="패스워드"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="login-input"
          />

          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button onClick={() => handleQuickLogin(false)} disabled={isAuthLoading} className="btn-login">
              일반회원 로그인
            </button>
            <button onClick={() => handleQuickLogin(true)} disabled={isAuthLoading} className="btn-login">
              관리자 로그인
            </button>
          </div>
          {isAuthLoading && <span style={{ color: '#555', animation: 'pulse 1s infinite' }}>인증 요청 중...</span>}
        </div>
      </section>

      {/* MAIN 3-COLUMN LAYOUT */}
      <main className="main-dashboard">

        {/* COLUMN 1: API CATALOG SIDEBAR */}
        <section className="panel catalog-panel">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="API 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Category & Method Filters */}
          <div className="filter-row">
            <span className="filter-label">도메인 분류 (Domain)</span>
            <div className="filter-tags">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat === 'All' ? '전체' : cat.split('. ')[1]?.split(' (')[0] || cat}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row" style={{ marginTop: '0.25rem' }}>
            <span className="filter-label">REST 메서드 분류 (HTTP Method)</span>
            <div className="filter-tags">
              {methods.map(m => {
                let activeClass = '';
                if (selectedMethod === m) {
                  if (m === 'All') activeClass = 'active';
                  else activeClass = `active-${m.toLowerCase()}`;
                }
                return (
                  <button
                    key={m}
                    onClick={() => setSelectedMethod(m)}
                    className={`tab-btn ${activeClass}`}
                  >
                    {m === 'All' ? '전체' : m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* API List */}
          <div className="api-list">
            {filteredApis.map(api => (
              <button
                key={api.id}
                onClick={() => setSelectedApi(api)}
                className={`api-item-btn ${selectedApi.id === api.id ? 'selected' : ''}`}
              >
                <div className="api-item-meta">
                  <div className="api-item-top">
                    <span className={getMethodBadgeClass(api.method)}>
                      {api.method}
                    </span>
                    <span className="api-path-text">{api.path}</span>
                  </div>
                  <span className="api-name-text">{api.name}</span>
                </div>
                <ChevronRight style={{ width: '0.875rem', height: '0.875rem', color: '#444', flexShrink: 0 }} />
              </button>
            ))}
            {filteredApis.length === 0 && (
              <div className="empty-viewer" style={{ padding: '2rem 0' }}>검색된 API가 없습니다.</div>
            )}
          </div>
        </section>

        {/* COLUMN 2: REQUEST BUILDER */}
        <section className="panel request-panel">
          <div className="request-header">
            <div className="request-header-top">
              <span className={getMethodBadgeClass(selectedApi.method)}>
                {selectedApi.method}
              </span>
              <span className="request-path">{selectedApi.path}</span>
            </div>
            <h2 className="request-title">{selectedApi.name}</h2>
            <p className="request-desc">{selectedApi.description}</p>
          </div>

          {/* PATH PARAMETERS */}
          {selectedApi.pathParams && selectedApi.pathParams.length > 0 && (
            <div className="param-section">
              <h3 className="param-section-title">
                <Layers style={{ width: '0.875rem', height: '0.875rem', color: 'var(--text-muted)' }} />
                Path Parameters (경로 변수)
              </h3>
              <div className="param-grid">
                {selectedApi.pathParams.map(param => (
                  <div key={param} className="param-row">
                    <span className="param-label">{`{${param}}`}:</span>
                    <input
                      type="text"
                      value={pathParams[param] || ''}
                      onChange={(e) => setPathParams({ ...pathParams, [param]: e.target.value })}
                      placeholder={`${param} 값`}
                      className="param-input"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUERY PARAMETERS */}
          {selectedApi.queryParams && selectedApi.queryParams.length > 0 && (
            <div className="param-section">
              <h3 className="param-section-title">
                <Search style={{ width: '0.875rem', height: '0.875rem', color: 'var(--text-muted)' }} />
                Query Parameters (쿼리 변수)
              </h3>
              <div className="param-grid">
                {selectedApi.queryParams.map(query => (
                  <div key={query.key} className="param-input-col">
                    <span className="param-desc-lbl">{query.label} ({query.key})</span>
                    <input
                      type="text"
                      value={queryParams[query.key] || ''}
                      onChange={(e) => setQueryParams({ ...queryParams, [query.key]: e.target.value })}
                      placeholder={query.placeholder}
                      className="param-input"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REQUEST BODY */}
          {selectedApi.bodyTemplate && (
            <div className="body-editor-container">
              <h3 className="param-section-title" style={{ marginBottom: '0.375rem' }}>
                <FileText style={{ width: '0.875rem', height: '0.875rem', color: 'var(--text-muted)' }} />
                Request Body (요청 본문 - JSON)
              </h3>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="body-textarea"
                placeholder="{}"
              />
            </div>
          )}

          {/* Submit Trigger */}
          <button onClick={handleSendRequest} disabled={isRequestLoading} className="btn-send">
            {isRequestLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>서버 응답 대기 중...</span>
              </span>
            ) : (
              <>
                <Play style={{ width: '1rem', height: '1rem', fill: 'currentColor' }} />
                <span>요청 전송 (Send Request)</span>
              </>
            )}
          </button>
        </section>

        {/* COLUMN 3: RESPONSE CONSOLE */}
        <section className="panel response-panel">
          <div className="response-header">
            <h2 className="response-title-lbl">
              <Database style={{ width: '1rem', height: '1rem', color: 'var(--color-emerald)' }} />
              Response Console
            </h2>

            {responseStatus && (
              <div className="status-badge-container">
                <span className={getStatusBadgeClass(responseStatus)}>
                  {responseStatus} {responseStatusText}
                </span>
                {responseTime && (
                  <span className="latency-lbl">
                    <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
                    {responseTime}ms
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Error notifications */}
          {errorDetails && (
            <div className="error-banner">
              <AlertCircle style={{ width: '1rem', height: '1rem', color: 'var(--color-rose)', flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <span className="error-banner-title">에러 알림:</span>
                <p style={{ marginTop: '0.125rem', color: '#fca5a5' }}>{errorDetails}</p>
              </div>
            </div>
          )}

          {/* Response Payload Code Block */}
          <div className="payload-container">
            <div className="payload-meta">
              <span style={{ fontWeight: 600 }}>JSON Response Body:</span>
              {responseBody && (
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(responseBody, null, 2))}
                  className="btn-copy"
                  title="복사하기"
                >
                  <Copy style={{ width: '0.875rem', height: '0.875rem' }} />
                  <span>Copy</span>
                </button>
              )}
            </div>

            <div className="payload-viewer">
              {responseBody ? (
                <pre className="payload-pre-json">
                  {JSON.stringify(responseBody, null, 2)}
                </pre>
              ) : (
                <div className="empty-viewer">
                  <CheckCircle className="empty-viewer-icon" />
                  <span>요청 전송 대기 중</span>
                </div>
              )}
            </div>
          </div>

          {/* Response Headers */}
          {responseHeaders && (
            <div className="headers-container">
              <span className="headers-title">Response Headers:</span>
              <pre className="headers-pre">{JSON.stringify(responseHeaders, null, 2)}</pre>
            </div>
          )}
        </section>

      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div>
          &copy; WMS Lite Server Testing Center. Loaded API Spec version: 1.0.0
        </div>
      </footer>

    </div>
  );
}
