import {defineConfig} from '@playwright/test';
const baseURL=process.env.PREVIEW_TEST_URL||'http://terminal.local:4173';
if(new URL(baseURL).hostname==='sensor-fusion-temmy.iamtemmy.chatgpt.site')throw new Error('Never run next tests on the submitted site');
export default defineConfig({testDir:'./tests/preview',timeout:180000,workers:1,reporter:'list',use:{baseURL,headless:true,viewport:{width:1280,height:800},trace:'off',screenshot:'only-on-failure'},outputDir:'outputs/preview-tests'});
