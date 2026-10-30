import { test, expect } from '@playwright/test';

test('renders authentic verses received through the frontend origin', async ({ page }) => {
  // No route mocks, seeded UI data or provider doubles. This is a read-only native proof.
  const passageReceived = page.waitForResponse(response => {
    const url = new URL(response.url());
    return url.origin === 'http://127.0.0.1:5173'
      && url.pathname === '/api/translations/porbr2018/books/GEN/chapters/1/verses';
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const passageResponse = await passageReceived;
  expect(passageResponse.status()).toBe(200);
  const passage = await passageResponse.json();
  expect(passage.translationId).toBe('porbr2018');
  expect(passage.bookCode).toBe('GEN');
  expect(passage.verses).toHaveLength(31);
  await expect(page.getByRole('heading', { name: /Gênesis/, level: 1 })).toBeVisible();
  await expect(page.getByText(passage.verses[0].text, { exact: true })).toBeVisible();
  const books = await page.request.get('/api/translations/porbr2018/books');
  expect(books.status()).toBe(200);
  expect((await books.json()).books).toHaveLength(66);
});
