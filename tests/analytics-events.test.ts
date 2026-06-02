import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const readTemplate = (path: string) =>
  readFileSync(resolve(__dirname, '../src/template/src', path), 'utf-8');

describe('Mintlify-compatible analytics events', () => {
  const baseLayout = readTemplate('layouts/BaseLayout.astro');
  const searchModal = readTemplate('components/common/SearchModal.astro');
  const copyButton = readTemplate('components/common/CopyButton.astro');
  const pageFeedback = readTemplate('components/common/PageFeedback.astro');
  const contextualMenu = readTemplate('components/common/ContextualMenu.astro');
  const assistantPanel = readTemplate('components/common/AssistantPanel.astro');
  const snippet = readTemplate('components/mdx/Snippet.astro');
  const apiPlayground = readTemplate('components/api-playground/APIPlayground.astro');

  it('defines a shared provider fan-out dispatcher', () => {
    expect(baseLayout).toContain('window.__docsyTrack = track');
    expect(baseLayout).toContain("window.dispatchEvent(new CustomEvent('docsy:analytics'");
    expect(baseLayout).toContain("window.gtag('event', eventName, props)");
    expect(baseLayout).toContain('window.posthog.capture(eventName, props)');
    expect(baseLayout).toContain('window.mixpanel.track(eventName, props)');
    expect(baseLayout).toContain('window.amplitude.track(eventName, props)');
    expect(baseLayout).toContain('window.analytics.track(eventName, props)');
  });

  it('tracks page views and navigation interactions', () => {
    expect(baseLayout).toContain("track('docs.content.view')");
    expect(baseLayout).toContain("track('docs.navitem.click'");
    expect(baseLayout).toContain("track('docs.navitem.cta_click'");
    expect(baseLayout).toContain("track('docs.footer.powered_by_mintlify_click'");
  });

  it('tracks search interactions', () => {
    expect(searchModal).toContain("trackSearch('docs.search.query'");
    expect(searchModal).toContain("trackSearch('docs.search.close'");
    expect(searchModal).toContain("trackSearch('docs.search.result_click'");
  });

  it('tracks code copy and API playground request interactions', () => {
    expect(copyButton).toContain(".__docsyTrack?.('docs.code_block.copy'");
    expect(snippet).toContain(".__docsyTrack?.('docs.code_block.copy'");
    expect(apiPlayground).toContain(".__docsyTrack?.('docs.api_playground.request'");
  });

  it('tracks interactive disclosure components', () => {
    expect(baseLayout).toContain("docs.accordion.open");
    expect(baseLayout).toContain("docs.accordion.close");
    expect(baseLayout).toContain("docs.expandable.open");
    expect(baseLayout).toContain("docs.expandable.close");
  });

  it('tracks page feedback interactions', () => {
    expect(pageFeedback).toContain("docs.feedback.thumbs_up");
    expect(pageFeedback).toContain("docs.feedback.thumbs_down");
    expect(pageFeedback).toContain("docs.feedback.suggest_edit");
    expect(pageFeedback).toContain("docs.feedback.raise_issue");
    expect(pageFeedback).toContain("data-feedback-value=\"positive\"");
    expect(pageFeedback).toContain("data-feedback-value=\"negative\"");
    expect(pageFeedback).toContain('data-feedback-action="suggest_edit"');
    expect(pageFeedback).toContain('data-feedback-action="raise_issue"');
  });

  it('tracks contextual menu interactions', () => {
    expect(contextualMenu).toContain("docs.contextual_menu.open");
    expect(contextualMenu).toContain("docs.contextual_menu.click");
    expect(contextualMenu).toContain("docs.contextual_menu.copy");
    expect(contextualMenu).toContain("docsy:assistant:open");
  });

  it('tracks assistant interactions', () => {
    expect(assistantPanel).toContain("docs.assistant.open");
    expect(assistantPanel).toContain("docs.assistant.close");
    expect(assistantPanel).toContain("docs.assistant.query");
    expect(assistantPanel).toContain("docs.assistant.response");
    expect(assistantPanel).toContain("docs.assistant.error");
    expect(assistantPanel).toContain("__docsyOpenAssistant");
    expect(assistantPanel).toContain("virtual:docsy/search");
  });

  it('posts a structured assistant RAG contract to configured API endpoints', () => {
    expect(assistantPanel).toContain('data-assistant-api-config');
    expect(assistantPanel).toContain('data-context-route');
    expect(assistantPanel).toContain('contextRoute');
    expect(assistantPanel).toContain('markdownUrl');
    expect(assistantPanel).toContain('maxCharsPerSource');
    expect(assistantPanel).toContain('timeoutMs');
  });
});
