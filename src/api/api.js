// Use relative URLs since frontend and backend are on same domain
const API_BASE_URL = '';

export const API_ENDPOINTS = {
    trends: `${API_BASE_URL}/api/trends`,
    scope: `${API_BASE_URL}/api/scope`,
    health: `${API_BASE_URL}/health`
};
