import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickKcWorkflow, KC_WORKFLOW, KC_WORKFLOW_VB } from './kc-workflow.ts';

test('absent / empty value defaults to AI 1', () => {
  assert.equal(pickKcWorkflow(null), KC_WORKFLOW);
  assert.equal(pickKcWorkflow(undefined), KC_WORKFLOW);
  assert.equal(pickKcWorkflow(''), KC_WORKFLOW);
});

test('the AI 1 workflow passes through', () => {
  assert.equal(pickKcWorkflow('keyword-clustering'), KC_WORKFLOW);
});

test('the Variant B (AI 2) workflow passes through', () => {
  assert.equal(pickKcWorkflow('keyword-clustering-vb'), KC_WORKFLOW_VB);
});

test('unknown / unrelated workflows are rejected → AI 1 default', () => {
  assert.equal(pickKcWorkflow('competition-scraping'), KC_WORKFLOW);
  assert.equal(pickKcWorkflow('keyword-clustering-evil'), KC_WORKFLOW);
  assert.equal(pickKcWorkflow('../etc/passwd'), KC_WORKFLOW);
});
