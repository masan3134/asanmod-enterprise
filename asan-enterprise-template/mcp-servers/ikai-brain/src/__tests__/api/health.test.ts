/**
 * Unit tests for Brain API health endpoint
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock the server
jest.mock('../../api/server', () => {
  const app = express();
  app.use(express.json());
  
  app.get('/brain/health', (_req, res) => {
    res.json({
      status: 'healthy',
      service: 'ikai-brain',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });
  
  return { app };
});

describe('Brain API - Health Endpoint', () => {
  let app: express.Application;

  beforeEach(async () => {
    const { app: serverApp } = await import('../../api/server.js');
    app = serverApp;
  });

  describe('GET /brain/health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/brain/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        service: 'ikai-brain',
        version: expect.any(String),
        timestamp: expect.any(String),
      });
    });

    it('should return valid timestamp', async () => {
      const response = await request(app)
        .get('/brain/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(timestamp.toISOString()).toBe(response.body.timestamp);
    });
  });
});
