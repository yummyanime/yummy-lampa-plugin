const assert = require('node:assert/strict');
const {AllohaSession} = require('../server/alloha-session');

const session = new AllohaSession(null, 'https://alloha.yani.tv/?episode=1');
session._readQualities(JSON.stringify({hlsSource: [
    {label: 'Different voice', quality: {1080: 'https://cdn.example/other.m3u8'}},
    {label: 'Selected voice', default: true, quality: {720: 'https://cdn.example/selected.m3u8'}}
]}));
assert.deepEqual(session.qualities, {'720p': 'https://cdn.example/selected.m3u8'},
    'qualities from different audio tracks must not be mixed');

session._readQualities(JSON.stringify({hlsSource: [
    {quality: {1080: 'https://cdn.example/first.m3u8'}},
    {quality: {1080: 'https://cdn.example/second.m3u8'}}
]}));
assert.equal(session.qualities['1080p'], 'https://cdn.example/first.m3u8',
    'the first source is the fallback when Alloha does not mark a default');

console.log('resolver audio tests passed');

