import { stripNativePvpLog } from '../nativePvpLog.js';

// Mirror frontend fixtures: quotes must match rendered log text.
describe('native PvP log text', () => {
  it.each([
    ['&+Ghttps://example.invalid/?x=1&name=Bob&n', 'https://example.invalid/?x=1&name=Bob'],
    ['HTTPS://example.invalid/?x=1&no-cache&n', 'HTTPS://example.invalid/?x=1&no-cache'],
    ['https://example.invalid/a&next=2 &+Rhit&n', 'https://example.invalid/a&next=2 hit'],
    ['https://example.invalid/?x=1&&n', 'https://example.invalid/?x=1&'],
    ['&+u&=zz &+Rhit&n', '&+u&=zz hit'],
    ['&=LYP&=bB  \r\n&=rR &+yM', 'P  \n M'],
    ['&+Rred\x1fplain', 'redplain'],
    ['xhttps://example.invalid/?x=1&name=Bob', 'xhttps://example.invalid/?x=1ame=Bob'],
    ['&+R<svg onload=x>&n', '<svg onload=x>'],
  ])('preserves native text: %s', (input, expected) => {
    expect(stripNativePvpLog(input)).toBe(expected);
  });
});
