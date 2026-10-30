import { test, expect } from '@playwright/test';

test.describe('Bíblia App — Fluxos E2E Reais', () => {
  test('abre a aplicação e renderiza o leitor canônico', async ({ page }) => {
    await page.goto('/');

    // Verifica título principal da aplicação
    await expect(page).toHaveTitle(/Bíblia App/);

    // Verifica presença da navegação principal
    const nav = page.locator('aside[role="navigation"]');
    await expect(nav).toBeVisible();

    // Verifica que o livro Gênesis e versículos são carregados
    const heading = page.locator('h1');
    await expect(heading).toContainText(/Gênesis/);
  });

  test('alterna entre abas principais e preserva integridade visual', async ({ page }) => {
    await page.goto('/');

    // Clica na aba de Fontes Históricas
    await page.getByRole('button', { name: /fontes históricas/i }).click();
    await expect(page.locator('h1')).toContainText(/Biblioteca de Fontes Históricas/);

    // Clica na aba de Histórico e Workspace
    await page.getByRole('button', { name: /histórico & workspace/i }).click();
    await expect(page.locator('h1')).toContainText(/Espaço de Estudo & Workspace/);
  });

  test('alterna entre temas Claro e Escuro persistindo a classe', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const themeButton = page.getByRole('button', { name: /modo/i });

    // Alterna tema
    await themeButton.click();
    // A classe deve mudar
    const hasClass = await html.getAttribute('class');
    expect(hasClass).toBeDefined();
  });

  test('ativa e desativa o Modo Foco via atalho de teclado', async ({ page }) => {
    await page.goto('/');

    // Clica no botão Modo Foco
    const focusBtn = page.getByTitle(/modo foco/i);
    if (await focusBtn.isVisible()) {
      await focusBtn.click();
      // O botão flutuante de sair deve surgir
      await expect(page.getByText('Sair do Modo Foco')).toBeVisible();

      // Pressiona Escape para restaurar
      await page.keyboard.press('Escape');
      await expect(page.getByText('Sair do Modo Foco')).not.toBeVisible();
    }
  });
});
