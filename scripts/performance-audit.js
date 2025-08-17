#!/usr/bin/env node

import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';
const OUTPUT_DIR = 'performance-reports';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Lighthouse configuration
const lighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false
    },
    emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
};

// Mobile configuration
const mobileConfig = {
  ...lighthouseConfig,
  settings: {
    ...lighthouseConfig.settings,
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false
    },
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    }
  }
};

async function runLighthouse(url, config, deviceType) {
  console.log(`\n🚀 Running Lighthouse audit for ${deviceType}...`);
  console.log(`URL: ${url}`);
  
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
  });
  
  try {
    const runnerResult = await lighthouse(url, {
      port: chrome.port,
      ...config
    });
    
    const reportHtml = runnerResult.report;
    const reportJson = runnerResult.lhr;
    
    // Save HTML report
    const htmlPath = path.join(OUTPUT_DIR, `lighthouse-${deviceType}-${Date.now()}.html`);
    fs.writeFileSync(htmlPath, reportHtml);
    
    // Save JSON report
    const jsonPath = path.join(OUTPUT_DIR, `lighthouse-${deviceType}-${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(reportJson, null, 2));
    
    // Display scores
    const scores = reportJson.categories;
    console.log(`\n📊 ${deviceType.toUpperCase()} Scores:`);
    console.log(`Performance: ${Math.round(scores.performance.score * 100)}/100`);
    console.log(`Accessibility: ${Math.round(scores.accessibility.score * 100)}/100`);
    console.log(`Best Practices: ${Math.round(scores['best-practices'].score * 100)}/100`);
    console.log(`SEO: ${Math.round(scores.seo.score * 100)}/100`);
    
    // Display performance metrics
    const metrics = reportJson.audits;
    console.log(`\n📈 Performance Metrics:`);
    console.log(`First Contentful Paint: ${metrics['first-contentful-paint'].displayValue}`);
    console.log(`Largest Contentful Paint: ${metrics['largest-contentful-paint'].displayValue}`);
    console.log(`First Input Delay: ${metrics['max-potential-fid'].displayValue}`);
    console.log(`Cumulative Layout Shift: ${metrics['cumulative-layout-shift'].displayValue}`);
    
    // Display opportunities
    const opportunities = Object.values(metrics)
      .filter(audit => audit.details && audit.details.type === 'opportunity' && audit.score < 1)
      .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
      .slice(0, 5);
    
    if (opportunities.length > 0) {
      console.log(`\n💡 Top Optimization Opportunities:`);
      opportunities.forEach(opp => {
        console.log(`- ${opp.title}: ${opp.displayValue} potential savings`);
      });
    }
    
    console.log(`\n📁 Reports saved to:`);
    console.log(`HTML: ${htmlPath}`);
    console.log(`JSON: ${jsonPath}`);
    
    return {
      scores,
      metrics,
      opportunities,
      htmlPath,
      jsonPath
    };
    
  } finally {
    await chrome.kill();
  }
}

async function runPerformanceAudit() {
  console.log('🔍 Starting Performance Audit...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);
  
  const startTime = Date.now();
  
  try {
    // Test main page
    const mainPageResults = await runLighthouse(`${BASE_URL}/`, lighthouseConfig, 'desktop');
    
    // Test profile page
    const profilePageResults = await runLighthouse(`${BASE_URL}/profile`, lighthouseConfig, 'desktop');
    
    // Test mobile performance
    const mobileResults = await runLighthouse(`${BASE_URL}/`, mobileConfig, 'mobile');
    
    const totalTime = Date.now() - startTime;
    console.log(`\n✅ Performance audit completed in ${Math.round(totalTime / 1000)}s`);
    
    // Generate summary report
    const summary = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      results: {
        mainPage: mainPageResults.scores,
        profilePage: profilePageResults.scores,
        mobile: mobileResults.scores
      },
      recommendations: []
    };
    
    // Add recommendations based on scores
    [mainPageResults, profilePageResults, mobileResults].forEach(result => {
      if (result.scores.performance.score < 0.9) {
        summary.recommendations.push('Performance score below 90 - consider optimization');
      }
      if (result.scores.accessibility.score < 0.9) {
        summary.recommendations.push('Accessibility score below 90 - review ARIA and contrast');
      }
      if (result.scores['best-practices'].score < 0.9) {
        summary.recommendations.push('Best practices score below 90 - review code quality');
      }
    });
    
    const summaryPath = path.join(OUTPUT_DIR, `audit-summary-${Date.now()}.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`\n📋 Summary report saved to: ${summaryPath}`);
    
    if (summary.recommendations.length > 0) {
      console.log(`\n⚠️  Recommendations:`);
      summary.recommendations.forEach(rec => console.log(`- ${rec}`));
    }
    
  } catch (error) {
    console.error('❌ Performance audit failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceAudit();
}

export { runPerformanceAudit, runLighthouse };
