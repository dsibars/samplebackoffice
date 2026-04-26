import { describe, it, expect } from 'vitest';
import { SSMPathService } from './SSMPathService';

describe('SSMPathService', () => {
  const patterns = [
    '/{env}/config/infra/{container}/',
    '/{env}/config/{service}/',
  ];

  describe('parsePath', () => {
    it('should match pattern 1 correctly', () => {
      const path = '/live/config/auth/jwt.secret';
      const result = SSMPathService.parsePath(path, patterns);
      expect(result).toEqual({
        pattern: '/{env}/config/{service}/',
        variables: { env: 'live', service: 'auth' },
        propertyName: 'jwt.secret',
      });
    });

    it('should match pattern 2 correctly', () => {
      const path = '/live/config/infra/ee6798/some.property';
      const result = SSMPathService.parsePath(path, patterns);
      expect(result).toEqual({
        pattern: '/{env}/config/infra/{container}/',
        variables: { env: 'live', container: 'ee6798' },
        propertyName: 'some.property',
      });
    });

    it('should handle unmatched paths', () => {
      const path = '/unmatched/path/to/key';
      const result = SSMPathService.parsePath(path, patterns);
      expect(result).toEqual({
        pattern: null,
        variables: {},
        propertyName: '/unmatched/path/to/key',
      });
    });

    it('should respect pattern order (first match wins)', () => {
        const morePatterns = [
            '/config/{val}/',
            '/config/{val1}/{val2}/'
        ];
        const path = '/config/a/b';
        const result = SSMPathService.parsePath(path, morePatterns);
        // It matches /config/{val}/ with val='a' and propertyName='b'
        expect(result.pattern).toBe('/config/{val}/');
        expect(result.variables.val).toBe('a');
        expect(result.propertyName).toBe('b');
    });
  });

  describe('recomposePath', () => {
    it('should recompose path correctly for pattern 1', () => {
      const result = SSMPathService.recomposePath(
        '/{env}/config/{service}/',
        { env: 'live', service: 'auth' },
        'jwt.secret'
      );
      expect(result).toBe('/live/config/auth/jwt.secret');
    });

    it('should recompose path correctly for unmatched pattern', () => {
      const result = SSMPathService.recomposePath(
        null,
        {},
        '/unmatched/path/to/key'
      );
      expect(result).toBe('/unmatched/path/to/key');
    });
  });
});
