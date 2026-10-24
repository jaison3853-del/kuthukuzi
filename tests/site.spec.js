import { test, expect } from '@playwright/test';
test('renders the 3D experience and navigates chapters without errors',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('h1')).toContainText('Small beginnings.');
 await expect(page.locator('#scene canvas')).toBeVisible();
 await page.locator('#sound').click();await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','true');
 await page.locator('#sound').click();await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','false');
 await page.evaluate(()=>scrollTo(0,document.getElementById('journey').offsetTop+innerHeight*1.1));
 await expect(page.locator('#journey')).toHaveClass(/active-step-1/);
 await page.evaluate(()=>scrollTo(0,document.getElementById('journey').offsetTop+innerHeight*1.6));
 await expect(page.locator('#journey')).toHaveClass(/active-step-2/);
 await page.evaluate(()=>scrollTo(0,0));

 await page.locator('#menu-button').click();await expect(page.locator('#menu-button')).toHaveAttribute('aria-expanded','true');
 await page.locator('#menu a[href="#grow"]').click();await expect(page.locator('#menu-button')).toHaveAttribute('aria-expanded','false');
 await page.waitForTimeout(1600);
 await expect(page.locator('#grow h2')).toBeInViewport();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(errors).toEqual([]);
});
test('deposit and loan information, calculator and branch contacts work',async({page})=>{
 await page.goto('/');
 await page.locator('[data-service="deposits"]').click();await expect(page.locator('dialog')).toBeVisible();await expect(page.locator('dialog')).toContainText('8.10%');await page.keyboard.press('Escape');await expect(page.locator('dialog')).not.toBeVisible();
 await page.locator('[data-service="loans"]').click();await expect(page.locator('dialog')).toContainText('Up to ₹25 lakh');await page.locator('.close-dialog').click();
 await page.locator('[data-service="calculator"]').click();await expect(page.locator('#emi')).toHaveText('₹6,374');
 await page.locator('#amount').fill('600000');await expect(page.locator('#emi')).toHaveText('₹12,748');await page.locator('.close-dialog').click();
 await page.locator('[data-branch="kozhi"]').click();await expect(page.locator('#branch-info h3')).toHaveText('Kozhippilly Branch');await expect(page.locator('.branch-phone')).toHaveAttribute('href','tel:04852861496');
 await page.locator('[data-branch="kuthu"]').click();await expect(page.locator('.branch-phone')).toHaveAttribute('href','tel:04852861795');
 const r=await page.request.get('/bank-brochure.pdf');expect(r.status()).toBe(200);expect(r.headers()['content-type']).toContain('application/pdf');
});
test('Malayalam headings and reduced motion remain usable',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.locator('#language').click();await expect(page.locator('html')).toHaveAttribute('lang','ml');await expect(page.locator('h1')).toContainText('ചെറിയ തുടക്കങ്ങൾ.');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('#language').click();await expect(page.locator('h1')).toContainText('Extraordinary');
 await page.locator('[data-service="care"]').click();await expect(page.locator('dialog a[href="tel:7306648713"]')).toBeVisible();
});
