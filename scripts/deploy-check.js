#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 CRM 系統部署前檢查\n');

const checks = [
  {
    name: '檢查 Dockerfile 存在',
    check: () => fs.existsSync(path.join(__dirname, '..', 'Dockerfile')),
  },
  {
    name: '檢查 .dockerignore 存在',
    check: () => fs.existsSync(path.join(__dirname, '..', '.dockerignore')),
  },
  {
    name: '檢查 zeabur.toml 存在',
    check: () => fs.existsSync(path.join(__dirname, '..', 'zeabur.toml')),
  },
  {
    name: '檢查 .env.production.example 存在',
    check: () => fs.existsSync(path.join(__dirname, '..', '.env.production.example')),
  },
  {
    name: '檢查 healthcheck.js 存在',
    check: () => fs.existsSync(path.join(__dirname, '..', 'healthcheck.js')),
  },
  {
    name: '檢查 .gitignore 包含 .env',
    check: () => {
      const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
      return gitignore.includes('.env');
    },
  },
  {
    name: '檢查 package.json start 腳本',
    check: () => {
      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
      return packageJson.scripts && packageJson.scripts.start;
    },
  },
];

let allPassed = true;

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  console.log(`${index + 1}. ${check.name} ${status}`);
  if (!passed) allPassed = false;
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 所有檢查通過！您的專案已準備好部署到 Zeabur');
  console.log('\n📖 請查看 DEPLOYMENT.md 了解詳細部署步驟');
} else {
  console.log('⚠️  部分檢查未通過，請修正後再進行部署');
}

console.log('\n🔐 部署前安全提醒:');
console.log('- 請勿將 .env 檔案提交到 Git');
console.log('- 在 Zeabur 控制台設置環境變數');
console.log('- 使用強密碼作為資料庫密碼和 JWT Secret');

process.exit(allPassed ? 0 : 1);