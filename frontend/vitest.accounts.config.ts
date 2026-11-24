import { defineConfig } from 'vitest/config';
import base from './vitest.config';

// Full regression/coverage remains mandatory; these tests exercise access UI.
export default defineConfig({ ...base, test: { ...base.test, maxWorkers: 1,
  include: ['src/test/{password-account,auth-ui,session-boundary,shell-controls,app-navigation,workspace-finalization,persisted-study-flow,workspace-edge-cases,study-context-flow,native-styles}.spec.tsx'],
} });
