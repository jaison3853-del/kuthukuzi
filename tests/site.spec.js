import { test, expect } from '@playwright/test';
async function load(page){await page.goto('/');await expect(page.locator('#loader')).toHaveClass('loaded',{timeout:20000})}
async function chapter(page,index){await page.evaluate(i=>scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*i/5),index);await expect(page.locator('body')).toHaveAttribute('data-chapter',String(index))}
test('full-screen story traverses six chapters and menu without errors',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await load(page);
 await expect(page.locator('h1')).toHaveText('TRUST. REIMAGINED.');await expect(page.locator('#scene canvas')).toBeVisible();
 await expect(page.locator('body')).not.toHaveClass(/scene-unavailable/);
 for(let i=1;i<6;i++){await chapter(page,i);await expect(page.locator(`[data-panel="${i}"]`)).toHaveAttribute('aria-hidden','false');await expect(page.locator('.chapter-nav a').nth(i)).toHaveAttribute('aria-current','step');await expect(page.locator('#scene canvas')).toBeInViewport()}
 await page.locator('#restart').click();await expect(page.locator('body')).toHaveAttribute('data-chapter','0',{timeout:10000});
 await page.locator('#menu-button').click();await expect(page.locator('#menu-button')).toHaveAttribute('aria-expanded','true');
 await page.locator('#menu a[href="#growth"]').click();await expect(page.locator('#menu-button')).toHaveAttribute('aria-expanded','false');await expect(page.locator('body')).toHaveAttribute('data-chapter','2',{timeout:10000});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});
test('bank details, EMI calculation and branch switcher work inside the experience',async({page})=>{
 await load(page);await page.locator('.hud [data-service="deposits"]').click();await expect(page.locator('dialog')).toContainText('8.10%');await page.keyboard.press('Escape');await expect(page.locator('dialog')).not.toBeVisible();
 await page.locator('.hud [data-service="loans"]').click();await expect(page.locator('dialog')).toContainText('Up to ₹25 lakh');await page.locator('.close-dialog').click();
 await chapter(page,4);await page.locator('[data-service="calculator"]').click();await expect(page.locator('#emi')).toHaveText('₹6,374');await page.locator('#amount').fill('600000');await expect(page.locator('#emi')).toHaveText('₹12,748');await page.locator('.close-dialog').click();
 await page.locator('.hud [data-service="contact"]').click();await expect(page.locator('.branch-phone')).toHaveAttribute('href','tel:04852862496');await page.locator('[data-branch="kozhi"]').click();await expect(page.locator('#branch-info h3')).toHaveText('Kozhippilly Branch');await expect(page.locator('.branch-phone')).toHaveAttribute('href','tel:04852861496');await page.locator('[data-branch="kuthu"]').click();await expect(page.locator('.branch-phone')).toHaveAttribute('href','tel:04852861795');
 await page.keyboard.press('Escape');await chapter(page,3);await page.locator('[data-service="care"]').click();await expect(page.locator('dialog a[href="tel:7306648713"]')).toBeVisible();
 const r=await page.request.get('/bank-brochure.pdf');expect(r.status()).toBe(200);expect(r.headers()['content-type']).toContain('application/pdf');
});
test('Malayalam, sound and reduced motion retain accessible navigation',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await load(page);
 await page.locator('#language').click();await expect(page.locator('html')).toHaveAttribute('lang','ml');await expect(page.locator('h1')).toContainText('വിശ്വാസം.');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('#language').click();await expect(page.locator('h1')).toHaveText('TRUST. REIMAGINED.');
 await page.locator('#sound').click();await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','true');await page.locator('#sound').click();await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','false');
 await page.keyboard.press('PageDown');await expect(page.locator('body')).toHaveAttribute('data-chapter','1');await page.locator('[data-service="heritage"]').click();await expect(page.locator('dialog')).toContainText('Class 1 Special Grade Bank');await page.keyboard.press('Escape');
 await page.locator('#menu-button').click();await page.keyboard.press('Escape');await expect(page.locator('#menu-button')).toHaveAttribute('aria-expanded','false');
});
test('banking information remains usable if the 3D module cannot load',async({page})=>{
 await page.route('**/src/scene.js*',route=>route.abort());await load(page);await expect(page.locator('body')).toHaveClass(/scene-unavailable/);await expect(page.locator('h1')).toBeVisible();await page.locator('.hud [data-service="contact"]').click();await expect(page.locator('.branch-phone')).toHaveAttribute('href','tel:04852862496');await page.keyboard.press('Escape');await chapter(page,2);await page.locator('#growth [data-service="deposits"]').click();await expect(page.locator('dialog')).toContainText('6.25%');
});
