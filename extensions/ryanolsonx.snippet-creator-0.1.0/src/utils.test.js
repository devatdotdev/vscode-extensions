const { expect } = require('chai');
const { sanitizePowershell } = require('./utils');

describe('utils', () => {
  describe('sanitizePowershell', () => {
    it('Hello $world $house', () => {
      expect(sanitizePowershell('Hello $world $house')).to.equal(
        'Hello \\$world \\$house'
      );
    });

    it('Hello $world $1 $house ${1:foo} ${2}', () => {
      expect(
        sanitizePowershell('Hello $world $1 $house ${1:foo} ${2}')
      ).to.equal('Hello \\$world $1 \\$house ${1:foo} ${2}');
    });

    it('$_', () => {
      expect(sanitizePowershell('$_')).to.equal('\\$_');
    });

    it('$?', () => {
      expect(sanitizePowershell('$?')).to.equal('\\$?');
    });

    it('$$', () => {
      expect(sanitizePowershell('$$')).to.equal('\\$\\$');
    });

    it('$(get-date "01/01/2020")', () => {
      expect(sanitizePowershell('$(get-date "01/01/2020")')).to.equal(
        '\\$(get-date "01/01/2020")'
      );
    });

    it('$($x = 1; $y =2; $x + $y).tostring()', () => {
      expect(
        sanitizePowershell('$($x = 1; $y =2; $x + $y).tostring()')
      ).to.equal('\\$(\\$x = 1; \\$y =2; \\$x + \\$y).tostring()');
    });

    it('${1:foobar}', () => {
      expect(sanitizePowershell('${1:foobar}')).to.equal('${1:foobar}');
    });

    it('$2', () => {
      expect(sanitizePowershell('$2')).to.equal('$2');
    });
  });
});
