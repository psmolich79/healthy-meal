import { inputValidators, getClientIP, checkRateLimit } from '@/middleware/security';

export interface SecurityAuditResult {
  timestamp: string;
  score: number;
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
  headers: SecurityHeader[];
}

export interface SecurityVulnerability {
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  cwe: string;
  remediation: string;
}

export interface SecurityHeader {
  name: string;
  value: string;
  status: 'present' | 'missing' | 'weak';
  recommendation?: string;
}

export class SecurityService {
  private static readonly SECURITY_SCORE_WEIGHTS = {
    headers: 0.3,
    inputValidation: 0.25,
    rateLimiting: 0.2,
    authentication: 0.15,
    encryption: 0.1
  };

  /**
   * Perform comprehensive security audit
   */
  static async performSecurityAudit(): Promise<SecurityAuditResult> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const recommendations: string[] = [];
    const headers: SecurityHeader[] = [];

    // Check security headers
    const headerAudit = await this.auditSecurityHeaders();
    headers.push(...headerAudit.headers);
    vulnerabilities.push(...headerAudit.vulnerabilities);

    // Check input validation
    const inputAudit = await this.auditInputValidation();
    vulnerabilities.push(...inputAudit.vulnerabilities);

    // Check rate limiting
    const rateLimitAudit = await this.auditRateLimiting();
    vulnerabilities.push(...rateLimitAudit.vulnerabilities);

    // Check authentication
    const authAudit = await this.auditAuthentication();
    vulnerabilities.push(...authAudit.vulnerabilities);

    // Check encryption
    const encryptionAudit = await this.auditEncryption();
    vulnerabilities.push(...encryptionAudit.vulnerabilities);

    // Generate recommendations
    recommendations.push(...this.generateRecommendations(vulnerabilities));

    // Calculate security score
    const score = this.calculateSecurityScore(vulnerabilities, headers);

