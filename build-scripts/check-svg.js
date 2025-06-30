#!/usr/bin/env node

/**
 * SVG validation and security check script
 * Ensures all SVG content is properly sanitized and safe
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import DOMPurify from 'isomorphic-dompurify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const distPath = path.join(projectRoot, 'dist');

class SvgValidator {
  constructor() {
    this.svgFiles = [];
    this.inlineSvgs = [];
    this.issues = [];
    this.filesChecked = 0;
    
    // Initialize DOMPurify with JSDOM
    const window = new JSDOM('').window;
    this.DOMPurify = DOMPurify(window);
    
    // Configure DOMPurify for SVG
    this.DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      // Force remove dangerous attributes
      if (node.hasAttribute('onload')) {
        node.removeAttribute('onload');
      }
      if (node.hasAttribute('onerror')) {
        node.removeAttribute('onerror');
      }
    });
  }

  async validateDirectory(dirPath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        await this.validateDirectory(fullPath);
      } else if (entry.name.endsWith('.svg')) {
        await this.validateSvgFile(fullPath);
      } else if (entry.name.endsWith('.html')) {
        await this.checkInlineSvg(fullPath);
      }
    }
  }

  async validateSvgFile(filePath) {
    this.filesChecked++;
    const relativePath = path.relative(distPath, filePath);
    
    console.log(`🎨 Checking SVG file: ${relativePath}`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const issues = this.validateSvgContent(content, relativePath);
      
      if (issues.length > 0) {
        this.issues.push({
          file: relativePath,
          type: 'file',
          issues
        });
      }
      
      this.svgFiles.push({
        path: relativePath,
        size: content.length,
        valid: issues.length === 0
      });
    } catch (error) {
      this.issues.push({
        file: relativePath,
        type: 'file',
        issues: [`Failed to read file: ${error.message}`]
      });
    }
  }

  async checkInlineSvg(filePath) {
    this.filesChecked++;
    const relativePath = path.relative(distPath, filePath);
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Find all inline SVGs
    const svgPattern = /<svg[^>]*>[\s\S]*?<\/svg>/gi;
    const matches = content.match(svgPattern) || [];
    
    if (matches.length > 0) {
      console.log(`📄 Checking inline SVGs in: ${relativePath} (found ${matches.length})`);
      
      for (let i = 0; i < matches.length; i++) {
        const svg = matches[i];
        const issues = this.validateSvgContent(svg, `${relativePath} (inline SVG ${i + 1})`);
        
        if (issues.length > 0) {
          this.issues.push({
            file: relativePath,
            type: 'inline',
            index: i + 1,
            issues
          });
        }
        
        this.inlineSvgs.push({
          file: relativePath,
          index: i + 1,
          valid: issues.length === 0
        });
      }
    }
  }

  validateSvgContent(svgContent, source) {
    const issues = [];
    
    // Check for dangerous elements
    const dangerousElements = [
      'script',
      'iframe',
      'object',
      'embed',
      'foreignObject',
      'use' // Can be dangerous with external references
    ];
    
    for (const element of dangerousElements) {
      const pattern = new RegExp(`<${element}[^>]*>`, 'gi');
      if (pattern.test(svgContent)) {
        issues.push(`Contains potentially dangerous <${element}> element`);
      }
    }
    
    // Check for dangerous attributes
    const dangerousAttributes = [
      'onload',
      'onerror',
      'onclick',
      'onmouseover',
      'onfocus',
      'onblur',
      'onchange',
      'onsubmit',
      'javascript:',
      'data:text/html'
    ];
    
    for (const attr of dangerousAttributes) {
      if (svgContent.includes(attr)) {
        issues.push(`Contains potentially dangerous attribute or protocol: ${attr}`);
      }
    }
    
    // Check for external references
    if (svgContent.includes('href="http') || svgContent.includes("href='http")) {
      issues.push('Contains external HTTP references');
    }
    
    // Validate with DOMPurify
    try {
      const clean = this.DOMPurify.sanitize(svgContent, {
        USE_PROFILES: { svg: true },
        ADD_TAGS: ['svg'],
        ADD_ATTR: ['viewBox', 'fill', 'stroke', 'stroke-width', 'd', 'points', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height', 'transform']
      });
      
      // Check if content was modified
      if (clean.length < svgContent.length * 0.9) {
        issues.push('Significant content removed during sanitization - possible security risk');
      }
    } catch (error) {
      issues.push(`DOMPurify validation failed: ${error.message}`);
    }
    
    // Check SVG structure
    if (!svgContent.includes('xmlns="http://www.w3.org/2000/svg"')) {
      issues.push('Missing proper SVG namespace declaration');
    }
    
    // Check for viewBox
    if (!svgContent.includes('viewBox=')) {
      issues.push('Missing viewBox attribute (recommended for responsive SVGs)');
    }
    
    return issues;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SVG Validation Report');
    console.log('='.repeat(60));
    
    console.log(`\n📁 Files checked: ${this.filesChecked}`);
    console.log(`🎨 SVG files found: ${this.svgFiles.length}`);
    console.log(`📄 Inline SVGs found: ${this.inlineSvgs.length}`);
    
    // SVG file statistics
    if (this.svgFiles.length > 0) {
      const totalSize = this.svgFiles.reduce((sum, file) => sum + file.size, 0);
      const avgSize = Math.round(totalSize / this.svgFiles.length);
      
      console.log(`\n📏 SVG File Statistics:`);
      console.log(`   Total size: ${(totalSize / 1024).toFixed(2)} KB`);
      console.log(`   Average size: ${(avgSize / 1024).toFixed(2)} KB`);
      
      // List large SVGs
      const largeSvgs = this.svgFiles.filter(f => f.size > 50000);
      if (largeSvgs.length > 0) {
        console.log(`\n⚠️  Large SVG files (>50KB):`);
        for (const svg of largeSvgs) {
          console.log(`   - ${svg.path} (${(svg.size / 1024).toFixed(2)} KB)`);
        }
      }
    }
    
    // Security issues
    if (this.issues.length > 0) {
      console.log(`\n❌ Security/validation issues found: ${this.issues.length}`);
      console.log('\nDetailed Issues:');
      console.log('-'.repeat(60));
      
      for (const issue of this.issues) {
        console.log(`\n📄 ${issue.file}${issue.type === 'inline' ? ` (inline SVG #${issue.index})` : ''}:`);
        for (const problem of issue.issues) {
          console.log(`   ⚠️  ${problem}`);
        }
      }
      
      console.log('\n🔧 Recommendations:');
      console.log('   1. Remove all script tags and event handlers from SVGs');
      console.log('   2. Use only local references (no external URLs)');
      console.log('   3. Avoid foreignObject elements');
      console.log('   4. Always include proper SVG namespace');
      console.log('   5. Add viewBox for responsive scaling');
    } else {
      console.log('\n✅ All SVGs validated successfully!');
      console.log('   - No security risks detected');
      console.log('   - Proper structure maintained');
      console.log('   - Safe for production use');
    }
    
    // Best practices check
    const noViewBox = this.svgFiles.filter(f => {
      const issue = this.issues.find(i => i.file === f.path);
      return issue && issue.issues.some(i => i.includes('viewBox'));
    });
    
    if (noViewBox.length > 0) {
      console.log('\n💡 Best Practices Suggestions:');
      console.log(`   - ${noViewBox.length} SVGs missing viewBox attribute`);
    }
    
    console.log('\n' + '='.repeat(60));
    
    return this.issues.filter(i => !i.issues.some(issue => issue.includes('viewBox'))).length === 0;
  }
}

// Main execution
async function main() {
  console.log('🔍 Starting SVG validation for German Odoo Directory\n');
  
  // Check if dist directory exists
  try {
    await fs.access(distPath);
  } catch {
    console.error('❌ Error: dist directory not found. Please run the build first.');
    process.exit(1);
  }
  
  const validator = new SvgValidator();
  
  try {
    await validator.validateDirectory(distPath);
    const success = validator.generateReport();
    
    if (!success) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    process.exit(1);
  }
}

// Run the validator
main().catch(console.error);