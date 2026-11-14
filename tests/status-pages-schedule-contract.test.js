const assert = require('assert');
const fs = require('fs');

const workflow = fs.readFileSync('.github/workflows/pages.yml', 'utf8');
const updateStep = workflow.indexOf('- name: Update YummyStatus snapshot');
const prepareStep = workflow.indexOf('- name: Prepare Pages site');

assert.match(workflow, /schedule:\s*\n\s*- cron: '17 \* \* \* \*'/, 'Pages must refresh the status snapshot every hour');
assert.ok(updateStep >= 0 && prepareStep > updateStep, 'the fresh snapshot must be created before the Pages artifact');
assert.match(workflow, /- name: Run contract tests\s*\n\s*if: github\.event_name != 'schedule'/, 'scheduled refreshes must not rerun the unchanged plugin test suite');
assert.match(workflow, /- name: Rebuild bundled plugin\s*\n\s*if: github\.event_name != 'schedule'/, 'scheduled refreshes must use the committed plugin bundle');
assert.doesNotMatch(workflow, /git\s+(add|commit|push)/, 'snapshot refreshes must not create repository commits');

console.log('status Pages schedule contract tests passed');
