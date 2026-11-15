import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../components/desktop/DesktopJourney.tsx', import.meta.url), 'utf8');
test('desktop journeys distinguish simulated verification from genuine proof', () => {
  assert.match(source, /exp\.verificationMocked \? 'Demo · not verified' : verificationLabels\[verificationStatus\]/);
  assert.match(source, /warm=\{exp\.verificationMocked \|\| verificationStatus !== 'verified'\}/);
});
test('missing journey data is not replaced with fabricated organizations or topics', () => {
  assert.doesNotMatch(source, /TechNova Global|\['Microservices', 'Event-Driven'\]/);
  assert.match(source, /goal\.subtopics\?\.length/);
});
