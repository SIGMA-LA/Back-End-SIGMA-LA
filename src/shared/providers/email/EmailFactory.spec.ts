import { describe, it, expect, vi } from 'vitest';
import { EmailFactory } from './EmailFactory';
import { NodemailerStrategy } from './NodemailerStrategy';
import { ExternalEmailStrategy } from './ExternalEmailStrategy';

// Hacemos mock del módulo de entorno
vi.mock('../../../config/env', () => {
  return {
    env: {
      NODE_ENV: 'development',
    },
  };
});

// Importamos env después del mock para poder cambiar su valor en los tests
import { env } from '../../../config/env';

describe('EmailFactory', () => {
  it('should return NodemailerStrategy when NODE_ENV is not production', () => {
    env.NODE_ENV = 'development';
    const strategy = EmailFactory.createStrategy();
    expect(strategy).toBeInstanceOf(NodemailerStrategy);
  });

  it('should return ExternalEmailStrategy when NODE_ENV is production', () => {
    env.NODE_ENV = 'production';
    const strategy = EmailFactory.createStrategy();
    expect(strategy).toBeInstanceOf(ExternalEmailStrategy);
  });
});
