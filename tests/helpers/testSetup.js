import { jest } from '@jest/globals';

/**
 * A test helper that sets up a mocked version of our Express app.
 * @returns {Promise<{app: object, apiClient: object}>} A promise that resolves to an object containing the Express app instance and the mocked apiClient.
 */

export const setupMockedApp = async () => {

    jest.unstable_mockModule('../../src/apiClient.js', () => ({
    getBooks: jest.fn(),
    }));

    const apiClient = await import('../../src/apiClient.js');

    const appModule = await import('../../src/app.js');
    const app = appModule.default;

    return { app, apiClient }
};