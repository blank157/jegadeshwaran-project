import api from './api';

/**
 * Generate a preview of a SWIFT MT message without persisting it.
 *
 * @param {object} data  - Message payload (messageType + field values)
 * @returns {Promise<{ raw: string, fields: object[] }>}
 */
export const previewMessage = async (data) => {
  const response = await api.post('/api/messages/preview', data);
  return response.data;
};

/**
 * Persist a validated SWIFT MT message to the backend.
 *
 * @param {object} data  - Message payload (messageType + field values)
 * @returns {Promise<{ id: string, reference: string, createdAt: string }>}
 */
export const saveMessage = async (data) => {
  const response = await api.post('/api/messages', data);
  return response.data;
};

/**
 * Retrieve a paginated list of saved messages.
 *
 * @param {object} [params]            - Optional query parameters
 * @param {number} [params.page]       - Page number (1-based)
 * @param {number} [params.size]       - Page size
 * @param {string} [params.type]       - Filter by message type (e.g. "MT103")
 * @param {string} [params.startDate]  - ISO date string
 * @param {string} [params.endDate]    - ISO date string
 * @returns {Promise<{ content: object[], totalElements: number, totalPages: number }>}
 */
export const getMessages = async (params) => {
  const response = await api.get('/api/messages', { params });
  return response.data;
};

/**
 * Fetch a single message by its database ID.
 *
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export const getMessageById = async (id) => {
  const response = await api.get(`/api/messages/${id}`);
  return response.data;
};

/**
 * Search for messages matching a SWIFT transaction reference.
 *
 * @param {string} reference  - e.g. "REF20240101001"
 * @returns {Promise<object[]>}
 */
export const searchMessageByReference = async (reference) => {
  const response = await api.get('/api/messages/search', {
    params: { reference },
  });
  return response.data;
};

/**
 * Retrieve aggregated statistics for the dashboard widgets.
 *
 * @returns {Promise<{ totalMessages: number, todayMessages: number, messagesByType: object }>}
 */
export const getDashboardStats = async () => {
  const response = await api.get('/api/messages/dashboard');
  return response.data;
};

/**
 * Fetch the list of supported SWIFT MT message types (e.g. MT103, MT202).
 *
 * @returns {Promise<{ code: string, description: string }[]>}
 */
export const getMessageTypes = async () => {
  const response = await api.get('/api/messages/types');
  return response.data;
};
