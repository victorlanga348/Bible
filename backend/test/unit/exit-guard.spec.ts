describe('Jest process termination guard (test harness only)', () => {
  it.each([27, 1, 0])('turns process.exit(%s) into an observable test failure without terminating Jest', code => {
    expect(() => process.exit(code)).toThrow(`Unexpected process exit: ${code}`);
  });
  it('turns process.abort into an observable test failure without terminating Jest', () => {
    expect(() => process.abort()).toThrow('Unexpected process abort');
  });
});
