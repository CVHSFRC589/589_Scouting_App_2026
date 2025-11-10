/**
 * Schema Version Management
 * Ensures frontend and database are using compatible schema versions
 */

// Expected database schema version
export const EXPECTED_SCHEMA_VERSION = '2.0.0';

// Minimum compatible schema version
export const MIN_SCHEMA_VERSION = '2.0.0';

/**
 * Parse semantic version string into comparable parts
 */
function parseVersion(version: string): { major: number; minor: number; patch: number } | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

/**
 * Compare two semantic versions
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
  const versionA = parseVersion(a);
  const versionB = parseVersion(b);

  if (!versionA || !versionB) {
    console.warn('Invalid version format for comparison:', a, b);
    return 0;
  }

  if (versionA.major !== versionB.major) {
    return versionA.major < versionB.major ? -1 : 1;
  }

  if (versionA.minor !== versionB.minor) {
    return versionA.minor < versionB.minor ? -1 : 1;
  }

  if (versionA.patch !== versionB.patch) {
    return versionA.patch < versionB.patch ? -1 : 1;
  }

  return 0;
}

/**
 * Check if database schema version is compatible with frontend
 */
export function isSchemaCompatible(databaseVersion: string): boolean {
  // Check if database version meets minimum requirement
  const meetsMinimum = compareVersions(databaseVersion, MIN_SCHEMA_VERSION) >= 0;

  // Check if database version doesn't exceed our expectations (breaking changes)
  const expectedParsed = parseVersion(EXPECTED_SCHEMA_VERSION);
  const databaseParsed = parseVersion(databaseVersion);

  if (!expectedParsed || !databaseParsed) {
    console.error('Invalid version format');
    return false;
  }

  // Major version must match (breaking changes)
  const majorMatches = expectedParsed.major === databaseParsed.major;

  return meetsMinimum && majorMatches;
}

/**
 * Get user-friendly schema compatibility message
 */
export function getSchemaCompatibilityMessage(databaseVersion: string): {
  compatible: boolean;
  message: string;
  action?: string;
} {
  if (!databaseVersion) {
    return {
      compatible: false,
      message: 'Cannot determine database schema version',
      action: 'Check database connection and ensure app_metadata table exists',
    };
  }

  const compatible = isSchemaCompatible(databaseVersion);

  if (compatible) {
    return {
      compatible: true,
      message: `Schema version ${databaseVersion} is compatible`,
    };
  }

  const comparison = compareVersions(databaseVersion, MIN_SCHEMA_VERSION);

  if (comparison < 0) {
    return {
      compatible: false,
      message: `Database schema is too old (v${databaseVersion}). Expected v${EXPECTED_SCHEMA_VERSION} or newer.`,
      action: 'Run database migrations to update schema',
    };
  }

  const expectedParsed = parseVersion(EXPECTED_SCHEMA_VERSION);
  const databaseParsed = parseVersion(databaseVersion);

  if (expectedParsed && databaseParsed && databaseParsed.major > expectedParsed.major) {
    return {
      compatible: false,
      message: `Database schema is too new (v${databaseVersion}). This app expects v${EXPECTED_SCHEMA_VERSION}.`,
      action: 'Update the frontend app to the latest version',
    };
  }

  return {
    compatible: false,
    message: `Schema version mismatch. Database: v${databaseVersion}, Expected: v${EXPECTED_SCHEMA_VERSION}`,
    action: 'Contact app maintainers or run migrations',
  };
}

/**
 * Log schema version information
 */
export function logSchemaVersion(databaseVersion: string, callerInfo?: string): void {
  const { compatible, message, action } = getSchemaCompatibilityMessage(databaseVersion);
  const timestamp = new Date().toISOString();
  const caller = callerInfo ? `[${callerInfo}]` : '[logSchemaVersion]';

  if (compatible) {
    console.log(`✅ [${timestamp}] ${caller}`, message);
  } else {
    console.warn(`⚠️ [${timestamp}] ${caller}`, message);
    if (action) {
      console.warn(`   [${timestamp}] ${caller} Action:`, action);
    }
  }
}