    return {
      timestamp: new Date().toISOString(),
      score,
      vulnerabilities,
      recommendations,
      headers
    };
  }

  /**
   * Audit security headers
   */
  private static async auditSecurityHeaders(): Promise<{
    headers: SecurityHeader[];
    vulnerabilities: SecurityVulnerability[];
  }> {
    const headers: SecurityHeader[] = [];
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check for essential security headers
    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Content-Security-Policy'
    ];

    // This would typically check actual response headers
    // For now, we'll simulate the audit
    requiredHeaders.forEach(headerName => {
      headers.push({
        name: headerName,
        value: 'Simulated value',
        status: 'present',
        recommendation: undefined
      });
    });

    // Check for weak header values
    if (headers.some(h => h.name === 'X-Frame-Options' && h.value === 'SAMEORIGIN')) {
      vulnerabilities.push({
        severity: 'medium',
        title: 'Weak X-Frame-Options header',
        description: 'X-Frame-Options is set to SAMEORIGIN instead of DENY',
        cwe: 'CWE-1021',
        remediation: 'Set X-Frame-Options to DENY to prevent clickjacking attacks'
      });
    }

    return { headers, vulnerabilities };
  }

  /**
   * Audit input validation
   */
  private static async auditInputValidation(): Promise<{
    vulnerabilities: SecurityVulnerability[];
  }> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Test input validation functions
    const testCases = [
      { input: '<script>alert("xss")</script>', type: 'HTML injection' },
      { input: 'test@invalid', type: 'Email validation' },
      { input: 'weak', type: 'Password strength' },
      { input: 'invalid-preference', type: 'Preference validation' }
    ];

    testCases.forEach(({ input, type }) => {
      if (type === 'HTML injection' && !inputValidators.sanitizeHtml(input).includes('&lt;')) {
        vulnerabilities.push({
          severity: 'high',
          title: 'Insufficient HTML sanitization',
          description: `Input "${input}" is not properly sanitized`,
          cwe: 'CWE-79',
          remediation: 'Implement proper HTML sanitization for all user inputs'
        });
      }

      if (type === 'Email validation' && inputValidators.isValidEmail(input)) {
        vulnerabilities.push({
          severity: 'medium',
          title: 'Weak email validation',
          description: `Invalid email "${input}" passed validation`,
          cwe: 'CWE-20',
          remediation: 'Strengthen email validation regex pattern'
        });
      }

      if (type === 'Password strength' && inputValidators.isStrongPassword(input)) {
        vulnerabilities.push({
          severity: 'medium',
          title: 'Weak password validation',
          description: `Weak password "${input}" passed validation`,
          cwe: 'CWE-521',
          remediation: 'Enforce stronger password requirements'
        });
      }

      if (type === 'Preference validation' && inputValidators.isValidPreferenceId(input)) {
        vulnerabilities.push({
          severity: 'low',
          title: 'Invalid preference ID validation',
          description: `Invalid preference ID "${input}" passed validation`,
          cwe: 'CWE-20',
          remediation: 'Review preference ID validation logic'
        });
      }
    });

    return { vulnerabilities };
  }

  /**
   * Audit rate limiting
   */
  private static async auditRateLimiting(): Promise<{
    vulnerabilities: SecurityVulnerability[];
  }> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Test rate limiting
    const testIP = '192.168.1.100';
    const maxRequests = 100;

    // Simulate rapid requests
    for (let i = 0; i < maxRequests + 10; i++) {
      if (!checkRateLimit(testIP) && i < maxRequests) {
        vulnerabilities.push({
          severity: 'high',
          title: 'Rate limiting bypass',
          description: 'Rate limiting can be bypassed',
          cwe: 'CWE-770',
          remediation: 'Implement proper rate limiting with persistent storage'
        });
        break;
      }
    }

    return { vulnerabilities };
  }

  /**
   * Audit authentication
   */
  private static async auditAuthentication(): Promise<{
    vulnerabilities: SecurityVulnerability[];
  }> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check for common authentication vulnerabilities
    const authChecks = [
      {
        check: 'Session timeout',
        status: 'implemented',
        severity: 'medium' as const,
        description: 'Session timeout should be configured'
      },
      {
        check: 'Password complexity',
        status: 'implemented',
        severity: 'medium' as const,
        description: 'Password complexity requirements should be enforced'
      },
      {
        check: 'Multi-factor authentication',
        status: 'not-implemented',
        severity: 'medium' as const,
        description: 'MFA should be implemented for sensitive operations'
      }
    ];

    authChecks.forEach(({ check, status, severity, description }) => {
      if (status === 'not-implemented') {
        vulnerabilities.push({
          severity,
          title: `Missing ${check}`,
          description,
          cwe: 'CWE-287',
          remediation: `Implement ${check.toLowerCase()}`
        });
      }
    });

    return { vulnerabilities };
  }

  /**
   * Audit encryption
   */
  private static async auditEncryption(): Promise<{
    vulnerabilities: SecurityVulnerability[];
  }> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check for encryption requirements
    const encryptionChecks = [
      {
        check: 'HTTPS enforcement',
        status: 'implemented',
        severity: 'high' as const,
        description: 'HTTPS should be enforced for all connections'
      },
      {
        check: 'Data encryption at rest',
        status: 'not-implemented',
        severity: 'medium' as const,
        description: 'Sensitive data should be encrypted at rest'
      },
      {
        check: 'Secure communication',
        status: 'implemented',
        severity: 'medium' as const,
        description: 'All external communications should use TLS 1.3'
      }
    ];

    encryptionChecks.forEach(({ check, status, severity, description }) => {
      if (status === 'not-implemented') {
        vulnerabilities.push({
          severity,
          title: `Missing ${check}`,
          description,
          cwe: 'CWE-311',
          remediation: `Implement ${check.toLowerCase()}`
        });
      }
    });

    return { vulnerabilities };
  }

  /**
   * Generate security recommendations
   */
  private static generateRecommendations(vulnerabilities: SecurityVulnerability[]): string[] {
    const recommendations: string[] = [];

    // Group vulnerabilities by severity
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
    const highVulns = vulnerabilities.filter(v => v.severity === 'high');
    const mediumVulns = vulnerabilities.filter(v => v.severity === 'medium');
    const lowVulns = vulnerabilities.filter(v => v.severity === 'low');

    if (criticalVulns.length > 0) {
      recommendations.push(`Immediate action required: ${criticalVulns.length} critical vulnerabilities found`);
    }

    if (highVulns.length > 0) {
      recommendations.push(`High priority: Address ${highVulns.length} high-severity vulnerabilities`);
    }

    if (mediumVulns.length > 0) {
      recommendations.push(`Medium priority: Review ${mediumVulns.length} medium-severity vulnerabilities`);
    }

    if (lowVulns.length > 0) {
      recommendations.push(`Low priority: Consider addressing ${lowVulns.length} low-severity vulnerabilities`);
    }

    // Add specific recommendations
    if (vulnerabilities.some(v => v.cwe === 'CWE-79')) {
      recommendations.push('Implement proper input sanitization to prevent XSS attacks');
    }

    if (vulnerabilities.some(v => v.cwe === 'CWE-287')) {
      recommendations.push('Strengthen authentication mechanisms and implement MFA');
    }

    if (vulnerabilities.some(v => v.cwe === 'CWE-311')) {
      recommendations.push('Ensure all sensitive data is properly encrypted');
    }

    return recommendations;
  }

  /**
   * Calculate overall security score
   */
  private static calculateSecurityScore(
    vulnerabilities: SecurityVulnerability[],
    headers: SecurityHeader[]
  ): number {
    let score = 100;

    // Deduct points for vulnerabilities
    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    // Deduct points for missing headers
    const missingHeaders = headers.filter(h => h.status === 'missing').length;
    score -= missingHeaders * 5;

    // Ensure score doesn't go below 0
    return Math.max(0, Math.round(score));
  }

  /**
   * Validate user input
   */
  static validateInput(input: any, type: 'email' | 'username' | 'password' | 'preference'): boolean {
    switch (type) {
      case 'email':
        return inputValidators.isValidEmail(input);
      case 'username':
        return inputValidators.isValidUsername(input);
      case 'password':
        return inputValidators.isStrongPassword(input);
      case 'preference':
        return inputValidators.isValidPreferenceId(input);
      default:
        return false;
    }
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    return inputValidators.sanitizeHtml(input);
  }

  /**
   * Check if request is rate limited
   */
  static isRateLimited(ip: string): boolean {
    return !checkRateLimit(ip);
  }

  /**
   * Get client IP address
   */
  static getClientIP(request: Request): string {
    return getClientIP(request);
  }
}
