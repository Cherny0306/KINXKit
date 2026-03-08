#!/usr/bin/env node

/**
 * Electron 应用构建前检查脚本
 * 验证所有必需的资源和依赖是否就绪
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_DIRS = ['renderer', 'build'];
const REQUIRED_FILES = ['main.js', 'preload.js', 'package.json', 'electron-builder.yml'];
const OPTIONAL_RESOURCES = [
  'build/icon.ico',
  'build/installer-icon.ico',
  'build/uninstaller-icon.ico'
];

let hasErrors = false;
let hasWarnings = false;

console.log('🔍 KINXKit Desktop 构建前检查\n');

// 检查必需目录
console.log('📁 检查必需目录...');
REQUIRED_DIRS.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    console.log(`  ✅ ${dir}/`);
  } else {
    console.error(`  ❌ ${dir}/ - 缺失`);
    hasErrors = true;
  }
});

// 检查必需文件
console.log('\n📄 检查必需文件...');
REQUIRED_FILES.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.error(`  ❌ ${file} - 缺失`);
    hasErrors = true;
  }
});

// 检查主项目编译
console.log('\n🔨 检查主项目编译...');
const distPath = path.join(__dirname, '..', '..', 'dist');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  if (files.length > 0) {
    console.log(`  ✅ dist/ 目录存在 (${files.length} 个文件)`);
  } else {
    console.warn(`  ⚠️  dist/ 目录为空，请先运行 npm run build`);
    hasWarnings = true;
  }
} else {
  console.warn(`  ⚠️  dist/ 目录不存在，请先运行 npm run build`);
  hasErrors = true;
}

// 检查可选资源
console.log('\n🎨 检查可选资源（图标）...');
let hasIcons = false;
OPTIONAL_RESOURCES.forEach(resource => {
  const resourcePath = path.join(__dirname, '..', resource);
  if (fs.existsSync(resourcePath)) {
    console.log(`  ✅ ${resource}`);
    hasIcons = true;
  } else {
    console.log(`  ⚪ ${resource} (未添加)`);
  }
});

if (!hasIcons) {
  console.log('\n  💡 提示: 尚未添加自定义图标，将使用 Electron 默认图标');
  console.log('     参考 GUI/build/README.md 了解如何添加图标\n');
  hasWarnings = true;
}

// 检查 GUI 依赖
console.log('\n📦 检查 GUI 依赖...');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('  ✅ node_modules/ 存在');
} else {
  console.warn('  ⚠️  node_modules/ 不存在，请先运行 npm run desktop:install');
  hasErrors = true;
}

// 总结
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('❌ 检查失败！请修复上述错误后再运行构建。');
  console.log('\n建议操作:');
  console.log('  1. npm run desktop:install  # 安装 GUI 依赖');
  console.log('  2. npm run build            # 编译主项目');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('⚠️  检查通过，但有一些警告。');
  console.log('构建可以继续，但建议处理上述警告以获得最佳体验。');
  process.exit(0);
} else {
  console.log('✅ 所有检查通过！可以开始构建。');
  process.exit(0);
}
